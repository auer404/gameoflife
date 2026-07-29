import type Camera from "./Camera";
import type CellsMatrix from "./CellsMatrix";
import type Game from "./Game";

import config from "../config";

export type canvasAPIoptions = {
    mainCanvas: HTMLCanvasElement,
    gridCanvas: HTMLCanvasElement
}

export default class CanvasAPI {

    private mainCanvas: HTMLCanvasElement;
    private mainCtx: CanvasRenderingContext2D;
    private gridCanvas: HTMLCanvasElement;
    private gridCtx: CanvasRenderingContext2D;
    private cells: CellsMatrix;
    private camera: Camera;

    constructor(game: Game, options: canvasAPIoptions) {
        this.cells = game.cells;
        this.mainCanvas = options.mainCanvas;
        this.mainCtx = this.mainCanvas.getContext("2d") as CanvasRenderingContext2D;
        this.gridCanvas = options.gridCanvas;
        this.gridCtx = this.gridCanvas.getContext("2d") as CanvasRenderingContext2D;
        this.camera = game.camera;
    }

    //**** API ****//

    resize() {
        this.mainCanvas.width = window.innerWidth;
        this.mainCanvas.height = window.innerHeight;
        this.gridCanvas.width = window.innerWidth;
        this.gridCanvas.height = window.innerHeight;
    }

    clear() {

        this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        this.gridCtx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
    }

    drawGrid() {

        const gridSize = this.camera.scale(config.cellSize);
        if (gridSize < config.minGridSize) return;

        const colsBefore = this.camera.data().x / gridSize;
        const startX = (colsBefore - Math.floor(colsBefore)) * gridSize;
        const rowsBefore = this.camera.data().y / gridSize;
        const startY = (rowsBefore - Math.floor(rowsBefore)) * gridSize;

        this.gridCtx.strokeStyle = config.gridColor;

        for (let x = startX; x < this.gridCanvas.width; x += gridSize) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, this.gridCanvas.height);
            this.gridCtx.stroke();
        }
        
        for (let y = startY; y < this.gridCanvas.height; y += gridSize) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(0, y);
            this.gridCtx.lineTo(this.gridCanvas.width, y);
            this.gridCtx.stroke();
        }      
    }

    drawCell(x: number, y: number) {

        const c = this.cells.get(x, y);

        if (c === 1) {

            const baseTransposedCell = this.camera.transposeCell({ x, y });
            if (!baseTransposedCell) return;

            this.camera.forEachClone((clone) => {

                const transposedCell = {...baseTransposedCell};

                transposedCell.x! += clone.position.x - this.camera.data().x;
                transposedCell.y! += clone.position.y - this.camera.data().y;

                if (!this.camera.coordsInsideViewport({x: transposedCell.x, y: transposedCell.y})) return;

                this.mainCtx.fillStyle = config.cellColor;
                this.mainCtx.beginPath();
                this.mainCtx.rect(
                    transposedCell.x as number,
                    transposedCell.y as number,
                    transposedCell.size,
                    transposedCell.size
                );
                this.mainCtx.fill();
            });
        }
    }

    drawCells() {

        const filters = this.camera.getDisplayRects();

        for (const filter of filters) {
            filter.x = Math.floor(filter.x / config.cellSize);
            filter.y = Math.floor(filter.y / config.cellSize);
            filter.width = Math.ceil(filter.width / config.cellSize);
            filter.height = Math.ceil(filter.height / config.cellSize);

            this.cells.forEach((x, y) => {
                this.drawCell(x, y);
            }, filter);   
        }
    }

    //**** DEBUG ****//

    debugDrawTrueSceneRect() {
        const data = this.camera.data();
        this.mainCtx.strokeStyle = "orange";
        this.mainCtx.beginPath();
        this.mainCtx.rect(data.x, data.y, data.width, data.height);
        this.mainCtx.stroke();
    }
}