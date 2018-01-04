import React from 'react';
import { observable, computed } from 'mobx';
import { inject, observer } from 'mobx-react'

import { BoxesEditor } from '../BoxesEditor';

import styles from './VisualPreview.scss'

@observer
export default class VisualPreview extends React.Component {

    rootElement = null;

    @observable
    selectedBox = null;

    @computed
    get editable() {
        return this.props.editable;
    }

    @computed
    get line() {
        return this.props.line;
    }

    @computed
    get lineY() {
        return this.line.reduce((min, grapheme) => {
            return Math.min(min, grapheme.area.uly);
        }, this.line[0].area.uly) * this.previewToSurfaceRatio;
    }

    @computed
    get lineBottomY() {
        return this.line.reduce((min, grapheme) => {
            return Math.min(min, grapheme.area.lry);
        }, this.line[0].area.lry) * this.previewToSurfaceRatio;
    }

    @computed
    get previewImageWidth() {
        return this.image.naturalWidth;
    }

    @computed
    get lineHeight() {
        return this.lineBottomY - this.lineY;
    }

    @computed
    get previewToSurfaceRatio() {
        let surface = this.props.document.surfaces[0];

        return this.previewImageWidth / (surface.area.lrx - surface.area.ulx);
    }

    @computed
    get scaledLineHeight() {
        let ratio = this.canvas.offsetWidth / this.image.naturalWidth;

        return this.lineHeight * ratio;
    }

    @computed
    get pageImageUrl() {
        return this.props.document.surfaces[0].image_url;
    }

    get canvas() {
        if(this.rootElement === null) {
            return null;
        }
        else {
            return this.rootElement.getElementsByClassName('corpusbuilder-visual-preview-preview')[0];
        }
    }

    get canvasArea() {
        if(this.rootElement === null) {
            return null;
        }
        else {
            return this.rootElement.getElementsByClassName('corpusbuilder-visual-preview-canvas-area')[0];
        }
    }

    get image() {
        if(this.rootElement === null) {
            return null;
        }
        else {
            return this.rootElement.getElementsByClassName('corpusbuilder-visual-preview-preview-source')[0];
        }
    }

    onBoxSelectionChanged(box) {
        this.selectedBox = box;
    }

    captureRoot(div) {
        if(this.rootElement === null) {
            this.rootElement = div;

            setTimeout(() => {
                this.renderPreview();
            });
        }
    }

    renderPreview() {
        if(this.canvas !== null) {
            let context = this.canvas.getContext('2d');

            this.canvas.width = this.canvas.parentNode.offsetWidth;
            this.canvas.height = this.scaledLineHeight * 2;
            this.canvasArea.style.height = `${this.scaledLineHeight * 2}px`;

            context.drawImage(
                this.image,
                0,
                this.lineY - (this.lineHeight / 2),
                this.previewImageWidth,
                this.lineHeight * 2,
                0,
                0,
                this.canvas.width,
                this.scaledLineHeight * 2
            );
        }
    }

    render() {
        return (
            <div ref={ this.captureRoot.bind(this) } className="corpusbuilder-visual-preview-preview-wrapper">
                <img className="corpusbuilder-visual-preview-preview-source"
                    src={ this.pageImageUrl }
                    />
                <div className="corpusbuilder-visual-preview-canvas-area">
                    <canvas className="corpusbuilder-visual-preview-preview" />
                    <BoxesEditor line={ this.props.line }
                                 visible={ this.props.showBoxes }
                                 document={ this.props.document }
                                 editable={ this.editable }
                                 boxes={ this.props.boxes }
                                 onBoxSelectionChanged={ this.onBoxSelectionChanged.bind(this) }
                                 onBoxesReported={ this.props.onBoxesReported.bind(this) }
                                 />
                </div>
            </div>
        );
    }
}