import net from 'net';
import { spawn } from 'child_process';

// Configurable via env or defaults matching vite.config.js
const HOST = process.env.VITE_HOST || 'localhost';
const PORT = Number(process.env.VITE_PORT || 3000);
const URL = `http://${HOST}:${PORT}`;

function waitForTcp(host, port, timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.createConnection({ host, port }, () => {
        socket.destroy();
        resolve();
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error('timeout'));
        } else {
          // wait 500ms then retry
          setTimeout(tryConnect, 500);
        }
      });
    };
    tryConnect();
  });
}

(async () => {
  try {
    await waitForTcp(HOST, PORT, 20000);
    // Clear noisy output; do not print URL to keep terminal clean when QUIET is set
    try { console.clear(); } catch (e) {}
    if (!process.env.QUIET) {
      console.log(URL);
    }

    // Try to open Google Chrome on Windows specifically, otherwise open default browser
    const isWin = process.platform === 'win32';
    if (isWin) {
      // Use cmd start to target chrome.exe (assumes chrome is in PATH or registered)
      spawn('cmd', ['/c', 'start', 'chrome', URL], { detached: true, stdio: 'ignore' }).unref();
    } else {
      // macOS / Linux: try open or xdg-open
      const opener = process.platform === 'darwin' ? 'open' : 'xdg-open';
      spawn(opener, [URL], { detached: true, stdio: 'ignore' }).unref();
    }
    process.exit(0);
  } catch (err) {
    console.error('Could not open browser, server not reachable:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
