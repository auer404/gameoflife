import config from "../config";

export default class DynamicCSS {
    
    constructor() {

        const rules = `
        body {
            --backgroundColor: ${config.backgroundColor};
            --cellColor: ${config.cellColor};
            --gridColor: ${config.gridColor};
        }`;

        const tag = document.createElement("style");
        document.head.append(tag);
        tag.textContent = rules;
    }
}