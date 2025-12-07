# Token Migration Fix Documentation

## Problema Rilevato

La palette dei colori non visualizzava correttamente perché:

1. **`tokens.ts` vuoto**: Gli oggetti `colors`, `spacing`, `typography` erano vuoti
2. **Variabili CSS mancanti**: Le variabili CSS come `--primary`, `--secondary` non erano definite
3. **TypeScript errors**: I parametri delle funzioni non avevano tipi

## Fix Applicati

### 1. Popolamento `src/lib/tokens.ts`

#### Colors (HSL values)
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
  
  // Card colors
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
  'card-border': '0 0% 100% / 0.1',
} as const;
```

#### Spacing
```typescript
const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;
```

#### TypeScript Functions con Tipi
```typescript
export const getSpacing = (key: keyof typeof spacing) => {
  return `var(--spacing-${key})`;
};

export const getColor = (key: keyof typeof colors) => {
  return `var(--color-${key})`;
};
```

### 2. Variabili CSS in `src/styles/globals.css`

#### Shadcn/ui variables
```css
/* Shadcn/ui variables */
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
--radius: 0.5rem;
```

#### Custom Variables
```css
/* Custom Variables */
--spacing-0: 0px;
--spacing-1: 0.25rem;
--spacing-2: 0.5rem;
--spacing-3: 0.75rem;
--spacing-4: 1rem;
--spacing-5: 1.25rem;
--spacing-6: 1.5rem;
--spacing-8: 2rem;
--spacing-10: 2.5rem;
--spacing-12: 3rem;
--spacing-16: 4rem;
--spacing-20: 5rem;
--spacing-24: 6rem;
--spacing-32: 8rem;
```

## Struttura Migration Files Esistente

### `src/migration/design-system/tokens/colors.json`
```json
{
  "primary": "primary",
  "secondary": "secondary",
  "success": "success",
  "danger": "danger",
  "warning": "warning",
  "info": "info"
}
```

### `src/migration/design-system/tokens/spacing.json`
```json
{
  "0": "space-0",
  "1": "space-1",
  "2": "space-2",
  "3": "space-3",
  "4": "space-4",
  "5": "space-5",
  "6": "space-6",
  "8": "space-8",
  "10": "space-10",
  "12": "space-12",
  "16": "space-16",
  "20": "space-20",
  "24": "space-24",
  "32": "space-32"
}
```

## Script `migrate:tokens`

Lo script `migrate:tokens` non esiste in `package.json`. I file di migrazione sono presenti ma manca lo script per eseguirli.

## Raccomandazioni per il Generatore

### 1. Creare Script di Migrazione
Aggiungere a `package.json`:
```json
{
  "scripts": {
    "migrate:tokens": "node scripts/migrate-tokens.js"
  }
}
```

### 2. Logica del Generatore
Lo script dovrebbe:

1. **Leggere i JSON files** da `src/migration/design-system/tokens/`
2. **Generare TypeScript types** in `src/lib/tokens.ts`
3. **Generare CSS variables** in `src/styles/globals.css`
4. **Aggiornare Tailwind config** con i nuovi token

### 3. Mappatura Valori
Il generatore dovrebbe mappare:
- **Color names** → **HSL values** (es: `primary` → `262 83% 58%`)
- **Spacing keys** → **rem values** (es: `4` → `1rem`)
- **Token names** → **CSS variables** (es: `primary` → `--primary`)

### 4. Template Generation
Usare template per generare:
- TypeScript interfaces con tipi corretti
- CSS variables con HSL values
- Tailwind config con design tokens

## Risultato Atteso

Dopo aver eseguito il generatore, la palette dei colori dovrebbe:
1. Mostrare correttamente tutti i colori nella style guide
2. Avere TypeScript types safety
3. Funzionare con Tailwind classes
4. Essere facilmente estendibile
