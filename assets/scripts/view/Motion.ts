export function blastDelay(n:number,origin:number,index:number):number{
    const dr=Math.abs(Math.floor(index/n)-Math.floor(origin/n)),dc=Math.abs(index%n-origin%n);
    return dr===0||dc===0?.10+(dr+dc)*.028:.18+(dr+dc)*.018;
}
export function blastDuration(n:number,origin:number,excluded:number[]):number{
    return Math.max(1.05,...excluded.map(i=>blastDelay(n,origin,i)+.88));
}
export interface ShardTrajectory { x:number;y:number;z:number;vx:number;vy:number;vz:number;life:number; }
export function sampleShard(p:ShardTrajectory,age:number,limit:number){
    const t=Math.max(0,age),f=Math.min(1,t/p.life);
    return {x:Math.max(-limit,Math.min(limit,p.x+p.vx*t)),y:Math.max(-limit,Math.min(limit,p.y+p.vy*t)),
        z:p.z+p.vz*t-240*t*t,scale:f<.65?1:Math.max(0,(1-f)/.35)};
}
