// Système de milestones (succès cumulés)
export const MILESTONES = [
  {
    id: 'kills_1000',
    desc: 'Tuer 1 000 ennemis au total',
    key: 'totalKills',
    goal: 1000,
    reward: { type: 'fragments', amount: 10 },
  },
  {
    id: 'wins_10',
    desc: 'Remporter 10 victoires',
    key: 'totalWins',
    goal: 10,
    reward: { type: 'fragments', amount: 20 },
  },
  {
    id: 'upgrades_50',
    desc: 'Obtenir 50 upgrades cumulés',
    key: 'totalUpgrades',
    goal: 50,
    reward: { type: 'fragments', amount: 8 },
  },
  {
    id: 'score_100k',
    desc: 'Atteindre 100 000 points sur une run',
    key: 'bestScore',
    goal: 100000,
    reward: { type: 'fragments', amount: 15 },
  },
];

// Utilitaire pour vérifier si un milestone est atteint
export function isMilestoneReached(milestone, meta) {
  const value = meta[milestone.key] || 0;
  return value >= milestone.goal;
}
