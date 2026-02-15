// components/SectionEditor.tsx
'use client';
import React from 'react';
import { Box, TextField, IconButton, Paper, Button, Typography, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { fileToDataUrl } from '../utils/fileHelpers';
import type { Section, SubSection, Column } from '@/app/models/projects';
import CollapsibleSection from './ColapsableComponent';
import SubSectionEditor from './SubSectionEditor';
import ColumnEditor from './ColumnEditor';

interface SectionProps {
  section: Section;
  onChange: (sec: Section) => void;
  onRemove: () => void;
}

export default function SectionEditor({ section, onChange, onRemove }: SectionProps) {
  return (
    <CollapsibleSection title={`Section: ${section.heading || 'Untitled'}`}>
      <Paper sx={{ p: 3, mb: 3, borderLeft: '6px solid #4caf50' }} elevation={2}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <TextField
            label="Section Heading"
            fullWidth
            sx={{ mr: 2 }}
            value={section.heading}
            onChange={(e) => onChange({ ...section, heading: e.target.value })}
          />
          <IconButton color="error" onClick={onRemove} size="large">
            <DeleteIcon />
          </IconButton>
        </Box>

        {/* Paragraphs */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold">Paragraphs</Typography>
          {section.content.map((para, ci) => (
            <Box key={ci} sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                fullWidth
                multiline
                value={para}
                onChange={(e) => {
                  const newContent = [...section.content];
                  newContent[ci] = e.target.value;
                  onChange({ ...section, content: newContent });
                }}
              />
              <IconButton onClick={() => {
                onChange({ ...section, content: section.content.filter((_, i) => i !== ci) });
              }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button sx={{ mt: 1 }} onClick={() => onChange({ ...section, content: [...section.content, ''] })} startIcon={<AddIcon />}>
            Add Paragraph
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section Image */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold">Main Image</Typography>
          {section.image ? (
            <Box sx={{ position: 'relative', width: '100%', maxWidth: 300, height: 200, mt: 1 }}>
              <Image alt="Section" src={section.image} fill style={{ objectFit: 'cover', borderRadius: 8 }} />
              <Button 
                variant="contained" color="error" size="small" 
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => onChange({ ...section, image: undefined })}
              >Remove Image</Button>
            </Box>
          ) : (
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) onChange({ ...section, image: await fileToDataUrl(file) });
            }} />
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Columns */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold">Layout Columns</Typography>
          {(section.columns || []).map((col, ci) => (
            <ColumnEditor
              key={col.id}
              column={col}
              onChange={(updatedCol) => {
                const newCols = [...(section.columns || [])];
                newCols[ci] = updatedCol;
                onChange({ ...section, columns: newCols });
              }}
              onRemove={() => onChange({ ...section, columns: (section.columns || []).filter((_, i) => i !== ci) })}
            />
          ))}
          <Button sx={{ mt: 2 }} onClick={() => onChange({
            ...section, 
            columns: [...(section.columns || []), { id: uuidv4(), type: 'text', content: '', width: 50 }]
          })} startIcon={<AddIcon />} variant="outlined">
            Add Column
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Subsections */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">Subsections</Typography>
          {(section.subSections || []).map((sub, subi) => (
            <SubSectionEditor
              key={sub.id}
              index={subi}
              subSection={sub}
              onChange={(updatedSub) => {
                const newSubs = [...(section.subSections || [])];
                newSubs[subi] = updatedSub;
                onChange({ ...section, subSections: newSubs });
              }}
              onRemove={() => onChange({ ...section, subSections: (section.subSections || []).filter((_, i) => i !== subi) })}
            />
          ))}
          <Button sx={{ mt: 2 }} onClick={() => onChange({
            ...section,
            subSections: [...(section.subSections || []), { id: uuidv4(), heading: 'New Sub', content: [], points: [] }]
          })} startIcon={<AddIcon />} variant="outlined" color="secondary">
            Add Subsection
          </Button>
        </Box>

      </Paper>
    </CollapsibleSection>
  );
}