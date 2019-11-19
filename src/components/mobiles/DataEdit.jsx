import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, Grid, Flex } from "antd-mobile";
import pointpng from "./assets/huidian_pre.png";
import linepng from "./assets/huixian_pre.png";
import polygonpng from "./assets/huimian_pre.png";
import fanhui from "./assets/fanhui.png";
import pmzd from "./assets/pingmuzhongdian.png";
import shanchu from "./assets/shanchu.png";

export default class DataEdit extends Component {
  static propTypes = {
    prop: PropTypes
  };

  render() {
    const data1 = [
      { name: "绘点", img: pointpng },
      { name: "绘线", img: linepng },
      { name: "绘面", img: polygonpng }
    ];
    const data2 = [
      { name: "屏幕中点", img: pmzd },
      { name: "返回", img: fanhui },
      { name: "删除", img: shanchu }
    ];
    return (
      <Card>
        <Card.Header
          title={
            <Flex>
              <Flex.Item>
                <img src={pmzd} style={{ height: 16 }} alt="" /><span>屏幕中点</span>
              </Flex.Item>
              <Flex.Item>
                <img src={fanhui} style={{ height: 16 }} alt="" /><span>返回</span>
              </Flex.Item>
              <Flex.Item>
                <img src={shanchu} style={{ height: 16 }} alt="" /><span>删除</span>
              </Flex.Item>
            </Flex>
          }
        />
        <Card.Body>
          <Grid
            data={data1}
            columnNum={3}
            renderItem={dataItem => (
              <div style={{ padding: 20 }}>
                <img src={dataItem.img} style={{ height: 40 }} alt="" />
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
