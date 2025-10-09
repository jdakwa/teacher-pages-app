'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Badge,
  Grid
} from '@mui/material';
import {
  School as SchoolIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import Link from 'next/link';

import ResourceGenerator from '@/components/ResourceGenerator';



export default function TeacherPagesPage() {

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0C41FF 0%, #0033CC 100%)',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }
        }}
      >
        {/* Floating Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '5%',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />

        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto', position: 'relative', zIndex: 2 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                color: 'white',
                mb: 4,
                lineHeight: 1.1,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              Free, AI-powered worksheets for teachers.
            </Typography>
            
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.75rem' },
                fontWeight: 400,
                color: 'rgba(255,255,255,0.9)',
                mb: 6,
                lineHeight: 1.4,
                maxWidth: 700,
                mx: 'auto',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              Browse or generate classroom-ready resources by grade, subject, and state standards.
            </Typography>

            {/* Step Indicators */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: { xs: 'auto', md: '120px' },
              mb: { xs: 4, md: 0 }
            }}>
              {/* Desktop Step Indicators */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', maxWidth: 700, width: '100%' }}>
                {/* Step 1 */}
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Badge
                    badgeContent="1"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: 'white',
                        color: '#0C41FF',
                        fontWeight: 700,
                        fontSize: '1rem',
                        width: 32,
                        height: 32
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 32, color: '#0C41FF' }} />
                    </Box>
                  </Badge>
                  <Typography variant="body1" sx={{ ml: 3, fontWeight: 600, color: 'white', fontSize: '1.1rem', fontFamily: 'Poppins, sans-serif' }}>
                    Choose
                  </Typography>
                </Box>

                {/* Arrow 1 */}
                <Box sx={{ mx: 3, display: 'flex', alignItems: 'center' }}>
                  <ArrowForwardIcon sx={{ color: 'white', fontSize: 28, opacity: 0.8 }} />
                </Box>

                {/* Step 2 */}
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Badge
                    badgeContent="2"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: 'white',
                        color: '#52307C',
                        fontWeight: 700,
                        fontSize: '1rem',
                        width: 32,
                        height: 32
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <SearchIcon sx={{ fontSize: 32, color: '#52307C' }} />
                    </Box>
                  </Badge>
                  <Typography variant="body1" sx={{ ml: 3, fontWeight: 600, color: 'white', fontSize: '1.1rem', fontFamily: 'Poppins, sans-serif' }}>
                    Preview
                  </Typography>
                </Box>

                {/* Arrow 2 */}
                <Box sx={{ mx: 3, display: 'flex', alignItems: 'center' }}>
                  <ArrowForwardIcon sx={{ color: 'white', fontSize: 28, opacity: 0.8 }} />
                </Box>

                {/* Step 3 */}
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Badge
                    badgeContent="3"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: 'white',
                        color: '#02B875',
                        fontWeight: 700,
                        fontSize: '1rem',
                        width: 32,
                        height: 32
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <DownloadIcon sx={{ fontSize: 32, color: '#02B875' }} />
                    </Box>
                  </Badge>
                  <Typography variant="body1" sx={{ ml: 3, fontWeight: 600, color: 'white', fontSize: '1.1rem', fontFamily: 'Poppins, sans-serif' }}>
                    Download
                  </Typography>
                </Box>
              </Box>

              {/* Mobile Step Cards */}
              <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 28, color: '#0C41FF' }} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'white', fontFamily: 'Poppins, sans-serif' }}>
                        Choose
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <SearchIcon sx={{ fontSize: 28, color: '#52307C' }} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'white', fontFamily: 'Poppins, sans-serif' }}>
                        Preview
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <DownloadIcon sx={{ fontSize: 28, color: '#02B875' }} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'white', fontFamily: 'Poppins, sans-serif' }}>
                        Download
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Container>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </Box>

      {/* Resource Generator Section */}
      <ResourceGenerator />

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#0C41FF', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 3,
                color: 'white',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              Ready to Transform Your Teaching?
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                fontWeight: 400,
                color: 'rgba(255,255,255,0.9)',
                mb: 4,
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              Join thousands of teachers who are saving time and improving student outcomes
            </Typography>
            
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: '#0C41FF',
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  fontFamily: 'Poppins, sans-serif',
                  '&:hover': {
                    bgcolor: '#f8f9fa'
                  }
                }}
              >
                Start Creating Now
              </Button>
              
              <Link href="/" passHref>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    borderWidth: 2,
                    color: 'white',
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    fontFamily: 'Poppins, sans-serif',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Learn About Avalern
                </Button>
              </Link>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 