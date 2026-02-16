// components/editor/BlocksEditor.tsx
'use client';

import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import BlockEditor from './BlockEditor'; 
import { Block, BlockType } from '@/app/data/projectsData';

// Wrapper to make individual blocks draggable
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
        onInsertBelow={onInsertBelow}
        dragHandleProps={{ ...attributes, ...listeners }} 
      />
    </div>
  );
}

interface BlocksEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export default function BlocksEditor({ blocks, onChange }: BlocksEditorProps) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(i => i.id === active.id);
      const newIndex = blocks.findIndex(i => i.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  // 🔥 NEW: Insert block AT A SPECIFIC INDEX (Below the block that clicked '+')
  const insertBlock = (index: number, type: BlockType, columnCount: number = 2) => {
    const newBlock: Block = { id: uuidv4(), type, content: '' };
    
    if (type === 'columns') {
      const colWidth = 100 / columnCount;
      newBlock.columns = Array.from({ length: columnCount }).map(() => ({
        id: uuidv4(), width: colWidth, blocks: [] 
      }));
    }
    
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock); // Insert AFTER the current index
    onChange(newBlocks);
  };

  return (
    <Box>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block, index) => (
            <SortableBlockWrapper
              key={block.id}
              block={block}
              onChange={(updatedBlock: Block) => {
                const newBlocks = [...blocks];
                newBlocks[index] = updatedBlock;
                onChange(newBlocks);
              }}
              onRemove={() => onChange(blocks.filter((_, i) => i !== index))}
              onInsertBelow={(type, cols) => insertBlock(index, type, cols)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Fallback button just in case they delete all blocks and need to start over */}
      {blocks.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
            No content yet. Click below to add your first block.
          </Typography>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => insertBlock(-1, 'paragraph')}>
            Start Writing
          </Button>
        </Box>
      )}

      {/* A tiny, subtle add button at the very bottom just for convenience */}
      {blocks.length > 0 && (
         <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
           <Button size="small" sx={{ color: '#ccc', '&:hover': { color: 'primary.main' } }} onClick={() => insertBlock(blocks.length - 1, 'paragraph')}>
             + Click here to add another block
           </Button>
         </Box>
      )}
    </Box>
  );
}