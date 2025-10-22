#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { WebSocketServer, WebSocket } from 'ws';
import { createToolDefinitions } from "./tools.js";
import { setupRequestHandlers } from "./requestHandler.js";

// Custom WebSocket Transport implementation
class WebSocketTransport implements Transport {
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  async start(): Promise<void> {
    // WebSocket is already connected, nothing to do
    return Promise.resolve();
  }

  async send(message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not open'));
        return;
      }
      
      const data = JSON.stringify(message);
      this.ws.send(data, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.ws.readyState === WebSocket.CLOSED) {
        resolve();
        return;
      }
      
      this.ws.once('close', () => resolve());
      this.ws.close();
    });
  }

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: any) => void;
}

async function runServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
  
  const wss = new WebSocketServer({ 
    port: PORT,
    host: '0.0.0.0'
  });

  console.log(`WebSocket MCP Server listening on ws://0.0.0.0:${PORT}`);

  wss.on('connection', async (ws) => {
    console.log('New client connected');

    const server = new Server(
      {
        name: "playwright-mcp",
        version: "1.0.6",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    // Create tool definitions
    const TOOLS = createToolDefinitions();

    // Setup request handlers
    setupRequestHandlers(server, TOOLS);

    // Create custom WebSocket transport
    const transport = new WebSocketTransport(ws);

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (transport.onmessage) {
          transport.onmessage(message);
        }
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      console.log('Client disconnected');
      if (transport.onclose) {
        transport.onclose();
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (transport.onerror) {
        transport.onerror(error);
      }
    });

    try {
      await server.connect(transport);
      console.log('Server connected to client');
    } catch (error) {
      console.error('Failed to connect server:', error);
      ws.close();
    }
  });

  // Graceful shutdown logic
  function shutdown() {
    console.log('Shutting down server...');
    wss.close(() => {
      console.log('WebSocket server closed');
      process.exit(0);
    });
    
    // Force exit after 5 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('Forced shutdown');
      process.exit(1);
    }, 5000);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});