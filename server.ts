import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;
const rootDir = process.cwd();

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Artscent' });
});

// Root redirects to Home page
app.get('/', (req, res) => {
  res.redirect('/Home/index.html');
});

app.get('/Home', (req, res) => {
  res.redirect('/Home/index.html');
});

app.get('/Products', (req, res) => {
  res.redirect('/Products/products.html');
});

app.get('/About', (req, res) => {
  res.redirect('/About/about.html');
});

app.get('/Contact', (req, res) => {
  res.redirect('/Contact/contact.html');
});

app.get('/Checkout', (req, res) => {
  res.redirect('/Checkout/index.html');
});

app.get('/admin', (req, res) => {
  res.redirect('/admin/index.html');
});

// Serve static assets from workspace
app.use(express.static(rootDir));

// Fallback to Home
app.use((req, res) => {
  res.redirect('/Home/index.html');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Artscent server running on http://0.0.0.0:${PORT}`);
});
