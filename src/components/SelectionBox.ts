import config from "../config";
import type Game from "./Game";

export default class SelectionBox {
    
    private HTMLBox : HTMLElement;
    private coords: { x: number, y: number, width: number, height: number } = { x: 0, y: 0, width:0, height:0 };
    private mouseDownCoords: { x: number, y: number } = {x: 0, y: 0};
    private allowed: boolean = false;
    private active: boolean = false;

    constructor(game: Game) {

        this.HTMLBox = document.createElement("div");
        this.HTMLBox.className = "selection-box";
        document.body.insertBefore(this.HTMLBox, document.querySelector("#tool-palette"));

        game.viewportElement.addEventListener("mousedown", (e) => this.mouseDown(e));
        game.viewportElement.addEventListener("mousemove", (e) => this.mouseMove(e));
        window.addEventListener("mouseup", () => this.mouseUp());
    }

    //**** API ****//

    allow(mode: boolean = true) {
        this.allowed = mode;
    }

    activate(mode: boolean = true) {
        this.active = mode;
        if (this.active) this.HTMLBox.classList.add("active");
        else this.HTMLBox.classList.remove("active");
    }

    hasSelection() : boolean {
        return this.coords.width >= config.minSelectionBoxSize || this.coords.height >= config.minSelectionBoxSize 
    }

    //**** EVENT HANDLERS ****//

    mouseDown(e: MouseEvent) {
        if (!this.allowed) return;
        this.activate();
        this.mouseDownCoords = {
            x: e.offsetX,
            y: e.offsetY
        }

    }

    mouseMove(e: MouseEvent) {
        if (!this.active) return;
        this.updateCoords(e);
        this.applyCoords();
    }

    mouseUp() {
        if (this.active && this.hasSelection()) this.onSetSelection(this.coords);
        this.activate(false);
        setTimeout(() => {
            this.resetCoords();
            this.applyCoords();
        }, 50);
    }

    //**** COORDS / DIMENSIONS ****//

    updateCoords(e: MouseEvent) {
        const diff = {
            x: e.offsetX - this.mouseDownCoords.x,
            y: e.offsetY - this.mouseDownCoords.y
        }

        this.coords = {
            x: diff.x > 0 ? this.mouseDownCoords.x : e.offsetX,
            y: diff.y > 0 ? this.mouseDownCoords.y : e.offsetY,
            width: Math.abs(diff.x),
            height: Math.abs(diff.y)
        }
    }

    resetCoords() {
        this.coords = {
            x: 0,
            y: 0,
            width:0,
            height:0
        }
    }

    applyCoords() {
        this.HTMLBox.style.left = this.coords.x + "px";
        this.HTMLBox.style.top = this.coords.y + "px";
        this.HTMLBox.style.width = this.coords.width + "px";
        this.HTMLBox.style.height = this.coords.height + "px";
    }

    //**** HOOKS ****//

    onSetSelection(_coords: { x: number, y: number, width: number, height: number }) {}
}