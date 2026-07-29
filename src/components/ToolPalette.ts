import type Game from "./Game";

export default class ToolPalette {

    private viewportElement: HTMLElement;

    private HTMLPalette: HTMLElement = document.querySelector("#tool-palette")!;
    private handlebar: HTMLElement = document.querySelector("#tool-palette-handlebar")!;
    private cycleDisplay: HTMLElement = document.querySelector("#cycle-number")!;

    private paletteCoords: { x: number, y: number } = { x: 0, y: 0 };
    private mouseDownCoords: { x: number, y: number, paletteX: number, paletteY: number } = {
        x: 0,
        y: 0,
        paletteX: 0,
        paletteY: 0
    };
    private dragging: boolean = false;

    private toggleButton: HTMLElement = document.querySelector("#toggle-btn")!;
    private modeButtons: Record<string, HTMLElement> = {
        draw: document.querySelector("#draw-btn")!,
        nav:  document.querySelector("#nav-btn")!,
        zoom: document.querySelector("#zoom-btn")!
    }
    
    mode: "draw" | "nav" | "zoom" | null = null;

    constructor(game: Game) {

        this.viewportElement = game.viewportElement;

        this.movePaletteTo(10, window.innerHeight - this.HTMLPalette.offsetHeight - 10);

        this.handlebar.addEventListener("mousedown", (e) => this.handlebarMouseDown(e));
        window.addEventListener("mousemove", (e) => this.handlebarMouseMove(e));
        window.addEventListener("mouseup", () => this.mouseUp());

        this.toggleButton.addEventListener("click", () => this.toggleGame(game));
        this.modeButtons.draw.addEventListener("click", () => this.setMode("draw"));
        this.modeButtons.nav.addEventListener("click", () => this.setMode("nav"));
        this.modeButtons.zoom.addEventListener("click", () => this.setMode("zoom"));

        window.addEventListener("keyup", (e: KeyboardEvent) => {
            if (e.key == "r") this.toggleGame(game);
        });
    }

    //**** API ****//

    displayCycleNumber(cycleNumber: number) {
        this.cycleDisplay.textContent = `${cycleNumber}`;
    }

    toggleGame(game: Game) {

        game.toggle();
        if (game.isRunning()) {
            this.toggleButton.textContent = "❚❚";
            this.toggleButton.classList.add("active");
        } else {
            this.toggleButton.textContent = "▶";
            this.toggleButton.classList.remove("active");
        }
    }

    setMode(mode: "draw" | "nav" | "zoom") {

        if (this.mode) {
            this.modeButtons[this.mode].classList.remove("active");
            document.body.classList.remove(this.mode + "-mode");
        }
        this.mode = mode;
        this.modeButtons[mode].classList.add("active");
        document.body.classList.add(this.mode + "-mode");

        this.onSetMode(mode);
    }

    movePaletteTo(x: number, y:number) {
        this.paletteCoords = {x, y};
        this.HTMLPalette.style.left = this.paletteCoords.x + "px";
        this.HTMLPalette.style.top = this.paletteCoords.y + "px";
    }

    moveIntoWindow() {
        const maxX = window.innerWidth - this.HTMLPalette.offsetWidth - 10;
        const maxY = window.innerHeight - this.HTMLPalette.offsetHeight - 10;
        const overflowX = this.paletteCoords.x >= maxX;
        const overflowY = this.paletteCoords.y >= maxY;
        const x = overflowX ? maxX : this.paletteCoords.x;
        const y = overflowY ? maxY : this.paletteCoords.y;

        this.movePaletteTo(x, y);
    }

    //**** EVENT HANDLERS ****//

    handlebarMouseDown(e: MouseEvent) {
        this.dragging = true;
        this.mouseDownCoords = {
            x: e.clientX,
            y: e.clientY,
            paletteX: this.paletteCoords.x,
            paletteY: this.paletteCoords.y
        }
    }

    handlebarMouseMove(e: MouseEvent) {
        if (!this.dragging) return;

        const diff = {
            x: this.mouseDownCoords.x - e.clientX,
            y: this.mouseDownCoords.y - e.clientY
        }

        const newPosition = {
            x: this.mouseDownCoords.paletteX - diff.x,
            y: this.mouseDownCoords.paletteY - diff.y,
        }

        const finalPosition = {
            x: (newPosition.x >= 0 && newPosition.x <= this.viewportElement.offsetWidth - this.HTMLPalette.offsetWidth) ? newPosition.x : this.paletteCoords.x,
            y: (newPosition.y >= 0 && newPosition.y <= this.viewportElement.offsetHeight - this.HTMLPalette.offsetHeight) ? newPosition.y : this.paletteCoords.y
        }

        this.movePaletteTo(finalPosition.x, finalPosition.y);
    }

    mouseUp() {
        this.dragging = false;
    }

    //**** HOOKS ****//

    onSetMode(_mode : "draw" | "nav" | "zoom") {}
}