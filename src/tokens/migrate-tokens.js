/**
 * Modulo principale per la migrazione dei design tokens
 */

import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import chalk from 'chalk';
import { extractTokensFromTailwindConfig } from './extractors/tailwind-config-extractor.js';
import { extractTokensFromCss } from './extractors/css-extractor.js';
import { convertColorToHsl, hexToHsl, rgbaStringToHsl } from '../utils/color-converter.js';

/**
 * Migra tutti i design tokens da V4 (sorgente) a V6 (destinazione)
 * @param {Object} config - Configurazione della migrazione
 * @param {string} config.paths.v4 - Path sorgente principale (V4)
 * @param {string} config.paths.v6 - Path destinazione migrazione (V6)
 * @returns {Object} - Report della migrazione
 */
export async function migrateDesignTokens(config) {
  const report = {
    colors: { extracted: 0, converted: 0, errors: [] },
    keyframes: { extracted: 0, added: 0, errors: [] },
    animations: { extracted: 0, added: 0, errors: [] },
    componentClasses: { extracted: 0, converted: 0, errors: [] },
    cssVariables: { extracted: 0, converted: 0, errors: [] },
  };

  const sourcePath = config.paths.v4;  // Sorgente principale (V4)
  const destPath = config.paths.v6;     // Destinazione migrazione (V6)
  const dryRun = config.options?.dryRun || false;

  console.log(chalk.blue('\n🔄 Starting token migration...'));
  console.log(chalk.gray(`Source: ${sourcePath}`));
  console.log(chalk.gray(`Destination: ${destPath}`));
  if (dryRun) {
    console.log(chalk.yellow('🔍 DRY RUN MODE - No changes will be made\n'));
  }

  try {
    // 1. Estrai token da tailwind.config.ts
    console.log(chalk.blue('\n📦 Extracting tokens from tailwind.config.ts...'));
    const tailwindTokens = extractTokensFromTailwindConfig(sourcePath);
    
    report.colors.extracted = Object.keys(tailwindTokens.colors || {}).length;
    report.keyframes.extracted = Object.keys(tailwindTokens.keyframes || {}).length;
    report.animations.extracted = Object.keys(tailwindTokens.animations || {}).length;

    console.log(chalk.green(`  ✓ Extracted ${report.colors.extracted} colors`));
    console.log(chalk.green(`  ✓ Extracted ${report.keyframes.extracted} keyframes`));
    console.log(chalk.green(`  ✓ Extracted ${report.animations.extracted} animations`));

    // 2. Estrai token da index.css
    console.log(chalk.blue('\n📦 Extracting tokens from CSS files...'));
    const cssTokens = extractTokensFromCss(sourcePath);
    
    report.cssVariables.extracted = Object.keys(cssTokens.cssVariables || {}).length;
    report.componentClasses.extracted = cssTokens.componentClasses?.length || 0;

    console.log(chalk.green(`  ✓ Extracted ${report.cssVariables.extracted} CSS variables`));
    console.log(chalk.green(`  ✓ Extracted ${report.componentClasses.extracted} component classes`));

    // 3. Converti colori hex/rgba → HSL
    console.log(chalk.blue('\n🎨 Converting colors to HSL...'));
    const convertedColors = convertColors(tailwindTokens.colors, cssTokens.cssVariables);
    report.colors.converted = Object.keys(convertedColors).length;
    console.log(chalk.green(`  ✓ Converted ${report.colors.converted} colors to HSL`));

    // 4. Genera design tokens TypeScript
    if (!dryRun) {
      console.log(chalk.blue('\n📝 Generating design tokens...'));
      await generateDesignTokens(destPath, convertedColors);
      console.log(chalk.green('  ✓ Generated design tokens TypeScript'));
    } else {
      console.log(chalk.yellow('\n📝 [DRY RUN] Would generate design tokens...'));
    }

    // 5. Aggiorna CSS variables in globals.css
    if (!dryRun) {
      console.log(chalk.blue('\n📝 Updating CSS variables...'));
      await updateCssVariables(destPath, convertedColors);
      console.log(chalk.green('  ✓ Updated CSS variables'));
    } else {
      console.log(chalk.yellow('\n📝 [DRY RUN] Would update CSS variables...'));
    }

    // 6. Aggiorna tailwind.config.ts
    if (!dryRun) {
      console.log(chalk.blue('\n📝 Updating tailwind.config.ts...'));
      await updateTailwindConfig(destPath, convertedColors, tailwindTokens.keyframes, tailwindTokens.animations);
      console.log(chalk.green('  ✓ Updated tailwind.config.ts'));
    } else {
      console.log(chalk.yellow('\n📝 [DRY RUN] Would update tailwind.config.ts...'));
    }

    // 7. Genera report component classes
    if (report.componentClasses.extracted > 0) {
      console.log(chalk.blue('\n📋 Component classes found:'));
      cssTokens.componentClasses.forEach(cls => {
        console.log(chalk.gray(`  - .${cls.name}`));
      });
      console.log(chalk.yellow('  ⚠️  Component classes migration not yet implemented'));
    }

    console.log(chalk.green('\n✅ Token migration completed successfully!'));

    return report;
  } catch (error) {
    console.error(chalk.red('\n❌ Error during token migration:'), error);
    throw error;
  }
}

/**
 * Converte tutti i colori in HSL
*/
function convertColors(tailwindColors, cssVariables) {
  const converted = {};

  // Converti colori da tailwind.config.ts
  for (const [colorName, colorValue] of Object.entries(tailwindColors || {})) {
    try {
      if (typeof colorValue === 'object') {
        // Colore con varianti
        converted[colorName] = {};
        for (const [variant, value] of Object.entries(colorValue)) {
          converted[colorName][variant] = convertColorToHsl(value);
        }
      } else {
        // Colore semplice
        converted[colorName] = convertColorToHsl(colorValue);
      }
    } catch (error) {
      console.warn(chalk.yellow(`  ⚠️  Could not convert color ${colorName}: ${error.message}`));
    }
  }

  // Converti CSS variables se contengono colori
  for (const [varName, varValue] of Object.entries(cssVariables || {})) {
    // Solo se sembra un colore
    if (varValue.match(/^#|^rgba?|^hsl/)) {
      try {
        const hslValue = convertColorToHsl(varValue);
        converted[varName] = hslValue;
      } catch (error) {
        // Ignora se non è un colore valido
      }
    }
  }

  return converted;
}

/**
 * Genera il file design tokens TypeScript
 */
async function generateDesignTokens(destPath, colors) {
  const tokensPath = join(destPath, 'src', 'lib', 'tokens.ts');
  
  // Leggi il file esistente se presente
  let existingTokens = { colors: {}, typography: {}, spacing: {} };
  if (existsSync(tokensPath)) {
    try {
      const content = readFileSync(tokensPath, 'utf-8');
      // Estrai i colori esistenti (semplificato)
      const colorMatch = content.match(/const colors = \{([^}]+)\}/s);
      if (colorMatch) {
        // Mantieni i colori esistenti
      }
    } catch (error) {
      // Ignora errori di parsing
    }
  }

  // Crea directory se non esiste
  const tokensDir = join(destPath, 'src', 'lib');
  if (!existsSync(tokensDir)) {
    mkdirSync(tokensDir, { recursive: true });
  }

  // Genera nuovo file tokens.ts
  const colorKeys = Object.keys(colors).map(key => `  ${key}: '${key}'`).join(',\n');

  // Nuovo codice
  const colorEntries = Object.entries(colors).map(([key, value]) => {
    // Usa il valore HSL se già presente, altrimenti converte
    const hslValue = value.includes('%') ? value : convertColorToHsl(value);
    return `  '${key}': '${hslValue}'`;
  }).join(',\n');
  
  const tokensContent = `// Design Tokens - Auto-generated by migration tool

const colors = {
${colorEntries}
} as const;

  const typography = {
    fontFamily: {
      base: 'font-sans',
      mono: 'font-mono'
    },
    fontSize: {
      base: 'text-base',
      lg: 'text-lg',
      sm: 'text-sm'
    }
  } as const;

  const spacing = {
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '32': '8rem',
    '40': '10rem',
    '48': '12rem',
    '56': '14rem',
    '64': '16rem'
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

  // Utility functions for common token operations
  export const getSpacing = (key: keyof typeof spacing): string => {
    return \`var(--spacing-\${key})\`;
  };

  export const getColor = (key: keyof typeof colors): string => {
    return \`var(--color-\${key})\`;
  };

  // Type definitions for better TypeScript support
  export type ColorToken = keyof typeof colors;
  export type SpacingToken = keyof typeof spacing;

  export default designTokens;
  `;

  writeFileSync(tokensPath, tokensContent);
}

/**
 * Aggiorna le CSS variables in globals.css
 */
async function updateCssVariables(destPath, colors) {
  const globalsPath = join(destPath, 'src', 'styles', 'globals.css');
  
  if (!existsSync(globalsPath)) {
    console.warn(chalk.yellow(`  ⚠️  globals.css not found at ${globalsPath}`));
    return;
  }

  let content = readFileSync(globalsPath, 'utf-8');

  // Aggiungi o aggiorna le CSS variables per i colori
  const colorVars = [];
  for (const [colorName, colorValue] of Object.entries(colors)) {
    if (typeof colorValue === 'string') {
      colorVars.push(`  --color-${colorName}: ${colorValue};`);
    } else if (typeof colorValue === 'object') {
      // Colore con varianti
      for (const [variant, value] of Object.entries(colorValue)) {
        const varName = variant === 'DEFAULT' ? colorName : `${colorName}-${variant}`;
        colorVars.push(`  --color-${varName}: ${value};`);
      }
    }
  }

  // Inserisci le variabili nel :root se non esistono già
  if (colorVars.length > 0) {
    const rootPattern = /(:root\s*\{)/;
    if (rootPattern.test(content)) {
      // Aggiungi dopo :root {
      content = content.replace(rootPattern, `$1\n    /* Design Tokens - Colors (migrated) */\n${colorVars.join('\n')}\n`);
    } else {
      // Aggiungi :root se non esiste
      content = `@layer base {\n  :root {\n    /* Design Tokens - Colors (migrated) */\n${colorVars.join('\n')}\n  }\n}\n\n${content}`;
    }
  }

  writeFileSync(globalsPath, content);
}

/**
 * Aggiorna tailwind.config.ts con i nuovi colori e keyframes
 */
async function updateTailwindConfig(destPath, colors, keyframes, animations) {
  const configPath = join(destPath, 'tailwind.config.ts');
  
  if (!existsSync(configPath)) {
    console.warn(chalk.yellow(`  ⚠️  tailwind.config.ts not found at ${configPath}`));
    return;
  }

  let content = readFileSync(configPath, 'utf-8');

  // Aggiorna i colori nella sezione extend.colors
  const colorEntries = [];
  for (const [colorName, colorValue] of Object.entries(colors)) {
    if (typeof colorValue === 'string') {
      colorEntries.push(`        ${colorName}: "hsl(var(--color-${colorName}))",`);
    } else if (typeof colorValue === 'object') {
      // Colore con varianti
      const variants = [];
      for (const [variant, value] of Object.entries(colorValue)) {
        if (variant === 'DEFAULT') {
          variants.push(`          DEFAULT: "hsl(var(--color-${colorName}))",`);
        } else {
          variants.push(`          ${variant}: "hsl(var(--color-${colorName}-${variant}))",`);
        }
      }
      colorEntries.push(`        ${colorName}: {\n${variants.join('\n')}\n        },`);
    }
  }

  // Inserisci i colori nella sezione extend.colors
  if (colorEntries.length > 0) {
    const colorsPattern = /(colors:\s*\{)/;
    if (colorsPattern.test(content)) {
      // Aggiungi dopo colors: {
      content = content.replace(colorsPattern, `$1\n          // Migrated colors from astroflux-v4\n${colorEntries.join('\n')}\n`);
    }
  }

  // Aggiungi keyframes se presenti
  if (keyframes && Object.keys(keyframes).length > 0) {
    const keyframesEntries = [];
    for (const [keyframeName, frames] of Object.entries(keyframes)) {
      const frameEntries = [];
      for (const [frame, props] of Object.entries(frames)) {
        frameEntries.push(`          "${frame}": { ${props} }`);
      }
      keyframesEntries.push(`        "${keyframeName}": {\n${frameEntries.join(',\n')}\n        }`);
    }

    const keyframesPattern = /(keyframes:\s*\{)/;
    if (keyframesPattern.test(content)) {
      content = content.replace(keyframesPattern, `$1\n          // Migrated keyframes from astroflux-v4\n${keyframesEntries.join(',\n')},\n`);
    }
  }

  // Aggiungi animazioni se presenti
  if (animations && Object.keys(animations).length > 0) {
    const animationEntries = [];
    for (const [animName, animValue] of Object.entries(animations)) {
      animationEntries.push(`          "${animName}": "${animValue}",`);
    }

    const animationsPattern = /(animation:\s*\{)/;
    if (animationsPattern.test(content)) {
      content = content.replace(animationsPattern, `$1\n          // Migrated animations from astroflux-v4\n${animationEntries.join('\n')}\n`);
    }
  }

  writeFileSync(configPath, content);
}

/**
 * Migra solo i colori da V4 (sorgente) a V6 (destinazione)
 * @param {Object} config - Configurazione della migrazione
 * @param {string} config.paths.v4 - Path sorgente principale (V4)
 * @param {string} config.paths.v6 - Path destinazione migrazione (V6)
 * @returns {Object} - Report della migrazione
 */
export async function migrateColors(config) {
  const report = {
    colors: { extracted: 0, converted: 0, errors: [] }
  };

  const sourcePath = config.paths.v4;  // Sorgente principale (V4)
  const destPath = config.paths.v6;     // Destinazione migrazione (V6)
  const dryRun = config.options?.dryRun || false;

  console.log(chalk.blue('\n🎨 Starting color migration...'));
  console.log(chalk.gray(`Source: ${sourcePath}`));
  console.log(chalk.gray(`Destination: ${destPath}`));
  if (dryRun) {
    console.log(chalk.yellow('🔍 DRY RUN MODE - No changes will be made\n'));
  }

  try {
    // 1. Estrai colori da tailwind.config.ts
    console.log(chalk.blue('\n📦 Extracting colors from tailwind.config.ts...'));
    const tailwindTokens = extractTokensFromTailwindConfig(sourcePath);
    
    report.colors.extracted = Object.keys(tailwindTokens.colors || {}).length;
    console.log(chalk.green(`  ✓ Extracted ${report.colors.extracted} colors`));

    // 2. Estrai CSS variables da file CSS
    console.log(chalk.blue('\n📦 Extracting colors from CSS files...'));
    const cssTokens = extractTokensFromCss(sourcePath);
    
    // Filtra solo le CSS variables che sono colori
    const colorVariables = {};
    for (const [varName, varValue] of Object.entries(cssTokens.cssVariables || {})) {
      if (varValue.match(/^#|^rgba?|^hsl/)) {
        colorVariables[varName] = varValue;
      }
    }

    // 3. Converti colori hex/rgba → HSL
    console.log(chalk.blue('\n🎨 Converting colors to HSL...'));
    const convertedColors = convertColors(tailwindTokens.colors, colorVariables);
    report.colors.converted = Object.keys(convertedColors).length;
    console.log(chalk.green(`  ✓ Converted ${report.colors.converted} colors to HSL`));

    // 4. Genera design tokens (solo colori)
    if (!dryRun) {
      console.log(chalk.blue('\n📝 Generating color tokens...'));
      await generateDesignTokens(destPath, convertedColors);
      console.log(chalk.green('  ✓ Generated color tokens'));
    } else {
      console.log(chalk.yellow('\n📝 [DRY RUN] Would generate color tokens...'));
    }

    // 5. Aggiorna CSS variables in globals.css
    if (!dryRun) {
      console.log(chalk.blue('\n📝 Updating CSS variables...'));
      await updateCssVariables(destPath, convertedColors);
      console.log(chalk.green('  ✓ Updated CSS variables'));
    } else {
      console.log(chalk.yellow('\n📝 [DRY RUN] Would update CSS variables...'));
    }

    // 6. Aggiorna tailwind.config.ts (solo colori)
    if (!dryRun) {
      console.log(chalk.blue('\n📝 Updating tailwind.config.ts...'));
      await updateTailwindConfig(destPath, convertedColors, {}, {});
      console.log(chalk.green('  ✓ Updated tailwind.config.ts'));
    } else {
      console.log(chalk.yellow('\n📝 [DRY RUN] Would update tailwind.config.ts...'));
    }

    console.log(chalk.green('\n✅ Color migration completed successfully!'));

    return report;
  } catch (error) {
    console.error(chalk.red('\n❌ Error during color migration:'), error);
    throw error;
  }
}

/**
 * Migra solo la tipografia da V4 (sorgente) a V6 (destinazione)
 * @param {Object} config - Configurazione della migrazione
 * @param {string} config.paths.v4 - Path sorgente principale (V4)
 * @param {string} config.paths.v6 - Path destinazione migrazione (V6)
 * @returns {Object} - Report della migrazione
 */
export async function migrateTypography(config) {
  const report = {
    typography: { extracted: 0, converted: 0, errors: [] }
  };

  const sourcePath = config.paths.v4;  // Sorgente principale (V4)
  const destPath = config.paths.v6;     // Destinazione migrazione (V6)
  const dryRun = config.options?.dryRun || false;

  console.log(chalk.blue('\n📝 Starting typography migration...'));
  console.log(chalk.gray(`Source: ${sourcePath}`));
  console.log(chalk.gray(`Destination: ${destPath}`));
  if (dryRun) {
    console.log(chalk.yellow('🔍 DRY RUN MODE - No changes will be made\n'));
  }

  try {
    // 1. Estrai CSS variables da file CSS
    console.log(chalk.blue('\n📦 Extracting typography from CSS files...'));
    const cssTokens = extractTokensFromCss(sourcePath);
    
    // Filtra solo le CSS variables che sono tipografia (font, text, line-height, etc.)
    const typographyVariables = {};
    for (const [varName, varValue] of Object.entries(cssTokens.cssVariables || {})) {
      if (varName.match(/^font-|^text-|^leading-|^tracking-/)) {
        typographyVariables[varName] = varValue;
      }
    }

    report.typography.extracted = Object.keys(typographyVariables).length;
    console.log(chalk.green(`  ✓ Extracted ${report.typography.extracted} typography variables`));

    // 2. Aggiorna CSS variables in globals.css (solo tipografia)
    if (!dryRun && report.typography.extracted > 0) {
      console.log(chalk.blue('\n📝 Updating CSS variables...'));
      const globalsPath = join(destPath, 'src', 'styles', 'globals.css');
      
      if (existsSync(globalsPath)) {
        let content = readFileSync(globalsPath, 'utf-8');
        
        const typographyVars = [];
        for (const [varName, varValue] of Object.entries(typographyVariables)) {
          typographyVars.push(`  --${varName}: ${varValue};`);
        }

        if (typographyVars.length > 0) {
          const rootPattern = /(:root\s*\{)/;
          if (rootPattern.test(content)) {
            content = content.replace(rootPattern, `$1\n    /* Design Tokens - Typography (migrated) */\n${typographyVars.join('\n')}\n`);
          } else {
            content = `@layer base {\n  :root {\n    /* Design Tokens - Typography (migrated) */\n${typographyVars.join('\n')}\n  }\n}\n\n${content}`;
          }
        }

        writeFileSync(globalsPath, content);
        console.log(chalk.green('  ✓ Updated CSS variables'));
      } else {
        console.warn(chalk.yellow(`  ⚠️  globals.css not found at ${globalsPath}`));
      }
    } else if (dryRun) {
      console.log(chalk.yellow('\n📝 [DRY RUN] Would update CSS variables...'));
    }

    console.log(chalk.green('\n✅ Typography migration completed successfully!'));

    return report;
  } catch (error) {
    console.error(chalk.red('\n❌ Error during typography migration:'), error);
    throw error;
  }
}

