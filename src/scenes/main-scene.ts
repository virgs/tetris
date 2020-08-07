import {Command} from '../command';
import {InputManager} from '../input-manager';
import {Events} from '../event-manager/events';
import {Board} from '../actors/board';
import {FallingBlock} from '../actors/falling-block';
import {EventManager} from '../event-manager/event-manager';

export class MainScene extends Phaser.Scene {

    private gameRunning: boolean;
    private updateTimeCounterMs: number = 0;
    private milliSecondsPerLevel: number = 200;
    private totalTime: number;

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    public async create(): Promise<void> {
        EventManager.emit(Events.GAME_BEGAN);
        this.gameRunning = true;
        this.totalTime = 0;
        new Board({scene: this});
        new FallingBlock({scene: this});
        new InputManager({scene: this});
        EventManager.emit(Events.BOARD_CREATE_NEW_BLOCK);
        this.registerToEvents();
    }

    public update(time: number, delta: number): void {
        if (this.gameRunning) {
            this.totalTime += delta;
            this.updateTimeCounterMs += delta;
            if (this.updateTimeCounterMs > this.milliSecondsPerLevel) {
                this.updateTimeCounterMs %= this.milliSecondsPerLevel;
                this.milliSecondsPerLevel = Math.max(this.milliSecondsPerLevel * .999, 85);
                EventManager.emit(Events.GO_DOWN_ONE_LEVEL);
            }
            EventManager.emit(Events.UPDATE, delta);
        }
    }

    private registerToEvents() {
        EventManager.on(Events.GAME_OVER, () => {
            this.gameRunning = false;
            setTimeout(() => {
                const score = this.totalTime / 1000;
                this.scene.start('ScoreScene', {score: score.toFixed(1)});
            }, 2000);
        });
        EventManager.on(Events.INPUT_COMMAND, command => {
            if (command === Command.Down) {
                this.updateTimeCounterMs += 200;
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
