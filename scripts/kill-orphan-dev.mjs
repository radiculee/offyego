#!/usr/bin/env node
/**
 * Pre-dev hook: detect and kill an orphan Next.js worker that is still
 * holding port 3000 from a previous session. Run automatically by npm
 * via the `predev` script.
 *
 * Windows is the platform that suffers from this: terminal-wrapper
 * deaths (Ctrl+C edge cases, IDE-managed terminals, harness Stop calls)
 * can leave the child node.exe worker alive, blocking the next
 * `npm run dev` with "Another next dev server is already running."
 *
 * Behaviour:
 *   - Ask the OS who is listening on port 3000. If nobody, exit silent.
 *   - If a node process owns it, kill it. Other processes are left alone.
 *   - Single log line if we kill something, silent otherwise.
 *   - Cross-platform: Windows uses netstat + tasklist + taskkill; POSIX
 *     uses lsof + ps + kill.
 *
 * Note: we deliberately don't probe the port with `net.createServer`.
 * On Windows, a bind to 0.0.0.0:3000 spuriously succeeds even when a
 * listener already exists there, so the probe gives false negatives.
 * netstat / lsof is authoritative.
 */
import { execSync } from 'node:child_process';
import { platform } from 'node:process';

const PORT = 3000;

function findPidsOnPort(port) {
  try {
    if (platform === 'win32') {
      const out = execSync(`netstat -ano | findstr :${port}`, {
        encoding: 'utf8',
      });
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        const match = line.trim().match(/LISTENING\s+(\d+)/);
        if (match) pids.add(Number(match[1]));
      }
      return [...pids];
    }
    const out = execSync(`lsof -ti:${port}`, { encoding: 'utf8' });
    return out
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
  } catch {
    return [];
  }
}

function isNodeProcess(pid) {
  try {
    if (platform === 'win32') {
      const out = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
        encoding: 'utf8',
      });
      return out.toLowerCase().includes('node.exe');
    }
    const out = execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf8' });
    return out.trim().toLowerCase().includes('node');
  } catch {
    return false;
  }
}

function killPid(pid) {
  try {
    if (platform === 'win32') {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    } else {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
}

function main() {
  const pids = findPidsOnPort(PORT);
  if (pids.length === 0) return;
  const nodePids = pids.filter(isNodeProcess);
  if (nodePids.length === 0) return;
  for (const pid of nodePids) {
    if (killPid(pid)) {
      console.log(`predev: killed orphan node process on port ${PORT} (PID ${pid})`);
    }
  }
}

main();
