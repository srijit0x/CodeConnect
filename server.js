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
    if (res) {
      return res.status(401).send("Access Denied");
    } else {
      console.error("Access Denied: No Token Provided");
      if (req.socket) req.socket.destroy();
      return;
    }
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    if (res) {
      res.status(400).send("Invalid Token");
    } else {
      console.error("Authentication Error: Invalid Token");
      if (req.socket) req.socket.destroy();
    }
  }
};

server.on('upgrade', (request, socket, head) => {
  authenticate(request, null, () => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    }).on('error', (error) => {
      console.error("WebSocket handleUpgrade error:", error.message);
      socket.destroy();
    });
  });
});

wss.on('connection', (ws, req) => {
  if (!req.user) {
    console.error('Connection Terminated: Authentication Failed');
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
      try {
        if (id !== userId) {
          userWs.send(message);
        }
      } catch (e) {
        console.error(`Error sending message to user ${id}: ${e.message}`);
      }
    });
  });

  ws.on('close', () => {
    delete sessions[sessionId].users[userId];
    if (Object.keys(sessions[sessionId].users).length === 0) {
      delete sessions[sessionId];
    }
  });

  ws.on('error', err => {
    console.error(`WebSocket error for user ${userId}: ${err.message}`);
    try {
      ws.terminate();
    } catch (error) {
      console.error(`Error terminating WebSocket for user ${userId}: ${error.message}`);
    }
  });
});

server.on('error', (err) => {
  console.error(`Server Error: ${err.message}`);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});