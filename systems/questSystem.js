// Défis hebdomadaires
export const WEEKLY_CHALLENGES = [
  {
    id: 'weekly_kill_500',
    desc: 'Tuer 500 ennemis cette semaine',
    goal: 500,
    progressKey: 'kills',
    reward: { type: 'fragments', amount: 12 },
    icon: '🔥',
  },
  {
    id: 'weekly_win_3',
    desc: 'Remporter 3 victoires cette semaine',
    goal: 3,
    progressKey: 'wins',
    reward: { type: 'fragments', amount: 18 },
    icon: '🏆',
  },
  {
    id: 'weekly_upgrade_30',
    desc: 'Obtenir 30 upgrades en une semaine',
    goal: 30,
    progressKey: 'upgrades',
    reward: { type: 'fragments', amount: 10 },
    icon: '💎',
  },
];
// Système de quêtes journalières/hebdomadaires pour la rétention
export const QUESTS = [
  {
    id: 'kill_100',
    type: 'daily',
    desc: 'Tuer 100 ennemis en une journée',
    goal: 100,
    progressKey: 'kills',
    reward: { type: 'fragments', amount: 2 },
  },
  {
    id: 'reach_level_10',
    type: 'daily',
    desc: 'Atteindre le niveau 10 en run',
    goal: 10,
    progressKey: 'level',
    reward: { type: 'fragments', amount: 1 },
  },
  {
    id: 'win_run',
    type: 'weekly',
    desc: 'Gagner une run cette semaine',
    goal: 1,
    progressKey: 'wins',
    reward: { type: 'fragments', amount: 5 },
  },
];

// Utilitaire pour calculer la progression d'une quête
export function getQuestProgress(quest, stats) {
  const value = stats[quest.progressKey] || 0;
  return Math.min(value, quest.goal);
}
