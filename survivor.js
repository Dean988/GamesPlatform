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
            scenarioPrompt: '',
            score: 0,
            scoreMultiplier: 1,
            scoreBoostTurns: 0,
            peekTokens: 0,
            itemLuck: 0,
            itemPools: initItemPools(),
            currentOptions: [],
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

    const narrativeText = document.getElementById('surv-narrative-text');
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
        if (choicePlayerLabel) choicePlayerLabel.textContent = 'Risponde: --';
        if (choiceProgressLabel) choiceProgressLabel.textContent = '0/0';
        if (choiceList) choiceList.innerHTML = '';
        questionText.textContent = 'Attendere...';
        narrativeText.textContent = 'Inizializzazione sistema...';
        optionsGrid.innerHTML = '';
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
        await unlockAudio();
        const pCount = clampNumber(parseInt(inpSurvCount.value, 10) || 1, 1, 8);
        gameState = createGameState();
        gameState.players = [];
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
        gameState.maxTurns = parseInt(inpSurvTurns.value, 10) || 5;
        gameState.turn = 1;
        gameState.score = 0;
        gameState.scenarioPrompt = inpSurvScenario ? inpSurvScenario.value.trim() : '';
        gameState.history = gameState.scenarioPrompt
            ? `Scenario: ${gameState.scenarioPrompt}`
            : 'Inizio della simulazione.';

        updateHUD();
        showPanel(sectionGame);
        await requestTurnOutcome([]);
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
            const lifeTotals = getLifeTotals();
            livesDisplay.textContent = `VITE TOT: ${lifeTotals.current} / ${lifeTotals.max}`;
        }
        renderInventories();
        updateChoiceStatus();
        renderChoiceList();
    }

    function renderInventories() {
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

        questionText.textContent = question || 'Decisione richiesta.';
        renderOptions(gameState.currentOptions);
        updateChoiceStatus();
        renderChoiceList();

        if (gameState.choiceOrder.length === 0) {
            questionText.textContent = 'Nessun sopravvissuto attivo.';
            optionsGrid.innerHTML = '';
        }
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
        const playerIndex = gameState.choiceOrder[gameState.activeChoiceIndex];
        const player = gameState.players[playerIndex];
        if (!player) return;

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

        gameState.pendingChoices.push({
            playerIndex,
            player: player.name,
            optionId,
            optionText: option.text || '',
            requiresRoll,
            roll,
            rollDC
        });
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
        narrativeText.textContent = `${narrativeBlock}${extra}`;
        const ttsContext = buildTtsContext(appliedScore, totalLifeDelta, itemsFound, choices);
        speak(narrativeBlock, ttsContext);

        if (choices.length) {
            gameState.history += `\nSCELTE TURNO ${gameState.turn}: ${summarizeChoices(choices)}`;
        }
        const historyLine = outcomeBits.length ? `${narrativeBlock} | ${outcomeBits.join(', ')}` : narrativeBlock;
        gameState.history += `\nESITO TURNO ${gameState.turn}: ${historyLine}`;
    }

    async function requestTurnOutcome(choices) {
        gameState.waitingForResolution = true;
        setLoadingState('Calcolo esito...');

        try {
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
                    scenario: gameState.scenarioPrompt
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
                throw new Error(data?.error || 'Errore comunicazione AI');
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
        document.getElementById('surv-end-msg').textContent = `Punteggio Finale: ${gameState.score}\n${livesLine}\n\n${data.narrative || ''}`;
        speak(`Gioco terminato. ${data.narrative || ''}`, {
            isGameOver: true,
            lives: lifeTotals.current,
            maxLives: lifeTotals.max,
            score: gameState.score,
            turn: gameState.turn,
            maxTurns: gameState.maxTurns
        });
        if (choicePlayerLabel) choicePlayerLabel.textContent = 'Missione conclusa';
        if (choiceProgressLabel) {
            const lifeTotals = getLifeTotals();
            choiceProgressLabel.textContent = `${lifeTotals.alive}/${lifeTotals.total}`;
        }
        if (choiceList) choiceList.innerHTML = '';
        optionsGrid.innerHTML = '';
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

    async function speak(text, context = {}) {
        if (!text) return;
        stopAudio();

        const controller = new AbortController();
        const requestId = ttsRequestId;
        ttsAbort = controller;

        try {
            const response = await fetch('/api/survivor-tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, context }),
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
            const context = getAudioContext();
            if (context) {
                try {
                    if (context.state === 'suspended') {
                        await context.resume();
                    }
                    const buffer = base64ToArrayBuffer(data.audio);
                    const decoded = await context.decodeAudioData(buffer.slice(0));
                    const source = context.createBufferSource();
                    source.buffer = decoded;
                    source.connect(context.destination);
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
