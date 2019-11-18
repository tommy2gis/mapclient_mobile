/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:34:11 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:34:11 
 */
var PropTypes = require('prop-types');

var React = require('react');
var L = require('leaflet');

class ScaleBar extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        position: PropTypes.oneOf(['topleft', 'topright', 'bottomleft', 'bottomright']),
        maxWidth: PropTypes.number,
        metric: PropTypes.bool,
        imperial: PropTypes.bool,
        updateWhenIdle: PropTypes.bool,
        container: PropTypes.string
    };

    static defaultProps = {
        map: null,
        position: 'bottomleft',
        maxWidth: 100,
        metric: true,
        imperial: false,
        updateWhenIdle: false
    };

    componentDidMount() {
        this.scalebar = L.control.scale(this.props);
        if (this.props.map) {
            this.scalebar.addTo(this.props.map);
            if (this.props.container) {
                document.querySelector(this.props.container).appendChild(this.scalebar.getContainer());
                const mainControl = document.querySelector('.leaflet-control-container .leaflet-control-scale-line');
                if (mainControl && mainControl.parentNode) {
                    mainControl.parentNode.removeChild(mainControl);
                }
            }
        }
    }

    componentWillUnmount() {

        if (this.props.map) {
            this.props.map.removeControl(this.scalebar);
            if (this.props.container&& this.scalebar.getContainer()) {
                try {
                    document.querySelector(this.props.container).removeChild(this.scalebar.getContainer());
                } catch(e) {
                    // nothing to do
                }
            }
        }
    }

    render() {
        return null;
    }
}

module.exports = ScaleBar;