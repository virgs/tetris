import Point = Phaser.Geom.Point;
import {Command} from '../command';
import {Block} from '../actors/block';
import {ColorBlender} from '../color-blender';
import {InputManager} from '../input-manager';
import {Events} from '../event-manager/events';
import {BlockFactory} from '../actors/block-factory';
import {EventManager} from '../event-manager/event-manager';
import {StuckBlocksHandler} from '../actors/stuck-blocks-handler';

export class MainScene extends Phaser.Scene {

    private gameRunning: boolean;
    private inputManager: InputManager;
    private aliveBlock: Block;
    private updateTimeCounterMs: number = 0;
    private milliSecondsPerTile: number = 200;
    private stuckCells: Point[];
    private stuckBlocksHandler: StuckBlocksHandler;
    private totalTime: number;

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    public async create(): Promise<void> {
        this.totalTime = 0;
        this.stuckCells = [];
        this.aliveBlock = this.createBlock();
        this.stuckBlocksHandler = new StuckBlocksHandler({scene: this});
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
        EventManager.on(Events.STUCK_BLOCKS_ELIMINATED, stuckCells => this.stuckCells = stuckCells);
        EventManager.on(Events.BLOCK_DIED, event => {
            if (event.stuckCells.find(cell => cell.y < 0)) {
                EventManager.emit(Events.GAME_OVER);
            } else {
                this.stuckCells.push(event.stuckCells);
                this.aliveBlock = this.createBlock();
            }
        });
    }

    private createBlock(): Block {
        return new Block({
            cells: new BlockFactory().randomlyCreateBlock(),
            scene: this,
            stuckCells: this.stuckCells,
            color: new ColorBlender().generateColor()
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
