'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, Container, Drawer, Fab, IconButton, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText,
  Paper, Typography, useMediaQuery, useTheme, Zoom,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CircleIcon from '@mui/icons-material/Circle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { BlockMath } from 'react-katex';

import 'react-quill-new/dist/quill.snow.css'; 

import { Project, Block } from '@/app/data/projectsData'; 
import { useProjectStore } from '@/store/public-project-store';
import LoadingBackdrop from './LoadingBackdrop';

// Fallback helper function to strip HTML tags for the TOC
// (In case a heading accidentally saved as HTML from the previous version)
const stripHtml = (html?: string | string[]) => {
  if (!html) return '';
  const str = Array.isArray(html) ? html.join(' ') : html;
  return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
};

export default function ProjectPreview() {
  const drawerWidth = 260;
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const getProject = useProjectStore((state) => state.getProjectById);
  const [project, setProject] = useState<Project | null>(getProject(id || '') ?? null);
  const [open, setOpen] = useState(false);
  const [loadingProject, setProjectLoading] = useState(false);

  const handleScroll = (blockId: string) => {
    const element = document.getElementById(blockId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (isSmallScreen) setOpen(false);
  };

  useEffect(() => {
    if (!id || project) return;
    async function fetchProject() {
      setProjectLoading(true);
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error('Failed to fetch project');
        const data = await res.json();
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setProjectLoading(false);
      }
    }
    fetchProject();
  }, [id, project]);

  if (!project) return <Container sx={{ py: 8 }}><Typography>Loading project...</Typography></Container>;
  if (loadingProject) return <LoadingBackdrop open={loadingProject} />;

  const blocks = project.blocks || [];
  const tocHeadings = blocks.filter(b => b.type === 'heading1' || b.type === 'heading2');

  const renderBlock = (block: Block) => {
    const content = block.content || '';
    
    switch (block.type) {
      // PLAIN TEXT HEADINGS (No inner HTML)
      case 'heading1':
        return (
          <Typography 
            key={block.id} id={block.id} variant="h4" 
            sx={{ p: 0, mt: 5, mb: 2, fontWeight: 'bold', scrollMarginTop: '80px', color: 'primary.main' }} 
          >
            {stripHtml(content as string)}
          </Typography>
        );
      
      case 'heading2':
        return (
          <Typography 
            key={block.id} id={block.id} variant="h5" 
            sx={{ p: 0, mt: 4, mb: 2, fontWeight: '600', scrollMarginTop: '80px' }} 
          >
            {stripHtml(content as string)}
          </Typography>
        );

      // RICH TEXT PARAGRAPH
      case 'paragraph':
        return (
          <Box 
            key={block.id} 
            className="ql-editor" // Applies Quill formats
            sx={{ 
              p: 0, mb: 2, lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'justify', 
              '& p': { textAlign: 'justify', m: 0 }, 
              '& a': { color: '#1976d2' } 
            }} 
            dangerouslySetInnerHTML={{ __html: content as string }} 
          />
        );

      // LISTS (Standard, no rich text)
      case 'bullet_list':
      case 'numbered_list':
        const listItems = Array.isArray(content) ? content : [content];
        return (
          <List key={block.id} component={block.type === 'numbered_list' ? 'ol' : 'ul'} sx={{ pl: block.type === 'numbered_list' ? 4 : 0, mb: 2, listStyleType: block.type === 'numbered_list' ? 'decimal' : 'none' }}>
            {listItems.map((item, idx) => (
              <ListItem key={idx} sx={{ py: 0.5, alignItems: 'flex-start', display: block.type === 'numbered_list' ? 'list-item' : 'flex' }}>
                {block.type === 'bullet_list' && (
                  <ListItemIcon sx={{ minWidth: 28, mt: 1 }}>
                    <CircleIcon sx={{ fontSize: 8, color: 'text.secondary' }} />
                  </ListItemIcon>
                )}
                <ListItemText 
                   primary={item} 
                   primaryTypographyProps={{ sx: { fontSize: '1.1rem', lineHeight: 1.8 } }} 
                />
              </ListItem>
            ))}
          </List>
        );

      case 'image':
        return (
          <Box key={block.id} sx={{ my: 4, textAlign: block.props?.align || 'center' }}>
            <Box component="img" src={content as string} alt={block.props?.caption || "Project Image"} sx={{ maxWidth: '100%', borderRadius: 2, boxShadow: 1 }} />
            {block.props?.caption && (
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>{block.props.caption}</Typography>
            )}
          </Box>
        );

      case 'equation':
        const equations = Array.isArray(content) ? content : [content];
        return (
          <Box key={block.id} sx={{ my: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, overflowX: 'auto', textAlign: 'center' }}>
            {equations.map((line, i) => <BlockMath key={i} math={line as string} />)}
          </Box>
        );

      case 'columns':
        if (!block.columns || block.columns.length === 0) return null;
        return (
          <Box key={block.id} sx={{ display: 'flex', flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 3, my: 4 }}>
            {block.columns.map((col) => (
              <Box key={col.id} sx={{ width: { xs: '100%', md: `${col.width}%` }, boxSizing: 'border-box' }}>
                {col.blocks.map(nestedBlock => renderBlock(nestedBlock))}
              </Box>
            ))}
          </Box>
        );
      
      case 'code':
        return (
          <Box key={block.id} sx={{ my: 3, p: 2, bgcolor: '#1e1e1e', color: '#d4d4d4', borderRadius: 2, overflowX: 'auto', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            <pre style={{ margin: 0 }}>{content}</pre>
          </Box>
        );

      case 'divider':
        return <Box key={block.id} sx={{ my: 4, borderBottom: '2px solid #eee' }} />;

      case 'spacer':
        return <Box key={block.id} sx={{ height: '40px' }} />;

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100vh', overflow: 'hidden', bgcolor: '#fcfcfc' }}>
      
      {/* Sidebar TOC */}
      {isSmallScreen ? (
        <Drawer anchor="left" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: drawerWidth } }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>{project.title}</Typography>
            <List sx={{ mt: 2 }}>
              {tocHeadings.map((heading) => (
                <ListItemButton key={heading.id} onClick={() => handleScroll(heading.id)} sx={{ borderRadius: 1, mb: 0.5 }}>
                  <ListItemText 
                    primary={stripHtml(heading.content)} 
                    primaryTypographyProps={{ 
                      fontSize: heading.type === 'heading2' ? '0.9rem' : '1rem',
                      fontWeight: heading.type === 'heading1' ? '600' : '400',
                      ml: heading.type === 'heading2' ? 2 : 0, 
                      color: 'text.secondary'
                    }} 
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Drawer>
      ) : (
        <Box sx={{ width: open ? drawerWidth : 0, transition: 'width 0.3s ease', bgcolor: 'background.paper', flexShrink: 0, borderRight: open ? '1px solid #eee' : 'none', overflow: 'hidden', boxShadow: open ? '2px 0 10px rgba(0,0,0,0.03)' : 'none' }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid #eee' }}>
              <Typography variant="subtitle1" fontWeight="bold" noWrap>{project.title}</Typography>
              <IconButton onClick={() => setOpen(false)} size="small"><ChevronLeftIcon /></IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              <Typography variant="overline" color="text.disabled" sx={{ ml: 2 }}>Contents</Typography>
              <List>
                {tocHeadings.map((heading) => (
                  <ListItemButton key={heading.id} onClick={() => handleScroll(heading.id)} sx={{ borderRadius: 1, py: 0.5 }}>
                    <ListItemText 
                      primary={stripHtml(heading.content)} 
                      primaryTypographyProps={{ 
                        fontSize: heading.type === 'heading2' ? '0.85rem' : '0.95rem',
                        fontWeight: heading.type === 'heading1' ? '600' : '400',
                        ml: heading.type === 'heading2' ? 2 : 0,
                        color: heading.type === 'heading1' ? 'text.primary' : 'text.secondary'
                      }} 
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          </Box>
        </Box>
      )}

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, height: '100%', overflowY: 'auto', p: { xs: 2, md: 6 }, scrollBehavior: 'smooth' }}>
        {!open && !isSmallScreen && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 5, position: 'sticky', top: 0, bgcolor: '#fcfcfc', zIndex: 10, py: 2 }}>
            <IconButton onClick={() => setOpen(true)} sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f0f0f0' } }}>
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        <Container maxWidth="md" sx={{ mt: isSmallScreen ? 2 : 0 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 8 }, borderRadius: 4, bgcolor: 'white', minHeight: '80vh', border: '1px solid #f0f0f0' }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
              {project.title}
            </Typography>
            
            {project.image && (
              <Box component="img" src={project.image} sx={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: 3, mb: 6 }} />
            )}

            {blocks.map((block) => renderBlock(block))}
            
            {blocks.length === 0 && (
              <Typography color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', mt: 10 }}>
                This project has no content blocks yet.
              </Typography>
            )}
          </Paper>
        </Container>
      </Box>

      <Zoom in={isSmallScreen}>
        <Fab color="primary" onClick={() => setOpen(!open)} sx={{ position: 'fixed', left: 24, bottom: 32, zIndex: 1200 }}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </Fab>
      </Zoom>
    </Box>
  );
}