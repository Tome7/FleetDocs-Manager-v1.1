#!/usr/bin/env node

/**
 * Script to run the alerts cleanup utility
 * This fixes the issue where documents with far-future dates were incorrectly marked as expired
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

// Resolve the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the cleanup utility
const cleanupScriptPath = join(__dirname, 'server', 'utils', 'cleanup-alerts.js');

console.log('Running alerts cleanup to fix document expiration issues...');
console.log('This will remove any invalid alerts that were incorrectly generated.');

// Run the cleanup script using bun if available, otherwise node
const runCleanup = () => {
  // First, try to run with bun
  const bunProcess = spawn('bun', [cleanupScriptPath], {
    stdio: 'inherit',
    cwd: __dirname
  });

  bunProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Cleanup completed successfully!');
    } else {
      console.log(`Bun execution failed with code ${code}. Trying with Node.js...`);
      
      // If bun fails, try with node
      const nodeProcess = spawn('node', [cleanupScriptPath], {
        stdio: 'inherit',
        cwd: __dirname
      });

      nodeProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Cleanup completed successfully!');
        } else {
          console.error(`Node.js execution failed with code ${code}`);
          process.exit(code);
        }
      });
    }
  });
};

runCleanup();