# Proposta: Mapping Completo Shadcn/ui nel Generatore di Token

## Problema Attuale

Il generatore di token in `migration-dev-V0` attualmente:
- ✅ Estrae correttamente i colori da V4
- ✅ Converte i colori in formato HSL
- ❌ **NON mappa i colori a tutti i nomi standard shadcn/ui**
- ❌ Genera solo variabili `--color-*` invece del set completo shadcn

Questo causa problemi in `NewIndex.tsx` che usa classi come `bg-muted`, `text-destructive`, `border-border`, ecc. che non sono definite.

## Soluzione Proposta

### 1. Funzione di Mapping Intelligente

Aggiungere `mapColorsToShadcn()` che:
- Mappa i colori esistenti ai nomi standard shadcn
- Fornisce fallback per colori mancanti
- Supporta mapping diretti e sinonimi

```javascript
const fallbackColors = {
  background: '222 47% 11%',
  foreground: '0 0% 100%',
  primary: '262 83% 58%',
  'primary-foreground': '0 0% 100%',
  'primary-hover': '263 70% 50%',
  secondary: '217 33% 17%',
  'secondary-foreground': '0 0% 100%',
  muted: '217 33% 17%',
  'muted-foreground': '163 78% 77%',
  destructive: '0 84% 60%',
  'destructive-foreground': '210 40% 98%',
  accent: '271 91% 65%',
  'accent-foreground': '0 0% 100%',
  border: '217 33% 17%',
  input: '217 33% 17%',
  ring: '262 83% 58%',
  card: '217 33% 17%',
  'card-foreground': '0 0% 100%',
  popover: '217 33% 17%',
  'popover-foreground': '0 0% 100%',
  radius: '0.5rem'
};
```

### 2. Modifiche a `generatePreservedGlobals()`

Aggiungere variabili CSS shadcn separate da `--color-*`:

```css
@layer base {
  :root {
    /* Shadcn/ui Theme Variables */
    --background: 222 47% 11%;
    --foreground: 0 0% 100%;
    --primary: 262 83% 58%;
    --primary-foreground: 0 0% 100%;
    --primary-hover: 263 70% 50%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 0 0% 100%;
    --muted: 217 33% 17%;
    --muted-foreground: 163 78% 77%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;
    --accent: 271 91% 65%;
    --accent-foreground: 0 0% 100%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 262 83% 58%;
    --card: 217 33% 17%;
    --card-foreground: 0 0% 100%;
    --popover: 217 33% 17%;
    --popover-foreground: 0 0% 100%;
    --radius: 0.5rem;

    /* Custom Color Variables (for getColor function) */
    --color-DEFAULT: 262 83% 58%;
    --color-hover: 263 70% 50%;
    --color-background-color: 222 47% 11%;
    --color-text-color: 0 0% 100%;
    /* ... altre variabili custom */
  }

  .dark {
    /* Dark theme overrides */
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* ... */
  }
}
```

### 3. Modifiche a `generatePreservedTailwind()`

Usare pattern shadcn corretto:

```typescript
colors: {
  // Design tokens diretti (migrated)
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  
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
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))"
  }
}
```

### 4. Modifiche a `generateTokensTsFile()`

Generare `tokens.ts` completo con tutti i colori shadcn:

```typescript
const colors = {
  // Primary colors
  primary: '262 83% 58%',
  'primary-foreground': '0 0% 100%',
  'primary-hover': '263 70% 50%',
  
  // Secondary colors
  secondary: '217 33% 17%',
  'secondary-foreground': '0 0% 100%',
  
  // Background colors
  background: '222 47% 11%',
  foreground: '0 0% 100%',
  
  // Muted colors
  muted: '217 33% 17%',
  'muted-foreground': '163 78% 77%',
  
  // Border and input
  border: '217 33% 17%',
  input: '217 33% 17%',
  ring: '262 83% 58%',
  
  // Additional colors
  destructive: '0 84% 60%',
  'destructive-foreground': '210 40% 98%',
  accent: '271 91% 65%',
  'accent-foreground': '0 0% 100%',
  card: '217 33% 17%',
  'card-foreground': '0 0% 100%',
  
  // Custom colors
  DEFAULT: '262 83% 58%',
  hover: '263 70% 50%',
  'background-color': '222 47% 11%',
  'text-color': '0 0% 100%',
  'primary-color': '262 83% 58%',
  'secondary-color': '217 33% 17%',
  'accent-color': '271 91% 65%',
  'card-bg': '217 33% 17% / 0.3',
  'card-border': '0 0% 100% / 0.1'
} as const;

// Utility functions con TypeScript types
export const getColor = (key: ColorToken): string => {
  return `var(--color-${key})`;
};

export const getSpacing = (key: SpacingToken): string => {
  return `var(--spacing-${key})`;
};
```

## Flusso di Migrazione Proposto

1. **Estrazione**: Il generatore estrae i colori da V4
2. **Conversione**: Converte in HSL (già fatto)
3. **Mapping**: Applica `mapColorsToShadcn()` per mappare ai nomi standard
4. **Generazione**: Crea i 3 file target:
   - `src/lib/tokens.ts` - Con tutti i colori shadcn + custom
   - `src/styles/globals.css` - Con variabili shadcn + custom
   - `tailwind.config.ts` - Con pattern shadcn corretto

## Vantaggi

- ✅ **NewIndex.tsx funzionerà** senza modifiche al componente
- ✅ **Compatibilità totale** con ecosistema shadcn/ui
- ✅ **Mantenimento** dei colori custom esistenti
- ✅ **Theme switching** supportato (light/dark)
- ✅ **TypeScript types** per sicurezza del codice

## Impatto su Altri Componenti

- **Dashboard, Auth, etc.**: Nessun impatto negativo, anzi miglioreranno in coerenza
- **Componenti test**: Potrebbero bisogno di piccoli aggiustamenti se usano `getColor()`
- **Componenti legacy**: Continueranno a funzionare con colori Tailwind default

## Implementazione

Le modifiche principali sono in:
- `src/tokens/migrate-tokens.js` - Aggiungere `mapColorsToShadcn()` e aggiornare funzioni di generazione
- `src/tokens/generate-tokens-ts.js` - Generare tokens.ts completo

## Test

Dopo le modifiche, testare con:
```bash
npm run migrate:tokens
# Verificare che NewIndex.tsx mostri i colori correttamente
```

## Compatibilità

Questa soluzione è **backward compatible**:
- Non rompe componenti esistenti
- Mantiene funzionalità attuale
- Aggiunge solo le funzionalità mancanti
