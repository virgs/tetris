import {scale} from '../scale';
import dimension from '../level-dimension';
import {BlockFactory} from './block-factory';
import {Events} from '../event-manager/events';
import {EventManager} from '../event-manager/event-manager';
import Point = Phaser.Geom.Point;

export class BoardHandler {
    private scene: Phaser.Scene;
    private stuckCells: Point[];
    private sprites: Phaser.GameObjects.Sprite[];

    public constructor(options: { scene: Phaser.Scene }) {
        this.scene = options.scene;
        this.sprites = [];
        this.stuckCells = [];
        EventManager.on(Events.BLOCK_DIED, (event: { stuckCells: Point[] }) => {
            this.stuckCells = this.stuckCells.concat(event.stuckCells);
            this.detectLineElimination();
            this.renderSprites();
        });

        EventManager.on(Events.BOARD_CREATE_NEW_BLOCK, () => {
            EventManager.emit(Events.CREATE_BLOCK, {
                cells: new BlockFactory().randomlyCreateBlock(),
                stuckCells: this.stuckCells
            });
        });
    }

    private renderSprites() {
        this.sprites.forEach(sprite => sprite.destroy());
        this.sprites = [];
        this.stuckCells.forEach(cell => {
            const sprite = this.scene.add.sprite(cell.x * scale + (scale / 2),
                cell.y * scale + (scale / 2), 'wall.bmp');
            sprite.setScale(scale / sprite.width);
            sprite.setAlpha(0.75);
            this.sprites.push(sprite);
        });
    }

    private detectLineElimination() {
        const lineCounter = [...Array(+dimension.y)]
            .map(_ => +dimension.x);
        this.stuckCells
            .forEach(cell => --lineCounter[cell.y]);
        const linesToEliminate = lineCounter.reduce((acc, line, index) => {
            if (line <= 0) {
                acc.push(index);
            }
            return acc;
        }, []);
        if (linesToEliminate.length) {
            this.stuckCells = this.stuckCells
                .reduce((cells, cell) => {
                    if (linesToEliminate.includes(cell.y)) {
                        return cells;
                    }
                    const linesToDescend = linesToEliminate
                        .filter(line => line > cell.y)
                        .length;
                    cells.push(new Point(cell.x, cell.y + linesToDescend));
                    return cells;
                }, []);
        }

    }
}
