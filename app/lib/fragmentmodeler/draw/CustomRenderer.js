import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import {is} from "../../util/Util";
import {assign} from 'min-dash';
import {getLabelColor, getSemantic} from 'bpmn-js/lib/draw/BpmnRenderUtil';
import {
    append as svgAppend,
    classes as svgClasses
} from 'tiny-svg';

const HIGH_PRIORITY = 1500;

export default class CustomRenderer extends BaseRenderer {
    constructor(eventBus, bpmnRenderer, textRenderer) {
        super(eventBus, HIGH_PRIORITY);

        this.bpmnRenderer = bpmnRenderer;
        this.textRenderer = textRenderer;
    }

    canRender(element) {
        return is(element, 'bpmn:Task');
    }

    drawShape(parentNode, element) {
        const shape = this.bpmnRenderer.drawShape(parentNode, element);
        this.renderEmbeddedTimeLabel(parentNode, element, 'right-top');
        return shape;
    }

    renderEmbeddedTimeLabel(parentGfx, element, align) {
        let semantic = getSemantic(element);

        if (semantic.duration) {
            var duration = "\n" + "🕒:" + semantic.duration;
        } else {
            duration = "";
        }

        return this.renderLabel(parentGfx, duration, {
            box: element,
            align: align,
            padding: 2,
            style: {
                fill: getLabelColor(element)
            }
        });
    }

    renderLabel(parentGfx, label, options) {

        options = assign({
            size: {
                width: 100
            }
        }, options);

        var text = this.textRenderer.createText(label || '', options);

        svgClasses(text).add('djs-label');

        svgAppend(parentGfx, text);

        return text;
    }
}

CustomRenderer.$inject = ['eventBus', 'bpmnRenderer', 'textRenderer'];
