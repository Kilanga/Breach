import { getUpgradeChoices, ALL_UPGRADES } from '../systems/upgradeSystem';

describe('upgradeSystem.getUpgradeChoices edge cases', () => {
  it('returns empty array if all upgrades are maxed out', () => {
    const active = [];
    for (const up of ALL_UPGRADES) {
      for (let i = 0; i < up.maxStack; i++) active.push(up);
    }
    const choices = getUpgradeChoices(active, 3);
    expect(choices).toEqual([]);
  });

  it('returns only non-curse upgrades if all curses are already picked', () => {
    const active = [];
    for (const up of ALL_UPGRADES) {
      if (up.rarity === 'curse') {
        for (let i = 0; i < up.maxStack; i++) active.push(up);
      }
    }
    const choices = getUpgradeChoices(active, 3);
    expect(choices.every(u => u.rarity !== 'curse')).toBe(true);
  });

  it('never returns duplicate upgrades in a single roll', () => {
    for (let i = 0; i < 10; i++) {
      const choices = getUpgradeChoices([], 3);
      const ids = choices.map(c => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
