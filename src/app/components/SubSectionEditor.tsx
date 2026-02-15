// components/SubSectionEditor.tsx
'use client';
import React from 'react';
import { Box, TextField, IconButton, Paper, Button, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { BlockMath } from 'react-katex';
import Image from 'next/image';
import { fileToDataUrl } from '../utils/fileHelpers';
import type { SubSection } from '@/app/models/projects';
import CollapsibleSection from './ColapsableComponent';

interface SubSectionProps {
  subSection: SubSection;
  index: number;
  onChange: (sub: SubSection) => void;
  onRemove: () => void;
}

export default function SubSectionEditor({ subSection, index, onChange, onRemove }: SubSectionProps) {
  return (
    <CollapsibleSection title={`Subsection ${index + 1}: ${subSection.heading || 'Untitled'}`}>
      <Paper sx={{ p: 2, mt: 1, borderLeft: '4px solid #2196f3' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Sub heading"
            fullWidth
            sx={{ mr: 2 }}
            value={subSection.heading || ''}
            onChange={(e) => onChange({ ...subSection, heading: e.target.value })}
          />
          <IconButton color="error" onClick={onRemove}>
            <DeleteIcon />
          </IconButton>
        </Box>

        {/* Math Equation */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Equation</Typography>
          <TextField
            fullWidth
            multiline
            placeholder="\int x^2 dx"
            value={subSection.equation || ''}
            onChange={(e) => onChange({ ...subSection, equation: e.target.value })}
            sx={{ mb: 1 }}
          />
          {subSection.equation && (
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <BlockMath math={subSection.equation} />
            </Box>
          )}
        </Box>

        {/* Points */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Points</Typography>
          {(subSection.points || []).map((point, pi) => (
            <Box key={pi} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={point}
                onChange={(e) => {
                  const newPoints = [...(subSection.points || [])];
                  newPoints[pi] = e.target.value;
                  onChange({ ...subSection, points: newPoints });
                }}
              />
              <IconButton onClick={() => {
                onChange({ ...subSection, points: (subSection.points || []).filter((_, i) => i !== pi) });
              }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => onChange({ ...subSection, points: [...(subSection.points || []), ''] })}>
            Add Point
          </Button>
        </Box>

        {/* Image */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Subsection Image</Typography>
          {subSection.image ? (
            <Box sx={{ position: 'relative', width: '100%', maxWidth: 200, height: 150 }}>
              <Image alt="subsection" src={subSection.image} fill style={{ objectFit: 'contain' }} />
              <Button 
                color="error" 
                variant="contained" 
                size="small" 
                sx={{ position: 'absolute', top: 5, right: 5 }}
                onClick={() => onChange({ ...subSection, image: undefined })}
              >
                Remove
              </Button>
            </Box>
          ) : (
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) onChange({ ...subSection, image: await fileToDataUrl(file) });
            }} />
          )}
        </Box>
      </Paper>
    </CollapsibleSection>
  );
}