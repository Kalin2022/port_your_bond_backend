"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts - Main server entry point
const express = __importStar(require("express"));
const processRoute_1 = __importDefault(require("./processRoute"));
const stripeWebhook_1 = require("./stripeWebhook");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 10000;
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files
app.use('/ui', express.static(path.join(__dirname, '../ui_preview')));
app.use('/output', express.static(path.join(__dirname, '../outputs')));
// Routes
app.use('/', processRoute_1.default);
app.post('/stripe-webhook', stripeWebhook_1.stripeWebhook);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Serve UI preview
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../ui_preview/index.html'));
});
app.listen(PORT, () => {
    console.log(`🚀 Port Your Bond server running on port ${PORT}`);
    console.log(`📱 UI Preview: http://localhost:${PORT}`);
    console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
});
