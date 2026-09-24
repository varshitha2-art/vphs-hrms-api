import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/error';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', config.clientUrl, `http://localhost:${config.port}`, `http://127.0.0.1:${config.port}`],
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static upload files
app.use('/uploads', express.static(config.uploadDir));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), app: 'VPHS Services ERP' });
});

// API Routes
app.use('/api', routes);

// Resolve client build path (supports running from root, server directory, or compiled dist)
const candidatePaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
];
const clientDistPath = candidatePaths.find(p => fs.existsSync(p));

// Serve frontend static files if client build exists
if (clientDistPath && fs.existsSync(path.join(clientDistPath, 'index.html'))) {
  app.use(express.static(clientDistPath));

  // SPA fallback for client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // If client is not yet built, provide status response
  app.get('/', (req, res) => {
    res.json({
      message: 'VPHS Services ERP Backend API is running.',
      frontend: 'Client build not detected. Run "npm run build" to compile and serve the frontend.',
      api: '/api',
      health: '/health',
    });
  });
}

// Centralized Error Handling
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 VPHS Services Pvt. Ltd. ERP Server is running!`);
  console.log(`📍 Port: ${config.port}`);
  console.log(`🌐 Environment: ${config.nodeEnv}`);
  console.log(`📁 Uploads Directory: ${config.uploadDir}`);
  console.log(`🔗 API Base: http://localhost:${config.port}/api`);
  console.log(`=======================================================`);
});

export default app;
