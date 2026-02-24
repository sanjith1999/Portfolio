// components/ProjectForm.tsx
'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Box, Button, FormControlLabel, Grid, Paper, Switch, TextField, Typography } from '@mui/material';

import type { ProjectDoc } from '@/app/models/projects';
// import { Project, Block } from '@/types/editor'; // Updated to use your new Block types!
import { fileToDataUrl } from '../utils/fileHelpers';
import TagsInput from './TagsInput';
import { Block, Project } from '../data/projectsData';
import BlocksEditor from './editor/BlocksEditor';
// import BlocksEditor from './editor/BlocksEditor'; // <-- We will create this below

type FormProps = {
  initial?: Partial<ProjectDoc>;
  onSaved?: (project: Project) => void;
  submitLabel?: string;
  submitMethod?: 'POST' | 'PUT';
};

export default function ProjectForm({
  initial = {},
  onSaved,
  submitLabel = 'Save Project',
  submitMethod = 'POST',
}: FormProps) {
  const [id] = useState<string>(typeof initial._id === 'string' ? initial._id : '');
  
  // Base State
  const [title, setTitle] = useState(initial.title ?? '');
  const [visibility, setVisibility] = useState(initial.visibility ?? false);
  const [description, setDescription] = useState(initial.description ?? '');
  const [longDescription, setLongDescription] = useState(initial.longDescription ?? '');
  const [githubLink, setGithubLink] = useState(initial.githubLink ?? '');
  const [liveLink, setLiveLink] = useState(initial.liveLink ?? '');
  const [duration, setDuration] = useState(initial.duration ?? '');
  const [teamSize, setTeamSize] = useState(initial.teamSize ?? '');
  const [role, setRole] = useState(initial.role ?? '');
  const [image, setImage] = useState<string | undefined>(initial.image);

  // Arrays handled by TagsInput
  const [technologies, setTechnologies] = useState<string[]>(initial.technologies ?? []);
  const [features, setFeatures] = useState<string[]>(initial.features ?? []);
  const [challenges, setChallenges] = useState<string[]>(initial.challenges ?? []);
  const [solutions, setSolutions] = useState<string[]>(initial.solutions ?? []);

  // 🔥 NEW: Blocks State (Replaces Sections)
  const [blocks, setBlocks] = useState<Block[]>(initial.blocks ?? []);

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(await fileToDataUrl(file));
  };

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Update payload to send blocks instead of sections
    const payload: Project = {
      visibility, title, description, longDescription, technologies,
      features, challenges, solutions, image, githubLink, liveLink,
      duration, teamSize, role, blocks, 
    };

    try {
      const res = submitMethod === 'POST' 
        ? await axios.post('/api/projects', payload)
        : await axios.put(`/api/projects/${id}`, payload);
      
      if (onSaved) onSaved(res.data);
    } catch (err: any) {
      console.error(err);
      alert('Failed to save: ' + (err?.response?.data?.error || err?.message));
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: '0 auto' }}>
      <form onSubmit={submit}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          {submitMethod === 'POST' ? 'Add New Project' : 'Edit Project'}
        </Typography>

        <Grid container spacing={3}>
          {/* Basic Info */}
          <Grid size={{ xs: 12 , md :8}} >
            <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required />
            <FormControlLabel sx={{ mt: 1 }} control={<Switch checked={visibility} onChange={(e) => setVisibility(e.target.checked)} color="success" />} label={visibility ? 'Publicly Visible' : 'Hidden Draft'} />
          </Grid>

          <Grid size={{ xs: 12}}>
            <TextField label="Short description" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12}}>
            <TextField label="Long description" fullWidth multiline minRows={4} value={longDescription} onChange={(e) => setLongDescription(e.target.value)} />
          </Grid>

          {/* Links & Stats */}
          <Grid size={{ xs: 12, md :6}} ><TextField label="Github link" fullWidth value={githubLink} onChange={(e) => setGithubLink(e.target.value)} /></Grid>
          <Grid size={{ xs: 12, md :6}} ><TextField label="Live link" fullWidth value={liveLink} onChange={(e) => setLiveLink(e.target.value)} /></Grid>
          <Grid size={{ xs: 12, md :6}} ><TextField label="Duration" fullWidth value={duration} onChange={(e) => setDuration(e.target.value)} /></Grid>

          {/* Dynamic Tags */}
          <Grid size={{ xs: 12, md :6}} >
            <TagsInput label="Technologies" tags={technologies} onChange={setTechnologies} placeholder="e.g. Next.js, React" />
          </Grid>

          {/* Main Cover Image */}
          <Grid size={{ xs: 12}}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', border: '1px dashed #ccc' }} elevation={0}>
              <Typography variant="subtitle1" gutterBottom>Project Cover Image</Typography>
              {image ? (
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, height: 250, mb: 2 }}>
                  <Image alt="project cover" src={image} fill style={{ objectFit: 'cover', borderRadius: 8 }} />
                  <Button variant="contained" color="error" sx={{ position: 'absolute', top: 10, right: 10 }} onClick={() => setImage(undefined)}>
                    Remove Image
                  </Button>
                </Box>
              ) : (
                <input type="file" accept="image/*" onChange={handleMainImageChange} />
              )}
            </Paper>
          </Grid>

          {/* 🔥 NEW: Notion-Style Block Builder */}
          <Grid size={{ xs: 12}}>
            <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
              Project Content
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: '#fafafa', borderRadius: 2 }}>
               <BlocksEditor blocks={blocks} onChange={setBlocks} />
            </Paper>
          </Grid>

          {/* Submit Action */}
          <Grid size={{ xs: 12}} sx={{ mt: 4 }}>
            <Button variant="contained" color="success" size="large" type="submit" fullWidth sx={{ py: 1.5, fontSize: '1.1rem' }}>
              {submitLabel}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}