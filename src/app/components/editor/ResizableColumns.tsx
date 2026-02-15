// components/editor/ResizableColumns.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// import { ColumnData, BlockType } from '@/types/editor';
// Import BlockEditor here for recursive rendering!
import BlockEditor from './BlockEditor'; 
import { BlockType, ColumnData } from '@/app/data/projectsData';

interface ResizableColumnsProps {
  columns: ColumnData[];
  onChange: (columns: ColumnData[]) => void;
}

export default function ResizableColumns({ columns, onChange }: ResizableColumnsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [menuConfig, setMenuConfig] = useState<{ anchorEl: HTMLElement | null, colIndex: number }>({ anchorEl: null, colIndex: 0 });

  // Standardizing around 2 columns
  const col1 = columns[0];
  const col2 = columns[1];

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || !col1 || !col2) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      
      // Calculate percentage, constraining between 15% and 85% width
      let newCol1Width = (offsetX / containerRect.width) * 100;
      newCol1Width = Math.max(15, Math.min(newCol1Width, 85));
      const newCol2Width = 100 - newCol1Width;

      onChange([
        { ...col1, width: newCol1Width },
        { ...col2, width: newCol2Width },
      ]);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Disable text selection while dragging to prevent highlighting chaos
      document.body.style.userSelect = 'none'; 
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, col1, col2, onChange]);

  // Nested Block Modifiers
  const handleAddBlock = (type: BlockType) => {
    const updatedColumns = [...columns];
    updatedColumns[menuConfig.colIndex].blocks.push({ id: uuidv4(), type, content: '' });
    onChange(updatedColumns);
    setMenuConfig({ anchorEl: null, colIndex: 0 }); // Close menu
  };

  const updateNestedBlock = (colIndex: number, blockIndex: number, updatedBlock: any) => {
    const updatedColumns = [...columns];
    updatedColumns[colIndex].blocks[blockIndex] = updatedBlock;
    onChange(updatedColumns);
  };

  const removeNestedBlock = (colIndex: number, blockIndex: number) => {
    const updatedColumns = [...columns];
    updatedColumns[colIndex].blocks.splice(blockIndex, 1);
    onChange(updatedColumns);
  };

  if (columns.length !== 2) return null;

  return (
    <Box ref={containerRef} sx={{ display: 'flex', width: '100%', position: 'relative', alignItems: 'stretch' }}>
      
      {/* COLUMN 1 */}
      <Box sx={{ width: `${col1.width}%`, pr: 2, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        {col1.blocks.map((b, idx) => (
          <BlockEditor 
            key={b.id} 
            block={b} 
            onChange={(updated) => updateNestedBlock(0, idx, updated)} 
            onRemove={() => removeNestedBlock(0, idx)} 
          />
        ))}
        <Box sx={{ mt: 'auto', textAlign: 'center' }}>
          <Tooltip title="Add block to left column">
            <IconButton onClick={(e) => setMenuConfig({ anchorEl: e.currentTarget, colIndex: 0 })} size="small" sx={{ bgcolor: '#f5f5f5' }}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* DRAGGABLE DIVIDER */}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          width: '12px',
          cursor: 'col-resize',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '&::after': {
            content: '""',
            height: '100%',
            width: '2px',
            backgroundColor: isDragging ? '#1976d2' : '#e0e0e0',
            transition: 'background-color 0.2s',
          },
          '&:hover::after': { backgroundColor: '#1976d2' },
          zIndex: 10,
        }}
      />

      {/* COLUMN 2 */}
      <Box sx={{ width: `${col2.width}%`, pl: 2, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        {col2.blocks.map((b, idx) => (
          <BlockEditor 
            key={b.id} 
            block={b} 
            onChange={(updated) => updateNestedBlock(1, idx, updated)} 
            onRemove={() => removeNestedBlock(1, idx)} 
          />
        ))}
        <Box sx={{ mt: 'auto', textAlign: 'center' }}>
           <Tooltip title="Add block to right column">
             <IconButton onClick={(e) => setMenuConfig({ anchorEl: e.currentTarget, colIndex: 1 })} size="small" sx={{ bgcolor: '#f5f5f5' }}>
               <AddIcon fontSize="small" />
             </IconButton>
           </Tooltip>
        </Box>
      </Box>

      {/* ADD BLOCK MENU (Shared for both columns) */}
      <Menu 
        anchorEl={menuConfig.anchorEl} 
        open={Boolean(menuConfig.anchorEl)} 
        onClose={() => setMenuConfig({ anchorEl: null, colIndex: 0 })}
      >
        <MenuItem onClick={() => handleAddBlock('paragraph')}>Text</MenuItem>
        <MenuItem onClick={() => handleAddBlock('heading2')}>Heading 2</MenuItem>
        <MenuItem onClick={() => handleAddBlock('bullet_list')}>Bullet List</MenuItem>
        <MenuItem onClick={() => handleAddBlock('numbered_list')}>Numbered List</MenuItem>
        <MenuItem onClick={() => handleAddBlock('image')}>Image</MenuItem>
        <MenuItem onClick={() => handleAddBlock('equation')}>Math Equation</MenuItem>
      </Menu>

    </Box>
  );
}