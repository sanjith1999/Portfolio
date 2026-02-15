'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, Container, Drawer, Fab, Grid, IconButton, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText,
  Paper, Typography, useMediaQuery, useTheme, Zoom,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CircleIcon from '@mui/icons-material/Circle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { BlockMath } from 'react-katex';

import { Project, Section, SubSection, Column } from '@/app/data/projectsData';
import { useProjectStore } from '@/store/public-project-store';
import LoadingBackdrop from './LoadingBackdrop';

export default function ProjectPreview() {
  const drawerWidth = 240;
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const getProject = useProjectStore((state) => state.getProjectById);
  const [project, setProject] = useState<Project | null>(getProject(id || '') ?? null);
  const [open, setOpen] = useState(false);
  const [loadingProject, setProjectLoading] = useState(false);

  const handleScroll = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // Filter sections that should appear in the TOC
  const tocSections = project.sections.filter((sec) => sec.showInToc !== false);

  // Helper to render Column/Widget content cleanly
  const renderColumnContent = (col: Column) => {
    switch (col.type) {
      case 'text':
        return <Typography>{col.content}</Typography>;
      
      case 'paragraphs':
        const paras = Array.isArray(col.content) ? col.content : [col.content];
        return paras.map((p, i) => (
          <Typography key={i} sx={{ mb: 2 }}>{p}</Typography>
        ));

      case 'image':
        return (
          <Box component="img" src={col.content as string} alt="" sx={{ width: '100%', borderRadius: 2 }} />
        );

      case 'points':
        const points = Array.isArray(col.content) ? col.content : [col.content];
        return (
          <List sx={{ pt: 0 }}>
            {points.map((pt, i) => (
              <ListItem key={i} sx={{ py: 0.5, alignItems: 'flex-start' }}> {/* Fixed spacing here */}
                <ListItemIcon sx={{ minWidth: 28, mt: 0.8 }}>
                  <CircleIcon sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary={pt} primaryTypographyProps={{ sx: { wordBreak: 'break-word' } }} />
              </ListItem>
            ))}
          </List>
        );

      case 'equation':
        const equations = Array.isArray(col.content) ? col.content : [col.content];
        return (
          <Box sx={{ my: 2, textAlign: 'center', overflowX: 'auto' }}>
            {equations.map((line, i) => (
              <BlockMath key={i} math={line as string} />
            ))}
          </Box>
        );

      case 'blank':
        return <Box sx={{ minHeight: '20px' }} />; // Empty spacer

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100vh', overflow: 'hidden' }}>
      
      {/* Sidebar TOC */}
      {isSmallScreen ? (
        <Drawer anchor="left" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: drawerWidth } }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>{project.title}</Typography>
            <List>
              {tocSections.map((sec) => (
                <ListItemButton key={sec.id} onClick={() => { handleScroll(sec.id); setOpen(false); }}>
                  <ListItemText primary={sec.heading} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Drawer>
      ) : (
        <Box sx={{ width: open ? drawerWidth : 0, transition: 'width 0.3s', bgcolor: 'background.paper', flexShrink: 0, borderRight: open ? '1px solid #ddd' : 'none', overflow: 'hidden' }}>
          <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #ddd' }}>
              <Typography variant="h6" noWrap>{project.title}</Typography>
              <IconButton onClick={() => setOpen(false)}><ChevronLeftIcon /></IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
              <List>
                {tocSections.map((sec) => (
                  <ListItemButton key={sec.id} onClick={() => handleScroll(sec.id)}>
                    <ListItemText primary={sec.heading} />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, width: '100%', height: '100%', overflowY: 'auto', p: { xs: 2, md: 4 }, scrollBehavior: 'smooth' }}>
        
        {/* Header Toggle */}
        {!open && !isSmallScreen && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => setOpen(true)}><MenuIcon /></IconButton>
            <Typography variant="h4" sx={{ ml: 2, fontWeight: 'bold' }}>{project.title}</Typography>
          </Box>
        )}
        {isSmallScreen && <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>{project.title}</Typography>}

        {/* Render Sections */}
        <Grid container spacing={4}>
          {project.sections.map((section: Section) => (
            <Grid size={{ xs: 12}} key={section.id}>
              <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 2, scrollMarginTop: '80px' }} id={section.id}>
                
                <Typography variant="h4" gutterBottom fontWeight="600" color="primary.main">
                  {section.heading}
                </Typography>

                {/* Legacy Main Content & Image Layout */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
                  <Box sx={{ flex: 1 }}>
                    {section.content?.map((para, i) => (
                      <Typography key={i} sx={{ mb: 2, lineHeight: 1.7, color: 'text.secondary' }}>{para}</Typography>
                    ))}
                  </Box>
                  {section.image && (
                    <Box component="img" src={section.image} alt="" sx={{ flex: 1, width: '100%', maxWidth: 400, borderRadius: 2, objectFit: 'cover', alignSelf: 'flex-start' }} />
                  )}
                </Box>

                {/* Section Columns (The "Widgets") */}
                {section.columns && section.columns.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                    {section.columns.map((col, idx) => (
                      <Box key={idx} sx={{ p: 2, border: col.type !== 'blank' ? '1px solid #eee' : 'none', borderRadius: 2, width: { xs: '100%', md: `calc(${col.width || 100}% - 12px)` }, boxSizing: 'border-box', bgcolor: col.type !== 'blank' ? '#fafafa' : 'transparent' }}>
                        {renderColumnContent(col)}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Subsections */}
                {(section.subSections?.length ?? 0) > 0 && section.subSections?.map((sub: SubSection) => (
                  <Box key={sub.id} sx={{ mt: 4, pt: 3, borderTop: '1px dashed #ccc' }}>
                    {sub.heading && <Typography variant="h5" gutterBottom>{sub.heading}</Typography>}
                    
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                      <Box sx={{ flex: 1 }}>
                        {sub.content?.map((para, i) => (
                          <Typography key={i} sx={{ mb: 2, lineHeight: 1.7 }}>{para}</Typography>
                        ))}
                        
                        {sub.points && sub.points.length > 0 && (
                          <List>
                            {sub.points.map((point, idx) => (
                              <ListItem key={idx} sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}><CircleIcon sx={{ fontSize: 8 }} /></ListItemIcon>
                                <ListItemText primary={point} />
                              </ListItem>
                            ))}
                          </List>
                        )}

                        {sub.equation && (
                          <Box sx={{ my: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, overflowX: 'auto' }}>
                            <BlockMath math={sub.equation} />
                          </Box>
                        )}
                      </Box>

                      {sub.image && (
                        <Box component="img" src={sub.image} alt="" sx={{ flex: 1, maxWidth: 350, width: '100%', borderRadius: 2, objectFit: 'contain', alignSelf: 'flex-start' }} />
                      )}
                    </Box>

                    {/* Subsection Columns */}
                    {sub.columns && sub.columns.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 3 }}>
                        {sub.columns.map((col, idx) => (
                          <Box key={idx} sx={{ p: 2, border: col.type !== 'blank' ? '1px solid #eee' : 'none', borderRadius: 2, width: { xs: '100%', md: `calc(${col.width || 100}% - 12px)` }, boxSizing: 'border-box' }}>
                            {renderColumnContent(col)}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Mobile Drawer Toggle Fab */}
      <Zoom in>
        <Fab color="primary" onClick={() => setOpen(!open)} sx={{ position: 'fixed', left: 24, bottom: 32, zIndex: 1200 }}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </Fab>
      </Zoom>
    </Box>
  );
}