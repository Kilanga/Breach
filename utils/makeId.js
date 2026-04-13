/**
 * BREACH — Générateur d'IDs uniques (session)
 * Compteur monotone garanti unique dans une session de jeu.
 */
let _counter = 0;
export function makeId() { return ++_counter; }
