/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:34:08 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:34:08 
 */
var PropTypes = require('prop-types');
const {ComputeArea,ComputeDist} = require('../../utils/map/MeasureControl');

var React = require('react');
var L = require('leaflet');

class Measure extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        position: PropTypes.oneOf(['topleft', 'topright', 'bottomleft', 'bottomright']),
        maxWidth: PropTypes.number,
        metric: PropTypes.bool,
        imperial: PropTypes.bool,
        updateWhenIdle: PropTypes.bool,
        discontainer: PropTypes.string,
        areacontainer: PropTypes.string
    };

    static defaultProps = {
        map: null,
        position: 'bottomleft',
        maxWidth: 100,
        metric: true,
        imperial: false,
        distoolbarIcon: {
            html: '<span><i class="iconfont icon-ceju"></i>测距</span>',
            tooltip: '测距'
        },
        areatoolbarIcon: {
            html: '<span><i class="iconfont icon-cemian"></i>测面</span>',
            tooltip: '测面'
        },
        updateWhenIdle: false
    };

    componentDidMount() {
        this.ComputeDist = new ComputeDist(this.props);
        this.ComputeArea=new ComputeArea(this.props);
        if (this.props.map) {
            this.ComputeDist.addTo(this.props.map);
            this.ComputeArea.addTo(this.props.map);
            if (document.querySelector(this.props.discontainer)&&this.ComputeDist.getContainer()) {
                document.querySelector(this.props.discontainer).appendChild(this.ComputeDist.getContainer());
            }
            if (document.querySelector(this.props.areacontainer)&&this.ComputeArea.getContainer()) {
                document.querySelector(this.props.areacontainer).appendChild(this.ComputeArea.getContainer());
            }

        }
    }

    componentWillUnmount() {
        if ( document.querySelector(this.props.discontainer) && this.ComputeDist && this.ComputeDist.getContainer()) {
            try {
                document.querySelector(this.props.discontainer).removeChild(this.ComputeDist.getContainer());
                
            } catch(e) {
                // nothing to do
            }
        }

        if (document.querySelector(this.props.areacontainer) && this.ComputeArea && this.ComputeArea.getContainer()) {
            try {
                document.querySelector(this.props.areacontainer).removeChild(this.ComputeArea.getContainer());
                
            } catch(e) {
                // nothing to do
            }
        }
    }

    render() {
        return null;
    }
}

module.exports = Measure;