const setupPanel = document.getElementById('setup');
const revealPanel = document.getElementById('reveal');
const startPanel = document.getElementById('start');

const playerCountInput = document.getElementById('player-count');
const impostorCountInput = document.getElementById('impostor-count');
const playerList = document.getElementById('player-list');

const modeInputs = Array.from(document.querySelectorAll('input[name="word-mode"]'));
const topicField = document.getElementById('topic-field');
const promptField = document.getElementById('prompt-field');
const topicInput = document.getElementById('topic-input');
const promptInput = document.getElementById('prompt-input');

const generateWordButton = document.getElementById('generate-word');
const wordStatus = document.getElementById('word-status');
const wordOutput = document.getElementById('word-output');
const wordError = document.getElementById('word-error');

const startRolesButton = document.getElementById('start-roles');
const setupError = document.getElementById('setup-error');

const revealInstruction = document.getElementById('reveal-instruction');
const revealRoleButton = document.getElementById('reveal-role');
const nextPlayerButton = document.getElementById('next-player');
const progressCurrent = document.getElementById('progress-current');
const progressTotal = document.getElementById('progress-total');

const revealImpostorsButton = document.getElementById('reveal-impostors');

const scrim = document.getElementById('scrim');
const sheet = document.getElementById('sheet');
const sheetTitle = document.getElementById('sheet-title');
const sheetBody = document.getElementById('sheet-body');
const sheetClose = document.getElementById('sheet-close');

const panels = [setupPanel, revealPanel, startPanel];
const minPlayers = 3;
const maxPlayers = 20;

let generatedWord = '';
let roles = [];
let currentIndex = 0;
let sheetContext = null;

function clampNumber(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function setActivePanel(panel) {
  panels.forEach((item) => {
    item.classList.toggle('is-active', item === panel);
  });
}

function getPlayerNames() {
  return Array.from(playerList.querySelectorAll('input')).map((input) =>
    input.value.trim()
  );
}

function renderPlayerInputs(count) {
  const existing = getPlayerNames();
  playerList.innerHTML = '';

  for (let index = 0; index < count; index += 1) {
    const wrapper = document.createElement('div');
    wrapper.className = 'field';

    const label = document.createElement('label');
    label.setAttribute('for', `player-${index}`);
    label.textContent = `Giocatore ${index + 1}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `player-${index}`;
    input.placeholder = 'Nome';
    input.maxLength = 18;
    input.value = existing[index] || '';

    wrapper.append(label, input);
    playerList.appendChild(wrapper);
  }
}

function syncImpostorMax(count) {
  const maxImpostors = Math.max(1, count - 1);
  impostorCountInput.max = maxImpostors;
  const current = parseInt(impostorCountInput.value, 10);
  if (current > maxImpostors) {
    impostorCountInput.value = maxImpostors;
  }
}

function getSelectedMode() {
  const selected = modeInputs.find((input) => input.checked);
  return selected ? selected.value : 'auto';
}

function updateModeFields() {
  const mode = getSelectedMode();
  topicField.classList.toggle('is-hidden', mode !== 'topic');
  promptField.classList.toggle('is-hidden', mode !== 'prompt');
}

function showError(target, message) {
  target.textContent = message;
  target.classList.remove('is-hidden');
}

function clearError(target) {
  target.textContent = '';
  target.classList.add('is-hidden');
}

function setWordStatus(message) {
  wordStatus.textContent = message;
}

function cleanWord(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)[0]
    .replace(/^"|"$/g, '')
    .replace(/^'|'$/g, '')
    .trim();
}

function shuffle(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function assignRoles(names, impostorCount) {
  const indices = shuffle(names.map((_, index) => index));
  const impostorSet = new Set(indices.slice(0, impostorCount));
  return names.map((name, index) => ({
    name,
    role: impostorSet.has(index) ? 'impostore' : 'cittadino',
  }));
}

function updateRevealScreen() {
  const current = roles[currentIndex];
  revealInstruction.textContent = `Passa il telefono a ${current.name}. Tocca "Rileva ruolo".`;
  progressCurrent.textContent = currentIndex + 1;
  progressTotal.textContent = roles.length;
  nextPlayerButton.textContent =
    currentIndex === roles.length - 1 ? 'Inizio partita' : 'Giocatore successivo';
  nextPlayerButton.disabled = true;
}

function openSheet(title, body, context) {
  sheetTitle.textContent = title;
  sheetBody.textContent = body;
  sheetContext = context;
  scrim.hidden = false;
  requestAnimationFrame(() => {
    scrim.classList.add('is-visible');
  });
  sheet.classList.add('is-open');
  sheet.setAttribute('aria-hidden', 'false');
}

function closeSheet() {
  sheet.classList.remove('is-open');
  sheet.setAttribute('aria-hidden', 'true');
  scrim.classList.remove('is-visible');
  setTimeout(() => {
    scrim.hidden = true;
  }, 220);
}

function handleSheetClose() {
  closeSheet();
  if (sheetContext === 'role') {
    nextPlayerButton.disabled = false;
  }
  sheetContext = null;
}

playerCountInput.addEventListener('input', () => {
  const value = clampNumber(
    parseInt(playerCountInput.value, 10),
    minPlayers,
    maxPlayers
  );
  playerCountInput.value = value;
  renderPlayerInputs(value);
  syncImpostorMax(value);
});

impostorCountInput.addEventListener('input', () => {
  const count = clampNumber(
    parseInt(impostorCountInput.value, 10),
    1,
    Math.max(1, parseInt(playerCountInput.value, 10) - 1)
  );
  impostorCountInput.value = count;
});

modeInputs.forEach((input) => {
  input.addEventListener('change', updateModeFields);
});

generateWordButton.addEventListener('click', async () => {
  clearError(wordError);
  const mode = getSelectedMode();
  const topic = topicInput.value.trim();
  const prompt = promptInput.value.trim();

  if (mode === 'topic' && !topic) {
    showError(wordError, 'Inserisci un tema per la parola.');
    return;
  }

  if (mode === 'prompt' && !prompt) {
    showError(wordError, 'Inserisci un prompt per la parola.');
    return;
  }

  generateWordButton.disabled = true;
  setWordStatus('Generazione in corso...');

  try {
    const response = await fetch('/api/generate-word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, topic, prompt }),
    });

    if (!response.ok) {
      throw new Error('Errore nella generazione');
    }

    const data = await response.json();
    const cleaned = cleanWord(data.word || '');

    if (!cleaned) {
      throw new Error('Parola vuota');
    }

    generatedWord = cleaned;
    wordOutput.textContent = cleaned;
    setWordStatus('Parola pronta');
  } catch (error) {
    setWordStatus('Nessuna parola generata');
    showError(
      wordError,
      'Non riesco a generare la parola. Riprova tra poco.'
    );
  } finally {
    generateWordButton.disabled = false;
  }
});

startRolesButton.addEventListener('click', () => {
  clearError(setupError);
  const names = getPlayerNames();
  const missing = names.some((name) => !name);
  const impostorCount = parseInt(impostorCountInput.value, 10);

  if (missing) {
    showError(setupError, 'Inserisci tutti i nomi dei giocatori.');
    return;
  }

  if (!generatedWord) {
    showError(setupError, 'Genera la parola prima di iniziare.');
    return;
  }

  if (impostorCount >= names.length) {
    showError(setupError, 'Gli impostori devono essere meno dei giocatori.');
    return;
  }

  roles = assignRoles(names, impostorCount);
  currentIndex = 0;
  updateRevealScreen();
  setActivePanel(revealPanel);
});

revealRoleButton.addEventListener('click', () => {
  const current = roles[currentIndex];
  if (!current) return;

  if (current.role === 'impostore') {
    openSheet('Impostore', 'Non hai la parola. Osserva e improvvisa.', 'role');
  } else {
    openSheet('La parola e', generatedWord, 'role');
  }
});

nextPlayerButton.addEventListener('click', () => {
  if (currentIndex >= roles.length - 1) {
    setActivePanel(startPanel);
    return;
  }
  currentIndex += 1;
  updateRevealScreen();
});

revealImpostorsButton.addEventListener('click', () => {
  const impostors = roles
    .filter((entry) => entry.role === 'impostore')
    .map((entry) => entry.name);
  const list = impostors.length ? impostors.join(', ') : 'Nessuno';
  openSheet(
    'Impostori',
    `Impostori: ${list}`,
    'impostors'
  );
});

sheetClose.addEventListener('click', handleSheetClose);

scrim.addEventListener('click', () => {
  if (sheetContext) {
    handleSheetClose();
  }
});

renderPlayerInputs(parseInt(playerCountInput.value, 10));
syncImpostorMax(parseInt(playerCountInput.value, 10));
updateModeFields();
