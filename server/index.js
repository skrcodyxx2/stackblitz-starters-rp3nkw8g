import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import companyRoutes from './routes/company.js';
import galleryRoutes from './routes/gallery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/gallery', galleryRoutes);

// Servir les fichiers statiques du build
app.use(express.static(path.join(__dirname, '../dist')));

// Route catch-all pour le SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📱 Application disponible sur: http://localhost:${PORT}`);
});