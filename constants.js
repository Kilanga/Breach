/**
 * BREACH — Constantes globales
 * Dérivé de RIFT — adapté pour le mode auto-battle temps réel (Vampire Survivors)
 */

// ─── Localisation (i18n) ────────────────────────────────────────────────────
export const LANGUAGES = ['fr', 'en'];
export const DEFAULT_LANGUAGE = 'fr';
export const I18N = {
  fr: {
    play: 'JOUER',
    talents: 'Talents',
    achievements: 'Succès',
    settings: 'Paramètres',
    runs: 'Runs',
    kills: 'Kills',
    best: 'Meilleur',
    version: 'Version',
    menu_title: 'BREACH',
    menu_sub: 'Auto-battle · Survie · Améliore',
    menu_btn_play: '🎮  JOUER',
    menu_btn_talents: '🏆  Talents',
    menu_btn_achievements: '🥇  Succès',
    menu_btn_settings: '⚙   Paramètres',
    menu_stat_runs: 'Runs',
    menu_stat_kills: 'Kills',
    menu_stat_best: 'Meilleur',
    menu_version: 'v{version} · Kilanga',
  },
  en: {
    play: 'PLAY',
    talents: 'Talents',
    achievements: 'Achievements',
    settings: 'Settings',
    runs: 'Runs',
    kills: 'Kills',
    best: 'Best',
    version: 'Version',
    menu_title: 'BREACH',
    menu_sub: 'Auto-battle · Survive · Upgrade',
    menu_btn_play: '🎮  PLAY',
    menu_btn_talents: '🏆  Talents',
    menu_btn_achievements: '🥇  Achievements',
    menu_btn_settings: '⚙   Settings',
    menu_stat_runs: 'Runs',
    menu_stat_kills: 'Kills',
    menu_stat_best: 'Best',
    menu_version: 'v{version} · Kilanga',
  },
};

// ─── Cosmétiques & Boutique ────────────────────────────────────────────────
export const COSMETICS = [
  {
    id: 'player_gold',
    name: 'Apparence Or',
    type: 'player_skin',
    desc: 'Change la couleur du joueur en or.',
    price: 100,
    icon: '⭐',
  },
  {
    id: 'arena_night',
    name: 'Arène Nuit',
    type: 'arena_skin',
    desc: "Thème sombre pour l'arène.",
    price: 80,
    icon: '🌙',
  },
  {
    id: 'trail_rainbow',
    name: 'Trainée Arc-en-ciel',
    type: 'trail',
    desc: 'Laisse une traînée arc-en-ciel derrière le joueur.',
    price: 120,
    icon: '🌈',
  },
];

// ─── Events hebdo ──────────────────────────────────────────────────────────
export const WEEKLY_EVENTS = [
  {
    id: 'double_xp',
    name: 'Double XP',
    desc: 'Tous les XP gagnés sont doublés cette semaine.',
    effect: { type: 'xp_mult', value: 2 },
  },
  {
    id: 'fast_enemies',
    name: 'Ennemis rapides',
    desc: 'Les ennemis se déplacent 30% plus vite cette semaine.',
    effect: { type: 'enemy_speed', value: 1.3 },
  },
];

// ─── Arène ────────────────────────────────────────────────────────────────────
export const ARENA_WIDTH  = 800;   // largeur logique de l'arène (pixels)
export const ARENA_HEIGHT = 800;   // hauteur logique de l'arène
export const PLAYER_RADIUS = 16;
export const BASE_ENEMY_RADIUS = 14;

// ─── Game loop ─────────────────────────────────────────────────────────────────
export const TARGET_FPS = 60;
export const BOSS_INTERVAL_SECONDS = 60; // Boss toutes les 60s
export const SPEED_SCALE = 50;           // facteur de conversion vitesse → px/s
export const VICTORY_TIME = 300;         // secondes pour une victoire standard

// ─── Modes de jeu ─────────────────────────────────────────────────────────────
export const GAME_MODE = {
  STANDARD: 'standard', // 5 minutes
  ENDLESS:  'endless',  // survie infinie
};

// ─── Gameplay tuning ───────────────────────────────────────────────────────────
export const SHOOTER_DESIRED_DIST   = 200; // distance maintenue par le Tirailleur
export const EXPLOSION_RADIUS       = 60;  // rayon d'explosion par défaut
export const FRACTURE_RADIUS        = 60;  // rayon de fracture upgrade
export const SHOCKWAVE_RADIUS       = 80;  // rayon de l'onde de choc upgrade
export const XP_ATTRACT_RADIUS_MULT = 3;   // attraction XP = pickupR × ce facteur
export const XP_ATTRACT_SPEED       = 150; // px/s attraction max des orbes XP
export const INVINCIBLE_DURATION    = 0.5; // secondes d'invincibilité après un coup

// ─── XP & Level ───────────────────────────────────────────────────────────────
export const XP_PER_LEVEL_BASE = 50;   // XP nécessaire pour le niveau 1
export const XP_LEVEL_SCALING  = 1.35; // multiplicateur par niveau

// ─── Classes du joueur ────────────────────────────────────────────────────────
export const PLAYER_SHAPES = {
  TRIANGLE: 'triangle', // Assassin  — projectile linéaire (pierce)
  CIRCLE:   'circle',   // Arcaniste — AoE circulaire
  HEXAGON:  'hexagon',  // Colosse   — zone au contact
  SHADOW:   'shadow',   // Ombre     — embuscade (premier projectile ×2)
  PALADIN:  'paladin',  // Paladin   — aura + frappe radiale
  OCTAGON:  'octagon',  // Oracle    — onde de prémonition
};

export const CLASS_INFO = {
  triangle: {
    name: 'Assassin',  short: 'ASS', color: '#00FFCC',
    baseStats: { maxHp: 80,  attack: 12, defense: 2, speed: 3.2 },
    attackType: 'pierce',        // projectile linéaire
    attackCooldown: 1.2,         // secondes
    projectileSpeed: 7,
    projectileRadius: 6,
    piercing: true,
    desc: 'Tire un projectile en ligne qui traverse les ennemis.',
  },
  circle: {
    name: 'Arcaniste', short: 'ARC', color: '#FF66FF',
    baseStats: { maxHp: 70,  attack: 10, defense: 3, speed: 2.8 },
    attackType: 'aoe',           // AoE circulaire autour du joueur
    attackCooldown: 1.8,
    aoeRadius: 80,
    desc: 'Déclenche une explosion magique autour de lui.',
  },
  hexagon: {
    name: 'Colosse',   short: 'COL', color: '#66AAFF',
    baseStats: { maxHp: 120, attack: 8,  defense: 8, speed: 2.2 },
    attackType: 'aura',          // zone de dégâts au contact
    attackCooldown: 0.6,
    auraRadius: 40,
    desc: 'Inflige des dégâts aux ennemis proches en continu.',
  },
  shadow: {
    name: 'Ombre',     short: 'OMB', color: '#FF6600',
    baseStats: { maxHp: 75,  attack: 14, defense: 2, speed: 3.5 },
    attackType: 'ambush',        // projectile, premier coup ×2
    attackCooldown: 1.4,
    projectileSpeed: 8,
    projectileRadius: 5,
    ambushMultiplier: 2,
    ambushCooldown: 4,           // reset multiplicateur toutes les 4s
    desc: 'Tir furtif — le premier projectile après 4s inflige ×2.',
    locked: true,
    purchasable: true,
    purchaseCost: 20,
  },
  paladin: {
    name: 'Paladin',   short: 'PAL', color: '#FFCC00',
    baseStats: { maxHp: 100, attack: 9,  defense: 6, speed: 2.5 },
    attackType: 'radial',        // frappe radiale + aura de soin
    attackCooldown: 2.0,
    radialCount: 8,              // 8 projectiles en étoile
    projectileSpeed: 5,
    projectileRadius: 8,
    healAura: 0.3,               // 0.3 HP/s de régén
    desc: 'Frappe radiale en étoile + régénération passive.',
    locked: true,
    purchasable: true,
    purchaseCost: 30,
  },
  octagon: {
    name: 'Oracle',    short: 'ORC', color: '#00FFD0',
    baseStats: { maxHp: 85, attack: 8, defense: 4, speed: 2.7 },
    attackType: 'premonition',   // onde de prémonition
    attackCooldown: 2.5,
    premonitionRadius: 90,
    slowAmount: 0.5,             // ralentit de 50% les ennemis touchés
    slowDuration: 2.5,
    desc: 'Déclenche une onde qui ralentit les ennemis proches. Prévoit les attaques adverses.',
    locked: true,
    purchasable: true,
    purchaseCost: 40,
  },
};

// ─── Ennemis ──────────────────────────────────────────────────────────────────
export const ENEMY_TYPES = {
  CHASER:        'chaser',
  SHOOTER:       'shooter',
  BLOCKER:       'blocker',
  HEALER:        'healer',
  EXPLOSIVE:     'explosive',
  SUMMONER:      'summoner',
  BOSS_VOID:     'boss_void',
  BOSS_CINDER:   'boss_cinder',
  BOSS_MIRROR:   'boss_mirror',
  BOSS_PULSE:    'boss_pulse',
  BOSS_RIFT:     'boss_rift',
  BOSS_PROPHET:  'boss_prophet',
};

export const ENEMY_INFO = {
  chaser: {
    name: 'Écumeur', short: 'ÉCU', color: '#FF4444',
    baseHp: 30, baseDamage: 5, baseSpeed: 2.2, radius: 14,
    xpValue: 5, scoreValue: 10,
    behavior: 'chase', // fonce sur le joueur
  },
  shooter: {
    name: 'Tirailleur', short: 'TIR', color: '#4488FF',
    baseHp: 25, baseDamage: 8, baseSpeed: 1.4, radius: 13,
    xpValue: 8, scoreValue: 15,
    behavior: 'shoot', // maintient la distance, tire
    projectileSpeed: 4, projectileCooldown: 2.5,
  },
  blocker: {
    name: 'Titan', short: 'TIT', color: '#888899',
    baseHp: 80, baseDamage: 10, baseSpeed: 1.0, radius: 20,
    xpValue: 12, scoreValue: 20,
    behavior: 'chase',
  },
  healer: {
    name: 'Guérisseur', short: 'GUÉ', color: '#44FF88',
    baseHp: 40, baseDamage: 3, baseSpeed: 1.6, radius: 13,
    xpValue: 10, scoreValue: 18,
    behavior: 'healer', // soigne les ennemis proches, fuit le joueur
    healRadius: 70, healRate: 5, healInterval: 2,
  },
  explosive: {
    name: 'Explosif', short: 'EXP', color: '#FF8800',
    baseHp: 20, baseDamage: 20, baseSpeed: 2.5, radius: 14,
    xpValue: 8, scoreValue: 15,
    behavior: 'chase',
    explodeOnDeath: true, explodeRadius: 60,
  },
  summoner: {
    name: 'Invocateur', short: 'INV', color: '#CC44FF',
    baseHp: 45, baseDamage: 3, baseSpeed: 1.2, radius: 15,
    xpValue: 15, scoreValue: 25,
    behavior: 'summon', // invoque des chasers
    summonInterval: 4, summonCount: 2,
  },
  boss_void: {
    name: "L'Écho", short: 'ÉCH', color: '#BB44FF',
    baseHp: 600, baseDamage: 15, baseSpeed: 1.8, radius: 30,
    xpValue: 80, scoreValue: 200,
    behavior: 'boss_spiral', isBoss: true,
  },
  boss_cinder: {
    name: 'Veilleur de Cendre', short: 'CEN', color: '#FF6600',
    baseHp: 800, baseDamage: 18, baseSpeed: 1.6, radius: 32,
    xpValue: 100, scoreValue: 250,
    behavior: 'boss_cinder', isBoss: true,
  },
  boss_mirror: {
    name: 'La Mère-Écho', short: 'MER', color: '#AAFFFF',
    baseHp: 700, baseDamage: 12, baseSpeed: 2.0, radius: 28,
    xpValue: 90, scoreValue: 220,
    behavior: 'boss_mirror', isBoss: true,
  },
  boss_pulse: {
    name: 'Tonnerre Incarné', short: 'TON', color: '#FFFF44',
    baseHp: 1000, baseDamage: 20, baseSpeed: 1.4, radius: 35,
    xpValue: 120, scoreValue: 300,
    behavior: 'boss_pulse', isBoss: true,
  },
  boss_rift: {
    name: 'Le Dévoreur', short: 'DÉV', color: '#FF0066',
    baseHp: 1500, baseDamage: 25, baseSpeed: 2.0, radius: 40,
    xpValue: 200, scoreValue: 500,
    behavior: 'boss_rift', isBoss: true, isFinal: true,
  },
  boss_prophet: {
    name: 'Le Prophète', short: 'PRP', color: '#00FFD0',
    baseHp: 1200, baseDamage: 22, baseSpeed: 1.5, radius: 36,
    xpValue: 150, scoreValue: 400,
    behavior: 'boss_prophet', isBoss: true,
    special: {
      telegraphZones: true,  // zones d'anticipation
      slowProjectiles: true, // projectiles télégraphiés
    },
    desc: 'Anticipe vos mouvements et crée des zones de danger. Projette des orbes qui ralentissent.',
  },
};

// ─── Couleurs d'upgrades (synergies) ─────────────────────────────────────────
export const UPGRADE_COLORS = {
  RED:   'red',
  BLUE:  'blue',
  GREEN: 'green',
  CURSE: 'curse',
};

// ─── Phases de jeu ────────────────────────────────────────────────────────────
export const GAME_PHASES = {
  MENU:           'menu',
  SHAPE_SELECT:   'shapeSelect',
  ARENA:          'arena',
  UPGRADE_CHOICE: 'upgradeChoice',
  GAME_OVER:      'gameOver',
  VICTORY:        'victory',
  ACHIEVEMENTS:   'achievements',
  SETTINGS:       'settings',
  TALENT_TREE:    'talentTree',
};

// ─── Palette UI ───────────────────────────────────────────────────────────────
export const PALETTE = {
  bg:           '#0A0A0F',
  bgCard:       '#12121A',
  bgDark:       '#080810',
  border:       '#1E1E30',
  borderLight:  '#2A2A44',
  textPrimary:  '#E0E0F0',
  textMuted:    '#666680',
  textDim:      '#44446A',

  triangle:     '#00FFCC',
  circle:       '#FF66FF',
  hexagon:      '#66AAFF',
  shadow:       '#FF6600',
  paladin:      '#FFCC00',
  octagon:      '#00FFD0',

  chaser:       '#FF4444',
  shooter:      '#4488FF',
  blocker:      '#888899',
  boss:         '#BB44FF',
  healer:       '#44FF88',
  explosive:    '#FF8800',
  summoner:     '#CC44FF',

  upgradeRed:   '#FF4455',
  upgradeBlue:  '#4488FF',
  upgradeGreen: '#44FF88',
  upgradeCurse: '#AA22AA',

  hp:           '#44FF88',
  xp:           '#FFCC00',
  fragment:     '#FF8844',
};

// Palette daltonisme (contraste élevé)
export const PALETTE_DALTONISM = {
  ...PALETTE,
  textPrimary:  '#FFFFFF',
  textMuted:    '#B0B0B0',
  textDim:      '#888888',
  bg:           '#000000',
  bgCard:       '#181818',
  border:       '#FFFFFF',
  borderLight:  '#B0B0B0',
  triangle:     '#FFD700', // jaune vif
  circle:       '#00BFFF', // bleu vif
  hexagon:      '#00FF00', // vert vif
  shadow:       '#FF00FF', // magenta vif
  paladin:      '#FF4500', // orange vif
  chaser:       '#FF0000',
  shooter:      '#1E90FF',
  blocker:      '#A9A9A9',
  boss:         '#FFFF00',
  healer:       '#00FF00',
  explosive:    '#FFA500',
  summoner:     '#9400D3',
  upgradeRed:   '#FF0000',
  upgradeBlue:  '#0000FF',
  upgradeGreen: '#00FF00',
  upgradeCurse: '#FFD700',
  hp:           '#00FF00',
  xp:           '#FFD700',
  fragment:     '#FF00FF',
};

// ─── Méta-progression : upgrades permanents ───────────────────────────────────
export const PERMANENT_UPGRADES_CATALOG = [
  {
    id: 'premonition', name: 'Prémonition', icon: '🔮',
    desc: 'À chaque level-up, ralentit tous les ennemis pendant 2s.',
    effect: { type: 'slowOnLevelUp', amount: 0.5, duration: 2 },
    unlockCondition: { type: 'runs', value: 8, desc: '8 runs joués' }, hidden: false,
  },
  {
    id: 'perm_hp1', name: '+5 PV max', icon: '❤',
    desc: 'Commence chaque run avec 5 PV supplémentaires.',
    statBonus: { stat: 'maxHp', value: 5 },
    unlockCondition: null, hidden: false,
  },
  {
    id: 'perm_atk1', name: '+1 Attaque', icon: '⚔',
    desc: 'Dégâts de base augmentés de 1.',
    statBonus: { stat: 'attack', value: 1 },
    unlockCondition: null, hidden: false,
  },
  {
    id: 'perm_def1', name: '+1 Défense', icon: '🛡',
    desc: 'Réduit les dégâts reçus de 1 point.',
    statBonus: { stat: 'defense', value: 1 },
    unlockCondition: null, hidden: false,
  },
  {
    id: 'perm_spd1', name: '+Vitesse', icon: '💨',
    desc: '+0.3 de vitesse de déplacement.',
    statBonus: { stat: 'speed', value: 0.3 },
    unlockCondition: null, hidden: false,
  },
  {
    id: 'perm_hp2', name: '+8 PV max', icon: '💗',
    desc: '+8 PV de départ.',
    statBonus: { stat: 'maxHp', value: 8 },
    unlockCondition: { type: 'runs', value: 3, desc: '3 runs joués' }, hidden: false,
  },
  {
    id: 'perm_atk2', name: '+2 Attaque', icon: '🗡',
    desc: '+2 ATK.',
    statBonus: { stat: 'attack', value: 2 },
    unlockCondition: { type: 'runs', value: 6, desc: '6 runs joués' }, hidden: false,
  },
  {
    id: 'perm_def2', name: '+2 Défense', icon: '🔰',
    desc: '+2 DEF.',
    statBonus: { stat: 'defense', value: 2 },
    unlockCondition: { type: 'runs', value: 12, desc: '12 runs joués' }, hidden: false,
  },
  {
    id: 'perm_hp3', name: '+12 PV max', icon: '💖',
    desc: '+12 PV.',
    statBonus: { stat: 'maxHp', value: 12 },
    unlockCondition: { type: 'runs', value: 12, desc: '12 runs joués' }, hidden: false,
  },
  {
    id: 'perm_slayer', name: 'Tueur +1 ATK', icon: '🩸',
    desc: '+1 ATK. L\'expérience du combat te forge.',
    statBonus: { stat: 'attack', value: 1 },
    unlockCondition: { type: 'kills', value: 20, desc: '20 ennemis tués' }, hidden: false,
  },
  {
    id: 'perm_slayer2', name: '+2 ATK', icon: '☠',
    desc: '+2 ATK. Le Breach t\'a endurci.',
    statBonus: { stat: 'attack', value: 2 },
    unlockCondition: { type: 'kills', value: 100, desc: '100 ennemis tués' }, hidden: true,
  },
  {
    id: 'perm_victor', name: '+10 PV', icon: '🏆',
    desc: '+10 PV max. Première victoire.',
    statBonus: { stat: 'maxHp', value: 10 },
    unlockCondition: { type: 'wins', value: 1, desc: 'Survivre 5 minutes' }, hidden: false,
  },
  {
    id: 'perm_veteran', name: '+3 ATK', icon: '🔥',
    desc: '+3 ATK. Maîtrise au fil des victoires.',
    statBonus: { stat: 'attack', value: 3 },
    unlockCondition: { type: 'wins', value: 3, desc: 'Survivre 5 min × 3' }, hidden: false,
  },
  {
    id: 'perm_pierce', name: '+2 ATK', icon: '🔱',
    desc: '+2 ATK. Maîtrise de l\'Assassin.',
    statBonus: { stat: 'attack', value: 2 },
    unlockCondition: { type: 'shape_win', shape: 'triangle', desc: 'Gagner avec l\'Assassin' }, hidden: false,
  },
  {
    id: 'perm_aura', name: '+6 PV', icon: '🔮',
    desc: '+6 PV max. Maîtrise de l\'Arcaniste.',
    statBonus: { stat: 'maxHp', value: 6 },
    unlockCondition: { type: 'shape_win', shape: 'circle', desc: 'Gagner avec l\'Arcaniste' }, hidden: false,
  },
  {
    id: 'perm_fortress', name: '+2 DEF', icon: '🏰',
    desc: '+2 DEF. Maîtrise du Colosse.',
    statBonus: { stat: 'defense', value: 2 },
    unlockCondition: { type: 'shape_win', shape: 'hexagon', desc: 'Gagner avec le Colosse' }, hidden: false,
  },
];
