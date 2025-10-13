'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material';
// import { pdf } from '@react-pdf/renderer';
// import WorksheetTemplate from '../templates/WorksheetTemplate';
import { curriculumStructure } from '../constants/resource_generator';
import { callOpenAIWithResourceDataAndRetry } from '../lib/teacherpages/openaiCaller';
import { ResourceData } from '../lib/teacherpages/types';

export default function ResourceGenerator() {
  // State management for cascading dropdowns
  const [difficulty, setDifficulty] = React.useState<number>(3);
  const [selectedSubject, setSelectedSubject] = React.useState('');
  const [selectedMainTopic, setSelectedMainTopic] = React.useState('');
  const [selectedSubTopic, setSelectedSubTopic] = React.useState('');
  const [selectedConcept, setSelectedConcept] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedContent, setGeneratedContent] = React.useState<any>(null);
  const [generationError, setGenerationError] = React.useState<string | null>(null);
  const [hasGeneratedContent, setHasGeneratedContent] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editableContent, setEditableContent] = React.useState<any>(null);

  const [isClient, setIsClient] = React.useState(false);

  // Handle hydration
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Get available options based on selections
  // Difficulty marks for slider (ticks only, no labels)
  const difficultyMarks = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
  ];

  const getDifficultyName = (value: number) => {
    switch (value) {
      case 1: return 'Easy';
      case 2: return 'Light';
      case 3: return 'Moderate';
      case 4: return 'Hard';
      case 5: return 'Advanced';
      default: return 'Moderate';
    }
  };

  const getAvailableSubjects = () => {
    return curriculumStructure.subjects.map(subject => subject.name);
  };

  const getAvailableMainTopics = () => {
    if (!selectedSubject) return [];
    const subject = curriculumStructure.subjects.find(s => s.name === selectedSubject);
    return subject?.mainTopics.map(topic => topic.name) || [];
  };

  const getAvailableSubTopics = () => {
    if (!selectedSubject || !selectedMainTopic) return [];
    const subject = curriculumStructure.subjects.find(s => s.name === selectedSubject);
    const mainTopic = subject?.mainTopics.find(topic => topic.name === selectedMainTopic);
    return mainTopic?.subTopics.map(subTopic => subTopic.name) || [];
  };

  const getAvailableConcepts = () => {
    if (!selectedSubject || !selectedMainTopic || !selectedSubTopic) return [];
    const subject = curriculumStructure.subjects.find(s => s.name === selectedSubject);
    const mainTopic = subject?.mainTopics.find(topic => topic.name === selectedMainTopic);
    const subTopic = mainTopic?.subTopics.find(subTopic => subTopic.name === selectedSubTopic);
    return subTopic?.concepts || [];
  };

  // Handle selection changes
  const handleDifficultyChange = (_: Event, value: number | number[]) => {
    const next = Array.isArray(value) ? value[0] : value;
    setDifficulty(next);
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedMainTopic('');
    setSelectedSubTopic('');
    setSelectedConcept('');
    // Don't clear generated content when changing subject
  };

  const handleMainTopicChange = (mainTopic: string) => {
    setSelectedMainTopic(mainTopic);
    setSelectedSubTopic('');
    setSelectedConcept('');
    // Don't clear generated content when changing main topic
  };

  const handleSubTopicChange = (subTopic: string) => {
    setSelectedSubTopic(subTopic);
    setSelectedConcept('');
    // Don't clear generated content when changing sub topic
  };

  const handleConceptChange = (concept: string) => {
    setSelectedConcept(concept);
    // Don't clear generated content when changing concept
  };

  // Handle entering edit mode
  const handleEnterEditMode = () => {
    setIsEditMode(true);
    setEditableContent(JSON.parse(JSON.stringify(generatedContent))); // Deep copy
  };

  // Handle saving edits
  const handleSaveEdits = () => {
    setGeneratedContent(editableContent);
    setIsEditMode(false);
  };

  // Handle canceling edits
  const handleCancelEdits = () => {
    setIsEditMode(false);
    setEditableContent(null);
  };

  // Handle content updates in edit mode
  const handleContentUpdate = (key: string, value: string) => {
    setEditableContent((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInsertLaTeX = (latex: string) => {
    // This will be used to insert LaTeX into the current editing field
    // For now, we'll just log it - in a real implementation, you'd insert it into the active field
    console.log('LaTeX to insert:', latex);
  };



  const handleGenerateResource = async () => {
    if (!selectedSubject || !selectedMainTopic || !selectedSubTopic || !selectedConcept) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedContent(null);
    setHasGeneratedContent(false);

    try {
      // Prepare resource data
      const resourceData: ResourceData = {
        level: 'High School', // Default since we only have high school grades
        grade: '9-12',
        subject: selectedSubject,
        topic: `${selectedMainTopic} - ${selectedSubTopic} - ${selectedConcept}`,
        resourceType: 'worksheet',
        difficulty,
      };

      // Generate AI content
      console.log('Generating AI content for:', resourceData);
      const aiResponse = await callOpenAIWithResourceDataAndRetry(resourceData);
      console.log('AI response received:', aiResponse);
      
      setGeneratedContent(aiResponse.content);
      setHasGeneratedContent(true);

      console.log('AI content generated successfully:', resourceData, aiResponse.content);
    } catch (error) {
      console.error('Error generating resource:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMessage);
      alert(`Error generating resource: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Check if form is complete for preview - now also requires generated content
  const isFormComplete = selectedSubject && selectedMainTopic && selectedSubTopic && selectedConcept && hasGeneratedContent;

  // Prepare resource data for preview
  const previewResourceData = {
    level: 'High School', // Default since we only have high school grades
    grade: '9-12',
    subject: selectedSubject,
    topic: `${selectedMainTopic} - ${selectedSubTopic} - ${selectedConcept}`,
    resourceType: 'worksheet',
    difficulty,
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 3,
              color: 'text.primary',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Generate Your Perfect Resource
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              fontWeight: 400,
              color: 'text.secondary',
              mb: 4,
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Select your teaching context and let AI create customized worksheets and activities
          </Typography>
        </Box>

        <Card
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
            background: 'linear-gradient(0deg, transparent 10px)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '0 0.62em',
          }}
        >
          <Grid container spacing={3}>

            {/* Subject */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Subject</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  label="Subject"
                  sx={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {getAvailableSubjects().map((subject) => (
                    <MenuItem key={subject} value={subject} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Main Topic */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Main Topic</InputLabel>
                <Select
                  value={selectedMainTopic}
                  onChange={(e) => handleMainTopicChange(e.target.value)}
                  label="Main Topic"
                  disabled={!selectedSubject}
                  sx={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {getAvailableMainTopics().map((mainTopic) => (
                    <MenuItem key={mainTopic} value={mainTopic} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      {mainTopic}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sub Topic */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Sub Topic</InputLabel>
                <Select
                  value={selectedSubTopic}
                  onChange={(e) => handleSubTopicChange(e.target.value)}
                  label="Sub Topic"
                  disabled={!selectedMainTopic}
                  sx={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {getAvailableSubTopics().map((subTopic) => (
                    <MenuItem key={subTopic} value={subTopic} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      {subTopic}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Concepts */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Concept</InputLabel>
                <Select
                  value={selectedConcept}
                  onChange={(e) => handleConceptChange(e.target.value)}
                  label="Concept"
                  disabled={!selectedSubTopic}
                  sx={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {getAvailableConcepts().map((concept) => (
                    <MenuItem key={concept} value={concept} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      {concept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Difficulty (1–5) */}
            <Grid item xs={12} sm={12} md={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  Difficulty
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: 'text.secondary' }}>
                  {getDifficultyName(difficulty)} (Level {difficulty})
                </Typography>
              </Box>
              <Slider
                value={difficulty}
                onChange={handleDifficultyChange}
                aria-labelledby="difficulty-slider"
                min={1}
                max={5}
                step={1}
                marks={difficultyMarks}
                valueLabelDisplay="off"
                sx={{
                  width: '94%',
                  mx: 'auto',
                  height: 6,
                  px: 1,
                  '& .MuiSlider-markLabel': {
                    fontFamily: 'Poppins, sans-serif',
                    color: 'text.secondary',
                  },
                  '& .MuiSlider-mark': {
                    width: 5,
                    height: 16,
                    borderRadius: 1,
                    bgcolor: '#333333'
                  },
                  '& .MuiSlider-markActive': {
                    bgcolor: '#333333'
                  },
                  '& .MuiSlider-thumb': {
                    bgcolor: '#0C41FF',
                    boxShadow: '0 2px 6px rgba(12,65,255,0.3)',
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(12,65,255,0.16)'
                    },
                  },
                  '& .MuiSlider-track': {
                    bgcolor: '#0C41FF',
                    height: 6
                  },
                  '& .MuiSlider-rail': {
                    opacity: 0.35,
                    height: 6
                  }
                }}
              />
            </Grid>

            {/* Generate Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleGenerateResource}
                disabled={!selectedSubject || !selectedMainTopic || !selectedSubTopic || !selectedConcept || isGenerating}
                sx={{
                  bgcolor: '#0C41FF',
                  color: 'white',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  fontFamily: 'Poppins, sans-serif',
                  '&:hover': {
                    bgcolor: '#0033CC'
                  },
                  '&:disabled': {
                    bgcolor: '#ccc',
                    color: '#666'
                  }
                }}
              >
                {isGenerating ? 'Generating AI Content...' : 'Generate Preview'}
              </Button>
            </Grid>

            {/* Status Messages */}
            {isGenerating && (
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    color: '#0C41FF',
                    fontFamily: 'Poppins, sans-serif',
                    fontStyle: 'italic'
                  }}
                >
                  🤖 AI is generating personalized content for your {selectedSubject} class (difficulty {difficulty})...
                </Typography>
              </Grid>
            )}

            {generationError && (
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    color: '#d32f2f',
                    fontFamily: 'Poppins, sans-serif',
                    bgcolor: '#ffebee',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid #ffcdd2'
                  }}
                >
                  ❌ Error: {generationError}
                </Typography>
              </Grid>
            )}



            {generatedContent && !isGenerating && (
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    color: '#2e7d32',
                    fontFamily: 'Poppins, sans-serif',
                    bgcolor: '#e8f5e8',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid #c8e6c9'
                  }}
                >
                  ✅ AI content generated successfully! Preview your worksheet below.
                </Typography>
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 3, p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
              Our AI analyzes your selections and creates customized resources that align with your curriculum and teaching style.
            </Typography>
          </Box>
        </Card>

        {/* PDF Preview Section */}
        {selectedSubject && selectedMainTopic && selectedSubTopic && selectedConcept && !hasGeneratedContent && !isGenerating && (
          <Card
            sx={{
              mt: 4,
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  fontWeight: 600,
                  mb: 2,
                  color: 'text.primary',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                Ready to Generate
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                Your selections are complete! Click &ldquo;Generate Resource&rdquo; to create AI-powered content and see a preview of your personalized worksheet.
              </Typography>
            </Box>

            <Box
              sx={{
                border: '2px dashed #e0e0e0',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: '#fafafa'
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1.1rem'
                }}
              >
                🤖 AI content will be generated here
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Poppins, sans-serif',
                  mt: 1
                }}
              >
                Click &ldquo;Generate Resource&rdquo; to create your personalized worksheet
              </Typography>
            </Box>
          </Card>
        )}

        {/* PDF Preview Section */}
        {isFormComplete && (
          <Card
            sx={{
              mt: 4,
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  fontWeight: 600,
                  mb: 2,
                  color: 'text.primary',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                AI-Generated Preview
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                Preview your AI-generated resource below. The PDF includes personalized content based on your selections.
              </Typography>


              
              {/* Edit Mode Toggle */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                {!isEditMode ? (
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={handleEnterEditMode}
                    sx={{
                      borderColor: '#0C41FF',
                      color: '#0C41FF',
                      fontFamily: 'Poppins, sans-serif',
                      '&:hover': {
                        borderColor: '#0033CC',
                        bgcolor: 'rgba(12, 65, 255, 0.04)'
                      }
                    }}
                  >
                    ✏️ Edit Content
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={handleSaveEdits}
                      sx={{
                        bgcolor: '#02B875',
                        color: 'white',
                        fontFamily: 'Poppins, sans-serif',
                        '&:hover': {
                          bgcolor: '#029A5F'
                        }
                      }}
                    >
                      💾 Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      size="medium"
                      onClick={handleCancelEdits}
                      sx={{
                        borderColor: '#F17829',
                        color: '#F17829',
                        fontFamily: 'Poppins, sans-serif',
                        '&:hover': {
                          borderColor: '#D6681F',
                          bgcolor: 'rgba(241, 120, 41, 0.04)'
                        }
                      }}
                    >
                      ❌ Cancel
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            {isEditMode ? (
              // Edit Mode Interface
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  p: 3,
                  bgcolor: '#fafafa',
                  minHeight: '600px'
                }}
              >
                                  <Typography variant="h6" sx={{ mb: 3, color: '#0C41FF', fontFamily: 'Poppins, sans-serif' }}>
                    ✏️ Edit Mode - Click on any text to modify
                  </Typography>
                  

                  

                
                {editableContent && Object.entries(editableContent).map(([key, value]) => (
                  <Box key={key} sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary', fontFamily: 'Poppins, sans-serif' }}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={key === 'questions' ? 6 : 3}
                      value={value as string}
                      onChange={(e) => handleContentUpdate(key, e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'Poppins, sans-serif',
                          '&:hover fieldset': {
                            borderColor: '#0C41FF',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0C41FF',
                          },
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              // PDF Preview Mode
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  height: '600px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f5f5f5',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <Typography variant="h6" sx={{ color: '#0C41FF', fontFamily: 'Poppins, sans-serif' }}>
                  📄 Worksheet Preview Ready
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontFamily: 'Poppins, sans-serif', textAlign: 'center', maxWidth: 400 }}>
                  Your AI-generated worksheet is ready! Click "Download PDF" below to get your personalized worksheet.
                </Typography>
                <Box sx={{ mt: 2, p: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid #e0e0e0', maxWidth: 500, width: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontFamily: 'Poppins, sans-serif' }}>
                    Worksheet Details:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontFamily: 'Poppins, sans-serif' }}>
                    <strong>Subject:</strong> {previewResourceData.subject}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontFamily: 'Poppins, sans-serif' }}>
                    <strong>Topic:</strong> {previewResourceData.topic}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontFamily: 'Poppins, sans-serif' }}>
                    <strong>Grade:</strong> {previewResourceData.grade}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontFamily: 'Poppins, sans-serif' }}>
                    <strong>Difficulty:</strong> Level {previewResourceData.difficulty}/5
                  </Typography>
                </Box>
              </Box>
            )}



            {/* Action Buttons */}
            {isClient && (
              <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={async () => {
                    try {
                      // Temporarily disabled PDF generation for build fix
                      alert('PDF download feature is temporarily disabled. The worksheet content has been generated successfully!');
                    } catch (error) {
                      console.error('Error downloading PDF:', error);
                      alert('Error downloading PDF. Please try again.');
                    }
                  }}
                  sx={{
                    borderColor: '#0C41FF',
                    color: '#0C41FF',
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    fontFamily: 'Poppins, sans-serif',
                    '&:hover': {
                      borderColor: '#0033CC',
                      bgcolor: '#f0f4ff'
                    }
                  }}
                >
                  📥 Download PDF
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    setSelectedSubject('');
                    setSelectedMainTopic('');
                    setSelectedSubTopic('');
                    setSelectedConcept('');
                    setDifficulty(3);
                    setGeneratedContent(null);
                    setHasGeneratedContent(false);
                    setGenerationError(null);
                    setIsEditMode(false);
                    setEditableContent(null);
                  }}
                  sx={{
                    borderColor: '#dc3545',
                    color: '#dc3545',
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    fontFamily: 'Poppins, sans-serif',
                    '&:hover': {
                      borderColor: '#c82333',
                      bgcolor: '#f8d7da'
                    }
                  }}
                >
                  🗑️ Clear All
                </Button>
              </Box>
            )}
          </Card>
        )}
      </Container>
    </Box>
  );
}
