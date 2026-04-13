# BREACH — Auto-Battle Survivor

**BREACH** est un jeu mobile auto-battle temps réel (style Vampire Survivors) dérivé de [RIFT](https://github.com/Kilanga/RIFT).

## Concept

Le personnage se déplace via un joystick virtuel, attaque automatiquement en boucle, et les ennemis arrivent en vagues croissantes. À chaque level-up, le joueur choisit un upgrade parmi 3 options.

**Objectif** : Survivre 5 minutes contre des vagues d'ennemis de plus en plus nombreuses.

---

## Stack technique

- **React Native / Expo** (~54)
- **Zustand** (store + persistence AsyncStorage)
- **react-native-svg** (rendu 2D de l'arène)
- **react-native-safe-area-context**

---

## Architecture

```
/
├── App.jsx                    # Routage basé sur les phases du store
├── constants.js               # Classes, ennemis, palette, phases
├── systems/
│   ├── gameLoop.js            # Boucle temps réel (requestAnimationFrame)
│   ├── waveSystem.js          # Config des vagues d'ennemis
│   ├── attackSystem.js        # Attaques automatiques par classe
│   └── upgradeSystem.js       # Système d'upgrades (adapté de RIFT)
├── store/
│   ├── gameStore.js           # Store Zustand principal
│   └── slices/
│       ├── navigationSlice.js # Phases de jeu
│       └── metaSlice.js       # Méta-progression (persistée)
├── screens/
│   ├── MenuScreen.jsx
│   ├── ShapeSelectScreen.jsx  # Sélection de classe
│   ├── ArenaScreen.jsx        # Jeu temps réel (game loop + renderer)
│   ├── UpgradeChoiceScreen.jsx # 3 cartes d'upgrade au level-up
│   ├── GameOverScreen.jsx
│   ├── VictoryScreen.jsx
│   ├── AchievementsScreen.jsx
│   ├── TalentTreeScreen.jsx   # Améliorations permanentes
│   └── SettingsScreen.jsx
└── components/
    ├── game/
    │   ├── ArenaRenderer.jsx  # SVG : joueur, ennemis, projectiles, particules
    │   ├── VirtualJoystick.jsx
    │   └── HUD.jsx            # HP, XP, timer, kills
    └── ui/
        └── UpgradeCard.jsx
```

---

## Classes

| Classe | Type d'attaque | Particularité |
|--------|---------------|---------------|
| **Assassin** (▲) | Projectile linéaire (pierce) | Traverse les ennemis |
| **Arcaniste** (●) | AoE circulaire | Explose autour du joueur |
| **Colosse** (⬡) | Aura de contact | Dégâts en continu aux ennemis proches |
| **Ombre** (◆) | Projectile — premier coup ×2 | Reset embuscade toutes les 4s |
| **Paladin** (✦) | Frappe radiale (8 projectiles) | Régénération passive |

---

## Ennemis

| Type | Comportement |
|------|-------------|
| Écumeur | Fonce sur le joueur |
| Tirailleur | Maintient la distance, tire |
| Titan | Lent mais très résistant |
| Guérisseur | Soigne ses alliés, fuit le joueur |
| Explosif | Explose à la mort |
| Invocateur | Invoque des Écumeurs |
| Boss (×5) | Chaque minute, pattern unique |

---

## Upgrades (adaptés de RIFT)

3 couleurs + malédictions :
- 🔴 **Rouge** — offensif (ATQ, critiques, AoE, brûlure)
- 🔵 **Bleu** — défensif / utilitaire (DEF, esquive, bouclier, gel)
- 🟢 **Vert** — soin / survie (PV, régén, vol de vie)
- ☠ **Malédiction** — effets négatifs, risque/récompense

---

## Installation

```bash
npm install
npx expo start
```

Configurer `.env` (optionnel, pour le leaderboard Supabase) :
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Progression

- **Run** : chaque partie dure jusqu'à 5 minutes (victoire) ou la mort
- **XP** : gagnée en tuant des ennemis → level-up → choix d'upgrade
- **Fragments du Rift** : gagnés en fin de run → améliorations permanentes
- **Talents** : arbre de talents persistant avec déblocages par condition

---

*Dérivé de [RIFT](https://github.com/Kilanga/RIFT) — Kilanga*