// Usa import invece di require
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse.default;

// Configurazione dei percorsi
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leggi la configurazione
const configPath = path.join(process.cwd(), 'migration.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Imposta i percorsi
const SOURCE_DIR = config.paths.v4;  // Percorso sorgente V4
const ROOT_DIR = process.cwd();      // Directory del progetto corrente
const PAGES_DIR = path.join(SOURCE_DIR, 'src/pages');  // Percorso completo a pages
const IGNORED_FILES = ['_app.tsx', '_document.tsx', 'api'];

// Log di debug
console.log('=== Configurazione dei percorsi ===');
console.log('SOURCE_DIR:', SOURCE_DIR);
console.log('PAGES_DIR:', PAGES_DIR);
console.log('La cartella esiste?', fs.existsSync(PAGES_DIR) ? 'Sì' : 'No');
console.log('=================================');

// Analizza un file e trova i componenti
function analyzeFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties']
    });

    const imports = new Set();
    const components = new Set();

    traverse(ast, {
      ImportDeclaration({ node }) {
        const importPath = node.source.value;
        if (importPath.startsWith('./') || 
            importPath.startsWith('@/components') || 
            importPath.startsWith('../components')) {
          imports.add(importPath);
        }
      },
      JSXElement({ node }) {
        if (node.openingElement?.name?.name) {
          const compName = node.openingElement.name.name;
          if (/^[A-Z]/.test(compName)) {
            components.add(compName);
          }
        }
      }
    });

    return { 
      imports: [...imports], 
      components: [...components] 
    };
  } catch (error) {
    console.error(`❌ Errore nell'analisi di ${filePath}:`, error.message);
    return { imports: [], components: [], error: error.message };
  }
}

// Scansiona le pagine
async function scanPages() {
  const report = { 
    timestamp: new Date().toISOString(),
    config: {
      sourceDir: SOURCE_DIR,
      pagesDir: PAGES_DIR
    }
  };
  
  try {
    if (!fs.existsSync(PAGES_DIR)) {
      throw new Error(`La cartella ${PAGES_DIR} non esiste`);
    }

    const pages = fs.readdirSync(PAGES_DIR);
    report.pages = {};

    for (const page of pages) {
      if (IGNORED_FILES.includes(page)) continue;
      
      const pagePath = path.join(PAGES_DIR, page);
      const stats = fs.statSync(pagePath);

      if (stats.isDirectory() || /\.(jsx|tsx)$/i.test(page)) {
        const fullPath = stats.isDirectory() 
          ? path.join(pagePath, 'index.tsx') 
          : pagePath;

        if (fs.existsSync(fullPath)) {
          console.log(`🔍 Analisi di: ${page}`);
          const analysis = analyzeFile(fullPath);
          report.pages[page] = {
            path: fullPath.replace(ROOT_DIR, ''),
            ...analysis
          };
        }
      }
    }

    // Salva il report
    const reportPath = path.join(ROOT_DIR, 'component-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n✅ Analisi completata! Report salvato in: ${reportPath}`);
    return report;

  } catch (error) {
    console.error('❌ Errore durante la scansione:', error);
    throw error;
  }
}

// Esegui l'analisi se richiesto direttamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  scanPages().catch(console.error);
}

// Esporta per uso in altri moduli
export { scanPages, analyzeFile };