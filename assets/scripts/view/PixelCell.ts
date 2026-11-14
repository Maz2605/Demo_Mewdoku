import { _decorator, Component, Label, Node, Sprite, tween, Tween, UITransform, Vec3 } from 'cc';
import { Blocker, CellState } from '../core/Puzzle';
import { color,contrast } from './Ui';
import { blockerAppearance, cellAppearance } from './CellAppearance';
const {ccclass,property}=_decorator;

/** All visual children are authored in PixelCell/GameRoot prefabs. */
@ccclass('PixelCell')
export class PixelCell extends Component {
    @property(Sprite) pixel:Sprite|null=null;
    @property(Label) marker:Label|null=null;
    @property(Sprite) markSprite:Sprite|null=null;
    @property(Sprite) dotSprite:Sprite|null=null;
    @property(Node) catNode:Node|null=null;
    @property(Sprite) outline:Sprite|null=null;
    @property(Sprite) holdRing:Sprite|null=null;
    @property(Sprite) stoneIcon:Sprite|null=null;
    @property(Sprite) lockIcon:Sprite|null=null;
    @property(Label) lockCount:Label|null=null;
    private width=80;private hex='#FFFFFF';private symbol='';
    configure(width:number,hex:string,symbol:string):void{
        this.width=width;this.hex=hex;this.symbol=symbol;this.node.getComponent(UITransform)!.setContentSize(width,width);
        this.pixel!.node.getComponent(UITransform)!.setContentSize(width+.1,width+.1);this.pixel!.color=color(hex);
        this.marker!.node.getComponent(UITransform)!.setContentSize(width,width);this.marker!.fontSize=Math.max(18,width*.3);
        this.catNode!.getComponent(UITransform)!.setContentSize(width*.72,width*.72);
        this.markSprite?.node.getComponent(UITransform)!.setContentSize(width*.50,width*.50);
        this.dotSprite?.node.getComponent(UITransform)!.setContentSize(width*.34,width*.34);
        this.outline!.node.getComponent(UITransform)!.setContentSize(width-4,width-4);this.holdRing!.node.getComponent(UITransform)!.setContentSize(width*.82,width*.82);
        for(const icon of [this.stoneIcon,this.lockIcon])if(icon){icon.node.getComponent(UITransform)!.setContentSize(width*.44,width*.44);icon.node.setPosition(width*.23,width*.23);}
        if(this.lockCount){this.lockCount.fontSize=Math.max(22,width*.23);this.lockCount.lineHeight=this.lockCount.fontSize+4;this.lockCount.node.getComponent(UITransform)!.setContentSize(width*.42,width*.38);this.lockCount.node.setPosition(width*.23,-width*.17);}
    }
    render(state:CellState,finished:boolean,inspect:boolean,selected:boolean,revealed=true,blocker?:Blocker,found=0):void{
        const appearance=cellAppearance(state,finished,inspect,revealed);
        // During play, color planes stay in the 3D pass below fragments. Only the
        // final picture uses this UI layer, otherwise it would occlude flying chips.
        this.pixel!.node.active=finished;this.catNode!.active=appearance.cat;
        this.marker!.string=appearance.symbol?this.symbol:'';
        if(this.markSprite)this.markSprite.node.active=appearance.mark;
        if(this.dotSprite)this.dotSprite.node.active=false; // Compatibility with older serialized cells.
        this.marker!.color=color(contrast(this.hex));this.outline!.node.active=!finished&&(selected||state==='wrong');this.outline!.color=color(state==='wrong'?'#D84C78':'#FFFFFF');
        const obstacle=blockerAppearance(blocker,state,found,finished,revealed);
        if(this.stoneIcon)this.stoneIcon.node.active=obstacle==='stone';
        if(this.lockIcon)this.lockIcon.node.active=obstacle==='lock';
        if(this.lockCount){this.lockCount.node.active=obstacle==='lock';this.lockCount.string=blocker?.type==='lock'?String(blocker.unlockAfter):'';}
        this.marker!.node.setPosition(obstacle==='none'?0:-this.width*.22,obstacle==='none'?0:-this.width*.18);
    }
    hold(progress:number):void{this.holdRing!.fillRange=progress;}
    pop(delay=0):void{
        Tween.stopAllByTarget(this.node);
        this.node.setScale(1,1,1);
        tween(this.node)
            .delay(delay)
            .to(0.08,{scale:new Vec3(1.18,0.84,1)})
            .to(0.14,{scale:new Vec3(0.92,1.20,1)},{easing:'quadOut'})
            .to(0.16,{scale:Vec3.ONE},{easing:'backOut'})
            .start();
        if(this.catNode){
            Tween.stopAllByTarget(this.catNode);
            this.catNode.setScale(0.2,0.2,1);
            tween(this.catNode)
                .delay(delay)
                .to(0.18,{scale:new Vec3(1.18,1.18,1)},{easing:'backOut'})
                .to(0.12,{scale:Vec3.ONE})
                .start();
        }
    }
    shake():void{const p=this.node.position.clone();Tween.stopAllByTarget(this.node);tween(this.node).by(.05,{position:new Vec3(5,0,0)}).by(.05,{position:new Vec3(-10,0,0)}).to(.06,{position:p}).start();}
    resetMotion():void{Tween.stopAllByTarget(this.node);this.node.setScale(1,1,1);if(this.catNode){Tween.stopAllByTarget(this.catNode);this.catNode.setScale(1,1,1);}this.hold(0);}
    onDisable():void{this.resetMotion();}
}
