// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { generateAgenda } from './services/agenda-service';
import { setupTempDirectory } from './utils/file-utils';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Create upload directory if it doesn't exist
setupTempDirectory();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'temp/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Generate agenda endpoint
app.post('/api/generate-agenda', upload.single('file'), async (req, res) => {
  try {
    const { agendaType } = req.body;

    if (!agendaType) {
      return res.status(400).json({ error: 'Agenda type is required' });
    }

    const pdfFile = req.file ? req.file.path : null;

    // Call the agenda generation service
    const docxBuffer = await generateAgenda(req.body, pdfFile);

    // Clean up the uploaded file after processing
    if (pdfFile && fs.existsSync(pdfFile)) {
      await fs.unlink(pdfFile);
    }

    // Set the appropriate headers for a .docx file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=agenda.docx');

    // Send the generated docx file
    res.send(docxBuffer);
  } catch (error) {
    console.error('Error generating agenda:', error);
    res.status(500).json({ error: 'Failed to generate agenda' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});