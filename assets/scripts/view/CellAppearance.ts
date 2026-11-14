import { Blocker, CellState } from '../core/Puzzle';
/** Reveal only after the individual cap breaks; automatic exclusion has no marker. */
export function cellAppearance(state: CellState, finished: boolean, inspect: boolean, revealed = true) {
    return {
        flat: finished || (state === 'excluded' && revealed),
        mark: !finished && !inspect && (state === 'marked' || state === 'wrong'),
        cat: !finished && !inspect && state === 'found',
        symbol: !finished && inspect,
    };
}

export function blockerAppearance(blocker: Blocker | undefined, state: CellState, found: number, finished: boolean, revealed = true): 'none' | 'stone' | 'lock' {
    if (finished || !blocker) return 'none';
    if (blocker.type === 'stone') return 'stone';
    // A deferred exclusion belongs to the current find: retain its previous lock
    // until the wave hits, even if that same find also reaches the threshold.
    const visibleFound = state === 'excluded' && !revealed ? Math.max(0,found-1) : found;
    return visibleFound < blocker.unlockAfter && (state === 'unknown' || state === 'marked' || (state === 'excluded' && !revealed)) ? 'lock' : 'none';
}
