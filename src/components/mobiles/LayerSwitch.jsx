import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card,Grid } from "antd-mobile";
import yxpng from "./assets/yingxiang.png";
import slpng from "./assets/shiliang.png";

export default class LayerSwitch extends Component {
  static propTypes = {
    prop: PropTypes
  };

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
              <div style={{ padding: "12.5px" }}>
                <img
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
