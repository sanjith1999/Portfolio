// components/ColumnEditor.tsx
'use client';
import React from 'react';
import { Box, TextField, IconButton, Paper, Button, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Image from 'next/image';
import { BlockMath } from 'react-katex';
import type { Column } from '@/app/models/projects';
import { fileToDataUrl } from '../utils/fileHelpers';

interface ColumnEditorProps {
  column: Column;
  onChange: (col: Column) => void;
  onRemove: () => void;
}

export default function ColumnEditor({ column, onChange, onRemove }: ColumnEditorProps) {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    onChange({ ...column, content: dataUrl });
  };

  return (
    <Paper sx={{ p: 2, mt: 2, border: '1px solid #e0e0e0', backgroundColor: '#fafafa' }} elevation={0}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Column Type"
            select
            value={column.type}
            onChange={(e) => onChange({ ...column, type: e.target.value as Column['type'], content: '' })}
            SelectProps={{ native: true }}
            size="small"
            sx={{ width: 150 }}
          >
            <option value="text">Text</option>
            <option value="points">Points</option>
            <option value="image">Image</option>
            <option value="equation">Equation</option>
          </TextField>
          <TextField
            label="Width (%)"
            type="number"
            size="small"
            sx={{ width: 100 }}
            value={column.width ?? 50}
            onChange={(e) => onChange({ ...column, width: Number(e.target.value) })}
          />
        </Box>
        <IconButton color="error" onClick={onRemove} size="small">
          <DeleteIcon />
        </IconButton>
      </Box>

      {/* TEXT */}
      {column.type === 'text' && (
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Text Content"
          value={column.content as string}
          onChange={(e) => onChange({ ...column, content: e.target.value })}
        />
      )}

      {/* EQUATION */}
      {column.type === 'equation' && (
        <Box>
          <TextField
            fullWidth
            multiline
            label="LaTeX Equation"
            placeholder="\int_0^1 x^2 dx"
            value={column.content as string}
            onChange={(e) => onChange({ ...column, content: e.target.value })}
            sx={{ mb: 2 }}
          />
          {column.content ? (
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, border: '1px dashed #ccc' }}>
              <BlockMath math={column.content as string} />
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">Preview will appear here</Typography>
          )}
        </Box>
      )}

      {/* POINTS */}
      {column.type === 'points' && (
        <Box>
          {(Array.isArray(column.content) ? column.content : []).map((point, pi) => (
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }} key={pi}>
              <TextField
                fullWidth
                size="small"
                value={point}
                label={`Point ${pi + 1}`}
                onChange={(e) => {
                  const newPoints = [...(column.content as string[])];
                  newPoints[pi] = e.target.value;
                  onChange({ ...column, content: newPoints });
                }}
              />
              <IconButton onClick={() => {
                const newPoints = (column.content as string[]).filter((_, j) => j !== pi);
                onChange({ ...column, content: newPoints });
              }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => onChange({ ...column, content: [...(Array.isArray(column.content) ? column.content : []), ''] })}>
            Add Point
          </Button>
        </Box>
      )}

      {/* IMAGE */}
      {column.type === 'image' && (
        <Box>
          {column.content && typeof column.content === 'string' && (
             <Box sx={{ position: 'relative', width: '100%', maxWidth: 300, height: 200, mb: 2 }}>
               <Image alt="Column content" src={column.content} fill style={{ objectFit: 'contain' }} />
               <Button 
                 variant="contained" 
                 color="error" 
                 size="small" 
                 sx={{ position: 'absolute', top: 8, right: 8 }}
                 onClick={() => onChange({ ...column, content: '' })}
                >
                 Clear
               </Button>
             </Box>
          )}
          {!column.content && <input type="file" accept="image/*" onChange={handleImageUpload} />}
        </Box>
      )}
    </Paper>
  );
}