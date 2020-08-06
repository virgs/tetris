import {Command} from '../command';
import {InputManager} from '../input-manager';
import {Events} from '../event-manager/events';
import {AliveBlock} from '../actors/alive-block';
import {BlockFactory} from '../actors/block-factory';
import {EventManager} from '../event-manager/event-manager';
import {StuckBlocksHandler} from '../actors/stuck-blocks-handler';

export class MainScene extends Phaser.Scene {

    private gameRunning: boolean;
    private inputManager: InputManager;
    private aliveBlock: AliveBlock;
    private updateTimeCounterMs: number = 0;
    private milliSecondsPerTile: number = 200;
    private stuckBlocksHandler: StuckBlocksHandler;
    private totalTime: number;

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    public async create(): Promise<void> {
        this.totalTime = 0;
        this.stuckBlocksHandler = new StuckBlocksHandler({scene: this});
        this.aliveBlock = this.createBlock();
        this.gameRunning = true;
        this.inputManager = new InputManager(this);

        EventManager.emit(Events.GAME_BEGAN);
        this.registerToEvents();
    }

    private registerToEvents() {
        EventManager.on(Events.GAME_OVER, () => {
            this.gameRunning = false;
            setTimeout(() => {
                this.destroy();
                let score = Math.trunc(this.totalTime / 1000);
                this.scene.start('ScoreScene', {score: score});
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
                this.aliveBlock = this.createBlock();
            }
        });
    }

    private createBlock(): AliveBlock {
        return new AliveBlock({
            cells: new BlockFactory().randomlyCreateBlock(),
            scene: this
        });
    }

    public update(time: number, delta: number): void {
        if (this.gameRunning) {
            this.totalTime += delta;
            this.updateTimeCounterMs += delta;
            if (this.updateTimeCounterMs > this.milliSecondsPerTile) {
                this.updateTimeCounterMs %= this.milliSecondsPerTile;
                this.aliveBlock.goDownOneLevel();
            }
            this.aliveBlock.update();
            this.inputManager.update(delta);
        }
    }

    private destroy() {
        EventManager.destroy();
        this.inputManager.destroy();
    }

}
