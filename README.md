# File to JSON Converter

A full-stack web application that allows users to upload various file formats (PDF, Word, Excel) and convert them to structured JSON format. The application features a modern, user-friendly interface and supports instant conversion with preview, copy, and download capabilities.

## Features

- Support for multiple file formats:
  - PDF (.pdf)
  - Microsoft Word (.docx)
  - Microsoft Excel (.xlsx, .xls)
- Modern, responsive UI built with Material-UI
- Real-time file conversion
- JSON preview with syntax highlighting
- Copy to clipboard functionality
- Download converted JSON
- Error handling and user feedback
- File size limit (10MB)
- Secure file handling

## Tech Stack

### Frontend
- React.js
- Material-UI
- Axios for API calls
- Modern JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- Multer for file handling
- pdf-parse for PDF conversion
- mammoth for Word document conversion
- xlsx for Excel file conversion

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd file-to-json-converter
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Deployment

The application is configured for deployment on:
- Frontend: Vercel
- Backend: Render

Both services are integrated with GitHub for continuous deployment. Any changes pushed to the main branch will automatically trigger a new deployment.

## API Endpoints

### POST /api/convert
Converts uploaded file to JSON format.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (PDF, Word, or Excel file)

**Response:**
- Success: JSON data
- Error: Error message with appropriate status code

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Material-UI for the beautiful UI components
- All the open-source libraries used in this project 