// server/vite.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

let viteLogger;

function log(message, source = 'express') {
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

async function setupVite(app, server) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('setupVite should only be called in development mode');
  }

  const vite = require('vite');
  if (!viteLogger) {
    viteLogger = vite.createLogger();
  }

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const viteServer = await vite.createServer({
    server: serverOptions,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    appType: 'custom',
  });

  app.use(viteServer.middlewares);

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(__dirname, '..', 'client', 'index.html');
      let template = await fs.promises.readFile(clientTemplate, 'utf-8');
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await viteServer.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(page);
    } catch (e) {
      viteServer.ssrFixStacktrace(e);
      next(e);
    }
  });
}

function serveStatic(app) {
  const distPath = path.resolve(__dirname, 'dist', 'public');
  if (!fs.existsSync(distPath)) {
    console.error(`Build directory not found: ${distPath}. Skipping static file serving.`);
    return;
  }
  app.use(express.static(distPath));
  app.use('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

module.exports = { log, setupVite, serveStatic };