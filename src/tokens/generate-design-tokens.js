import postcss from 'postcss';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import extractTokensPlugin from './postcss/extract-tokens.js';
import { convertColorToHsl } from '../utils/color-converter.js';

export async function generateDesignTokens(sourcePath, destPath) {
  const cssCandidates = [
    join(sourcePath, 'src', 'styles', 'globals.css'),
    join(sourcePath, 'src', 'index.css'),
    join(sourcePath, 'src', 'main.css')
  ];

  let cssContent = '';
  for (const p of cssCandidates) {
    if (existsSync(p)) {
      cssContent = readFileSync(p, 'utf-8');
      break;
    }
  }
  if (!cssContent) {
    throw new Error('Nessun file CSS sorgente trovato');
  }

  const colorTokens = {};
  const customVariables = {};
  const typographyTokens = {};
  const sanitizeValue = (val) => {
    let v = (val || '').trim();
    v = v.replace(/(^|\s)(\d*\.?\d+)\s*re\b/gi, '$1$2rem');
    return v;
  };

  await postcss([
    extractTokensPlugin({ colorTokens, customVariables, typographyTokens })
  ]).process(cssContent, { from: undefined });

  const isColorValue = (val) => {
    const v = (val || '').trim();
    return /^#/.test(v) || /^rgba?\(/i.test(v) || /^hsl\(/i.test(v) || /^\d+\s+\d+%\s+\d+%/.test(v);
  };

  const normalizeColorName = (raw) => {
    const n = String(raw).replace(/^--/, '');
    if (n === 'text-color') return 'foreground';
    if (n === 'background-color' || n === 'background') return 'background';
    if (n === 'primary-color' || n === 'primary') return 'primary';
    if (n === 'secondary-color' || n === 'secondary') return 'secondary';
    if (n === 'accent-color' || n === 'accent') return 'accent';
    if (n === 'card-bg' || n === 'card') return 'card';
    if (n === 'card-border' || n === 'border') return 'border';
    if (n === 'input') return 'input';
    if (n === 'ring') return 'ring';
    return n.replace(/-color$/, '');
  };

  // Classifica variabili custom in colors/spacing/typography
  Object.entries(customVariables).forEach(([varName, varValue]) => {
    const name = String(varName).replace(/^--/, '');
    const value = sanitizeValue(varValue);
    const spacingMatch = name.match(/^spacing-(.+)$/);
    if (spacingMatch) {
      const key = spacingMatch[1];
      typographyTokens[`space-${key}`] = value;
      return;
    }
    // Font family shortcuts
    const fontMatch = name.match(/^font-(.+)$/);
    if (fontMatch) {
      const key = fontMatch[1];
      typographyTokens[key] = value;
      return;
    }
    if (isColorValue(value)) {
      const key = normalizeColorName(name);
      colorTokens[key] = value;
    }
  });

  const colorsEntries = Object.entries(colorTokens).map(([key, value]) => {
    const hsl = convertColorToHsl(sanitizeValue(value));
    return `  '${key}': '${hsl}'`;
  }).join(',\n');

  const typographyEntries = Object.entries(typographyTokens)
    .filter(([key]) => !key.startsWith('space-'))
    .map(([key, value]) => `  '${key}': '${sanitizeValue(value)}'`)
    .join(',\n');

  const spacingEntries = Object.entries(typographyTokens)
    .filter(([key]) => key.startsWith('space-'))
    .map(([key, value]) => {
      const name = key.replace('space-', '');
      return `  '${name}': '${sanitizeValue(value)}'`;
    })
    .join(',\n');

  const content = `const colors = {\n${colorsEntries}\n} as const;\n\nconst typography = {\n${typographyEntries ? typographyEntries + '\n' : ''}} as const;\n\nconst spacing = {\n${spacingEntries}\n} as const;\n\nexport const designTokens = {\n  colors,\n  typography,\n  spacing\n} as const;\n\nexport const colorTokens = colors;\nexport const typographyTokens = typography;\nexport const spacingTokens = spacing;\n\nexport const getSpacing = (key) => {\n  return \`var(--spacing-\${key})\`;\n};\n\nexport const getColor = (key) => {\n  return \`var(--color-\${key})\`;\n};\n\nexport default designTokens;\n`;

  const tokensPath = join(destPath, 'src', 'lib', 'tokens.ts');
  const dir = dirname(tokensPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(tokensPath, content);
}

export default generateDesignTokens;
