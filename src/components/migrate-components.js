/**
 * Modulo principale per la migrazione dei componenti
 */

import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import chalk from 'chalk';
import { extractTokensFromCss } from '../tokens/extractors/css-extractor.js';

/**
 * Migra i componenti da V4 (sorgente) a V6 (destinazione)
 * @param {Object} config - Configurazione della migrazione
 * @param {string} config.paths.v4 - Path sorgente principale (V4)
 * @param {string} config.paths.v6 - Path destinazione migrazione (V6)
 * @returns {Object} - Report della migrazione
 */
export async function migrateComponents(config) {
  const report = {
    components: { found: 0, migrated: 0, errors: [] },
    componentClasses: { found: 0, converted: 0, errors: [] }
  };

  const sourcePath = config.paths.v4;  // Sorgente principale (V4)
  const destPath = config.paths.v6;     // Destinazione migrazione (V6)
  const dryRun = config.options?.dryRun || false;

  console.log(chalk.blue('\n🧩 Starting component migration...'));
  console.log(chalk.gray(`Source: ${sourcePath}`));
  console.log(chalk.gray(`Destination: ${destPath}`));
  if (dryRun) {
    console.log(chalk.yellow('🔍 DRY RUN MODE - No changes will be made\n'));
  }

  try {
    // 1. Estrai component classes da CSS
    console.log(chalk.blue('\n📦 Extracting component classes from CSS files...'));
    const cssTokens = extractTokensFromCss(sourcePath);
    
    report.componentClasses.found = cssTokens.componentClasses?.length || 0;
    console.log(chalk.green(`  ✓ Found ${report.componentClasses.found} component classes`));

    if (report.componentClasses.found > 0) {
      console.log(chalk.blue('\n📋 Component classes found:'));
      cssTokens.componentClasses.forEach(cls => {
        console.log(chalk.gray(`  - .${cls.name}`));
      });
      console.log(chalk.yellow('  ⚠️  Component classes conversion not yet fully implemented'));
      console.log(chalk.gray('  These will be converted to utility classes or preserved as @apply directives.'));
    }

    // 2. Cerca componenti React/TSX nella directory sorgente
    console.log(chalk.blue('\n📦 Searching for React components...'));
    const componentsPath = join(sourcePath, 'src', 'components');
    const components = findComponents(componentsPath);
    
    report.components.found = components.length;
    console.log(chalk.green(`  ✓ Found ${report.components.found} components`));

    if (components.length > 0) {
      console.log(chalk.blue('\n📋 Components found:'));
      components.forEach(comp => {
        console.log(chalk.gray(`  - ${comp.name} (${comp.path})`));
      });

      // 3. Migra ogni componente
      if (!dryRun) {
        console.log(chalk.blue('\n🔄 Migrating components...'));
        const destComponentsPath = join(destPath, 'src', 'react', 'components', 'ui');
        
        if (!existsSync(destComponentsPath)) {
          mkdirSync(destComponentsPath, { recursive: true });
        }

        for (const component of components) {
          try {
            await migrateComponent(component, destComponentsPath, config);
            report.components.migrated++;
            console.log(chalk.green(`  ✓ Migrated ${component.name}`));
          } catch (error) {
            report.components.errors.push({ component: component.name, error: error.message });
            console.warn(chalk.yellow(`  ⚠️  Could not migrate ${component.name}: ${error.message}`));
          }
        }
      } else {
        console.log(chalk.yellow('\n🔄 [DRY RUN] Would migrate components...'));
        components.forEach(comp => {
          console.log(chalk.gray(`  - Would migrate ${comp.name} to ${join(destPath, 'src', 'react', 'components', 'ui', comp.name)}`));
        });
      }
    }

    console.log(chalk.green('\n✅ Component migration completed successfully!'));

    return report;
  } catch (error) {
    console.error(chalk.red('\n❌ Error during component migration:'), error);
    throw error;
  }
}

/**
 * Trova tutti i componenti nella directory
 */
function findComponents(componentsPath) {
  const components = [];
  
  if (!existsSync(componentsPath)) {
    return components;
  }

  try {
    const files = readdirSync(componentsPath);
    
    for (const file of files) {
      const filePath = join(componentsPath, file);
      const stat = statSync(filePath);
      
      if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.jsx'))) {
        components.push({
          name: file.replace(/\.(tsx|jsx)$/, ''),
          path: filePath,
          fileName: file
        });
      }
    }
  } catch (error) {
    // Ignora errori di lettura directory
  }

  return components;
}

/**
 * Migra un singolo componente
 */
async function migrateComponent(component, destPath, config) {
  const sourceContent = readFileSync(component.path, 'utf-8');
  
  // Per ora, copia semplicemente il componente
  // In futuro, qui si possono aggiungere trasformazioni:
  // - Trasformazione import
  // - Trasformazione classi
  // - Trasformazione props
  
  const destFilePath = join(destPath, component.fileName);
  writeFileSync(destFilePath, sourceContent);
  
  return {
    source: component.path,
    destination: destFilePath
  };
}

