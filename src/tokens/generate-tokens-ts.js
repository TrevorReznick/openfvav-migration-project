/**
 * Generatore del file tokens.ts per il progetto V6 (openfav-dev-V3)
 * Basato sulla logica dello script di migration-dev-V1
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import chalk from 'chalk';

/**
 * Genera il contenuto del file tokens.ts
 */
function generateTokensContent(colors, spacing, typography) {
  const timestamp = new Date().toISOString();
  
  // Genera entries colors con formattazione corretta
  const colorEntries = Object.entries(colors)
    .map(([key, value]) => `  "${key}": "${value}"`)
    .join(',\n');

  // Genera entries spacing
  const spacingEntries = Object.entries(spacing)
    .map(([key, value]) => `  "${key}": "${value}"`)
    .join(',\n');

  // Genera typography mantenendo la struttura nested
  const typographyEntries = [];
  if (typography.fontFamily) {
    typographyEntries.push('  "fontFamily": {');
    Object.entries(typography.fontFamily).forEach(([key, value]) => {
      typographyEntries.push(`    "${key}": "${value}"`);
    });
    typographyEntries.push('  }');
  }
  
  if (typography.fontSize) {
    if (typographyEntries.length > 0) typographyEntries.push(',');
    typographyEntries.push('  "fontSize": {');
    Object.entries(typography.fontSize).forEach(([key, value]) => {
      typographyEntries.push(`    "${key}": "${value}"`);
    });
    typographyEntries.push('  }');
  }

  return `// Auto-generated design tokens
// Generated on: ${timestamp}
// Source: migration-dev-V0/src/migration/design-system/tokens/

const colors = {
${colorEntries}
} as const;

const typography = {
${typographyEntries.join('\n')}
} as const;

const spacing = {
${spacingEntries}
} as const;

export const designTokens = {
  colors,
  typography,
  spacing
} as const;

// Export individual token groups for easier access
export const colorTokens = colors;
export const typographyTokens = typography;
export const spacingTokens = spacing;

// Type definitions for better TypeScript support
export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;

// Utility functions for common token operations
export const getSpacing = (key: keyof typeof spacing): string => {
  return \`var(--spacing-\${key})\`;
};

export const getColor = (key: keyof typeof colors): string => {
  return \`var(--color-\${key})\`;
};

export default designTokens;
`;
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
  const migrationDataPath = join(sourcePath, 'src', 'migration', 'design-system', 'tokens');
  
  try {
    // Verifica se esistono i file JSON nella directory di migrazione
    const colorsPath = join(migrationDataPath, 'colors.json');
    const spacingPath = join(migrationDataPath, 'spacing.json');
    const typographyPath = join(migrationDataPath, 'typography.json');
    
    let colors = {};
    let spacing = {};
    let typography = {};
    
    // Leggi colors.json
    if (existsSync(colorsPath)) {
      const colorsContent = readFileSync(colorsPath, 'utf-8');
      colors = JSON.parse(colorsContent);
    }
    
    // Leggi spacing.json
    if (existsSync(spacingPath)) {
      const spacingContent = readFileSync(spacingPath, 'utf-8');
      spacing = JSON.parse(spacingContent);
    }
    
    // Leggi typography.json
    if (existsSync(typographyPath)) {
      const typographyContent = readFileSync(typographyPath, 'utf-8');
      typography = JSON.parse(typographyContent);
    }
    
    return { colors, spacing, typography };
  } catch (error) {
    console.warn(chalk.yellow(`  ⚠️  Errore lettura dati migrazione: ${error.message}`));
    return { colors: {}, spacing: {}, typography: {} };
  }
}

/**
 * Genera il file tokens.ts nella destinazione
 */
export default function generateTokensTsFile(sourcePath, destPath, dryRun = false, extractedData = null) {
  console.log(chalk.blue('\n📝 Generating tokens.ts file...'));
  
  try {
    let colors, spacing, typography;
    
    if (extractedData) {
      // Usa i dati passati direttamente dalla migrazione
      colors = extractedData.colors || {};
      spacing = extractedData.spacing || {};
      typography = extractedData.typography || {};
    } else {
      // 1. Estrai i token dai dati di migrazione (modalità standalone)
      const extracted = extractTokensFromMigrationData(sourcePath);
      colors = extracted.colors;
      spacing = extracted.spacing;
      typography = extracted.typography;
    }
    
    console.log(chalk.green(`  ✓ Found ${Object.keys(colors).length} colors`));
    console.log(chalk.green(`  ✓ Found ${Object.keys(spacing).length} spacing tokens`));
    console.log(chalk.green(`  ✓ Found ${Object.keys(typography.fontFamily || {}).length} font families`));
    console.log(chalk.green(`  ✓ Found ${Object.keys(typography.fontSize || {}).length} font sizes`));
    
    // 2. Genera il contenuto del file
    const tokensContent = generateTokensContent(colors, spacing, typography);
    
    if (dryRun) {
      console.log(chalk.yellow('\n🔍 [DRY RUN] Would generate tokens.ts with content:'));
      console.log(tokensContent.substring(0, 500) + '...');
      return;
    }
    
    // 3. Scrivi il file nella destinazione
    const tokensPath = join(destPath, 'src', 'lib', 'tokens.ts');
    
    // Crea la directory se non esiste
    const tokensDir = dirname(tokensPath);
    if (!existsSync(tokensDir)) {
      mkdirSync(tokensDir, { recursive: true });
      console.log(chalk.green(`  ✓ Created directory: ${tokensDir}`));
    }
    
    // Crea backup se il file esiste
    createBackup(tokensPath);
    
    // Scrivi il nuovo file
    writeFileSync(tokensPath, tokensContent, 'utf-8');
    console.log(chalk.green(`  ✓ Generated tokens.ts: ${tokensPath}`));
    
    return tokensPath;
  } catch (error) {
    console.error(chalk.red('❌ Error generating tokens.ts:'), error.message);
    throw error;
  }
}
