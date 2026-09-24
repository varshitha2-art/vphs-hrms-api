"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const error_1 = require("./middleware/error");
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
}));
// CORS
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', env_1.config.clientUrl, `http://localhost:${env_1.config.port}`, `http://127.0.0.1:${env_1.config.port}`],
    credentials: true,
}));
// Body parsers
app.use(express_1.default.json({ limit: '20mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '20mb' }));
// Static upload files
app.use('/uploads', express_1.default.static(env_1.config.uploadDir));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), app: 'VPHS Services ERP' });
});
// API Routes
app.use('/api', routes_1.default);
// Resolve client build path (supports running from root, server directory, or compiled dist)
const candidatePaths = [
    path_1.default.resolve(__dirname, '../../client/dist'),
    path_1.default.resolve(__dirname, '../../../client/dist'),
    path_1.default.resolve(process.cwd(), 'client/dist'),
    path_1.default.resolve(process.cwd(), '../client/dist'),
];
const clientDistPath = candidatePaths.find(p => fs_1.default.existsSync(p));
// Serve frontend static files if client build exists
if (clientDistPath && fs_1.default.existsSync(path_1.default.join(clientDistPath, 'index.html'))) {
    app.use(express_1.default.static(clientDistPath));
    // SPA fallback for client-side routing
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path_1.default.join(clientDistPath, 'index.html'));
    });
}
else {
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
app.use(error_1.errorHandler);
app.listen(env_1.config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 VPHS Services Pvt. Ltd. ERP Server is running!`);
    console.log(`📍 Port: ${env_1.config.port}`);
    console.log(`🌐 Environment: ${env_1.config.nodeEnv}`);
    console.log(`📁 Uploads Directory: ${env_1.config.uploadDir}`);
    console.log(`🔗 API Base: http://localhost:${env_1.config.port}/api`);
    console.log(`=======================================================`);
});
exports.default = app;
