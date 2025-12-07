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

// Percorsi sorgente
const SOURCE_DIR = config.paths.v4;
const PAGES_DIR = path.join(SOURCE_DIR, 'src/pages');
const COMPONENTS_DIR = path.join(SOURCE_DIR, 'src/components');

// Percorsi di destinazione
const DEST_DIR = path.join(config.paths.v6, 'src/react');
const DEST_COMPONENTS_DIR = path.join(DEST_DIR, 'components');
const DEST_PAGES_DIR = path.join(DEST_COMPONENTS_DIR, 'pages'); // Le pagine vengono migrate come componenti in /pages
const IGNORED_FILES = ['_app.tsx', '_document.tsx', 'api'];

// Log di configurazione
console.log('=== Configurazione ===');
console.log('SOURCE:', SOURCE_DIR);
console.log('DEST  :', DEST_DIR);
console.log('=====================');

// Crea directory se non esistono
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Creata directory: ${path.relative(process.cwd(), dirPath)}`);
  }
  return dirPath;
}

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

// Verifica se un file root-level è una pagina SPA significativa
function isRootLevelPage(filePath, analysis) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Criteri per identificare una SPA root-level
    const indicators = [
      // Contiene import di router
      /react-router|BrowserRouter|Router|Route|Link/i.test(content),
      
      // È il file App.tsx/main.tsx e contiene rendering di componenti
      (['App', 'main', 'index'].includes(fileName) && analysis.components.length > 0),
      
      // Contiene createRoot o ReactDOM.render
      /createRoot|ReactDOM\.render/i.test(content),
      
      // Importa pagine da directory pages
      /from\s+['"]\.\/pages|from\s+['"]\.\.\/pages/i.test(content),
      
      // Contiene routing JSX element
      /<Route|<BrowserRouter|<Router/i.test(content)
    ];
    
    // Deve soddisfare almeno uno dei criteri
    const isSignificant = indicators.some(indicator => indicator === true);
    
    if (isSignificant) {
      console.log(`✅ ${fileName} identificato come SPA root-level`);
      console.log(`   - Componenti trovati: ${analysis.components.length}`);
      console.log(`   - Indicatori: ${indicators.map((v, i) => i === 0 ? 'router' : i === 1 ? 'rendering' : i === 2 ? 'createRoot' : i === 3 ? 'pages-import' : 'routing-jsx').filter((_, i) => indicators[i]).join(', ')}`);
    }
    
    return isSignificant;
  } catch (error) {
    console.error(`❌ Errore nella verifica di ${filePath}:`, error.message);
    return false;
  }
}

// Genera la mappa dei componenti in base al report
function generateComponentMap(report) {
  const componentMap = {};
  const iconComponents = new Set([
    'ArrowLeft', 'Folder', 'Plus', 'Edit', 'Trash2', 'X', 'ChevronDown',
    'Search', 'Menu', 'Moon', 'Sun', 'Check', 'Copy', 'ExternalLink'
  ]);

  // Estrai tutti i componenti univoci
  const allComponents = new Set();
  report.migrated.pages.forEach(page => {
    page.components.forEach(comp => allComponents.add(comp));
  });

  // Genera la mappa
  allComponents.forEach(comp => {
    if (iconComponents.has(comp)) {
      componentMap[comp] = 'lucide-react';
    } else {
      componentMap[comp] = `@/react/components/${comp}`;
    }
  });

  return componentMap;
}

// Copia e aggiorna gli import
async function copyAndUpdateImports(sourcePath, destPath, componentMap = {}) {
  try {
    let content = fs.readFileSync(sourcePath, 'utf-8');
    
    // Aggiorna gli import in base alla mappa
    Object.entries(componentMap).forEach(([comp, importPath]) => {
      // Casi supportati:
      // 1. import X from '../../../components/X'
      // 2. import { X } from '../../../components/X'
      // 3. import X from '@/components/X'
      const patterns = [
        // Casi relativi
        new RegExp(`from ['"](?:\\.\\.\\/)+(?:components\\/)?${comp}(?:\\/index)?['"]`, 'g'),
        // Casi con alias
        new RegExp(`from ['"]@\\/components\\/${comp}(?:\\/index)?['"]`, 'g')
      ];

      patterns.forEach(pattern => {
        content = content.replace(pattern, `from '${importPath}'`);
      });
    });

    // Salva il file con gli import aggiornati
    ensureDirectoryExists(path.dirname(destPath));
    fs.writeFileSync(destPath, content);
    console.log(`✅ Aggiornato: ${path.relative(process.cwd(), destPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Errore nell'aggiornamento di ${sourcePath}:`, error.message);
    return false;
  }
}

// Scansiona e migra le pagine
async function scanAndMigrate() {
  const report = { 
    timestamp: new Date().toISOString(),
    migrated: { pages: [], components: [] },
    errors: [],
    componentMap: {}
  };

  try {
    // Crea le directory di destinazione
    ensureDirectoryExists(DEST_COMPONENTS_DIR);
    ensureDirectoryExists(DEST_PAGES_DIR);

    // Fase 1: Analisi iniziale
    console.log('\n🔍 Analisi dei componenti...');
    
    // 1. Scansione tradizionale delle pagine in src/pages
    let allPages = [];
    
    if (fs.existsSync(PAGES_DIR)) {
      const pages = fs.readdirSync(PAGES_DIR).filter(
        page => !IGNORED_FILES.includes(page) && 
               (fs.statSync(path.join(PAGES_DIR, page)).isDirectory() || 
                /\.(jsx|tsx)$/i.test(page))
      );

      // Analizza tutte le pagine per trovare i componenti usati
      for (const page of pages) {
        const pagePath = path.join(PAGES_DIR, page);
        const isDir = fs.statSync(pagePath).isDirectory();
        const sourceFile = isDir ? path.join(pagePath, 'index.tsx') : pagePath;

        if (fs.existsSync(sourceFile)) {
          const analysis = analyzeFile(sourceFile);
          const pageName = path.basename(page, path.extname(page));
          
          allPages.push({
            name: pageName,
            path: path.relative(process.cwd(), sourceFile),
            components: analysis.components,
            type: 'pages-directory'
          });
        }
      }
    }
    
    // 2. Scansione dei file root-level per Single Page Applications
    console.log('\n🔍 Scansione file root-level per SPA...');
    const rootPageCandidates = ['App.tsx', 'App.jsx', 'main.tsx', 'main.jsx', 'index.tsx', 'index.jsx'];
    const srcRootDir = path.join(SOURCE_DIR, 'src');
    
    if (fs.existsSync(srcRootDir)) {
      for (const candidate of rootPageCandidates) {
        const candidatePath = path.join(srcRootDir, candidate);
        if (fs.existsSync(candidatePath)) {
          const analysis = analyzeFile(candidatePath);
          const pageName = path.basename(candidate, path.extname(candidate));
          
          // Verifica se è un file root-level significativo (contiene routing o rendering di pagine)
          const isRootPage = isRootLevelPage(candidatePath, analysis);
          
          if (isRootPage) {
            allPages.push({
              name: `spa-${pageName.toLowerCase()}`,
              path: path.relative(process.cwd(), candidatePath),
              components: analysis.components,
              type: 'root-spa'
            });
            console.log(`📄 Trovata SPA root-level: ${candidate}`);
          }
        }
      }
    }
    
    // Unisci tutti i risultati
    report.migrated.pages = allPages;

    // Genera la mappa dei componenti
    report.componentMap = generateComponentMap(report);
    console.log('📋 Mappa componenti generata:', Object.keys(report.componentMap).join(', '));

    // Fase 2: Migrazione delle pagine
    console.log('\n🔄 Inizio migrazione pagine...');
    for (const page of report.migrated.pages) {
      console.log(`\n📄 Migrazione di: ${page.name} (${page.type})`);
      
      // Determina il percorso del file sorgente in base al tipo
      let sourceFile;
      if (page.type === 'pages-directory') {
        sourceFile = path.join(PAGES_DIR, `${page.name}.tsx`);
        if (!fs.existsSync(sourceFile)) {
          // Potrebbe essere una directory con index.tsx
          const indexFile = path.join(PAGES_DIR, page.name, 'index.tsx');
          if (fs.existsSync(indexFile)) {
            sourceFile = indexFile;
          }
        }
      } else if (page.type === 'root-spa') {
        // Usa il percorso salvato durante l'analisi
        sourceFile = path.resolve(page.path);
      }
      
      if (fs.existsSync(sourceFile)) {
        const destDir = path.join(DEST_PAGES_DIR, page.name);
        ensureDirectoryExists(destDir);
        await copyAndUpdateImports(
          sourceFile,
          path.join(destDir, 'index.tsx'),
          report.componentMap
        );
        console.log(`✅ Migrato: ${page.name} -> ${destDir}`);
      } else {
        console.log(`⚠️  File sorgente non trovato: ${sourceFile}`);
      }
    }

    // Fase 3: Migrazione componenti
    console.log('\n🔄 Inizio migrazione componenti...');
    if (fs.existsSync(COMPONENTS_DIR)) {
      const components = fs.readdirSync(COMPONENTS_DIR).filter(
        file => /\.(jsx|tsx)$/i.test(file)
      );

      for (const component of components) {
        const sourcePath = path.join(COMPONENTS_DIR, component);
        const destPath = path.join(DEST_COMPONENTS_DIR, component);
        
        console.log(`\n🧩 Migrazione componente: ${component}`);
        await copyAndUpdateImports(sourcePath, destPath, report.componentMap);
        report.migrated.components.push(component);
      }
    }

    // Salva il report finale
    const reportPath = path.join(process.cwd(), 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n✅ Migrazione completata! Report salvato in: ${reportPath}`);
    console.log(`   - Pagine migrate: ${report.migrated.pages.length}`);
    console.log(`   - Componenti migrati: ${report.migrated.components.length}`);
    
    return report;

  } catch (error) {
    const errorMsg = `❌ Errore durante la migrazione: ${error.message}`;
    console.error(errorMsg);
    report.errors.push(errorMsg);
    throw error;
  }
}

// Analisi sola lettura (senza migrazione né scrittura file)
async function analyzeComponentsOnly(configFromCli = {}) {
  const configPaths = configFromCli.paths || {};
  const sourceDir = configPaths.v4 || SOURCE_DIR;

  const report = {
    timestamp: new Date().toISOString(),
    migrated: { pages: [], components: [] },
    errors: [],
    componentMap: {}
  };

  try {
    console.log('\n🔍 Analisi componenti (read-only)...');
    console.log('SOURCE:', sourceDir);

    const pagesDir = path.join(sourceDir, 'src/pages');
    const allPages = [];

    // 1. Scansione tradizionale delle pagine in src/pages
    if (fs.existsSync(pagesDir)) {
      const pages = fs.readdirSync(pagesDir).filter(
        page => !IGNORED_FILES.includes(page) && 
               (fs.statSync(path.join(pagesDir, page)).isDirectory() || 
                /\.(jsx|tsx)$/i.test(page))
      );

      for (const page of pages) {
        const pagePath = path.join(pagesDir, page);
        const isDir = fs.statSync(pagePath).isDirectory();
        const sourceFile = isDir ? path.join(pagePath, 'index.tsx') : pagePath;

        if (fs.existsSync(sourceFile)) {
          const analysis = analyzeFile(sourceFile);
          const pageName = path.basename(page, path.extname(page));

          allPages.push({
            name: pageName,
            path: path.relative(process.cwd(), sourceFile),
            components: analysis.components,
            type: 'pages-directory'
          });
        }
      }
    }

    // 2. Scansione dei file root-level per Single Page Applications
    console.log('\n🔍 Scansione file root-level per SPA (read-only)...');
    const rootPageCandidates = ['App.tsx', 'App.jsx', 'main.tsx', 'main.jsx', 'index.tsx', 'index.jsx'];
    const srcRootDir = path.join(sourceDir, 'src');

    if (fs.existsSync(srcRootDir)) {
      for (const candidate of rootPageCandidates) {
        const candidatePath = path.join(srcRootDir, candidate);
        if (fs.existsSync(candidatePath)) {
          const analysis = analyzeFile(candidatePath);
          const pageName = path.basename(candidate, path.extname(candidate));

          const isRootPage = isRootLevelPage(candidatePath, analysis);

          if (isRootPage) {
            allPages.push({
              name: `spa-${pageName.toLowerCase()}`,
              path: path.relative(process.cwd(), candidatePath),
              components: analysis.components,
              type: 'root-spa'
            });
            console.log(`📄 Trovata SPA root-level: ${candidate}`);
          }
        }
      }
    }

    report.migrated.pages = allPages;
    report.componentMap = generateComponentMap(report);

    console.log('\n📊 Analisi completata (read-only):');
    console.log(`   - Pagine analizzate: ${report.migrated.pages.length}`);
    const uniqueComponents = new Set();
    report.migrated.pages.forEach(page => {
      (page.components || []).forEach(c => uniqueComponents.add(c));
    });
    console.log(`   - Componenti unici trovati: ${uniqueComponents.size}`);

    return report;
  } catch (error) {
    const errorMsg = `❌ Errore durante l'analisi: ${error.message}`;
    console.error(errorMsg);
    report.errors.push(errorMsg);
    throw error;
  }
}

// Esegui la migrazione se richiesto direttamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  scanAndMigrate().catch(console.error);
}

export { scanAndMigrate, analyzeComponentsOnly };