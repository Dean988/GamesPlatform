const setupPanel = document.getElementById('setup');
const revealPanel = document.getElementById('reveal');
const startPanel = document.getElementById('start');

const playerCountInput = document.getElementById('player-count');
const impostorCountInput = document.getElementById('impostor-count');
const playerList = document.getElementById('player-inputs');

const modeInputs = Array.from(document.querySelectorAll('input[name="word-mode"]'));
const topicField = document.getElementById('topic-field');
const promptField = document.getElementById('prompt-field');
const topicInput = document.getElementById('topic-input');
const promptInput = document.getElementById('prompt-input');

const generateWordButton = document.getElementById('generate-word');
const wordStatus = document.getElementById('word-status');
const wordOutput = document.getElementById('word-output');
const wordError = document.getElementById('word-error');
const wordBoxContainer = document.getElementById('word-box-container');

const startRolesButton = document.getElementById('start-roles');
const setupError = document.getElementById('setup-error');

const revealInstruction = document.getElementById('reveal-instruction');
const revealRoleButton = document.getElementById('reveal-role');
const nextPlayerButton = document.getElementById('next-player');
const progressCurrent = document.getElementById('progress-current');
const progressTotal = document.getElementById('progress-total');
const progressFill = document.getElementById('progress-fill');

const revealImpostorsButton = document.getElementById('reveal-impostors');

const scrim = document.getElementById('scrim');
const sheet = document.getElementById('sheet');
const sheetTitle = document.getElementById('sheet-title');
const sheetBody = document.getElementById('sheet-body');
const sheetClose = document.getElementById('sheet-close');

const restartGameButton = document.getElementById('restart-game');
const btnEnter = document.getElementById('btn-enter');
const btnBack = document.getElementById('btn-back-home');
const landing = document.getElementById('landing');
const gameFlow = document.getElementById('game-flow');
const mpPanel = document.getElementById('impostor-mp');
const mpNameInput = document.getElementById('impostor-mp-name');
const mpHostBtn = document.getElementById('impostor-host-btn');
const mpJoinCodeInput = document.getElementById('impostor-join-code');
const mpJoinBtn = document.getElementById('impostor-join-btn');
const mpRoomCode = document.getElementById('impostor-room-code');
const mpCopyBtn = document.getElementById('impostor-copy-code');
const mpRoster = document.getElementById('impostor-roster');
const mpError = document.getElementById('impostor-mp-error');

const panels = [setupPanel, revealPanel, startPanel];
const minPlayers = 3;
const maxPlayers = 20;

let generatedWord = '';
let roles = [];
let currentIndex = 0;
let sheetContext = null;
let mpState = {
  isHost: false,
  roomCode: '',
  name: '',
  playerId: '',
  roster: []
};

function isMultiMode() {
  return window.GP_MODE === 'multi';
}

function createPlayerId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function clampNumber(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function setActivePanel(panel) {
  panels.forEach((item) => {
    if (item === panel) {
      item.classList.add('is-visible');
    } else {
      item.classList.remove('is-visible');
    }
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

    const input = document.createElement('input');
    input.type = 'text';
    input.dataset.index = index;
    input.placeholder = `Giocatore ${index + 1}`;
    input.maxLength = 18;
    input.value = existing[index] || '';

    wrapper.appendChild(input);
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
  if (!target) return;
  target.textContent = '';
  target.classList.add('is-hidden');
}

function showMpError(message) {
  if (!mpError) return;
  mpError.textContent = message;
  mpError.classList.remove('is-hidden');
}

function clearMpError() {
  if (!mpError) return;
  mpError.textContent = '';
  mpError.classList.add('is-hidden');
}

function getRequiredMpName() {
  const name = (mpNameInput?.value || '').trim();
  if (!name) {
    showMpError('Inserisci il tuo nome.');
    return null;
  }
  clearMpError();
  return name;
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
  const safeNames = names.map((n, i) => n || `Giocatore ${i + 1}`);
  const indices = shuffle(safeNames.map((_, index) => index));
  const impostorSet = new Set(indices.slice(0, impostorCount));
  return safeNames.map((name, index) => ({
    name,
    role: impostorSet.has(index) ? 'impostore' : 'cittadino',
    seen: false
  }));
}

function updateRevealScreen() {
  const current = roles[currentIndex];
  revealInstruction.textContent = `Passa il dispositivo a ${current.name}`;
  progressCurrent.textContent = currentIndex + 1;
  progressTotal.textContent = roles.length;

  const pct = ((currentIndex + 1) / roles.length) * 100;
  if (progressFill) progressFill.style.width = `${pct}%`;

  nextPlayerButton.textContent =
    currentIndex === roles.length - 1 ? 'INIZIO PARTITA' : 'PROSSIMO';
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
  if (sheetContext === 'mp-role') {
    setActivePanel(startPanel);
  }
  sheetContext = null;
}

// RESET FUNCTION
function resetGame() {
  generatedWord = '';
  roles = [];
  currentIndex = 0;
  sheetContext = null;

  // Reset UI
  if (wordOutput) wordOutput.textContent = '???';
  if (wordBoxContainer) wordBoxContainer.classList.add('is-hidden');
  setWordStatus('In attesa');

  if (startRolesButton) {
    startRolesButton.disabled = true;
    startRolesButton.classList.remove('is-ready');
  }

  setActivePanel(setupPanel);

  if (isMultiMode() && mpState.isHost && window.GPRealtime) {
    window.GPRealtime.send('impostor', {
      type: 'impostor',
      action: 'reset',
      senderId: mpState.playerId
    });
  }
}

function updateMpRoster(players) {
  if (!mpRoster) return;
  mpRoster.innerHTML = '';
  players.forEach((player) => {
    const row = document.createElement('div');
    row.className = 'mp-player';
    row.textContent = player.name || 'Giocatore';
    mpRoster.appendChild(row);
  });
}

function applyRosterToInputs(players) {
  const names = players.map((player) => player.name || 'Giocatore');
  playerCountInput.value = names.length || minPlayers;
  renderPlayerInputs(names.length || minPlayers);
  const inputs = playerList.querySelectorAll('input');
  inputs.forEach((input, index) => {
    input.value = names[index] || '';
    input.disabled = true;
  });
  playerCountInput.disabled = true;
  syncImpostorMax(names.length || minPlayers);
}

function unlockHostControls(isHost) {
  generateWordButton.disabled = !isHost;
  startRolesButton.disabled = !isHost || !generatedWord;
  impostorCountInput.disabled = !isHost;
  if (!isHost) {
    setWordStatus('In attesa host...');
  }
}

function connectImpostorRoom(roomCode, name, isHost) {
  if (!window.GPRealtime) return;
  mpState.playerId = createPlayerId();
  mpState.name = name;
  mpState.isHost = isHost;
  mpState.roomCode = roomCode;

  if (mpRoomCode) mpRoomCode.textContent = roomCode;

  window.GPRealtime.connect('impostor', roomCode, {
    id: mpState.playerId,
    name,
    isHost
  }, {
    onPresence: (players) => {
      mpState.roster = players;
      updateMpRoster(players);
      if (mpState.isHost) {
        applyRosterToInputs(players);
        unlockHostControls(true);
      }
    },
    onMessage: (payload) => {
      if (payload?.senderId && payload.senderId === mpState.playerId) return;
      if (!payload || payload.type !== 'impostor') return;
      if (payload.action === 'start') {
        generatedWord = payload.word || '';
        roles = payload.roles || [];
        const myRole = roles.find((entry) => entry.name === mpState.name);
        if (myRole) {
          if (myRole.role === 'impostore') {
            openSheet('IL TUO RUOLO', 'IMPOSTORE\n\nNon conosci la parola.\nCerca di non farti scoprire.', 'mp-role');
          } else {
            openSheet('IL TUO RUOLO', `CITTADINO\n\nParola Segreta:\n${generatedWord}`, 'mp-role');
          }
        }
        setActivePanel(startPanel);
      }
      if (payload.action === 'impostors') {
        const list = payload.impostors?.length ? payload.impostors.join(', ') : 'Nessuno';
        openSheet('VERITA?', `Gli Impostori erano:\n${list}`, 'impostors');
      }
      if (payload.action === 'reset') {
        resetGame();
      }
    }
  });
}

function updateModeUI() {
  const isMulti = isMultiMode();
  if (!isMulti) {
    playerCountInput.disabled = false;
    impostorCountInput.disabled = false;
    renderPlayerInputs(parseInt(playerCountInput.value, 10));
    unlockHostControls(true);
    return;
  }
  unlockHostControls(Boolean(mpState.isHost));
  playerCountInput.disabled = true;
  impostorCountInput.disabled = !mpState.isHost;
}

// HANDLERS

playerCountInput.addEventListener('input', () => {
  if (isMultiMode()) return;
  const value = clampNumber(
    parseInt(playerCountInput.value, 10),
    minPlayers,
    maxPlayers
  );
  if (value >= minPlayers && value <= maxPlayers) {
    renderPlayerInputs(value);
    syncImpostorMax(value);
  }
});

impostorCountInput.addEventListener('input', () => { });

modeInputs.forEach((input) => {
  input.addEventListener('change', updateModeFields);
});

if (mpHostBtn) {
  mpHostBtn.addEventListener('click', () => {
    if (!window.GPRealtime) return;
    const name = getRequiredMpName();
    if (!name) return;
    const code = window.GPRealtime.createRoomCode();
    connectImpostorRoom(code, name, true);
    unlockHostControls(true);
  });
}

if (mpJoinBtn) {
  mpJoinBtn.addEventListener('click', () => {
    if (!window.GPRealtime) return;
    const name = getRequiredMpName();
    if (!name) return;
    const code = (mpJoinCodeInput?.value || '').trim().toUpperCase();
    if (!code) {
      showMpError('Inserisci il codice stanza.');
      return;
    }
    clearMpError();
    connectImpostorRoom(code, name, false);
    unlockHostControls(false);
  });
}

if (mpCopyBtn) {
  mpCopyBtn.addEventListener('click', () => {
    if (!mpRoomCode) return;
    const code = mpRoomCode.textContent.trim();
    if (!code || code === '----') return;
    navigator.clipboard?.writeText(code);
  });
}

window.addEventListener('gp:modechange', (event) => {
  if (event?.detail?.mode === 'single' && window.GPRealtime) {
    window.GPRealtime.disconnect('impostor');
    mpState = { isHost: false, roomCode: '', name: '', playerId: '', roster: [] };
    updateMpRoster([]);
  }
  clearMpError();
  updateModeUI();
});

if (mpNameInput) {
  mpNameInput.addEventListener('input', clearMpError);
}

generateWordButton.addEventListener('click', async () => {
  if (isMultiMode() && !mpState.isHost) return;
  clearError(wordError);
  const mode = getSelectedMode();
  const topic = topicInput.value.trim();
  const prompt = promptInput.value.trim();

  if (mode === 'topic' && !topic) {
    showError(wordError, 'Inserisci un tema.');
    return;
  }

  if (mode === 'prompt' && !prompt) {
    showError(wordError, 'Inserisci un prompt.');
    return;
  }

  generateWordButton.disabled = true;
  setWordStatus('Generazione...');

  if (wordBoxContainer) wordBoxContainer.classList.add('is-hidden');

  try {
    const response = await fetch('/api/generate-word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, topic, prompt }),
    });

    if (!response.ok) {
      throw new Error('Errore API');
    }

    const data = await response.json();
    const cleaned = cleanWord(data.word || '');

    if (!cleaned) {
      throw new Error('Parola vuota');
    }

    generatedWord = cleaned;
    wordOutput.textContent = 'TOP SECRET';

    if (wordBoxContainer) wordBoxContainer.classList.remove('is-hidden');
    setWordStatus('Generata con successo');

    startRolesButton.disabled = false;
    startRolesButton.classList.add('is-ready');

  } catch (error) {
    console.error(error);
    setWordStatus('Errore');
    showError(wordError, 'Errore di connessione o AI.');
  } finally {
    generateWordButton.disabled = false;
  }
});

startRolesButton.addEventListener('click', () => {
  clearError(setupError);
  if (isMultiMode() && !mpState.isHost) return;
  const names = getPlayerNames();

  if (!generatedWord) {
    showError(setupError, 'Devi generare la parola.');
    return;
  }

  const impostorCount = parseInt(impostorCountInput.value, 10);
  if (impostorCount >= names.length) {
    showError(setupError, 'Troppi impostori.');
    return;
  }

  roles = assignRoles(names, impostorCount);
  currentIndex = 0;
  updateRevealScreen();
  setActivePanel(revealPanel);
  window.scrollTo(0, 0);

  if (isMultiMode() && mpState.isHost && window.GPRealtime) {
    window.GPRealtime.send('impostor', {
      type: 'impostor',
      action: 'start',
      word: generatedWord,
      roles,
      senderId: mpState.playerId
    });
    const myRole = roles.find((entry) => entry.name === mpState.name);
    if (myRole) {
      if (myRole.role === 'impostore') {
        openSheet('IL TUO RUOLO', 'IMPOSTORE\n\nNon conosci la parola.\nCerca di non farti scoprire.', 'mp-role');
      } else {
        openSheet('IL TUO RUOLO', `CITTADINO\n\nParola Segreta:\n${generatedWord}`, 'mp-role');
      }
    }
    setActivePanel(startPanel);
  }
});

revealRoleButton.addEventListener('click', () => {
  const current = roles[currentIndex];
  if (!current) return;

  if (current.role === 'impostore') {
    openSheet('IL TUO RUOLO', 'IMPOSTORE\n\nNon conosci la parola.\nCerca di non farti scoprire.', 'role');
  } else {
    openSheet('IL TUO RUOLO', `CITTADINO\n\nParola Segreta:\n${generatedWord}`, 'role');
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
  openSheet('VERITA?', `Gli Impostori erano:\n${list}`, 'impostors');
  if (isMultiMode() && mpState.isHost && window.GPRealtime) {
    window.GPRealtime.send('impostor', {
      type: 'impostor',
      action: 'impostors',
      impostors,
      senderId: mpState.playerId
    });
  }
});

if (restartGameButton) restartGameButton.addEventListener('click', resetGame);

// MAIN NAVIGATION
if (btnEnter) {
  btnEnter.addEventListener('click', () => {
    resetGame();
    if (landing) {
      landing.classList.remove('is-active');
      landing.style.display = 'none';
    }
    if (gameFlow) {
      gameFlow.style.display = 'flex';
      setTimeout(() => gameFlow.classList.add('is-active'), 10);
    }
  });
}

if (btnBack) btnBack.addEventListener('click', () => {
  resetGame();
  if (gameFlow) {
    gameFlow.classList.remove('is-active');
    gameFlow.style.display = 'none';
  }
  if (landing) {
    landing.style.display = 'flex';
    setTimeout(() => landing.classList.add('is-active'), 10);
  }
});

sheetClose.addEventListener('click', handleSheetClose);
scrim.addEventListener('click', () => {
  if (sheetContext) handleSheetClose();
});

// Init
renderPlayerInputs(parseInt(playerCountInput.value, 10));
syncImpostorMax(parseInt(playerCountInput.value, 10));
updateModeFields();
updateModeUI();
