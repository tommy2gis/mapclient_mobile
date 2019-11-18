/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:34:00 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:34:00 
 */
var PropTypes = require('prop-types');
import LocateControl from '../../utils/map/LocateControl'
var React = require('react');
var L = require('leaflet');

class Location extends React.Component {
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
        position: 'topright',
        maxWidth: 100,
        metric: true,
        imperial: false,
        updateWhenIdle: false
    };

    componentDidMount() {
        this.location = new LocateControl(this.props);
        if (this.props.map) {
            this.location.addTo(this.props.map);
            if (this.props.container) {
                document.querySelector(this.props.container).appendChild(this.location.getContainer());
            }
        }
    }

    componentWillUnmount() {
        if (this.props.map) {
            this.props.map.removeControl(this.location);
            if (this.props.container&& this.location.getContainer()) {
                try {
                    document.querySelector(this.props.container).removeChild(this.location.getContainer());
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

module.exports = Location;