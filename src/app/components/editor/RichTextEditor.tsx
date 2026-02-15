// components/editor/RichTextEditor.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css'; // <-- Updated import
import { Box } from '@mui/material';

// Dynamically import the React 19 compatible version
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }) as any; // <-- Updated import

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ 'size': ['small', false, 'large', 'huge'] }], // Text size
      ['bold', 'italic', 'underline', 'strike'],       // Toggles
      [{ 'color': [] }, { 'background': [] }],         // Colors
      ['link'],                                        // Links
      ['clean']                                        // Remove formatting
    ],
  };

  return (
    <Box sx={{ 
      '.ql-container': { fontSize: '1rem', fontFamily: 'inherit', border: 'none' },
      '.ql-toolbar': { border: 'none', borderBottom: '1px solid #eee', padding: '4px 8px' },
      '.ql-editor': { padding: '12px 0', minHeight: '80px' }, // Added a slight minHeight for better UX
      border: '1px solid #eee', 
      borderRadius: 1,
      bgcolor: 'white'
    }}>
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules}
        placeholder={placeholder || ''}
      />
    </Box>
  );
}