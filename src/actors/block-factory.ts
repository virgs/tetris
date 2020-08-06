import Point = Phaser.Geom.Point;

export class BlockFactory {

    public randomlyCreateBlock(): Point[] {
        const possibles = [
            BlockFactory.squareBlock(),
            BlockFactory.giantI(),
            BlockFactory.sShaped(),
            BlockFactory.zShaped(),
            BlockFactory.tShaped()
        ];
        const randomIndex = Math.floor(Math.random() * possibles.length);
        return possibles[randomIndex];
    }

    private static squareBlock(): Point[] {
        return [new Point(0, 0), new Point(0, 1), new Point(1, 0), new Point(1, 1)];
    }

    private static giantI(): Point[] {
        return [new Point(0, -1), new Point(0, 0), new Point(0, 1), new Point(0, 2)];
    }

    private static sShaped(): Point[] {
        return [new Point(-1, 1), new Point(0, 1), new Point(0, 0), new Point(1, 0)];
    }

    private static zShaped(): Point[] {
        return [new Point(-1, 0), new Point(0, 0), new Point(0, 1), new Point(1, 1)];
    }

    private static tShaped(): Point[] {
        return [new Point(-1, 0), new Point(0, 0), new Point(0, 1), new Point(1, 0)];
    }
}
