/** Engine-independent rules. Index = row * size + column, origin top-left. */
export interface LevelDefinition {
    id: string; title: string; size: number; palette: string[]; cells: number[]; cats: number[];
}
export type CellState = 'unknown' | 'marked' | 'excluded' | 'wrong' | 'found';
export interface GameState {
    level: LevelDefinition; cells: CellState[]; found: number[]; hearts: number; hints: number;
    status: 'playing' | 'won' | 'lost';
}
export type Action = { type: 'mark' | 'find'; index: number } | { type: 'hint' };
export interface GameEvent { type: 'found' | 'wrong' | 'hint' | 'won' | 'lost'; index?: number; excluded?: number[]; reason?: string; }
export interface Hint { index: number; reason: string; }

function conflicts(level: LevelDefinition, a: number, b: number): boolean {
    const n = level.size, ar = Math.floor(a / n), br = Math.floor(b / n), ac = a % n, bc = b % n;
    return ar === br || ac === bc || level.cells[a] === level.cells[b] || (Math.abs(ar - br) <= 1 && Math.abs(ac - bc) <= 1);
}

export function validateLevel(level: LevelDefinition): string[] {
    const errors: string[] = [], n = level.size;
    if (!Number.isInteger(n) || n < 4 || n > 8) return ['Kích thước phải từ 4 đến 8.'];
    if (level.cells.length !== n * n) errors.push('Sai số ô.');
    if (level.palette.length !== n || new Set(level.palette).size !== n || level.palette.some(c => !/^#[0-9a-f]{6}$/i.test(c))) errors.push('Cần N màu hex khác nhau.');
    if (level.cells.some(c => !Number.isInteger(c) || c < 0 || c >= n) || new Set(level.cells).size !== n) errors.push('Mã màu không hợp lệ hoặc thiếu màu.');
    if (level.cats.length !== n || level.cats.some(i => !Number.isInteger(i) || i < 0 || i >= n * n)) errors.push('Sai số lượng hoặc vị trí mèo.');
    for (let a = 0; a < level.cats.length; a++) for (let b = a + 1; b < level.cats.length; b++) {
        if (conflicts(level, level.cats[a], level.cats[b])) errors.push('Mèo vi phạm hàng/cột/màu hoặc chạm nhau.');
    }
    return errors;
}

/** Exhaustive answer oracle, independent of authored cats. Stops at two answers. */
export function solveLevel(level: LevelDefinition): number[][] {
    const n = level.size, results: number[][] = [], chosen: number[] = [];
    if (level.cells.length !== n * n) return results;
    const visit = (row: number) => {
        if (results.length >= 2) return;
        if (row === n) { results.push(chosen.slice()); return; }
        for (let col = 0; col < n; col++) {
            const index = row * n + col;
            if (chosen.every(other => !conflicts(level, index, other))) {
                chosen.push(index); visit(row + 1); chosen.pop();
            }
        }
    };
    visit(0); return results;
}

function unitId(level: LevelDefinition, index: number, axis: number): number {
    return axis === 0 ? Math.floor(index / level.size) : axis === 1 ? index % level.size : level.cells[index];
}

/** Singles, unit support and Hall sets only; never consults level.cats or backtracks. */
export function logicalSolve(level: LevelDefinition, initial: number[] = [], empty: number[] = []): { solved: boolean; cats: number[]; steps: Hint[] } {
    const n = level.size, cats = initial.slice(), steps: Hint[] = [];
    const candidates = new Set<number>();
    for (let i = 0; i < n * n; i++) if (!empty.includes(i) && !cats.some(c => conflicts(level, i, c))) candidates.add(i);
    const units = () => {
        const result: { axis: number; id: number; cells: number[] }[] = [];
        for (let axis = 0; axis < 3; axis++) for (let id = 0; id < n; id++) {
            if (cats.some(c => unitId(level, c, axis) === id)) continue;
            result.push({ axis, id, cells: Array.from(candidates).filter(i => unitId(level, i, axis) === id) });
        }
        return result;
    };
    let changed = true;
    while (changed && cats.length < n) {
        changed = false;
        const groups = units();
        if (groups.some(g => g.cells.length === 0)) break;
        const single = groups.find(g => g.cells.length === 1);
        if (single) {
            const index = single.cells[0], names = ['hàng', 'cột', 'màu'];
            cats.push(index);
            steps.push({ index, reason: `${names[single.axis] === 'màu' ? 'Màu' : names[single.axis] === 'hàng' ? 'Hàng' : 'Cột'} ${single.axis === 2 ? String.fromCharCode(65 + single.id) : single.id + 1} chỉ còn một ô có thể có mèo.` });
            for (const i of Array.from(candidates)) if (conflicts(level, index, i)) candidates.delete(i);
            changed = true; continue;
        }
        // A proposed cell must leave a compatible candidate in every other unit.
        for (const i of Array.from(candidates)) {
            if (groups.some(g => !g.cells.includes(i) && !g.cells.some(j => !conflicts(level, i, j)))) {
                candidates.delete(i); changed = true;
            }
        }
        if (changed) continue;
        // k source units restricted to k target units reserve those target units.
        for (let from = 0; from < 3; from++) for (let to = 0; to < 3; to++) {
            if (from === to) continue;
            const sources = groups.filter(g => g.axis === from);
            for (let mask = 1; mask < (1 << sources.length) - 1; mask++) {
                const selected = sources.filter((_, k) => !!(mask & (1 << k)));
                const targets = new Set(selected.flatMap(g => g.cells.map(i => unitId(level, i, to))));
                if (targets.size !== selected.length) continue;
                const selectedIds = new Set(selected.map(g => g.id));
                for (const i of Array.from(candidates)) if (!selectedIds.has(unitId(level, i, from)) && targets.has(unitId(level, i, to))) {
                    candidates.delete(i); changed = true;
                }
            }
        }
    }
    return { solved: cats.length === n, cats, steps };
}

export function createGame(level: LevelDefinition): GameState {
    return { level, cells: Array(level.size * level.size).fill('unknown'), found: [], hearts: 3, hints: 2, status: 'playing' };
}

export function getLogicalHint(level: LevelDefinition, state: GameState): Hint | null {
    const empty = state.cells.map((s, i) => s === 'wrong' || s === 'excluded' ? i : -1).filter(i => i >= 0);
    const result = logicalSolve(level, state.found, empty);
    const hint = result.steps[0];
    if (!hint) return null;
    // Deductions preceding the single may include support/Hall exclusions.
    return { index: hint.index, reason: `Loại trừ theo hàng, cột, màu và các ô chạm nhau. ${hint.reason} Giữ ô sáng để tìm mèo.` };
}

export function applyAction(state: GameState, action: Action): { state: GameState; events: GameEvent[] } {
    if (state.status !== 'playing') return { state, events: [] };
    if (action.type === 'hint') {
        if (!state.hints) return { state, events: [] };
        const hint = getLogicalHint(state.level, state);
        if (!hint) return { state, events: [] };
        const next = { ...state, cells: state.cells.slice(), hints: state.hints - 1 };
        if (next.cells[hint.index] === 'marked') next.cells[hint.index] = 'unknown';
        return { state: next, events: [{ type: 'hint', ...hint }] };
    }
    const i = action.index;
    if (!Number.isInteger(i) || i < 0 || i >= state.cells.length) return { state, events: [] };
    const current = state.cells[i];
    if (current !== 'unknown' && current !== 'marked') return { state, events: [] };
    if (action.type === 'mark') {
        const cells = state.cells.slice(); cells[i] = current === 'marked' ? 'unknown' : 'marked';
        return { state: { ...state, cells }, events: [] };
    }
    if (current === 'marked') return { state, events: [] };
    const next: GameState = { ...state, cells: state.cells.slice(), found: state.found.slice() };
    const events: GameEvent[] = [];
    if (!state.level.cats.includes(i)) {
        next.cells[i] = 'wrong'; next.hearts--;
        events.push({ type: 'wrong', index: i });
        if (!next.hearts) { next.status = 'lost'; events.push({ type: 'lost' }); }
    } else {
        next.cells[i] = 'found'; next.found.push(i);
        const excluded: number[] = [];
        for (let j = 0; j < next.cells.length; j++) if ((next.cells[j] === 'unknown' || next.cells[j] === 'marked') && conflicts(state.level, i, j)) {
            next.cells[j] = 'excluded'; excluded.push(j);
        }
        events.push({ type: 'found', index: i, excluded });
        if (next.found.length === state.level.size) { next.status = 'won'; events.push({ type: 'won' }); }
    }
    return { state: next, events };
}
