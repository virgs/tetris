import {scale} from '../scale';
import dimension from '../level-dimension';
import {Events} from '../event-manager/events';
import {EventManager} from '../event-manager/event-manager';
import Point = Phaser.Geom.Point;

export type StuckCell = { block: Point, color: string };

export class Board {
    private scene: Phaser.Scene;
    private stuckCells: StuckCell[];
    private backgroundSprite: Phaser.GameObjects.Sprite;
    private sprites: Phaser.GameObjects.Sprite[];

    public constructor(options: { scene: Phaser.Scene }) {
        this.scene = options.scene;
        this.backgroundSprite = options.scene.add.sprite(0,
            0, 'empty-background.png');
        this.backgroundSprite.setOrigin(0, 0);
        this.backgroundSprite.setScale(scale / 10);
        this.sprites = [];
        this.stuckCells = [];
        this.registerToEvents();
    }

    private registerToEvents() {
        EventManager.on(Events.CLEAR_SCENE, () => {
            this.sprites
                .forEach(sprite => sprite.destroy());
            this.stuckCells = [];
            this.sprites = [];
        });
        EventManager.on(Events.BLOCK_DIED, (event: { stuckCells: Point[], color: string }) => {
            this.stuckCells = this.stuckCells.concat(event.stuckCells
                .map(deadCell => ({block: deadCell, color: event.color})));
            this.detectLineElimination();
            this.renderSprites();
        });

        EventManager.on(Events.BOARD_CREATE_NEW_BLOCK, () => {
            EventManager.emit(Events.RANDOMLY_GENERATE_NEXT_BLOCK, {stuckCells: this.stuckCells});
        });
    }

    private renderSprites() {
        this.sprites
            .forEach(sprite => sprite.destroy());
        this.sprites = [];
        this.stuckCells
            .forEach(cell => {
                const sprite = this.scene.add.sprite(cell.block.x * scale + (scale / 2),
                    cell.block.y * scale + (scale / 2), 'wall.bmp');
                sprite.setScale(scale / sprite.width);
                sprite.setAlpha(0.95);
                sprite.setTint(cell.color as any);
                this.sprites.push(sprite);
            });
    }

    private detectLineElimination() {
        const lineCounter = [...Array(+dimension.y)]
            .map(_ => +dimension.x);
        this.stuckCells
            .forEach(cell => --lineCounter[cell.block.y]);
        const linesToEliminate = lineCounter.reduce((acc, line, index) => {
            if (line <= 0) {
                acc.push(index);
            }
            return acc;
        }, []);
        if (linesToEliminate.length > 0) {
            this.stuckCells = this.stuckCells
                .reduce((cells, cell) => {
                    if (linesToEliminate.includes(cell.block.y)) {
                        return cells;
                    }
                    const linesToDescend = linesToEliminate
                        .filter(line => line > cell.block.y)
                        .length;
                    cells.push({
                        block: new Point(cell.block.x, cell.block.y + linesToDescend),
                        color: cell.color,
                    });
                    return cells;
                }, [] as StuckCell[]);
            this.scene.sound.add('points', {volume: 0.5}).play();
        }

    }
}
