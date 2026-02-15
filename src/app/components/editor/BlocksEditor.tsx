// components/editor/BlocksEditor.tsx
'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// import { Block, BlockType } from '@/types/editor';
import BlockEditor from './BlockEditor'; // The UI for an individual block (from the previous prompt)
import { Block, BlockType } from '@/app/data/projectsData';

// Wrapper to make individual blocks draggable
function SortableBlockWrapper({ block, onChange, onRemove }: { block: Block, onChange: (b: Block) => void, onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <BlockEditor block={block} onChange={onChange} onRemove={onRemove} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

interface BlocksEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export default function BlocksEditor({ blocks, onChange }: BlocksEditorProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Drag and Drop configuration
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex(i => i.id === active.id);
      const newIndex = blocks.findIndex(i => i.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = { id: uuidv4(), type, content: '' };
    
    // If the user adds a column layout, give them two 50% columns by default
    if (type === 'columns') {
      newBlock.columns = [
        { id: uuidv4(), width: 50, blocks: [] },
        { id: uuidv4(), width: 50, blocks: [] },
      ];
    }
    
    onChange([...blocks, newBlock]);
    setAnchorEl(null);
  };

  return (
    <Box>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block, index) => (
            <SortableBlockWrapper
              key={block.id}
              block={block}
              onChange={(updatedBlock) => {
                const newBlocks = [...blocks];
                newBlocks[index] = updatedBlock;
                onChange(newBlocks);
              }}
              onRemove={() => {
                const newBlocks = blocks.filter((_, i) => i !== index);
                onChange(newBlocks);
              }}
            />
          ))}
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', my: 4, fontStyle: 'italic' }}>
          No content yet. Click below to add your first block.
        </Typography>
      )}

      <Box sx={{ mt: 3 }}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={(e) => setAnchorEl(e.currentTarget)}>
          Add Block
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => addBlock('paragraph')}>Text Paragraph</MenuItem>
          <MenuItem onClick={() => addBlock('heading1')}>Heading 1</MenuItem>
          <MenuItem onClick={() => addBlock('heading2')}>Heading 2</MenuItem>
          <MenuItem onClick={() => addBlock('bullet_list')}>Bullet List</MenuItem>
          <MenuItem onClick={() => addBlock('image')}>Image</MenuItem>
          <MenuItem onClick={() => addBlock('equation')}>Math Equation</MenuItem>
          <MenuItem onClick={() => addBlock('columns')}>2-Column Layout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}