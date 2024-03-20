import PropTypes from 'prop-types';
import ReactSlider from 'react-slider';

import { FONT_STEP, LARGE_FONT, MEDIUM_FONT, SMALL_FONT } from '../utils/constants';
import { getLeft } from '../utils/functions';

export default function FontSizeSlider({ lineGap, setFontSize }) {
    FontSizeSlider.propTypes = {
        lineGap: PropTypes.number.isRequired,
        setFontSize: PropTypes.func.isRequired
    };
    /**
     * Adds padding to the thumb of the slider to better vertically align the label
     * and adjusts the horizontal positioning from default behaviour. 
     */
    function renderThumb(thumbProps, state) {
        thumbProps.style = {
            ...thumbProps.style,
            paddingTop: 'calc((2em - 0.9em)/2 - .2em)',
            left: `calc(${getLeft(state.valueNow)} - 1em)`
        };

        return (
            <div {...thumbProps} >{state.valueNow}</div>
        );
    }

    /** Adjusts horizontal mark positioning from default behaviour. */
    function renderMark(markProps) {
        markProps.style = { 
            ...markProps.style, 
            left: `calc(${getLeft(markProps.key)} - .5em)`
        };
        return (<span {...markProps} />);
    }

    return (
        <ReactSlider
            className="horizontal-slider"
            markClassName="example-mark"
            thumbClassName="example-thumb"
            trackClassName="example-track"
            min={SMALL_FONT}
            max={LARGE_FONT}
            marks={[SMALL_FONT, MEDIUM_FONT, LARGE_FONT]}
            defaultValue={lineGap}
            step={FONT_STEP}
            renderThumb={(props, state) => renderThumb(props, state)}
            renderMark={(props) => renderMark(props)}
            onAfterChange={(val) => setFontSize(val)}
        />
    );
}