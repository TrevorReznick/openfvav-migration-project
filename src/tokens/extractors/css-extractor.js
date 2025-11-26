/**
 * Estrae token dai file CSS (CSS variables, component classes)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Analizza il contenuto CSS per estrarre le CSS variables
 * @param {string} content - Contenuto del file CSS
 * @returns {Object} - Oggetto con le CSS variables estratte
 */
function parseCssVariables(content) {
  const variables = {};
  const sanitizeValue = (val) => {
    let v = val.trim();
    v = v.replace(/(^|\s)(\d*\.?\d+)\s*re\b/gi, '$1$2rem');
    return v;
  };
  const regex = /--([\w-]+):\s*([^;]+);/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const [, name, value] = match;
    variables[name] = sanitizeValue(value);
  }

  return variables;
}

/**
 * Estrae CSS variables da un file CSS
 * @param {string} cssPath - Path al file CSS
 * @returns {Object} - Oggetto con le CSS variables estratte
 */
export function extractCssVariables(cssPath) {
  try {
    const content = readFileSync(cssPath, 'utf-8');
    return parseCssVariables(content);
  } catch (error) {
    throw new Error(`Error extracting CSS variables from ${cssPath}: ${error.message}`);
  }
}

/**
 * Analizza il contenuto CSS per estrarre le component classes
 * @param {string} content - Contenuto del file CSS
 * @returns {Array} - Array di oggetti con le component classes
 */
function parseComponentClasses(content) {
  const componentClasses = [];
  const layerPattern = /@layer\s+components\s*\{([^}]+(?:\{[^}]+\}[^}]*)*)\}/s;
  const layerMatch = content.match(layerPattern);

  if (layerMatch) {
    const layerContent = layerMatch[1];
    const classPattern = /\.([\w-]+)\s*\{([^}]+)\}/g;
    let match;

    while ((match = classPattern.exec(layerContent)) !== null) {
      const className = match[1];
      const classContent = match[2];
      const applyMatches = classContent.match(/@apply\s+([^;]+);/g);
      const applyClasses = applyMatches
        ? applyMatches.map(m => m.replace(/@apply\s+/, '').replace(/;$/, '').trim())
        : [];
      const cssProperties = {};
      const propertyPattern = /([\w-]+):\s*([^;]+);/g;
      let propMatch;

      while ((propMatch = propertyPattern.exec(classContent)) !== null) {
        if (propMatch[1] !== 'apply') {
          cssProperties[propMatch[1]] = propMatch[2].trim();
        }
      }

      componentClasses.push({
        name: className,
        applyClasses,
        cssProperties,
        fullContent: classContent.trim(),
      });
    }
  }

  return componentClasses;
}

/**
 * Estrae component classes da un file CSS
 * @param {string} cssPath - Path al file CSS
 * @returns {Array} - Array di oggetti con le component classes
 */
export function extractComponentClasses(cssPath) {
  try {
    const content = readFileSync(cssPath, 'utf-8');
    return parseComponentClasses(content);
  } catch (error) {
    throw new Error(`Error extracting component classes from ${cssPath}: ${error.message}`);
  }
}

/**
 * Estrae tutti i token da un file CSS o da un contenuto CSS
 * @param {string} sourcePath - Path alla directory sorgente
 * @param {string} cssFileName - Nome del file CSS (default: "index.css")
 * @param {string|null} cssContent - Contenuto CSS opzionale da cui estrarre i token
 * @returns {Object} - Oggetto con tutti i token estratti
 */
export function extractTokensFromCss(sourcePath, cssFileName = 'index.css', cssContent = null) {
  let content = cssContent;

  if (!content) {
    const cssPath = join(sourcePath, 'src', cssFileName);
    try {
      content = readFileSync(cssPath, 'utf-8');
    } catch (error) {
      const altCssPath = join(sourcePath, 'src', 'styles', cssFileName);
      try {
        content = readFileSync(altCssPath, 'utf-8');
      } catch (altError) {
        throw new Error(`Could not find ${cssFileName} in ${sourcePath}/src or ${sourcePath}/src/styles/`);
      }
    }
  }

  return {
    cssVariables: parseCssVariables(content),
    componentClasses: parseComponentClasses(content),
  };
}

