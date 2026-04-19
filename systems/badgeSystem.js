// Système de badges/titres déblocables
export const BADGES = [
  {
    id: 'veteran',
    name: 'Vétéran',
    desc: 'Jouer 30 jours différents',
    icon: '🎖️',
    condition: meta => (meta.loginRewards?.length || 0) >= 30,
  },
  {
    id: 'killer',
    name: 'Tueur de masse',
    desc: 'Tuer 10 000 ennemis',
    icon: '💀',
    condition: meta => (meta.totalKills || 0) >= 10000,
  },
  {
    id: 'champion',
    name: 'Champion',
    desc: 'Remporter 50 victoires',
    icon: '🏆',
    condition: meta => (meta.totalWins || 0) >= 50,
  },
  {
    id: 'collector',
    name: 'Collectionneur',
    desc: 'Débloquer tous les upgrades permanents',
    icon: '🔓',
    condition: meta => (meta.permanentUpgrades?.length || 0) >= 12, // ajuster selon le catalogue
  },
  {
    id: 'weekly_master',
    name: 'Maître des défis',
    desc: 'Compléter 10 défis hebdomadaires',
    icon: '🔥',
    condition: meta => (meta.weeklyChallengeHistory?.filter(c => c.completed).length || 0) >= 10,
  },
];
