import {Command} from '../command';
import {InputManager} from '../input-manager';
import {Events} from '../event-manager/events';
import {Board} from '../actors/board';
import {FallingBlock} from '../actors/falling-block';
import {EventManager} from '../event-manager/event-manager';
import {BlockFactory} from '../actors/block-factory';

export class MainScene extends Phaser.Scene {

    private gameRunning: boolean;
    private fastPaceEnabled: boolean = false;
    private milliSecondsPerLevel: number = 200;
    private totalTime: number;
    private updateTimeCounterMs: number = 0;
    private backgroundMusic: Phaser.Sound.BaseSound;

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    public async create(): Promise<void> {
        this.backgroundMusic = this.sound.add('game-opener', {volume: 0.5});
        this.backgroundMusic.play();
        EventManager.emit(Events.GAME_BEGAN);
        this.gameRunning = true;
        this.totalTime = 0;
        new Board({scene: this});
        new FallingBlock({scene: this});
        new InputManager({scene: this});
        new BlockFactory({scene: this});
        EventManager.emit(Events.BOARD_CREATE_NEW_BLOCK);
        this.registerToEvents();
    }

    public update(time: number, delta: number): void {
        if (this.gameRunning) {
            this.totalTime += delta;
            this.updateTimeCounterMs += delta;
            if (this.updateTimeCounterMs > this.milliSecondsPerLevel || this.fastPaceEnabled) {
                this.fastPaceEnabled = false;
                this.updateTimeCounterMs %= this.milliSecondsPerLevel;
                this.milliSecondsPerLevel = Math.max(this.milliSecondsPerLevel * .999, 100);
                EventManager.emit(Events.GO_DOWN_ONE_LEVEL);
            }
            EventManager.emit(Events.UPDATE, delta);
        }
    }

    private registerToEvents() {
        EventManager.on(Events.GAME_OVER, () => {
            this.gameRunning = false;
            setTimeout(() => {
                EventManager.emit(Events.CLEAR_SCENE);
                this.scene.start('SplashScene');
            }, 5000);
        });
        EventManager.on(Events.INPUT_COMMAND, command => {
            if (command === Command.Down) {
                this.fastPaceEnabled = true;
            }
        });
        EventManager.on(Events.BLOCK_DIED, event => {
            if (event.stuckCells.find(cell => cell.y < 0)) {
                EventManager.emit(Events.GAME_OVER);
            } else {
                EventManager.emit(Events.BOARD_CREATE_NEW_BLOCK);
            }
        });
    }

}
