import {Command} from '../command';
import {InputManager} from '../input-manager';
import {Events} from '../event-manager/events';
import {FallingTetramino} from '../actors/falling-tetramino';
import {EventManager} from '../event-manager/event-manager';
import {TetraminoFactory} from '../actors/tetramino-factory';
import {TetraminoStack} from '../actors/tetramino-stack';

export class MainScene extends Phaser.Scene {

    private gameRunning: boolean;
    private fastPaceEnabled: boolean = false;
    private milliSecondsPerLevel: number = 200;
    private totalTime: number;
    private updateTimeCounterMs: number = 0;

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    public async create(): Promise<void> {
        this.initMembers();
        EventManager.emit(Events.GAME_BEGAN);
        new TetraminoStack({scene: this});
        new FallingTetramino({scene: this});
        new InputManager({scene: this});
        new TetraminoFactory({scene: this});
        EventManager.emit(Events.BOARD_CREATE_NEW_BLOCK);
        this.registerToEvents();
    }

    private initMembers() {
        this.sound.add('game-opener', {volume: 0.25}).play();
        this.updateTimeCounterMs = 0;
        this.milliSecondsPerLevel = 200;
        this.gameRunning = true;
        this.totalTime = 0;
    }

    public update(time: number, delta: number): void {
        if (this.gameRunning) {
            document.querySelector('body div#time-counter').textContent = (this.totalTime / 1000).toFixed(1);
            this.totalTime += delta;
            this.updateTimeCounterMs += delta;
            if (this.updateTimeCounterMs > this.milliSecondsPerLevel || this.fastPaceEnabled) {
                this.fastPaceEnabled = false;
                this.updateTimeCounterMs %= this.milliSecondsPerLevel;
                this.milliSecondsPerLevel = Math.max(this.milliSecondsPerLevel - delta / 1000, 100);
                EventManager.emit(Events.GO_DOWN_ONE_LEVEL);
            }
            EventManager.emit(Events.UPDATE, delta);
        }
    }

    private registerToEvents() {
        EventManager.on(Events.GAME_OVER, () => {
            EventManager.destroy();
            this.gameRunning = false;
            setTimeout(() => this.scene.start('SplashScene'), 5000);
        });
        EventManager.on(Events.INPUT_COMMAND, command => {
            if (command === Command.Down) {
                this.fastPaceEnabled = true;
            }
        });
        EventManager.on(Events.TETRAMINO_STACKED_UP, event => {
            if (event.stuckCells.find(cell => cell.y < 0)) {
                this.sound.add('game-over').play();
                EventManager.emit(Events.GAME_OVER);
            } else {
                EventManager.emit(Events.BOARD_CREATE_NEW_BLOCK);
            }
        });
    }

}
