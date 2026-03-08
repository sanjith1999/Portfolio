'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';

// ✅ MUI imports
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import axios from 'axios';
import LoadingBackdrop from '../components/LoadingBackdrop';
import ProjectCardSkeleton from '../components/ProjectSkeliton';
import { useProjectStore } from '@/store/project-store';

export default function AllProjects() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [loadingProjects, setLoadingProjects] = useState(false);

  const router = useRouter();

  // const handleViewDetails = (projectId: string | number) => {
  //   window.scrollTo(0, 0);
  //   router.push(`/project/${projectId}`);
  // };
  const handleViewDetails = (projectId: string | undefined) => {
    setLoading(true);
    window.scrollTo(0, 0);

    router.push(`/project/${projectId}`);
  };

  const allProjects = useProjectStore((state) => state.publicProjects);
  const setProjects = useProjectStore((state) => state.setProjects);

  const fetchAll = useCallback(async () => {
    if (!allProjects || allProjects.length === 0) {
      try {
        setLoadingProjects(true);
        const res = await axios.get('/api/projects/visible');
        setProjects('public', res.data.items ?? []);
      } finally {
        setLoadingProjects(false);
      }
    }
  }, [allProjects, setProjects]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    // This runs only when the page mounts
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('hide-loader'));
    }
  }, []);

  // Filter projects
  const filteredProjects = allProjects.filter((project) => {
    const matchesFilter = filter === 'all' || project.technologies.includes(filter);
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleBackToHome = () => {
    router.push('/'); // navigate to home
  };

  // Get unique technologies for filter
  const allTechnologies = [...new Set(allProjects.flatMap((project) => project.technologies))];

  return (
    <Box sx={{ p: 3 }}>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar>
          {/* Home icon */}
          <IconButton edge="start" color="inherit" onClick={handleBackToHome} sx={{ mr: 2 }}>
            <HomeIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleBackToHome}>← Back to Home</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ height: '30px' }}></Box>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        {/* <Button onClick={handleBackToHome} variant="outlined" sx={{ mb: 2 }}>
          ← Back to Home
        </Button> */}
        <Typography variant="h4" gutterBottom>
          All Ideas
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Explore my complete portfolio of work and projects
        </Typography>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <TextField
          label="Search projects..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Tech</InputLabel>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} label="Filter by Tech">
            <MenuItem value="all">All Technologies</MenuItem>
            {allTechnologies.map((tech) => (
              <MenuItem key={tech} value={tech}>
                {tech}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Stats */}
      <Typography variant="body2" sx={{ textAlign: 'center', mb: 2, color: 'text.secondary' }}>
        Showing {filteredProjects.length} of {allProjects.length} projects
      </Typography>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {loadingProjects
          ? Array.from(new Array(3)).map((_, index) => (
              <Grid key={index} size={{ xs: 12 }}>
                <ProjectCardSkeleton />
              </Grid>
            ))
          : filteredProjects.map((project) => (
              <Grid size={{ xs: 12 }} key={project._id?.toString()}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    boxShadow: 3,
                    borderRadius: 3,
                    overflow: 'hidden',
                    p: 2, // ✅ padding inside card
                    m: 1, // ✅ margin between cards
                    gap: 2, // ✅ space between image & content
                  }}
                >
                  {/* Image */}

                  <CardMedia
                    component="img"
                    sx={{ width: { xs: '100%', sm: 250 }, height: 200 }}
                    image={project.image}
                    alt={project.title}
                  />
                  {/* Content */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {project.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {project.duration} • {project.role}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {project.description}
                      </Typography>

                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {project.technologies.map((tech: string, index: number) => (
                          <Typography
                            key={index}
                            variant="caption"
                            sx={(theme) => ({
                              px: 1,
                              py: 0.3,
                              borderRadius: '8px',
                              bgcolor:
                                theme.palette.mode === 'light'
                                  ? theme.palette.grey[200] // light mode background
                                  : theme.palette.grey[800], // dark mode background
                              color: theme.palette.text.primary,
                            })}
                          >
                            {tech}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>

                    {/* Actions */}
                    <CardActions>
                      <Button size="small" onClick={() => handleViewDetails(project._id)}>
                        View Details →
                      </Button>
                      {project.liveLink && (
                        <Button
                          size="small"
                          component="a"
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live Demo
                        </Button>
                      )}
                      {project.githubLink && (
                        <Button
                          size="small"
                          component="a"
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Source Code
                        </Button>
                      )}
                    </CardActions>
                  </Box>
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* Empty State */}
      {!loadingProjects && filteredProjects.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">No projects found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}
      <LoadingBackdrop open={loading} />
    </Box>
  );
}
