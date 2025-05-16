// backend/src/services/agenda-service.ts
import { OpenAI } from 'openai';
import { Packer } from 'docx';
import path from 'path';
import fs from 'fs-extra';
import { processClientMeetingData, processGeneralMeetingData } from '../utils/docx-utils';
import { generateClientMeetingPrompt, generateGeneralMeetingPrompt } from '../utils/prompt-utils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAgenda(formData: any, pdfFilePath: string | null): Promise<Buffer> {
  try {
    const { agendaType } = formData;

    // Step 1: Generate the system prompt based on the agenda type
    const systemPrompt = agendaType === 'client'
      ? await generateClientMeetingPrompt(formData)
      : await generateGeneralMeetingPrompt(formData);

    // Step 2: Call OpenAI API to generate the agenda content
    let response;

    if (pdfFilePath) {
      // If there's a PDF file, upload it and use the assistants API
      const file = await openai.files.create({
        file: fs.createReadStream(pdfFilePath),
        purpose: 'assistants',
      });

      const assistant = await openai.beta.assistants.create({
        name: "Agenda Generator",
        instructions: systemPrompt,
        model: "gpt-4o",
      });

      const thread = await openai.beta.threads.create({});

      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze the attached document and generate the agenda according to the instructions."
          }
        ],
        attachments: [{ file_id: file.id }],
      });

      let run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
        response_format: { type: "json_object" },
      });

      // Poll for completion
      while (run.status === "queued" || run.status === "in_progress") {
        await new Promise(res => setTimeout(res, 2000));
        run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      if (run.status === "completed") {
        const messages = await openai.beta.threads.messages.list(thread.id);
        const assistantMessages = messages.data.filter(msg => msg.role === "assistant");

        if (assistantMessages.length > 0 && assistantMessages[0].content && assistantMessages[0].content.length > 0) {
          const contentItem = assistantMessages[0].content[0];
          if (contentItem.type === 'text' && contentItem.text?.value) {
            response = JSON.parse(contentItem.text.value);
          } else {
            throw new Error("Invalid content format in assistant response");
          }
        } else {
          throw new Error("No assistant response found");
        }
      } else {
        throw new Error(`Run failed with status: ${run.status}`);
      }

      // Clean up
      await openai.beta.assistants.del(assistant.id);
      await openai.files.del(file.id);
    } else {
      // If there's no PDF, use the chat completions API
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Please generate the agenda based on the provided information." }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      response = JSON.parse(completion.choices[0].message.content || "{}");
    }

    // Step 3: Process the response and generate a Word document
    const templatePath = path.join(__dirname, '../../templates/agenda_template.docx');

    // Check if template exists, if not, create a simple one
    if (!fs.existsSync(templatePath)) {
      // Import the function directly to avoid circular dependency
      const { createDefaultTemplate } = await import('../utils/docx-utils.js');
      await createDefaultTemplate(templatePath);
    }

    // Process the data based on agenda type and generate the document
    const docxDoc = agendaType === 'client'
      ? await processClientMeetingData(response, templatePath)
      : await processGeneralMeetingData(response, templatePath);

    // Convert the document to a buffer
    return await Packer.toBuffer(docxDoc);
  } catch (error) {
    console.error('Error in generateAgenda:', error);
    throw error;
  }
}

async function createDefaultTemplate(templatePath: string): Promise<void> {
  // Import Document and related classes directly here
  const { Document, Paragraph, HeadingLevel, Packer } = await import('docx');
  
  // Create a simple default template if none exists
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: "Meeting Agenda",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: "This is a placeholder template. Please place your actual template file at the specified location.",
        }),
      ],
    }],
  });

  // Ensure the directory exists
  await fs.ensureDir(path.dirname(templatePath));

  // Save the template
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(templatePath, buffer);
}