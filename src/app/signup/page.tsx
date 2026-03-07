'use client';

import React, { useState } from 'react';
import { notFound, useRouter } from 'next/navigation'; // Import notFound
import { Container, TextField, Button, Typography, Box, Paper } from '@mui/material';
import axios from 'axios';

export default function SignupPage() {
  // 1. Guard check: Trigger the built-in 404 page if in production
  if (process.env.NODE_ENV !== "development") {
    notFound(); 
  }

  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async () => {
    try {
      await axios.post('/api/auth/signup', form);
      router.push('/login');
    } catch (err) {
      console.error(err);
      alert('Error creating user');
      console.log("Signup error details:", err); // Log detailed error info
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 6 }}>
        <Typography variant="h5" mb={2}>
          Create Account (Dev Mode Only)
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Email"
            fullWidth
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Button variant="contained" onClick={handleSubmit}>
            Sign Up
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}