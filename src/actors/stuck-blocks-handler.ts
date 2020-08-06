import {EventManager} from '../event-manager/event-manager';
import {Events} from '../event-manager/events';
import {scale} from '../scale';
import dimension from '../level-dimension';
import Point = Phaser.Geom.Point;

export class StuckBlocksHandler {
    private scene: Phaser.Scene;
    private cells: Point[];
    private sprites: Phaser.GameObjects.Sprite[];

    public constructor(options: { scene: Phaser.Scene }) {
        this.scene = options.scene;
        this.sprites = [];
        this.cells = [];
        EventManager.on(Events.BLOCK_DIED, (event: { stuckCells: Point[] }) => {
            this.cells = this.cells.concat(event.stuckCells);
            this.detectLineElimination();
            this.renderSprites();
        });

    }

    private renderSprites() {
        this.sprites.forEach(sprite => sprite.destroy());
        this.sprites = [];
        this.cells.forEach(cell => {
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
        this.cells
            .forEach(cell => --lineCounter[cell.y]);
        const linesToEliminate = lineCounter.reduce((acc, line, index) => {
            if (line <= 0) {
                acc.push(index);
            }
            return acc;
        }, []);
        if (linesToEliminate.length) {
            this.cells = this.cells
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

        EventManager.emit(Events.STUCK_BLOCKS_ELIMINATED, this.cells);
    }
}
