# AI Agenda Generator

An AI-powered application for generating professional meeting agendas.

## Setup Instructions

1. Make sure you have the following prerequisites installed:
   - Node.js (v18 or later)
   - Python 3.8 or later

2. Place your .docx template file in the `backend/templates` directory as `agenda_template.docx`

3. Add your OpenAI API key to the `.env` file in the `backend` directory

4. Run the `start.bat` file to launch both the frontend and backend

## Configuration Files

The application uses several configuration files that you can modify:

- `config/advisors.json`: Contains advisor information and writing preferences
- `config/client_topics.json`: Contains topic suggestions for client meetings
- `config/general_topics.json`: Contains topic suggestions for general meetings

## Features

- Two types of agendas: Client Meeting and General Meeting
- PDF document analysis for client performance reports
- Customizable talking points and agenda items
- Integration with advisor preferences
- Export to formatted Word documents

## Project Structure

- `frontend/`: React frontend application
- `backend/`: Node.js backend API
- `config/`: Configuration files
- `backend/templates/`: Document templates

## Customization

### Adding New Advisors

To add a new advisor, edit the `config/advisors.json` file and add a new entry with:
- `id`: A unique identifier
- `name`: The advisor's name
- `preferences`: Writing style preferences

### Modifying Topics

To change the available topics, edit the corresponding JSON file:
- `config/client_topics.json` for client meeting topics
- `config/general_topics.json` for general meeting topics

## API Usage

The backend exposes the following endpoints:

- `POST /api/generate-agenda`: Generates an agenda document
  - Requires form data with:
    - `agendaType`: "client" or "general"
    - Meeting details (varies by type)
    - Optional PDF file

- `GET /api/health`: Health check endpoint
