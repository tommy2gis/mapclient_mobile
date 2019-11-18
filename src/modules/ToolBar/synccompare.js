/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:30:24 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:30:24 
 */
require('leaflet.sync')
var LMap = require('../../components/map/Map');
var LLayer = require('../../components/map/Layer');
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Row, Col} from 'antd';
var assign = require('object-assign');


export class SyncCompare extends Component {
    static propTypes = {
        map: PropTypes.object,
    };

   
    renderLayers = (layers,type) => {
       
        if (layers) {
            if (layers.refreshing) {
                layers = layers.refreshing;
            }
            return layers.map((layer) => {
                if(this.props.mapConfig.map.compare[type]===layer.group){
                    let clayer =  assign({}, layer);
                    //克隆图层属性,不影响主地图的显示
                    clayer.visibility=true;
                    return <LLayer type={clayer.type} key={clayer.name} options={clayer} ></LLayer>;
                }  
            });
        }
        return null;
    };

    componentDidMount() {
       
        this.refs.leftmap.map.sync(this.refs.rightmap.map);
        this.refs.rightmap.map.sync(this.refs.leftmap.map);
   }

    render() {
        return (
            <div className="synccompare_panel">
                <Row gutter={16} style={{'height':'100%'}}>
                    <Col style={{'height':'100%'}} span={12} >
                        <LMap id="mapleft" ref="leftmap" zoom={this.props.mapConfig.map.zoom} center={this.props.mapConfig.map.center}   >
                            {this.renderLayers(this.props.mapConfig.layers,'leftgroup')}
                        </LMap></Col>
                    <Col style={{'height':'100%'}} span={12} >
                        <LMap id="mapright" ref="rightmap" zoom={this.props.mapConfig.map.zoom} center={this.props.mapConfig.map.center}   >
                            {this.renderLayers(this.props.mapConfig.layers,'rightgroup')}
                        </LMap></Col>
                </Row>
            </div>
        )
    }
}

export default connect((state) => {
    return { mapConfig: state.mapConfig}
}, {})(SyncCompare);
