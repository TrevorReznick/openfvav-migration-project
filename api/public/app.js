// Elementi del DOM
const form = document.getElementById('migration-form');
const scriptSelect = document.getElementById('script');
const sourceInput = document.getElementById('source');
const destinationInput = document.getElementById('destination');
const runButton = document.getElementById('run-script');
const outputDiv = document.getElementById('output');
const sourceStatus = document.getElementById('source-status');
const destinationStatus = document.getElementById('destination-status');
const sourceStatusText = document.getElementById('source-status-text');
const destinationStatusText = document.getElementById('destination-status-text');
const validateSourceBtn = document.getElementById('validate-source-btn');
const validateDestinationBtn = document.getElementById('validate-destination-btn');
const dryRunCheckbox = document.getElementById('dry-run');
const commandDescription = document.getElementById('command-description');

const API_BASE = window.location.origin;

/**
 * Carica i comandi disponibili dal server
 */
async function loadCommands() {
  try {
    const response = await fetch(`${API_BASE}/commands`);
    const data = await response.json();
    
    scriptSelect.innerHTML = '<option value="">Seleziona un comando...</option>';
    
    // Raggruppa comandi per categoria
    const categories = {
      tokens: [],
      components: [],
      all: [],
      utility: []
    };
    
    data.commands.forEach(cmd => {
      if (categories[cmd.category]) {
        categories[cmd.category].push(cmd);
      }
    });
    
    // Aggiungi comandi raggruppati
    if (categories.tokens.length > 0) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = 'Token Migration';
      categories.tokens.forEach(cmd => {
        const option = createCommandOption(cmd);
        optgroup.appendChild(option);
      });
      scriptSelect.appendChild(optgroup);
    }
    
    if (categories.components.length > 0) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = 'Component Migration';
      categories.components.forEach(cmd => {
        const option = createCommandOption(cmd);
        optgroup.appendChild(option);
      });
      scriptSelect.appendChild(optgroup);
    }
    
    if (categories.all.length > 0) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = 'All Migrations';
      categories.all.forEach(cmd => {
        const option = createCommandOption(cmd);
        optgroup.appendChild(option);
      });
      scriptSelect.appendChild(optgroup);
    }
    
    if (categories.utility.length > 0) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = 'Utility';
      categories.utility.forEach(cmd => {
        const option = createCommandOption(cmd);
        optgroup.appendChild(option);
      });
      scriptSelect.appendChild(optgroup);
    }
    
    // Aggiorna descrizione quando cambia selezione
    scriptSelect.addEventListener('change', () => {
      const selected = scriptSelect.options[scriptSelect.selectedIndex];
      const description = selected.dataset.description || '';
      const implemented = selected.dataset.implemented === 'true';
      const requiresPaths = selected.dataset.requiresPaths === 'true';
      
      commandDescription.textContent = description;
      
      // Mostra warning se non implementato
      if (!implemented && selected.value) {
        commandDescription.textContent += ' ⚠️ Questo comando non è ancora implementato.';
        commandDescription.style.color = '#dc3545';
      } else {
        commandDescription.style.color = '#666';
      }
      
      // Mostra info se non richiede path
      if (!requiresPaths && selected.value) {
        const pathInfo = document.createElement('div');
        pathInfo.className = 'path-info';
        pathInfo.style.fontSize = '0.8rem';
        pathInfo.style.color = '#666';
        pathInfo.style.marginTop = '0.25rem';
        pathInfo.textContent = 'ℹ️ Questo comando non richiede path sorgente/destinazione';
        if (!commandDescription.nextElementSibling || !commandDescription.nextElementSibling.classList.contains('path-info')) {
          commandDescription.parentNode.insertBefore(pathInfo, commandDescription.nextSibling);
        }
      } else {
        const pathInfo = commandDescription.nextElementSibling;
        if (pathInfo && pathInfo.classList.contains('path-info')) {
          pathInfo.remove();
        }
      }
      
      // Non disabilitiamo il bottone - l'utente può provare a eseguire
      // ma mostreremo un avviso se non implementato
      runButton.disabled = !selected.value;
    });
  } catch (error) {
    console.error('Errore caricamento comandi:', error);
    scriptSelect.innerHTML = '<option value="tokens">Migrate Design Tokens</option>' +
                            '<option value="colors">Migrate Colors</option>' +
                            '<option value="typography">Migrate Typography</option>' +
                            '<option value="spacing">Migrate Spacing</option>' +
                            '<option value="components">Migrate Components</option>' +
                            '<option value="all">Run All Migrations</option>';
  }
}

/**
 * Crea un'opzione per un comando
 */
function createCommandOption(cmd) {
  const option = document.createElement('option');
  option.value = cmd.value;
  
  // Mostra label pulita (il warning appare solo nella descrizione)
  option.textContent = cmd.label;
  option.dataset.description = cmd.description;
  option.dataset.implemented = cmd.implemented;
  option.dataset.category = cmd.category;
  option.dataset.requiresPaths = cmd.requiresPaths;
  
  // Non disabilitiamo le opzioni - l'utente può selezionarle
  // ma verranno bloccate all'esecuzione se non implementate
  
  return option;
}

/**
 * Valida un path
 */
async function validatePath(path, type) {
  if (!path || path.trim() === '') {
    return { valid: false, message: 'Path vuoto' };
  }

  try {
    const response = await fetch(`${API_BASE}/validate-paths`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: type === 'source' ? path : null,
        destination: type === 'destination' ? path : null
      })
    });

    const data = await response.json();
    const validation = type === 'source' ? data.validation.source : data.validation.destination;

    return {
      valid: validation.exists && validation.isDirectory,
      exists: validation.exists,
      isDirectory: validation.isDirectory,
      message: !validation.exists 
        ? 'Path non esiste' 
        : !validation.isDirectory 
          ? 'Non è una cartella' 
          : 'Path valido'
    };
  } catch (error) {
    return { valid: false, message: `Errore: ${error.message}` };
  }
}

/**
 * Aggiorna lo stato visivo di un path
 */
function updatePathStatus(input, statusIndicator, statusText, type) {
  const path = input.value.trim();
  
  if (path === '') {
    statusIndicator.className = 'status-indicator';
    statusText.textContent = '';
    return;
  }

  validatePath(path, type).then(result => {
    if (result.valid) {
      statusIndicator.className = 'status-indicator valid';
      statusText.textContent = '✓ ' + result.message;
      statusText.style.color = '#28a745';
    } else {
      statusIndicator.className = 'status-indicator invalid';
      statusText.textContent = '✗ ' + result.message;
      statusText.style.color = '#dc3545';
    }
  });
}

/**
 * Mostra output
 */
function showOutput(message, type = 'info') {
  outputDiv.className = type;
  outputDiv.textContent = message;
  outputDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Esegue lo script di migrazione
 */
async function runMigration() {
  const script = scriptSelect.value;
  const source = sourceInput.value.trim();
  const destination = destinationInput.value.trim();
  const dryRun = dryRunCheckbox.checked;
  
  const selectedOption = scriptSelect.options[scriptSelect.selectedIndex];
  const requiresPaths = selectedOption.dataset.requiresPaths === 'true';
  const implemented = selectedOption.dataset.implemented === 'true';

  // Validazione preliminare
  if (!script) {
    showOutput('Errore: Seleziona un tipo di migrazione', 'error');
    return;
  }
  
  // Verifica se il comando è implementato
  if (!implemented) {
    showOutput(
      '⚠️ Questo comando non è ancora implementato.\n\n' +
      'I comandi disponibili sono:\n' +
      '  • tokens - Migra tutti i design tokens\n' +
      '  • all - Esegue tutte le migrazioni disponibili\n' +
      '  • validate - Valida la configurazione\n\n' +
      'Gli altri comandi saranno disponibili in futuro.',
      'error'
    );
    return;
  }

  // Validazione path solo se richiesti
  if (requiresPaths) {
    if (!source || !destination) {
      showOutput('Errore: Inserisci entrambi i path (sorgente e destinazione)', 'error');
      return;
    }

    // Validazione path
    const sourceValidation = await validatePath(source, 'source');
    const destValidation = await validatePath(destination, 'destination');

    if (!sourceValidation.valid) {
      showOutput(`Errore: Path sorgente non valido - ${sourceValidation.message}`, 'error');
      return;
    }

    if (!destValidation.valid) {
      showOutput(`Errore: Path destinazione non valido - ${destValidation.message}`, 'error');
      return;
    }
  }

  // Disabilita il bottone e mostra loading
  runButton.disabled = true;
  runButton.innerHTML = '<span class="loading"></span> Esecuzione in corso...';
  showOutput(`⏳ Esecuzione della migrazione in corso...\n${dryRun ? '(Modalità Dry Run - nessuna modifica verrà applicata)\n' : ''}\n`, 'info');

  try {
    const response = await fetch(`${API_BASE}/run-script`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ script, source, destination, dryRun }),
    });

    const result = await response.json();

    if (result.success) {
      let outputMessage = `✅ Comando eseguito con successo!\n\n` +
        `Script: ${script}\n`;
      
      if (requiresPaths) {
        outputMessage += `Sorgente: ${source}\n` +
          `Destinazione: ${destination}\n`;
      }
      
      outputMessage += `${dryRun ? 'Modalità: Dry Run (nessuna modifica applicata)\n' : ''}\n` +
        `Output:\n${result.stdout || 'Nessun output'}`;
      
      showOutput(outputMessage, 'success');
    } else {
      showOutput(
        `❌ Errore durante l'esecuzione:\n\n` +
        `Exit Code: ${result.exitCode}\n\n` +
        `Stderr:\n${result.stderr || 'Nessun errore'}\n\n` +
        `Stdout:\n${result.stdout || 'Nessun output'}`,
        'error'
      );
    }
  } catch (error) {
    showOutput(
      `❌ Errore di connessione:\n${error.message}\n\n` +
      `Assicurati che il server sia in esecuzione.`,
      'error'
    );
  } finally {
    // Riabilita il bottone
    runButton.disabled = false;
    runButton.textContent = 'Esegui Migrazione';
  }
}

// Event Listeners
form.addEventListener('submit', (e) => {
  e.preventDefault();
  runMigration();
});

// Validazione path in tempo reale
sourceInput.addEventListener('blur', () => {
  updatePathStatus(sourceInput, sourceStatus, sourceStatusText, 'source');
});

destinationInput.addEventListener('blur', () => {
  updatePathStatus(destinationInput, destinationStatus, destinationStatusText, 'destination');
});

// Pulsanti di validazione manuale
validateSourceBtn.addEventListener('click', () => {
  updatePathStatus(sourceInput, sourceStatus, sourceStatusText, 'source');
});

validateDestinationBtn.addEventListener('click', () => {
  updatePathStatus(destinationInput, destinationStatus, destinationStatusText, 'destination');
});

// Validazione iniziale al caricamento
document.addEventListener('DOMContentLoaded', async () => {
  // Carica comandi disponibili
  await loadCommands();
  
  // Verifica connessione al server
  try {
    const response = await fetch(`${API_BASE}/info`);
    const info = await response.json();
    console.log('Server info:', info);
    
    if (!info.cliExists) {
      showOutput('⚠️ Attenzione: CLI non trovato. Verifica la configurazione del server.', 'error');
    }
    
    if (!info.configExists) {
      const configMessage = 
        'ℹ️ File di configurazione non trovato.\n\n' +
        'Non è necessario se usi i path direttamente nell\'interfaccia.\n' +
        'Il file migration.config.json è utile solo per:\n' +
        '  • Eseguire comandi da CLI senza specificare path ogni volta\n' +
        '  • Configurare mapping avanzati di token e componenti\n\n';
      
      showOutput(configMessage, 'info');
      
      // Aggiungi bottone per creare il config se l'esempio esiste
      if (info.configExampleExists) {
        const createConfigBtn = document.createElement('button');
        createConfigBtn.type = 'button';
        createConfigBtn.className = 'btn-secondary';
        createConfigBtn.style.marginTop = '0.5rem';
        createConfigBtn.textContent = 'Crea migration.config.json da esempio';
        createConfigBtn.onclick = async () => {
          createConfigBtn.disabled = true;
          createConfigBtn.textContent = 'Creazione in corso...';
          
          try {
            const response = await fetch(`${API_BASE}/create-config`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
              showOutput(
                `✅ File di configurazione creato con successo!\n\n` +
                `Path: ${result.configPath}\n\n` +
                `Puoi ora modificarlo manualmente se necessario.`,
                'success'
              );
              createConfigBtn.remove();
            } else {
              showOutput(
                `❌ Errore durante la creazione:\n${result.message}`,
                'error'
              );
              createConfigBtn.disabled = false;
              createConfigBtn.textContent = 'Crea migration.config.json da esempio';
            }
          } catch (error) {
            showOutput(
              `❌ Errore di connessione:\n${error.message}`,
              'error'
            );
            createConfigBtn.disabled = false;
            createConfigBtn.textContent = 'Crea migration.config.json da esempio';
          }
        };
        
        // Aggiungi il bottone dopo il form, prima dell'output
        const form = document.getElementById('migration-form');
        form.parentNode.insertBefore(createConfigBtn, form.nextSibling);
      }
    }
  } catch (err) {
    console.error('Errore connessione server:', err);
    showOutput('⚠️ Impossibile connettersi al server. Assicurati che sia in esecuzione.', 'error');
  }
});

