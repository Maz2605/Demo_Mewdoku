import { _decorator, assetManager, Button, Canvas, Component, EventTouch, instantiate, isValid, Label, Node, Prefab, profiler, ResolutionPolicy, screen, Sprite, SpriteFrame, UIOpacity, tween, Tween, UITransform, Vec3, view, Widget } from 'cc';
import { PREVIEW } from 'cc/env';
import { Action, applyAction, cellAccess, createGame, GameState } from './core/Puzzle';
import { LEVELS } from './core/Levels';
import { DEFAULT_GAME_PREFAB_PATH, DEFAULT_GAME_PREFAB_UUID } from './core/DefaultAssets';
import { HoldInput } from './core/HoldInput';
import { computeLayout } from './core/Layout';
import { PixelCell } from './view/PixelCell';
import { Board3D } from './view/Board3D';
import { GameEffects } from './view/GameEffects';
import { blastDuration } from './view/Motion';
import { MascotView } from './view/MascotView';
import { retireLegacyChildren } from './view/LegacyRoot';
import { color } from './view/Ui';
import { GalleryView } from './view/GalleryView';
const { ccclass, property } = _decorator;

/** State/controller with responsive layout, 3D destruction and Canva-style mascot. */
@ccclass('MeowGame')
export class MeowGame extends Component {
    @property(Node) background: Node | null = null;
    @property(Label) brandLabel: Label | null = null;
    @property(Label) levelLabel: Label | null = null;
    @property(Node) statusPanel: Node | null = null;
    @property(Label) catsLabel: Label | null = null;
    @property(Label) heartsLabel: Label | null = null;
    @property(Node) board: Node | null = null;
    @property(Sprite) boardImage: Sprite | null = null;
    @property([PixelCell]) cellViews: PixelCell[] = [];
    @property(Board3D) boardModel: Board3D | null = null;
    @property(GameEffects) effects: GameEffects | null = null;
    @property(Button) hintButton: Button | null = null;
    @property(Button) colorButton: Button | null = null;
    @property(Button) retryButton: Button | null = null;
    @property(Label) hintLabel: Label | null = null;
    @property(Label) colorLabel: Label | null = null;
    @property(Label) messageLabel: Label | null = null;
    @property(Node) modalRoot: Node | null = null;
    @property(Node) modalCard: Node | null = null;
    @property(Label) modalTitle: Label | null = null;
    @property(Label) modalDescription: Label | null = null;
    @property(Button) modalConfirmButton: Button | null = null;
    @property(Label) modalConfirmLabel: Label | null = null;
    @property(Node) modalPeek: Node | null = null;
    @property({ min: 0, max: 2, step: 0.1 }) bounceStrength = 0.65;

    @property(Node) logo: Node | null = null;
    @property(Node) cloudLeft: Node | null = null;
    @property(Node) cloudRight: Node | null = null;
    @property(Label) sizeBadge: Label | null = null;
    @property(Label) hintBadge: Label | null = null;
    @property([Sprite]) heartSprites: Sprite[] = [];
    @property(SpriteFrame) heartFull: SpriteFrame | null = null;
    @property(SpriteFrame) heartEmpty: SpriteFrame | null = null;
    @property(MascotView) companion: MascotView | null = null;
    @property(MascotView) modalMascot: MascotView | null = null;
    @property(Node) tutorialRules: Node | null = null;
    @property(Node) modalGlow: Node | null = null;
    @property(Node) pictureThumbnail: Node | null = null;
    @property([Sprite]) thumbnailPixels: Sprite[] = [];
    @property(GalleryView) gallery: GalleryView | null = null;
    @property(Button) galleryButton: Button | null = null;
    private completedPictures = new Set<number>();
    private coreTutorialSeen = false;
    private taughtStone = false;
    private taughtLock = false;
    private mechanicTutorial = false;
    private modalScale = 1;
    private resultCelebrated = false;
    private levelIndex = 0;
    private state!: GameState;
    private hold = new HoldInput();
    private ready = false;
    private canvas: Canvas | null = null;
    private locked = false;
    private resizing = false;
    private inspecting = false;
    private selectedColor = -1;
    private hinted = -1;
    private boardSize = 664;
    private generation = 0;
    private modalMode: 'none' | 'tutorial' | 'won' | 'lost' = 'none';
    private peeking = false;
    private instruction = 'Chạm: đánh dấu × · Giữ 0,4 giây: tìm mèo';

    private baseBoardX = 0;
    private baseBoardY = 0;

    onLoad(): void {
        profiler.hideStats();
        view.enableRetina(true);
        if (!this.board || !this.boardModel || this.cellViews.length !== 64 || !this.logo || !this.companion || this.heartSprites.length !== 3 || !this.gallery || !this.galleryButton) {
            this.loadAuthoredRootForOldPreview();
            return;
        }
        let n: Node | null = this.node;
        while (n && !this.canvas) {
            this.canvas = n.getComponent(Canvas);
            n = n.parent;
        }
        this.ready = true;
        this.state = createGame(LEVELS[0]);
        this.gallery.onChooseLevel = index => this.loadLevel(index);
        this.gallery.onCloseMenu = () => this.resumeFromGallery();
        this.gallery.onNext = () => this.loadLevel((this.levelIndex+1)%LEVELS.length);
        this.gallery.onChooseMenu = () => this.onGallery();
        this.board.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.board.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.board.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.board.on(Node.EventType.TOUCH_CANCEL, this.touchCancel, this);

        // Wire tile break shockwave & particles with edge awareness
        if (this.boardModel) {
            this.boardModel.onTileBreak = (x, y, colorHex, isBorder, index) => {
                this.effects?.poof(x, y, colorHex, isBorder);
                this.renderCell(index,false,true);
            };
        }

        this.resize();
        this.onGallery();
    }

    /** Compatibility only: old running Editor snapshots may still hold the former empty Canvas. */
    private loadAuthoredRootForOldPreview(): void {
        const complete = (err: Error | null, prefab: Prefab) => {
            if (!isValid(this, true) || !isValid(this.node, true)) return;
            if (err || !prefab?.data.getComponent(MeowGame)?.gallery) {
                console.error('[MeowPop] Reopen MeowPop.scene: cannot load authored GameRoot.', err);
                return;
            }
            const screenCamera=this.node.getComponent(Canvas)?.cameraComponent?.node;
            retireLegacyChildren(this.node.children,screenCamera);
            this.node.addChild(instantiate(prefab));
            this.destroy();
        };
        if (PREVIEW) {
            assetManager.loadAny<Prefab>(DEFAULT_GAME_PREFAB_UUID, complete);
            return;
        }
        assetManager.loadBundle('resources', (err, bundle) => {
            if (!isValid(this, true)) return;
            if (err) {
                complete(err, null!);
                return;
            }
            bundle.load(DEFAULT_GAME_PREFAB_PATH, Prefab, complete);
        });
    }

    onEnable(): void {
        if (this.ready) {
            view.on('canvas-resize', this.resize, this);
            this.resize();
        }
    }

    onDisable(): void {
        view.off('canvas-resize', this.resize, this);
        if (this.ready) this.cancelVisuals();
    }

    private cancelVisuals(): void {
        this.generation++;
        this.unscheduleAllCallbacks();
        this.hold.cancel();
        this.locked = false;
        this.effects?.clear();
        this.gallery?.settle();
        if (this.effects && this.board) { this.effects.node.setParent(this.board); this.effects.node.setPosition(0,0); }
        this.companion?.reset(); this.modalMascot?.reset();
        if (this.board) { Tween.stopAllByTarget(this.board); this.board.setPosition(this.baseBoardX,this.baseBoardY); }
        if (this.modalCard) { Tween.stopAllByTarget(this.modalCard); const opacity=this.modalCard.getComponent(UIOpacity); if(opacity){Tween.stopAllByTarget(opacity);opacity.opacity=255;} }
        this.boardModel?.clear();
        for (const cell of this.cellViews) cell.resetMotion();
    }

    private setSize(n: Node, w: number, h: number): void {
        n.getComponent(UITransform)!.setContentSize(w, h);
    }

    private shakeBoard(strength = 4, duration = 0.12): void {
        if (!this.board) return;
        strength = Math.min(strength, 3 * view.getDesignResolutionSize().width / Math.max(1,screen.windowSize.width));
        Tween.stopAllByTarget(this.board);
        const bx = this.baseBoardX,
            by = this.baseBoardY;
        tween(this.board)
            .to(duration * 0.25, {
                position: new Vec3(bx + (Math.random() - 0.5) * strength * 2, by + (Math.random() - 0.5) * strength * 2, 0),
            })
            .to(duration * 0.25, {
                position: new Vec3(bx - (Math.random() - 0.5) * strength * 1.5, by - (Math.random() - 0.5) * strength * 1.5, 0),
            })
            .to(duration * 0.5, { position: new Vec3(bx, by, 0) }, { easing: 'quadOut' })
            .start();
    }

    private resize(): void {
        if (!this.ready || this.resizing) return;
        this.resizing = true;
        try {
            this.cancelVisuals();
            const frame=screen.windowSize, ratio=frame.width/Math.max(1,frame.height);
            const w=ratio>1?900*ratio:720, h=ratio>1?900:720/ratio;
            view.setDesignResolutionSize(w,h,ResolutionPolicy.EXACT_FIT);
            this.canvas?.node.getComponent(Widget)?.updateAlignment();
            if(this.canvas)this.canvas.alignCanvasWithScreen=true;
            this.setSize(this.node,w,h);this.setSize(this.background!,w,h);this.setSize(this.modalRoot!,w,h);
            const dimmer=this.modalRoot!.getChildByName('Dimmer');if(dimmer)this.setSize(dimmer,w,h);
            const l=computeLayout(w,h),left=l.panelX;
            if(this.logo){this.setSize(this.logo,l.logoHeight*3.05,l.logoHeight);this.logo.setPosition(left-(l.landscape?0:35),l.logoY);}
            this.levelLabel!.node.setPosition(left-(l.landscape?0:32),l.levelY);
            this.setSize(this.levelLabel!.node,l.landscape?350:420,l.compact?28:42);
            this.levelLabel!.fontSize=l.landscape?32:l.compact?22:26;
            this.levelLabel!.lineHeight=l.landscape?40:32;
            if(this.sizeBadge)this.sizeBadge.fontSize=l.landscape?28:24;
            this.sizeBadge?.node.setPosition(left-(l.landscape?0:255),l.levelY-(l.landscape?38:0));
            this.setSize(this.statusPanel!,l.landscape?400:620,l.statusHeight);
            this.statusPanel!.setPosition(left,l.statusY);
            this.catsLabel!.node.setPosition(l.landscape?-85:-120,0);
            this.catsLabel!.fontSize=l.landscape?32:28;
            const catIcon=this.statusPanel!.getChildByName('CatIcon');catIcon?.setPosition(l.landscape?-155:-230,0);
            this.heartSprites.forEach((s,i)=>{s.node.setPosition((l.landscape?40:120)+i*(l.landscape?48:54),0);this.setSize(s.node,38,38);});
            this.baseBoardX=l.boardX;this.baseBoardY=l.boardY;this.boardSize=l.boardSize;
            this.board!.setPosition(l.boardX,l.boardY);this.setSize(this.board!,l.boardSize,l.boardSize);
            const shadow=this.board!.getChildByName('ContactShadow');if(shadow)this.setSize(shadow,l.boardSize+100,l.boardSize+100);
            if(this.companion){const size=l.landscape?120:l.compact?78:124;this.setSize(this.companion.node,size,size);this.companion.node.setPosition(Math.max(-w/2+size/2+16,left-(l.landscape?220:270)),l.logoY-(l.compact?0:8));}
            this.setSize(this.galleryButton!.node,112,l.galleryHeight);
            this.galleryButton!.node.setPosition(left+(l.landscape?210:270),l.galleryY);
            const galleryLabel=this.galleryButton!.node.getChildByName('Label')?.getComponent(Label);
            if(galleryLabel){galleryLabel.string='Chọn\ntranh';galleryLabel.fontSize=l.landscape?28:24;galleryLabel.lineHeight=l.landscape?34:28;this.setSize(galleryLabel.node,108,80);}
            this.gallery!.layout(w,h);
            this.cloudLeft?.setPosition(-w/2+20,h/2-145);this.cloudRight?.setPosition(w/2-20,-h/2+105);
            const n=this.state.level.size,c=l.boardSize/n;
            this.cellViews.forEach((cell,i)=>{cell.resetMotion();cell.node.active=i<n*n;if(i>=n*n)return;cell.configure(c,this.state.level.palette[this.state.level.cells[i]],String.fromCharCode(65+this.state.level.cells[i]));cell.node.setPosition(-l.boardSize/2+(i%n+.5)*c,l.boardSize/2-(Math.floor(i/n)+.5)*c);});
            this.boardModel!.configure(this.state.level,l.boardSize,this.bounceStrength);
            const bw=l.landscape?146:194;
            [this.hintButton!,this.colorButton!,this.retryButton!].forEach((button,i)=>{
                this.setSize(button.node,bw,l.buttonHeight);button.node.setPosition(left+(i-1)*(bw+16),l.buttonsY);
                const icon=button.node.getChildByName('Icon');if(icon){icon.setPosition(0,l.landscape?25:19);this.setSize(icon,l.landscape?42:34,l.landscape?42:34);}
                const label=button.node.getChildByName('Label');if(label){label.setPosition(0,l.landscape?-28:-22);this.setSize(label,bw-12,42);label.getComponent(Label)!.fontSize=l.landscape?32:26;}
            });
            this.setSize(this.messageLabel!.node,l.landscape?450:650,l.landscape?98:l.compact?50:70);
            this.messageLabel!.fontSize=l.landscape?32:l.compact?23:26;
            this.messageLabel!.lineHeight=l.landscape?39:32;
            this.messageLabel!.node.setPosition(left,l.buttonsY-(l.landscape?120:83));
            this.modalDescription!.fontSize=l.landscape?32:27;
            this.modalDescription!.lineHeight=l.landscape?39:33;
            this.tutorialRules?.children.forEach(rule=>{const label=rule.getChildByName('RuleText')?.getComponent(Label);if(label){label.fontSize=l.landscape?30:26;label.lineHeight=l.landscape?36:31;}});
            this.modalScale=Math.min(1,(w-24)/620,(h-24)/740);
            this.setSize(this.modalConfirmButton!.node,470,l.modalActionHeight);
            this.setSize(this.modalPeek!,400,l.modalActionHeight);
            this.modalCard!.setScale(this.modalScale,this.modalScale,1);
            this.render();
            if(this.state.status!=='playing'&&!this.peeking&&this.modalMode!=='tutorial'&&!this.gallery!.isOpen)this.showResult(false);
        } finally {this.resizing=false;}
    }

    private render(finished = this.state.status === 'won', defer: number[] = []): void {
        this.boardModel!.sync(this.state, defer, finished);
        for (let i = 0; i < this.state.cells.length; i++) {
            this.renderCell(i,finished,!defer.includes(i));
        }
        this.levelLabel!.string = `${this.levelIndex + 1}/${LEVELS.length} · ${this.state.level.title}`;
        this.catsLabel!.string = `${this.state.found.length} / ${this.state.level.size}`;
        this.heartsLabel!.string = '';
        this.heartSprites.forEach((s,i)=>s.spriteFrame=i<this.state.hearts?this.heartFull:this.heartEmpty);
        if(this.sizeBadge)this.sizeBadge.string=this.state.level.size+' × '+this.state.level.size;
        if(this.hintBadge)this.hintBadge.string=String(this.state.hints);
        this.hintLabel!.string = 'Gợi ý';
        this.colorLabel!.string = this.inspecting ? 'Ẩn ký hiệu' : 'Xem màu';
        this.hintButton!.interactable = this.state.status === 'playing' && this.state.hints > 0 && !this.locked;
        this.colorButton!.interactable = this.state.status === 'playing' && !this.locked;
    }

    private renderCell(index: number, finished: boolean, revealed: boolean): void {
        this.cellViews[index].render(this.state.cells[index],finished,this.inspecting,
            this.hinted===index||this.selectedColor===this.state.level.cells[index],revealed,
            this.state.level.blockers?.find(b=>b.index===index),this.state.found.length);
    }

    private canPlay(): boolean {
        return this.ready && this.enabledInHierarchy && !this.locked && !this.modalRoot!.active && !this.gallery!.isOpen && this.state.status === 'playing';
    }

    private point(event: EventTouch): { x: number; y: number; index: number } {
        const p = event.getUILocation();
        const local = this.board!.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(p.x, p.y, 0));
        const n = this.state.level.size;
        const s = this.boardSize;
        const c = Math.floor(((local.x + s / 2) / s) * n);
        const r = Math.floor(((s / 2 - local.y) / s) * n);
        return { x: p.x, y: p.y, index: r >= 0 && r < n && c >= 0 && c < n ? r * n + c : -1 };
    }

    private touchStart(event: EventTouch): void {
        event.propagationStopped = true;
        if (!this.canPlay()) return;
        const p = this.point(event);
        if (p.index < 0) return;
        if (this.inspecting) {
            this.selectedColor = this.state.level.cells[p.index];
            this.render();
            return;
        }
        const access=cellAccess(this.state,p.index);
        if(access!=='open'){
            this.messageLabel!.string=access==='stone'?'Ô đá không có mèo.':`Tìm đủ ${this.state.level.blockers!.find(b=>b.index===p.index&&b.type==='lock')!['unlockAfter']} mèo để mở khóa.`;
            return;
        }
        const state = this.state.cells[p.index];
        if (state === 'unknown' || state === 'marked') {
            this.hold.begin(event.getID(), p.index, p.x, p.y, state === 'unknown');
        }
    }

    private touchMove(event: EventTouch): void {
        const p = event.getUILocation();
        this.hold.move(event.getID(), p.x, p.y);
    }

    private touchEnd(event: EventTouch): void {
        if (!this.ready) return;
        if (this.peeking && this.state.status === 'won') {
            this.peeking = false;
            this.showResult();
            return;
        }
        const action = this.hold.end(event.getID());
        this.clearRings();
        if (action && !this.inspecting) this.dispatch(action);
    }

    private touchCancel(event: EventTouch): void {
        if (event.getID() === this.hold.pointer) this.cancelHold();
    }

    private clearRings(): void {
        for (const c of this.cellViews) if (c.node.active) c.hold(0);
        this.boardModel?.releaseHold();
    }

    private cancelHold(): void {
        this.hold.cancel();
        this.clearRings();
    }

    private dispatch(action: Action): void {
        if (!this.canPlay()) return;
        this.cancelHold();
        this.hinted = -1;
        const result = applyAction(this.state, action);
        this.state = result.state;
        if(this.state.status==='won')this.completedPictures.add(this.levelIndex);
        const found = result.events.find((e) => e.type === 'found');
        const wrong = result.events.find((e) => e.type === 'wrong');
        const hint = result.events.find((e) => e.type === 'hint');

        if (found) this.locked = true;
        this.render(false, found?.excluded || []);

        if (hint) {
            this.hinted = hint.index!;
            this.messageLabel!.string = hint.reason!;
            this.cellViews[hint.index!].pop();
            this.boardModel!.hint(hint.index!);
            this.render(false);
        }

        if (found) {
            const index = found.index!;
            const p = this.cellViews[index].node.position;
            const token = this.generation;
            this.messageLabel!.string = 'Đúng rồi!';
            this.effects!.cross(p.x, p.y, this.boardSize, this.boardSize / this.state.level.size);
            this.boardModel!.found(index, found.excluded!);
            this.cellViews[index].pop();
            const unlocked=result.events.filter(e=>e.type==='unlocked');
            for(const event of unlocked)this.cellViews[event.index!].pop();
            if(unlocked.length)this.messageLabel!.string=`Đã mở ${unlocked.length} khóa!`;

            this.companion?.setExpression('happy',1.2);
            this.shakeBoard(6,.16);

            this.scheduleOnce(() => {
                if (token !== this.generation) return;
                this.locked = false;
                this.messageLabel!.string = this.instruction;
                if (this.state.status === 'won') {
                    this.inspecting = false;
                    this.hinted = -1;
                    this.selectedColor = -1;
                    this.render(true);
                    this.scheduleOnce(() => {if(token===this.generation)this.showResult();}, 0.6);
                } else {
                    this.render(false);
                }
            }, blastDuration(this.state.level.size, index, found.excluded!));
        }

        if (wrong) {
            this.cellViews[wrong.index!].shake();
            this.messageLabel!.string = 'Ô này không có mèo.';
            this.shakeBoard(3.8, 0.1);

            this.companion?.setExpression('surprised',.8);

            if (this.state.status === 'lost') this.showResult();
        }
    }

    onHint(): void {
        this.dispatch({ type: 'hint' });
    }

    onInspect(): void {
        if (!this.canPlay()) return;
        this.cancelHold();
        this.inspecting = !this.inspecting;
        this.selectedColor = -1;
        this.messageLabel!.string = this.inspecting ? 'Chạm một ô để xem các ô cùng màu.' : this.instruction;
        this.render();
    }

    onRetry(): void {
        if (this.ready && this.enabledInHierarchy) this.loadLevel(this.levelIndex);
    }

    onGallery(): void {
        if(!this.ready||!this.enabledInHierarchy)return;
        this.cancelVisuals();this.modalRoot!.active=false;this.modalMode='none';this.peeking=false;
        this.render();this.gallery!.showMenu(this.levelIndex,this.completedPictures);
    }

    private resumeFromGallery(): void {
        if(!this.coreTutorialSeen){this.showTutorial();return;}
        if(this.state.status!=='playing'){this.showResult(false);return;}
        this.messageLabel!.string=this.instruction;this.render();this.showMechanicTutorial();
    }

    private loadLevel(index: number): void {
        if(!Number.isInteger(index)||index<0||index>=LEVELS.length)return;
        this.cancelVisuals();
        this.gallery!.hide();
        this.levelIndex = index;
        this.state = createGame(LEVELS[index]);
        this.resultCelebrated = false;
        this.inspecting = false;
        this.selectedColor = -1;
        this.hinted = -1;
        this.peeking = false;
        this.modalMode = 'none';
        this.modalRoot!.active = false;
        this.messageLabel!.string = this.instruction;
        this.resize();
        if(!this.coreTutorialSeen)this.showTutorial();else this.showMechanicTutorial();
    }

    private showMechanicTutorial(): void {
        const blockers=this.state.level.blockers||[];
        let title='',description='';
        if(!this.taughtStone&&blockers.some(b=>b.type==='stone')){
            this.taughtStone=true;title='Ô đá';description='Ô có đá không chứa mèo.\nMàu bên dưới vẫn là màu của tranh.';
        }else if(!this.taughtLock&&blockers.some(b=>b.type==='lock')){
            this.taughtLock=true;title='Mở khóa';description='Tìm đủ số mèo ghi trên khóa để mở.\nKhóa 1 cần 1 mèo · Khóa 2 cần 2 mèo.';
        }
        if(title){this.mechanicTutorial=true;this.showModal('tutorial',title,description,'Đã hiểu');}
    }

    private showModal(mode: 'tutorial' | 'won' | 'lost', title: string, description: string, confirm: string): void {
        this.cancelHold();
        this.modalMode = mode;
        this.modalTitle!.string = title;
        this.modalDescription!.string = description;
        this.modalConfirmLabel!.string = confirm;
        this.modalPeek!.active = mode === 'won';

        this.tutorialRules!.active=mode==='tutorial'&&!this.mechanicTutorial;
        this.modalConfirmButton!.node.setPosition(0,mode==='tutorial'?-238:-190);
        this.modalGlow!.active=mode==='won';
        this.modalDescription!.node.setPosition(0,mode==='tutorial'?(this.mechanicTutorial?-90:-146):-80);
        this.modalTitle!.node.setPosition(0,mode==='tutorial'?68:mode==='won'?0:34);
        this.modalMascot!.node.setPosition(0,mode==='won'?285:205);
        this.setSize(this.modalMascot!.node,mode==='won'?112:240,mode==='won'?112:240);
        if(this.pictureThumbnail)this.pictureThumbnail.active=mode==='won';
        if(mode==='won')this.renderThumbnail();
        this.modalRoot!.active=true;
        this.modalMascot?.setExpression(mode==='lost'?'surprised':mode==='won'?'happy':'idle');
        const scale=this.modalScale,opacity=this.modalCard!.getComponent(UIOpacity)!;
        Tween.stopAllByTarget(this.modalCard!);Tween.stopAllByTarget(opacity);
        opacity.opacity=0;this.modalCard!.setScale(scale*.94,scale*.94,1);
        tween(opacity).to(.2,{opacity:255}).start();
        tween(this.modalCard!).to(.2,{scale:new Vec3(scale,scale,1)},{easing:'quadOut'}).start();
        if(mode==='won'&&!this.resultCelebrated){
            this.resultCelebrated=true;
            this.effects!.node.setParent(this.node);this.effects!.node.setSiblingIndex(this.node.children.length-1);
            const size=this.node.getComponent(UITransform)!.contentSize;
            this.effects!.celebrate(size.width,size.height);
        }
    }

    private showTutorial(): void {
        this.mechanicTutorial=false;
        this.showModal('tutorial', 'Tìm mèo', 'Chạm để đánh dấu ×\nGiữ 0,4 giây để tìm mèo', 'Bắt đầu');
    }

    private renderThumbnail(): void {
        const level=this.state.level,n=level.size,c=176/n;
        this.thumbnailPixels.forEach((sprite,i)=>{
            sprite.node.active=i<n*n;if(i>=n*n)return;
            sprite.color=color(level.palette[level.cells[i]]);
            this.setSize(sprite.node,c+.1,c+.1);
            sprite.node.setPosition(-88+(i%n+.5)*c,88-(Math.floor(i/n)+.5)*c);
        });
    }

    private showResult(animate=true): void {
        if (this.state.status === 'playing') return;
        if (this.state.status === 'lost') {
            this.showModal('lost', 'Thử lại nhé', 'Bạn đã dùng hết 3 tim.', 'Chơi lại');
            return;
        }
        this.modalRoot!.active=false;this.modalMode='none';
        this.gallery!.showOutro(this.levelIndex,animate);
        if(!this.resultCelebrated){
            this.resultCelebrated=true;
            this.effects!.node.setParent(this.gallery!.outroRoot!);
            this.effects!.node.setSiblingIndex(2); // confetti behind the picture, not across its pixels
            const size=this.node.getComponent(UITransform)!.contentSize;
            this.effects!.celebrate(size.width,size.height);
        }
    }

    onModalConfirm(): void {
        if (!this.ready || !this.enabledInHierarchy) return;
        if (this.modalMode === 'tutorial') {
            this.coreTutorialSeen=true;
            this.modalRoot!.active = false;
            this.modalMode = 'none';
            this.messageLabel!.string = this.instruction;
            this.showMechanicTutorial();
            return;
        }
        if(this.modalMode==='lost')this.loadLevel(this.levelIndex);
    }

    onPeek(): void {
        if (this.modalMode !== 'won') return;
        this.modalRoot!.active = false;
        this.modalMode = 'none';
        this.peeking = true;
        this.messageLabel!.string = 'Chạm tranh để tiếp tục.';
    }

    update(dt: number): void {
        if (!this.ready) return;

        if (!this.canPlay() || this.inspecting) return;
        const action = this.hold.tick(dt);
        this.clearRings();
        if (this.hold.index >= 0) {
            this.cellViews[this.hold.index].hold(this.hold.progress);
            this.boardModel!.hold(this.hold.index, this.hold.progress);
        }
        if (action) this.dispatch(action);
    }

    onDestroy(): void {
        view.off('canvas-resize', this.resize, this);
        if (!this.ready) return;
        this.cancelVisuals();
        this.board!.off(Node.EventType.TOUCH_START, this.touchStart, this);
        this.board!.off(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.board!.off(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.board!.off(Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
    }
}
