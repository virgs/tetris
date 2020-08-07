import Point = Phaser.Geom.Point;

export class BlockFactory {
    private readonly length: number = 4;
    private readonly cells: Point[];

    public constructor() {
        let initialCells = [new Point(0, 0), new Point(0, 1)];
        this.cells = this.addCells(this.length - initialCells.length, initialCells);
        this.centralize();
    }

    public randomlyCreateBlock(): Point[] {
        return this.cells;
    }

    private addCells(blocksToAdd: number, cells: Phaser.Geom.Point[]): Point[] {
        if (blocksToAdd <= 0) {
            return cells;
        }
        const indexToAddCell = Math.floor(Math.random() * cells.length);
        const point = cells[indexToAddCell];
        const verticalDirection = Math.floor(Math.random() * 3) - 1;
        const horizontalDirection = Math.floor(Math.random() * 3) - 1;
        if (verticalDirection !== 0 && horizontalDirection !== 0) {
            return this.addCells(blocksToAdd, cells);
        }
        const newCell = new Point(point.x + horizontalDirection, point.y + verticalDirection);
        if (!cells.find(cell => cell.x === newCell.x && cell.y === newCell.y)) {
            return this.addCells(blocksToAdd - 1, cells.concat(newCell));
        }
        return this.addCells(blocksToAdd, cells);
    }

    private centralize() {
        const center = this.cells
            .reduce((center, cell) => {
                center.x += cell.x;
                center.y += cell.y;
                return center;
            }, new Point(0, 0));
        center.x = Math.floor(center.x / this.cells.length);
        center.y = Math.floor(center.y / this.cells.length);

        this.cells
            .forEach(cell => {
                cell.x -= center.x;
                cell.y -= center.y;
            });
    }
}
