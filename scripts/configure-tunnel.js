import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicUrl = String(process.argv[2] || '').trim().replace(/\/$/, '');

let parsed;
try {
  parsed = new URL(publicUrl);
} catch {
  console.error('Usage: npm run configure:tunnel -- https://your-real-tunnel.example');
  process.exit(1);
}

if (parsed.protocol !== 'https:' || !parsed.hostname || ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) {
  console.error('The tunnel URL must be a publicly reachable HTTPS URL.');
  process.exit(1);
}

const setEnvValue = (filePath, name, value) => {
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const line = `${name}=${value}`;
  const pattern = new RegExp(`^${name}=.*$`, 'm');
  const next = pattern.test(current) ? current.replace(pattern, line) : `${current.trimEnd()}\n${line}\n`;
  fs.writeFileSync(filePath, next, 'utf8');
};

setEnvValue(path.join(root, 'backend', '.env'), 'PUBLIC_APP_URL', publicUrl);
setEnvValue(path.join(root, '.env.local'), 'VITE_PUBLIC_HOST', parsed.host);

console.log(`Configured public application URL: ${publicUrl}`);
console.log(`Frontend URL: ${publicUrl}`);