// components/editor/BlockEditor.tsx
'use client';

import React from 'react';
import { Box, TextField, IconButton, Button, Typography, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import { BlockMath } from 'react-katex';

import { Block } from '@/app/data/projectsData'; // Ensure this path is correct
import ResizableColumns from './ResizableColumns';
import RichTextEditor from './RichTextEditor';

interface BlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  onRemove: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleProps?: any; // Passed down from dnd-kit sortable
}

export default function BlockEditor({ block, onChange, onRemove, dragHandleProps }: BlockEditorProps) {
  
  // Helper for Lists (Bullet & Numbered)
  const handleListChange = (index: number, value: string) => {
    const list = Array.isArray(block.content) ? [...block.content] : [];
    list[index] = value;
    onChange({ ...block, content: list });
  };

  const handleListAdd = () => {
    const list = Array.isArray(block.content) ? [...block.content] : [];
    onChange({ ...block, content: [...list, ''] });
  };

  const handleListRemove = (index: number) => {
    const list = Array.isArray(block.content) ? [...block.content] : [];
    onChange({ ...block, content: list.filter((_, i) => i !== index) });
  };

  const renderContent = () => {
    switch (block.type) {
      
      // --- STRUCTURAL TEXT BLOCKS (No formatting) ---
      case 'heading1':
        return (
          <TextField
            fullWidth placeholder="Heading 1" variant="standard"
            value={(block.content as string) || ''}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            InputProps={{ style: { fontSize: '2rem', fontWeight: 'bold' }, disableUnderline: true }}
          />
        );
        
      case 'heading2':
        return (
          <TextField
            fullWidth placeholder="Heading 2" variant="standard"
            value={(block.content as string) || ''}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            InputProps={{ style: { fontSize: '1.5rem', fontWeight: '600' }, disableUnderline: true }}
          />
        );

      // --- RICH TEXT BLOCKS ---
      case 'paragraph':
        return (
          <RichTextEditor 
            value={(block.content as string) || ''} 
            onChange={(val) => onChange({ ...block, content: val })} 
            placeholder="Type your paragraph..."
          />
        );

      // --- LIST BLOCKS (No formatting) ---
      case 'bullet_list':
      case 'numbered_list':
        const items = Array.isArray(block.content) ? block.content : [''];
        return (
          <Box sx={{ pl: 2 }}>
            {items.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ mr: 1, color: 'text.secondary' }}>
                  {block.type === 'bullet_list' ? '•' : `${i + 1}.`}
                </Typography>
                <TextField
                  fullWidth variant="standard" size="small" placeholder="List item"
                  value={item} onChange={(e) => handleListChange(i, e.target.value)}
                  InputProps={{ disableUnderline: true }}
                />
                <IconButton size="small" onClick={() => handleListRemove(i)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={handleListAdd} sx={{ mt: 1, color: 'text.secondary' }}>
              Add Item
            </Button>
          </Box>
        );

      // --- MEDIA & MATH BLOCKS ---
      case 'equation':
        return (
          <Box sx={{ width: '100%' }}>
            <TextField
              fullWidth placeholder="LaTeX (e.g. \int_0^1 x^2 dx)" variant="outlined" size="small"
              value={block.content || ''}
              onChange={(e) => onChange({ ...block, content: e.target.value })}
              sx={{ mb: 1 }}
            />
            {block.content && (
              <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, textAlign: 'center', overflowX: 'auto' }}>
                <BlockMath math={block.content as string} />
              </Box>
            )}
          </Box>
        );

      case 'image':
        return (
          <Box sx={{ width: '100%' }}>
            {block.content ? (
              <Box sx={{ textAlign: block.props?.align || 'center', position: 'relative' }}>
                <img src={block.content as string} alt="block" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                <Button 
                  size="small" variant="contained" color="error" 
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={() => onChange({ ...block, content: '' })}
                >
                  Clear
                </Button>
                <TextField
                  fullWidth placeholder="Add a caption..." variant="standard" size="small"
                  value={block.props?.caption || ''}
                  onChange={(e) => onChange({ ...block, props: { ...block.props, caption: e.target.value } })}
                  inputProps={{ style: { textAlign: 'center', fontSize: '0.9rem', color: '#666' } }}
                  sx={{ mt: 1 }}
                />
              </Box>
            ) : (
              <Box sx={{ p: 4, border: '2px dashed #ccc', borderRadius: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
                 <Typography variant="body2" color="text.secondary" gutterBottom>Upload Image</Typography>
                 <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => onChange({ ...block, content: ev.target?.result as string });
                      reader.readAsDataURL(file);
                    }
                 }} />
              </Box>
            )}
          </Box>
        );

      // --- LAYOUT BLOCKS ---
      case 'code':
        return (
          <Box sx={{ width: '100%' }}>
            <Typography variant="caption" color="text.secondary">Code Block</Typography>
            <TextField
              fullWidth multiline minRows={3}
              value={block.content || ''}
              onChange={(e) => onChange({ ...block, content: e.target.value })}
              sx={{ 
                fontFamily: 'monospace', 
                bgcolor: '#1e1e1e', 
                borderRadius: 1, 
                '& .MuiInputBase-input': { color: '#d4d4d4', fontFamily: 'monospace' } 
              }}
            />
          </Box>
        );

      case 'divider':
        return <Divider sx={{ my: 2, borderWidth: 2, width: '100%' }} />;

      case 'spacer':
        return (
          <Box sx={{ width: '100%', border: '1px dashed #ccc', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fdfdfd' }}>
            <Typography variant="caption" color="text.disabled">Empty Spacer (Invisible on Viewer)</Typography>
          </Box>
        );

      case 'columns':
        return (
           <Box sx={{ border: '1px solid #eee', p: 1, borderRadius: 2, bgcolor: 'white', width: '100%' }}>
             <Typography variant="overline" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
               {block.columns?.length}-Column Layout
             </Typography>
             <ResizableColumns 
               columns={block.columns || []} 
               onChange={(cols) => onChange({ ...block, columns: cols })}
             />
           </Box>
        );

      default:
        return <Typography color="error">Unsupported block type</Typography>;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      mb: 2, 
      position: 'relative', 
      '&:hover .block-controls': { opacity: 1 } 
    }}>
      
      {/* Notion-style Hover Controls */}
      <Box className="block-controls" sx={{ 
        opacity: 0, 
        transition: 'opacity 0.2s', 
        display: 'flex', 
        alignItems: 'center', 
        mr: 1, 
        mt: 1 
      }}>
        <IconButton 
          size="small" 
          {...dragHandleProps} 
          sx={{ cursor: 'grab', color: '#bdbdbd', '&:hover': { color: '#424242' } }}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          color="error" 
          onClick={onRemove} 
          sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, p: 0.5, width: 'calc(100% - 80px)' }}>
        {renderContent()}
      </Box>
    </Box>
  );
}