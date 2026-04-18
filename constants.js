  // ─── Leaderboard avancé (filtres, modes, mutations, etc.) ───────────────
  export const ADVANCED_LEADERBOARD = {
    filters: [
      { id: 'class', name: 'Classe', options: ['triangle','circle','hexagon','shadow','paladin','octagon','engineer','spectre','pyromancer'] },
      { id: 'mutation', name: 'Mutation', options: [] },
      { id: 'weekly', name: 'Défi hebdo', options: [] },
      { id: 'mode', name: 'Mode', options: ['standard','endless','prestige','hard'] },
    ],
    columns: [
      { id: 'player', name: 'Joueur' },
      { id: 'score', name: 'Score' },
      { id: 'time', name: 'Temps' },
      { id: 'class', name: 'Classe' },
      { id: 'mutations', name: 'Mutations' },
      { id: 'date', name: 'Date' },
    ],
    sortOptions: [
      { id: 'score', name: 'Score' },
      { id: 'time', name: 'Temps' },
      { id: 'date', name: 'Date' },
    ],
  };
  // ─── Succès cachés / secondaires ───────────────
  export const HIDDEN_ACHIEVEMENTS = [
    {
      id: 'secret_room',
      title: 'Salle Secrète',
      desc: 'Découvre la salle secrète de l’arène.',
      icon: '🕳️',
      hidden: true,
      condition: { type: 'secret_found' },
      reward: { type: 'cosmetic', id: 'arena_night' },
    },
    {
      id: 'no_damage_boss',
      title: 'Intouchable',
      desc: 'Vaincre un boss sans subir de dégâts.',
      icon: '🛡️',
      hidden: true,
      condition: { type: 'boss_win_no_damage' },
      reward: { type: 'fragments', amount: 10 },
    },
    // Ajoute d’autres succès cachés ici…
  ];
  // ─── Classes évolutives (spécialisations en run) ───────────────
  export const EVOLVING_CLASSES = [
    {
      base: 'triangle',
      evolutions: [
        {
          id: 'triangle_shadow',
          name: 'Assassin de l’Ombre',
          desc: 'Spécialisation furtive : +30% dégâts en embuscade, invisibilité 2s après chaque kill.',
          unlock: { type: 'run_count', value: 10 },
          icon: '🌑',
          effect: { type: 'ambush_bonus', value: 0.3, invis_duration: 2 },
        },
        {
          id: 'triangle_blade',
          name: 'Maître Lame',
          desc: 'Spécialisation offensive : +2 ATQ, +10% vitesse.',
          unlock: { type: 'upgrade', id: 'tranchant' },
          icon: '🗡️',
          effect: { type: 'attack_speed', attack: 2, speed: 0.1 },
        },
      ],
    },
    // Ajoute d’autres évolutions/classes ici…
  ];
  // ─── Nouveaux ennemis & boss à débloquer ───────────────
  export const ENEMY_CATALOG = [
    {
      id: 'golem_ancient',
      name: 'Golem Ancien',
      desc: 'Un colosse de pierre qui charge et provoque des séismes.',
      icon: '🪨',
      baseStats: { hp: 300, damage: 18, speed: 1.1 },
      behavior: 'charge',
      unlock: { type: 'victory_count', value: 5 },
      isBoss: false,
    },
    {
      id: 'hydra',
      name: 'Hydre',
      desc: 'Boss à plusieurs têtes, chaque tête coupée en fait repousser deux.',
      icon: '🐉',
      baseStats: { hp: 1200, damage: 22, speed: 1.5 },
      behavior: 'hydra_boss',
      unlock: { type: 'achievement', id: 'legendary' },
      isBoss: true,
    },
    // Ajoute d’autres ennemis/boss ici…
  ];
  // ─── Progression meta : talents & artefacts permanents ───────────────
  export const TALENTS = [
    {
      id: 'talent_hp',
      name: 'Vitalité',
      desc: '+10 PV max pour toutes les runs.',
      icon: '❤️',
      cost: 5,
      effect: { type: 'max_hp', value: 10 },
      maxLevel: 5,
    },
    {
      id: 'talent_attack',
      name: 'Force',
      desc: '+1 ATQ pour toutes les runs.',
      icon: '💪',
      cost: 4,
      effect: { type: 'attack', value: 1 },
      maxLevel: 10,
    },
    {
      id: 'talent_speed',
      name: 'Célérité',
      desc: '+0.1 Vitesse pour toutes les runs.',
      icon: '⚡',
      cost: 4,
      effect: { type: 'speed', value: 0.1 },
      maxLevel: 10,
    },
    // Ajoute d’autres talents ici…
  ];

  export const ARTIFACTS = [
    {
      id: 'artifact_lifesteal',
      name: 'Sceau du Vampire',
      desc: 'Vol de vie permanent : 5% des dégâts infligés soignent le joueur.',
      icon: '🩸',
      unlock: { type: 'achievement', id: 'masochist' },
      effect: { type: 'lifesteal', value: 0.05 },
    },
    {
      id: 'artifact_fragments',
      name: 'Pierre du Rift',
      desc: 'Gagne 1 fragment supplémentaire à chaque victoire.',
      icon: '💎',
      unlock: { type: 'victory_count', value: 10 },
      effect: { type: 'fragments_bonus', value: 1 },
    },
    // Ajoute d’autres artefacts ici…
  ];
  // ─── Reliques (objets uniques à collecter pendant la run) ───────────────
  export const RELICS = [
    {
      id: 'relic_attack',
      name: 'Griffe du Prédateur',
      desc: '+20% dégâts infligés pendant la run.',
      icon: '🦴',
      effect: { type: 'attack_mult', value: 1.2 },
      rarity: 'rare',
    },
    {
      id: 'relic_regen',
      name: 'Pierre de Vie',
      desc: 'Régénère 1 PV/s en continu.',
      icon: '💚',
      effect: { type: 'regen', value: 1 },
      rarity: 'common',
    },
    {
      id: 'relic_xp',
      name: 'Médaillon d’Expérience',
      desc: '+30% XP gagnée.',
      icon: '📿',
      effect: { type: 'xp_mult', value: 1.3 },
      rarity: 'rare',
    },
    {
      id: 'relic_shield',
      name: 'Écu Ancien',
      desc: 'Bouclier qui bloque le premier coup fatal.',
      icon: '🛡️',
      effect: { type: 'one_time_shield' },
      rarity: 'epic',
    },
    // Ajoute d’autres reliques ici…
  ];
  // ...
/**
 * BREACH — Constantes globales
 * Dérivé de RIFT — adapté pour le mode auto-battle temps réel (Vampire Survivors)
 */

// ─── Localisation (i18n) ────────────────────────────────────────────────────
export const LANGUAGES = ['fr', 'en'];
export const DEFAULT_LANGUAGE = 'fr';
export const I18N = {
  fr: {
      pause_title: 'PAUSE',
      pause_resume: 'Reprendre',
      pause_restart: 'Recommencer',
      pause_quit: 'Quitter vers menu',
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
    // Ajouts pour l'écran d'upgrade
    upgrade_level: 'Niveau',
    upgrade_choose: 'Choisissez un upgrade',
    upgrade_none: 'Aucune amélioration disponible',
    upgrade_limit: 'Tu as atteint la limite des upgrades disponibles pour cette run.',
    continue: 'Continuer',
    // Ajouts ShapeSelectScreen et modes de jeu
    back_menu: '← Menu',
    shapeselect_title: 'Choisir une classe',
    shapeselect_history: 'Historique :',
    shapeselect_start: '▶ LANCER LE RUN',
    shapeselect_locked: '🔒 CLASSE VERROUILLÉE',
    shapeselect_unlock: '🔓 DÉBLOQUER',
    shapeselect_insufficient: 'Fragments insuffisants',
    shapeselect_fragments_required: 'fragments requis',
    shapeselect_you_have: 'Vous avez',
    stat_hp: 'PV',
    stat_attack: 'ATQ',
    stat_defense: 'DEF',
    stat_speed: 'Vitesse',
    stat_cooldown: 'Cooldown',
    mode_standard: '⏱ Standard (5 min)',
    mode_endless: '∞ Infini',
    mode_prestige: '★ Prestige',
    mode_hard: '🔥 Difficile',
      achievements_title: 'Succès',
      achievement_first_run_title: 'Première Brèche',
      achievement_first_run_desc: 'Terminer un premier run.',
      achievement_survivor_title: '2 minutes',
      achievement_survivor_desc: 'Survivre 2 minutes.',
      achievement_slayer_title: 'Massacreur',
      achievement_slayer_desc: 'Tuer 100 ennemis au total.',
      achievement_winner_title: 'Survivant',
      achievement_winner_desc: 'Survivre 5 minutes entières.',
      achievement_veteran_title: 'Vétéran',
      achievement_veteran_desc: '10 runs joués.',
      achievement_assassin_w_title: 'Maîtrise Assassin',
      achievement_assassin_w_desc: 'Gagner avec l\'Assassin.',
      achievement_arcanist_w_title: 'Maîtrise Arcaniste',
      achievement_arcanist_w_desc: 'Gagner avec l\'Arcaniste.',
      achievement_colossus_w_title: 'Maîtrise Colosse',
      achievement_colossus_w_desc: 'Gagner avec le Colosse.',
      achievement_all_classes_title: 'Touche à tout',
      achievement_all_classes_desc: 'Jouer avec les 5 classes.',
      achievement_speedrun_title: 'Speedrunner',
      achievement_speedrun_desc: '5 min sans mourir.',
      achievement_masochist_title: 'Masochiste',
      achievement_masochist_desc: 'Prendre une malédiction.',
      achievement_legendary_title: 'Légende',
      achievement_legendary_desc: 'Gagner 3 fois.',
    tutorial_0_title: 'Bienvenue dans BREACH!',
    tutorial_0_desc: 'Survis le plus longtemps possible dans l’arène. Déplace-toi, évite les ennemis et collecte l’XP pour devenir plus fort.',
    tutorial_1_title: 'Déplacement',
    tutorial_1_desc: 'Utilise le joystick virtuel pour déplacer ton personnage dans l’arène.',
    tutorial_2_title: 'Attaque automatique',
    tutorial_2_desc: 'Ton personnage attaque automatiquement les ennemis proches. Améliore tes stats et choisis des upgrades pour survivre.',
    tutorial_3_title: 'Upgrades',
    tutorial_3_desc: 'À chaque level-up, choisis une amélioration parmi 3 options. Combine les synergies de couleur pour des bonus puissants.',
    tutorial_4_title: 'Boss & Vagues',
    tutorial_4_desc: 'Des boss apparaissent régulièrement. Prépare-toi à leurs patterns uniques et reste mobile!',
    tutorial_5_title: 'Bonne chance!',
    tutorial_5_desc: 'Découvre toutes les classes, upgrades et secrets du Breach. À toi de jouer!',
    tutorial_prev: ‘Précédent’,
    tutorial_next: ‘Suivant’,
    tutorial_end: ‘Terminer’,
    tutorial_title: ‘Comment jouer’,
    tutorial_move: ‘Déplace ton personnage avec le joystick à gauche.’,
    tutorial_attack: ‘Ton personnage attaque automatiquement les ennemis proches.’,
    tutorial_orbs: ‘Récupère les orbes d’XP pour gagner des niveaux.’,
    tutorial_win: ‘Survis, améliore-toi, et bats les boss pour gagner !’,
    tutorial_dismiss: ‘Touchez pour fermer’,
    // GameOver
    gameover_title: ‘MORT’,
    gameover_sub: "Le Breach t’a consumé...",
    gameover_replay: ‘🔄 Rejouer’,
    // Victory
    victory_title: ‘VICTOIRE !’,
    victory_sub: ‘Tu as survécu au Breach !’,
    victory_replay: ‘🔄 Rejouer’,
    victory_fragments: ‘⬆ Nouveaux fragments gagnés !’,
    victory_fragments_hint: "Débloquez des améliorations permanentes dans l’arbre des talents.",
    // Stats partagées GameOver / Victory
    stat_survival_time: ‘Temps de survie’,
    stat_score: ‘Score’,
    stat_level: ‘Niveau atteint’,
    stat_kills: ‘Ennemis tués’,
    stat_class: ‘Classe’,
    stat_best_time: ‘🏆 Meilleur temps’,
    stat_best_score: ‘🥇 Meilleur score’,
    // Settings
    settings_title: ‘Paramètres’,
    settings_audio: ‘Audio’,
    settings_music: ‘Musique’,
    settings_sfx: ‘Effets sonores’,
    settings_accessibility: ‘Accessibilité’,
    settings_colorblind: ‘Mode daltonisme’,
    settings_largetext: ‘Texte agrandi’,
    settings_progression: ‘Progression’,
    settings_total_runs: ‘Runs totaux’,
    settings_total_kills: ‘Kills totaux’,
    settings_total_wins: ‘Victoires’,
    settings_version: ‘BREACH v1.0 · Kilanga © 2025’,
    // Talent Tree
    talenttree_title: ‘Améliorations Permanentes’,
    talenttree_fragments: ‘Fragments du Rift’,
    talenttree_hint: ‘Les fragments sont gagnés en fin de run (1 toutes les 10s + 1/kill, divisé par 5).’,
    talenttree_available: ‘Débloqué !’,
    talenttree_locked: ‘Verrouillé’,
    // Tutorial overlay
    tutorial_ok: ‘OK’,
    // Upgrade
    upgrade_recommend: ‘Build conseillé’,
  },
  en: {
      pause_title: 'PAUSE',
      pause_resume: 'Resume',
      pause_restart: 'Restart',
      pause_quit: 'Quit to menu',
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
    // Additions for upgrade screen
    upgrade_level: 'Level',
    upgrade_choose: 'Choose an upgrade',
    upgrade_none: 'No upgrade available',
    upgrade_limit: 'You have reached the upgrade limit for this run.',
    continue: 'Continue',
    // Additions ShapeSelectScreen and game modes
    back_menu: '← Menu',
    shapeselect_title: 'Choose a class',
    shapeselect_history: 'History:',
    shapeselect_start: '▶ START RUN',
    shapeselect_locked: '🔒 CLASS LOCKED',
    shapeselect_unlock: '🔓 UNLOCK',
    shapeselect_insufficient: 'Not enough fragments',
    shapeselect_fragments_required: 'fragments required',
    shapeselect_you_have: 'You have',
    stat_hp: 'HP',
    stat_attack: 'ATK',
    stat_defense: 'DEF',
    stat_speed: 'Speed',
    stat_cooldown: 'Cooldown',
    mode_standard: '⏱ Standard (5 min)',
    mode_endless: '∞ Endless',
    mode_prestige: '★ Prestige',
    mode_hard: '🔥 Hard',
      achievements_title: 'Achievements',
      achievement_first_run_title: 'First Breach',
      achievement_first_run_desc: 'Complete your first run.',
      achievement_survivor_title: '2 minutes',
      achievement_survivor_desc: 'Survive 2 minutes.',
      achievement_slayer_title: 'Slayer',
      achievement_slayer_desc: 'Kill 100 enemies in total.',
      achievement_winner_title: 'Survivor',
      achievement_winner_desc: 'Survive 5 full minutes.',
      achievement_veteran_title: 'Veteran',
      achievement_veteran_desc: 'Play 10 runs.',
      achievement_assassin_w_title: 'Assassin Mastery',
      achievement_assassin_w_desc: 'Win with the Assassin.',
      achievement_arcanist_w_title: 'Arcanist Mastery',
      achievement_arcanist_w_desc: 'Win with the Arcanist.',
      achievement_colossus_w_title: 'Colossus Mastery',
      achievement_colossus_w_desc: 'Win with the Colossus.',
      achievement_all_classes_title: 'Jack of All Trades',
      achievement_all_classes_desc: 'Play with all 5 classes.',
      achievement_speedrun_title: 'Speedrunner',
      achievement_speedrun_desc: '5 min without dying.',
      achievement_masochist_title: 'Masochist',
      achievement_masochist_desc: 'Take a curse.',
      achievement_legendary_title: 'Legend',
      achievement_legendary_desc: 'Win 3 times.',
    tutorial_0_title: 'Welcome to BREACH!',
    tutorial_0_desc: 'Survive as long as possible in the arena. Move, dodge enemies, and collect XP to grow stronger.',
    tutorial_1_title: 'Movement',
    tutorial_1_desc: 'Use the virtual joystick to move your character around the arena.',
    tutorial_2_title: 'Auto Attack',
    tutorial_2_desc: 'Your character attacks nearby enemies automatically. Upgrade your stats and choose upgrades to survive.',
    tutorial_3_title: 'Upgrades',
    tutorial_3_desc: 'At each level-up, choose one of 3 upgrades. Combine color synergies for powerful bonuses.',
    tutorial_4_title: 'Bosses & Waves',
    tutorial_4_desc: 'Bosses appear regularly. Prepare for their unique patterns and keep moving!',
    tutorial_5_title: 'Good luck!',
    tutorial_5_desc: 'Discover all classes, upgrades, and secrets of the Breach. It’s your turn to play!',
    tutorial_prev: 'Previous',
    tutorial_next: 'Next',
    tutorial_end: 'Finish',
    tutorial_title: 'How to play',
    tutorial_move: 'Move your character with the joystick on the left.',
    tutorial_attack: 'Your character attacks nearby enemies automatically.',
    tutorial_orbs: 'Collect XP orbs to level up.',
    tutorial_win: 'Survive, upgrade, and defeat bosses to win!',
    tutorial_dismiss: 'Tap to close',
    // GameOver
    gameover_title: 'DEAD',
    gameover_sub: 'The Breach consumed you...',
    gameover_replay: '🔄 Play again',
    // Victory
    victory_title: 'VICTORY!',
    victory_sub: 'You survived the Breach!',
    victory_replay: '🔄 Play again',
    victory_fragments: '⬆ New fragments earned!',
    victory_fragments_hint: 'Unlock permanent upgrades in the talent tree.',
    // Shared stats GameOver / Victory
    stat_survival_time: 'Survival time',
    stat_score: 'Score',
    stat_level: 'Level reached',
    stat_kills: 'Enemies killed',
    stat_class: 'Class',
    stat_best_time: '🏆 Best time',
    stat_best_score: '🥇 Best score',
    // Settings
    settings_title: 'Settings',
    settings_audio: 'Audio',
    settings_music: 'Music',
    settings_sfx: 'Sound effects',
    settings_accessibility: 'Accessibility',
    settings_colorblind: 'Colorblind mode',
    settings_largetext: 'Large text',
    settings_progression: 'Progression',
    settings_total_runs: 'Total runs',
    settings_total_kills: 'Total kills',
    settings_total_wins: 'Victories',
    settings_version: 'BREACH v1.0 · Kilanga © 2025',
    // Talent Tree
    talenttree_title: 'Permanent Upgrades',
    talenttree_fragments: 'Rift Fragments',
    talenttree_hint: 'Fragments are earned at the end of runs (1 every 10s + 1/kill, divided by 5).',
    talenttree_available: 'Unlocked!',
    talenttree_locked: 'Locked',
    // Tutorial overlay
    tutorial_ok: 'OK',
    // Upgrade
    upgrade_recommend: 'Recommended Build',
  },
};

// ─── Cosmétiques & Boutique ────────────────────────────────────────────────
export const COSMETICS = [
    {
      id: 'player_red',
      name: 'Apparence Rouge',
      type: 'player_skin',
      desc: 'Change la couleur du joueur en rouge vif.',
      price: 60,
      icon: '🔴',
    },
    {
      id: 'player_shadow',
      name: 'Ombre',
      type: 'player_skin',
      desc: 'Apparence sombre et mystérieuse.',
      price: 150,
      icon: '⚫',
    },
    {
      id: 'arena_sunset',
      name: 'Arène Crépuscule',
      type: 'arena_skin',
      desc: 'Thème orange et violet pour l’arène.',
      price: 90,
      icon: '🌇',
    },
    {
      id: 'trail_fire',
      name: 'Trainée de Feu',
      type: 'trail',
      desc: 'Laisse une traînée de flammes derrière le joueur.',
      price: 110,
      icon: '🔥',
    },
    {
      id: 'trail_stars',
      name: 'Trainée Étoilée',
      type: 'trail',
      desc: 'Des étoiles scintillent derrière le joueur.',
      price: 130,
      icon: '✨',
    },
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
// ─── Défis hebdomadaires (weekly challenges) ───────────────
export const WEEKLY_EVENTS = [
  {
    id: 'double_xp',
    name: 'Double XP',
    desc: 'Tous les XP gagnés sont doublés cette semaine.',
    icon: '⚡',
    effect: { type: 'xp_mult', value: 2 },
    challenge: null,
  },
  {
    id: 'fast_enemies',
    name: 'Ennemis rapides',
    desc: 'Les ennemis se déplacent 30% plus vite cette semaine.',
    icon: '💨',
    effect: { type: 'enemy_speed', value: 1.3 },
    challenge: null,
  },
  {
    id: 'no_heal',
    name: 'Interdiction de soin',
    desc: 'Aucun soin possible pendant la run.',
    icon: '🚫💚',
    effect: { type: 'no_heal' },
    challenge: { type: 'disable_heal' },
  },
  {
    id: 'giant_bosses',
    name: 'Boss géants',
    desc: 'Tous les boss sont deux fois plus gros et plus puissants.',
    icon: '👹',
    effect: { type: 'boss_size_mult', value: 2 },
    challenge: { type: 'boss_buff', size: 2, hp: 2, damage: 1.5 },
  },
  // Ajoute d’autres défis ici…
];

// ─── Arène ────────────────────────────────────────────────────────────────────
export const ARENA_WIDTH  = 1400;   // largeur logique de l'arène (pixels)
export const ARENA_HEIGHT = 1400;   // hauteur logique de l'arène
export const PLAYER_RADIUS = 16;
export const BASE_ENEMY_RADIUS = 14;

// ─── Game loop ─────────────────────────────────────────────────────────────────
// ─── Événements aléatoires en partie ───────────────────────────────────────────
export const RANDOM_EVENTS = [
  {
    id: 'meteor_shower',
    name: 'Pluie de météores',
    desc: 'Des météores s’abattent sur l’arène, infligeant des dégâts aléatoires.',
    effect: { type: 'meteor', damage: 15, count: 8 },
  },
  {
    id: 'healing_wave',
    name: 'Vague de soin',
    desc: 'Tous les joueurs récupèrent 30% de leurs PV manquants.',
    effect: { type: 'heal_percent', value: 0.3 },
  },
  {
    id: 'golden_xp',
    name: 'Pluie d’XP',
    desc: 'Des orbes d’XP apparaissent partout dans l’arène.',
    effect: { type: 'spawn_xp', amount: 20 },
  },
  {
    id: 'berserk_enemies',
    name: 'Ennemis enragés',
    desc: 'Tous les ennemis gagnent +50% vitesse et dégâts pendant 10s.',
    effect: { type: 'enemy_buff', speed: 1.5, attack: 1.5, duration: 10 },
  },
  {
    id: 'mini_boss',
    name: 'Mini-Boss',
    desc: 'Un mini-boss apparaît au centre de l’arène.',
    effect: { type: 'spawn_miniboss' },
  },
];
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
export const PLAYER_CLASSES = {
  TRIANGLE: 'triangle', // Assassin  — projectile linéaire (pierce)
  CIRCLE:   'circle',   // Arcaniste — AoE circulaire
  HEXAGON:  'hexagon',  // Colosse   — zone au contact
  SHADOW:   'shadow',   // Ombre     — embuscade (premier projectile ×2)
  PALADIN:  'paladin',  // Paladin   — aura + frappe radiale
  OCTAGON:  'octagon',  // Oracle    — onde de prémonition
  ENGINEER: 'engineer', // Ingénieur — pose des tourelles
  SPECTRE:  'spectre',  // Spectre   — traverse les ennemis, invulnérable 1s après chaque kill
  PYROMANCER: 'pyromancer', // Pyromancien — attaque en cône de feu, brûle les ennemis
};

export const CLASS_INFO = {
      spectre: {
        name: 'Spectre', short: 'SPC', color: '#B388FF',
        baseStats: { maxHp: 70, attack: 8, defense: 3, speed: 3.2 },
        special: {
          desc: 'Traverse les ennemis et devient invulnérable 1s après chaque kill.',
          ability: 'ghost_dash',
        },
        unlock: { type: 'kills', value: 500, desc: 'Tuer 500 ennemis' },
      },
      pyromancer: {
        name: 'Pyromancien', short: 'PYR', color: '#FF7043',
        baseStats: { maxHp: 85, attack: 7, defense: 4, speed: 2.7 },
        special: {
          desc: 'Attaque en cône de feu, brûle les ennemis touchés.',
          ability: 'fire_cone',
        },
        unlock: { type: 'runs', value: 20, desc: 'Jouer 20 runs' },
      },
    engineer: {
      name: 'Ingénieur', short: 'ING', color: '#7EC8E3',
      baseStats: { maxHp: 90, attack: 7, defense: 5, speed: 2.6 },
      attackType: 'turret', // pose des tourelles
      attackCooldown: 2.5,  // pose une tourelle toutes les 2.5s
      turretCount: 2,       // nombre de tourelles actives max (scalable)
      turretLifetime: 8,    // durée de vie d'une tourelle (s)
      turretRange: 140,     // portée d'attaque des tourelles
      turretAttack: 6,      // dégâts des tirs de tourelle
      turretCooldown: 1.1,  // délai entre tirs de tourelle
      desc: 'Pose automatiquement des tourelles qui tirent sur les ennemis proches.',
      locked: true,
      purchasable: true,
      purchaseCost: 35,
    },
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
  TRACKER:       'tracker',
  VAMPIRE:       'vampire',
  BOSS_VOID:     'boss_void',
  BOSS_CINDER:   'boss_cinder',
  BOSS_MIRROR:   'boss_mirror',
  BOSS_PULSE:    'boss_pulse',
  BOSS_RIFT:     'boss_rift',
  BOSS_PROPHET:  'boss_prophet',
  SPECTRE_ZIGZAG: 'spectre_zigzag',
  BOSS_ARCHITECT: 'boss_architect',
  BOSS_AMALGAM:   'boss_amalgam',
  // Nouveaux ennemis
  SPEEDSTER:      'speedster',
  TANK:           'tank',
  SNIPER:         'sniper',
};

export const ENEMY_INFO = {
  boss_amalgam: {
    name: "L'Amalgame", short: 'AML', color: '#FF6600',
    baseHp: 2400, baseDamage: 28, baseSpeed: 1.3, radius: 40,
    xpValue: 260, scoreValue: 750,
    behavior: 'boss_amalgam', isBoss: true,
    desc: "Absorbe une partie des dégâts reçus. Mute et accélère sous 40% de vie.",
  },
  boss_architect: {
        name: "L'Architecte", short: 'ARC', color: '#FFD700',
        baseHp: 1800, baseDamage: 24, baseSpeed: 1.1, radius: 38,
        xpValue: 220, scoreValue: 600,
        behavior: 'boss_architect', isBoss: true,
        special: {
          energyWalls: true, // crée des murs d'énergie
          summonSpectres: true, // invoque des Spectres Zigzag
        },
        desc: "Crée des murs d'énergie qui traversent l'arène et invoque des Spectres Zigzag.",
      },
    spectre_zigzag: {
      name: 'Spectre Zigzag', short: 'SPZ', color: '#66CCFF',
      baseHp: 22, baseDamage: 7, baseSpeed: 2.0, radius: 13,
      xpValue: 9, scoreValue: 18,
      behavior: 'zigzag', // fonce vers le joueur, zigzague toutes les 1.5s
      zigzagInterval: 1.5, zigzagDistance: 60,
      ghost: true, // peut traverser les autres ennemis
      trail: true, // laisse une traînée visuelle
    },
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
    behavior: 'shooter', // maintient la distance, tire
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
    behavior: 'summon',
    summonInterval: 4, summonCount: 2,
  },
  tracker: {
    name: 'Traqueur', short: 'TRQ', color: '#FF6688',
    baseHp: 35, baseDamage: 8, baseSpeed: 1.8, radius: 13,
    xpValue: 10, scoreValue: 20,
    behavior: 'tracker', // se dirige vers la dernière position connue du joueur
  },
  vampire: {
    name: 'Vampire', short: 'VAM', color: '#AA2244',
    baseHp: 50, baseDamage: 12, baseSpeed: 1.5, radius: 15,
    xpValue: 14, scoreValue: 28,
    behavior: 'chase',
    lifeStealOnHit: 8, // se soigne en touchant le joueur
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
  // --- Nouveaux ennemis ---
  speedster: {
    name: 'Sprinteur', short: 'SPR', color: '#00E0FF',
    baseHp: 16, baseDamage: 6, baseSpeed: 3.5, radius: 12,
    xpValue: 7, scoreValue: 14,
    behavior: 'chase', // fonce très vite sur le joueur
    special: { dash: true },
    desc: 'Très rapide, faible PV.'
  },
  tank: {
    name: 'Blindé', short: 'BLD', color: '#555555',
    baseHp: 120, baseDamage: 12, baseSpeed: 0.7, radius: 22,
    xpValue: 20, scoreValue: 40,
    behavior: 'chase', // lent mais très résistant
    special: { armor: true },
    desc: 'Très résistant, lent, difficile à tuer.'
  },
  sniper: {
    name: 'Sniper', short: 'SNP', color: '#FFD700',
    baseHp: 22, baseDamage: 18, baseSpeed: 1.2, radius: 13,
    xpValue: 15, scoreValue: 30,
    behavior: 'shooter', // tire à très longue distance
    projectileSpeed: 7, projectileCooldown: 4.5, range: 600,
    desc: 'Tire de loin, dégâts élevés.'
  },
  // --- Bosses ---
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
  TUTORIAL:       'tutorial',
  LEADERBOARD:    'leaderboard',
};

// ─── Palette UI ───────────────────────────────────────────────────────────────
// ─── Succès & Défis ────────────────────────────────────────────────────────────
// ─── Progression globale ────────────────────────────────────────────────────────
// ─── Tutoriel interactif ──────────────────────────────────────────────────────────
// ─── Mutations/Modificateurs de run ───────────────────────────────────────────────
export const RUN_MUTATIONS = [
  {
    id: 'explosive_enemies',
    name: 'Ennemis explosifs',
    desc: 'Les ennemis explosent à leur mort, infligeant des dégâts autour d’eux.',
    effect: { type: 'enemy_explode', radius: 60, damage: 20 },
  },
  {
    id: 'fast_enemies',
    name: 'Vitesse x2',
    desc: 'Tous les ennemis se déplacent deux fois plus vite.',
    effect: { type: 'enemy_speed_mult', value: 2 },
  },
  {
    id: 'player_fragile',
    name: 'Joueur fragile',
    desc: 'Le joueur a 50% de PV max en moins.',
    effect: { type: 'player_hp_mult', value: 0.5 },
  },
  {
    id: 'xp_rain',
    name: 'Pluie d’XP',
    desc: 'Des orbes d’XP tombent régulièrement dans l’arène.',
    effect: { type: 'xp_rain', interval: 8, amount: 5 },
  },
  {
    id: 'blindness',
    name: 'Vision réduite',
    desc: 'Le champ de vision du joueur est limité.',
    effect: { type: 'vision_radius', value: 220 },
  },
  {
    id: 'double_boss',
    name: 'Boss en duo',
    desc: 'Deux boss apparaissent à chaque vague de boss.',
    effect: { type: 'boss_count', value: 2 },
  },
  {
    id: 'regen',
    name: 'Régénération',
    desc: 'Le joueur régénère 2 PV par seconde.',
    effect: { type: 'player_regen', value: 2 },
  },
  {
    id: 'curse',
    name: 'Malédiction',
    desc: 'Le joueur perd 1 PV toutes les 10 secondes.',
    effect: { type: 'player_dot', value: 1, interval: 10 },
  },
];
export const TUTORIAL_STEPS = [
  {
    title: 'Bienvenue dans BREACH!',
    desc: 'Survis le plus longtemps possible dans l’arène. Déplace-toi, évite les ennemis et collecte l’XP pour devenir plus fort.',
    icon: '👋',
  },
  {
    title: 'Déplacement',
    desc: 'Utilise le joystick virtuel pour déplacer ton personnage dans l’arène.',
    icon: '🕹️',
  },
  {
    title: 'Attaque automatique',
    desc: 'Ton personnage attaque automatiquement les ennemis proches. Améliore tes stats et choisis des upgrades pour survivre.',
    icon: '⚔️',
  },
  {
    title: 'Upgrades',
    desc: 'À chaque level-up, choisis une amélioration parmi 3 options. Combine les synergies de couleur pour des bonus puissants.',
    icon: '⬆️',
  },
  {
    title: 'Boss & Vagues',
    desc: 'Des boss apparaissent régulièrement. Prépare-toi à leurs patterns uniques et reste mobile!',
    icon: '👹',
  },
  {
    title: 'Bonne chance!',
    desc: 'Découvre toutes les classes, upgrades et secrets du Breach. À toi de jouer!',
    icon: '🌟',
  },
];
export const GLOBAL_LEVELS = [
  { level: 1, xp: 0,    reward: null },
  { level: 2, xp: 100,  reward: { type: 'fragments', amount: 5 } },
  { level: 3, xp: 250,  reward: { type: 'skin', id: 'player_red' } },
  { level: 4, xp: 500,  reward: { type: 'fragments', amount: 10 } },
  { level: 5, xp: 900,  reward: { type: 'trail', id: 'trail_fire' } },
  { level: 6, xp: 1400, reward: { type: 'skin', id: 'player_shadow' } },
  { level: 7, xp: 2000, reward: { type: 'fragments', amount: 20 } },
  { level: 8, xp: 2700, reward: { type: 'arena_skin', id: 'arena_sunset' } },
  { level: 9, xp: 3500, reward: { type: 'fragments', amount: 30 } },
  { level: 10, xp: 4500, reward: { type: 'skin', id: 'player_gold' } },
];
export const ACHIEVEMENTS_CATALOG = [
  {
    id: 'first_run',
    title: 'Première Brèche',
    desc: 'Terminer un premier run.',
    icon: '🌑',
    condition: { type: 'runs', value: 1 },
  },
  {
    id: 'survivor_2min',
    title: '2 minutes',
    desc: 'Survivre 2 minutes.',
    icon: '⏱',
    condition: { type: 'time', value: 120 },
  },
  {
    id: 'slayer_100',
    title: 'Massacreur',
    desc: 'Tuer 100 ennemis au total.',
    icon: '☠️',
    condition: { type: 'kills', value: 100 },
  },
  {
    id: 'winner_5min',
    title: 'Survivant',
    desc: 'Survivre 5 minutes entières.',
    icon: '🏆',
    condition: { type: 'time', value: 300 },
  },
  {
    id: 'veteran_10runs',
    title: 'Vétéran',
    desc: '10 runs joués.',
    icon: '🎖',
    condition: { type: 'runs', value: 10 },
  },
  {
    id: 'assassin_win',
    title: 'Maîtrise Assassin',
    desc: 'Gagner avec l’Assassin.',
    icon: '🔺',
    condition: { type: 'shape_win', shape: 'triangle' },
  },
  {
    id: 'arcanist_win',
    title: 'Maîtrise Arcaniste',
    desc: 'Gagner avec l’Arcaniste.',
    icon: '⚪',
    condition: { type: 'shape_win', shape: 'circle' },
  },
  {
    id: 'colossus_win',
    title: 'Maîtrise Colosse',
    desc: 'Gagner avec le Colosse.',
    icon: '⬡',
    condition: { type: 'shape_win', shape: 'hexagon' },
  },
  {
    id: 'all_classes',
    title: 'Touche à tout',
    desc: 'Jouer avec les 5 classes.',
    icon: '🔄',
    condition: { type: 'all_classes' },
  },
  {
    id: 'speedrun',
    title: 'Speedrunner',
    desc: '5 min sans mourir.',
    icon: '⚡',
    condition: { type: 'time', value: 300, noDeath: true },
  },
  {
    id: 'masochist',
    title: 'Masochiste',
    desc: 'Prendre une malédiction.',
    icon: '💀',
    condition: { type: 'upgrade', id: 'corruption' },
  },
  {
    id: 'legendary',
    title: 'Légende',
    desc: 'Gagner 3 fois.',
    icon: '🌟',
    condition: { type: 'wins', value: 3 },
  },
];
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
    cost: 3, unlockCondition: null, hidden: false,
  },
  {
    id: 'perm_atk1', name: '+1 Attaque', icon: '⚔',
    desc: 'Dégâts de base augmentés de 1.',
    statBonus: { stat: 'attack', value: 1 },
    cost: 4, unlockCondition: null, hidden: false,
  },
  {
    id: 'perm_def1', name: '+1 Défense', icon: '🛡',
    desc: 'Réduit les dégâts reçus de 1 point.',
    statBonus: { stat: 'defense', value: 1 },
    cost: 4, unlockCondition: null, hidden: false,
  },
  {
    id: 'perm_spd1', name: '+Vitesse', icon: '💨',
    desc: '+0.3 de vitesse de déplacement.',
    statBonus: { stat: 'speed', value: 0.3 },
    cost: 5, unlockCondition: null, hidden: false,
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
  // --- NOUVEAUX TALENTS ---
  {
    id: 'perm_lifesteal', name: 'Vol de vie', icon: '🧛',
    desc: 'Récupère 10% des dégâts infligés en PV (max 2 PV par ennemi).',
    effect: { type: 'lifesteal', percent: 0.1, cap: 2 },
    unlockCondition: { type: 'kills', value: 200, desc: '200 ennemis tués' }, hidden: false,
  },
  {
    id: 'perm_bossbane', name: 'Chasseur de Boss', icon: '👹',
    desc: '+30% de dégâts contre les boss.',
    effect: { type: 'bossDamage', percent: 0.3 },
    unlockCondition: { type: 'boss_kills', value: 3, desc: 'Vaincre 3 boss' }, hidden: false,
  },
  {
    id: 'perm_fragmaster', name: 'Maître des Fragments', icon: '💎',
    desc: 'Gagne 1 fragment supplémentaire à chaque run.',
    effect: { type: 'extraFragment', value: 1 },
    unlockCondition: { type: 'runs', value: 15, desc: '15 runs joués' }, hidden: false,
  },
  // --- BRANCHES ---
  {
    id: 'perm_offense_branch', name: 'Branche Offense', icon: '🔥',
    desc: 'Débloque des talents offensifs avancés.',
    effect: { type: 'unlockBranch', branch: 'offense' },
    unlockCondition: { type: 'attack', value: 5, desc: 'Avoir 5 ATK cumulés via talents' }, hidden: false,
  },
  {
    id: 'perm_defense_branch', name: 'Branche Défense', icon: '🛡️',
    desc: 'Débloque des talents défensifs avancés.',
    effect: { type: 'unlockBranch', branch: 'defense' },
    unlockCondition: { type: 'defense', value: 4, desc: 'Avoir 4 DEF cumulés via talents' }, hidden: false,
  },
  {
    id: 'perm_speed_branch', name: 'Branche Vitesse', icon: '⚡',
    desc: 'Débloque des talents de vitesse avancés.',
    effect: { type: 'unlockBranch', branch: 'speed' },
    unlockCondition: { type: 'speed', value: 1, desc: 'Avoir 1.0 de vitesse cumulée via talents' }, hidden: false,
  },
];
