import { getActiveSynergies } from '../systems/upgradeSystem';

// Utilitaire pour enrichir la liste d'upgrades avec les synergies actives
export function getUpgradeTreeData(upgrades) {
  // Regroupe les upgrades par couleur
  const grouped = upgrades.reduce((acc, u) => {
    if (!acc[u.color]) acc[u.color] = [];
    acc[u.color].push(u);
    return acc;
  }, {});
  // Synergies actives
  const synergies = getActiveSynergies(upgrades);
  return { grouped, synergies };
}
