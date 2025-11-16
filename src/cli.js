#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join, isAbsolute, resolve } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONFIG_PATH = join(process.cwd(), 'migration.config.json');

// Import moduli
import { migrateDesignTokens, migrateColors, migrateTypography } from './tokens/migrate-tokens.js';
import { migrateComponents } from './components/migrate-components.js';

/**
 * Normalizza il percorso assoluto
 * @param {string} inputPath - Percorso da normalizzare
 * @returns {string} Percorso normalizzato
 */
const normalizePath = (inputPath) => {
  if (!inputPath) return '';
  // Sostituisci ~ con la home directory
  if (inputPath.startsWith('~/') || inputPath === '~') {
    return inputPath.replace('~', process.env.HOME || process.env.USERPROFILE);
  }
  // Converti in percorso assoluto se relativo
  return isAbsolute(inputPath) ? inputPath : resolve(process.cwd(), inputPath);
};

/**
 * Verifica la struttura delle directory richieste
 * @param {string} projectPath - Percorso del progetto
 * @param {string} version - Versione del progetto (v3, v4, v6)
 * @returns {Object} Risultato della validazione
 */
const validateProjectStructure = (projectPath, version) => {
  const requiredDirs = {
    v3: ['src/styles', 'src/components'],
    v4: ['src'],
    v6: ['src/react/components/ui']
  };

  const missingDirs = (requiredDirs[version] || []).filter(dir => {
    return !existsSync(join(projectPath, dir));
  });

  if (missingDirs.length > 0) {
    console.log(chalk.yellow(`\n⚠️  Attenzione per ${version}:`));
    console.log(chalk.yellow(`Le seguenti directory richieste non sono state trovate:`));
    missingDirs.forEach(dir => console.log(`- ${dir}`));
    
    return {
      isValid: false,
      message: `Struttura del progetto ${version} incompleta. Directory mancanti: ${missingDirs.join(', ')}`
    };
  }

  return { isValid: true };
};

/**
 * Verifica i file di configurazione richiesti
 * @param {string} projectPath - Percorso del progetto
 * @param {string} version - Versione del progetto (v3, v4)
 * @returns {Object} Risultato della validazione
 */
const validateConfigFiles = (projectPath, version) => {
  const requiredFiles = {
    v4: [
      'src/styles/globals.css',
      'src/styles/tokens.css'
    ],
    v3: [
      'src/styles/variables.scss'
    ]
  };

  const missingFiles = (requiredFiles[version] || []).filter(file => {
    return !existsSync(join(projectPath, file));
  });

  if (missingFiles.length > 0) {
    console.log(chalk.yellow(`\n⚠️  File di configurazione mancanti in ${version}:`));
    missingFiles.forEach(file => console.log(`- ${file}`));
    
    return {
      isValid: false,
      message: `File di configurazione mancanti in ${version}: ${missingFiles.join(', ')}`
    };
  }

  return { isValid: true };
};

/**
 * Configurazione guidata interattiva
 */
async function findReactCssFiles(projectPath) {
  const possibleCssFiles = [
    'src/index.css',
    'src/App.css',
    'src/styles/globals.css',
    'src/styles/index.css',
    'src/styles/global.css',
    'index.css',
    'styles.css',
    // Aggiungi anche le varianti SCSS/SASS
    'src/index.scss',
    'src/App.scss',
    'src/styles/globals.scss',
    'src/styles/index.scss',
    'src/styles/global.scss',
    'index.scss',
    'styles.scss'
  ];

  return possibleCssFiles.find(file => existsSync(join(projectPath, file)));
}

async function runSetup() {
  console.log(chalk.cyan('\n🚀 Configurazione guidata OpenFav Migration\n'));

  // Verifica se esiste già un file di configurazione
  if (existsSync(CONFIG_PATH)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Esiste già un file di configurazione. Vuoi sovrascriverlo?',
        default: false
      }
    ]);

    if (!overwrite) {
      console.log('\nConfigurazione annullata.');
      return;
    }
  }

  // Chiedi tutti i percorsi in un unico passaggio
  const paths = await inquirer.prompt([
    {
      type: 'input',
      name: 'v4',
      message: 'Percorso del progetto sorgente (V4):',
      validate: input => existsSync(normalizePath(input)) || 'Il percorso specificato non esiste',
      filter: normalizePath
    },
    {
      type: 'input',
      name: 'v6',
      message: 'Percorso di destinazione (V6):',
      default: process.cwd(),
      validate: input => existsSync(normalizePath(input)) || 'Il percorso specificato non esiste',
      filter: normalizePath
    },
    {
      type: 'input',
      name: 'v3',
      message: '(Opzionale) Percorso del progetto di riferimento (V3):',
      default: '',
      filter: input => input ? normalizePath(input) : ''
    },
    {
      type: 'confirm',
      name: 'isReactProject',
      message: 'Il progetto sorgente è un progetto React?',
      default: true
    }
  ]);

  // Validazioni avanzate dopo il primo blocco
  const v4Structure = validateProjectStructure(paths.v4, 'v4');
  if (!v4Structure.isValid) {
    console.log(chalk.red(`\n❌ Struttura V4 non valida: ${v4Structure.message}`));
    process.exit(1);
  }
  const v6Structure = validateProjectStructure(paths.v6, 'v6');
  if (!v6Structure.isValid) {
    console.log(chalk.red(`\n❌ Struttura V6 non valida: ${v6Structure.message}`));
    process.exit(1);
  }
  if (paths.v3) {
    const v3Structure = validateProjectStructure(paths.v3, 'v3');
    if (!v3Structure.isValid) {
      console.log(chalk.yellow(`\n⚠️  Struttura V3 non valida: ${v3Structure.message} (V3 è opzionale, proseguo)`));
    }
  }

  const isReactProject = paths.isReactProject;
  let projectConfig = {};

  // Se è un progetto React, cerca i file CSS
  if (isReactProject) {
    const foundCssFile = await findReactCssFiles(paths.v4);
    if (foundCssFile) {
      console.log(chalk.green(`✓ Trovato file CSS: ${foundCssFile}`));
      projectConfig = {
        css: {
          entry: [foundCssFile],
          modulePattern: '\\.module\\.(css|scss)$',
          globalStyles: [dirname(foundCssFile)]
        },
        tailwind: {
          configPath: 'tailwind.config.js',
          cssPath: foundCssFile
        }
      };
    } else {
      console.log(chalk.yellow('⚠️  Nessun file CSS principale trovato. Configurazione CSS non rilevata.'));
    }
  }

  // Se non è un progetto React o non sono stati trovati file CSS, usa la configurazione personalizzata
  if (!isReactProject || !Object.keys(projectConfig).length) {
    const { projectType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: 'Seleziona il tipo di progetto:',
        choices: [
          { name: 'Next.js', value: 'next' },
          { name: 'Vite', value: 'vite' },
          { name: 'Personalizzato', value: 'custom' }
        ],
        default: 'next'
      }
    ]);

    if (projectType === 'custom') {
      const customConfig = await inquirer.prompt([
        {
          type: 'input',
          name: 'cssEntry',
          message: 'Percorso del file CSS principale (es: src/index.css):',
          validate: input => !!input.trim() || 'Il percorso è obbligatorio'
        },
        {
          type: 'input',
          name: 'tailwindConfig',
          message: 'Percorso del file di configurazione Tailwind (se presente):',
          default: 'tailwind.config.js'
        }
      ]);

      projectConfig = {
        css: {
          entry: [customConfig.cssEntry],
          modulePattern: '\\.module\\.(css|scss)$',
          globalStyles: [dirname(customConfig.cssEntry)]
        },
        tailwind: {
          configPath: customConfig.tailwindConfig,
          cssPath: customConfig.cssEntry
        }
      };
    } else {
      projectConfig = {
        react: {
          css: {
            entry: ['src/index.css'],
            modulePattern: '\\.module\\.(css|scss)$',
            globalStyles: ['src']
          },
          tailwind: {
            configPath: 'tailwind.config.js',
            cssPath: 'src/index.css'
          }
        },
        next: {
          css: {
            entry: ['pages/_app.css'],
            modulePattern: '\\.module\\.(css|scss)$',
            globalStyles: ['pages']
          },
          tailwind: {
            configPath: 'tailwind.config.js',
            cssPath: 'pages/_app.css'
          }
        },
        vite: {
          css: {
            entry: ['src/main.css'],
            modulePattern: '\\.module\\.(css|scss)$',
            globalStyles: ['src']
          },
          tailwind: {
            configPath: 'tailwind.config.js',
            cssPath: 'src/main.css'
          }
        }
      }[projectType];
    }
  }

  // Chiedi solo le opzioni rimanenti, non i percorsi che abbiamo già
  const options = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'createBackup',
      message: 'Vuoi attivare il backup automatico?',
      default: true
    },
    {
      type: 'confirm',
      name: 'dryRun',
      message: 'Vuoi eseguire in modalità dry-run (simulazione)?',
      default: false
    },
    {
      type: 'list',
      name: 'outputFormat',
      message: 'Seleziona il formato di output:',
      choices: ['js', 'ts', 'json'],
      default: 'js'
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Confermi di voler salvare la configurazione?',
      default: true
    }
  ]);

  if (!options.confirm) {
    console.log(chalk.yellow('\nConfigurazione annullata.'));
    process.exit(0);
  }

  // Crea la configurazione usando i percorsi già raccolti
  const config = {
    version: "2.0",
    workspaceRoot: process.cwd(),
    paths: {
      v3: paths.v3 || '',
      v4: paths.v4,
      v6: paths.v6
    },
    projectConfig: projectConfig,
    options: {
      createBackup: options.createBackup,
      dryRun: options.dryRun,
      verbose: true,
      outputFormat: options.outputFormat,
      autoApplyTokens: false
    },
    tokenMappings: {},
    componentMappings: {}
  };

  try {
    // Crea la directory se non esiste
    mkdirSync(dirname(CONFIG_PATH), { recursive: true });
    
    // Scrivi il file di configurazione
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    
    console.log(chalk.green(`\n✅ Configurazione salvata in ${CONFIG_PATH}`));
    console.log(chalk.blue('\nConfigurazione completata con successo! 🎉\n'));
    
    // Mostra un riepilogo
    console.log(chalk.cyan('Riepilogo configurazione:'));
    console.log(chalk.gray(`  V4 (sorgente): ${paths.v4}`));
    console.log(chalk.gray(`  V6 (destinazione): ${paths.v6}`));
    if (paths.v3) {
      console.log(chalk.gray(`  V3 (riferimento): ${paths.v3}`));
    }
    console.log(chalk.gray(`  Backup: ${options.createBackup ? 'attivato' : 'disattivato'}`));
    console.log(chalk.gray(`  Dry-run: ${options.dryRun ? 'attivato' : 'disattivato'}`));
    console.log(chalk.gray(`  Formato output: ${options.outputFormat}`));
  } catch (error) {
    console.error(chalk.red('\n❌ Errore durante il salvataggio della configurazione:'), error);
    process.exit(1);
  }
}

/**
 * Carica la configurazione dal file
 * @param {Object} options - Opzioni per sovrascrivere i path
 * @returns {Object} Configurazione caricata
 */
async function loadConfig(options = {}) {
  // Default configuration
  const defaultConfig = {
    projectType: 'react',
    options: {
      createBackup: true,
      dryRun: false,
      verbose: true,
      outputFormat: 'js'
    }
  };

  // Project structures definition
  const PROJECT_STRUCTURES = {
    react: {
      css: {
        entry: ['src/index.css'],
        modulePattern: '\\.module\\.(css|scss)$',
        globalStyles: ['src']
      },
      tailwind: {
        configPath: 'tailwind.config.js',
        cssPath: 'src/index.css'
      }
    },
    next: {
      css: {
        entry: ['pages/_app.css'],
        modulePattern: '\\.module\\.(css|scss)$',
        globalStyles: ['pages']
      },
      tailwind: {
        configPath: 'tailwind.config.js',
        cssPath: 'pages/_app.css'
      }
    },
    vite: {
      css: {
        entry: ['src/main.css'],
        modulePattern: '\\.module\\.(css|scss)$',
        globalStyles: ['src']
      },
      tailwind: {
        configPath: 'tailwind.config.js',
        cssPath: 'src/main.css'
      }
    }
  };

  // Se source e destination sono forniti, usali
  if (options.source && options.destination) {
    const sourcePath = normalizePath(options.source);
    const destPath = normalizePath(options.destination);
    
    if (!existsSync(sourcePath)) {
      console.error(chalk.red(`❌ Errore: Il percorso sorgente non esiste: ${sourcePath}`));
      process.exit(1);
    }
    
    if (!existsSync(destPath)) {
      console.error(chalk.red(`❌ Errore: Il percorso di destinazione non esiste: ${destPath}`));
      process.exit(1);
    }
    
    return {
      ...defaultConfig,
      paths: {
        v3: { path: '' },
        v4: {
          path: sourcePath,
          css: PROJECT_STRUCTURES[defaultConfig.projectType].css,
          tailwind: PROJECT_STRUCTURES[defaultConfig.projectType].tailwind
        },
        v6: {
          path: destPath,
          output: 'src/react/components/ui'
        }
      },
      workspaceRoot: process.cwd(),
      options: defaultConfig.options
    };
  }

  if (!existsSync(CONFIG_PATH)) {
    console.error(chalk.red('❌ Error: migration.config.json not found'));
    console.log(chalk.yellow('Please create a migration.config.json file.'));
    console.log(chalk.gray('You can copy migration.config.json.example and customize it.'));
    process.exit(1);
  }

  try {
    const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    const workspaceRoot = config.workspaceRoot || process.cwd();
    
    // Se vengono passati source e destination, sovrascrivi i path nel config
    if (options.source) {
      if (!existsSync(options.source)) {
        console.error(chalk.red(`❌ Error: Source path does not exist: ${options.source}`));
        process.exit(1);
      }
      config.paths = config.paths || {};
      config.paths.v4 = options.source;
      console.log(chalk.blue(`📁 Using source path: ${options.source}`));
    }
    
    if (options.destination) {
      if (!existsSync(options.destination)) {
        console.error(chalk.red(`❌ Error: Destination path does not exist: ${options.destination}`));
        process.exit(1);
      }
      config.paths = config.paths || {};
      config.paths.v6 = options.destination;
      console.log(chalk.blue(`📁 Using destination path: ${options.destination}`));
    }
    
    // Resolve paths relative to workspace root
    const resolvedPaths = {};
    for (const [version, path] of Object.entries(config.paths || {})) {
      const fullPath = path.startsWith('/') ? path : join(workspaceRoot, path);
      if (!existsSync(fullPath)) {
        console.warn(chalk.yellow(`⚠️  Path for ${version} does not exist: ${fullPath}`));
      }
      resolvedPaths[version] = fullPath;
    }
    
    return {
      ...config,
      paths: resolvedPaths,
      workspaceRoot
    };
  } catch (error) {
    console.error(chalk.red('❌ Error loading config:'), error.message);
    process.exit(1);
  }
}

/**
 * Valida i percorsi specificati nella configurazione
 * @param {Object} config - Configurazione caricata
 * @returns {Object} Risultato della validazione
 */
async function validatePaths(config) {
  const results = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Verifica percorso V4 (obbligatorio)
  if (!config.paths.v4 || !existsSync(config.paths.v4)) {
    results.isValid = false;
    results.errors.push(`Percorso V4 non valido: ${config.paths.v4 || 'non specificato'}`);
    return results; // Esci subito se il percorso base non è valido
  }

  const v4Path = config.paths.v4;
  const projectType = config.projectType || 'react';
  
  // Verifica file CSS principali per progetti React
  if (projectType === 'react') {
    const cssEntry = config.paths.v4.css?.entry || [];
    const cssFiles = Array.isArray(cssEntry) ? cssEntry : [cssEntry];
    const foundCssFile = cssFiles.some(file => existsSync(join(v4Path, file)));

    if (!foundCssFile) {
      results.warnings.push(`⚠️  Nessun file CSS principale trovato. Verificare la configurazione.`);
    }
  }

  // Verifica percorso V6 (obbligatorio)
  if (!config.paths.v6 || !existsSync(config.paths.v6)) {
    results.isValid = false;
    results.errors.push(`Percorso V6 non valido: ${config.paths.v6 || 'non specificato'}`);
  }

  // Verifica percorso V3 (opzionale)
  if (config.paths.v3 && config.paths.v3 !== '' && !existsSync(config.paths.v3)) {
    results.warnings.push(`Percorso V3 specificato ma non valido: ${config.paths.v3}`);
  }

  return results;
}

async function main() {
  console.log(chalk.blue('🚀 OpenFav Migration Unified Tool'));
  console.log(chalk.gray('Combining the best of all migration versions\n'));

  const program = new Command();

  program
    .name('openfav-migrate')
    .description('Unified migration tool for OpenFav V3/V4 to V6')
    .version('2.0.0');

  // Global options
  program.option('--source <path>', 'Override source path (V4 - sorgente principale)');
  program.option('--destination <path>', 'Override destination path (V6 - destinazione migrazione)');
  program.option('--dry-run', 'Run without making any changes');
  program.option('--verbose', 'Show detailed output');

  // Setup command
  program
    .command('setup')
    .description('Interactive configuration wizard')
    .action(async () => {
      try {
        await runSetup();
      } catch (error) {
        console.error(chalk.red('❌ Setup failed:'), error);
        process.exit(1);
      }
    });

  // Validate command
  program
    .command('validate')
    .description('Validate configuration and paths')
    .action(async () => {
      const opts = program.opts();
      try {
        const config = await loadConfig({
          source: opts.source,
          destination: opts.destination
        });
        
        console.log(chalk.blue('\n🔍 Validating configuration...\n'));
        
        // Stampa informazioni di base
        console.log(chalk.green('✓ Configurazione caricata'));
        console.log(chalk.gray(`  Workspace: ${config.workspaceRoot}`));
        console.log(chalk.gray(`  V3 Path (codebase riferimento): ${config.paths.v3 || 'Non specificato'}`));
        console.log(chalk.gray(`  V4 Path (sorgente principale): ${config.paths.v4 || 'Non specificato'}`));
        console.log(chalk.gray(`  V6 Path (destinazione migrazione): ${config.paths.v6 || 'Non specificato'}`));
        
        // Esegui la validazione
        const validation = await validatePaths(config);
        
        // Mostra avvisi
        if (validation.warnings.length > 0) {
          console.log('\n' + chalk.yellow('⚠️  Avvisi:'));
          validation.warnings.forEach(warning => {
            console.log(`  - ${warning}`);
          });
        }
        
        // Mostra errori
        if (validation.errors.length > 0) {
          console.log('\n' + chalk.red('❌ Errori:'));
          validation.errors.forEach(error => {
            console.log(`  - ${error}`);
          });
          console.log('\n' + chalk.red('❌ Configurazione non valida'));
          process.exit(1);
        } else {
          console.log('\n' + chalk.green('✅ Configurazione valida'));
        }
        
      } catch (error) {
        console.error(chalk.red('\n❌ Errore durante la validazione:'), error.message);
        process.exit(1);
      }
    });

  // Tokens command
  program
    .command('tokens')
    .description('Migrate all design tokens')
    .action(async () => {
      const opts = program.opts();
      const config = await loadConfig({
        source: opts.source,
        destination: opts.destination
      });
      if (opts.dryRun) {
        console.log(chalk.yellow('\n🔍 DRY RUN MODE - No changes will be made\n'));
      }
      config.options = { ...config.options, dryRun: opts.dryRun || false };
      
      try {
        const report = await migrateDesignTokens(config);
        console.log(chalk.blue('\n📊 Migration Report:'));
        console.log(chalk.gray(`  Colors: ${report.colors.converted} converted`));
        console.log(chalk.gray(`  Keyframes: ${report.keyframes.extracted} extracted`));
        console.log(chalk.gray(`  Animations: ${report.animations.extracted} extracted`));
        console.log(chalk.gray(`  Component Classes: ${report.componentClasses.extracted} found`));
      } catch (error) {
        console.error(chalk.red('❌ Token migration failed:'), error.message);
        process.exit(1);
      }
    });

  // Colors command
  program
    .command('colors')
    .description('Migrate color tokens only')
    .action(async () => {
      const opts = program.opts();
      const config = await loadConfig({
        source: opts.source,
        destination: opts.destination
      });
      if (opts.dryRun) {
        console.log(chalk.yellow('\n🔍 DRY RUN MODE - No changes will be made\n'));
        config.options = { ...config.options, dryRun: true };
      } else {
        config.options = { ...config.options, dryRun: false };
      }
      
      try {
        const report = await migrateColors(config);
        console.log(chalk.blue('\n📊 Migration Report:'));
        console.log(chalk.gray(`  Colors: ${report.colors.converted} converted`));
      } catch (error) {
        console.error(chalk.red('❌ Color migration failed:'), error.message);
        process.exit(1);
      }
    });

  // Typography command
  program
    .command('typography')
    .description('Migrate typography tokens only')
    .action(async () => {
      const opts = program.opts();
      const config = await loadConfig({
        source: opts.source,
        destination: opts.destination
      });
      if (opts.dryRun) {
        console.log(chalk.yellow('\n🔍 DRY RUN MODE - No changes will be made\n'));
        config.options = { ...config.options, dryRun: true };
      } else {
        config.options = { ...config.options, dryRun: false };
      }
      
      try {
        const report = await migrateTypography(config);
        console.log(chalk.blue('\n📊 Migration Report:'));
        console.log(chalk.gray(`  Typography variables: ${report.typography.extracted} extracted`));
      } catch (error) {
        console.error(chalk.red('❌ Typography migration failed:'), error.message);
        process.exit(1);
      }
    });

  // Spacing command
  program
    .command('spacing')
    .description('Migrate spacing tokens only')
    .action(async () => {
      const opts = program.opts();
      const config = await loadConfig({
        source: opts.source,
        destination: opts.destination
      });
      if (opts.dryRun) {
        config.options = { ...config.options, dryRun: true };
      }
      console.log(chalk.yellow('⚠️  Spacing migration not yet implemented'));
    });

  // Components command
  program
    .command('components')
    .description('Migrate components')
    .action(async () => {
      const opts = program.opts();
      const config = await loadConfig({
        source: opts.source,
        destination: opts.destination
      });
      if (opts.dryRun) {
        console.log(chalk.yellow('\n🔍 DRY RUN MODE - No changes will be made\n'));
        config.options = { ...config.options, dryRun: true };
      } else {
        config.options = { ...config.options, dryRun: false };
      }
      
      try {
        const report = await migrateComponents(config);
        console.log(chalk.blue('\n📊 Migration Report:'));
        console.log(chalk.gray(`  Components found: ${report.components.found}`));
        console.log(chalk.gray(`  Components migrated: ${report.components.migrated}`));
        console.log(chalk.gray(`  Component classes found: ${report.componentClasses.found}`));
        if (report.components.errors.length > 0) {
          console.log(chalk.yellow(`  Errors: ${report.components.errors.length}`));
        }
      } catch (error) {
        console.error(chalk.red('❌ Component migration failed:'), error.message);
        process.exit(1);
      }
    });

  // All command - run all migrations
  program
    .command('all')
    .description('Run all migrations (tokens and components)')
    .action(async () => {
      const opts = program.opts();
      const config = await loadConfig({
        source: opts.source,
        destination: opts.destination
      });
      if (opts.dryRun) {
        console.log(chalk.yellow('\n🔍 DRY RUN MODE - No changes will be made\n'));
      }
      config.options = { ...config.options, dryRun: opts.dryRun || false };
      
      console.log(chalk.blue('\n🔄 Starting full migration...\n'));
      
      try {
        // Step 1: Migrate tokens (includes colors, keyframes, animations)
        console.log(chalk.blue('═══════════════════════════════════════'));
        console.log(chalk.blue('Step 1: Migrating Design Tokens'));
        console.log(chalk.blue('═══════════════════════════════════════'));
        const tokenReport = await migrateDesignTokens(config);
        
        // Step 2: Migrate typography
        console.log(chalk.blue('\n═══════════════════════════════════════'));
        console.log(chalk.blue('Step 2: Migrating Typography'));
        console.log(chalk.blue('═══════════════════════════════════════'));
        const typographyReport = await migrateTypography(config);
        
        // Step 3: Migrate components
        console.log(chalk.blue('\n═══════════════════════════════════════'));
        console.log(chalk.blue('Step 3: Migrating Components'));
        console.log(chalk.blue('═══════════════════════════════════════'));
        const componentReport = await migrateComponents(config);
        
        // Final report
        console.log(chalk.blue('\n═══════════════════════════════════════'));
        console.log(chalk.green('✅ Migration Completed!'));
        console.log(chalk.blue('═══════════════════════════════════════'));
        console.log(chalk.blue('\n📊 Summary:'));
        console.log(chalk.gray(`  ✓ Colors: ${tokenReport.colors.converted} converted`));
        console.log(chalk.gray(`  ✓ Typography: ${typographyReport.typography.extracted} variables extracted`));
        console.log(chalk.gray(`  ✓ Keyframes: ${tokenReport.keyframes.extracted} extracted`));
        console.log(chalk.gray(`  ✓ Animations: ${tokenReport.animations.extracted} extracted`));
        console.log(chalk.gray(`  ✓ Components: ${componentReport.components.migrated} migrated`));
        console.log(chalk.gray(`  ✓ Component Classes: ${componentReport.componentClasses.found} found`));
      } catch (error) {
        console.error(chalk.red('\n❌ Migration failed:'), error.message);
        process.exit(1);
      }
    });

  // Analyze command
  program
    .command('analyze')
    .description('Analyze project structure')
    .action(async () => {
      console.log(chalk.yellow('⚠️  Analysis not yet implemented'));
      console.log(chalk.gray('This will analyze the project structure and provide insights.'));
    });

  program.parse(process.argv);

  // Show help if no command provided
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

main().catch(error => {
  console.error(chalk.red('❌ Migration failed:'), error);
  process.exit(1);
});