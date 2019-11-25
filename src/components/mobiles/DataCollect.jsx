import React, { Component } from "react";
import { connect } from "react-redux";
var L = require("leaflet");
const axios = require("axios");
import PropTypes from "prop-types";
import {stringify} from 'wellknown';
import wx from "weixin-js-sdk";
import {
  Button,
  TextareaItem,
  Picker,
  Toast,
  NavBar,
  List,
  InputItem
} from "antd-mobile";
import { changeModel } from "../../actions/map";
import { changeDrawingStatus } from "../../actions/draw";
import { createForm } from "rc-form";
import photopng from "./assets/photo.png";
const types = [
  {
    value: "340000",
    label: "安徽省"
  }
];

let polyline = L.polyline([]);
let interval=null;

class DataCollect extends Component {
  state = { serverId: "1237378768e7q8e7r8qwesafdasdfasdfaxss111", citys: [],getProjs:[] };
  _onDataClick = () => {
    this.props.history.push("/");
    this.props.changeModel("dataedit");
    this.props.changeDrawingStatus("start", "Point", "error", [], {});
  };
  submit = e => {
    Toast.loading('提交中', 10);
    const geojsonpath=polyline.toGeoJSON();
    const geo=stringify(geojsonpath);
    clearInterval(interval);

    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!this.props.draw.geometry){
        Toast.info('图斑未绘制', 1);
        return;
      }
      if (!err) {
        axios
          .post(ServerUrl + "/acquisition/datamanagement/save/new", {
            usrId: 5,
            name: values.name,
            geo: "Point(0,0)",
            content: values.content,
            state: 0,
            track: geo,
            trackLength: geojsonpath.geometry.coordinates.length,
            projectId: values.projectId[0],
            patternSpotName: values.patternSpotName,
            patternSpotGeo: stringify(this.props.draw.geometry),
            tskClaId: '375a12f315af42f482f6ae19b1b9444b'
          })
          .then(response => {
            Toast.info(response.data.data, 1);
            Toast.hide();
          })
          .catch(e => {
            //message.warning('提交数据失败,请稍后再试');
          });
      } else {
        for (const key in err) {
          const el = err[key];
          Toast.info(el.errors[0].message, 1);
          return;
        }
      }
    });
  };

  collectTrasks = () => {
    let getloc=()=>{
      wx.getLocation({
        success: res => {
          polyline.addLatLng([res.latitude, res.longitude]);
        },
        cancel: function(res) {
          Toast.info("用户拒绝授权获取地理位置", 1);
        }
      });
    }
    interval = setInterval(getloc, 20000);
  };

  componentDidMount(){
    this.collectTrasks();
  }

  uploadimg = () => {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
        wx.uploadImage({
          localId: localIds.toString(), // 需要上传的图片的本地ID，由chooseImage接口获得
          isShowProgressTips: 1, // 默认为1，显示进度提示
          success: res => {
            //var mediaId = res.serverId; // 返回图片的服务器端ID，即mediaId
            //"1237378768e7q8e7r8qwesafdasdfasdfaxss111"
            this.setState({ serverId: res.serverId });
            Toast.info("图片上传成功", 1);
          },
          fail: function(res) {
            Toast.info("上传图片失败，请重试", 1);
          }
        });
      }
    });
  };

  componentDidMount() {
    this.getCitys();
    this.getProjs();
  }
  getCitys = () => {
    axios
      .get(ServerUrl + "/acquisition/regionmanagement/list")
      .then(response => {
        this.setState({ citys: response.data.data[0].children });
      })
      .catch(e => {
        //Toast.info("数据查询失败,请稍后再试");
      });
  };

  getProjs = () => {
    axios
      .get(ServerUrl + "/acquisition/projectmanagement/list?userId=5")
      .then(response => {
        this.setState({ getProjs: response.data.data.all });
      })
      .catch(e => {
        //Toast.info("数据查询失败,请稍后再试");
      });
  };

  render() {
    const { getFieldProps } = this.props.form;
    return (
      <div className=" container collectcontainer">
        <NavBar
          mode="light"
          onLeftClick={() => this.props.history.push("/")}
          leftContent={
            <div>
              <a className="back-main"></a>
            </div>
          }
          rightContent={<div onClick={this._onDataClick}>地图</div>}
        >
          数据采集
        </NavBar>
        <Picker
          data={this.state.citys}
          key="id"
          title="城市&区县"
          cols={2}
          {...getFieldProps("city", {
            rules: [{ required: true, message: "请选择城市&区县名称!" }]
          })}
          className="forss"
        >
          <List.Item arrow="horizontal">
            城市&区县<span style={{ color: "red" }}>*</span>
          </List.Item>
        </Picker>
        <Picker
          data={this.state.getProjs}
          cols={1}
          {...getFieldProps("projectId", {
            rules: [{ required: true, message: "请输入项目名称!" }]
          })}
          className="forss"
        >
          <List.Item arrow="horizontal">
            项目名称<span style={{ color: "red" }}>*</span>
          </List.Item>
        </Picker>
        <InputItem
          {...getFieldProps("patternSpotName", {
            rules: [{ required: true, message: "请输入图斑名称!" }]
          })}
          clear
          placeholder="请输入图斑名称"
          ref={el => (this.autoFocusInst = el)}
        >
          图斑名称<span style={{ color: "red" }}>*</span>
        </InputItem>
        <InputItem
          {...getFieldProps("name", {
            rules: [{ required: true, message: "请输入数据名称!" }]
          })}
          clear
          placeholder="请输入数据名称"
          ref={el => (this.autoFocusInst = el)}
        >
          数据名称<span style={{ color: "red" }}>*</span>
        </InputItem>
        <TextareaItem
          {...getFieldProps("content", {
            rules: [{ required: true, message: "请输入备注信息!" }]
          })}
          rows={3}
          title={
            <div>
              备注信息<span style={{ color: "red" }}>*</span>
            </div>
          }
          placeholder="请输入备注信息"
        ></TextareaItem>
        <InputItem
          {...getFieldProps("tskClaId")}
          clear
          placeholder="请输入数据类型"
          ref={el => (this.autoFocusInst = el)}
        >
          数据类型
        </InputItem>
        <div className="am-list-item am-input-item am-list-item-middle">
          <div className="am-list-line">
            <div className="am-input-label am-input-label-5">添加照片</div>
            <div className="am-input-control">
              <img src={photopng} onClick={this.uploadimg}></img>
            </div>
          </div>
        </div>
        <Button className="taskroad-btn" onClick={this.submit}>
          提交
        </Button>
      </div>
    );
  }
}

export default connect(
  state => {
    return {draw:state.draw};
  },
  {
    changeModel,
    changeDrawingStatus
  }
)(createForm()(DataCollect));
