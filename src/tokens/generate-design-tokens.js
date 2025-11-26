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