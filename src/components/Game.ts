import CanvasAPI from "./CanvasAPI";
import CellsMatrix from "./CellsMatrix";
import AnimationFrameClock from "../../dependencies/AnimationFrameClock";
import Camera from "./Camera";
import ToolPalette from "./ToolPalette";
import PenTool from "./PenTool";
import ZoomTool from "./ZoomTool";
import config from "../config";

export default class Game {

    private running: boolean = false;
    private cycle: number = 0;
    cells: CellsMatrix = new CellsMatrix();
    viewportElement: HTMLElement = document.querySelector("#scene")!;
    canvas: CanvasAPI;
    private clock: AnimationFrameClock;
    camera: Camera;
    private tools: ToolPalette;
    private pen: PenTool;
    private zoom: ZoomTool;

    constructor() {

        this.viewportElement.style.backgroundColor = config.backgroundColor;

        this.camera = new Camera(this);
        this.camera.onUpdate = () => this.render();

        this.canvas = new CanvasAPI(this, {
            mainCanvas: document.querySelector("#main-canvas")!,
            gridCanvas: document.querySelector("#grid-canvas")!
        });

        this.clock = new AnimationFrameClock({
            autoStart: false,
            frameRate: config.frameRate
        });
        this.clock.onInterval = () => this.onCycle();

        this.tools = new ToolPalette(this);
        this.tools.onSetMode = (mode : "draw" | "nav" | "zoom") => this.setMode(mode);

        this.pen = new PenTool(this);
        this.pen.onRequestDraw = () => this.render();

        this.zoom = new ZoomTool(this);

        this.tools.setMode("draw");

        this.camera.center();
        this.camera.onDragMode = (mode) => {
            if (mode || this.tools.mode == "draw") this.pen.allow(!mode); 
            if (mode || this.tools.mode == "zoom") this.zoom.allow(!mode);
        }

        window.addEventListener("resize", () => this.resize());
        this.resize();

        if (config.autoRunOnMouseOut) {
            this.viewportElement.addEventListener("mouseenter", () => this.pause());
            this.viewportElement.addEventListener("mouseleave", () => this.resume());
        }
    }

    //**** API ****//

    isRunning() {
        return this.running;
    }

    resume() {
        this.clock.start();
        this.running = true;
    }

    pause() {
        this.clock.stop();
        this.running = false;
    }

    toggle() {
        if (this.running) this.pause();
        else this.resume();
    }

    render() {
        this.canvas.clear();
        this.canvas.drawGrid();
        this.canvas.drawCells();
    }

    resize() {
        this.canvas.resize();
        if (config.allowSmallerScale) this.camera.setOptimalMinZoomFactor();
        this.tools.moveIntoWindow();
    }

    setMode(mode: "draw" | "nav" | "zoom") {

        this.camera.releaseCursor();

        if (mode == "draw") {

            this.camera.changeFPSetting("dragKey", config.dragKey);
            this.pen.allow();
            this.zoom.allow(false);

        } else if (mode == "nav") {

            this.pen.allow(false);
            this.zoom.allow(false);
            this.camera.changeFPSetting("dragKey", false);

        } else if (mode == "zoom") {

            this.camera.changeFPSetting("dragKey", config.dragKey);
            this.pen.allow(false);
            this.zoom.allow();
        }
    }

    //**** CYCLE ****//

    onCycle() {
        //console.log("-----");
        //const startTS = Date.now();
        this.cells.update();
        //const udTS = Date.now();
        //console.log("Matrix update took " + (udTS - startTS) / 1000) + "s";
        this.render();
        //const rTS = Date.now();
        //console.log("Render took " + (rTS - udTS) / 1000) + "s";
        this.cycle++;
        this.tools.displayCycleNumber(this.cycle);
    }
}