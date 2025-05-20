We're a financial planning firm where advisors waste hours manually extracting data from client performance PDFs to create meeting agendas. This project turns that into a few button clicks. The end product will live as a custom Microsoft Teams app that lets users upload a PDF, select a few options, and get back a perfectly formatted Word document.

1. User flow in Teams app
   – React UI where advisors upload the client's PDF performance report (no OCR needed - newer GPT models ingest files directly)
   – Form fields for: client name, meeting date, talking points (pre-generated options + custom entry)
   – Dropdown to select advisor (maps to a config file storing each advisor's wording preferences)
   – Optional text field for free-form instructions
   – When "Generate" is clicked, all inputs (text fields, advisor preferences, and PDF) are bundled into a single prompt and sent to the Azure agent

   ADDITIONALLY: There is a toggle for Client Meeting Mode and General Agenda Mode (not sure if thats how they are named but thats the idea). The difference is that general meeting mode is more freeform and doesnt include PDF uploading. See the frontend for direction. 

3. Azure OpenAI agent handling
   – Agent runs in Azure OpenAI (already provisioned in Azure Foundry)
   – System prompt tells it to extract data from the PDF and return a specific JSON schema
   – Agent processes everything, merges PDF data with meeting details, returns structured JSON

4. Document creation
   – Codebase contains /Templates/blank_agenda.docx with our logo header and named styles
   – Service takes the JSON, maps it to the template's styles, and generates the final document
   – File is automatically named (e.g., "Smith Family Agenda - 2025-06-14.docx")
   – User receives either a Save-As dialog or direct download link in Teams

5. Deployment notes
   – Everything packaged as a custom Teams app for our firm's channel
   – Azure agent is already set up; just needs connection
   – No server-side PDF processing required; Azure OpenAI handles file comprehension

This isn't a science project; it's meant to cut hours from our workflow. We don't care how you wire the plumbing as long as it delivers that seamless experience. The key technical advantage is leveraging current AI models' ability to directly process PDFs (as of May 2025), which eliminates the need for custom parsing code.
