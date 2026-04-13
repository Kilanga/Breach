import { ALL_UPGRADES, getUpgradeChoices } from '../systems/upgradeSystem';

describe('upgradeSystem.getUpgradeChoices', () => {
  it('returns up to requested number without duplicate ids', () => {
    const choices = getUpgradeChoices([], 3);

    expect(choices.length).toBeGreaterThan(0);
    expect(choices.length).toBeLessThanOrEqual(3);

    const ids = choices.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('never returns more than one curse in same roll', () => {
    const choices = getUpgradeChoices([], 3);
    const curseCount = choices.filter(c => c.rarity === 'curse').length;
    expect(curseCount).toBeLessThanOrEqual(1);
  });

  it('uses fallback and still returns remaining choices when pool is almost exhausted', () => {
    // Saturer toutes les upgrades sauf une, en respectant leur maxStack.
    const last = ALL_UPGRADES[ALL_UPGRADES.length - 1];
    const active = [];

    for (const up of ALL_UPGRADES) {
      const stacks = up.id === last.id ? up.maxStack - 1 : up.maxStack;
      for (let i = 0; i < stacks; i++) active.push(up);
    }

    const choices = getUpgradeChoices(active, 3);

    expect(choices.length).toBe(1);
    expect(choices[0].id).toBe(last.id);
  });
});
