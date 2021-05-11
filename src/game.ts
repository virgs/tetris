/// <reference path="./phaser.d.ts"/>

import 'phaser';
import {scale} from './scale';
import dimension from './level-dimension';
import {MainScene} from './scenes/main-scene';
import {SplashScene} from './scenes/splash-scene';

const config: GameConfig = {
    width: dimension.x * scale * 1.5,
    height: dimension.y * scale,
    type: Phaser.AUTO,
    parent: 'game',
    scene: [SplashScene, MainScene],
};

export class Game extends Phaser.Game {
    constructor(config: GameConfig) {
        super(config);
    }
}

window.addEventListener('load', () => new Game(config));
