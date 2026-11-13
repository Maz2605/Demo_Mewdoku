/** A real, reusable bevelled cube mesh. Pure data for Cocos and the glTF exporter. */
export function roundedCube(radius=.12, crown=0) {
    const positions:number[]=[],normals:number[]=[],uvs:number[]=[],indices:number[]=[];
    const grid=[-1,-.96,-.88,-.76,0,.76,.88,.96,1];
    const faces=[
        [[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]],
        [[1,0,0],[0,0,-1],[0,1,0]],[[-1,0,0],[0,0,1],[0,1,0]],
        [[0,1,0],[1,0,0],[0,0,-1]],[[0,-1,0],[1,0,0],[0,0,1]]
    ];
    for(const [normal,u,v] of faces){
        const base=positions.length/3,core=.5-radius;
        for(let y=0;y<grid.length;y++)for(let x=0;x<grid.length;x++){
            const p=normal.map((n,k)=>(n+u[k]*grid[x]+v[k]*grid[y])*.5);
            const q=p.map(a=>Math.max(-core,Math.min(core,a))),delta=p.map((a,k)=>a-q[k]),length=Math.hypot(...delta);
            const n=delta.map(a=>a/length);
            const point=q.map((a,k)=>a+n[k]*radius);
            // Smooth front crown. Transform normals by the deformation's inverse transpose;
            // duplicate edge vertices receive the same deformation so all six faces stay joined.
            const fx=1-4*point[0]*point[0],fy=1-4*point[1]*point[1],front=point[2]+.5;
            const nz=n[2]/(1+crown*fx*fy);
            const nx=n[0]+8*crown*point[0]*fy*front*nz;
            const ny=n[1]+8*crown*point[1]*fx*front*nz;
            const norm=Math.hypot(nx,ny,nz);
            point[2]+=crown*fx*fy*front;
            positions.push(...point);normals.push(nx/norm,ny/norm,nz/norm);uvs.push(x/8,y/8);
        }
        for(let y=0;y<8;y++)for(let x=0;x<8;x++){
            const a=base+y*9+x;indices.push(a,a+1,a+10,a,a+10,a+9);
        }
    }
    return {positions,normals,uvs,indices};
}
