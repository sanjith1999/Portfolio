'use client';
import ProjectPreview from '@/app/components/ProjectView';
import HomeIcon from '@mui/icons-material/Home';
import { AppBar, Box, Button, IconButton, Toolbar } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  // Fetch project from API
  useEffect(() => {
    if (!projectId) return;
  }, [projectId]);
  useEffect(() => {
    // This runs only when the page mounts
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('hide-loader'));
    }
  }, []);

  const handleBackToHome = () => router.push('/');
  const handleBackAllProject = () => router.push('/all-projects');

  return (
    <Box sx={{ p: 3 }}>
      {/* AppBar */}
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBackToHome} sx={{ mr: 2 }}>
            <HomeIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleBackAllProject}>← View All</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <ProjectPreview />
    </Box>
  );
}
