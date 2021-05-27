/// <reference path="./phaser.d.ts"/>

import 'phaser';
import {scale} from './scale';
import dimension from './level-dimension';
import {ContainersManager} from './scenes/containers-manager';
import {SplashScene} from './scenes/splash-scene';

export const [gameScreenWidth, gameScreenHeight] = [dimension.x * scale * 1.5, dimension.y * scale];

const config: GameConfig = {
    width: gameScreenWidth,
    height: gameScreenHeight,
    type: Phaser.AUTO,
    parent: 'game',
    scene: [SplashScene, ContainersManager],
};

export class Game extends Phaser.Game {
    constructor(config: GameConfig) {
        super(config);
    }
}

window.addEventListener('load', () => new Game(config));
