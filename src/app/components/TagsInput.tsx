// components/TagsInput.tsx
'use client';
import React, { useState } from 'react';
import { Box, TextField, Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface TagsInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagsInput({ label, tags, onChange, placeholder }: TagsInputProps) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    // Prevent duplicates
    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
        <TextField
          label={label}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          size="small"
          fullWidth
        />
        <Button onClick={handleAdd} startIcon={<AddIcon />} variant="outlined">
          Add
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {tags.map((tag, i) => (
          <Chip key={i} label={tag} onDelete={() => handleRemove(i)} color="primary" variant="outlined" />
        ))}
      </Box>
    </Box>
  );
}