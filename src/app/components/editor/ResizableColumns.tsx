// components/editor/ResizableColumns.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Box, IconButton, Menu, MenuItem, Tooltip, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragOverEvent, DragEndEvent, useDroppable
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { ColumnData, BlockType, Block } from '@/types/project'; // Adjust path if needed
import BlockEditor from './BlockEditor'; 

// 1. Wrapper for blocks INSIDE columns
function SortableColumnBlock({ block, onChange, onRemove, onInsertBelow }: { block: Block, onChange: (b: Block) => void, onRemove: () => void, onInsertBelow: (type: BlockType, cols?: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  return (
    <div 
      ref={setNodeRef} 
      style={{ 
        transform: CSS.Transform.toString(transform), 
        transition, 
        opacity: isDragging ? 0.4 : 1, 
        zIndex: isDragging ? 999 : 'auto', 
        position: 'relative' 
      }}
    >
      <BlockEditor block={block} onChange={onChange} onRemove={onRemove} onInsertBelow={onInsertBelow} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

// 2. 🔥 NEW: Droppable zone for the column itself (Allows dropping into empty columns!)
function ColumnDropZone({ id, width, children }: { id: string, width: number, children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <Box 
      ref={setNodeRef} 
      sx={{ 
        width: `${width}%`, 
        px: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '80px', // Crucial: Gives an empty column a physical area to drop onto
      }}
    >
      {children}
    </Box>
  );
}

export default function ResizableColumns({ columns, onChange }: { columns: ColumnData[], onChange: (cols: ColumnData[]) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{ isDragging: boolean, index: number }>({ isDragging: false, index: -1 });
  const [menuConfig, setMenuConfig] = useState<{ anchorEl: HTMLElement | null, colIndex: number }>({ anchorEl: null, colIndex: 0 });

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // --- Dynamic Resizing Logic ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !containerRef.current) return;
      const { index } = dragState; 
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const leftCol = columns[index];
      const rightCol = columns[index + 1];
      const combinedWidth = leftCol.width + rightCol.width;

      const totalWidthPx = containerRect.width;
      const mouseXPercentage = ((e.clientX - containerRect.left) / totalWidthPx) * 100;
      const widthBefore = columns.slice(0, index).reduce((acc, col) => acc + col.width, 0);
      let newLeftWidth = mouseXPercentage - widthBefore;
      
      newLeftWidth = Math.max(10, Math.min(newLeftWidth, combinedWidth - 10));
      const newRightWidth = combinedWidth - newLeftWidth;

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


  // --- 🔥 NEW: Cross-Column Drag Logic ---
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Helper to find which column an item belongs to
    const findColumnId = (id: string) => {
      if (columns.some(c => c.id === id)) return id; // Hovering over an empty column dropzone
      const col = columns.find(c => c.blocks.some(b => b.id === id)); // Hovering over a block inside a column
      return col ? col.id : null;
    };

    const activeColId = findColumnId(activeId);
    const overColId = findColumnId(overId);

    // Only proceed if moving to a DIFFERENT column
    if (!activeColId || !overColId || activeColId === overColId) return;

    const activeColIndex = columns.findIndex(c => c.id === activeColId);
    const overColIndex = columns.findIndex(c => c.id === overColId);

    const activeItems = [...columns[activeColIndex].blocks];
    const overItems = [...columns[overColIndex].blocks];

    const activeIndex = activeItems.findIndex(b => b.id === activeId);
    const overIndex = overItems.findIndex(b => b.id === overId);

    const itemToMove = activeItems[activeIndex];

    // Remove from old column
    activeItems.splice(activeIndex, 1);

    // Add to new column
    let newIndex;
    if (overId === overColId) {
      // Dropping directly onto the empty column
      newIndex = overItems.length;
    } else {
      newIndex = overIndex >= 0 ? overIndex : overItems.length;
    }
    overItems.splice(newIndex, 0, itemToMove);

    const newCols = [...columns];
    newCols[activeColIndex] = { ...newCols[activeColIndex], blocks: activeItems };
    newCols[overColIndex] = { ...newCols[overColIndex], blocks: overItems };

    onChange(newCols);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const findColumnId = (id: string) => {
      if (columns.some(c => c.id === id)) return id;
      const col = columns.find(c => c.blocks.some(b => b.id === id));
      return col ? col.id : null;
    };

    const activeColId = findColumnId(activeId);
    const overColId = findColumnId(overId);

    // Only sort if dropped in the SAME column (Cross-column transfers happen in DragOver!)
    if (!activeColId || !overColId || activeColId !== overColId) return;

    const colIndex = columns.findIndex(c => c.id === activeColId);
    const activeIndex = columns[colIndex].blocks.findIndex(b => b.id === activeId);
    const overIndex = columns[colIndex].blocks.findIndex(b => b.id === overId);

    if (activeIndex !== overIndex) {
      const newCols = [...columns];
      newCols[colIndex] = {
        ...newCols[colIndex],
        blocks: arrayMove(newCols[colIndex].blocks, activeIndex, overIndex)
      };
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
      
      {/* 🔥 ONE Global DndContext for the whole column row */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        {columns.map((col, colIdx) => (
          <React.Fragment key={col.id}>
            
            {/* 🔥 Custom Droppable Column Wrapper */}
            <ColumnDropZone id={col.id} width={col.width}>
              <SortableContext id={col.id} items={col.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
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
                    onInsertBelow={(type, _childCols) => {
                      const newBlock: Block = { id: uuidv4(), type, content: '' };
                      const newCols = [...columns];
                      newCols[colIdx].blocks.splice(bIdx + 1, 0, newBlock);
                      onChange(newCols);
                    }}
                  />
                ))}
              </SortableContext>

              <Box sx={{ mt: 'auto', textAlign: 'center', pt: 1 }}>
                <Tooltip title="Add block">
                  <IconButton onClick={(e) => setMenuConfig({ anchorEl: e.currentTarget, colIndex: colIdx })} size="small">
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </ColumnDropZone>

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
      </DndContext>

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
