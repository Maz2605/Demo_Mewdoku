import { _decorator, Camera, CCString, Color, Component, Material, MeshRenderer, Node, Sprite, UITransform, Vec3 } from 'cc';
import { CellState, GameState, LevelDefinition } from '../core/Puzzle';
import { blastDelay, sampleShard, ShardTrajectory } from './Motion';
import { cellAppearance } from './CellAppearance';
const { ccclass, property } = _decorator;
interface Tile { node: Node; cap: Node; base: Node; capRenderer: MeshRenderer; baseRenderer: MeshRenderer; x: number; y: number; color: number; state: CellState; }
interface Motion { index: number; delay: number; age: number; kind: 'found' | 'break' | 'hint'; emitted: boolean; }
interface Shard extends ShardTrajectory { node: Node; renderer: MeshRenderer; age: number; active: boolean; spin: Vec3; size: number; }

/** High-DPI 3D board view with radial outward shard bursts towards edges. */
@ccclass('Board3D')
export class Board3D extends Component {
    @property([Node]) tileNodes: Node[] = [];
    @property([Node]) fragmentNodes: Node[] = [];
    @property([CCString]) paletteHexes: string[] = [];
    @property([Material]) paletteMaterials: Material[] = [];
    @property([Material]) paletteFlatMaterials: Material[] = [];
    @property(Camera) boardCamera: Camera | null = null;
    @property(Sprite) boardImage: Sprite | null = null;
    @property(Node) trayNode: Node | null = null;
    @property(Node) insetNode: Node | null = null;
    @property({ min: 0, max: 32, step: 1 }) maxFragments = 32;
    public onTileBreak: ((tileX: number, tileY: number, colorHex: string, isBorder: boolean, index: number) => void) | null = null;

    private tiles: Tile[] = [];
    private shards: Shard[] = [];
    private materials = new Map<string, Material>();
    private flatMaterials = new Map<string, Material>();
    private motions: Motion[] = [];
    private press = -1;
    private clock = 0;
    private cell = 1;
    private size = 1;
    private count = 0;
    private strength = 0.65;
    private level: LevelDefinition | null = null;
    private bound = false;
    private catOriginX = 0;
    private catOriginY = 0;

    private bind(): void {
        if (this.bound) return;
        if (this.tileNodes.length !== 64 || !this.boardCamera?.targetTexture || !this.boardImage?.spriteFrame)
            throw new Error('Board3D: incomplete authored board bindings.');
        this.paletteHexes.forEach((hex, i) => this.materials.set(hex, this.paletteMaterials[i]));
        this.paletteHexes.forEach((hex, i) => this.flatMaterials.set(hex, this.paletteFlatMaterials[i] || this.paletteMaterials[i]));
        this.tiles = this.tileNodes.map((n) => {
            const cap = n.getChildByName('Cap')!,
                base = n.getChildByName('Base')!;
            return {
                node: n,
                cap,
                base,
                capRenderer: cap.getComponent(MeshRenderer)!,
                baseRenderer: base.getComponent(MeshRenderer)!,
                x: 0,
                y: 0,
                color: 0,
                state: 'unknown' as CellState,
            };
        });
        this.shards = this.fragmentNodes.map((n) => ({
            node: n,
            renderer: n.getComponent(MeshRenderer)!,
            active: false,
            age: 0,
            x: 0,
            y: 0,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
            life: 0.65,
            spin: new Vec3(),
            size: 1,
        }));
        this.bound = true;
    }

    configure(level: LevelDefinition, size: number, strength: number): void {
        this.bind();
        this.clear();
        // Apply through the public color setters after the active pipeline is selected.
        // Creator can strip the other exposure variant from serialized scene globals.
        this.node.scene.globals.ambient.skyLightingColor = new Color(204,204,204,255);
        this.node.scene.globals.ambient.groundLightingColor = new Color(77,77,77,255);
        this.level = level;
        this.size = size;
        this.cell = size / level.size;
        this.count = level.size * level.size;
        this.strength = Math.max(0, Math.min(2, strength));

        // High-DPI crisp render texture matching display pixel density
        this.boardCamera!.orthoHeight = (size + 100) / 2;
        this.boardImage!.node.getComponent(UITransform)!.setContentSize(size + 100, size + 100);

        this.trayNode!.setScale(size + 42, size + 42, 56);
        this.insetNode!.setScale(size + 8, size + 8, 9);
        const cozyTray = this.materials.get('#D8B5FA');
        if (cozyTray && this.trayNode) this.trayNode.getComponent(MeshRenderer)?.setSharedMaterial(cozyTray, 0);
        const cozyInset = this.materials.get('#FFF8EE');
        if (cozyInset && this.insetNode) this.insetNode.getComponent(MeshRenderer)?.setSharedMaterial(cozyInset, 0);

        this.tiles.forEach((t, i) => {
            t.node.active = i < this.count;
            if (i >= this.count) return;
            t.x = -size / 2 + ((i % level.size) + 0.5) * this.cell;
            t.y = size / 2 - (Math.floor(i / level.size) + 0.5) * this.cell;
            t.color = level.cells[i];
            t.state = 'unknown';
            const material = this.materials.get(level.palette[t.color]);
            if (!material) throw new Error('Missing authored palette material: ' + level.palette[t.color]);
            t.capRenderer.setSharedMaterial(material, 0);
            t.baseRenderer.setSharedMaterial(material, 0);
            t.base.setPosition(t.x, t.y, -5);
            t.base.setScale(this.cell, this.cell, 1);
            t.base.active = true;
            t.cap.active = true;
            this.rest(i);
        });
    }

    sync(state: GameState, defer: number[] = [], finished = false): void {
        for (let i = 0; i < this.count; i++) {
            const t = this.tiles[i];
            t.state = state.cells[i];
            if (defer.includes(i)) continue;
            t.cap.active = !finished && t.state !== 'excluded' && t.state !== 'wrong';
            t.base.active = !finished;
            const hex=this.level!.palette[t.color];
            t.baseRenderer.setSharedMaterial(cellAppearance(t.state,false,false).flat ? this.flatMaterials.get(hex)! : this.materials.get(hex)!,0);
            if (!this.motions.some((m) => m.index === i)) this.rest(i);
        }
        if (finished) this.clear();
    }

    private rest(index: number): void {
        const t = this.tiles[index],
            c = this.cell;
        t.cap.setPosition(t.x, t.y, c * 0.16);
        t.cap.setScale(c * 0.90, c * 0.90, c * (t.state === 'found' ? 0.24 : 0.42));
        t.cap.setRotationFromEuler(-7, -7, 0);
    }

    releaseHold(): void {
        if (this.press >= 0 && !this.motions.some((m) => m.index === this.press)) this.rest(this.press);
        this.press = -1;
    }

    hold(index: number, progress: number): void {
        if (index < 0 || index >= this.count || this.tiles[index].state !== 'unknown' || this.motions.some((m) => m.index === index))
            return;
        this.press = index;
        const t = this.tiles[index],
            p = progress * this.strength;
        t.cap.setPosition(t.x, t.y, this.cell * (0.16 - 0.08 * p));
        t.cap.setScale(this.cell * (0.90 + 0.025 * p), this.cell * (0.90 + 0.025 * p), this.cell * (0.42 - 0.14 * p));
    }

    found(origin: number, excluded: number[]): void {
        this.releaseHold();
        const originTile = this.tiles[origin];
        if (originTile) {
            this.catOriginX = originTile.x;
            this.catOriginY = originTile.y;
        }
        const affected = new Set([origin, ...excluded]);
        this.motions = this.motions.filter((m) => !affected.has(m.index));
        this.motions.push({ index: origin, delay: 0, age: 0, kind: 'found', emitted: false });
        for (const index of excluded) {
            this.tiles[index].cap.active = true;
            this.motions.push({
                index,
                delay: blastDelay(this.level!.size, origin, index),
                age: 0,
                kind: 'break',
                emitted: false,
            });
        }
    }

    hint(index: number): void {
        this.motions = this.motions.filter((m) => m.index !== index);
        this.motions.push({ index, delay: 0, age: 0, kind: 'hint', emitted: false });
    }

    private emit(t: Tile): void {
        const poolLimit = Math.min(this.maxFragments, this.shards.length);
        const dx = t.x - this.catOriginX;
        const dy = t.y - this.catOriginY;
        const dist = Math.hypot(dx, dy) || 1;
        const nx = dx / dist;
        const ny = dy / dist;
        const n = this.level!.size;
        const col = Math.round((t.x + this.size / 2) / this.cell - 0.5);
        const row = Math.round((this.size / 2 - t.y) / this.cell - 0.5);
        const isBorder = col <= 0 || col >= n - 1 || row <= 0 || row >= n - 1;

        const shardCount = 3;
        const outwardThrust = this.cell * (isBorder ? 1.65 : 1.4) * this.strength;

        for (let i = 0; i < shardCount; i++) {
            const shard = this.shards.slice(0, poolLimit).find((s) => !s.active);
            if (!shard) return;

            const baseAngle = Math.atan2(ny, nx);
            const a = baseAngle + i * Math.PI * 2 / shardCount + Math.sin(this.clock + i) * .2;

            shard.active = true;
            shard.age = 0;
            shard.x = t.x;
            shard.y = t.y;
            shard.z = this.cell * 0.30;
            shard.vx = (Math.cos(a) + nx * .35) * outwardThrust;
            shard.vy = (Math.sin(a) + ny * .35) * outwardThrust;
            shard.vz = (100 + this.cell * .75 + i * 25) * this.strength;
            shard.life = 0.38 + i * .05;
            shard.size = this.cell * (0.11 + i * .025);
            shard.spin.set(180 + i * 65, 230 + i * 50, 150 + i * 80);
            shard.renderer.setSharedMaterial(this.materials.get(this.level!.palette[t.color])!, 0);
            shard.node.active = true;
        }
    }

    update(dt: number): void {
        if (!this.bound || !this.level) return;
        this.clock += dt;
        for (const m of this.motions) {
            m.age += dt;
            const age = m.age - m.delay;
            if (age < 0) continue;
            const t = this.tiles[m.index],
                c = this.cell;
            if (m.kind === 'break') {
                if (age < 0.08) {
                    const p = age / 0.08;
                    t.cap.setScale(c * (0.90 + 0.05 * p), c * (0.90 + 0.05 * p), c * (0.42 - 0.18 * p));
                    t.cap.setPosition(t.x, t.y, c * (0.16 + 0.06 * p));
                } else if (!m.emitted) {
                    m.emitted = true;
                    t.cap.active = false;
                    t.base.active = true;
                    t.baseRenderer.setSharedMaterial(this.flatMaterials.get(this.level!.palette[t.color])!,0);
                    const n = this.level!.size;
                    const col = Math.round((t.x + this.size / 2) / this.cell - 0.5);
                    const row = Math.round((this.size / 2 - t.y) / this.cell - 0.5);
                    const isBorder = col <= 0 || col >= n - 1 || row <= 0 || row >= n - 1;
                    this.onTileBreak?.(t.x, t.y, this.level!.palette[t.color], isBorder, m.index);
                    this.emit(t);
                }
            } else {
                const p = Math.min(1, age / 0.64),
                    stretch = 1 + Math.sin(p * Math.PI * 3) * 0.1 * (1 - p) * this.strength;
                t.cap.setPosition(t.x, t.y, c * 0.16 + Math.sin(p * Math.PI) * (1 - p) * Math.min(40,c*.35) * this.strength);
                t.cap.setScale(c * 0.90 * stretch, c * 0.90 * stretch, (c * (t.state === 'found' ? 0.24 : 0.42)) / stretch);
                if (p === 1) this.rest(m.index);
            }
        }
        this.motions = this.motions.filter((m) => m.age - m.delay < (m.kind === 'break' ? 0.12 : 0.64));
        for (const s of this.shards)
            if (s.active) {
                s.age += dt;
                // Allow shards to fly outward over the tray rim
                const p = sampleShard(s, s.age, this.size / 2 + 150);
                if (!p.scale) {
                    s.active = false;
                    s.node.active = false;
                    continue;
                }
                s.node.setPosition(p.x, p.y, p.z);
                s.node.setScale(s.size * p.scale, s.size * .72 * p.scale, s.size * .48 * p.scale);
                s.node.setRotationFromEuler(s.spin.x * s.age, s.spin.y * s.age, s.spin.z * s.age);
            }
    }

    clear(): void {
        this.motions = [];
        this.releaseHold();
        for (const s of this.shards) {
            s.active = false;
            s.node.active = false;
        }
    }

    onDisable(): void {
        this.clear();
    }
}
