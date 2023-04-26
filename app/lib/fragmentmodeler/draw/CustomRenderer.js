import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import { is, assign } from 'util/util';
import {getLabelColor, getSemantic} from 'bpmn-js/lib/draw/BpmnRenderUtil';
import TextRenderer from 'bpmn-js/lib/draw/TextRenderer';

const HIGH_PRIORITY = 1500;

export default class CustomRenderer extends BaseRenderer {
    constructor(eventBus, bpmnRenderer) {
        super(eventBus, HIGH_PRIORITY);

        this.bpmnRenderer = bpmnRenderer;
    }

    drawShape(parentNode, element) {
        const shape = this.bpmnRenderer.drawShape(parentNode, element);

        if (is(element, 'bpmn:Task')) {
            this.renderEmbeddedTimeLabel(parentNode.gfx, element, 'right-top');
            return shape;
        }
    }

    renderEmbeddedTimeLabel(parentGfx, element, align) {
        let semantic = getSemantic(element);

        if (semantic.duration) {
            var duration = "\n" + "🕒:" + semantic.duration ;
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

        var text = TextRenderer.createText(label || '', options);

        svgClasses(text).add('djs-label');

        svgAppend(parentGfx, text);

        return text;
    }
}