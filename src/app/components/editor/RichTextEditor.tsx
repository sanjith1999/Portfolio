// components/editor/RichTextEditor.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css'; 
import { Box } from '@mui/material';

// Dynamically import the React 19 compatible version
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }) as any; 

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ 'size': ['small', false, 'large', 'huge'] }], 
      ['bold', 'italic', 'underline', 'strike'],       
      [{ 'color': [] }, { 'background': [] }],         
      [{ 'align': [] }], // 🔥 NEW: Alignment options (Left, Center, Right, Justify)
      ['link'],                                        
      ['clean']                                        
    ],
  };

  return (
    <Box sx={{ 
      '.ql-container': { fontSize: '1rem', fontFamily: 'inherit', border: 'none' },
      '.ql-toolbar': { border: 'none', borderBottom: '1px solid #eee', padding: '4px 8px' },
      '.ql-editor': { padding: '12px 0', minHeight: '80px' }, 
      border: '1px solid #eee', 
      borderRadius: 1,
      bgcolor: 'background.paper'
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