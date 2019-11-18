/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:34:28 
 * @Last Modified by: 史涛
 * @Last Modified time: 2019-11-18 11:41:20
 */
var PropTypes = require('prop-types');

var React = require('react');
var L = require('leaflet');

class ZoomControl extends React.Component {
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
        position: 'bottomright',
        maxWidth: 100,
        metric: true,
        imperial: false,
        updateWhenIdle: false
    };

    componentDidMount() {
        this.zoomcontrol = L.control.zoom(this.props);
        if (this.props.map) {
            this.zoomcontrol.addTo(this.props.map);
            if (this.props.container) {
                document.querySelector(this.props.container).appendChild(this.zoomcontrol.getContainer());
                const mainControl = document.querySelector('.leaflet-control-container .leaflet-control-scale-line');
                if (mainControl && mainControl.parentNode) {
                    mainControl.parentNode.removeChild(mainControl);
                }
            }
        }
    }

    componentWillUnmount() {

        if (this.props.map) {
            this.props.map.removeControl(this.zoomcontrol);
            if (this.props.container&& this.zoomcontrol.getContainer()) {
                try {
                    document.querySelector(this.props.container).removeChild(this.zoomcontrol.getContainer());
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

module.exports = ZoomControl;