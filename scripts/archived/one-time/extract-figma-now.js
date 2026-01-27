#!/usr/bin/env node

/**
 * Direct Figma MCP Extraction Script
 * Attempts to communicate with the running cursor-talk-to-figma MCP server
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🎨 Figma MCP Direct Extraction\n');

// MCP Protocol message ID counter
let messageId = 0;

function createMCPMessage(method, params = {}) {
  return JSON.stringify({
    jsonrpc: '2.0',
    id: ++messageId,
    method,
    params
  }) + '\n';
}

async function extractFigmaSelection() {
  return new Promise((resolve, reject) => {
    console.log('Spawning cursor-talk-to-figma MCP server...');

    // Spawn the MCP server
    const mcp = spawn('/Users/disruptors/.bun/bin/bunx', ['cursor-talk-to-figma-mcp@latest'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let responseBuffer = '';
    let hasReceivedData = false;

    // Handle stdout (MCP responses)
    mcp.stdout.on('data', (data) => {
      hasReceivedData = true;
      responseBuffer += data.toString();
      console.log('📥 Received data from MCP server');

      // Try to parse complete JSON-RPC messages
      const lines = responseBuffer.split('\n');
      responseBuffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            console.log('📨 MCP Message:', JSON.stringify(message, null, 2));

            // Check if this is the response to our get_selection call
            if (message.result && message.id === 3) {
              console.log('✅ Got selection data!');
              resolve(message.result);
              mcp.kill();
            }
          } catch (e) {
            console.log('⚠️  Non-JSON output:', line);
          }
        }
      }
    });

    // Handle stderr
    mcp.stderr.on('data', (data) => {
      console.log('⚠️  stderr:', data.toString());
    });

    // Handle process exit
    mcp.on('close', (code) => {
      console.log(`MCP server exited with code ${code}`);
      if (!hasReceivedData) {
        reject(new Error('No data received from MCP server'));
      }
    });

    // MCP Protocol Handshake
    setTimeout(() => {
      console.log('1️⃣  Sending initialize...');
      mcp.stdin.write(createMCPMessage('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'figma-extractor',
          version: '1.0.0'
        }
      }));
    }, 100);

    setTimeout(() => {
      console.log('2️⃣  Sending initialized notification...');
      mcp.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/initialized'
      }) + '\n');
    }, 500);

    setTimeout(() => {
      console.log('3️⃣  Calling get_selection...');
      mcp.stdin.write(createMCPMessage('tools/call', {
        name: 'get_selection',
        arguments: {}
      }));
    }, 1000);

    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('⏱️  Timeout - killing process');
      mcp.kill();
      reject(new Error('Timeout waiting for selection'));
    }, 10000);
  });
}

// Run extraction
try {
  console.log('Starting extraction...\n');
  const selectionData = await extractFigmaSelection();

  // Save to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputPath = join(__dirname, '..', 'public', 'figma-imports', `selection-${timestamp}.json`);

  writeFileSync(outputPath, JSON.stringify(selectionData, null, 2));

  console.log('\n✅ SUCCESS!');
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`📊 Data size: ${JSON.stringify(selectionData).length} bytes`);

  // Print summary
  if (selectionData.nodes && Array.isArray(selectionData.nodes)) {
    console.log(`🎯 Extracted ${selectionData.nodes.length} node(s)`);
    selectionData.nodes.forEach((node, i) => {
      console.log(`   ${i + 1}. ${node.name || 'Unnamed'} (${node.type})`);
    });
  }

  process.exit(0);
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error('\n💡 Make sure:');
  console.error('   1. Figma desktop app is running');
  console.error('   2. You have something selected in Figma');
  console.error('   3. cursor-talk-to-figma MCP server is working');
  process.exit(1);
}
