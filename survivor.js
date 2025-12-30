// survivor.js - Client side logic for Survivor Game

document.addEventListener('DOMContentLoaded', () => {
    const START_LIVES = 4;
    const MAX_LIVES_LIMIT = 9;
    const MAX_LUCK = 5;
    const RARITY_LEVELS = ['comune', 'raro', 'epico', 'leggendario', 'supremo'];

    function makeItem(name, rarity, actions, effectText) {
        const id = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        return { id, name, rarity, actions, effectText };
    }

    const COMMON_LIFE_NAMES = [
        'Bende sterili',
        'Filtro acqua tascabile',
        'Razione secca',
        'Pastiglie iodio',
        'Borraccia ammaccata',
        'Kit cucito',
        'Barretta proteica',
        'Sacchetto medicinali',
        'Piastra emostatica',
        'Borsa termica'
    ];

    const COMMON_SHIELD_NAMES = [
        'Nastro isolante',
        'Guanti isolati',
        'Maschera antipolvere',
        'Telo termico',
        'Spray antifiamma',
        'Occhiali balistici',
        'Coperchio metallico',
        'Sacco di sabbia',
        'Tappo antiradiazioni',
        'Clip di sicurezza'
    ];

    const COMMON_PEEK_NAMES = [
        'Torcia pieghevole',
        'Cartina bruciata',
        'Rilevatore radiazioni',
        'Bussola arrugginita',
        'Guida di sopravvivenza',
        'Radio portatile',
        'Specchio tascabile',
        'Sonda termica',
        'Fischietto di segnalazione',
        'Stetoscopio tascabile'
    ];

    const COMMON_TURN_NAMES = [
        'Fune corta',
        'Cordino nylon',
        'Gancio pieghevole',
        'Mappa di fuga',
        'Ponticello rapido',
        'Tenda compatta',
        'Cassetta attrezzi leggera',
        'Corda d\'acciaio',
        'Kit bivacco',
        'Bussola di riserva'
    ];

    const COMMON_LUCK_NAMES = [
        'Magnete industriale',
        'Scatola fiammiferi',
        'Accendino',
        'Microforno',
        'Pietra focaia',
        'Spray lubrificante',
        'Cavo ramato',
        'Chiave inglese',
        'Serramanico',
        'Lama di ricambio'
    ];

    const COMMON_DRAW_NAMES = [
        'Graffette metalliche',
        'Tessera di accesso',
        'Pezza magnetica',
        'Batteria solare',
        'Batteria a bottone',
        'Panno filtrante',
        'Borraccia filtrante',
        'Kit riparazioni',
        'Cintura multiuso',
        'Capsule caffeina'
    ];

    const RARE_LIFE_NAMES = [
        'Medikit avanzato',
        'Siero coagulante',
        'Kit chirurgico',
        'Pacco razioni militari',
        'Borsa ematica',
        'Siero rigenerante',
        'Dose di ricarica',
        'Camera sterile'
    ];

    const RARE_SHIELD_NAMES = [
        'Tuta isolante',
        'Valvola di emergenza',
        'Tessuto antiurto',
        'Gas filtrante',
        'Scudo pieghevole',
        'Paratia mobile',
        'Guscio ceramico'
    ];

    const RARE_PEEK_NAMES = [
        'Radar portatile',
        'Visore notturno',
        'Trasmettitore cifrato',
        'Scanner biometrico',
        'Scheda diagnostica'
    ];

    const RARE_TURN_NAMES = [
        'Batteria a lunga durata',
        'Piano di evacuazione',
        'Moduli di riposo'
    ];

    const ITEM_LIBRARY = [
        ...COMMON_LIFE_NAMES.map((name, index) =>
            makeItem(
                name,
                'comune',
                [{ type: 'life', delta: 1 }, { type: 'score', delta: 2 + index }],
                `Recupera 1 vita e aggiunge ${2 + index} punti.`
            )
        ),
        ...COMMON_SHIELD_NAMES.map((name, index) =>
            makeItem(
                name,
                'comune',
                [{ type: 'score', delta: 12 + index }, { type: 'shield', points: 1 }],
                `Aggiunge ${12 + index} punti e assorbe 1 perdita di vita.`
            )
        ),
        ...COMMON_PEEK_NAMES.map((name, index) =>
            makeItem(
                name,
                'comune',
                [{ type: 'score', delta: 22 + index }, { type: 'peek', count: 1 }],
                `Aggiunge ${22 + index} punti e mostra l'opzione migliore nel prossimo turno.`
            )
        ),
        ...COMMON_TURN_NAMES.map((name, index) =>
            makeItem(
                name,
                'comune',
                [{ type: 'score', delta: 32 + index }, { type: 'turns', delta: 1 }],
                `Aggiunge ${32 + index} punti e allunga la missione di 1 turno.`
            )
        ),
        ...COMMON_LUCK_NAMES.map((name, index) =>
            makeItem(
                name,
                'comune',
                [{ type: 'score', delta: 42 + index }, { type: 'luck', charges: 1 }],
                `Aggiunge ${42 + index} punti e aumenta la fortuna oggetti di 1.`
            )
        ),
        ...COMMON_DRAW_NAMES.map((name, index) =>
            makeItem(
                name,
                'comune',
                [{ type: 'score', delta: 52 + index }, { type: 'draw', count: 1, rarity: 'comune', target: 'owner' }],
                `Aggiunge ${52 + index} punti e trova 1 oggetto comune.`
            )
        ),
        ...RARE_LIFE_NAMES.map((name, index) =>
            makeItem(
                name,
                'raro',
                [{ type: 'life', delta: 2 }, { type: 'score', delta: 62 + index }],
                `Recupera 2 vite e aggiunge ${62 + index} punti.`
            )
        ),
        ...RARE_SHIELD_NAMES.map((name, index) =>
            makeItem(
                name,
                'raro',
                [{ type: 'score', delta: 70 + index }, { type: 'shield', points: 2 }],
                `Aggiunge ${70 + index} punti e assorbe 2 perdite di vita.`
            )
        ),
        ...RARE_PEEK_NAMES.map((name, index) =>
            makeItem(
                name,
                'raro',
                [{ type: 'score', delta: 77 + index }, { type: 'peek', count: 2 }],
                `Aggiunge ${77 + index} punti e mostra l'opzione migliore per 2 turni.`
            )
        ),
        ...RARE_TURN_NAMES.map((name, index) =>
            makeItem(
                name,
                'raro',
                [{ type: 'score', delta: 82 + index }, { type: 'turns', delta: 2 }],
                `Aggiunge ${82 + index} punti e allunga la missione di 2 turni.`
            )
        ),
        makeItem(
            'Pistola flare',
            'raro',
            [{ type: 'score', delta: 85 }, { type: 'draw', count: 1, rarity: 'raro', target: 'owner' }],
            'Aggiunge 85 punti e trova 1 oggetto raro.'
        ),
        makeItem(
            'Modulo di calma',
            'raro',
            [{ type: 'score', delta: 86 }, { type: 'boost', multiplier: 1.5, turns: 1 }],
            'Aggiunge 86 punti e moltiplica i punti del prossimo turno x1.5.'
        ),
        // epici
        makeItem(
            'Modulo rigenerativo',
            'epico',
            [{ type: 'life', delta: 3 }, { type: 'shield', points: 1 }],
            'Recupera 3 vite e aggiunge 1 scudo.'
        ),
        makeItem(
            'Iniettore nanobot',
            'epico',
            [{ type: 'maxLife', delta: 1 }, { type: 'life', delta: 1 }],
            'Aumenta il massimo vite di 1 e recupera 1 vita.'
        ),
        makeItem(
            'Algoritmo predittivo',
            'epico',
            [{ type: 'peek', count: 3 }],
            'Mostra l\'opzione migliore per 3 turni.'
        ),
        makeItem(
            'Scudo reattivo',
            'epico',
            [{ type: 'shield', points: 3 }],
            'Assorbe 3 perdite di vita.'
        ),
        makeItem(
            'Drone di recupero',
            'epico',
            [{ type: 'score', delta: 18 }, { type: 'draw', count: 1, rarity: 'epico', target: 'owner' }],
            'Aggiunge 18 punti e trova 1 oggetto epico.'
        ),
        makeItem(
            'Piano tattico',
            'epico',
            [{ type: 'score', delta: 19 }, { type: 'boost', multiplier: 2, turns: 1 }],
            'Aggiunge 19 punti e moltiplica i punti del prossimo turno x2.'
        ),
        makeItem(
            'Siringa d\'adrenalina',
            'epico',
            [{ type: 'life', delta: 2 }, { type: 'boost', multiplier: 1.5, turns: 1 }],
            'Recupera 2 vite e moltiplica i punti del prossimo turno x1.5.'
        ),
        makeItem(
            'Modulo di geolocalizzazione',
            'epico',
            [{ type: 'turns', delta: 2 }, { type: 'peek', count: 1 }],
            'Aggiunge 2 turni e mostra l\'opzione migliore nel prossimo turno.'
        ),
        makeItem(
            'Spazio di stoccaggio',
            'epico',
            [{ type: 'score', delta: 20 }, { type: 'draw', count: 2, rarity: 'raro', target: 'owner' }],
            'Aggiunge 20 punti e trova 2 oggetti rari.'
        ),
        makeItem(
            'Nucleo di energia',
            'epico',
            [{ type: 'score', delta: 25 }, { type: 'shield', points: 1 }],
            'Aggiunge 25 punti e assorbe 1 perdita di vita.'
        ),
        makeItem(
            'Camera iperbarica',
            'epico',
            [{ type: 'maxLife', delta: 1 }, { type: 'life', delta: 2 }],
            'Aumenta il massimo vite di 1 e recupera 2 vite.'
        ),
        makeItem(
            'Protocollo di calma',
            'epico',
            [{ type: 'boost', multiplier: 2, turns: 2 }],
            'Moltiplica i punti dei prossimi 2 turni x2.'
        ),
        makeItem(
            'Bunker portatile',
            'epico',
            [{ type: 'shield', points: 2 }, { type: 'peek', count: 2 }],
            'Assorbe 2 perdite e mostra l\'opzione migliore per 2 turni.'
        ),
        makeItem(
            'Reattore di supporto',
            'epico',
            [{ type: 'score', delta: 21 }, { type: 'luck', charges: 3 }],
            'Aggiunge 21 punti e aumenta la fortuna oggetti di 3.'
        ),
        makeItem(
            'Cassa di riserva',
            'epico',
            [
                { type: 'score', delta: 22 },
                { type: 'draw', count: 1, rarity: 'raro', target: 'owner' },
                { type: 'draw', count: 1, rarity: 'comune', target: 'owner' }
            ],
            'Aggiunge 22 punti e trova 1 raro e 1 comune.'
        ),
        // leggendari
        makeItem(
            'Arca di salvataggio',
            'leggendario',
            [{ type: 'maxLife', delta: 2 }, { type: 'life', delta: 2 }, { type: 'shield', points: 1 }],
            'Aumenta il massimo vite di 2, recupera 2 vite e aggiunge 1 scudo.'
        ),
        makeItem(
            'Matrice di previsione',
            'leggendario',
            [{ type: 'peek', count: 3 }, { type: 'boost', multiplier: 1.5, turns: 2 }],
            'Mostra l\'opzione migliore per 3 turni e moltiplica i punti per 2 turni x1.5.'
        ),
        makeItem(
            'Generatore di scudi',
            'leggendario',
            [{ type: 'shield', points: 4 }],
            'Assorbe 4 perdite di vita.'
        ),
        makeItem(
            'Rifornimento orbitale',
            'leggendario',
            [
                { type: 'score', delta: 26 },
                { type: 'draw', count: 1, rarity: 'leggendario', target: 'owner' },
                { type: 'draw', count: 1, rarity: 'raro', target: 'owner' }
            ],
            'Aggiunge 26 punti e trova 1 leggendario e 1 raro.'
        ),
        makeItem(
            'Archivio perduto',
            'leggendario',
            [{ type: 'score', delta: 35 }, { type: 'peek', count: 1 }],
            'Aggiunge 35 punti e mostra l\'opzione migliore nel prossimo turno.'
        ),
        makeItem(
            'Catalizzatore vitale',
            'leggendario',
            [{ type: 'life', delta: 3 }, { type: 'shield', points: 2 }, { type: 'score', delta: 27 }],
            'Recupera 3 vite, assorbe 2 perdite e aggiunge 27 punti.'
        ),
        // supremi
        makeItem(
            'Protocollo Fenice',
            'supremo',
            [{ type: 'maxLife', delta: 2 }, { type: 'life', delta: 3 }, { type: 'shield', points: 2 }],
            'Aumenta il massimo vite di 2, recupera 3 vite e aggiunge 2 scudi.'
        ),
        makeItem(
            'Crisalide quantica',
            'supremo',
            [{ type: 'boost', multiplier: 3, turns: 1 }, { type: 'peek', count: 3 }],
            'Moltiplica i punti del prossimo turno x3 e mostra l\'opzione migliore per 3 turni.'
        ),
        makeItem(
            'Armeria totale',
            'supremo',
            [
                { type: 'draw', count: 1, rarity: 'supremo', target: 'owner' },
                { type: 'draw', count: 1, rarity: 'epico', target: 'owner' },
                { type: 'shield', points: 2 }
            ],
            'Trova 1 supremo e 1 epico e aggiunge 2 scudi.'
        ),
        makeItem(
            'Cuore di Eden',
            'supremo',
            [{ type: 'maxLife', delta: 3 }, { type: 'life', delta: 3 }, { type: 'score', delta: 40 }],
            'Aumenta il massimo vite di 3, recupera 3 vite e aggiunge 40 punti.'
        )
    ];

    function toNumber(value, fallback = 0) {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }

    function clampNumber(value, min, max) {
        if (Number.isNaN(value)) return min;
        return Math.min(Math.max(value, min), max);
    }

    function shuffle(array) {
        const copy = [...array];
        for (let index = copy.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
        }
        return copy;
    }

    function pickRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function normalizeRarity(value) {
        return RARITY_LEVELS.includes(value) ? value : null;
    }

    function upgradeRarity(rarity, steps = 1) {
        const currentIndex = RARITY_LEVELS.indexOf(rarity);
        if (currentIndex === -1) return rarity;
        const nextIndex = Math.min(currentIndex + steps, RARITY_LEVELS.length - 1);
        return RARITY_LEVELS[nextIndex];
    }

    function rollRarity() {
        const roll = Math.random() * 100;
        if (roll < 55) return 'comune';
        if (roll < 80) return 'raro';
        if (roll < 92) return 'epico';
        if (roll < 98) return 'leggendario';
        return 'supremo';
    }

    function initItemPools() {
        const pools = { comune: [], raro: [], epico: [], leggendario: [], supremo: [] };
        ITEM_LIBRARY.forEach((item) => {
            if (pools[item.rarity]) pools[item.rarity].push(item);
        });
        Object.keys(pools).forEach((rarity) => {
            pools[rarity] = shuffle(pools[rarity]);
        });
        return pools;
    }

    function cloneItem(item) {
        return {
            ...item,
            actions: item.actions ? item.actions.map((action) => ({ ...action })) : []
        };
    }

    function createGameState() {
        return {
            turn: 1,
            maxTurns: 5,
            players: [],
            history: '',
            score: 0,
            lives: START_LIVES,
            maxLives: START_LIVES,
            damageShield: 0,
            scoreMultiplier: 1,
            scoreBoostTurns: 0,
            peekTokens: 0,
            itemLuck: 0,
            itemPools: initItemPools(),
            isGameOver: false
        };
    }

    function formatSigned(value) {
        if (!value) return '0';
        return value > 0 ? `+${value}` : `${value}`;
    }

    // ELEMENTS
    const landing = document.getElementById('landing');
    const gameFlow = document.getElementById('game-flow'); // Impostor flow
    const survivorFlow = document.getElementById('survivor-flow');

    const btnSurvivor = document.getElementById('btn-survivor');
    const btnBackSurv = document.getElementById('btn-back-home-surv');

    const sectionConfig = document.getElementById('surv-config');
    const sectionGame = document.getElementById('surv-game');
    const sectionResult = document.getElementById('surv-result');

    const inpSurvCount = document.getElementById('surv-count');
    const inpSurvTurns = document.getElementById('surv-turns');
    const listSurvPlayers = document.getElementById('surv-players-list');
    const btnStartSurv = document.getElementById('surv-start-btn');

    const narrativeText = document.getElementById('surv-narrative-text');
    const questionText = document.getElementById('surv-question-text');
    const optionsGrid = document.getElementById('surv-options-grid');
    const inventoryContainer = document.getElementById('surv-inventories');
    const scoreDisplay = document.getElementById('surv-score');
    const turnDisplay = document.getElementById('surv-turn-indicator');
    const livesDisplay = document.getElementById('surv-lives');

    const itemPanel = document.getElementById('surv-item-panel');
    const itemPanelTitle = document.getElementById('surv-item-panel-title');
    const itemUseBtn = document.getElementById('surv-item-use');
    const itemShareBtn = document.getElementById('surv-item-share');
    const itemCancelBtn = document.getElementById('surv-item-cancel');
    const shareTargets = document.getElementById('surv-share-targets');

    const btnRestartSurv = document.getElementById('surv-restart');

    // STATE
    let selectedItem = null;
    let gameState = createGameState();

    // --- NAVIGATION ---

    if (btnSurvivor) {
        btnSurvivor.addEventListener('click', () => {
            landing.classList.remove('is-active');
            landing.style.display = 'none';
            if (gameFlow) gameFlow.style.display = 'none';

            survivorFlow.style.display = 'flex';
            setTimeout(() => survivorFlow.classList.add('is-active'), 10);

            initSetup();
        });
    }

    if (btnBackSurv) {
        btnBackSurv.addEventListener('click', () => {
            survivorFlow.classList.remove('is-active');
            survivorFlow.style.display = 'none';
            landing.style.display = 'flex';
            setTimeout(() => landing.classList.add('is-active'), 10);
            stopAudio();
        });
    }

    if (itemUseBtn) itemUseBtn.addEventListener('click', useSelectedItem);
    if (itemShareBtn) itemShareBtn.addEventListener('click', showShareTargets);
    if (itemCancelBtn) itemCancelBtn.addEventListener('click', closeItemPanel);

    // --- SETUP LOGIC ---

    function initSetup() {
        renderPlayerInputs();
        showPanel(sectionConfig);
        gameState = createGameState();
        updateHUD();
        closeItemPanel();
    }

    inpSurvCount.addEventListener('input', renderPlayerInputs);

    function renderPlayerInputs() {
        const count = clampNumber(parseInt(inpSurvCount.value, 10) || 1, 1, 8);
        listSurvPlayers.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'field';
            const input = document.createElement('input');
            input.placeholder = `Sopravvissuto ${i + 1}`;
            input.id = `surv-p-${i}`;
            div.appendChild(input);
            listSurvPlayers.appendChild(div);
        }
    }

    btnStartSurv.addEventListener('click', async () => {
        const pCount = clampNumber(parseInt(inpSurvCount.value, 10) || 1, 1, 8);
        gameState = createGameState();
        gameState.players = [];
        for (let i = 0; i < pCount; i++) {
            const name = document.getElementById(`surv-p-${i}`).value.trim() || `Sopravvissuto ${i + 1}`;
            gameState.players.push({ name, inventory: [] });
        }
        gameState.maxTurns = parseInt(inpSurvTurns.value, 10) || 5;
        gameState.turn = 1;
        gameState.score = 0;
        gameState.history = 'Inizio della simulazione.';

        updateHUD();
        showPanel(sectionGame);
        await gameTurn(null);
    });

    btnRestartSurv.addEventListener('click', initSetup);

    // --- GAMEPLAY ---

    function showPanel(panel) {
        [sectionConfig, sectionGame, sectionResult].forEach((p) => p.classList.remove('is-visible'));
        panel.classList.add('is-visible');
    }

    function updateHUD() {
        closeItemPanel();
        turnDisplay.textContent = `TURNO ${gameState.turn} / ${gameState.maxTurns}`;
        scoreDisplay.textContent = `PUNTI: ${gameState.score}`;
        if (livesDisplay) {
            livesDisplay.textContent = `VITE: ${gameState.lives} / ${gameState.maxLives}`;
        }
        renderInventories();
    }

    function renderInventories() {
        inventoryContainer.innerHTML = '';
        gameState.players.forEach((p, pIndex) => {
            const pDiv = document.createElement('div');
            pDiv.className = 'surv-player-inv';

            const nameTitle = document.createElement('div');
            nameTitle.className = 'surv-p-name';
            nameTitle.textContent = p.name;

            const itemsDiv = document.createElement('div');
            itemsDiv.className = 'surv-items-row';

            if (p.inventory.length === 0) {
                itemsDiv.innerHTML = '<span class="empty-inv">Zaino vuoto</span>';
            } else {
                p.inventory.forEach((item, itemIndex) => {
                    const iButton = document.createElement('button');
                    iButton.type = 'button';
                    iButton.className = `surv-item item-${item.rarity || 'comune'}`;
                    iButton.title = item.effectText || item.rarity || '';
                    iButton.textContent = item.name;
                    iButton.addEventListener('click', () => openItemPanel(pIndex, itemIndex));
                    itemsDiv.appendChild(iButton);
                });
            }

            pDiv.appendChild(nameTitle);
            pDiv.appendChild(itemsDiv);
            inventoryContainer.appendChild(pDiv);
        });
    }

    async function gameTurn(lastChoiceData) {
        optionsGrid.innerHTML = '<div class="surv-spinner">CONNETTENDO ASSET NEURALI...</div>';
        questionText.textContent = 'Analisi in corso...';

        try {
            const response = await fetch('/api/survivor-gm', {
                method: 'POST',
                body: JSON.stringify({
                    players: gameState.players,
                    turn: gameState.turn,
                    maxTurns: gameState.maxTurns,
                    lives: gameState.lives,
                    maxLives: gameState.maxLives,
                    lastChoice: lastChoiceData,
                    history: gameState.history
                })
            });

            if (!response.ok) throw new Error('Errore comunicazione AI');
            const data = await response.json();

            narrativeText.textContent = data.narrative || 'Sistema operativo attivo.';
            speak(data.narrative);

            gameState.history += `\nTURNO ${gameState.turn}: ${data.narrative}`;

            if (data.isGameOver || gameState.turn > gameState.maxTurns) {
                endGame(data);
                return;
            }

            questionText.textContent = data.question || 'Decisione richiesta.';
            renderOptions(Array.isArray(data.options) ? data.options : []);
        } catch (e) {
            console.error(e);
            questionText.textContent = 'ERRORE CRITICO DI SISTEMA.';
            narrativeText.textContent = 'Connessione persa. Riprovare.';
            optionsGrid.innerHTML = '<button class="btn-surv-opt" onclick="location.reload()">RIAVVIA SISTEMA</button>';
        }
    }

    function renderOptions(options) {
        optionsGrid.innerHTML = '';
        options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-surv-opt';
            btn.innerHTML = `<span class="opt-id">${String.fromCharCode(65 + idx)}</span> <span class="opt-text">${opt.text}</span>`;

            btn.addEventListener('click', () => handleOptionClick(opt));
            optionsGrid.appendChild(btn);
        });

        if (gameState.peekTokens > 0 && options.length > 0) {
            let bestIndex = 0;
            let bestScore = toNumber(options[0].score, 0);
            options.forEach((opt, idx) => {
                const score = toNumber(opt.score, 0);
                if (score > bestScore) {
                    bestScore = score;
                    bestIndex = idx;
                }
            });
            const buttons = optionsGrid.querySelectorAll('.btn-surv-opt');
            if (buttons[bestIndex]) buttons[bestIndex].classList.add('opt-hint');
            gameState.peekTokens -= 1;
        }
    }

    function handleOptionClick(option) {
        const scoreDelta = toNumber(option.score, 0);
        const lifeDelta = toNumber(option.lifeDelta, 0);

        const appliedScore = applyScoreDelta(scoreDelta, true);
        const appliedLife = applyLifeDelta(lifeDelta);
        const itemGranted = maybeGrantItemFromOption(option);

        const outcomeBits = [];
        if (appliedScore !== 0) outcomeBits.push(`Punti ${formatSigned(appliedScore)}`);
        if (appliedLife !== 0) outcomeBits.push(`Vite ${formatSigned(appliedLife)}`);
        if (itemGranted) outcomeBits.push(`Oggetto ${itemGranted.name}`);

        const consequence = option.consequence || 'Azione eseguita...';
        const extra = outcomeBits.length ? `\n${outcomeBits.join(' | ')}` : '';

        gameState.history += `\nSCELTA: ${option.text}. ESITO: ${consequence}${outcomeBits.length ? ' | ' + outcomeBits.join(', ') : ''}`;

        narrativeText.textContent = `${consequence}${extra}`;
        speak(consequence);

        const btns = document.querySelectorAll('.btn-surv-opt');
        btns.forEach((b) => {
            b.disabled = true;
        });

        if (gameState.lives <= 0) {
            endGame({ narrative: 'Vite esaurite. Fine missione.' });
            return;
        }

        gameState.turn++;
        updateHUD();

        setTimeout(() => {
            if (gameState.turn > gameState.maxTurns) {
                endGame({ narrative: 'Sopravvivenza completata. Recupero in corso...' });
            } else {
                gameTurn(option.text);
            }
        }, 4000);
    }

    function endGame(data) {
        showPanel(sectionResult);
        const livesLine = `Vite residue: ${gameState.lives} / ${gameState.maxLives}`;
        document.getElementById('surv-end-msg').textContent = `Punteggio Finale: ${gameState.score}\n${livesLine}\n\n${data.narrative || ''}`;
        speak(`Gioco terminato. ${data.narrative || ''}`);
    }

    // --- ITEM HANDLING ---

    function openItemPanel(ownerIndex, itemIndex) {
        if (!itemPanel || !itemPanelTitle) return;
        const owner = gameState.players[ownerIndex];
        const item = owner && owner.inventory[itemIndex];
        if (!item) return;

        selectedItem = { ownerIndex, itemIndex };
        itemPanelTitle.textContent = `${item.name} - ${item.effectText}`;
        itemPanel.classList.remove('is-hidden');
        if (shareTargets) {
            shareTargets.classList.add('is-hidden');
            shareTargets.innerHTML = '';
        }
    }

    function closeItemPanel() {
        selectedItem = null;
        if (itemPanel) itemPanel.classList.add('is-hidden');
        if (shareTargets) {
            shareTargets.classList.add('is-hidden');
            shareTargets.innerHTML = '';
        }
    }

    function showShareTargets() {
        if (!selectedItem || !shareTargets) return;
        const { ownerIndex } = selectedItem;
        shareTargets.innerHTML = '';

        const candidates = gameState.players.filter((_, idx) => idx !== ownerIndex);
        if (candidates.length === 0) {
            const info = document.createElement('div');
            info.className = 'surv-share-empty';
            info.textContent = 'Nessun compagno disponibile.';
            shareTargets.appendChild(info);
            shareTargets.classList.remove('is-hidden');
            return;
        }

        gameState.players.forEach((player, idx) => {
            if (idx === ownerIndex) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = player.name;
            btn.addEventListener('click', () => transferSelectedItem(idx));
            shareTargets.appendChild(btn);
        });
        shareTargets.classList.remove('is-hidden');
    }

    function transferSelectedItem(targetIndex) {
        if (!selectedItem) return;
        const { ownerIndex, itemIndex } = selectedItem;
        const owner = gameState.players[ownerIndex];
        if (!owner || !owner.inventory[itemIndex]) {
            closeItemPanel();
            return;
        }

        const item = owner.inventory.splice(itemIndex, 1)[0];
        gameState.players[targetIndex].inventory.push(item);
        showItemNotification(`Oggetto condiviso: ${item.name} -> ${gameState.players[targetIndex].name}`);
        updateHUD();
        closeItemPanel();
    }

    function useSelectedItem() {
        if (!selectedItem) return;
        const { ownerIndex, itemIndex } = selectedItem;
        const owner = gameState.players[ownerIndex];
        if (!owner || !owner.inventory[itemIndex]) {
            closeItemPanel();
            return;
        }

        const item = owner.inventory.splice(itemIndex, 1)[0];
        applyActions(item.actions, ownerIndex);
        showItemNotification(`Usato: ${item.name}. ${item.effectText}`);
        updateHUD();
        closeItemPanel();
    }

    function applyLifeDelta(delta) {
        const change = toNumber(delta, 0);
        if (!change) return 0;
        let adjusted = change;

        if (adjusted < 0 && gameState.damageShield > 0) {
            const absorb = Math.min(gameState.damageShield, Math.abs(adjusted));
            gameState.damageShield -= absorb;
            adjusted += absorb;
        }

        gameState.lives = clampNumber(gameState.lives + adjusted, 0, gameState.maxLives);
        return adjusted;
    }

    function applyScoreDelta(delta, useMultiplier = false) {
        let applied = toNumber(delta, 0);
        if (applied > 0 && useMultiplier && gameState.scoreMultiplier > 1) {
            applied = Math.round(applied * gameState.scoreMultiplier);
            gameState.scoreBoostTurns -= 1;
            if (gameState.scoreBoostTurns <= 0) {
                gameState.scoreMultiplier = 1;
                gameState.scoreBoostTurns = 0;
            }
        }
        gameState.score += applied;
        return applied;
    }

    function adjustMaxLives(delta) {
        const change = toNumber(delta, 0);
        if (!change) return 0;
        const previous = gameState.maxLives;
        gameState.maxLives = clampNumber(previous + change, START_LIVES, MAX_LIVES_LIMIT);
        const gained = gameState.maxLives - previous;
        if (gained > 0) {
            gameState.lives = clampNumber(gameState.lives + gained, 0, gameState.maxLives);
        }
        return gained;
    }

    function adjustTurns(delta) {
        const change = toNumber(delta, 0);
        if (!change) return;
        gameState.maxTurns = Math.max(gameState.turn, gameState.maxTurns + change);
    }

    function setScoreBoost(multiplier, turns) {
        const multi = Math.max(1, toNumber(multiplier, 1));
        const duration = Math.max(1, toNumber(turns, 1));
        if (multi > gameState.scoreMultiplier) {
            gameState.scoreMultiplier = multi;
            gameState.scoreBoostTurns = duration;
        } else if (multi === gameState.scoreMultiplier) {
            gameState.scoreBoostTurns = Math.max(gameState.scoreBoostTurns, duration);
        }
    }

    function grantDraw(action, ownerIndex) {
        const count = Math.max(1, toNumber(action.count, 1));
        const rarity = normalizeRarity(action.rarity) || rollRarity();
        const targetMode = action.target || 'owner';
        for (let i = 0; i < count; i++) {
            let targetIndex = ownerIndex;
            if (targetMode === 'random') {
                targetIndex = Math.floor(Math.random() * gameState.players.length);
            }
            grantItemToPlayer(targetIndex, rarity);
        }
    }

    function applyAction(action, ownerIndex) {
        if (!action || !action.type) return;
        switch (action.type) {
            case 'life':
                applyLifeDelta(action.delta);
                break;
            case 'maxLife':
                adjustMaxLives(action.delta);
                break;
            case 'score':
                applyScoreDelta(action.delta);
                break;
            case 'shield':
                gameState.damageShield += toNumber(action.points, 0);
                break;
            case 'boost':
                setScoreBoost(action.multiplier, action.turns);
                break;
            case 'peek':
                gameState.peekTokens += toNumber(action.count, 0);
                break;
            case 'turns':
                adjustTurns(action.delta);
                break;
            case 'luck':
                gameState.itemLuck = Math.min(MAX_LUCK, gameState.itemLuck + toNumber(action.charges, 0));
                break;
            case 'draw':
                grantDraw(action, ownerIndex);
                break;
            default:
                break;
        }
    }

    function applyActions(actions, ownerIndex) {
        if (!actions) return;
        actions.forEach((action) => applyAction(action, ownerIndex));
    }

    function drawItemFromPool(rarity) {
        const safeRarity = normalizeRarity(rarity) || 'comune';
        if (!gameState.itemPools[safeRarity] || gameState.itemPools[safeRarity].length === 0) {
            gameState.itemPools[safeRarity] = shuffle(ITEM_LIBRARY.filter((item) => item.rarity === safeRarity));
        }
        const item = gameState.itemPools[safeRarity].pop();
        return item ? cloneItem(item) : null;
    }

    function grantItemToPlayer(index, rarity) {
        const item = drawItemFromPool(rarity);
        if (!item) return null;
        gameState.players[index].inventory.push(item);
        showItemNotification(`Oggetto trovato: ${item.name} (${gameState.players[index].name})`);
        return item;
    }

    function maybeGrantItemFromOption(option) {
        if (!option) return null;
        const hasReward = Boolean(option.itemReward || option.item);
        if (!hasReward) return null;

        let rarity = normalizeRarity(option.itemRarity || (option.item && option.item.rarity)) || rollRarity();
        if (gameState.itemLuck > 0) {
            rarity = upgradeRarity(rarity, 1);
            gameState.itemLuck -= 1;
        }

        const targetIndex = Math.floor(Math.random() * gameState.players.length);
        return grantItemToPlayer(targetIndex, rarity);
    }

    function showItemNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'item-notif';
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2800);
    }

    // --- TTS HELPER ---

    function stopAudio() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }

    function speak(text) {
        if (!text) return;
        if ('speechSynthesis' in window) {
            stopAudio();
            const msg = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();

            let voice = voices.find((v) => v.name.includes('Elsa') && v.name.includes('Neural') && v.lang.includes('it'));
            if (!voice) voice = voices.find((v) => v.name.includes('Elsa') && v.lang.includes('it'));
            if (!voice) voice = voices.find((v) => v.lang === 'it-IT');

            if (voice) msg.voice = voice;
            msg.rate = 1.0;
            msg.pitch = 0.9;

            window.speechSynthesis.speak(msg);
        }
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
    }
});
