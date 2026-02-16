// components/editor/NotionStyleEditor.tsx
'use client';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Box, Button, Paper, Menu, MenuItem, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Block, BlockType } from '@/app/data/projectsData';
import BlockEditor from './BlockEditor';

// 🔥 FIX 1: Add onInsertBelow to the wrapper's types and props, and remove 'any'
function SortableBlockWrapper({ 
  block, 
  onChange, 
  onRemove,
  onInsertBelow 
}: { 
  block: Block, 
  onChange: (b: Block) => void, 
  onRemove: () => void,
  onInsertBelow: (type: BlockType, cols?: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <BlockEditor 
        block={block} 
        onChange={onChange} 
        onRemove={onRemove} 
        onInsertBelow={onInsertBelow} // Passed down to BlockEditor!
        dragHandleProps={{ ...attributes, ...listeners }} 
      />
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
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

  // 🔥 FIX 2: Create the insertBlock logic for inline additions
  const insertBlock = (index: number, type: BlockType, columnCount: number = 2) => {
    const newBlock: Block = { id: uuidv4(), type, content: '' };
    
    if (type === 'columns') {
      const colWidth = 100 / columnCount;
      newBlock.columns = Array.from({ length: columnCount }).map(() => ({
        id: uuidv4(), width: colWidth, blocks: []
      }));
    }
    
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock); // Insert exactly below the clicked block
    setBlocks(newBlocks);
  };

  // Keep this for the generic "Add to bottom" button
  const addBlockToBottom = (type: BlockType) => {
    insertBlock(blocks.length - 1, type);
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
              // 🔥 FIX 3: Pass the inline insert function here
              onInsertBelow={(type, cols) => insertBlock(index, type, cols)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddMenuOpen}>
          Add Block
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => addBlockToBottom('paragraph')}>Text</MenuItem>
          <MenuItem onClick={() => addBlockToBottom('heading1')}>Heading 1</MenuItem>
          <MenuItem onClick={() => addBlockToBottom('image')}>Image</MenuItem>
          <MenuItem onClick={() => addBlockToBottom('equation')}>Math Equation</MenuItem>
          <MenuItem onClick={() => addBlockToBottom('columns')}>2-Column Layout</MenuItem>
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