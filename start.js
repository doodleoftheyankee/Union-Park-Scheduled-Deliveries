import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Start the Express API server
const server = await import('./server/index.js');

// Start Vite dev server
const vite = spawn(process.execPath, [
  path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js'),
  '--host'
], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env }
});

vite.on('error', (err) => {
  console.error('Failed to start Vite:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  vite.kill();
  process.exit(0);
});
