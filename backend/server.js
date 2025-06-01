const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename to remove special characters
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, Date.now() + '-' + sanitizedFilename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
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

// Error handling middleware for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 50MB limit' });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// File conversion functions
async function convertPDFToJSON(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    // Extract and structure the content
    const text = data.text.trim();
    
    // Split text into paragraphs and clean them
    const paragraphs = text
      .split(/\n\s*\n/)  // Split by multiple newlines
      .map(p => p.trim())
      .filter(p => p.length > 0);  // Remove empty paragraphs
    
    // Extract metadata
    const metadata = {
      title: data.info.Title || '',
      author: data.info.Author || '',
      subject: data.info.Subject || '',
      keywords: data.info.Keywords || '',
      creationDate: data.info.CreationDate || '',
      modificationDate: data.info.ModDate || '',
      creator: data.info.Creator || '',
      producer: data.info.Producer || '',
      pageCount: data.numpages || 0
    };

    // Create structured content
    const structuredContent = {
      metadata: metadata,
      content: {
        paragraphs: paragraphs,
        totalParagraphs: paragraphs.length,
        totalPages: data.numpages,
        pageSize: {
          width: data.pageSize?.width || 0,
          height: data.pageSize?.height || 0
        }
      }
    };

    return structuredContent;
  } catch (error) {
    throw new Error('Error converting PDF to JSON');
  }
}

async function convertWordToJSON(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return {
      text: result.value,
      messages: result.messages,
    };
  } catch (error) {
    throw new Error('Error converting Word document to JSON');
  }
}

function convertExcelToJSON(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(dataBuffer, { type: 'buffer' });
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
        jsonData = await convertPDFToJSON(file.path);
        break;
      case '.docx':
        jsonData = await convertWordToJSON(file.path);
        break;
      case '.xlsx':
      case '.xls':
        jsonData = convertExcelToJSON(file.path);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported file type' });
    }

    // Clean up: Delete the uploaded file after processing
    fs.unlinkSync(file.path);

    res.json(jsonData);
  } catch (error) {
    console.error('Conversion error:', error);
    // Clean up: Delete the uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
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