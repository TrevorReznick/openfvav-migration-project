import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Migrazione Design Tokens - Robustezza e Completezza', () => {
  const tokensPath = resolve(__dirname, '../../openfav-dev/src/lib/tokens.ts');
  let tokensFile: string;
  
  beforeAll(() => {
    try {
      tokensFile = readFileSync(tokensPath, 'utf-8');
    } catch (error) {
      console.warn(`File non trovato: ${tokensPath}. I test di verifica file falliranno.`);
      tokensFile = '';
    }
  });

  it('deve esistere il file tokens.ts', () => {
    expect(existsSync(tokensPath)).toBe(true);
  });

  it('deve esportare tutti i gruppi principali', () => {
    if (!tokensFile) return; // Skip se il file non esiste
    
    const requiredExports = [
      'export const designTokens',
      'colors',
      'typography',
      'spacing',
      'radius',
      'shadow',
      'zIndex'
    ];

    requiredExports.forEach(exportName => {
      expect(tokensFile).toContain(exportName);
    });
  });

  it('deve includere almeno un token chiave per ogni categoria', () => {
    if (!tokensFile) return; // Skip se il file non esiste
    
    const requiredTokens = [
      'primary-color',
      'spacing-1',
      'font-family-base',
      'radius-md'
    ];

    requiredTokens.forEach(token => {
      expect(tokensFile).toContain(token);
    });
  });

  it('deve essere aggiornato rispetto al GOLDEN MASTER', () => {
    const goldenPath = resolve(__dirname, 'tokens.golden.ts');
    if (!existsSync(goldenPath)) {
      console.warn('Nessun file GOLDEN MASTER trovato. Salto il test di confronto.');
      return;
    }
    
    if (!tokensFile) return; // Skip se il file non esiste
    
    const golden = readFileSync(goldenPath, 'utf-8');
    expect(tokensFile).toEqual(golden);
  });
});
