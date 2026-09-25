import http from 'http';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'mock-gemini' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log(`[Mock Gemini] Connection received: ${req.url}`);
  ws.on('message', (data) => {
    console.log('[Mock Gemini] Frame received');
  });
  ws.on('close', () => {
    console.log('[Mock Gemini] Connection closed');
  });
});

server.listen(PORT, () => {
  console.log(`[Mock Gemini] Server listening on port ${PORT}`);
});
