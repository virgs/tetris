import Point = Phaser.Geom.Point;
import {EventManager} from '../event-manager/event-manager';
import {Events} from '../event-manager/events';
import {scale} from '../scale';
import dimension from '../level-dimension';
import {StuckCell} from './tetramino-stack';

export class TetraminoFactory {
    private static readonly blockVariety = [
        TetraminoFactory.squareBlock(),
        TetraminoFactory.giantI(),
        TetraminoFactory.sShaped(),
        TetraminoFactory.zShaped(),
        TetraminoFactory.lShaped(),
        TetraminoFactory.lInvertedShaped(),
        TetraminoFactory.tShaped()
    ];

    private readonly scene: Phaser.Scene;
    private nextPiece: { blocks: Phaser.Geom.Point[]; color: string };
    private position: Point = new Point(dimension.x * 1.2, dimension.y * 0.5);
    private sprites: Phaser.GameObjects.Sprite[] = [];

    public constructor(options: { scene: Phaser.Scene }) {
        this.scene = options.scene;
        this.nextPiece = TetraminoFactory.randomlyCreateNextBlock();
        this.previewNextPiece();
        EventManager.on(Events.RANDOMLY_GENERATE_TETRAMINO, (options: { stuckCells: StuckCell[] }) => {
            const next = this.nextPiece;
            this.nextPiece = TetraminoFactory.randomlyCreateNextBlock();
            this.previewNextPiece();

            EventManager.emit(Events.GIVE_LIFE_TO_TETRAMINO, {
                cells: next.blocks,
                color: next.color,
                stuckCells: options ? options.stuckCells : []
            });
        });
    }

    private static randomlyCreateNextBlock(): { blocks: Phaser.Geom.Point[]; color: string } {
        const possibles = TetraminoFactory.blockVariety;
        const randomIndex = Math.floor(Math.random() * possibles.length);
        return possibles[randomIndex];
    }

    private static squareBlock(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(0, 0), new Point(0, 1), new Point(1, 0), new Point(1, 1)],
            color: '0xe2d210'
        };
    }

    private static giantI(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(0, -1), new Point(0, 0), new Point(0, 1), new Point(0, 2)],
            color: '0x3fb04a'
        };
    }

    private static sShaped(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(-1, 1), new Point(0, 1), new Point(0, 0), new Point(1, 0)],
            color: '0xdb6f27'
        };
    }

    private static zShaped(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(-1, 0), new Point(0, 0), new Point(0, 1), new Point(1, 1)],
            color: '0x844d9d'
        };
    }

    private static tShaped(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(-1, 0), new Point(0, 0), new Point(0, 1), new Point(1, 0)],
            color: '0x46c6e5'
        };
    }

    private static lShaped(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(0, -1), new Point(0, 0), new Point(0, 1), new Point(1, 1)],
            color: '0xFF0000'
        };
    }

    private static lInvertedShaped(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(0, -1), new Point(0, 0), new Point(0, 1), new Point(-1, 1)],
            color: '0x3173b8'
        };
    }

    private previewNextPiece() {
        this.sprites
            .forEach(sprite => sprite.destroy());
        this.sprites = [];
        this.nextPiece.blocks
            .forEach(cell => {
                const sprite = this.scene.add.sprite((this.position.x + cell.x) * scale + (scale / 2),
                    (this.position.y + cell.y) * scale + (scale / 2), 'wall.bmp');
                sprite.setScale(scale / sprite.width);
                sprite.setTint(this.nextPiece.color as any);
                this.sprites.push(sprite);
            });
    }
}
