/* "Standardized" version - updated 2026-07 */

export default class AnimationFrameClock {

    defaultOptions = {
        autoStart: true,
        frameRate: false,
        interval: 1,
        cycleLimit: 0,
        onInterval: function () { },
        onRequest: function () { },
        onStart: function () { },
        onStop: function () { }
    };

    active = false;
    elapsedTotal = 0;
    cycles = 0;
    prevTS;
    request = null;
    autoStart = true;
    frameRate = false;
    interval = 1;
    cycleLimit = 0;
    onInterval = function () { };
    onRequest = function () { };
    onStart = function () { };
    onStop = function () { };

    constructor(_args) {

        let args;

        if (typeof arguments[0] == "object") {
            args = arguments[0];
        } else {
            args = arguments;
        }

        const options = { ...this.defaultOptions, ...args }

        this.autoStart = options.autoStart;

        this.frameRate = options.frameRate;

        if (this.frameRate) {
            this.interval = 1000 / this.frameRate;
        } else {
            this.interval = options.interval;
        }

        if (this.interval < 1) {
            this.interval = 1;
        }

        this.cycleLimit = options.cycleLimit;

        this.onStart = options.onStart;
        this.onStop = options.onStop;

        this.onRequest = options.onRequest;

        this.onInterval = options.onInterval;

        if (options[0] && typeof options[0] == "function") {
            this.onInterval = options[0];
        }

        if (options[1] && typeof options[1] == "number") {
            this.interval = options[1];
        }

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.toggle = this.toggle.bind(this);
        this.evolve = this.evolve.bind(this);

        this.resetStatus();

        if (this.autoStart) this.start();
    }

    start() {
        if (this.active) return false;
        this.active = true;
        this.request = window.requestAnimationFrame(this.evolve);
        this.onStart();
    }

    stop() {
        if (this.request) {
            window.cancelAnimationFrame(this.request);
        }
        this.onStop();
        this.resetStatus();
    }

    resetStatus() {
        this.active = false;
        this.elapsedTotal = 0;
        this.cycles = 0;
        this.prevTS = undefined;
    }

    toggle() {
        if (this.active) {
            this.stop();
        } else {
            this.start();
        }
    }

    cycleLimitReached() {
        return this.cycleLimit > 0 && this.cycles >= this.cycleLimit;
    }

    evolve(ts) {

        if (!this.active) { return false; }

        if (this.prevTS === undefined) {
            this.prevTS = ts;
        }

        const lastElapsed = ts - this.prevTS;
        this.prevTS = ts;

        this.elapsedTotal += lastElapsed;

        this.onRequest();

        while (this.elapsedTotal >= this.interval && !this.cycleLimitReached()) {
            this.elapsedTotal -= this.interval;
            this.onInterval();
            this.cycles++;
        }

        if (!this.cycleLimitReached()) {
            this.request = window.requestAnimationFrame(this.evolve);
        } else {
            this.stop();
        }

    }
}