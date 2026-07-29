import type Game from "./Game";

// import FryPan from "../../dependencies/frypan-1.0.1-DEV/main";
// import Scene from "../../dependencies/frypan-1.0.1-DEV/Scene";
import FryPan from "../../dependencies/frypan-1.0.1.js";

import config from "../config";

export default class Camera {

    private scene: FryPan.Scene;
    //private scene: Scene;
    private cursorCoolDown : number | null = null;

    constructor(game: Game) {

        const options = {
            viewportElement: game.viewportElement,
            maxZoomFactor: 15,
            spherical: true,
            enableMouseWheel: true,
            mouseWheelTakeover: true,
            autoZoomCursor: true,
            enableMouseDrag: true,
            dragKey: config.dragKey,
            autoDragCursor: true
        } as any;

        if (config.cellColumns != "auto") options.width = config.cellColumns * config.cellSize;
        if (config.cellRows != "auto") options.height = config.cellRows * config.cellSize;

        this.scene = new FryPan.Scene(options);

        this.scene.onUpdate = () => this.onUpdate();

        this.scene.onDragKeyDown = () => this.onDragMode(true);
        this.scene.onDragKeyUp = () => this.onDragMode(false);
    }

    //**** API ****//

    manualZoom(way: -1 | 1, zoomOrigin: {x: number, y: number}) {

        const zoomIncrement = way * 10 * this.scene.data.zoomFactor * this.scene.settings.intensityCurve;

        this.scene.setZoomOriginTo(zoomOrigin);
 
        if (!this.scene.changeZoomBy(zoomIncrement)) {
            clearTimeout(this.cursorCoolDown as number);
            this.scene.viewportElement!.style.cursor = "not-allowed";
            this.cursorCoolDown = setTimeout(() => {
                this.scene.viewportElement!.style.cursor = "";
            }, 250);
        }
    }

    getDisplayRects() {
        return this.scene.getClonesDisplayRects();
    }

    transposeCell(coords: { x: number, y: number } | null) {
        if (!coords) return null;

        const transposedCoords = this.scene.transpose({
            x: coords.x * config.cellSize,
            y: coords.y * config.cellSize
        });

        const scaledSize = this.scene.scale(config.cellSize);

        return {
            x: transposedCoords.x,
            y: transposedCoords.y,
            size: scaledSize,
        }
    }

    getOptimalMinZoomFactor() {
        const wRatio = window.innerWidth / this.scene.data.baseWidth;
        const hRatio = window.innerHeight / this.scene.data.baseHeight;
        const ratio = Math.max(wRatio, hRatio);
        return (ratio >= 1 / config.cellSize && ratio < 1) ? ratio : 1 / config.cellSize;
    }

    setOptimalMinZoomFactor() {
        const factor = this.getOptimalMinZoomFactor();
        this.scene.settings.minZoomFactor = factor;
        if (this.scene.data.zoomFactor < factor) this.scene.setZoomTo(factor);
    }

    //**** SHORTHANDS ****//

    scale(value: number): number {
        return this.scene.scale(value);
    }

    revertScale(value: number): number {
        return this.scene.revertScale(value);
    }

    transpose(coords: { x: number, y: number }): { x: number, y: number } {
        return this.scene.transpose(coords) as { x: number, y: number };
    }

    revertTranspose(coords: { x?: number, y?: number }): { x: number, y: number } {
        return this.scene.revertTranspose(coords) as { x: number, y: number };
    }

    center() {
        this.scene.center();
    }

    data() {
        return this.scene.data;
    }

    coordsInsideViewport(options : {}) {
        return this.scene.coordsInsideViewport(options);
    }

    forEachClone(callback: (clone: any) => void) {
        this.scene.forEachClone(callback);
    }

    trySetView(coords: {x: number, y:number, width: number, height: number}) {
        this.scene.trySetView(coords);
    }

    releaseCursor() {
        this.scene.interactions.releaseCursor(); // ! \ MAY BECOME PRIVATE IN FUTURE RELEASES
    }

    changeFPSetting(key: string, value: any) {
        this.scene.changeSetting(key, value);
    }

    //**** HOOKS ****//

    onUpdate() {}
    onDragMode(_mode: boolean) {}
}