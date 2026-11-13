const {test}=require('node:test');const assert=require('node:assert/strict');
test('bounded effects drop excess emission and late puffs live for their full lifetime',()=>{
 const {VisualParticles}=require('../assets/scripts/view/VisualParticles.ts');
 const pool=new VisualParticles(2);
 assert.equal(pool.emit({x:0,y:0,vx:10,vy:0,life:.78,size:10,kind:0,hex:'#FFFFFF'}),true);
 pool.tick(.7);
 assert.equal(pool.emit({x:0,y:0,vx:0,vy:10,life:.78,size:10,kind:0,hex:'#FFFFFF'}),true);
 assert.equal(pool.emit({x:0,y:0,vx:0,vy:0,life:1,size:10,kind:0,hex:'#FFFFFF'}),false);
 pool.tick(.2);assert.equal(pool.items.filter(p=>p.active).length,1);
 assert.ok(Math.abs(pool.items[1].age-.2)<.00001);
 pool.clear();assert.equal(pool.items.filter(p=>p.active).length,0);
});
test('mascot reset discards the previous temporary expression deadline',()=>{
 const {ExpressionClock}=require('../assets/scripts/view/VisualParticles.ts');const clock=new ExpressionClock();
 clock.set('happy',1.2);clock.tick(.8);assert.equal(clock.expression,'happy');
 clock.reset();clock.set('surprised',.8);clock.tick(.5);assert.equal(clock.expression,'surprised');
 clock.tick(.31);assert.equal(clock.expression,'idle');
 clock.set('happy');clock.tick(30);assert.equal(clock.expression,'happy');
});
