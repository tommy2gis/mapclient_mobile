/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:33:41 
 * @Last Modified by: 史涛
 * @Last Modified time: 2019-11-24 21:07:54
 */
var PropTypes = require('prop-types');
import '../../utils/map/MapCenterCoord';
var React = require('react');
var L = require('leaflet');

class MapCenterCoordControl extends React.Component {
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
        this.coord = new L.Control.MapCenterCoord(this.props);
        if (this.props.map) {
            this.coord.addTo(this.props.map);
            // if (this.props.container) {
            //     document.querySelector(this.props.container).appendChild(this.coord.getContainer());
            // }
        }
    }

    componentWillUnmount() {
        if (this.props.map) {
            this.props.map.removeControl(this.coord);
            // if (this.props.container&& this.coord.getContainer()) {
            //     try {
            //         document.querySelector(this.props.container).removeChild(this.coord.getContainer());
            //     } catch(e) {
            //         // nothing to do
            //     }
            // }
        }
    }

    render() {
        return null;
    }
}

module.exports = MapCenterCoordControl;