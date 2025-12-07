## PRD – Standardizzazione Creazione [NewIndex](cci:1://file:///Users/default/Sviluppo/Nodejs/projects/openfav-migration/openfav-codebase-V0/src/react/components/new-index/NewIndex.tsx:7:0-86:1) in `openfav-codebase-V0`

### 1. Contesto

Vogliamo una procedura **deterministica** per trasformare una pagina V4 (es. [src/pages/Index.tsx](cci:7://file:///Users/default/Sviluppo/nodejs/projects/openfav-migration/astroflux-V4/src/pages/Index.tsx:0:0-0:0) in `astroflux-V4`) in una nuova “pagina root” React nel progetto:

`/Users/default/Sviluppo/Nodejs/projects/openfav-migration/openfav-codebase-V0`

Queste nuove pagine (es. `new-index`) sono, a regime, directory analoghe a `home` o `dashboard`, ma oggi le usiamo per testare la migrazione.

Obiettivi principali:

- Re-implementare la **parte estetica/comportamentale locale** di V4.
- Integrare con:
  - design tokens già migrati,
  - componenti UI (shadcn) in `react/components/ui`,
  - provider esistenti (`ThemeProvider`, `NavigationProvider`, React Query).
- Mantenere compatibilità con il **dynamic loading** basato su `DynamicWrapper` + `autoComponentLoader`.

---

### 2. Scope

**Incluso:**

- Definizione di uno **standard per la struttura** di una nuova area React (es. `new-index`).
- Regole di mapping da:
  - `astroflux-V4/src/pages/Index.tsx`
  - `astroflux-V4/src/components/*.tsx`
  
  → a:
  - `openfav-codebase-V0/src/react/components/<area>`.
- Contratto che ogni root (`NewIndex`) deve rispettare per essere caricabile da `DynamicWrapper`.

**Escluso (per ora):**

- Generazione automatica di `App.tsx`/`main.tsx` per progetti standalone (gestito in un altro PRD).
- Refactor profondo della logica di routing (es. eliminazione `useNavigate` dai componenti originali) – in V0 usiamo `NavigationProvider`.

---

### 3. Requisiti Funzionali

#### 3.1. Struttura di directory per una nuova area

Per ogni nuova area (es. `new-index`):

- Directory base:
  - `src/react/components/<area>/`
- Root entry caricabile dinamicamente:
  - `src/react/components/<area>/<AreaName>.tsx`
  - esempio corrente:
    - `src/react/components/new-index/NewIndex.tsx`

Opzionale, per crescita futura:

- sotto-directory per sezioni:
  - `src/react/components/<area>/sub/…`
- index re-export:
  - `src/react/components/<area>/index.tsx` (può re-esportare `default` da `<AreaName>.tsx`).

#### 3.2. Contratto del componente root (`NewIndex`)

Ogni root deve:

- essere un **React Functional Component**:
  ```tsx
  const NewIndex: React.FC = () => { ... }
  export default NewIndex
  ```
- non importare né creare direttamente Router (`BrowserRouter`, `useNavigate`, ecc.);
- essere **side-effect free** a livello di modulo (solo JSX/logica di UI).

Questo garantisce compatibilità con:

- `DynamicWrapper` (si aspetta un default export React),
- provider globali gestiti da `AppClient` (`ThemeProvider`, `NavigationProvider`, `QueryClientProvider`).

#### 3.3. Regole di mapping dagli asset V4

Prendendo il caso `Index.tsx` di V4 come esempio:

```ts
// V4
import Navbar from '@/components/Navbar';
import { Rocket, Zap, Box, Trophy } from 'lucide-react';
```

Le regole di adattamento nel V0 sono:

- **Icone e tipi Lucide**  
  - Restano da `lucide-react`:
    - `import { Rocket, Zap, Box, Trophy } from 'lucide-react'`
- **Feature card inline**  
  - In V4: `FeatureCard` definita inline in `Index.tsx`.
  - In V0: usare `FeatureCard` già presente:
    - `import { FeatureCard } from '@/react/components/dashboard/FeatureCard'`
- **Navbar**  
  - In V4: `Navbar` in `src/components/Navbar.tsx`.
  - In V0: per ora header semplificato in `NewIndex`:
    - branding + link + ThemeToggle.
  - In futuro: se migrata, seguirà convenzione:
    - `@/react/components/<area>/sub/Navbar` o `@/react/components/common/Navbar`.
- **Theme Toggle**  
  - V4 (legacy) → V0 standard:
    - `import { ThemeToggle } from '@/react/components/common/ThemeToggle'`
- **Shadcn UI** (es. Button):
  - V4: `@/components/ui/button`
  - V0: `@/react/components/ui/button`
    ```ts
    import { Button } from '@/react/components/ui/button'
    ```

Queste regole devono essere **statiche e documentate**, non scelte a runtime dall’agent.

#### 3.4. Layout standard di `NewIndex`

Lo scheletro di una pagina root migrata deve seguire:

1. **Wrapper principale**:
   ```tsx
   <div className="min-h-screen bg-background text-foreground flex flex-col">
     <header>…</header>
     <main>…</main>
     <footer>…</footer>
   </div>
   ```

2. **Header**:
   - Branding “OpenFav” (o nome progetto).
   - CTA principale (“Get Started”).
   - Link di sezione (“Features”, “How it works”, etc.).
   - `ThemeToggle`.

3. **Main**:

   - **Hero section**:
     - titolo di benvenuto,
     - descrizione,
     - bottone `Button` (CTA, es. `/auth`).

   - **Features section**:
     - griglia di feature mappata da V4 (Rocket/Zap/Box/Trophy),
     - ogni card resa con `FeatureCard`.

4. **Footer**:

   - copyright:  
     `© {new Date().getFullYear()} OpenFav. All rights reserved.`  

Questo layout deve essere un **template riusabile**; i testi possono variare a seconda del progetto sorgente.

---

### 4. Requisiti Non Funzionali

- **Compatibilità dynamic loader**:
  - `NewIndex.tsx` deve:
    - essere risolto da `autoComponentLoader` per nome (`NewIndex` → path).
    - esportare `default` come React component.
- **Nessuna gestione router interna**:
  - eventuale navigazione userà `NavigationProvider` (`useNavigation`), non `useNavigate` di React Router.
- **Riuso di componenti esistenti**:
  - preferire `dashboard/FeatureCard`, `common/ThemeToggle`, `ui/button` rispetto alla copia 1:1 del codice V4.

---

### 5. Estensioni Future (non nel perimetro immediato)

- Aggiungere nel tool di migrazione un comando:
  - `components:scaffold-index --name <area>`
  - che:
    - crea `src/react/components/<area>/<AreaName>.tsx` partendo dal template standard,
    - applica regole di mapping (feature, CTA, header).
- Supportare automaticamente la creazione di sub-componenti dedicati:
  - `sub/HeroSection.tsx`
  - `sub/FeaturesSection.tsx`
- Integrare la definizione di `NewIndex` con la generazione di `App.tsx`/`main.tsx` in un nuovo repo React standalone (non solo in V0).

---

### 6. Done Criteria

Si considera soddisfatto questo PRD quando:

1. Esiste documentazione interna (o snippet) che descrive:
   - struttura directory per una nuova area (`<area>`),
   - forma obbligatoria del root component (`export default React.FC`),
   - mappatura V4 → V0 per import chiave (`components/ui`, `ThemeToggle`, `FeatureCard`).
2. In `openfav-codebase-V0`:
   - `src/react/components/new-index/NewIndex.tsx` rispetta esattamente lo standard definito.
   - `NewIndex` può essere caricato da `DynamicWrapper` tramite `autoComponentLoader` senza errori.
3. Le stesse regole possono essere riapplicate per creare una nuova area (es. `home2`, `experiment-index`) senza decisioni ad‑hoc da parte dell’agent.
