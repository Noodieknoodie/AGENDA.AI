// backend/src/utils/prompt-utils.ts
import { clientMeetingPrompt, generalMeetingPrompt } from '../config/prompts';

export async function generateClientMeetingPrompt(formData: any): Promise<string> {
  const {
    clientName,
    meetingDate,
    advisorPreferences,
    customInstructions,
    talkingPoints
  } = formData;

  // Create a user message section to include with the system prompt
  let userMessage = `### Client Name ###
${clientName || "N/A"}
### Meeting Date ###
${meetingDate || "N/A"}`;

  if (formData.file) {
    userMessage += `
### PDF Performance Report ###
See attached`;
  }

  if (advisorPreferences) {
    userMessage += `
### Advisor Preferences ###
${advisorPreferences}`;
  }

  if (talkingPoints) {
    try {
      const talkingPointsArray = JSON.parse(talkingPoints);
      if (talkingPointsArray && talkingPointsArray.length > 0) {
        userMessage += `
### Additional Topics ###`;

        talkingPointsArray.forEach((point: any) => {
          userMessage += `
- ${point.title}${point.notes ? `: ${point.notes}` : ''}`;
        });
      }
    } catch (e) {
      console.error('Error parsing talking points:', e);
    }
  }

  if (customInstructions) {
    userMessage += `
### Additional Instructions ###
${customInstructions}`;
  }

  // The full prompt combines the system prompt and the user message context
  return `${clientMeetingPrompt}

USER INPUT:
${userMessage}`;
}

export async function generateGeneralMeetingPrompt(formData: any): Promise<string> {
  const {
    meetingTitle,
    meetingDate,
    meetingParticipants,
    meetingObjective,
    customInstructions,
    talkingPoints
  } = formData;

  // Create a user message section to include with the system prompt
  let userMessage = `### Meeting Title ###
${meetingTitle || "General Meeting"}
### Meeting Date ###
${meetingDate || "N/A"}`;

  if (meetingParticipants) {
    userMessage += `
### Participants ###
${meetingParticipants}`;
  }

  if (meetingObjective) {
    userMessage += `
### Objective ###
${meetingObjective}`;
  }

  if (talkingPoints) {
    try {
      const talkingPointsArray = JSON.parse(talkingPoints);
      if (talkingPointsArray && talkingPointsArray.length > 0) {
        userMessage += `
### Agenda Items ###`;

        talkingPointsArray.forEach((point: any) => {
          userMessage += `
- ${point.title}${point.notes ? `: ${point.notes}` : ''}`;
        });
      }
    } catch (e) {
      console.error('Error parsing talking points:', e);
    }
  }

  if (customInstructions) {
    userMessage += `
### Additional Instructions ###
${customInstructions}`;
  }

  // The full prompt combines the system prompt and the user message context
  return `${generalMeetingPrompt}

USER INPUT:
${userMessage}`;
}