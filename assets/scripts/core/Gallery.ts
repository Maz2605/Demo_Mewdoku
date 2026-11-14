/** Responsive geometry for the picture selector and full-size win presentation. */
export function galleryLayout(width: number, height: number, count: number) {
    const columns = width > height ? 5 : 4;
    const rows = Math.ceil(count / columns);
    const panelWidth = Math.min(width - 40, width > height ? 1320 : 680);
    const panelHeight = Math.min(height - 40, width > height ? 860 : 1120);
    const gap = 12, headerBottom = panelHeight / 2 - 116;
    const tileWidth = (panelWidth - 48 - gap * (columns - 1)) / columns;
    const tileHeight = (panelHeight - 164 - gap * (rows - 1)) / rows;
    const items = Array.from({length: count}, (_, i) => ({
        x: -panelWidth/2 + 24 + (i % columns + .5)*tileWidth + (i % columns)*gap,
        y: headerBottom - (Math.floor(i/columns)+.5)*tileHeight - Math.floor(i/columns)*gap,
        width: tileWidth, height: tileHeight,
    }));
    return {width: panelWidth, height: panelHeight, headerBottom, closeSize: 112, labelFontSize:width>height?30:24, items};
}

export function outroLayout(width: number, height: number) {
    const landscape = width > height;
    const imageSize = landscape ? Math.min(height-140,width*.5-80) : Math.min(width-104,height-400);
    return {
        landscape, imageSize, pictureX: landscape ? -width*.21 : 0, pictureY: landscape ? 0 : 10,
        textX: landscape ? width*.27 : 0,
        titleY: landscape ? 195 : 10+imageSize/2+112, nameY: landscape ? 125 : 10+imageSize/2+54,
        actionsX: landscape ? width*.27 : 0, actionsY: landscape ? -45 : 10-imageSize/2-104,
        buttonWidth: landscape ? Math.min(400,width*.34) : (width-96)/2,
        buttonHeight: 112,
    };
}

/** Reveal progress has no scheduled callbacks; resizing settles rather than replays it. */
export class OutroClock {
    active = false;
    private age = 0;
    get progress(): number { return this.active ? Math.min(1,this.age/.65) : 0; }
    get ready(): boolean { return this.active && this.age >= 1; }
    start(): void { this.active=true;this.age=0; }
    tick(dt: number): void { if(this.active)this.age=Math.min(1,this.age+Math.max(0,dt)); }
    settle(): void { if(this.active)this.age=1; }
    reset(): void { this.active=false;this.age=0; }
}
