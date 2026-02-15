// components/editor/NotionStyleEditor.tsx
'use client';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Box, Button, Paper, Menu, MenuItem, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Block, BlockType } from '@/app/data/projectsData';

import BlockEditor from './BlockEditor';

// Wrapper for dnd-kit sortable items
function SortableBlockWrapper({ block, onChange, onRemove }: { block: Block, onChange: any, onRemove: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <BlockEditor block={block} onChange={onChange} onRemove={onRemove} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

export default function NotionStyleEditor() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: uuidv4(), type: 'heading1', content: 'My Awesome Project' },
  ]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Setup Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = { id: uuidv4(), type, content: '' };
    
    // If it's a column, initialize the data structure for it
    if (type === 'columns') {
      newBlock.columns = [
        { id: uuidv4(), width: 50, blocks: [] },
        { id: uuidv4(), width: 50, blocks: [] },
      ];
    }
    
    setBlocks([...blocks, newBlock]);
    setAnchorEl(null);
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 8 }, maxWidth: 900, mx: 'auto', minHeight: '80vh' }} elevation={0}>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Press the + button to add blocks.</Typography>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block, index) => (
            <SortableBlockWrapper
              key={block.id}
              block={block}
              onChange={(updatedBlock: Block) => {
                const newBlocks = [...blocks];
                newBlocks[index] = updatedBlock;
                setBlocks(newBlocks);
              }}
              onRemove={() => setBlocks(blocks.filter((_, i) => i !== index))}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddMenuOpen}>
          Add Block
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => addBlock('paragraph')}>Text</MenuItem>
          <MenuItem onClick={() => addBlock('heading1')}>Heading 1</MenuItem>
          <MenuItem onClick={() => addBlock('image')}>Image</MenuItem>
          <MenuItem onClick={() => addBlock('equation')}>Math Equation</MenuItem>
          <MenuItem onClick={() => addBlock('columns')}>2-Column Layout</MenuItem>
        </Menu>
      </Box>

      {/* Helper to show the raw JSON state representing your document */}
      <Box sx={{ mt: 10, p: 2, bgcolor: '#f0f0f0', fontSize: 12 }}>
         <Typography variant="overline">Debug: Document State</Typography>
         <pre>{JSON.stringify(blocks, null, 2)}</pre>
      </Box>
    </Paper>
  );
}