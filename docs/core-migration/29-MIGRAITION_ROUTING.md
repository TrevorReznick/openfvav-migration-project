Strategia di Adattamento Deterministica

- Le scelte A/B/C sono locali; serve una strategia di adattamento deterministica, non delegata ogni volta all’agent.
- Obiettivo: generare un nuovo progetto React “puro” prendendo da V4:
  - tokens (già quasi a posto)
  - componenti React di UI (estetica + behaviour locale)
  - senza libertà di reinterpretazione dell’agent
Blocchi di Regole “Rigide”

- Regole di mapping file → destinazione
  
  - Pagine: src/pages/*.tsx → src/react/components/new-index/pages/*.tsx (o convenzione chiara)
  - Componenti UI: src/components/*.tsx → src/react/components/ui/*.tsx
  - File root:
    - main.tsx → ignorato (bootstrap host-specific)
    - App.tsx → opzionale: wrapper ricreato a mano o solo come riferimento
  - Le regole sono anticipate nel migration-report.json (pages + components)
- Regole per il routing
  
  - Strategia Routing: nel nuovo repo React si usa react-router-dom localmente
  - I componenti che usano useNavigate , useLocation , ecc. devono essere montati sotto un Router
  - Inserire un “root” React che replica il ruolo di App.tsx :
    ```
    <BrowserRouter>
      <NewIndex />
    </BrowserRouter>
    ```
  - La scelta A/B/C diventa policy, non decisione runtime
    - Esempio: per progetti migrati V4→React “keep router = A/C, non B”
- Regole per import / alias
  
  - Tabella di mapping chiara:
    - Button → button
    - ../components/X → X → poi rimappato secondo componentMap
  - Esempio proto‑standard in migration-report.json :
    ```
    {
      "Navbar": "@/react/components/Navbar",
      "App": "@/react/components/App"
    }
    ```
  - Il tool deve:
    - riconoscere pattern di import noti
    - sostituirli secondo mapping statico
    - fallire rumorosamente fuori regole (non “inventare”)
- Regole per side‑effects globali
  
  - CSS globali:
    - index.css → mappato in globals.css / tailwind secondo regole token
  - Init di provider:
    - Se trovi QueryClientProvider , ThemeProvider , ecc. in root:
      - o li ricrei 1:1 nel nuovo App
      - o li mappi su provider “ufficiali” del nuovo ecosistema
Ruolo dell’Agent vs. Regole

- Tool / script:
  - applicano sempre le stesse regole (mappatura percorsi, import, router, tokens)
  - fanno il 90% del lavoro in modo ripetibile
- Agent (o umano):
  - interviene solo sui casi “fuori policy”
  - componenti con effetti collaterali o chiamate dirette al router host
  - parti di dominio che richiedono scelte di design
- Non “buttare il codice all’agent per adattarlo”:
  - l’agent lavora dentro una griglia di regole definite e implementate nel tool di migrazione
Collegamento con A/B/C

- Scenario: nuovo repo React (estetica + behaviour, tokens già migrati)
- Strategia:
  - A/C come regola di base:
    - il nuovo progetto React mantiene un router interno (React Router)
    - replica controllata del pattern main → App → Router → Index
    - eventuale wrapping dinamico di Astro vede un entrypoint React autonomo
  - B come obiettivo successivo:
    - quando/ se vorrai UI davvero router‑agnostic da integrare con altro host/router
Livello Strategico

- Non “come fixo l’errore di useNavigate ?”
- Ma “che contratto stabile definisco tra sorgente V4 e nuovo ecosistema React, così la migrazione è ripetibile e non dipende dall’umore di un agent?”
Prossimi Passi

- Scrivo una pseudo‑spec (PRD tecnico) con set di regole:
  - Paths
  - Import
  - Routing
  - Tokens
  - Provider
- Usiamo queste regole per guidare l’evoluzione del tool di migrazione che stai già costruendo.