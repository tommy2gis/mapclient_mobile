/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:34:15 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:34:15 
 */
var PropTypes = require('prop-types');

const MiniMapLayerSwitcher = require('../../utils/map/MiniMapLayerSwitcher');
var React = require('react');

import assign from 'object-assign';

class SwitchLayer extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        position: PropTypes.oneOf(['topleft', 'topright', 'bottomleft', 'bottomright']),
        blayers: PropTypes.array,
        maxWidth: PropTypes.number,
        onSwitchLayer: PropTypes.func,
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
        onSwitchLayer:()=>{},
        imperial: false,
        updateWhenIdle: false,
        blayers: [],
        crs: 'EPSG:4326',
        overlayers: []
    };

    

    componentDidMount() {
        let options = assign({}, this.props, { crs: this.props.map.options.crs });
        this.layerswitch = new MiniMapLayerSwitcher(this.props.blayers, this.props.overlayers, options);
        if (this.props.map) {
            this.layerswitch.addTo(this.props.map);
            this.props.map.on('baselayerchanged', (data) => {
                let  blayers=this.props.blayers;
                blayers.forEach(layer => {
                    if(layer.name==='无锡城管网格'){
                            return;
                    }
                    if (layer.group === data.name) {
                        layer.visibility = true;
                    } else {
                        layer.visibility = false;
                    }
                });
                this.props.onSwitchLayer();
            })
            if (this.props.container) {
                document.querySelector(this.props.container).appendChild(this.layerswitch.getContainer());
                const mainControl = document.querySelector('.leaflet-control-container .leaflet-control-scale-line');
                if (mainControl && mainControl.parentNode) {
                    mainControl.parentNode.removeChild(mainControl);
                }
            }
        }
    }

    componentWillUnmount() {
        if (this.props.container && this.layerswitch && this.layerswitch.getContainer()) {
            try {
                document.querySelector(this.props.container).removeChild(this.layerswitch.getContainer());
            } catch (e) {
                // nothing to do
            }
        }
    }

    render() {
        return null;
    }
}


export default SwitchLayer;
