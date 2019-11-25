import React, { Component } from "react";
var L = require("leaflet");
import PropTypes from "prop-types";
import {stringify} from 'wellknown';
const axios = require("axios");
import { connect } from "react-redux";
import {
  Button,
  TextareaItem,
  Picker,
  NavBar,
  Toast,
  InputItem
} from "antd-mobile";
import { createForm } from "rc-form";
import photopng from "./assets/photo.png";
import wx from "weixin-js-sdk";
const types = [
  {
    value: "340000",
    label: "安徽省"
  }
];

let polyline = L.polyline([]);
let interval=null;

class TaskCollect extends Component {
  state = { serverId: "1237378768e7q8e7r8qwesafdasdfasdfaxss111", polyline: null };
  submit = e => {
    Toast.loading('提交中', 10);
    this.uploadtracks();
    const { selecttask } = this.props.query;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios
          .post(ServerUrl + "/acquisition/dataInformation/save", {
            usrId: 5,
            name: values.name,
            geo: selecttask.patternGeo,
            content: values.content,
            state: 0,
            type: values.type||'',
            tskId: selecttask.id,
            fileNames: this.state.serverId + ".jpg",
            mediaIds: this.state.serverId
          })
          .then(response => {
            Toast.info(response.data.data, 1);
            Toast.hide();
          })
          .catch(e => {
            Toast.info("提交数据失败,请稍后再试", 1);
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
    interval = setInterval(getloc, 10000);
  };

  uploadtracks = () => {
    const geojsonpath=polyline.toGeoJSON();
    const geo=stringify(geojsonpath);
    const { pjtId, id } = this.props.query.selecttask;
    clearInterval(interval);
    axios
      .get(ServerUrl + "/acquisition/usertrack/record", {
        params: {
          usrId: 5,
          pjtId: pjtId,
          tskId: id,
          length: geojsonpath.geometry.coordinates.length,
          geo: geo||""
        }
      })
      .then(response => {
        Toast.info(response.data.data);
        
      })
      .catch(e => {
        Toast.info("数据查询失败,请稍后再试");
      });
  };

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
  componentDidMount(){
    this.collectTrasks();
  }

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
        >
          任务数据采集
        </NavBar>
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
          {...getFieldProps("type")}
          clear
          placeholder="请输入数据类型"
          ref={el => (this.autoFocusInst = el)}
        >
          数据类型
        </InputItem>
        <div className="am-list-item am-input-item am-list-item-middle">
          <div className="am-list-line">
            <div className="am-input-label am-input-label-5">
              添加照片<span style={{ color: "red" }}>*</span>
            </div>
            <div className="am-input-control" onClick={this.uploadimg}>
              <img src={photopng}></img>
            </div>
          </div>
        </div>
        <Button onClick={this.submit} className="taskroad-btn">
          提交
        </Button>
      </div>
    );
  }
}

export default connect(state => {
  return {
    query: state.query
  };
}, {})(createForm()(TaskCollect));
