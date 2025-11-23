#!/usr/bin/env node

/**
 * Script di test per il debug della migrazione CSS
 * 
 * Uso:
 * node debug-css-test.js --debug    // Abilita debug mode (commenta i color variables)
 * node debug-css-test.js           // Modalità normale
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const isDebugMode = args.includes('--debug');

console.log('\n🐛 CSS Migration Debug Test');
console.log('='.repeat(40));
console.log(`Debug mode: ${isDebugMode ? 'ENABLED' : 'DISABLED'}`);
console.log('\n');

// Esegui la migrazione dei colori con o senza debug
const migrateProcess = spawn('node', [
  'src/cli.js', 
  'colors',
  ...(isDebugMode ? ['--debug'] : [])
], {
  cwd: __dirname,
  stdio: 'inherit'
});

migrateProcess.on('close', (code) => {
  console.log(`\n✅ Process completed with exit code: ${code}`);
  
  if (isDebugMode) {
    console.log('\n📋 Debug Summary:');
    console.log('- Color variables sono stati commentati nel globals.css');
    console.log('- Controlla il log "=== GENERATED GLOBALS.CSS ===" per vedere il contenuto');
    console.log('- Riavvia Astro per verificare se l errore sparisce');
  } else {
    console.log('\n📋 Normal Mode Summary:');
    console.log('- Color variables sono stati generati normalmente');
    console.log('- Controlla il log "=== GENERATED GLOBALS.CSS ===" per vedere il contenuto');
    console.log('- Se c è un errore PostCSS, confronta con la versione debug');
  }
  
  console.log('\n🔍 Next steps:');
  console.log('1. Controlla il log della migrazione');
  console.log('2. Riavvia il progetto Astro');
  console.log('3. Se c è un errore, vai alla riga indicata da PostCSS');
  console.log('4. Confronta i log tra modalità normale e debug');
  
  if (isDebugMode) {
    console.log('\n💡 Se l errore sparisce in debug mode:');
    console.log('- Il problema è nelle righe --color-*');
    console.log('- Controlla il log "=== DEBUG COLOR VARIABLES ==="');
    console.log('- Cerca valori HSL malformati o caratteri strani');
  }
});

migrateProcess.on('error', (error) => {
  console.error('❌ Error running migration:', error);
  process.exit(1);
});
