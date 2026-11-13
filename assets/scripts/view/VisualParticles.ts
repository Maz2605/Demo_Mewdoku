export type Expression = 'idle' | 'happy' | 'surprised';
export class ExpressionClock {
    expression: Expression = 'idle';
    private remaining = 0;
    set(expression: Expression, duration = 0): void { this.expression = expression; this.remaining = Math.max(0, duration); }
    tick(dt: number): void { if (this.remaining > 0) { this.remaining -= dt; if (this.remaining <= 0) this.reset(); } }
    reset(): void { this.expression = 'idle'; this.remaining = 0; }
}
export interface ParticleSpec { x: number; y: number; vx: number; vy: number; life: number; size: number; kind: number; hex: string; }
export interface VisualParticle extends ParticleSpec { active: boolean; age: number; }
/** Fixed-capacity model. Each newly emitted puff owns its full lifetime. */
export class VisualParticles {
    readonly items: VisualParticle[];
    constructor(capacity: number) {
        this.items = Array.from({length: capacity}, () => ({active:false, age:0, x:0,y:0,vx:0,vy:0,life:1,size:1,kind:0,hex:'#FFFFFF'}));
    }
    emit(spec: ParticleSpec): boolean {
        const p = this.items.find(item => !item.active);
        if (!p) return false;
        Object.assign(p, spec, {active:true,age:0}); return true;
    }
    tick(dt: number): void {
        for (const p of this.items) if (p.active) { p.age += dt; if (p.age >= p.life) p.active = false; }
    }
    clear(): void { for (const p of this.items) { p.active = false; p.age = 0; } }
}
