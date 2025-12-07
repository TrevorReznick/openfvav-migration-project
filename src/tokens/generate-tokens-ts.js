/**
 * Generatore del file tokens.ts per il progetto V6 (openfav-dev-V3)
 * Basato sulla logica dello script di migration-dev-V1
 * Aggiornato per supportare i temi light/dark e le variabili CSS
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

/**
 * Genera il contenuto del file tokens.ts
 */
function generateTokensContent(colors, spacing, typography) {
  const timestamp = new Date().toISOString();
  
  // Aggiungiamo le variabili di tema mancanti con valori di default
  const themeColors = {
    // Colori base
    background: colors.background || '222 47% 11%',
    foreground: colors.foreground || '0 0% 100%',
    primary: colors.primary || '262 83% 58%',
    'primary-foreground': colors['primary-foreground'] || '0 0% 100%',
    secondary: colors.secondary || '217 33% 17%',
    'secondary-foreground': colors['secondary-foreground'] || '0 0% 100%',
    accent: colors.accent || '271 91% 65%',
    'accent-foreground': colors['accent-foreground'] || '0 0% 100%',
    destructive: colors.destructive || '0 84% 60%',
    'destructive-foreground': colors['destructive-foreground'] || '210 40% 98%',
    muted: colors.muted || '217 33% 17%',
    'muted-foreground': colors['muted-foreground'] || '163 78% 77%',
    border: colors.border || '217 33% 17%',
    input: colors.input || '217 33% 17%',
    ring: colors.ring || '262 83% 58%',
    card: colors.card || '217 33% 17%',
    'card-foreground': colors['card-foreground'] || '0 0% 100%',
    popover: colors.popover || '217 33% 17%',
    'popover-foreground': colors['popover-foreground'] || '0 0% 100%',
    // Manteniamo i colori esistenti
    ...colors
  };

  // Genera le variabili CSS
  const cssVariables = `
:root {
  /* Theme Colors */
  --background: ${themeColors.background};
  --foreground: ${themeColors.foreground};
  --primary: ${themeColors.primary};
  --primary-foreground: ${themeColors['primary-foreground']};
  --secondary: ${themeColors.secondary};
  --secondary-foreground: ${themeColors['secondary-foreground']};
  --accent: ${themeColors.accent};
  --accent-foreground: ${themeColors['accent-foreground']};
  --destructive: ${themeColors.destructive};
  --destructive-foreground: ${themeColors['destructive-foreground']};
  --muted: ${themeColors.muted};
  --muted-foreground: ${themeColors['muted-foreground']};
  --border: ${themeColors.border};
  --input: ${themeColors.input};
  --ring: ${themeColors.ring};
  --card: ${themeColors.card};
  --card-foreground: ${themeColors['card-foreground']};
  --popover: ${themeColors.popover};
  --popover-foreground: ${themeColors['popover-foreground']};
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
}`;

  // Genera il contenuto TypeScript
  const tsContent = `// Auto-generated design tokens
// Generated on: ${timestamp}
// Source: migration-dev-V0/src/migration/design-system/tokens/

const colors = ${JSON.stringify(themeColors, null, 2)} as const;

const typography = ${JSON.stringify(typography, null, 2)} as const;

const spacing = ${JSON.stringify(spacing, null, 2)} as const;

// Utility types
type ColorToken = keyof typeof colors;
type SpacingToken = keyof typeof spacing;

// Utility functions
const getSpacing = (key: SpacingToken): string => \`var(--spacing-\${key})\`;

const getColor = (key: ColorToken): string => {
  const value = colors[key];
  if (!value) {
    console.warn(\`Color token "\${key}" not found. Using fallback color.\`);
    return 'hsl(0, 100%, 50%)';
  }
  return \`hsl(\${value})\`;
};

export {
  colors,
  typography,
  spacing,
  getSpacing,
  getColor,
  type ColorToken,
  type SpacingToken
};

export default {
  colors,
  typography,
  spacing,
  getSpacing,
  getColor
} as const;

// CSS Variables
export const cssVariables = \`${cssVariables}\`;`;

  return tsContent;
}

/**
 * Crea un backup automatico del file con timestamp
 */
function createBackup(filePath) {
  if (!existsSync(filePath)) return null;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup.${timestamp}`;
  
  try {
    copyFileSync(filePath, backupPath);
    console.log(chalk.blue(`  📦 Backup creato: ${backupPath}`));
    return backupPath;
  } catch (error) {
    console.warn(chalk.yellow(`  ⚠️  Impossibile creare backup: ${error.message}`));
    return null;
  }
}

/**
 * Estrae i token dal file JSON di migrazione
 */
function extractTokensFromMigrationData(sourcePath) {
  try {
    const migrationData = JSON.parse(readFileSync(sourcePath, 'utf8'));
    return {
      colors: migrationData.colors || {},
      spacing: migrationData.spacing || {},
      typography: migrationData.typography || {}
    };
  } catch (error) {
    console.error(chalk.red(`Errore durante l'estrazione dei token: ${error.message}`));
    return {
      colors: {},
      spacing: {},
      typography: {}
    };
  }
}

/**
 * Genera il file tokens.ts nella destinazione
 */
async function generateTokensTsFile(sourcePath, destPath, dryRun = false, extractedData = null) {
  try {
    console.log(chalk.cyan(`\n🔄 Generazione del file tokens.ts in corso...`));
    
    let colors, spacing, typography;
    
    if (extractedData) {
      // Usa i dati già estratti se forniti
      ({ colors, spacing, typography } = extractedData);
    } else {
      // Altrimenti estrai i token dal file sorgente
      const tokens = extractTokensFromMigrationData(sourcePath);
      colors = tokens.colors;
      spacing = tokens.spacing;
      typography = tokens.typography;
    }
    
    // Genera il contenuto del file
    const content = generateTokensContent(colors, spacing, typography);
    
    if (dryRun) {
      console.log(chalk.yellow('\n⚠️  Modalità dry-run attiva. Ecco il contenuto che verrebbe generato:'));
      console.log('='.repeat(80));
      console.log(content);
      console.log('='.repeat(80));
      return { success: true, dryRun: true };
    }
    
    // Crea la directory di destinazione se non esiste
    const destDir = dirname(destPath);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    
    // Crea un backup del file esistente
    if (existsSync(destPath)) {
      createBackup(destPath);
    }
    
    // Scrivi il file
    writeFileSync(destPath, content, 'utf8');
    
    console.log(chalk.green(`✅ File generato con successo: ${destPath}`));
    return { success: true, filePath: destPath };
    
  } catch (error) {
    console.error(chalk.red(`❌ Errore durante la generazione del file tokens.ts: ${error.message}`));
    return { success: false, error: error.message };
  }
}

// Se eseguito direttamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const sourcePath = args[0] || join(process.cwd(), 'tokens.json');
  const destPath = args[1] || join(process.cwd(), 'src', 'lib', 'tokens.ts');
  const dryRun = args.includes('--dry-run');
  
  generateTokensTsFile(sourcePath, destPath, dryRun)
    .then(({ success }) => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error(chalk.red(`❌ Errore: ${error.message}`));
      process.exit(1);
    });
}

export default generateTokensTsFile;