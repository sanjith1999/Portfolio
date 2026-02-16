// components/editor/ResizableColumns.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Box, IconButton, Menu, MenuItem, Tooltip, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { ColumnData, BlockType, Block } from '@/app/data/projectsData'; // Update path if needed
import BlockEditor from './BlockEditor'; 

// Wrapper for blocks INSIDE columns
function SortableColumnBlock({ 
  block, onChange, onRemove, onInsertBelow 
}: { 
  block: Block, onChange: (b: Block) => void, onRemove: () => void, onInsertBelow: (type: BlockType, cols?: number) => void 
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <BlockEditor block={block} onChange={onChange} onRemove={onRemove} onInsertBelow={onInsertBelow} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

export default function ResizableColumns({ columns, onChange }: { columns: ColumnData[], onChange: (cols: ColumnData[]) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{ isDragging: boolean, index: number }>({ isDragging: false, index: -1 });
  const [menuConfig, setMenuConfig] = useState<{ anchorEl: HTMLElement | null, colIndex: number }>({ anchorEl: null, colIndex: 0 });

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // --- Dynamic Resizing Logic for N columns ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !containerRef.current) return;
      const { index } = dragState; // index of the resizer being dragged
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const leftCol = columns[index];
      const rightCol = columns[index + 1];
      const combinedWidth = leftCol.width + rightCol.width;

      // Calculate relative position of mouse inside the combined space of the two columns
      let totalWidthPx = containerRect.width;
      let mouseXPercentage = ((e.clientX - containerRect.left) / totalWidthPx) * 100;
      
      // Calculate how much width comes BEFORE the current pair of columns
      let widthBefore = columns.slice(0, index).reduce((acc, col) => acc + col.width, 0);
      let newLeftWidth = mouseXPercentage - widthBefore;
      
      // Constrain widths so they don't crush each other (min 10%)
      newLeftWidth = Math.max(10, Math.min(newLeftWidth, combinedWidth - 10));
      let newRightWidth = combinedWidth - newLeftWidth;

      const newCols = [...columns];
      newCols[index] = { ...leftCol, width: newLeftWidth };
      newCols[index + 1] = { ...rightCol, width: newRightWidth };
      onChange(newCols);
    };

    const handleMouseUp = () => setDragState({ isDragging: false, index: -1 });
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; 
    } else {
      document.body.style.userSelect = '';
    }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [dragState, columns, onChange]);

  // --- Drag and Drop Logic INSIDE the column ---
  const handleDragEnd = (event: any, colIndex: number) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const col = columns[colIndex];
      const oldIndex = col.blocks.findIndex(i => i.id === active.id);
      const newIndex = col.blocks.findIndex(i => i.id === over.id);
      
      const newCols = [...columns];
      newCols[colIndex] = { ...col, blocks: arrayMove(col.blocks, oldIndex, newIndex) };
      onChange(newCols);
    }
  };

  const handleAddBlock = (type: BlockType) => {
    const newCols = [...columns];
    newCols[menuConfig.colIndex].blocks.push({ id: uuidv4(), type, content: '' });
    onChange(newCols);
    setMenuConfig({ anchorEl: null, colIndex: 0 });
  };

  return (
    <Box ref={containerRef} sx={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
      {columns.map((col, colIdx) => (
        <React.Fragment key={col.id}>
          {/* COLUMN BODY */}
          <Box sx={{ width: `${col.width}%`, px: 1, display: 'flex', flexDirection: 'column' }}>
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, colIdx)}>
              <SortableContext items={col.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {col.blocks.map((b, bIdx) => (
                  <SortableColumnBlock 
                    key={b.id} 
                    block={b} 
                    onChange={(updated: Block) => {
                      const newCols = [...columns];
                      newCols[colIdx].blocks[bIdx] = updated;
                      onChange(newCols);
                    }} 
                    onRemove={() => {
                      const newCols = [...columns];
                      newCols[colIdx].blocks.splice(bIdx, 1);
                      onChange(newCols);
                    }} 
                    onInsertBelow={(type, cols) => {
                      // Inserts a new block inside the column!
                      const newBlock: Block = { id: uuidv4(), type, content: '' };
                      const newCols = [...columns];
                      newCols[colIdx].blocks.splice(bIdx + 1, 0, newBlock);
                      onChange(newCols);
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <Box sx={{ mt: 'auto', textAlign: 'center', pt: 1 }}>
              <Tooltip title="Add block">
                <IconButton onClick={(e) => setMenuConfig({ anchorEl: e.currentTarget, colIndex: colIdx })} size="small">
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* RESIZER (Don't render after the last column) */}
          {colIdx < columns.length - 1 && (
            <Box
              onMouseDown={(e) => { e.preventDefault(); setDragState({ isDragging: true, index: colIdx }); }}
              sx={{
                width: '8px', cursor: 'col-resize', display: 'flex', justifyContent: 'center', zIndex: 10,
                '&::after': { content: '""', height: '100%', width: '2px', backgroundColor: dragState.isDragging && dragState.index === colIdx ? '#1976d2' : '#e0e0e0' },
                '&:hover::after': { backgroundColor: '#1976d2' }
              }}
            />
          )}
        </React.Fragment>
      ))}

      {/* Shared Add Menu inside Columns */}
      <Menu anchorEl={menuConfig.anchorEl} open={Boolean(menuConfig.anchorEl)} onClose={() => setMenuConfig({ anchorEl: null, colIndex: 0 })}>
        <MenuItem onClick={() => handleAddBlock('paragraph')}>Text Paragraph</MenuItem>
        <MenuItem onClick={() => handleAddBlock('heading2')}>Heading 2</MenuItem>
        <MenuItem onClick={() => handleAddBlock('bullet_list')}>Bullet List</MenuItem>
        <MenuItem onClick={() => handleAddBlock('numbered_list')}>Numbered List</MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAddBlock('image')}>Image</MenuItem>
        <MenuItem onClick={() => handleAddBlock('equation')}>Math Equation</MenuItem>
        <MenuItem onClick={() => handleAddBlock('code')}>Code Block</MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAddBlock('divider')}>Divider</MenuItem>
        <MenuItem onClick={() => handleAddBlock('spacer')}>Spacer</MenuItem>
      </Menu>
    </Box>
  );
}