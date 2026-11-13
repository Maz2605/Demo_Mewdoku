import { Action } from './Puzzle';

/** One active pointer shared by the board, so two fingers cannot search two cells. */
export class HoldInput {
    pointer: number | null = null;
    index = -1;
    progress = 0;
    private x = 0; private y = 0; private elapsed = 0; private consumed = false; private canFind = false;
    begin(pointer: number, index: number, x: number, y: number, canFind: boolean): boolean {
        if (this.pointer !== null) return false;
        this.pointer = pointer; this.index = index; this.x = x; this.y = y;
        this.elapsed = 0; this.progress = 0; this.consumed = false; this.canFind = canFind; return true;
    }
    move(pointer: number, x: number, y: number): void {
        if (pointer !== this.pointer) return;
        if (Math.hypot(x - this.x, y - this.y) > 12) { this.consumed = true; this.progress = 0; }
    }
    tick(dt: number): Action | null {
        if (this.pointer === null || this.consumed) return null;
        this.elapsed += dt; this.progress = Math.min(1, this.elapsed / 0.4);
        if (this.elapsed + 1e-8 < 0.4) return null;
        this.consumed = true; this.progress = 0;
        return this.canFind ? { type: 'find', index: this.index } : null;
    }
    end(pointer: number): Action | null {
        if (pointer !== this.pointer) return null;
        const result: Action | null = this.consumed ? null : { type: 'mark', index: this.index };
        this.cancel(); return result;
    }
    cancel(): void { this.pointer = null; this.index = -1; this.progress = 0; this.consumed = false; }
}
