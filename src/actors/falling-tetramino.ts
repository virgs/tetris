import {scale} from '../scale';
import {Command} from '../command';
import dimension from '../level-dimension';
import {Messages} from '../event-manager/messages';
import {MessageManager} from '../event-manager/message-manager';
import {StuckCell} from './tetramino-stack';
import Point = Phaser.Geom.Point;

export class FallingTetramino {
    private scene: Phaser.Scene;
    private stuckCells: Point[];
    private position: Phaser.Geom.Point;
    private sprites: Phaser.GameObjects.Sprite[];
    private cells: Phaser.Geom.Point[];
    private nextCommand: Command[] = [];
    private color: string;

    public constructor(options: { scene: Phaser.Scene }) {
        this.scene = options.scene;
        this.stuckCells = [];
        this.cells = [];
        this.sprites = [];
        this.nextCommand = [];
        this.position = new Point(dimension.x / 2 - 1, -5);

        MessageManager.on(Messages.UPDATE_TIME_ELAPSED, () => this.update());
        MessageManager.on(Messages.INPUT_DETECTED, command => this.nextCommand.push(command));
        MessageManager.on(Messages.ONE_STEP_DOWN_TIME_ELAPSED, () => this.goDownOneLevel());
        MessageManager.on(Messages.GIVE_LIFE_TO_TETRAMINO, (event: { cells: Point[], stuckCells: StuckCell[], color: string }) => {
            this.color = event.color;
            this.nextCommand = [];
            const centerPoint = new Point(dimension.x / 2 - 1, -(event.cells.length + 1));
            this.position = centerPoint;
            this.cells = event.cells;
            this.stuckCells = event.stuckCells.map(cell => cell.block);
        });
        MessageManager.on(Messages.GAME_OVER, () => this.sprites.forEach(sprite => sprite.destroy()));
    }

    private goDownOneLevel() {
        const nextPosition: Point = new Point(this.position.x, this.position.y + 1);
        if (!this.detectCollision(nextPosition, this.cells)) {
            this.position = nextPosition;
            this.renderSprites();
        } else {
            this.sprites.forEach(sprite => sprite.destroy());
            this.sprites = [];
            MessageManager.emit(Messages.FALLING_TETRAMINO_LANDED, {
                color: this.color,
                cells: this.cells
                    .map(cell => new Point(this.position.x + cell.x, this.position.y + cell.y))
            });
        }
    }

    private update(): void {
        while (this.nextCommand.length > 0) {
            this.position = this.calculateNextPosition(this.nextCommand.shift());
            this.renderSprites();
        }
    }

    private calculateNextPosition(nextCommand: Command) {
        let turnedCells = this.cells;
        const nextPosition: Point = new Point(this.position.x, this.position.y);
        if (nextCommand === Command.Left) {
            nextPosition.x = Math.max(0, nextPosition.x - 1);
        } else if (nextCommand === Command.Right) {
            nextPosition.x = Math.min(dimension.x, nextPosition.x + 1);
        } else if (nextCommand === Command.Rotate) {
            turnedCells = this.rotateClockWise(turnedCells);
        }

        const collidedWithRightBorder = turnedCells.find(cell => cell.x + nextPosition.x >= dimension.x) !== undefined;
        const collidedWithLeftBorder = turnedCells.find(cell => cell.x + nextPosition.x < 0) !== undefined;
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
        const nextCellsPosition = nextCellsShape
            .map(cell => new Point(cell.x + nextPosition.x, cell.y + nextPosition.y));
        const collidedWithAnotherBlock = this.stuckCells
            .find(otherBlockCell => nextCellsPosition
                .find(cell =>
                    cell.x === otherBlockCell.x && cell.y === otherBlockCell.y)) !== undefined;

        const collidedWithBottom = nextCellsShape.find(cell => cell.y + nextPosition.y >= dimension.y) !== undefined;
        return collidedWithAnotherBlock || collidedWithBottom;
    }

    private rotateClockWise(turnedCells: Phaser.Geom.Point[]) {
        // 2D Rotation matrix. Who would say those college classes would be useful?
        return turnedCells.map(cell => new Point(-cell.y, cell.x));
    }
}
