const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, and Excel files are allowed.'));
    }
  },
});

// File conversion functions
async function convertPDFToJSON(buffer) {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    throw new Error('Error converting PDF to JSON');
  }
}

async function convertWordToJSON(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value,
      messages: result.messages,
    };
  } catch (error) {
    throw new Error('Error converting Word document to JSON');
  }
}

function convertExcelToJSON(buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const result = {};
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      result[sheetName] = XLSX.utils.sheet_to_json(worksheet);
    });
    
    return result;
  } catch (error) {
    throw new Error('Error converting Excel file to JSON');
  }
}

// API endpoint for file conversion
app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const fileExt = path.extname(file.originalname).toLowerCase();
    let jsonData;

    switch (fileExt) {
      case '.pdf':
        jsonData = await convertPDFToJSON(file.buffer);
        break;
      case '.docx':
        jsonData = await convertWordToJSON(file.buffer);
        break;
      case '.xlsx':
      case '.xls':
        jsonData = convertExcelToJSON(file.buffer);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported file type' });
    }

    res.json(jsonData);
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ message: error.message || 'Error converting file' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 