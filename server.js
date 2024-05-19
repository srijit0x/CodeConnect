require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sessions = {};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token || req.cookies.token;

  if (!token) {
    return res.status(401).send("Access Denied");
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

server.on('upgrade', (request, socket, head) => {
  authenticate(request, null, () => {
    wss.handleUpgrade(request, socket, head, ws => {
      wss.emit('connection', ws, request);
    });
  });
});

wss.on('connection', (ws, req) => {
  if (!req.user) {
    return ws.terminate();
  }

  const userId = req.user.id;
  const sessionId = "defaultSession";

  if (!sessions[sessionId]) {
    sessions[sessionId] = { users: {} };
  }
  sessions[sessionId].users[userId] = ws;

  ws.on('message', (message) => {
    Object.entries(sessions[sessionId].users).forEach(([id, userWs]) => {
      if (id !== userId) {
        userWs.send(message);
      }
    });
  });

  ws.on('close', () => {
    delete sessions[sessionId].users[userId];
    if (Object.keys(sessions[sessionId].users).length === 0) {
      delete sessions[sessionId];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});