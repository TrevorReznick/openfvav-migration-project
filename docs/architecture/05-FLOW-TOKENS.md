/Users/default/Sviluppo/nodejs/projects/openfav-migration/openfav-dev-V0/FLOW-TOKENS.md
# FLOW DEI DESIGN TOKENS

## Scopo
- Documenta come i design tokens (colori, tipografia, spaziatura) vengono definiti, trasformati e consumati nel progetto.
- Aiuta ad aggiungere/aggiornare token in modo consistente e sicuro.

## Architettura Dei Token
- Sorgente TypeScript: `src/lib/tokens.ts:72` espone `designTokens` con `colors`, `typography`, `spacing`.
- Build Tailwind: `tailwind.config.ts` importa i token e li mappa su variabili CSS, generando classi utility.
- Variabili CSS globali: `src/styles/globals.css` definisce i valori effettivi in `:root` e override in `.dark`.
- Runtime tema: `src/layouts/Layout.astro` e `src/react/lib/themeInjector.ts` controllano classi `light/dark`, quindi i valori dei token attivi.

## Origine Dei Token
- File: `src/lib/tokens.ts`
  - `colors` contiene componenti HSL “raw” (es. `0, 0%, 96.1%`), pensati per essere inseriti in `hsl(var(--...))`.
  - `typography` definisce famiglia font e dimensioni base.
  - `spacing` definisce scala di spaziatura.
- Esportazioni:
  - `designTokens` per uso globale (`src/lib/tokens.ts:72-76`).
  - `colorTokens`, `typographyTokens`, `spacingTokens` per import granolare (`src/lib/tokens.ts:79-81`).

## Iniezione in Tailwind
- File: `tailwind.config.ts`
  - `spacing`: mappa ogni chiave alla variabile CSS `--spacing-<key>` (`tailwind.config.ts:21-23`).
  - `fontFamily`: usa `--font-sans` e `--font-mono` (`tailwind.config.ts:26-29`).
  - `colors`: palette basata su variabili CSS come `--color-border`, `--color-background`, `--primary-foreground` ecc. (`tailwind.config.ts:31-94`).
  - Estensione dinamica: ogni chiave di `designTokens.colors` genera una voce colore Tailwind referenziando `--color-<key>` (`tailwind.config.ts:121-127`).

## Variabili CSS Globali
- File: `src/styles/globals.css`
  - Tipografia: `--font-sans`, `--font-mono` (`src/styles/globals.css:142-148`).
  - Spaziatura: `--spacing-*` (`src/styles/globals.css:126-141`).
  - Tema base: variabili come `--background`, `--foreground`, `--muted`, `--border` (`src/styles/globals.css:149-171`).
  - Tema scuro: override coerenti in `.dark` (`src/styles/globals.css:186-219`).
- Nota: le variabili usate da Tailwind devono contenere componenti HSL separati da virgole (es. `0, 0%, 96.1%`) per compatibilità con `hsl(var(--...))`.

## Tema (Runtime)
- Iniezione e propagazione:
  - Applica classi `light/dark`, aggiorna `data-theme` e storage (`src/react/lib/themeInjector.ts:75-112`).
  - Propaga eventi `theme-change` per sincronizzare layout e pagina (`src/react/lib/themeInjector.ts:114-152`).
- Layout ascolta e applica:
  - Script inline gestisce tema, legge da cookie/localStorage, e aggiorna DOM (`src/layouts/Layout.astro:71-127`).

## Flusso Dei Valori
1. Definisci token in `src/lib/tokens.ts`.
2. Tailwind li mappa su variabili CSS e palette.
3. `globals.css` fornisce i valori effettivi delle variabili (`:root` e `.dark`).
4. Componenti usano classi Tailwind (`bg-background`, `text-foreground`, `border`, `text-primary`).
5. Cambi tema → classi `dark/light` cambiano, quindi cambiano le variabili CSS attive.

## Pattern Di Utilizzo
- Preferire classi Tailwind per consumare token, es.:
  - `bg-background text-foreground` (`src/layouts/Layout.astro:155-157`).
  - `text-muted-foreground`, `bg-card`, `border`, `text-primary`.
- Per alpha:
  - Tailwind usa `hsl(var(--token) / <alpha-value>)` nelle palette; in CSS puro evitare la notazione slash se il parser PostCSS non la supporta.

## Esempi Rapidi
- Aggiungere un nuovo colore “brand”:
  1. `src/lib/tokens.ts`
     ```ts
     colors.brand = '210, 90%, 50%'
     ```
  2. `src/styles/globals.css`
     ```css
     :root { --color-brand: var(--brand); }
     .dark { /* opzionale override */ --brand: 210, 90%, 60%; }
     ```
  3. Usare in componenti:
     ```jsx
     <button className="bg-[hsl(var(--color-brand))] text-[hsl(var(--primary-foreground))]">Brand</button>
     ```
  4. Oppure via palette Tailwind generata:
     ```jsx
     <button className="bg-brand/80 text-primary-foreground">Brand</button>
     ```

- Aggiungere una spaziatura “72”:
  1. `src/lib/tokens.ts`
     ```ts
     spacing['72'] = '18rem'
     ```
  2. `src/styles/globals.css`
     ```css
     :root { --spacing-72: 18rem; }
     ```
  3. Utilizzo:
     ```jsx
     <div className="p-72">...</div>
     ```

## Errori Comuni
- Usare `hsl(var(--token) / alpha)` nei CSS inline quando PostCSS non supporta la notazione slash → causa errori di parsing.
- Dimenticare di definire la variabile CSS `--color-<key>` in `globals.css` quando si aggiunge una chiave nuova in `designTokens.colors` → le classi Tailwind esistono, ma non renderizzano un colore valido.
- Inserire valori `hsl(...)` completi dentro le variabili CSS: devono contenere solo i componenti (es. `h, s, l`) per funzionare con `hsl(var(--...))`.

## Debug Tips
- Verifica variabili attive nel DOM:
  - Ispeziona `:root` o `.dark` e controlla i valori `--background`, `--foreground`, ecc.
- Traccia tema:
  - Log ed eventi in `ThemeInjector` (`src/react/lib/themeInjector.ts:114-152`).
  - Script di `Layout.astro` mostra sorgenti tema (`src/layouts/Layout.astro:104-113`).

## Personalizzazioni
- Palette Tailwind: usa la sezione `extend.colors` per aggiungere gruppi o layer specifici (`tailwind.config.ts:31-94`).
- Tipografia: modifica `--font-sans` / `--font-mono` e aggiorna `typographyTokens` per consistenza.
- Spaziatura: mantieni `spacing` e le `--spacing-*` sincronizzate.
