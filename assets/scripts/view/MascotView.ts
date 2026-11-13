import { _decorator, Component, Sprite, SpriteFrame, Vec3 } from 'cc';
import { ExpressionClock } from './VisualParticles';
const {ccclass, property} = _decorator;
export type MascotExpression = 'idle' | 'happy' | 'surprised';

/** Sprite-only companion; owns its expression timer and local idle motion. */
@ccclass('MascotView')
export class MascotView extends Component {
    @property(Sprite) image: Sprite | null = null;
    @property(SpriteFrame) idle: SpriteFrame | null = null;
    @property(SpriteFrame) happy: SpriteFrame | null = null;
    @property(SpriteFrame) surprised: SpriteFrame | null = null;
    private expression = new ExpressionClock();
    private clock = 0;
    setExpression(expression: MascotExpression, duration = 0): void {
        if (this.image) this.image.spriteFrame = this[expression];
        this.expression.set(expression, duration);
    }
    reset(): void {
        this.expression.reset(); this.clock = 0;
        this.setExpression('idle');
        this.node.setScale(Vec3.ONE); this.node.angle = 0;
    }
    update(dt: number): void {
        this.clock += dt;
        const previous = this.expression.expression;
        this.expression.tick(dt);
        if (previous !== this.expression.expression && this.image) this.image.spriteFrame = this[this.expression.expression];
        this.node.setScale(1 + Math.sin(this.clock * 2.2) * .012, 1 + Math.sin(this.clock * 2.2) * .018, 1);
        this.node.angle = Math.sin(this.clock * 1.5) * 1.3;
    }
    onDisable(): void { this.reset(); }
}
