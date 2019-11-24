import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Card,Grid } from "antd-mobile";
import yxpng from "./assets/yingxiang.png";
import slpng from "./assets/shiliang.png";
import {changeLayerVisiable} from '../../actions/config'

 class LayerSwitch extends Component {
   state={model:'天地图矢量'}

  _onClick=(name)=>{
    if(name=='天地图矢量'){
      this.setState({model:'天地图矢量'})
      this.props.changeLayerVisiable('天地图影像',false);
      this.props.changeLayerVisiable('天地图影像标注',false);
      this.props.changeLayerVisiable('天地图道路',true);
      this.props.changeLayerVisiable('天地图道路标注',true);
    }else{
      this.setState({model:'天地图影像'})
      this.props.changeLayerVisiable('天地图道路',false);
      this.props.changeLayerVisiable('天地图道路标注',false);
      this.props.changeLayerVisiable('天地图影像',true);
      this.props.changeLayerVisiable('天地图影像标注',true);
    }
  }
  render() {
    const data1 = [
      { name: "天地图矢量", img: slpng },
      { name: "天地图影像", img: yxpng }
    ];
    return (
      <Card>
        <Card.Header title="地图样式切换" />
        <Card.Body>
          <Grid
            data={data1}
            columnNum={2}
            renderItem={dataItem => (
              <div style={{ padding: "12.5px" }} onClick={()=>this._onClick(dataItem.name)}>
                <img
                  className={(this.state.model==dataItem.name)?'imgselected':undefined}
                  src={dataItem.img}
                  style={{  height: "75px" }}
                  alt=""
                />
                <div
                  style={{ color: "#888", fontSize: "14px", marginTop: "12px" }}
                >
                  <span>{dataItem.name}</span>
                </div>
              </div>
            )}
          />
        </Card.Body>
      </Card>
    );
  }
}

export default connect(
  state => {
    return {
    };
  },
  {
    changeLayerVisiable
  }
)(LayerSwitch);


