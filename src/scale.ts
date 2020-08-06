import dimension from './level-dimension';

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const ratio = Math.min(windowHeight / dimension.y, windowWidth / dimension.x);
export const scale: number = ratio - 1;
