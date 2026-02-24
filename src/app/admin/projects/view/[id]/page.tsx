'use client';

import HomeIcon from '@mui/icons-material/Home';
import { AppBar, Box, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ProjectPreview from '@/app/components/ProjectView';
export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const handleBackAllProject = () => router.push('/admin/projects');
  // 1️⃣ Check auth
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => setUser({ loggedIn: false }));
  }, []);

  // 2️⃣ Fetch project
  useEffect(() => {
    if (!user?.loggedIn || !id) return;
  }, [user, id]);

  // 3️⃣ Conditional rendering
  if (!user) return <p>Loading...</p>;

  if (!user.loggedIn)
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h6" color="error">
          Not authorized — please login
        </Typography>
        <Button sx={{ mt: 2 }} onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </Container>
    );

  return (
    <Box sx={{ p: 3 }}>
      {/* AppBar */}
      <AppBar position="sticky" color="inherit" elevation={1}  >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBackAllProject} sx={{ mr: 2 }}>
            <HomeIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleBackAllProject}>← View All</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Layout */}
      <ProjectPreview />
    </Box>
  );
}
