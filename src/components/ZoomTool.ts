import type Camera from "./Camera";
import type Game from "./Game";
import SelectionBox from "./SelectionBox";

export default class ZoomTool {

    private camera: Camera;
    private viewportElement: HTMLElement;
    private negativeMode: boolean = false;
    private zoomAllowed: boolean = false;
    private selectionBox: SelectionBox;

    constructor(game: Game) {

        this.viewportElement = game.viewportElement;
        this.camera = game.camera;

        this.selectionBox = new SelectionBox(game);
        this.selectionBox.onSetSelection = (coords) => this.zoomOnSelection(coords);

        this.viewportElement.addEventListener("click", (e) => this.click(e));

        window.addEventListener("keydown", (e) => this.keyDown(e));
        window.addEventListener("keyup", (e) => this.keyUp(e));

    }

    //**** EVENT HANDLERS ****//

    click(e: MouseEvent) {
        if (!this.zoomAllowed || this.selectionBox.hasSelection()) return;
        const way = (this.negativeMode) ? -1 : 1;
        this.camera.manualZoom(way, {x: e.offsetX, y: e.offsetY});
    }

    keyDown(e: KeyboardEvent) {
        if (e.key == "Alt") {
            this.negativeMode = true;
            document.body.classList.add("negative");
        }
    }

    keyUp(e: KeyboardEvent) {
        if (e.key == "Alt") {
            this.negativeMode = false;
            document.body.classList.remove("negative");
        }
    }

    //**** API ****//

    allow(mode: boolean = true) {
        this.zoomAllowed = mode;
        this.selectionBox.allow(mode);
    }

    zoomOnSelection(coords: { x: number, y: number, width: number, height: number }) {
        if (!this.negativeMode) {

            const transposed = this.camera.revertTranspose({x: coords.x, y: coords.y});
            this.camera.trySetView({
                x: transposed.x,
                y: transposed.y,
                width: this.camera.revertScale(coords.width),
                height: this.camera.revertScale(coords.height)
            });

        } else {
            
            const center = {
                x: coords.x + coords.width / 2,
                y: coords.y + coords.height / 2
            };
            this.camera.manualZoom(-1, center);
        }
    }
}