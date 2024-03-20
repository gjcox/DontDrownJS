import PropTypes from 'prop-types';

import MenuLine from '../components/MenuLine';
import FontSizeSlider from '../components/FontSizeSlider';

export default function Settings({ lineGap, setFontSize }) {
    Settings.propTypes = {
        lineGap: PropTypes.number.isRequired,
        setFontSize: PropTypes.func.isRequired
    };

    const fontSize = (
        <div style={{ display: 'flex', flexDirection: 'row', height: '3em' }}>
            <MenuLine lineGap={lineGap}>Font size: </MenuLine>
            <div style={{
                marginTop: '1.5em',
                display: 'flex',
                paddingLeft: '2em'
            }}>
                <FontSizeSlider lineGap={lineGap} setFontSize={setFontSize} />
            </div>
        </div>);

    return (
        <div className="menu__col-container--padded">
            {fontSize}
        </div>
    );
}