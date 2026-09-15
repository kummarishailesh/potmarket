#!/usr/bin/env node
// prints a Vite-like startup message without running the dev server
// - reads vite version from package.json when available
// - tries to detect port from vite.config.js (simple regex)
// - supports optional args: --port=3000 --time=2915

import fs from 'fs';
import path from 'path';
import os from 'os';
import dns from 'dns/promises';

const pkgPath = new URL('../package.json', import.meta.url);
let pkg = {};
try {
  const text = await fs.promises.readFile(pkgPath, 'utf8');
  pkg = JSON.parse(text);
} catch (e) {
  // ignore
}

// get vite version from devDependencies or dependencies
const viteVersion = (pkg.devDependencies && pkg.devDependencies.vite) || (pkg.dependencies && pkg.dependencies.vite) || '^7.2.4';
// normalize a bit: remove leading ^ or ~
const version = viteVersion.replace(/^[^0-9]*/, '') || '7.2.4';

// simple args parsing
const argv = process.argv.slice(2);
const argMap = {};
for (const a of argv) {
  const m = a.match(/^--([^=]+)=?(.*)$/);
  if (m) argMap[m[1]] = m[2] || true;
}

// try to detect port from vite.config.js by simple regex
let port = argMap.port || '3000';
try {
  const cfgPath = new URL('../vite.config.js', import.meta.url);
  const cfg = await fs.promises.readFile(cfgPath, 'utf8');
  const m = cfg.match(/port\s*:\s*(\d+)/);
  if (m) port = argMap.port || m[1];
} catch (e) {
  // no vite.config.js or couldn't read - keep default
}

const ms = argMap.time || '2915';

// ANSI styles similar to Vite output
const reset = '\x1b[0m';
const bold = '\x1b[1m';
const dim = '\x1b[2m';
const green = '\x1b[32m';

// Build lines similar to Vite
console.log(`${green}${bold}VITE ${reset}${green}v${version}${reset} ready in ${ms} ms\n`);
console.log(`➜  ${bold}Local:${reset}   ${dim}http://localhost:${port}/${reset}`);

// detect all local non-internal IPv4/IPv6 addresses and print a real network URL for each
function getLocalNetworkIps() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    const addrs = nets[name];
    for (const addr of addrs) {
      const family = String(addr.family);
      if (!addr.internal) {
        // normalize family to 'IPv4' or 'IPv6'
        const fam = (family === '4' || family === 'IPv4') ? 'IPv4' : (family === '6' || family === 'IPv6') ? 'IPv6' : family;
        results.push({ name, address: addr.address, family: fam });
      }
    }
  }
  return results;
}

const networkAddrs = getLocalNetworkIps();
if (networkAddrs.length) {
  console.log(`➜  ${bold}Network:${reset}`);
  // For each address, try reverse DNS (and optionally mDNS) to get a hostname
  for (const a of networkAddrs) {
    let label = a.address;
    try {
      const hosts = await dns.reverse(a.address);
      if (hosts && hosts.length) {
        label = hosts[0];
      } else {
        // attempt mDNS PTR reverse for IPv4 if multicast-dns is available
        if (a.family === 'IPv4') {
          const mdnsName = await tryMdnsReverse(a.address);
          if (mdnsName) label = mdnsName;
        }
      }
    } catch (e) {
      // reverse lookup failed; try mDNS for IPv4
      if (a.family === 'IPv4') {
        const mdnsName = await tryMdnsReverse(a.address);
        if (mdnsName) label = mdnsName;
      }
    }

    // wrap IPv6 addresses in brackets for URL
    const url = a.family === 'IPv6' ? `http://[${a.address}]:${port}/` : `http://${a.address}:${port}/`;
    // print resolved hostname (or raw IP) next to URL
    console.log(`  ${dim}${url}${reset} ${dim}(${a.name} — ${a.family})${reset} ${bold}${label}${reset}`);
  }
} else {
  console.log(`➜  ${bold}Network:${reset} ${dim}use --host to expose${reset}`);
}

console.log(`➜  ${bold}press h + enter to show help${reset}`);

// Try reverse mDNS PTR lookup for an IPv4 address using optional `multicast-dns`.
// This is optional: if `multicast-dns` is not installed the function resolves to null.
async function tryMdnsReverse(ip) {
  // only attempt for IPv4
  if (!ip || ip.indexOf(':') !== -1) return null;
  // build in-addr.arpa reverse name
  const parts = ip.split('.').reverse();
  const name = parts.join('.') + '.in-addr.arpa';
  try {
    const mod = await import('multicast-dns');
    const create = mod.default || mod;
    const mdns = create();
    return await new Promise((resolve) => {
      let answered = false;
      const timer = setTimeout(() => {
        if (!answered) {
          answered = true;
          try { mdns.destroy(); } catch (e) {}
          resolve(null);
        }
      }, 800);

      mdns.query([{ name, type: 'PTR' }]);
      mdns.on('response', (res) => {
        if (answered) return;
        const ptr = (res.answers || []).find(a => a.type === 'PTR' && a.name === name);
        if (ptr && ptr.data) {
          answered = true;
          clearTimeout(timer);
          try { mdns.destroy(); } catch (e) {}
          resolve(ptr.data.toString());
        }
      });
    });
  } catch (e) {
    // multicast-dns not installed or failed
    return null;
  }
}
