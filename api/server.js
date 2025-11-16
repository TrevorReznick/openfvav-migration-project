import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Endpoint per eseguire gli script di migrazione
 * Accetta source e destination come path completi
 */
app.post('/run-script', async (req, res) => {
  const { script, source, destination } = req.body;

  // Comandi che non richiedono source/destination
  const utilityCommands = ['validate', 'setup', 'analyze'];
  
  if (!script) {
    return res.status(400).json({
      error: 'Missing parameters',
      message: 'script is required'
    });
  }

  // Per comandi utility, source e destination sono opzionali
  if (!utilityCommands.includes(script)) {
    if (!source || !destination) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'source and destination are required for this command'
      });
    }

    // Validazione path solo per comandi che li richiedono
    if (!fs.existsSync(source)) {
      return res.status(400).json({
        error: 'Invalid source path',
        message: `Source path does not exist: ${source}`
      });
    }

    if (!fs.existsSync(destination)) {
      return res.status(400).json({
        error: 'Invalid destination path',
        message: `Destination path does not exist: ${destination}`
      });
    }
  }

  // Path del CLI (relativo alla root del progetto)
  const projectRoot = path.join(__dirname, '..');
  const cliPath = path.join(projectRoot, 'src', 'cli.js');
  
  if (!fs.existsSync(cliPath)) {
    return res.status(500).json({
      error: 'CLI not found',
      message: `CLI script not found at: ${cliPath}`
    });
  }

  // Costruisci il comando
  const command = 'node';
  const args = [cliPath, script];

  // Aggiungi source e destination solo se forniti e necessari
  if (source && !utilityCommands.includes(script)) {
    args.push('--source', source);
  }
  if (destination && !utilityCommands.includes(script)) {
    args.push('--destination', destination);
  }

  // Aggiungi dry-run se richiesto
  if (req.body.dryRun) {
    args.push('--dry-run');
  }

  console.log(`Executing: ${command} ${args.join(' ')}`);

  const child = spawn(command, args, {
    cwd: projectRoot,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => {
    const output = data.toString();
    stdout += output;
    console.log(output);
  });

  child.stderr.on('data', (data) => {
    const output = data.toString();
    stderr += output;
    console.error(output);
  });

  child.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({
        success: false,
        exitCode: code,
        stderr,
        stdout,
        message: 'Script execution failed'
      });
    }
    
    res.json({
      success: true,
      exitCode: code,
      stdout,
      stderr,
      message: 'Script executed successfully'
    });
  });

  child.on('error', (error) => {
    console.error('Spawn error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to start script execution'
    });
  });
});

/**
 * Endpoint per validare i path
 */
app.post('/validate-paths', (req, res) => {
  const { source, destination } = req.body;

  const validation = {
    source: {
      path: source,
      exists: source ? fs.existsSync(source) : false,
      isDirectory: source ? (fs.existsSync(source) && fs.statSync(source).isDirectory()) : false
    },
    destination: {
      path: destination,
      exists: destination ? fs.existsSync(destination) : false,
      isDirectory: destination ? (fs.existsSync(destination) && fs.statSync(destination).isDirectory()) : false
    }
  };

  const isValid = validation.source.exists && 
                  validation.source.isDirectory && 
                  validation.destination.exists && 
                  validation.destination.isDirectory;

  res.json({
    valid: isValid,
    validation
  });
});

/**
 * Endpoint per ottenere informazioni sul sistema
 */
app.get('/info', (req, res) => {
  const projectRoot = path.join(__dirname, '..');
  const cliPath = path.join(projectRoot, 'src', 'cli.js');
  const configPath = path.join(projectRoot, 'migration.config.json');
  const configExamplePath = path.join(projectRoot, 'migration.config.json.example');
  
  res.json({
    platform: process.platform,
    nodeVersion: process.version,
    cwd: process.cwd(),
    projectRoot,
    cliPath,
    cliExists: fs.existsSync(cliPath),
    configPath,
    configExists: fs.existsSync(configPath),
    configExamplePath,
    configExampleExists: fs.existsSync(configExamplePath)
  });
});

/**
 * Endpoint per creare il file di configurazione di base
 */
app.post('/create-config', (req, res) => {
  const projectRoot = path.join(__dirname, '..');
  const configPath = path.join(projectRoot, 'migration.config.json');
  const configExamplePath = path.join(projectRoot, 'migration.config.json.example');
  
  // Verifica se il config esiste già
  if (fs.existsSync(configPath)) {
    return res.status(400).json({
      success: false,
      error: 'Config file already exists',
      message: 'migration.config.json already exists. Delete it first if you want to recreate it.'
    });
  }
  
  // Verifica se esiste l'esempio
  if (!fs.existsSync(configExamplePath)) {
    return res.status(404).json({
      success: false,
      error: 'Example config not found',
      message: 'migration.config.json.example not found. Cannot create config file.'
    });
  }
  
  try {
    // Leggi il file di esempio
    const exampleContent = fs.readFileSync(configExamplePath, 'utf-8');
    
    // Sostituisci i path placeholder con path relativi o vuoti
    const configContent = exampleContent
      .replace(/\/path\/to\/workspace/g, process.cwd())
      .replace(/\/path\/to\/openfav-v\d+/g, '');
    
    // Scrivi il nuovo file
    fs.writeFileSync(configPath, configContent, 'utf-8');
    
    res.json({
      success: true,
      message: 'Configuration file created successfully',
      configPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create configuration file'
    });
  }
});

/**
 * Endpoint per ottenere i comandi disponibili
 */
app.get('/commands', (req, res) => {
  res.json({
    commands: [
      { 
        value: 'tokens', 
        label: 'Migrate Design Tokens', 
        description: 'Migra tutti i design tokens',
        implemented: true,
        category: 'tokens',
        requiresPaths: true
      },
      { 
        value: 'colors', 
        label: 'Migrate Colors', 
        description: 'Migra solo i colori',
        implemented: true,
        category: 'tokens',
        requiresPaths: true
      },
      { 
        value: 'typography', 
        label: 'Migrate Typography', 
        description: 'Migra solo la tipografia',
        implemented: true,
        category: 'tokens',
        requiresPaths: true
      },
      { 
        value: 'spacing', 
        label: 'Migrate Spacing', 
        description: 'Migra solo lo spacing (non ancora implementato)',
        implemented: false,
        category: 'tokens',
        requiresPaths: true
      },
      { 
        value: 'components', 
        label: 'Migrate Components', 
        description: 'Migra i componenti',
        implemented: true,
        category: 'components',
        requiresPaths: true
      },
      { 
        value: 'all', 
        label: 'Run All Migrations', 
        description: 'Esegue tutte le migrazioni disponibili',
        implemented: true,
        category: 'all',
        requiresPaths: true
      },
      { 
        value: 'validate', 
        label: 'Validate Configuration', 
        description: 'Valida la configurazione e i path',
        implemented: true,
        category: 'utility',
        requiresPaths: false
      },
      { 
        value: 'setup', 
        label: 'Setup Wizard', 
        description: 'Wizard interattivo per configurazione (non ancora implementato)',
        implemented: false,
        category: 'utility',
        requiresPaths: false
      },
      { 
        value: 'analyze', 
        label: 'Analyze Project', 
        description: 'Analizza la struttura del progetto (non ancora implementato)',
        implemented: false,
        category: 'utility',
        requiresPaths: false
      }
    ]
  });
});

app.listen(port, () => {
  console.log(`🚀 Migration API Server listening at http://localhost:${port}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`📂 Project root: ${path.join(__dirname, '..')}`);
});

