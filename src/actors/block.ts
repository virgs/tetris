import {scale} from '../scale';
import {Command} from '../command';
import dimension from '../level-dimension';
import {Events} from '../event-manager/events';
import {EventManager} from '../event-manager/event-manager';
import Point = Phaser.Geom.Point;

export class Block {
    private scene: Phaser.Scene;
    private stuckCells: Point[];
    private position: Phaser.Geom.Point;
    private sprites: Phaser.GameObjects.Sprite[];
    private cells: Phaser.Geom.Point[];
    private nextCommand: Command[] = [];
    private alive: boolean;
    private readonly color: string;

    public constructor(options: { cells: Point[], scene: Phaser.Scene, stuckCells: Point[], color: string }) {
        this.color = options.color;
        this.alive = true;
        this.scene = options.scene;
        this.stuckCells = options.stuckCells;
        this.cells = [...options.cells];
        this.sprites = [];
        this.nextCommand = [];
        this.position = new Point(dimension.x / 2 - 1, -5);

        EventManager.on(Events.INPUT_COMMAND, command => this.nextCommand.push(command));
    }

    public goDownOneLevel() {
        if (this.alive) {
            const nextPosition: Point = new Point(this.position.x, this.position.y + 1);
            if (!this.detectCollision(nextPosition, this.cells)) {
                this.position = nextPosition;
                this.renderSprites();
            } else {
                this.alive = false;
                this.sprites.forEach(sprite => sprite.destroy());
                this.sprites = [];

                EventManager.emit(Events.BLOCK_DIED, {
                    block: this,
                    stuckCells: this.cells
                        .map(cell => new Point(this.position.x + cell.x, this.position.y + cell.y))
                });
            }
        }
    }

    public update(): void {
        if (this.alive) {
            if (this.nextCommand.includes(Command.Turn)) {
                this.nextCommand = this.nextCommand
                    .filter(command => command !== Command.Turn)
                    .concat(Command.Turn);
            }
            while (this.nextCommand.length > 0) {
                this.position = this.calculateNextPosition(this.nextCommand.shift());
                this.renderSprites();
            }
        }
    }

    private calculateNextPosition(nextCommand: Command) {
        let turnedCells = this.cells;
        const nextPosition: Point = new Point(this.position.x, this.position.y);
        if (nextCommand === Command.Left) {
            nextPosition.x = Math.max(0, nextPosition.x - 1);
        } else if (nextCommand === Command.Right) {
            nextPosition.x = Math.min(dimension.x, nextPosition.x + 1);
        } else if (nextCommand === Command.Turn) {
            turnedCells = this.rotateClockWise(turnedCells);
        }

        const collidedWithRightBorder = this.cells.find(cell => cell.x + nextPosition.x >= dimension.x) !== undefined;
        const collidedWithLeftBorder = this.cells.find(cell => cell.x + nextPosition.x < 0) !== undefined;
        const collidedWithAnotherBlock = this.detectCollision(nextPosition, turnedCells);
        if (collidedWithLeftBorder || collidedWithRightBorder || collidedWithAnotherBlock) {
            return new Point(this.position.x, this.position.y);
        }
        this.cells = turnedCells;
        return nextPosition;
    }

    private renderSprites() {
        this.sprites.forEach(sprite => sprite.destroy());
        this.sprites = [];
        this.cells.forEach(cell => {
            const sprite = this.scene.add.sprite((this.position.x + cell.x) * scale + (scale / 2),
                (this.position.y + cell.y) * scale + (scale / 2), 'wall.bmp');
            sprite.setScale(scale / sprite.width);
            sprite.setTint(this.color as any);
            this.sprites.push(sprite);
        });
    }

    private detectCollision(nextPosition: Phaser.Geom.Point, nextCellsShape: Phaser.Geom.Point[]): boolean {
        const collidedWithAnotherBlock = this.stuckCells
            .find(otherBlockCell => nextCellsShape
                .find(cell =>
                    cell.x + nextPosition.x === otherBlockCell.x &&
                    cell.y + nextPosition.y === otherBlockCell.y)) !== undefined;
        const collidedWithBottom = nextCellsShape.find(cell => cell.y + nextPosition.y >= dimension.y) !== undefined;
        return collidedWithAnotherBlock || collidedWithBottom;
    }

    private rotateClockWise(turnedCells: Phaser.Geom.Point[]) {
        return turnedCells.map(cell => new Point(-cell.y, cell.x));
    }
}
