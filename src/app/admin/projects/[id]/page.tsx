'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import ProjectForm from '@/app/components/projectForm';
import { Project } from '@/types/project';
import Image from 'next/image';
import AdminHeader from '@/app/components/adminHeader';
import { useProjectStore } from '@/store/project-store';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const getProject = useProjectStore((state) => state.getProjectById);
  const [project, setProject] = useState<Project | null>(getProject(id || '', 'private') ?? null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

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

    const fetchProject = async () => {
      if (project) return;
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error('Failed to fetch project');

        const json = await res.json();
        setProject(json);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProject();
  }, [user, id, project]);

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

  if (!project) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography>Loading project...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <AdminHeader />
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">{project.title}</Typography>
          <Box>
            <Button variant="outlined" onClick={() => router.push(`/admin/projects/view/${id}`)}>
              preview
            </Button>
            <Button variant="outlined" onClick={() => router.push('/admin/projects')}>
              Back
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1">Preview</Typography>
          {/* {project.image && <Image alt= {project.title}src={project.image} style={{ maxWidth: 300 }} />} */}
          {project.image && (
            <Box sx={{ maxWidth: 300, width: '100%', height: 'auto', position: 'relative' }}>
              <Image
                alt={project.title}
                src={project.image}
                fill
                style={{ objectFit: 'contain' }}
              />
            </Box>
          )}
          <Typography variant="body1" sx={{ mt: 1 }}>
            {project.longDescription}
          </Typography>
        </Paper>

        <Typography variant="h6">Edit project</Typography>
        <ProjectForm
          initial={{
            ...project,
            _id: typeof project._id === 'string' ? project._id : project._id,
          }}
          submitLabel="Update"
          submitMethod="PUT"
          onSaved={(updated) => {
            setProject(updated);
            alert('Saved');
          }}
        />

        <Box sx={{ mt: 2 }}>
          <Button
            color="error"
            variant="outlined"
            onClick={async () => {
              if (!confirm('Delete project?')) return;
              await axios.delete(`/api/projects/${id}`);
              router.push('/admin/projects');
            }}
          >
            Delete project
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
