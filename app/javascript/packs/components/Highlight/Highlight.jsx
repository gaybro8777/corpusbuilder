import React from 'react';
import { observable, computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import PagePositioningHelper from '../../lib/PagePositioningHelper';
import MathUtils from '../../lib/MathUtils';
import GraphemesUtils from '../../lib/GraphemesUtils';
import s from './Highlight.scss'

@observer
export default class Highlight extends React.Component {

    @computed
    get surface() {
        return this.props.document.surfaces.find(
            (surface) => {
                return surface.number == this.props.page;
            }
        );
    }

    @computed
    get lines() {
        return GraphemesUtils.lines(this.props.graphemes);
    }

    @computed
    get isClickable() {
        return this.props.onClick !== null && this.props.onClick !== undefined;
    }

    @computed
    get lineCoords() {
        let special = [ 0x202c, 0x200e, 0x200f ];

        return this.props.lineCoords || this.lines.filter((gs) => { return gs.length > 0 }).map((graphemes) => {
            let concrete = graphemes.filter((grapheme) => {
                return special.indexOf(grapheme.value.codePointAt(0)) === -1;
            });

            let minUlx = graphemes.reduce((min, grapheme) => {
                return Math.min(min, grapheme.area.ulx);
            }, graphemes[0].area.ulx);

            let maxLrx = graphemes.reduce((max, grapheme) => {
                return Math.max(max, grapheme.area.lrx);
            }, graphemes[0].area.lrx);

            let meanTop = MathUtils.mean(
                graphemes.map((g) => { return g.area.uly })
            );

            let meanBottom = MathUtils.mean(
                graphemes.map((g) => { return g.area.lry })
            );

            return {
                top: meanTop * this.ratio,
                left: minUlx * this.ratio,
                right: maxLrx * this.ratio,
                bottom: meanBottom * this.ratio
            }
        });
    }

    @computed
    get surfaceWidth() {
        return this.surface.area.lrx - this.surface.area.ulx;
    }

    @computed
    get ratio() {
        return this.props.width / this.surfaceWidth;
    }

    @computed
    get className() {
        let names = [ "corpusbuilder-highlight-line" ];

        if(this.props.variantClassName !== null && this.props.variantClassName !== undefined) {
            let classes = Array.isArray(this.props.variantClassName) ? this.props.variantClassName :
                                                                     [ this.props.variantClassName ];
            for(let className of classes) {
                names.push( `corpusbuilder-highlight-line-${ className }` );
            }
        }

        if(this.isClickable) {
            names.push( `corpusbuilder-highlight-line-clickable` );
        }

        return names.join(' ');
    }

    onClick() {
        if(this.isClickable) {
            this.props.onClick();
        }
    }

    onMouseEnter() {
        if(typeof this.props.onMouseEnter === 'function') {
            this.props.onMouseEnter();
        }
    }

    onMouseLeave() {
        if(typeof this.props.onMouseLeave === 'function') {
            this.props.onMouseLeave();
        }
    }

    onHighlightClick() {
        if(typeof this.props.onHighlightClick === 'function') {
            this.props.onHighlightClick();
        }
    }

    render() {
        if(this.lineCoords.length === 0) {
            return null;
        }

        let lines = this.lineCoords.map((lineCoords) => {
            let lineStyles = {
                top: lineCoords.top + this.props.mainPageTop,
                left: lineCoords.left,
                height: lineCoords.bottom - lineCoords.top,
                width: lineCoords.right - lineCoords.left
            };

            return (
                <div className={ this.className }
                      style={ lineStyles }
                      key={ `highlight-line-${ lineStyles.left }-${ lineStyles.top }` }
                      onClick={ this.onClick.bind(this) }
                      >
                  &nbsp;
                </div>
            );
        });

        return (
            <div className="corpusbuilder-highlight"
                 title={ this.props.content }
                 onMouseEnter={ this.onMouseEnter.bind(this) }
                 onMouseLeave={ this.onMouseLeave.bind(this) }
                 onClick={ this.onHighlightClick.bind(this) }
                 >
              { lines }
            </div>
        );
    }
}
