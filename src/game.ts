/// <reference path="./phaser.d.ts"/>

import 'phaser';
import {scale} from './scale';
import dimension from './level-dimension';
import {GameController} from './scenes/game-controller';
import {SplashScene} from './scenes/splash-scene';
import { Types } from 'phaser';

export const [gameScreenWidth, gameScreenHeight] = [dimension.x * scale * 1.5, dimension.y * scale];

const config: Types.Core.GameConfig = {
    width: gameScreenWidth,
    height: gameScreenHeight,
    type: Phaser.AUTO,
    parent: 'game',
    audio: {
        disableWebAudio: true
    },
    scene: [SplashScene, GameController],
};

export class Game extends Phaser.Game {
    constructor(config: GameConfig) {
        super(config);
    }
}

window.addEventListener('load', () => new Game(config));
