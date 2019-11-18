/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:30:19 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:30:19 
 */
require('leaflet.sync')
const LMap = require('../../components/map/Map');
const LLayer = require('../../components/map/Layer');
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
const assign = require('object-assign');
import { Radio } from 'antd'
const SwipeControl = require('../../utils/map/SwipeControl');
const { GeoWMTS,
    GeoTDTWMTS } = require('../../utils/map/WMTS.TDT');



export class ScreemCompare extends Component {
    static propTypes = {
        map: PropTypes.object,
    };

    state = {
        model: 'screem',
    };

    handleModelChange = (e) => {
        this.setState({ model: e.target.value });
        if(e.target.value==="screem"){
            this.refs.screemmap.map.addControl(this.control);
        }else{
            this.refs.screemmap.map.removeControl(this.control);
        }
    }


    componentDidMount() {
        let slayers = this.props.mapConfig.layers;
        let upgroup = L.layerGroup();
        let downgroup = L.layerGroup();
        for (const key in this.props.mapConfig.map.compare) {
            const type = this.props.mapConfig.map.compare[key];
            slayers.map((layer) => {
                let clayer = assign({}, layer);
                //克隆图层属性,不影响主地图的显示
                clayer.visibility = true;
                if (key == 'leftgroup' && type == clayer.group) {
                    upgroup.addLayer(L.geoTDTWMTSLayer(clayer.url, clayer));
                } else {
                    downgroup.addLayer(L.geoTDTWMTSLayer(clayer.url, clayer));
                }

            });
        }


        this.control = new SwipeControl(downgroup, upgroup);
        this.refs.screemmap.map.addLayer(upgroup);
        this.refs.screemmap.map.addLayer(downgroup);
        this.control.addTo(this.refs.screemmap.map);
    }

    render() {
        return (
            <div className="ScreemCompare_panel">
                <Radio.Group value={this.state.model} onChange={this.handleModelChange}>
                    <Radio.Button value="pan">平移</Radio.Button>
                    <Radio.Button value="screem">卷帘</Radio.Button>
                </Radio.Group>
                <LMap id="screemmap" ref="screemmap" zoom={this.props.mapConfig.map.zoom} center={this.props.mapConfig.map.center}   >
                </LMap>
            </div>
        )
    }
}

export default connect((state) => {
    return { mapConfig: state.mapConfig }
}, {})(ScreemCompare);
