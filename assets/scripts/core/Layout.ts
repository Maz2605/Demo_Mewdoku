export function computeLayout(width: number, height: number) {
    const landscape = width > height;
    const compact = !landscape && height < 1160;
    const boardSize = landscape ? Math.min(height - 150, width * .49, 720) : Math.min(width - 72, height - (compact ? 376 : 540), 720);
    const boardX = landscape ? width * .20 : 0;
    const boardY = landscape ? 0 : height / 2 - (compact ? 170 : 238) - boardSize / 2;
    const logoY=landscape?270:height/2-(compact?40:68);
    const galleryHeight=landscape?116:96;
    return {
        landscape, compact, boardSize, boardX, boardY, panelX: landscape ? -width * .29 : 0,
        buttonHeight: landscape ? 116 : 92,
        buttonsY: landscape ? -190 : boardY - boardSize / 2 - 80,
        logoY, galleryHeight, galleryY:Math.min(logoY,height/2-galleryHeight/2-12),
        logoHeight: landscape ? 100 : compact ? 58 : 94,
        levelY: landscape ? 177 : height / 2 - (compact ? 82 : 132),
        statusY: landscape ? 80 : height / 2 - (compact ? 125 : 184),
        statusHeight: compact ? 56 : 64,
        modalActionHeight: 112,
        modalWidth: Math.min(620, width - 32), modalHeight: Math.min(740, height - 40),
    };
}
