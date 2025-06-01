import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Grid,
  useMediaQuery,
  Stack
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create a modern theme
const modernTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B5CF6',
      light: '#A78BFA',
      dark: '#7C3AED',
    },
    secondary: {
      main: '#EC4899',
      light: '#F472B6',
      dark: '#DB2777',
    },
    background: {
      default: '#111827',
      paper: '#1F2937',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#9CA3AF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      fontSize: '1.75rem',
    },
    subtitle1: {
      letterSpacing: '0.02em',
      lineHeight: 1.4,
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
            boxShadow: '0 6px 20px 0 rgba(139, 92, 246, 0.5)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            background: 'rgba(139, 92, 246, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const GradientText = styled(Typography)({
  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 800,
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.8) 100%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
  },
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  background: 'rgba(31, 41, 55, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    background: 'rgba(31, 41, 55, 0.7)',
    boxShadow: '0 8px 32px 0 rgba(139, 92, 246, 0.2)',
  },
}));

function App() {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Check file size (50MB = 50 * 1024 * 1024 bytes)
      const maxSize = 50 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError('File size exceeds 50MB limit');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setJsonData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_URL}/api/convert`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setJsonData(response.data);
      setSuccess('File converted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during conversion');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (jsonData) {
      navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
      setSuccess('JSON copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (jsonData) {
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.split('.')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ 
          py: 3, 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 1
        }}>
          <Container maxWidth="lg">
            <GradientText variant="h2" component="h1" align="center">
              File to JSON
            </GradientText>
            <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Transform your documents into structured JSON with a single click
            </Typography>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ flex: 1, py: 4, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3}>
            {/* Features Section */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <FeatureCard>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Multiple Formats
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PDF, Word, Excel
                  </Typography>
                </FeatureCard>
                <FeatureCard>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Instant Conversion
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fast & Reliable
                  </Typography>
                </FeatureCard>
              </Stack>
            </Grid>

            {/* Converter Section */}
            <Grid item xs={12} md={8}>
              <StyledPaper>
                <Stack spacing={3} sx={{ height: '100%' }}>
                  {/* File Upload */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      disabled={loading}
                      size="large"
                      sx={{ minWidth: isMobile ? '100%' : '200px' }}
                    >
                      Select File
                      <VisuallyHiddenInput type="file" onChange={handleFileChange} />
                    </Button>

                    {file && (
                      <Typography variant="body2" sx={{ color: 'primary.main', mt: 1 }}>
                        {file.name}
                      </Typography>
                    )}
                  </Box>

                  {/* Convert Button */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpload}
                      disabled={!file || loading}
                      size="large"
                      sx={{ minWidth: isMobile ? '100%' : '200px' }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Convert to JSON'}
                    </Button>
                  </Box>

                  {/* JSON Display */}
                  {jsonData && (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          flex: 1,
                          overflow: 'auto',
                          bgcolor: 'rgba(17, 24, 39, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '16px',
                        }}
                      >
                        <pre style={{ 
                          margin: 0,
                          color: '#A78BFA',
                          fontFamily: '"Fira Code", monospace',
                          fontSize: '14px',
                        }}>
                          {JSON.stringify(jsonData, null, 2)}
                        </pre>
                      </Paper>

                      <Stack 
                        direction={isMobile ? 'column' : 'row'} 
                        spacing={2} 
                        sx={{ mt: 2, justifyContent: 'center' }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<ContentCopyIcon />}
                          onClick={handleCopy}
                          sx={{ minWidth: isMobile ? '100%' : '140px' }}
                        >
                          Copy
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={handleDownload}
                          sx={{ minWidth: isMobile ? '100%' : '140px' }}
                        >
                          Download
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </StyledPaper>
            </Grid>
          </Grid>
        </Container>

        <Snackbar
          open={!!error || !!success}
          autoHideDuration={6000}
          onClose={() => {
            setError('');
            setSuccess('');
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbar-root': {
              top: '24px !important',
              right: '24px !important',
            }
          }}
        >
          <Alert
            onClose={() => {
              setError('');
              setSuccess('');
            }}
            severity={error ? 'error' : 'success'}
            sx={{
              width: '100%',
              bgcolor: error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)',
              border: '1px solid',
              borderColor: error ? 'error.main' : 'primary.main',
              color: error ? 'error.main' : 'primary.main',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              '& .MuiAlert-icon': {
                color: error ? 'error.main' : 'primary.main',
              },
              '& .MuiAlert-message': {
                fontWeight: 500,
              }
            }}
          >
            {error || success}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
