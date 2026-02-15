// components/editor/BlocksEditor.tsx
'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Box, Button, Menu, MenuItem, Typography, Divider as MuiDivider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import BlockEditor from './BlockEditor'; 
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

  // Replaced 'any' with 'DragEndEvent' for strict TypeScript safety
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(i => i.id === active.id);
      const newIndex = blocks.findIndex(i => i.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  // Upgraded to handle dynamic column counts!
  const addBlock = (type: BlockType, columnCount: number = 2) => {
    const newBlock: Block = { id: uuidv4(), type, content: '' };
    
    if (type === 'columns') {
      // Dynamically create 2, 3, or 4 columns with perfectly divided widths
      const colWidth = 100 / columnCount;
      newBlock.columns = Array.from({ length: columnCount }).map(() => ({
        id: uuidv4(), 
        width: colWidth, 
        blocks: [] 
      }));
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
              onChange={(updatedBlock: Block) => {
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
          
          {/* Text & Lists */}
          <MenuItem onClick={() => addBlock('paragraph')}>Text Paragraph</MenuItem>
          <MenuItem onClick={() => addBlock('heading1')}>Heading 1</MenuItem>
          <MenuItem onClick={() => addBlock('heading2')}>Heading 2</MenuItem>
          <MenuItem onClick={() => addBlock('bullet_list')}>Bullet List</MenuItem>
          <MenuItem onClick={() => addBlock('numbered_list')}>Numbered List</MenuItem>
          
          <MuiDivider />
          
          {/* Media & Code */}
          <MenuItem onClick={() => addBlock('image')}>Image</MenuItem>
          <MenuItem onClick={() => addBlock('equation')}>Math Equation</MenuItem>
          <MenuItem onClick={() => addBlock('code')}>Code Block</MenuItem>
          
          <MuiDivider />

          {/* Layout & Structure */}
          <MenuItem onClick={() => addBlock('divider')}>Horizontal Divider</MenuItem>
          <MenuItem onClick={() => addBlock('spacer')}>Empty Spacer</MenuItem>
          <MenuItem onClick={() => addBlock('columns', 2)}>2-Column Layout</MenuItem>
          <MenuItem onClick={() => addBlock('columns', 3)}>3-Column Layout</MenuItem>
          <MenuItem onClick={() => addBlock('columns', 4)}>4-Column Layout</MenuItem>
        
        </Menu>
      </Box>
    </Box>
  );
}