import type Camera from "./Camera";
import type CellsMatrix from "./CellsMatrix";
import type Game from "./Game";

import config from "../config";

export default class PenTool {

    private cells: CellsMatrix;
    private camera: Camera;
    private viewportElement: HTMLElement;
    private  mouse: { x: number, y: number, pressed: boolean } = { x: 0, y: 0, pressed: false }
    private  eraserMode: boolean = false;
    private drawAllowed: boolean = false;

    constructor(game: Game) {

        this. viewportElement = game.viewportElement;
        this.cells = game.cells;
        this.camera = game.camera;

        this.viewportElement.addEventListener("mousemove", (e) => this.mouseMove(e));
        this.viewportElement.addEventListener("mousedown", () => this.mouseDown());
        window.addEventListener("mouseup", () => this.mouseUp());
    }

    //**** EVENT HANDLERS ****//

    mouseMove(e: MouseEvent) {

        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        
        if (this.mouse.pressed && this.drawAllowed) {
            const hovered = this.getCurrentHoveredCell();
            if (hovered && this.eraserMode) this.cells.set(hovered.x, hovered.y , 0);
            else if (hovered) this.cells.set(hovered.x, hovered.y , 1);
            this.onRequestDraw();
        }
    }

    mouseDown() {
        this.mouse.pressed = true;

        if (!this.drawAllowed) return;

        const hovered = this.getCurrentHoveredCell();

        if (hovered) {
            this.cells.toggle(hovered.x, hovered.y);
            if (this.cells.get(hovered.x, hovered.y) === 0) {
                this.eraserMode = true;
            }
            this.onRequestDraw();
        }
    }

    mouseUp() {
        this.mouse.pressed = false;
        this.eraserMode = false;
    }

    //**** API ****//

    allow(mode: boolean = true) {
        this.drawAllowed = mode;
    }

    getCurrentHoveredCell(): { x: number, y: number } | null {

        const world = this.camera.revertTranspose({
            x: this.mouse.x,
            y: this.mouse.y
        });

        if (world.x === undefined || world.y === undefined) return null;

        if (world.x === undefined || world.y === undefined) return null;

        let x = Math.floor(world.x / config.cellSize);
        let y = Math.floor(world.y / config.cellSize);

        const cellExists = this.cells.get(x,y) !== null;

        if (!cellExists) {

            const w = this.cells.w();
            const h = this.cells.h();

            while (x < 0) x += w;
            while (x >= w) x -= w;

            while (y < 0) y += h;
            while (y >= h) y -= h;
        }

        return { x, y };
    }

    //**** HOOKS ****//

    onRequestDraw() {}
}