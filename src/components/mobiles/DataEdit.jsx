import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Card, Grid, Flex } from "antd-mobile";
import pointpngw from "./assets/huidian.png";
import linepngw from "./assets/huixian.png";
import polygonpngw from "./assets/huimian.png";
import pointpng from "./assets/huidian_pre.png";
import linepng from "./assets/huixian_pre.png";
import polygonpng from "./assets/huimian_pre.png";
import fanhui from "./assets/fanhui.png";
import pmzd from "./assets/pingmuzhongdian.png";
import shanchu from "./assets/shanchu.png";
import {changeDrawingStatus} from '../../actions/draw';

 class DataEdit extends Component {
   static propTypes = {
     prop: PropTypes
   };
   state = { selectdraw: "绘点" };
   _handleToolarClick = name => {
     switch (name) {
       case "绘点":
         this.props.changeDrawingStatus(
           "start",
           "Point",
           "error",
           [],
           {}
         );
         break;
       case "绘线":
         this.props.changeDrawingStatus(
           "start",
           "LineString",
           "error",
           [],
           {}
         );
         break;
       case "绘面":
         this.props.changeDrawingStatus(
           "start",
           "Polygon",
           "error",
           [],
           {}
         );
         break;
       default:
         break;
     }

     this.setState({ selectdraw: name });
   };
   render() {
     const data1 = [
       { name: "绘点", img: pointpng, imgw: pointpngw },
       { name: "绘线", img: linepng, imgw: linepngw },
       { name: "绘面", img: polygonpng, imgw: polygonpngw }
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
                 <img src={pmzd} style={{ height: 16 }} alt="" />
                 <span>屏幕中点</span>
               </Flex.Item>
               <Flex.Item>
                 <img src={fanhui} style={{ height: 16 }} alt="" />
                 <span>返回</span>
               </Flex.Item>
               <Flex.Item>
                 <img src={shanchu} style={{ height: 16 }} alt="" />
                 <span>删除</span>
               </Flex.Item>
             </Flex>
           }
         />
         <Card.Body>
           <Grid
             data={data1}
             columnNum={3}
             renderItem={dataItem => (
               <div
                 onClick={() => this._handleToolarClick(dataItem.name)}
                 className={
                   "edit_toolbar " +
                   (this.state.selectdraw == dataItem.name &&
                     " toolbar_selected")
                 }
               >
                 <img
                   src={
                     this.state.selectdraw == dataItem.name
                       ? dataItem.imgw
                       : dataItem.img
                   }
                   style={{ height: 40 }}
                   alt=""
                 />
                 <div className="title">
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
    changeDrawingStatus
  }
)(DataEdit);
