'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { getApiKey, setApiKey, clearApiKey } from '../lib/apiKeyManager';

export default function ApiKeySettings() {
  const [apiKey, setApiKeyValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const existingKey = getApiKey();
    if (existingKey) {
      setApiKeyValue(existingKey);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API key cannot be empty');
      return;
    }

    setApiKey(apiKey.trim());
    setSaved(true);
    setError('');
    
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    clearApiKey();
    setApiKeyValue('');
    setSaved(false);
    setError('');
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
        API Key Settings
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
        Enter your Avalern API Gateway key to generate worksheets. Your key is stored locally in your browser.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          API key saved successfully!
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          type={showKey ? 'text' : 'password'}
          label="API Gateway Key"
          value={apiKey}
          onChange={(e) => {
            setApiKeyValue(e.target.value);
            setError('');
          }}
          placeholder="Enter your API Gateway key"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowKey(!showKey)}
                  edge="end"
                >
                  {showKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ fontFamily: 'Poppins, sans-serif' }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            bgcolor: '#0C41FF',
            color: 'white',
            fontFamily: 'Poppins, sans-serif',
            '&:hover': {
              bgcolor: '#0033CC'
            }
          }}
        >
          Save Key
        </Button>
        
        {getApiKey() && (
          <Button
            variant="outlined"
            onClick={handleClear}
            sx={{
              borderColor: '#dc3545',
              color: '#dc3545',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                borderColor: '#c82333',
                bgcolor: '#f8d7da'
              }
            }}
          >
            Clear Key
          </Button>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', fontFamily: 'Poppins, sans-serif' }}>
        🔒 Your API key is stored locally in your browser and never sent to our servers except when making API Gateway requests.
      </Typography>
    </Card>
  );
}

