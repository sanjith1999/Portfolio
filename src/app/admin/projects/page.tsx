'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CardMedia,
  Button,
  Box,
} from '@mui/material';
import ProjectForm from '../../components/projectForm';
import { useRouter } from 'next/navigation';
import { Project } from '@/app/data/projectsData';
import AdminHeader from '@/app/components/adminHeader';
import { usePrivateProjectStore } from '@/store/private-project-store';
import { Types } from 'mongoose';
import { User } from '@/app/models/user';
export default function ProjectsPage() {

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(
    usePrivateProjectStore((state) => state.projects)
  );
  const [creating, setCreating] = useState(false);

  const router = useRouter();

  // 1️⃣ Auth check
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  // 2️⃣ Fetch projects (only when logged in)
  useEffect(() => {
    if (user?.loggedIn) {
      const fetchAll = async () => {
        const res = await axios.get('/api/projects');
        setProjects(res.data);
      };
      fetchAll();
    }
  }, [user]);

  if (!user) return <p>Loading...</p>;

  if (!user.loggedIn)
    return (
      <div style={{ padding: 40 }}>
        <h1>Not Authorized</h1>
        <p>Please login to access this page.</p>
        <a href="/login" style={{ color: 'blue' }}>
          Go to Login
        </a>
      </div>
    );

  async function fetchAll() {
    if (!projects || projects.length === 0) {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    }
  }

  const handleEditView = (projectId: string | Types.ObjectId | undefined) => {
    router.push(`/admin/projects/${projectId}`);
  };
  const handleView = (projectId: string | Types.ObjectId | undefined) => {
    router.push(`/admin/projects/view/${projectId}`);
  };

  // 3️⃣ AUTHORIZED CONTENT BELOW
  return (
    <Box sx={{ p: 3 }}>
      <AdminHeader />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Ideas
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 2 }}>
              <Button variant="contained" onClick={() => setCreating((c) => !c)}>
                {creating ? 'Hide' : 'Add new project'}
              </Button>
            </Box>

            {creating && (
              <ProjectForm
                onSaved={() => {
                  setCreating(false);
                  fetchAll();
                }}
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1">Existing projects</Typography>

            <Grid container spacing={2}>
              {projects.map((p) => (
                <Grid key={p._id?.toString()} size={{ xs: 12 }}>
                  <Card>
                    <CardContent sx={{ display: 'flex', gap: 2 }}>
                      {p.image && (
                        <CardMedia
                          component="img"
                          image={p.image}
                          sx={{ width: 140, height: 90, borderRadius: 1 }}
                        />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{p.title}</Typography>
                        <Typography variant="body2">{p.description}</Typography>
                        {!p.visibility && (
                          <Typography variant="h6">Visibility : Private</Typography>
                        )}
                        {p.visibility && <Typography variant="h6">Visibility : Public</Typography>}
                        <Box sx={{ mt: 1 }}>
                          <Button size="small" onClick={() => handleEditView(p._id)}>
                            Edit
                          </Button>
                          <Button size="small" onClick={() => handleView(p._id)}>
                            View
                          </Button>
                          <Button
                            size="small"
                            onClick={async () => {
                              if (!confirm('Delete project?')) return;
                              await axios.delete(`/api/projects/${p._id}`);
                              fetchAll();
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
