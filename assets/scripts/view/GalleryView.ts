import { _decorator, Button, Component, Label, Node, Sprite, SpriteFrame, UIOpacity, UITransform } from 'cc';
import { LEVELS } from '../core/Levels';
import { galleryLayout, outroLayout, OutroClock } from '../core/Gallery';
import { color } from './Ui';
const {ccclass,property}=_decorator;

/** Owns only picture-selection and win presentation; the controller owns game state. */
@ccclass('GalleryView')
export class GalleryView extends Component {
    @property(Node) menuRoot:Node|null=null;
    @property(Node) menuCard:Node|null=null;
    @property(Label) menuTitle:Label|null=null;
    @property(Label) menuSubtitle:Label|null=null;
    @property(Button) closeButton:Button|null=null;
    @property([Button]) tiles:Button[]=[];
    @property([Sprite]) tileImages:Sprite[]=[];
    @property([Label]) tileLabels:Label[]=[];
    @property([Label]) tileBadges:Label[]=[];
    @property([SpriteFrame]) pictureFrames:SpriteFrame[]=[];
    @property(Node) outroRoot:Node|null=null;
    @property(Node) pictureFrame:Node|null=null;
    @property(Sprite) picture:Sprite|null=null;
    @property(Node) glow:Node|null=null;
    @property(Label) outroTitle:Label|null=null;
    @property(Label) outroName:Label|null=null;
    @property(Node) actions:Node|null=null;
    @property(Button) nextButton:Button|null=null;
    @property(Label) nextLabel:Label|null=null;
    @property(Button) chooseButton:Button|null=null;
    onChooseLevel:((index:number)=>void)|null=null;
    onCloseMenu:(()=>void)|null=null;
    onNext:(()=>void)|null=null;
    onChooseMenu:(()=>void)|null=null;
    private clock=new OutroClock();
    get isOpen():boolean { return !!(this.menuRoot?.active||this.outroRoot?.active); }
    get isMenuOpen():boolean { return !!this.menuRoot?.active; }
    get isOutroOpen():boolean { return !!this.outroRoot?.active; }

    private size(node:Node,w:number,h=w):void { node.getComponent(UITransform)!.setContentSize(w,h); }
    layout(width:number,height:number):void {
        for(const root of [this.menuRoot!,this.outroRoot!]){
            this.size(root,width,height);this.size(root.getChildByName('Backdrop')!,width,height);
        }
        const g=galleryLayout(width,height,this.tiles.length);
        const landscape=width>height;
        this.size(this.menuCard!,g.width,g.height);
        this.menuTitle!.node.setPosition(-50,g.height/2-45);
        this.size(this.menuTitle!.node,g.width-190,54);
        this.menuSubtitle!.node.setPosition(-40,g.height/2-91);
        this.size(this.menuSubtitle!.node,g.width-160,34);
        this.menuSubtitle!.fontSize=landscape?30:24;this.menuSubtitle!.lineHeight=landscape?32:28;
        this.closeButton!.node.setPosition(g.width/2-70,g.height/2-62);
        this.size(this.closeButton!.node,g.closeSize,g.closeSize);
        g.items.forEach((item,i)=>{
            const tile=this.tiles[i].node;this.size(tile,item.width,item.height);tile.setPosition(item.x,item.y);
            const imageSize=Math.min(item.width-28,item.height-(landscape?77:67));
            this.size(this.tileImages[i].node,imageSize);this.tileImages[i].node.setPosition(0,landscape?30:25);
            const label=this.tileLabels[i];this.size(label.node,item.width-10,landscape?64:54);label.node.setPosition(0,-item.height/2+(landscape?35:29));
            label.fontSize=g.labelFontSize;label.lineHeight=landscape?32:26;
            this.tileBadges[i].node.setPosition(item.width/2-18,item.height/2-16);
        });
        const o=outroLayout(width,height);
        this.pictureFrame!.setPosition(o.pictureX,o.pictureY);this.size(this.pictureFrame!,o.imageSize+40);
        this.size(this.picture!.node,o.imageSize);
        this.glow!.setPosition(o.pictureX,o.pictureY);this.size(this.glow!,o.imageSize+220);
        this.outroTitle!.node.setPosition(o.textX,o.titleY);this.size(this.outroTitle!.node,o.landscape?Math.min(650,width*.43):width-48,60);
        this.outroName!.node.setPosition(o.textX,o.nameY);this.size(this.outroName!.node,o.landscape?Math.min(650,width*.43):width-48,48);
        this.actions!.setPosition(o.actionsX,o.actionsY);
        for(const button of [this.nextButton!,this.chooseButton!])this.size(button.node,o.buttonWidth,o.buttonHeight);
        this.nextButton!.node.setPosition(o.landscape?0:-(o.buttonWidth+16)/2,0);
        this.chooseButton!.node.setPosition(o.landscape?0:(o.buttonWidth+16)/2,o.landscape?-132:0);
        this.refreshReveal();
    }

    showMenu(current:number,completed:ReadonlySet<number>):void {
        this.clock.reset();this.outroRoot!.active=false;this.menuRoot!.active=true;
        this.menuSubtitle!.string='20 bức tranh · Chọn bất kỳ màn nào';
        this.tiles.forEach((button,i)=>{
            button.interactable=true;this.tileImages[i].spriteFrame=this.pictureFrames[i];
            this.tileLabels[i].string=`${i+1} · ${LEVELS[i].title}`;
            this.tileBadges[i].string=completed.has(i)?'✓':i===current?'•':'';
            button.node.getComponent(Sprite)!.color=color(i===current?'#F3E6FF':'#FFFFFF');
        });
    }
    showOutro(index:number,animate=true):void {
        this.menuRoot!.active=false;this.outroRoot!.active=true;
        this.picture!.spriteFrame=this.pictureFrames[index];
        this.outroTitle!.string=index===LEVELS.length-1?'Hoàn thành bộ tranh!':'Bức tranh của bạn';
        this.outroName!.string=`${index+1}/${LEVELS.length} · ${LEVELS[index].title}`;
        this.nextLabel!.string=index===LEVELS.length-1?'Chơi từ đầu':'Tranh tiếp theo';
        this.clock.start();if(!animate)this.clock.settle();this.refreshReveal();
    }
    settle():void { this.clock.settle();this.refreshReveal(); }
    hide():void { this.clock.reset();this.menuRoot!.active=false;this.outroRoot!.active=false; }
    onTile(_event:unknown,value:string):void {
        const index=Number(value);
        if(this.menuRoot?.active&&Number.isInteger(index)&&index>=0&&index<LEVELS.length)this.onChooseLevel?.(index);
    }
    onClose():void { if(this.menuRoot?.active){this.menuRoot.active=false;this.onCloseMenu?.();} }
    onContinue():void {
        if(!this.outroRoot?.active||!this.clock.ready||!this.nextButton!.interactable)return;
        this.nextButton!.interactable=false;this.chooseButton!.interactable=false;this.onNext?.();
    }
    onChoose():void { if(this.outroRoot?.active&&this.clock.ready)this.onChooseMenu?.(); }
    update(dt:number):void { if(this.outroRoot?.active&&!this.clock.ready){this.clock.tick(dt);this.refreshReveal();} }
    private refreshReveal():void {
        if(!this.pictureFrame||!this.actions)return;
        const p=this.clock.progress,eased=1-Math.pow(1-p,3);
        const scale=.88+.12*eased+Math.sin(p*Math.PI)*.025;
        this.pictureFrame.setScale(scale,scale,1);
        this.pictureFrame.getComponent(UIOpacity)!.opacity=Math.min(1,p*2)*255;
        this.actions.getComponent(UIOpacity)!.opacity=this.clock.ready?255:0;
        if(this.nextButton)this.nextButton.interactable=this.clock.ready;
        if(this.chooseButton)this.chooseButton.interactable=this.clock.ready;
    }
    onDisable():void { this.settle(); }
    onDestroy():void { this.onChooseLevel=null;this.onCloseMenu=null;this.onNext=null;this.onChooseMenu=null; }
}
