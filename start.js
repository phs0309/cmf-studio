#!/usr/bin/env node

// Simple start script for Render deployment
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting CMF Studio...');

// Change to server directory and start the server
process.chdir(path.join(__dirname, 'server'));

const child = spawn('node', ['index.js'], {
  stdio: 'inherit',
  env: { ...process.env }
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code || 0);
});