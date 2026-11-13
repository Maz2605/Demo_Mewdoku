import { CellState } from '../core/Puzzle';
/** Reveal only after the individual cap breaks; automatic exclusion has no marker. */
export function cellAppearance(state: CellState, finished: boolean, inspect: boolean, revealed = true) {
    return {
        flat: finished || (state === 'excluded' && revealed),
        mark: !finished && !inspect && (state === 'marked' || state === 'wrong'),
        cat: !finished && !inspect && state === 'found',
        symbol: !finished && inspect,
    };
}
