import os from 'os';
import { spawn } from 'child_process';

const host = process.env.FRONTEND_HOST || '127.0.0.1';
const port = Number(process.env.FRONTEND_PORT || 3000);
const networkAddresses = Object.values(os.networkInterfaces()).flat().filter(address => address && !address.internal && address.family === 'IPv4').map(address => address.address);
const blueLink = value => `\x1b[34m\x1b[4m${value}\x1b[0m`;

const isHealthy = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`http://${host}:${port}/`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

const keepAttached = () => {
  console.log(`Frontend local: ${blueLink(`http://${host}:${port}`)} (existing instance)`);
  networkAddresses.forEach(address => console.log(`Frontend network: ${blueLink(`http://${address}:${port}`)}`));
  const timer = setInterval(() => {}, 1000);
  const shutdown = () => { clearInterval(timer); process.exit(0); };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

const printLinks = () => {
  console.log(`Frontend local: ${blueLink(`http://${host}:${port}`)}`);
  networkAddresses.forEach(address => console.log(`Frontend network: ${blueLink(`http://${address}:${port}`)}`));
};

if (await isHealthy()) {
  keepAttached();
} else {
  printLinks();
  const child = spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit', env: process.env });
  const shutdown = signal => child.kill(signal);
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  child.once('exit', code => process.exit(code ?? 0));
}
