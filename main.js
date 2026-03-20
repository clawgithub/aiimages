const { app, BrowserWindow, session, shell, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// Serve the app over localhost so puter.js works correctly.
// puter.js requires an HTTP/HTTPS origin — it breaks silently on file://.
function startServer(startPort) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/') urlPath = '/index.html';

      const filePath = path.join(__dirname, urlPath);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });

    const tryPort = (port) => {
      server.once('error', () => tryPort(port + 1));
      server.listen(port, '127.0.0.1', () => resolve({ server, port }));
    };
    tryPort(startPort);
  });
}

async function createWindow() {
  const { port } = await startServer(8766);
  const isDev = !app.isPackaged;

  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 500,
    minHeight: 400,
    title: 'AI Image Generator & Editor',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    show: false,
  });

  // Permissive CSP for our localhost origin only
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (details.url.startsWith(`http://localhost:${port}`)) {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self' https: data: blob:; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.puter.com https://*.puter.com; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: blob: https:; " +
            "connect-src 'self' https: wss:; " +
            "frame-src 'self' https://*.puter.com https://puter.com;"
          ],
        },
      });
    } else {
      callback({ responseHeaders: details.responseHeaders });
    }
  });

  // Puter auth popup must open inside Electron (not the system browser)
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('puter.com') && url.includes('embedded_in_popup=true')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 500,
          height: 620,
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
          },
        },
      };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  ipcMain.on('open-external', (_event, url) => {
    shell.openExternal(url);
  });

  win.loadURL(`http://localhost:${port}`);

  win.once('ready-to-show', () => {
    win.show();
    // Open DevTools automatically in dev mode so you can see console output
    if (isDev) win.webContents.openDevTools({ mode: 'detach' });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => { app.quit(); });

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
