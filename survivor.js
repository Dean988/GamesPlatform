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

    function rollD20() {
        return Math.floor(Math.random() * 20) + 1;
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

    function createInstanceId() {
        if (window.crypto && window.crypto.randomUUID) {
            return window.crypto.randomUUID();
        }
        return Math.random().toString(36).slice(2);
    }

    function cloneItem(item) {
        return {
            ...item,
            instanceId: createInstanceId(),
            actions: item.actions ? item.actions.map((action) => ({ ...action })) : []
        };
    }

    function ensureItemInstanceIds() {
        if (!Array.isArray(gameState.players)) return;
        gameState.players.forEach((player) => {
            if (!Array.isArray(player?.inventory)) return;
            player.inventory.forEach((item) => {
                if (!item.instanceId) {
                    item.instanceId = createInstanceId();
                }
            });
        });
    }

    function createGameState() {
        return {
            turn: 1,
            maxTurns: 5,
            players: [],
            history: '',
            scenarioPrompt: '',
            score: 0,
            scoreMultiplier: 1,
            scoreBoostTurns: 0,
            peekTokens: 0,
            itemLuck: 0,
            itemPools: initItemPools(),
            currentOptions: [],
            currentQuestion: '',
            pendingChoices: [],
            choiceOrder: [],
            activeChoiceIndex: 0,
            waitingForResolution: false,
            isRolling: false,
            isGameOver: false
        };
    }

    function formatSigned(value) {
        if (!value) return '0';
        return value > 0 ? `+${value}` : `${value}`;
    }

    function isMultiMode() {
        return window.GP_MODE === 'multi';
    }

    function createPlayerId() {
        if (window.crypto && window.crypto.randomUUID) {
            return window.crypto.randomUUID();
        }
        return Math.random().toString(36).slice(2);
    }

    function findPlayerIndexById(playerId) {
        return gameState.players.findIndex((player) => player.id === playerId);
    }

    function getLifeTotals() {
        const totals = gameState.players.reduce(
            (acc, player) => {
                acc.current += toNumber(player.life, 0);
                acc.max += toNumber(player.maxLife, 0);
                if (toNumber(player.life, 0) > 0) acc.alive += 1;
                return acc;
            },
            { current: 0, max: 0, alive: 0 }
        );
        totals.total = gameState.players.length;
        return totals;
    }

    function getAlivePlayerIndices() {
        const indices = [];
        gameState.players.forEach((player, index) => {
            if (toNumber(player.life, 0) > 0) indices.push(index);
        });
        return indices;
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
    const inpSurvScenario = document.getElementById('surv-scenario');
    const btnStartSurv = document.getElementById('surv-start-btn');
    const survMpPanel = document.getElementById('surv-mp');
    const survMpName = document.getElementById('surv-mp-name');
    const survMpHost = document.getElementById('surv-host-btn');
    const survMpJoinCode = document.getElementById('surv-join-code');
    const survMpJoin = document.getElementById('surv-join-btn');
    const survMpRoom = document.getElementById('surv-room-code');
    const survMpCopy = document.getElementById('surv-copy-code');
    const survMpRoster = document.getElementById('surv-roster');
    const survMpError = document.getElementById('surv-mp-error');

    const narrativeText = document.getElementById('surv-narrative-text');
    const ttsReplayBtn = document.getElementById('surv-tts-btn');
    const questionText = document.getElementById('surv-question-text');
    const choicePlayerLabel = document.getElementById('surv-choice-player');
    const choiceProgressLabel = document.getElementById('surv-choice-progress');
    const choiceList = document.getElementById('surv-choice-list');
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
    const diceOverlay = document.getElementById('dice-overlay');
    const diceCube = document.getElementById('dice-cube');
    const diceValue = document.getElementById('dice-value');
    const diceContext = document.getElementById('dice-context');

    const btnRestartSurv = document.getElementById('surv-restart');
    const survTabs = Array.from(document.querySelectorAll('.surv-tab'));

    setupSurvTabs();

    // STATE
    let selectedItem = null;
    let gameState = createGameState();
    const SURV_SAVE_KEY = 'surv-save';
    let lastNarrativeText = '';
    let lastNarrativeDisplay = '';
    let lastNarrativeContext = {};
    let survMpState = {
        isHost: false,
        roomCode: '',
        name: '',
        playerId: '',
        roster: []
    };

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
            persistSurvSave();
            stopAudio();
        });
    }

    if (itemUseBtn) itemUseBtn.addEventListener('click', useSelectedItem);
    if (itemShareBtn) itemShareBtn.addEventListener('click', showShareTargets);
    if (itemCancelBtn) itemCancelBtn.addEventListener('click', closeItemPanel);
    if (ttsReplayBtn) {
        ttsReplayBtn.addEventListener('click', async () => {
            await unlockAudio();
            if (lastNarrativeText) {
                speak(lastNarrativeText, lastNarrativeContext);
            }
        });
    }
    if (survMpHost) {
        survMpHost.addEventListener('click', () => {
            if (!window.GPRealtime) return;
            const name = getRequiredSurvMpName();
            if (!name) return;
            const code = window.GPRealtime.createRoomCode();
            connectSurvivorRoom(code, name, true);
            updateSurvModeUI();
        });
    }
    if (survMpJoin) {
        survMpJoin.addEventListener('click', () => {
            if (!window.GPRealtime) return;
            const name = getRequiredSurvMpName();
            if (!name) return;
            const code = (survMpJoinCode?.value || '').trim().toUpperCase();
            if (!code) {
                showSurvMpError('Inserisci il codice stanza.');
                return;
            }
            clearSurvMpError();
            connectSurvivorRoom(code, name, false);
            updateSurvModeUI();
        });
    }
    if (survMpCopy) {
        survMpCopy.addEventListener('click', () => {
            if (!survMpRoom) return;
            const code = survMpRoom.textContent.trim();
            if (!code || code === '----') return;
            navigator.clipboard?.writeText(code);
        });
    }
    window.addEventListener('gp:modechange', (event) => {
        if (event?.detail?.mode === 'single' && window.GPRealtime) {
            window.GPRealtime.disconnect('survivor');
            survMpState = { isHost: false, roomCode: '', name: '', playerId: '', roster: [] };
            updateSurvRoster([]);
        }
        updateSurvModeUI();
        persistSurvSave();
        clearSurvMpError();
    });

    window.addEventListener('beforeunload', persistSurvSave);

    if (survMpName) {
        survMpName.addEventListener('input', clearSurvMpError);
    }

    function setupSurvTabs() {
        if (!survTabs.length) return;
        survTabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.target;
                const target = targetId ? document.getElementById(targetId) : null;
                setActiveSurvTab(tab);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    function setActiveSurvTab(activeTab) {
        survTabs.forEach((tab) => tab.classList.remove('is-active'));
        if (activeTab) activeTab.classList.add('is-active');
    }

    function updateSurvRoster(players) {
        if (!survMpRoster) return;
        survMpRoster.innerHTML = '';
        players.forEach((player) => {
            const row = document.createElement('div');
            row.className = 'mp-player';
            row.textContent = player.name || 'Giocatore';
            survMpRoster.appendChild(row);
        });
    }

    function showSurvMpError(message) {
        if (!survMpError) return;
        survMpError.textContent = message;
        survMpError.classList.remove('is-hidden');
    }

    function clearSurvMpError() {
        if (!survMpError) return;
        survMpError.textContent = '';
        survMpError.classList.add('is-hidden');
    }

    function getRequiredSurvMpName() {
        const name = (survMpName?.value || '').trim();
        if (!name) {
            showSurvMpError('Inserisci il tuo nome.');
            return null;
        }
        clearSurvMpError();
        return name;
    }

    function applySurvRoster(players) {
        const names = players.map((player) => player.name || 'Giocatore');
        if (inpSurvCount) {
            inpSurvCount.value = names.length || 1;
            inpSurvCount.disabled = true;
        }
        if (listSurvPlayers) {
            listSurvPlayers.innerHTML = '';
            names.forEach((name, index) => {
                const div = document.createElement('div');
                div.className = 'field';
                const input = document.createElement('input');
                input.placeholder = `Sopravvissuto ${index + 1}`;
                input.value = name;
                input.disabled = true;
                div.appendChild(input);
                listSurvPlayers.appendChild(div);
            });
        }
    }

    function connectSurvivorRoom(roomCode, name, isHost, playerId = '') {
        if (!window.GPRealtime) return;
        survMpState.playerId = playerId || createPlayerId();
        survMpState.name = name;
        survMpState.isHost = isHost;
        survMpState.roomCode = roomCode;
        if (survMpRoom) survMpRoom.textContent = roomCode;

        window.GPRealtime.connect('survivor', roomCode, {
            id: survMpState.playerId,
            name,
            isHost
        }, {
            onPresence: (players) => {
                survMpState.roster = players;
                updateSurvRoster(players);
                if (survMpState.isHost) {
                    applySurvRoster(players);
                    if (gameState.players.length > 0) {
                        broadcastSurvState();
                    }
                }
            },
            onMessage: (payload) => {
                if (payload?.senderId && payload.senderId === survMpState.playerId) return;
                if (!payload || payload.type !== 'survivor') return;
                if (payload.action === 'state') {
                    applyRemoteState(payload.state);
                }
                if (payload.action === 'choice' && survMpState.isHost) {
                    registerRemoteChoice(payload.choice);
                }
                if (payload.action === 'item' && survMpState.isHost) {
                    handleRemoteItemAction(payload.item);
                }
            }
        });
        persistSurvSave();
    }

    function updateSurvModeUI() {
        const isMulti = isMultiMode();
        const isHost = survMpState.isHost;
        if (!isMulti) {
            if (inpSurvCount) inpSurvCount.disabled = false;
            if (inpSurvTurns) inpSurvTurns.disabled = false;
            if (inpSurvScenario) inpSurvScenario.disabled = false;
            if (btnStartSurv) btnStartSurv.disabled = false;
            renderPlayerInputs();
            return;
        }
        if (inpSurvCount) inpSurvCount.disabled = true;
        if (inpSurvTurns) inpSurvTurns.disabled = !isHost;
        if (inpSurvScenario) inpSurvScenario.disabled = !isHost;
        if (btnStartSurv) btnStartSurv.disabled = !isHost;
    }

    function getActiveSurvPanel() {
        if (sectionGame.classList.contains('is-visible')) return 'game';
        if (sectionResult.classList.contains('is-visible')) return 'result';
        return 'config';
    }

    function persistSurvSave() {
        try {
            const payload = {
                mode: window.GP_MODE || 'single',
                panel: getActiveSurvPanel(),
                mpState: {
                    roomCode: survMpState.roomCode,
                    name: survMpState.name,
                    playerId: survMpState.playerId,
                    isHost: survMpState.isHost
                },
                gameState,
                lastNarrativeText,
                lastNarrativeDisplay,
                lastNarrativeContext,
                savedAt: Date.now()
            };
            localStorage.setItem(SURV_SAVE_KEY, JSON.stringify(payload));
        } catch (error) {
            console.error('Save failed', error);
        }
    }

    function loadSurvSave() {
        try {
            const raw = localStorage.getItem(SURV_SAVE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    }

    function clearSurvSave() {
        localStorage.removeItem(SURV_SAVE_KEY);
    }

    function applySurvSave(save) {
        if (!save?.gameState) return false;
        gameState = { ...createGameState(), ...save.gameState };
        if (!gameState.itemPools || !gameState.itemPools.comune) {
            gameState.itemPools = initItemPools();
        }
        ensureItemInstanceIds();
        lastNarrativeText = save.lastNarrativeText || '';
        lastNarrativeDisplay = save.lastNarrativeDisplay || lastNarrativeText;
        lastNarrativeContext = save.lastNarrativeContext || {};
        if (lastNarrativeDisplay) {
            narrativeText.textContent = lastNarrativeDisplay;
        }
        questionText.textContent = gameState.currentQuestion || 'Attendere...';
        renderOptions(gameState.currentOptions || []);
        updateHUD();
        renderChoiceList();
        updateChoiceStatus();
        if (save.panel === 'result') {
            showPanel(sectionResult);
        } else if (save.panel === 'game') {
            showPanel(sectionGame);
        } else {
            showPanel(sectionConfig);
        }
        return true;
    }

    function restoreSurvSession() {
        const saved = loadSurvSave();
        if (!saved) return false;
        const savedMode = saved.mode || 'single';
        if (savedMode === 'multi' && isMultiMode() && saved.mpState?.roomCode) {
            if (survMpName) survMpName.value = saved.mpState.name || '';
            if (survMpJoinCode) survMpJoinCode.value = saved.mpState.roomCode || '';
            connectSurvivorRoom(
                saved.mpState.roomCode,
                saved.mpState.name || 'Sopravvissuto',
                Boolean(saved.mpState.isHost),
                saved.mpState.playerId || ''
            );
        }
        if (saved.gameState) {
            applySurvSave(saved);
            updateSurvModeUI();
            return true;
        }
        return false;
    }

    function serializeSurvState() {
        return {
            turn: gameState.turn,
            maxTurns: gameState.maxTurns,
            score: gameState.score,
            scoreMultiplier: gameState.scoreMultiplier,
            scoreBoostTurns: gameState.scoreBoostTurns,
            peekTokens: gameState.peekTokens,
            itemLuck: gameState.itemLuck,
            history: gameState.history,
            scenarioPrompt: gameState.scenarioPrompt,
            currentQuestion: gameState.currentQuestion,
            currentOptions: gameState.currentOptions,
            pendingChoices: gameState.pendingChoices,
            choiceOrder: gameState.choiceOrder,
            activeChoiceIndex: gameState.activeChoiceIndex,
            players: gameState.players,
            waitingForResolution: gameState.waitingForResolution,
            isGameOver: gameState.isGameOver,
            lastNarrativeDisplay,
            lastNarrativeTts: lastNarrativeText
        };
    }

    function broadcastSurvState() {
        if (!isMultiMode() || !survMpState.isHost || !window.GPRealtime) return;
        window.GPRealtime.send('survivor', {
            type: 'survivor',
            action: 'state',
            state: serializeSurvState(),
            senderId: survMpState.playerId
        });
    }

    function applyRemoteState(state) {
        if (!state) return;
        gameState.turn = state.turn || 1;
        gameState.maxTurns = state.maxTurns || gameState.maxTurns;
        gameState.score = state.score || 0;
        gameState.scoreMultiplier = toNumber(state.scoreMultiplier, gameState.scoreMultiplier || 1);
        gameState.scoreBoostTurns = toNumber(state.scoreBoostTurns, gameState.scoreBoostTurns || 0);
        gameState.peekTokens = toNumber(state.peekTokens, gameState.peekTokens || 0);
        gameState.itemLuck = toNumber(state.itemLuck, gameState.itemLuck || 0);
        gameState.history = state.history || '';
        gameState.scenarioPrompt = state.scenarioPrompt || '';
        gameState.currentQuestion = state.currentQuestion || '';
        gameState.currentOptions = Array.isArray(state.currentOptions) ? state.currentOptions : [];
        gameState.pendingChoices = Array.isArray(state.pendingChoices) ? state.pendingChoices : [];
        gameState.players = Array.isArray(state.players) ? state.players : [];
        ensureItemInstanceIds();
        gameState.choiceOrder = Array.isArray(state.choiceOrder) ? state.choiceOrder : getAlivePlayerIndices();
        gameState.activeChoiceIndex = Number.isInteger(state.activeChoiceIndex)
            ? state.activeChoiceIndex
            : gameState.activeChoiceIndex;
        gameState.waitingForResolution = Boolean(state.waitingForResolution);
        gameState.isGameOver = Boolean(state.isGameOver);
        if (state.lastNarrativeDisplay || state.lastNarrativeTts || state.lastNarrative) {
            lastNarrativeDisplay = state.lastNarrativeDisplay || state.lastNarrative || '';
            lastNarrativeText = state.lastNarrativeTts || state.lastNarrativeDisplay || state.lastNarrative || '';
            if (lastNarrativeDisplay) {
                narrativeText.textContent = lastNarrativeDisplay;
            }
        }
        questionText.textContent = gameState.currentQuestion || 'Decisione richiesta.';
        renderOptions(gameState.currentOptions);
        updateHUD();
        renderChoiceList();
        updateChoiceStatus();
        if (isMultiMode() && !survMpState.isHost) {
            if (state.isGameOver) {
                showPanel(sectionResult);
            } else {
                showPanel(sectionGame);
            }
        }
        if (isMultiMode() && !survMpState.isHost) {
            const chosen = gameState.pendingChoices.some((entry) => entry.playerId === survMpState.playerId);
            setOptionsDisabled(chosen || gameState.waitingForResolution);
        }
        persistSurvSave();
    }

    function registerRemoteChoice(choice) {
        if (!choice || !survMpState.isHost) return;
        if (gameState.pendingChoices.some((entry) => entry.playerId === choice.playerId)) return;
        const playerIndex = findPlayerIndexById(choice.playerId);
        if (playerIndex < 0) return;
        gameState.pendingChoices.push({
            ...choice,
            playerIndex,
            player: gameState.players[playerIndex]?.name || choice.player
        });
        renderChoiceList();
        updateChoiceStatus();
        broadcastSurvState();
        checkMultiResolution();
    }

    function checkMultiResolution() {
        if (!isMultiMode() || !survMpState.isHost) return;
        const alive = getAlivePlayerIndices().length;
        if (alive > 0 && gameState.pendingChoices.length >= alive) {
            requestTurnOutcome(gameState.pendingChoices);
        }
    }

    // --- SETUP LOGIC ---

    function initSetup() {
        renderPlayerInputs();
        showPanel(sectionConfig);
        if (restoreSurvSession()) {
            updateSurvModeUI();
            return;
        }
        gameState = createGameState();
        updateHUD();
        closeItemPanel();
        if (choicePlayerLabel) choicePlayerLabel.textContent = 'Risponde: --';
        if (choiceProgressLabel) choiceProgressLabel.textContent = '0/0';
        if (choiceList) choiceList.innerHTML = '';
        questionText.textContent = 'Attendere...';
        narrativeText.textContent = 'Inizializzazione sistema...';
        optionsGrid.innerHTML = '';
        updateSurvModeUI();
        persistSurvSave();
    }

    inpSurvCount.addEventListener('input', renderPlayerInputs);

    function renderPlayerInputs() {
        if (isMultiMode()) return;
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
        await unlockAudio();
        gameState = createGameState();
        gameState.players = [];
        if (isMultiMode()) {
            if (!survMpState.isHost) {
                showItemNotification('Solo host puo avviare la partita.');
                return;
            }
            if (!survMpState.roster.length) {
                showItemNotification('Nessun giocatore connesso.');
                return;
            }
            survMpState.roster.forEach((player, index) => {
                const name = player.name || `Sopravvissuto ${index + 1}`;
                gameState.players.push({
                    id: player.id,
                    name,
                    inventory: [],
                    life: START_LIVES,
                    maxLife: START_LIVES,
                    shield: 0
                });
            });
        } else {
            const pCount = clampNumber(parseInt(inpSurvCount.value, 10) || 1, 1, 8);
            for (let i = 0; i < pCount; i++) {
                const name = document.getElementById(`surv-p-${i}`).value.trim() || `Sopravvissuto ${i + 1}`;
                gameState.players.push({
                    name,
                    inventory: [],
                    life: START_LIVES,
                    maxLife: START_LIVES,
                    shield: 0
                });
            }
        }
        gameState.maxTurns = clampNumber(parseInt(inpSurvTurns.value, 10) || 8, 8, 20);
        gameState.turn = 1;
        gameState.score = 0;
        gameState.scenarioPrompt = inpSurvScenario ? inpSurvScenario.value.trim() : '';
        gameState.history = gameState.scenarioPrompt
            ? `Scenario: ${gameState.scenarioPrompt}`
            : 'Inizio della simulazione.';

        updateHUD();
        showPanel(sectionGame);
        if (isMultiMode() && survMpState.isHost) {
            broadcastSurvState();
        }
        await requestTurnOutcome([]);
    });

    btnRestartSurv.addEventListener('click', () => {
        clearSurvSave();
        initSetup();
    });

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
            const lifeTotals = getLifeTotals();
            livesDisplay.textContent = `VITE TOT: ${lifeTotals.current} / ${lifeTotals.max}`;
        }
        renderInventories();
        updateChoiceStatus();
        renderChoiceList();
        persistSurvSave();
    }

    function renderInventories() {
        ensureItemInstanceIds();
        inventoryContainer.innerHTML = '';
        gameState.players.forEach((p, pIndex) => {
            const pDiv = document.createElement('div');
            const isAlive = toNumber(p.life, 0) > 0;
            pDiv.className = `surv-player-inv${isAlive ? '' : ' is-down'}`;

            const header = document.createElement('div');
            header.className = 'surv-player-head';

            const nameTitle = document.createElement('div');
            nameTitle.className = 'surv-p-name';
            nameTitle.textContent = p.name;

            const lifeWrap = document.createElement('div');
            lifeWrap.className = 'surv-life-wrap';

            const lifeBadge = document.createElement('div');
            lifeBadge.className = 'surv-life-badge';
            lifeBadge.textContent = `${toNumber(p.life, 0)}/${toNumber(p.maxLife, 0)}`;

            const dots = document.createElement('div');
            dots.className = 'surv-life-dots';
            const maxLife = Math.max(0, toNumber(p.maxLife, 0));
            for (let i = 0; i < maxLife; i += 1) {
                const dot = document.createElement('span');
                dot.className = `life-dot${i < toNumber(p.life, 0) ? ' is-full' : ''}`;
                dots.appendChild(dot);
            }

            lifeWrap.appendChild(lifeBadge);
            lifeWrap.appendChild(dots);
            header.appendChild(nameTitle);
            header.appendChild(lifeWrap);

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

            pDiv.appendChild(header);
            pDiv.appendChild(itemsDiv);
            inventoryContainer.appendChild(pDiv);
        });
    }

    function setLoadingState(message) {
        optionsGrid.innerHTML = '<div class="surv-spinner">SINCRONIZZAZIONE IN CORSO...</div>';
        questionText.textContent = message || 'Analisi in corso...';
        if (choicePlayerLabel) choicePlayerLabel.textContent = 'Elaborazione...';
        if (choiceProgressLabel) {
            const totalChoices = gameState.choiceOrder.length;
            choiceProgressLabel.textContent = `${gameState.pendingChoices.length}/${totalChoices}`;
        }
    }

    function setOptionsDisabled(disabled) {
        const btns = document.querySelectorAll('.btn-surv-opt');
        btns.forEach((b) => {
            b.disabled = disabled;
        });
    }

    function playDiceRoll(playerName, roll, dc) {
        if (!diceOverlay || !diceCube || !diceValue || !diceContext) {
            return Promise.resolve();
        }
        diceContext.textContent = `${playerName} tira d20 (CD ${dc})`;
        diceValue.textContent = roll;

        diceOverlay.classList.add('is-active');
        diceOverlay.setAttribute('aria-hidden', 'false');

        diceCube.classList.remove('is-rolling');
        void diceCube.offsetWidth;
        diceCube.classList.add('is-rolling');

        return new Promise((resolve) => {
            setTimeout(() => {
                diceOverlay.classList.remove('is-active');
                diceOverlay.setAttribute('aria-hidden', 'true');
                resolve();
            }, 1100);
        });
    }

    function updateChoiceStatus() {
        if (!choicePlayerLabel || !choiceProgressLabel) return;
        const total = gameState.choiceOrder.length;
        const done = gameState.pendingChoices.length;
        choiceProgressLabel.textContent = `${done}/${total}`;

        if (total === 0) {
            choicePlayerLabel.textContent = 'Nessun sopravvissuto attivo';
            return;
        }

        if (isMultiMode()) {
            choicePlayerLabel.textContent = done < total ? 'In attesa scelte...' : 'Elaborazione...';
            return;
        }

        if (done < total) {
            const currentIndex = gameState.choiceOrder[gameState.activeChoiceIndex];
            const current = gameState.players[currentIndex];
            choicePlayerLabel.textContent = `Risponde: ${current ? current.name : '--'}`;
        } else {
            choicePlayerLabel.textContent = 'Elaborazione...';
        }
    }

    function renderChoiceList() {
        if (!choiceList) return;
        choiceList.innerHTML = '';
        gameState.players.forEach((player, idx) => {
            const choice = gameState.pendingChoices.find((entry) => entry.playerIndex === idx);
            const isAlive = toNumber(player.life, 0) > 0;
            const pill = document.createElement('div');
            pill.className = `surv-choice-pill${choice ? ' is-done' : ''}${isAlive ? '' : ' is-down'}`;
            const rollTag = choice && choice.requiresRoll ? `<span class="pill-roll">d20 ${choice.roll}</span>` : '';
            const choiceLabel = isAlive ? (choice ? choice.optionId : '--') : 'K.O.';
            pill.innerHTML = `<span class="pill-name">${player.name}</span><span class="pill-meta"><span class="pill-choice">${choiceLabel}</span>${isAlive ? rollTag : ''}</span>`;
            choiceList.appendChild(pill);
        });
    }

    function renderOptions(options) {
        optionsGrid.innerHTML = '';
        options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            const optId = opt.id || String.fromCharCode(65 + idx);
            const rollTag = opt.requiresRoll ? '<span class="opt-roll">d20</span>' : '';
            btn.className = 'btn-surv-opt';
            btn.dataset.optionId = optId;
            btn.innerHTML = `<span class="opt-id">${optId}</span> <span class="opt-text">${opt.text || ''}</span>${rollTag}`;

            btn.addEventListener('click', () => handleOptionClick(opt, idx));
            optionsGrid.appendChild(btn);
        });

        if (gameState.peekTokens > 0 && options.length > 0) {
            const hintIndex = Math.floor(Math.random() * options.length);
            const buttons = optionsGrid.querySelectorAll('.btn-surv-opt');
            if (buttons[hintIndex]) buttons[hintIndex].classList.add('opt-hint');
            gameState.peekTokens -= 1;
        }
    }

    function startChoicePhase(question, options) {
        gameState.currentOptions = Array.isArray(options) ? options : [];
        gameState.pendingChoices = [];
        gameState.choiceOrder = getAlivePlayerIndices();
        gameState.activeChoiceIndex = 0;
        gameState.waitingForResolution = false;
        gameState.currentQuestion = question || 'Decisione richiesta.';

        questionText.textContent = gameState.currentQuestion;
        renderOptions(gameState.currentOptions);
        updateChoiceStatus();
        renderChoiceList();

        if (gameState.choiceOrder.length === 0) {
            questionText.textContent = 'Nessun sopravvissuto attivo.';
            optionsGrid.innerHTML = '';
        }
        if (isMultiMode() && survMpState.isHost) {
            broadcastSurvState();
        }
        persistSurvSave();
    }

    function lockOptions() {
        const btns = document.querySelectorAll('.btn-surv-opt');
        btns.forEach((b) => {
            b.disabled = true;
        });
    }

    async function handleOptionClick(option, index) {
        if (gameState.waitingForResolution || gameState.isRolling) return;
        unlockAudio();
        const multiMode = isMultiMode();
        const playerIndex = multiMode
            ? findPlayerIndexById(survMpState.playerId)
            : gameState.choiceOrder[gameState.activeChoiceIndex];
        const player = gameState.players[playerIndex];
        if (!player) return;
        if (multiMode && gameState.pendingChoices.some((entry) => entry.playerId === survMpState.playerId)) {
            return;
        }

        const optionId = option.id || String.fromCharCode(65 + index);
        const requiresRoll = Boolean(option.requiresRoll);
        const rollDC = requiresRoll ? clampNumber(toNumber(option.rollDC, 12), 5, 19) : null;
        const roll = requiresRoll ? rollD20() : null;

        if (requiresRoll && roll !== null) {
            gameState.isRolling = true;
            setOptionsDisabled(true);
            await playDiceRoll(player.name, roll, rollDC);
            showRollNotification(`Tiro d20 ${player.name}: ${roll} (CD ${rollDC})`);
            gameState.isRolling = false;
        }

        const choicePayload = {
            playerId: survMpState.playerId,
            playerIndex,
            player: player.name,
            optionId,
            optionText: option.text || '',
            requiresRoll,
            roll,
            rollDC
        };

        if (multiMode) {
            gameState.pendingChoices.push(choicePayload);
            updateChoiceStatus();
            renderChoiceList();
            lockOptions();
            if (survMpState.isHost) {
                broadcastSurvState();
                checkMultiResolution();
            } else if (window.GPRealtime) {
                window.GPRealtime.send('survivor', {
                    type: 'survivor',
                    action: 'choice',
                    choice: choicePayload,
                    senderId: survMpState.playerId
                });
            }
            persistSurvSave();
            return;
        }

        gameState.pendingChoices.push(choicePayload);
        gameState.activeChoiceIndex += 1;

        updateChoiceStatus();
        renderChoiceList();

        const isLastChoice = gameState.activeChoiceIndex >= gameState.choiceOrder.length;
        if (!isLastChoice) {
            setOptionsDisabled(false);
        } else {
            lockOptions();
            requestTurnOutcome(gameState.pendingChoices);
        }
    }

    function summarizeChoices(choices) {
        if (!choices.length) return '';
        return choices
            .map((entry) => {
                const rollInfo = entry.requiresRoll ? ` d20 ${entry.roll}` : '';
                return `${entry.player}: ${entry.optionId}${rollInfo}`;
            })
            .join(', ');
    }

    function findPlayerIndexByName(name) {
        if (!name) return -1;
        const lower = name.toString().toLowerCase();
        return gameState.players.findIndex((player) => player.name.toLowerCase() === lower);
    }

    function resolveOutcomePlayerIndex(outcome) {
        if (!outcome) return null;
        if (gameState.players.length === 0) return null;
        if (Number.isInteger(outcome.playerIndex)) {
            return clampNumber(outcome.playerIndex, 0, gameState.players.length - 1);
        }
        const name = outcome.player || outcome.playerName;
        if (typeof name === 'string') {
            const byName = findPlayerIndexByName(name);
            if (byName >= 0) return byName;
        }
        return null;
    }

    function resolveRewardTarget(reward, fallbackIndex) {
        if (gameState.players.length === 0) return -1;
        if (Number.isInteger(reward?.targetIndex)) {
            return clampNumber(reward.targetIndex, 0, gameState.players.length - 1);
        }
        if (typeof reward?.player === 'string') {
            const byName = findPlayerIndexByName(reward.player);
            if (byName >= 0) return byName;
        }
        if (typeof reward?.target === 'string') {
            const byName = findPlayerIndexByName(reward.target);
            if (byName >= 0) return byName;
        }
        if (Number.isInteger(fallbackIndex)) {
            return clampNumber(fallbackIndex, 0, gameState.players.length - 1);
        }
        return Math.floor(Math.random() * gameState.players.length);
    }

    function applyItemRewards(rewards, fallbackIndex = null) {
        const gained = [];
        if (!Array.isArray(rewards)) return gained;

        rewards.forEach((reward) => {
            const count = Math.max(1, toNumber(reward.count, 1));
            for (let i = 0; i < count; i += 1) {
                let rarity = normalizeRarity(reward.rarity) || rollRarity();
                if (gameState.itemLuck > 0) {
                    rarity = upgradeRarity(rarity, 1);
                    gameState.itemLuck -= 1;
                }
                const targetIndex = resolveRewardTarget(reward, fallbackIndex);
                if (targetIndex >= 0) {
                    const item = grantItemToPlayer(targetIndex, rarity);
                    if (item) gained.push(item);
                }
            }
        });
        return gained;
    }

    function applyTurnOutcome(data, choices) {
        const baseNarrative = data.narrative || 'Sistema operativo attivo.';
        const playerOutcomes = Array.isArray(data.playerOutcomes) ? data.playerOutcomes : [];
        const narrativeLines = [baseNarrative];

        let totalScoreDelta = toNumber(data.scoreDelta, 0);
        let totalLifeDelta = 0;
        let itemsFound = [];

        if (playerOutcomes.length) {
            playerOutcomes.forEach((outcome) => {
                let playerIndex = resolveOutcomePlayerIndex(outcome);
                if (playerIndex === null && outcome?.choiceId) {
                    const matched = choices.find((entry) => entry.optionId === outcome.choiceId);
                    if (matched) playerIndex = matched.playerIndex;
                }
                const playerName = playerIndex !== null ? gameState.players[playerIndex]?.name : outcome?.player;
                if (outcome?.narrative) {
                    const line = playerName ? `${playerName}: ${outcome.narrative}` : outcome.narrative;
                    narrativeLines.push(line);
                }
                totalScoreDelta += toNumber(outcome?.scoreDelta, 0);
                if (playerIndex !== null) {
                    totalLifeDelta += applyLifeDelta(outcome?.lifeDelta, playerIndex);
                    itemsFound = itemsFound.concat(applyItemRewards(outcome?.itemRewards, playerIndex));
                }
            });
        }

        const globalLifeDelta = toNumber(data.lifeDelta, 0);
        if (globalLifeDelta) {
            totalLifeDelta += applyLifeDeltaToAll(globalLifeDelta);
        }

        if (Array.isArray(data.itemRewards) && data.itemRewards.length) {
            itemsFound = itemsFound.concat(applyItemRewards(data.itemRewards));
        }

        const appliedScore = applyScoreDelta(totalScoreDelta, true);

        const outcomeBits = [];
        if (appliedScore !== 0) outcomeBits.push(`Punti ${formatSigned(appliedScore)}`);
        if (totalLifeDelta !== 0) outcomeBits.push(`Vite ${formatSigned(totalLifeDelta)}`);
        if (itemsFound.length) outcomeBits.push(`Oggetti +${itemsFound.length}`);

        const narrativeBlock = narrativeLines.filter(Boolean).join('\n');
        const extra = outcomeBits.length ? `\n${outcomeBits.join(' | ')}` : '';
        const narrativeDisplay = `${narrativeBlock}${extra}`;
        narrativeText.textContent = narrativeDisplay;
        const ttsContext = buildTtsContext(appliedScore, totalLifeDelta, itemsFound, choices);
        const questionLine = data.question && !data.isGameOver
            ? `\nDomanda: ${data.question}`
            : '';
        lastNarrativeDisplay = narrativeDisplay;
        lastNarrativeText = `${narrativeBlock}${questionLine}`.trim();
        lastNarrativeContext = ttsContext;
        speak(lastNarrativeText, ttsContext);

        if (choices.length) {
            gameState.history += `\nSCELTE TURNO ${gameState.turn}: ${summarizeChoices(choices)}`;
        }
        const historyLine = outcomeBits.length ? `${narrativeBlock} | ${outcomeBits.join(', ')}` : narrativeBlock;
        gameState.history += `\nESITO TURNO ${gameState.turn}: ${historyLine}`;

        if (isMultiMode() && survMpState.isHost) {
            broadcastSurvState();
        }
        persistSurvSave();
    }

    async function requestTurnOutcome(choices) {
        if (isMultiMode() && !survMpState.isHost) return;
        gameState.waitingForResolution = true;
        setLoadingState('Calcolo esito...');
        if (isMultiMode() && survMpState.isHost) {
            broadcastSurvState();
        }

        try {
            const finaleRequired = choices.length > 0 && gameState.turn >= gameState.maxTurns;
            const response = await fetch('/api/survivor-gm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    players: gameState.players,
                    turn: gameState.turn,
                    maxTurns: gameState.maxTurns,
                    lives: getLifeTotals().current,
                    maxLives: getLifeTotals().max,
                    choices,
                    history: gameState.history,
                    scenario: gameState.scenarioPrompt,
                    finaleRequired
                })
            });

            const responseText = await response.text();
            let data = null;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Risposta AI non valida');
            }
            if (!response.ok) {
                const detail = data?.details || data?.error || responseText || 'Errore comunicazione AI';
                throw new Error(detail);
            }

            applyTurnOutcome(data, choices);

            const resolvingTurn = choices.length > 0;
            const reachedMaxTurns = resolvingTurn && gameState.turn >= gameState.maxTurns;

            const lifeTotals = getLifeTotals();
            const allDead = lifeTotals.total > 0 && lifeTotals.alive === 0;
            if (data.isGameOver || allDead || reachedMaxTurns) {
                endGame(data);
                return;
            }

            if (resolvingTurn) {
                gameState.turn += 1;
            }
            updateHUD();
            startChoicePhase(data.question, Array.isArray(data.options) ? data.options : []);
        } catch (e) {
            console.error(e);
            questionText.textContent = 'ERRORE CRITICO DI SISTEMA.';
            narrativeText.textContent = e && e.message
                ? `Connessione persa. ${e.message}`
                : 'Connessione persa. Riprovare.';
            optionsGrid.innerHTML = '<button class="btn-surv-opt" onclick="location.reload()">RIAVVIA SISTEMA</button>';
        }
    }

    function endGame(data) {
        showPanel(sectionResult);
        const lifeTotals = getLifeTotals();
        const livesLine = `Vite residue: ${lifeTotals.current} / ${lifeTotals.max}`;
        let finaleLines = Array.isArray(data.playerFinale)
            ? data.playerFinale
                .map((entry) => {
                    const name = entry.player || entry.name || '';
                    const result = entry.result || entry.esito || '';
                    return name && result ? `${name}: ${result}` : null;
                })
                .filter(Boolean)
            : [];
        if (!finaleLines.length) {
            finaleLines = gameState.players.map((player) => {
                const status = toNumber(player.life, 0) > 0 ? 'Si salva' : 'Non ce la fa';
                return `${player.name}: ${status}`;
            });
        }
        const finaleText = finaleLines.length ? `\n\nEsiti finali:\n${finaleLines.join('\n')}` : '';
        const endNarrative = `Gioco terminato. ${data.narrative || ''}`;
        document.getElementById('surv-end-msg').textContent = `Punteggio Finale: ${gameState.score}\n${livesLine}\n\n${data.narrative || ''}${finaleText}`;
        lastNarrativeDisplay = endNarrative;
        lastNarrativeText = endNarrative;
        lastNarrativeContext = {
            isGameOver: true,
            lives: lifeTotals.current,
            maxLives: lifeTotals.max,
            score: gameState.score,
            turn: gameState.turn,
            maxTurns: gameState.maxTurns
        };
        speak(endNarrative, lastNarrativeContext);
        if (choicePlayerLabel) choicePlayerLabel.textContent = 'Missione conclusa';
        if (choiceProgressLabel) {
            const lifeTotals = getLifeTotals();
            choiceProgressLabel.textContent = `${lifeTotals.alive}/${lifeTotals.total}`;
        }
        if (choiceList) choiceList.innerHTML = '';
        optionsGrid.innerHTML = '';
        persistSurvSave();
    }

    // --- ITEM HANDLING ---

    function openItemPanel(ownerIndex, itemIndex) {
        if (!itemPanel || !itemPanelTitle) return;
        const owner = gameState.players[ownerIndex];
        const item = owner && owner.inventory[itemIndex];
        if (!item) return;

        selectedItem = {
            ownerIndex,
            itemIndex,
            ownerId: owner?.id || null,
            instanceId: item.instanceId || null
        };
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
        const { ownerIndex, itemIndex, ownerId, instanceId } = selectedItem;
        if (isMultiMode() && !survMpState.isHost) {
            if (window.GPRealtime) {
                window.GPRealtime.send('survivor', {
                    type: 'survivor',
                    action: 'item',
                    item: {
                        itemAction: 'share',
                        ownerId,
                        ownerIndex,
                        targetId: gameState.players[targetIndex]?.id || null,
                        targetIndex,
                        instanceId
                    },
                    senderId: survMpState.playerId
                });
            }
            showItemNotification('Richiesta inviata all\'host.');
            closeItemPanel();
            return;
        }
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
        if (isMultiMode() && survMpState.isHost) {
            broadcastSurvState();
        }
        persistSurvSave();
    }

    function useSelectedItem() {
        if (!selectedItem) return;
        const { ownerIndex, itemIndex, ownerId, instanceId } = selectedItem;
        if (isMultiMode() && !survMpState.isHost) {
            if (window.GPRealtime) {
                window.GPRealtime.send('survivor', {
                    type: 'survivor',
                    action: 'item',
                    item: {
                        itemAction: 'use',
                        ownerId,
                        ownerIndex,
                        instanceId
                    },
                    senderId: survMpState.playerId
                });
            }
            showItemNotification('Richiesta inviata all\'host.');
            closeItemPanel();
            return;
        }
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
        if (isMultiMode() && survMpState.isHost) {
            broadcastSurvState();
        }
        persistSurvSave();
    }

    function resolvePlayerIndex(payload, idKey, indexKey) {
        if (payload?.[idKey]) {
            const idx = findPlayerIndexById(payload[idKey]);
            if (idx >= 0) return idx;
        }
        if (Number.isInteger(payload?.[indexKey])) {
            return clampNumber(payload[indexKey], 0, gameState.players.length - 1);
        }
        return -1;
    }

    function handleRemoteItemAction(action) {
        if (!action || !survMpState.isHost) return;
        const ownerIndex = resolvePlayerIndex(action, 'ownerId', 'ownerIndex');
        if (ownerIndex < 0) return;
        const owner = gameState.players[ownerIndex];
        if (!owner) return;
        const itemIndex = owner.inventory.findIndex((item) => item.instanceId === action.instanceId);
        if (itemIndex < 0) return;

        if (action.itemAction === 'use') {
            const item = owner.inventory.splice(itemIndex, 1)[0];
            applyActions(item.actions, ownerIndex);
            showItemNotification(`Usato: ${item.name}. ${item.effectText}`);
        }
        if (action.itemAction === 'share') {
            const targetIndex = resolvePlayerIndex(action, 'targetId', 'targetIndex');
            if (targetIndex < 0) return;
            const item = owner.inventory.splice(itemIndex, 1)[0];
            gameState.players[targetIndex].inventory.push(item);
            showItemNotification(`Oggetto condiviso: ${item.name} -> ${gameState.players[targetIndex].name}`);
        }

        updateHUD();
        broadcastSurvState();
        persistSurvSave();
    }

    function applyLifeDelta(delta, playerIndex) {
        const change = toNumber(delta, 0);
        if (!change) return 0;
        const player = gameState.players[playerIndex];
        if (!player) return 0;
        let adjusted = change;

        if (adjusted < 0 && toNumber(player.shield, 0) > 0) {
            const absorb = Math.min(toNumber(player.shield, 0), Math.abs(adjusted));
            player.shield = toNumber(player.shield, 0) - absorb;
            adjusted += absorb;
        }

        player.life = clampNumber(toNumber(player.life, 0) + adjusted, 0, toNumber(player.maxLife, 0));
        return adjusted;
    }

    function applyLifeDeltaToAll(delta) {
        if (!delta) return 0;
        let total = 0;
        gameState.players.forEach((player, index) => {
            if (toNumber(player.life, 0) > 0 || delta > 0) {
                total += applyLifeDelta(delta, index);
            }
        });
        return total;
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

    function adjustMaxLives(delta, playerIndex) {
        const change = toNumber(delta, 0);
        if (!change) return 0;
        const player = gameState.players[playerIndex];
        if (!player) return 0;
        const previous = toNumber(player.maxLife, 0);
        player.maxLife = clampNumber(previous + change, START_LIVES, MAX_LIVES_LIMIT);
        const gained = toNumber(player.maxLife, 0) - previous;
        if (gained > 0) {
            player.life = clampNumber(toNumber(player.life, 0) + gained, 0, toNumber(player.maxLife, 0));
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
        const owner = gameState.players[ownerIndex];
        switch (action.type) {
            case 'life':
                applyLifeDelta(action.delta, ownerIndex);
                break;
            case 'maxLife':
                adjustMaxLives(action.delta, ownerIndex);
                break;
            case 'score':
                applyScoreDelta(action.delta);
                break;
            case 'shield':
                if (owner) {
                    owner.shield = toNumber(owner.shield, 0) + toNumber(action.points, 0);
                }
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
        if (!gameState.players[index]) return null;
        const item = drawItemFromPool(rarity);
        if (!item) return null;
        gameState.players[index].inventory.push(item);
        showItemNotification(`Oggetto trovato: ${item.name} (${gameState.players[index].name})`);
        return item;
    }

    function showItemNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'item-notif';
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2800);
    }

    function showRollNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'item-notif roll-notif';
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2200);
    }

    // --- TTS HELPER ---
    let ttsAudio = null;
    let ttsAudioNode = null;
    let ttsAudioContext = null;
    let audioUnlocked = false;
    let ttsAbort = null;
    let ttsRequestId = 0;

    function getAudioContext() {
        if (!ttsAudioContext) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                ttsAudioContext = new AudioCtx();
            }
        }
        return ttsAudioContext;
    }

    async function unlockAudio() {
        if (audioUnlocked) return;
        const context = getAudioContext();
        if (context) {
            try {
                if (context.state === 'suspended') {
                    await context.resume();
                }
                const buffer = context.createBuffer(1, 1, 22050);
                const source = context.createBufferSource();
                source.buffer = buffer;
                source.connect(context.destination);
                source.start(0);
                source.stop(0.02);
                audioUnlocked = true;
                return;
            } catch (error) {
                console.error('Audio unlock failed', error);
            }
        }

        try {
            const silentAudio = new Audio(
                'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YQAAAAA='
            );
            await silentAudio.play();
            silentAudio.pause();
            audioUnlocked = true;
        } catch (error) {
            console.error('Silent audio unlock failed', error);
        }
    }

    function base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i += 1) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    function showAudioWarning(message) {
        const notif = document.createElement('div');
        notif.className = 'item-notif audio-notif';
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2400);
    }

    function stopAudio() {
        ttsRequestId += 1;
        if (ttsAbort) {
            ttsAbort.abort();
            ttsAbort = null;
        }
        if (ttsAudioNode) {
            try {
                ttsAudioNode.stop(0);
            } catch (error) {
                // ignore
            }
            ttsAudioNode.disconnect();
            ttsAudioNode = null;
        }
        if (ttsAudio) {
            ttsAudio.pause();
            ttsAudio.currentTime = 0;
            ttsAudio = null;
        }
    }

    function summarizeRollStats(choices) {
        if (!Array.isArray(choices) || choices.length === 0) return null;
        const rollChoices = choices.filter(
            (entry) => entry && entry.requiresRoll && Number.isFinite(entry.roll)
        );
        if (!rollChoices.length) return null;
        const values = rollChoices.map((entry) => entry.roll);
        const successes = rollChoices.filter(
            (entry) => entry.roll >= toNumber(entry.rollDC, 0)
        ).length;
        const failures = rollChoices.length - successes;
        const critical = rollChoices.filter((entry) => entry.roll >= 18).length;
        return {
            count: rollChoices.length,
            min: Math.min(...values),
            max: Math.max(...values),
            successes,
            failures,
            critical
        };
    }

    function buildTtsContext(scoreDelta, lifeDelta, itemsFound, choices) {
        const lifeTotals = getLifeTotals();
        return {
            turn: gameState.turn,
            maxTurns: gameState.maxTurns,
            lives: lifeTotals.current,
            maxLives: lifeTotals.max,
            score: gameState.score,
            scoreDelta,
            lifeDelta,
            itemCount: Array.isArray(itemsFound) ? itemsFound.length : 0,
            rollStats: summarizeRollStats(choices)
        };
    }

    async function speak(text, ttsContext = {}) {
        if (!text) return;
        stopAudio();

        const controller = new AbortController();
        const requestId = ttsRequestId;
        ttsAbort = controller;

        try {
            const response = await fetch('/api/survivor-tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, context: ttsContext }),
                signal: controller.signal
            });

            const responseText = await response.text();
            let data = null;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                data = null;
            }
            if (!response.ok) {
                throw new Error(data?.error || data?.details || responseText || 'TTS error');
            }
            if (!data) {
                throw new Error('TTS invalid response');
            }
            if (requestId !== ttsRequestId) return;
            if (!data.audio) {
                throw new Error('TTS missing audio');
            }

            const mimeType = data.mimeType || 'audio/wav';
            const audioContext = getAudioContext();
            if (audioContext) {
                try {
                    if (audioContext.state === 'suspended') {
                        await audioContext.resume();
                    }
                    const buffer = base64ToArrayBuffer(data.audio);
                    const decoded = await audioContext.decodeAudioData(buffer.slice(0));
                    const source = audioContext.createBufferSource();
                    source.buffer = decoded;
                    source.connect(audioContext.destination);
                    ttsAudioNode = source;
                    source.start(0);
                    audioUnlocked = true;
                    return;
                } catch (error) {
                    console.error('TTS decode failed', error);
                }
            }

            ttsAudio = new Audio(`data:${mimeType};base64,${data.audio}`);
            ttsAudio.preload = 'auto';
            ttsAudio.volume = 1;
            ttsAudio.playsInline = true;
            ttsAudio.play().catch((error) => {
                if (error?.name === 'NotAllowedError') {
                    showAudioWarning('Audio bloccato. Tocca lo schermo per attivarlo.');
                }
                console.error('TTS play failed', error);
            });
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('TTS error', error);
            const message = error?.message ? `Audio non disponibile: ${error.message}` : 'Audio non disponibile.';
            showAudioWarning(message);
        } finally {
            if (ttsAbort === controller) {
                ttsAbort = null;
            }
        }
    }
});
