import { _decorator, Component, Node, Sprite, SpriteFrame, UIOpacity, UITransform } from 'cc';
import { color } from './Ui';
import { VisualParticles } from './VisualParticles';
const {ccclass,property} = _decorator;

/** Bounded sprite effects; late wave emissions retain independent lifetimes. */
@ccclass('GameEffects')
export class GameEffects extends Component {
    @property([Node]) arms: Node[] = [];
    @property([Sprite]) particleSprites: Sprite[] = [];
    @property([SpriteFrame]) particleFrames: SpriteFrame[] = [];
    private particles = new VisualParticles(128);
    private age = 0;
    private originX = 0;
    private originY = 0;
    private crossActive = false;
    private celebrating = false;
    private cellSize = 100;
    private opacities: UIOpacity[] = [];
    private bind(): void {
        if (!this.opacities.length) this.opacities = this.particleSprites.map(s => s.node.getComponent(UIOpacity)!);
    }
    cross(x: number,y: number,size: number,cellSize=size/4): void {
        this.clear(); this.bind(); this.node.active = true;
        this.age = 0; this.originX = x; this.originY = y; this.crossActive = true;
        this.cellSize=cellSize;
        this.node.setPosition(x,y);
        const lengths = [size/2-x,size/2-y,size/2+x,size/2+y];
        this.arms.forEach((arm,i) => { arm.active=true; arm.getComponent(UITransform)!.setContentSize(Math.max(1,lengths[i]),Math.max(3,cellSize*.055)); arm.setScale(.01,1,1); });
        for (let i=0;i<6;i++) this.spawn(0,0,i*Math.PI/3,cellSize*.75,cellSize*.085,.30,0,'#FFFFFF');
    }
    private spawn(x:number,y:number,angle:number,speed:number,size:number,life:number,kind:number,hex:string):void {
        this.particles.emit({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,size,life,kind,hex});
    }
    poof(boardX:number,boardY:number,hex='#FFFFFF',isBorder=false):void {
        if (!this.node.active || this.celebrating) return;
        const x=boardX-this.originX,y=boardY-this.originY;
        // Small local dust wisps and a single glint leave the puzzle visible.
        for(let i=0;i<2;i++) this.spawn(x,y,i*Math.PI+.6+this.age,this.cellSize*(.24+i*.1),this.cellSize*.17,.28+i*.07,1,hex);
        this.spawn(x,y,this.age*3, this.cellSize*.55,this.cellSize*.075,.27,0,'#FFFFFF');
    }
    celebrate(width:number,height:number):void {
        this.clear(); this.bind(); this.node.active=true; this.node.setPosition(0,0);
        this.celebrating=true; this.age=0;
        const colors=['#FFD447','#9F64E4','#FF97BE','#62DCE5','#FFFFFF'];
        for(let i=0;i<96;i++) this.particles.emit({x:((i*73)%997)/997*width-width/2,y:height*.48+(i%7)*15,vx:Math.sin(i*2.4)*60,vy:-100-(i%5)*28,size:10+(i%4)*3,life:1.5+(i%5)*.15,kind:2,hex:colors[i%colors.length]});
    }
    update(dt:number):void {
        this.age+=dt; this.particles.tick(dt);
        if(this.crossActive){
            const scale=Math.min(1,this.age/.12);
            this.arms.forEach(a=>{a.setScale(scale,Math.max(.05,1-this.age/.24),1);a.active=this.age<.24;});
        }
        let alive=false;
        this.particles.items.forEach((p,i)=>{
            const s=this.particleSprites[i];if(!s)return;
            s.node.active=p.active;if(!p.active)return;alive=true;
            const t=p.age,f=t/p.life;
            s.spriteFrame=this.particleFrames[p.kind];s.color=color(p.hex);
            s.node.setPosition(p.x+p.vx*t,p.y+p.vy*t-(p.kind===2?110:45)*t*t);
            const scale=p.kind===1?.5+f*.85:1-f*.35;
            s.node.getComponent(UITransform)!.setContentSize(p.size*scale,p.size*scale);
            s.node.angle=p.kind===2?t*(150+i%5*60):t*60;
            this.opacities[i].opacity=(p.kind===1?105:255)*Math.min(1,(1-f)*(p.kind===1?1:3));
        });
        if(!alive&&this.age>1.5)this.clear();
    }
    clear():void {
        this.particles.clear(); this.crossActive=false;this.celebrating=false;this.age=0;
        this.arms.forEach(a=>a.active=false);this.particleSprites.forEach(s=>s.node.active=false);
        this.node.active=false;
    }
    onDisable():void { this.particles.clear(); }
}
