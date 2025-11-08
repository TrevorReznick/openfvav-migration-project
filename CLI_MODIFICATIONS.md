# 🔧 Modifiche Necessarie al CLI per Supportare l'Interfaccia Web

## 📋 Panoramica

Per far funzionare completamente l'interfaccia web, il CLI deve essere modificato per accettare i path `--source` e `--destination` come argomenti opzionali che sovrascrivono quelli nel file di configurazione.

## 🔄 Modifiche da Apportare a `src/cli.js`

### 1. Modificare la funzione `loadConfig`

Sostituire la funzione `loadConfig()` esistente con questa versione che accetta opzioni:

```javascript
async function loadConfig(options = {}) {
  if (!existsSync(CONFIG_PATH)) {
    console.error(chalk.red('❌ Error: migration.config.json not found'));
    console.log(chalk.yellow('Please create a migration.config.json file in the migration directory.'));
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
    }
    
    if (options.destination) {
      if (!existsSync(options.destination)) {
        console.error(chalk.red(`❌ Error: Destination path does not exist: ${options.destination}`));
        process.exit(1);
      }
      config.paths = config.paths || {};
      config.paths.v6 = options.destination;
    }
    
    // Resolve paths relative to workspace root
    const resolvedPaths = {};
    for (const [version, path] of Object.entries(config.paths || {})) {
      // If path is relative, join with workspaceRoot
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
```

### 2. Aggiungere le Opzioni Globali

Aggiungere le opzioni `--source` e `--destination` al programma principale:

```javascript
program
  .name('openfav-migrate')
  .description('Migrate OpenFav from V3/V4 to V6')
  .version('1.0.0')
  .option('--source <path>', 'Override source path (V3/V4)')
  .option('--destination <path>', 'Override destination path (V6)')
  .option('--dry-run', 'Run without making any changes');
```

### 3. Modificare i Comandi per Passare le Opzioni

Modificare tutti i comandi per passare le opzioni a `loadConfig()`:

```javascript
program.command('tokens')
  .description('Migrate design tokens from V3/V4 to V6')
  .action(async () => {
    const opts = program.opts();
    const config = await loadConfig({
      source: opts.source,
      destination: opts.destination
    });
    if (opts.dryRun) {
      console.log(chalk.yellow('\n🔍 DRY RUN MODE - No changes will be made\n'));
      config.options = { ...config.options, dryRun: true };
    }
    await migrateDesignTokens(config);
  });

program.command('spacing')
  .description('Estrai e migra i token di spaziatura da V4 a V6')
  .action(async () => {
    const opts = program.opts();
    const config = await loadConfig({
      source: opts.source,
      destination: opts.destination
    });
    if (opts.dryRun) {
      console.log(chalk.yellow('\n🔍 DRY RUN MODE - No changes will be made\n'));
      config.options = { ...config.options, dryRun: true };
    }
    await migrateSpacingTokens(config);
  });

program.command('components')
  .description('Migrate components from V3/V4 to V6')
  .action(async () => {
    const opts = program.opts();
    const config = await loadConfig({
      source: opts.source,
      destination: opts.destination
    });
    if (opts.dryRun) {
      console.log(chalk.yellow('\n🔍 DRY RUN MODE - No changes will be made\n'));
      config.options = { ...config.options, dryRun: true };
    }
    await migrateComponents(config);
  });

program.command('all')
  .description('Run all migrations')
  .action(async () => {
    const opts = program.opts();
    const config = await loadConfig({
      source: opts.source,
      destination: opts.destination
    });
    if (opts.dryRun) {
      console.log(chalk.yellow('\n🔍 DRY RUN MODE - No changes will be made\n'));
      config.options = { ...config.options, dryRun: true };
    }
    console.log(chalk.blue('\n🔄 Starting full migration...'));
    await migrateDesignTokens(config);
    await migrateComponents(config);
    console.log(chalk.green('\n✅ All migrations completed successfully!'));
  });
```

## ✅ Versione Completa del CLI Modificato

Vedi il file `src/cli-enhanced.js` per una versione completa del CLI con tutte le modifiche applicate.

## 🧪 Test

Dopo le modifiche, testa il CLI con:

```bash
# Usando il config file
node src/cli.js tokens

# Sovrascrivendo i path
node src/cli.js tokens --source /path/to/v4 --destination /path/to/v6

# Con dry-run
node src/cli.js tokens --source /path/to/v4 --destination /path/to/v6 --dry-run
```

## 📝 Note

- Se `--source` o `--destination` non sono specificati, il CLI usa i path dal file di configurazione
- I path vengono validati prima dell'uso
- Le opzioni funzionano con tutti i comandi (tokens, components, spacing, all)

