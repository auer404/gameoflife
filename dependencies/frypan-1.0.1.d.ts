class Scene {
    constructor(_options){}
    viewportElement : HTMLElement | null = null;
    onUpdate() {}
    onDragKeyDown() {}
    onDragKeyUp() {}
    transpose(coords) : {x, y} {}
    revertTranspose(coords) : {x, y} {}
    scale(value) : number {}
    revertScale(value) : number {}
    center() {}
    setZoomOriginTo(coords) {}
    setZoomTo(number) {}
    changeZoomBy(value) : boolean {}
    getDisplayRect() : {x, y, width, height} {}
    coordsInsideViewport(coords) : boolean {}
    getClonesDisplayRects() : {x: number, y: number, width: number, height: number}[] {}
    forEachClone(callback) {}
    trySetView(coords) {}
    changeSetting(key, value) {}
    data = {
        x: number,
        y: number,
        width: number,
        height: number,
        baseWidth: number,
        baseHeight: number,
        zoomFactor: number,
        viewportWidth: number,
        viewportHeight: number
    }
    settings = {
        intensityCurve: number,
        minZoomFactor: number
    }
    interactions = { //!\ MAY BECOME PRIVATE ?
        releaseCursor: Function
    }
}

export type FryPan = {
    Scene : Scene
}