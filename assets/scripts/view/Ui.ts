import {Color} from 'cc';
export function color(hex:string,alpha=255):Color{const c=new Color();c.fromHEX(hex);c.a=alpha;return c;}
export function contrast(hex:string):string{const c=color(hex);return c.r*.299+c.g*.587+c.b*.114>150?'#39334F':'#FFFFFF';}
