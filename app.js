/**
 * VPHS Services Pvt. Ltd. - Unified All-in-One Application Entrypoint
 * 
 * Runs the backend API and serves the production React frontend 
 * from a single Node.js process on http://localhost:5000
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const rootDir = __dirname;
const clientDist = path.join(rootDir, 'client', 'dist');
const serverDist = path.join(rootDir, 'server', 'dist', 'server.js');

console.log('=======================================================');
console.log('🏢 VPHS Services Pvt. Ltd. ERP System - Single Launcher');
console.log('=======================================================');

// Check if client dist exists; build if missing
if (!fs.existsSync(path.join(clientDist, 'index.html'))) {
  console.log('📦 Frontend build not found. Building client bundle (this takes ~15s)...');
  try {
    execSync('npm --prefix client run build', { stdio: 'inherit', cwd: rootDir });
    console.log('✅ Frontend build complete.');
  } catch (err) {
    console.error('❌ Failed to build client:', err.message);
    process.exit(1);
  }
}

// Check if server dist exists; build if missing
if (!fs.existsSync(serverDist)) {
  console.log('📦 Backend build not found. Compiling server TypeScript...');
  try {
    execSync('npm --prefix server run build', { stdio: 'inherit', cwd: rootDir });
    console.log('✅ Backend build complete.');
  } catch (err) {
    console.error('❌ Failed to build server:', err.message);
    process.exit(1);
  }
}

console.log('🚀 Starting unified server...');
const serverProcess = spawn('node', [serverDist], {
  stdio: 'inherit',
  cwd: rootDir,
  env: { ...process.env, PORT: process.env.PORT || '5000' }
});

serverProcess.on('close', (code) => {
  console.log(`Server stopped with code ${code}`);
  process.exit(code || 0);
});

// Handle graceful termination
process.on('SIGINT', () => {
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverProcess.kill('SIGTERM');
  process.exit(0);
});
