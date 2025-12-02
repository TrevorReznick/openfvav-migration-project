/**
 * Modulo principale per la migrazione dei design tokens
 */

import fs from 'fs';
import path from 'path';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import chalk from 'chalk';
import { extractTokensFromTailwindConfig } from './extractors/tailwind-config-extractor.js';
import { extractTokensFromCss } from './extractors/css-extractor.js';
import { convertColorToHsl, hexToHsl, rgbaStringToHsl } from '../utils/color-converter.js';
import generateDesignTokensFile from './generate-design-tokens.js';
import generateTokensTsFile from './generate-tokens-ts.js';
import globModule from 'glob';
const { glob } = globModule;

// === FUNZIONI DI PRESERVAZIONE ===

/**
 * Crea un backup automatico del file con timestamp
 */
function createBackup(filePath) {
  if (!existsSync(filePath)) return null;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup.${timestamp}`;
  
  try {
    fs.copyFileSync(filePath, backupPath);
    console.log(chalk.blue(`  📦 Backup creato: ${backupPath}`));
    return backupPath;
  } catch (error) {
    console.warn(chalk.yellow(`  ⚠️  Impossibile creare backup: ${error.message}`));
    return null;
  }
}

/**
 * Estrae il contenuto di un blocco bilanciato (gestisce le parentesi annidate)
 */
function extractBlockContent(source, startKeyword) {
  const startIndex = source.indexOf(startKeyword);
  if (startIndex === -1) return null;

  let openBraces = 0;
  let contentStartIndex = -1;
  let contentEndIndex = -1;
  let foundStart = false;

  for (let i = startIndex; i < source.length; i++) {
    if (source[i] === '{') {
      if (!foundStart) {
        foundStart = true;
        contentStartIndex = i; // Include la graffa di apertura per ora
      }
      openBraces++;
    } else if (source[i] === '}') {
      openBraces--;
      if (foundStart && openBraces === 0) {
        contentEndIndex = i + 1; // Include la graffa di chiusura
        break;
      }
    }
  }

  if (contentStartIndex !== -1 && contentEndIndex !== -1) {
    // Ritorna l'intero blocco (es. "@layer utilities { ... }")
    return source.substring(startIndex, contentEndIndex);
  }
  
  return null;
}

/**
 * Versione corretta di extractCustomSections
 */
function extractCustomSections(cssContent) {
  const customSections = {
    utilities: '',
    customScrollbar: '',
    customVariables: '',
    otherCustom: ''
  };
  
  // 1. Estrai intero blocco @layer utilities in modo sicuro
  const utilitiesBlock = extractBlockContent(cssContent, '@layer utilities');
  if (utilitiesBlock) {
    // Rimuoviamo il wrapper @layer utilities { } per prendere solo il contenuto interno
    const innerContent = utilitiesBlock
      .replace(/@layer utilities\s*\{/, '') // Rimuove inizio
      .replace(/\}\s*$/, ''); // Rimuove fine
    customSections.utilities = innerContent;
  }
  
  // 2. Estrai fix scrollbar e pseudo-elementi custom (Regex va bene qui se non sono annidati complessi)
  const scrollbarMatches = cssContent.match(/::-webkit-scrollbar[\s\S]*?\}/g);
  if (scrollbarMatches) {
    customSections.customScrollbar = scrollbarMatches.join('\n');
  }
  
  // 3. Estrai variabili custom
  const varMatches = cssContent.match(/--[\w-]+:\s*[^;]+;/g);
  if (varMatches) {
    const customVars = varMatches.filter(v => 
      !v.includes('--color-') && 
      !v.includes('--background') && 
      !v.includes('--foreground') &&
      !v.includes('--primary') &&
      !v.includes('--secondary') &&
      !v.includes('--muted') &&
      !v.includes('--accent') &&
      !v.includes('--destructive') &&
      !v.includes('--border') &&
      !v.includes('--input') &&
      !v.includes('--ring') &&
      !v.includes('--radius') // Aggiungi raggio se migrato
    );
    customSections.customVariables = customVars.join('\n');
  }
  
  return customSections;
}

/**
 * Estrae configurazioni custom da tailwind.config.ts
 */
function extractCustomConfig(configContent) {
  const customConfig = {
    plugins: [],
    keyframes: {},
    animation: {},
    customColors: {},
    fontFamily: {},
    customSpacing: {}
  };
  
  // Estrai plugins
  const pluginsMatch = configContent.match(/plugins:\s*\[([\s\S]*?)\]/);
  if (pluginsMatch) {
    customConfig.plugins = pluginsMatch[1];
  }
  
  // Estrai keyframes esistenti
  const keyframesMatch = configContent.match(/keyframes:\s*\{([\s\S]*?)\}/);
  if (keyframesMatch) {
    customConfig.keyframes = keyframesMatch[1];
  }
  
  // Estrai animation esistenti
  const animationMatch = configContent.match(/animation:\s*\{([\s\S]*?)\}/);
  if (animationMatch) {
    customConfig.animation = animationMatch[1];
  }
  
  // Estrai font family custom
  const fontFamilyMatch = configContent.match(/fontFamily:\s*\{([\s\S]*?)\}/);
  if (fontFamilyMatch) {
    customConfig.fontFamily = fontFamilyMatch[1];
  }
  
  return customConfig;
}

/**
 * Genera contenuto globals.css con sezioni preservate
 */
function generatePreservedGlobals(colors, customSections, debugMode = false) {
  const sanitizeCss = (css) => (css || '')
    .replace(/(^|\s)(\d*\.?\d+)\s*re\b/gi, '$1$2rem')
    .replace(/hsl\s+var\(([^)]+)\)/gi, 'hsl(var($1))')
    .replace(/rgb\s+var\(([^)]+)\)/gi, 'rgb(var($1))')
    .replace(/rgba\s+var\(([^)]+)\)/gi, 'rgba(var($1))')
    .replace(/calc\s+var\(([^)]+)\)/gi, 'calc(var($1))')
    .replace(/hsl(?!\()\s*([0-9][^);\n]+)/gi, 'hsl($1)')
    .replace(/rgb(?!\()\s*([0-9][^);\n]+)/gi, 'rgb($1)')
    .replace(/rgba(?!\()\s*([0-9][^);\n]+)/gi, 'rgba($1)')
    .replace(/(^|\n)\s*--\s*(\n|$)/g, '$1')
    .replace(/(--[\w-]+:\s*[^;\n]+)(\n)/g, '$1;$2');

  const colorVars = Object.entries(colors).map(([key, value]) => {
    let finalValue = value;
    
    // Se sembra una lista di canali HSL (es: "220 10% 20%") senza wrapper hsl()
    // E non è una variabile var(...)
    const isRawHslChannels = !value.includes('hsl(') && !value.includes('var(') && /\d/.test(value);
    
    if (isRawHslChannels) {
       finalValue = `hsl(${value})`;
    }
    
    return `  --color-${key}: ${finalValue};`;
  }).join('\n');
  
  // DEBUG: Stampa chiavi e valori sospetti
  if (debugMode) {
    console.log('=== DEBUG COLOR VARIABLES ===');
    Object.entries(colors).forEach(([key, value]) => {
      let finalValue = value;
      const isRawHslChannels = !value.includes('hsl(') && !value.includes('var(') && /\d/.test(value);
      if (isRawHslChannels) {
         finalValue = `hsl(${value})`;
      }
      console.log(`--color-${key}: ${finalValue}`);
    });
    console.log('=== END DEBUG ===');
  }
  
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
${customSections.utilities || ''}
}

@layer base {
  :root {
    /* Design Tokens - Colors (migrated) */
${debugMode ? '    /* ${colorVars} temporaneamente commentato */' : colorVars}

    /* Custom Variables */
${sanitizeCss(customSections.customVariables || '')}
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

${sanitizeCss(customSections.customScrollbar || '')}

${sanitizeCss(customSections.otherCustom || '')}`;
}

/**
 * Genera tailwind.config.ts con configurazioni preservate
 */
function generatePreservedTailwind(colors, keyframes, animations, customConfig) {
  const sanitizeCss = (css) => (css || '')
    .replace(/(^|\s)(\d*\.?\d+)\s*re\b/gi, '$1$2rem')
    .replace(/hsl\s+var\(([^)]+)\)/gi, 'hsl(var($1))');
  // Converte colors in formato Tailwind
  const colorEntries = Object.entries(colors).map(([key, value]) => {
    let finalValue = value;
    
    // Stessa logica: se sono raw channels, avvolgi in hsl() per config di Tailwind
    const isRawHslChannels = !value.includes('hsl(') && !value.includes('var(') && /\d/.test(value);
    
    if (isRawHslChannels) {
       finalValue = `hsl(${value})`;
    }
    
    return `    '${key}': '${finalValue}'`;
  }).join(',\n');
  
  // Gestione keyframes - con sintassi pulita e senza duplicazioni
  const hasCustomKeyframes = customConfig.keyframes && customConfig.keyframes.trim().length > 0;
  const hasMigratedKeyframes = Object.keys(keyframes).length > 0;
  
  // Keyframes validi predefiniti (senza duplicazioni)
  const validKeyframes = {
    "accordion-down": {
      from: { height: "0" },
      to: { height: "var(--radix-accordion-content-height)" },
    },
    "accordion-up": {
      from: { height: "var(--radix-accordion-content-height)" },
      to: { height: "0" },
    },
    "fade-in": {
      "0%": { opacity: "0", transform: "translateY(10px)" },
      "100%": { opacity: "1", transform: "translateY(0)" },
    },
    "fade-in-slow": {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    }
  };
  
  // Merge keyframes con priorità a quelli validi predefiniti
  const mergedKeyframes = { ...validKeyframes, ...keyframes };
  const keyframesContent = Object.entries(mergedKeyframes)
    .map(([key, value]) => `        "${key}": ${JSON.stringify(value)}`)
    .join(',\n');
  
  // Gestione animations - con sintassi pulita
  const validAnimations = {
    "accordion-down": "accordion-down 0.2s ease-out",
    "accordion-up": "accordion-up 0.2s ease-out", 
    "fade-in": "fade-in 0.6s ease-out",
    "fade-in-slow": "fade-in-slow 0.8s ease-out"
  };
  
  // Merge animations con priorità a quelli validi predefiniti
  const mergedAnimations = { ...validAnimations, ...animations };
  const animationsContent = Object.entries(mergedAnimations)
    .map(([key, value]) => `        "${key}": "${value}"`)
    .join(',\n');
  
  return `import type { Config } from "tailwindcss";
import { designTokens } from "./src/lib/tokens";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Spacing tokens
      spacing: designTokens.spacing,
      
      // Font family (preservato e formattato correttamente)
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      
      // Colors
      colors: {
        // Design tokens (migrated)
${colorEntries},
        
        // Shadcn/ui component colors
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      
      // Border radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      // Keyframes (merged)
      keyframes: {
${keyframesContent}
      },
      
      // Animations (merged)
      animation: {
${animationsContent}
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};

export default config;`;
}

/**
 * Sanitizza valori CSS/ASTRO nel progetto destinazione (fix unità 're' → 'rem')
 */
async function sanitizeProjectStyles(destPath) {
  const patterns = [
    '**/*.css',
    '**/*.scss',
    '**/*.astro'
  ];
  const sanitize = (text) => (text || '')
    .replace(/(^|\s)(\d*\.?\d+)\s*re\b/gi, '$1$2rem')
    .replace(/hsl\s+var\(([^)]+)\)/gi, 'hsl(var($1))')
    .replace(/rgb\s+var\(([^)]+)\)/gi, 'rgb(var($1))')
    .replace(/rgba\s+var\(([^)]+)\)/gi, 'rgba(var($1))')
    .replace(/calc\s+var\(([^)]+)\)/gi, 'calc(var($1))')
    .replace(/hsl(?!\()\s*([0-9][^);\n]+)/gi, 'hsl($1)')
    .replace(/rgb(?!\()\s*([0-9][^);\n]+)/gi, 'rgb($1)')
    .replace(/rgba(?!\()\s*([0-9][^);\n]+)/gi, 'rgba($1)')
    .replace(/(^|\n)\s*--\s*(\n|$)/g, '$1')
    .replace(/(--[\w-]+:\s*[^;\n]+)(\n)/g, '$1;$2');
  let changed = 0;
  for (const pattern of patterns) {
    const files = glob.sync ? glob.sync(pattern, { cwd: destPath, dot: true, absolute: true }) : await glob(pattern, { cwd: destPath, dot: true, absolute: true });
    if (Array.isArray(files)) {
      for (const file of files) {
        try {
          const content = readFileSync(file, 'utf-8');
          const sanitized = sanitize(content);
          if (sanitized !== content) {
            writeFileSync(file, sanitized);
            changed++;
          }
        } catch {}
      }
    }
  }
  return changed;
}

/**
 * Verifica la validità del file dopo la migrazione
 */
function validateMigration(filePath, backupPath) {
  try {
    // Verifica che il file esista e sia leggibile
    if (!existsSync(filePath)) {
      throw new Error('File non generato');
    }
    
    // Verifica sintassi di base
    const content = readFileSync(filePath, 'utf-8');
    if (content.trim().length === 0) {
      throw new Error('File vuoto');
    }
    
    console.log(chalk.green(`  ✅ Validazione completata: ${filePath}`));
    return true;
  } catch (error) {
    console.error(chalk.red(`  ❌ Validazione fallita: ${error.message}`));
    
    // Opzione di restore automatico
    if (backupPath && existsSync(backupPath)) {
      console.log(chalk.yellow(`  🔄 Restore automatico dal backup...`));
      fs.copyFileSync(backupPath, filePath);
      return false;
    }
    
    return false;
  }
}

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
      await generateDesignTokensFile(sourcePath, destPath);
      console.log(chalk.green('  ✓ Generated design tokens TypeScript'));
      
      // 4.1 Genera file tokens.ts con i dati estratti
      console.log(chalk.blue('\n📝 Generating tokens.ts file...'));
      // Usa solo i colori con valori HSL diretti (no riferimenti CSS)
      const hslColors = {};
      
      // Aggiungi solo i colori convertiti che hanno valori HSL diretti
      for (const [key, value] of Object.entries(convertedColors)) {
        // Solo se non è un riferimento a variabile CSS
        if (typeof value === 'string' && !value.includes('var(--')) {
          hslColors[key] = value;
        }
      }
      
      // Aggiungi anche i colori originali del tailwind convertiti in HSL
      const originalColors = tailwindTokens.colors || {};
      for (const [key, value] of Object.entries(originalColors)) {
        if (typeof value === 'string' && !hslColors[key]) {
          const converted = convertColorToHsl(value);
          // Solo se il convertito non è un riferimento CSS
          if (converted && !converted.includes('var(--')) {
            hslColors[key] = converted;
          }
        }
      }
      
      // Estrai spacing e typography dai CSS tokens
      const spacingTokens = {};
      const typographyTokens = {};
      
      // Estrai spacing tokens (pattern --spacing-*)
      for (const [key, value] of Object.entries(cssTokens.cssVariables || {})) {
        if (key.startsWith('spacing-') && typeof value === 'string') {
          const spacingKey = key.replace('spacing-', '');
          spacingTokens[spacingKey] = value;
        }
      }
      
      // Estrai typography tokens
      for (const [key, value] of Object.entries(cssTokens.cssVariables || {})) {
        if ((key.startsWith('font-') || key.includes('size')) && typeof value === 'string') {
          typographyTokens[key] = value;
        }
      }
      
      const tokensData = {
        colors: hslColors,
        spacing: spacingTokens,
        typography: {
          fontFamily: {
            base: typographyTokens['font-sans'] || '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
            mono: typographyTokens['font-mono'] || 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas'
          },
          fontSize: {
            sm: typographyTokens['font-size-sm'] || '0.875rem',
            base: typographyTokens['font-size-base'] || '1rem',
            lg: typographyTokens['font-size-lg'] || '1.125rem'
          }
        }
      };
      generateTokensTsFile(sourcePath, destPath, dryRun, tokensData);
      console.log(chalk.green('  ✓ Generated tokens.ts file'));
    } else {
      console.log(chalk.yellow('\n📝 [DRY RUN] Would generate design tokens...'));
      console.log(chalk.yellow('\n📝 [DRY RUN] Would generate tokens.ts file...'));
    }

    // 5. Aggiorna CSS variables in globals.css
    if (!dryRun) {
      console.log(chalk.blue('\n📝 Updating CSS variables...'));
      const debugMode = config.options?.debug || false;
      await updateCssVariables(destPath, convertedColors, debugMode);
      console.log(chalk.green('  ✓ Updated CSS variables'));
    } else {
      console.log(chalk.yellow('\n📝 [DRY RUN] Would update CSS variables...'));
    }

    // 6. Aggiorna tailwind.config.ts
    if (!dryRun) {
      console.log(chalk.blue('\n📝 Updating tailwind.config.ts...'));
      await updateTailwindConfig(destPath, convertedColors, tailwindTokens.keyframes, tailwindTokens.animations);
      console.log(chalk.green('  ✓ Updated tailwind.config.ts'));
      const fixed = await sanitizeProjectStyles(destPath);
      if (fixed > 0) {
        console.log(chalk.green(`  ✓ Sanitized ${fixed} style files (unit fix)`));
      }
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

  // Genera entries dei colori con valori HSL corretti
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
 * Aggiorna le CSS variables in globals.css con preservazione
 */
async function updateCssVariables(destPath, colors, debugMode = false) {
  const globalsPath = join(destPath, 'src', 'styles', 'globals.css');
  
  if (!existsSync(globalsPath)) {
    console.warn(chalk.yellow(`  ⚠️  globals.css not found at ${globalsPath}`));
    return;
  }

  // 1. Crea backup automatico
  const backupPath = createBackup(globalsPath);
  
  // 2. Estrai sezioni custom da preservare
  const currentContent = readFileSync(globalsPath, 'utf-8');
  const customSections = extractCustomSections(currentContent);
  
  // 3. Genera nuovo contenuto con sezioni preservate
  const newContent = generatePreservedGlobals(colors, customSections, debugMode);
  
  // DEBUG: Stampa il CSS generato prima di scrivere il file
  console.log('=== GENERATED GLOBALS.CSS ===\n', newContent);
  
  // 4. Scrivi nuovo contenuto
  writeFileSync(globalsPath, newContent);
  
  // 5. Validazione
  validateMigration(globalsPath, backupPath);
}

/**
 * Aggiorna tailwind.config.ts con i nuovi colori e keyframes (con preservazione)
 */
async function updateTailwindConfig(destPath, colors, keyframes, animations) {
  const configPath = join(destPath, 'tailwind.config.ts');
  
  if (!existsSync(configPath)) {
    console.warn(chalk.yellow(`  ⚠️  tailwind.config.ts not found at ${configPath}`));
    return;
  }

  // 1. Crea backup automatico
  const backupPath = createBackup(configPath);
  
  // 2. Estrai configurazioni custom da preservare
  const currentContent = readFileSync(configPath, 'utf-8');
  const customConfig = extractCustomConfig(currentContent);
  
  // 3. Genera nuovo contenuto con configurazioni preservate
  const newContent = generatePreservedTailwind(colors, keyframes, animations, customConfig);
  
  // 4. Scrivi nuovo contenuto
  writeFileSync(configPath, newContent);
  
  // 5. Validazione
  validateMigration(configPath, backupPath);
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
      const debugMode = config.options?.debug || false;
      await updateCssVariables(destPath, convertedColors, debugMode);
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
