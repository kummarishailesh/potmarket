import { spawn } from 'child_process';
import os from 'os';

const host = process.env.BACKEND_HOST || '127.0.0.1';
const port = Number(process.env.BACKEND_PORT || 3001);
const networkAddresses = Object.values(os.networkInterfaces()).flat().filter(address => address && !address.internal && address.family === 'IPv4').map(address => address.address);
const blueLink = value => `\x1b[34m\x1b[4m${value}\x1b[0m`;

const canConnect = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`http://${host}:${port}/health`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

const keepAttached = () => {
  console.log(`Backend local: ${blueLink(`http://${host}:${port}`)} (existing instance)`);
  networkAddresses.forEach(address => console.log(`Backend network: ${blueLink(`http://${address}:${port}`)}`));
  const timer = setInterval(() => {}, 1000);
  const shutdown = () => { clearInterval(timer); process.exit(0); };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

if (await canConnect()) {
  keepAttached();
} else {
  const child = spawn(process.execPath, ['backend/server.js'], { stdio: 'inherit', env: process.env });
  const shutdown = signal => { child.kill(signal); };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  child.once('exit', code => process.exit(code ?? 0));
}
