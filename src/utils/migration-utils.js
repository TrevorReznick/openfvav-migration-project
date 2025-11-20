const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * Analizza la struttura dei componenti nella directory sorgente
 */
function analyzeComponents(componentsPath, options = {}) {
  const { exclude = [] } = options;
  if (!fs.existsSync(componentsPath)) {
    throw new Error(`Directory non trovata: ${componentsPath}`);
  }
  return fs.readdirSync(componentsPath, { withFileTypes: true })
    .filter(dirent => {
      const shouldExclude = exclude.some(pattern => 
        dirent.name.toLowerCase().includes(pattern.toLowerCase())
      );
      return dirent.isDirectory() && !shouldExclude;
    })
    .map(dirent => {
      const componentPath = path.join(componentsPath, dirent.name);
      const files = fs.readdirSync(componentPath);
      return {
        name: dirent.name,
        path: componentPath,
        files,
        isPage: files.some(f => f.endsWith('.page.tsx') || f === 'index.tsx'),
        hasStyles: files.some(f => /\.(css|scss|module\.css)$/.test(f))
      };
    });
}

/**
 * Genera la configurazione delle route
 */
function generateRoutesConfig(components, options = {}) {
  const { basePath = '/', targetPath } = options;
  return components
    .filter(component => component.isPage)
    .map(component => {
      const routeName = component.name.toLowerCase();
      const componentName = component.name.replace(/(?:^|-)(\w)/g, (_, c) => c.toUpperCase());
      return {
        path: routeName === 'index' ? basePath : `${basePath}${routeName}`,
        componentName,
        importPath: `@/components/${componentName}`,
        filePath: path.join(targetPath, componentName, 'index.tsx')
      };
    });
}

/**
 * Crea i componenti nella directory di destinazione
 */
async function createComponents(components, options = {}) {
  const { targetPath, dryRun = false } = options;
  const results = { created: [], skipped: [] };
  for (const component of components) {
    const targetDir = path.join(targetPath, component.name);
    if (dryRun) {
      results.skipped.push(component.name);
      continue;
    }
    try {
      await fs.ensureDir(targetDir);
      for (const file of component.files) {
        const sourceFile = path.join(component.path, file);
        const targetFile = path.join(targetDir, file);
        if (file.endsWith('.tsx')) {
          let content = await fs.readFile(sourceFile, 'utf-8');
          content = content.replace(
            /from\s+['"](\.\.\/)+components\/([^'\"]+)['"]/g,
            "from '@/components/$2'"
          );
          await fs.writeFile(targetFile, content, 'utf-8');
        } else {
          await fs.copyFile(sourceFile, targetFile);
        }
      }
      results.created.push(component.name);
    } catch (error) {
      console.error(chalk.red(`❌ Errore durante la creazione di ${component.name}:`), error);
      results.skipped.push(component.name);
    }
  }
  return results;
}

module.exports = {
  analyzeComponents,
  generateRoutesConfig,
  createComponents
};
