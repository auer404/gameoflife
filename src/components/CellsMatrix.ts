import config from "../config";

export default class CellsMatrix {

    private cells: Uint8Array;
    private nextCells: Uint8Array;
    private width: number;
    private height: number;

    constructor() {

        const w = config.cellColumns;
        const h = config.cellRows;

        this.width = (w == "auto") ? Math.floor(window.innerWidth / config.cellSize) : w;
        this.height = (h == "auto") ? Math.floor(window.innerHeight / config.cellSize) : h;

        this.cells = new Uint8Array(this.width * this.height);
        this.nextCells = new Uint8Array(this.width * this.height);

        // this.soup();
    }

    //**** API ****//

    accepts(x: number, y: number) : boolean {
        return (
            x < this.width && x >= 0
            &&
            y < this.height && y >= 0
        );
    }

    get(x: number, y: number): number | null {
        if (!this.accepts(x,y)) return null;
        return this.cells[y * this.width + x] ?? null;
    }

    set(x: number, y: number, value: number) {
        if (!this.accepts(x,y)) return;
        this.cells[y * this.width + x] = value;
    }

    forEach(
        callback: (x: number, y: number) => void,
        filter: { x: number, y: number, width: number, height: number } | null = null
    ) {
        const startX = filter?.x ?? 0;
        const startY = filter?.y ?? 0;
        const endX = filter ? filter.x + filter.width : this.width;
        const endY = filter ? filter.y + filter.height : this.height;

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                callback(x, y);
            }
        }
    }

    update() {
        this.computeNextStates();
        [this.cells, this.nextCells] = [this.nextCells, this.cells];
    }

    toggle(x: number, y: number) {
        const c = this.get(x, y);
        this.set(x, y, (c == 0) ? 1 : 0);
    }

    w() {
        return this.width;
    }

    h() {
        return this.height;
    }

    computeNextStates() {

        const next = this.nextCells;

        const { width, height, cells } = this;

        for (let y = 0; y < height; y++) {
            const yUp = (y === 0 ? height - 1 : y - 1) * width;
            const yMid = y * width;
            const yDown = (y === height - 1 ? 0 : y + 1) * width;

            for (let x = 0; x < width; x++) {
                const xLeft = (x === 0 ? width - 1 : x - 1);
                const xRight = (x === width - 1 ? 0 : x + 1);

                const n =
                    cells[yUp + xLeft] + cells[yUp + x] + cells[yUp + xRight] +
                    cells[yMid + xLeft] + cells[yMid + xRight] +
                    cells[yDown + xLeft] + cells[yDown + x] + cells[yDown + xRight];

                const alive = cells[yMid + x];
                next[yMid + x] = (n === 3 || (alive === 1 && n === 2)) ? 1 : 0;
            }
        }
    }

    soup() {
        this.forEach((x, y) => {
            if (Math.random() < config.soupDensity ) this.set(x, y, 1);
        });
    }
}