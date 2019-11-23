import React, { Component } from "react";
import PropTypes from "prop-types";
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

class TaskCollect extends Component {
  submit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios
          .post(ServerUrl + "/acquisition/dataInformation/save", {
            usrId: userName,
            name: values.name,
            geo: "",
            content: values.content,
            state: 0,
            type: values.type,
            tskId: "",
            fileTemporaryNames: "",
            fileNames: ""
          })
          .then(response => {})
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

  uploadPhotos = images => {
    if (images.localId.length == 0) {
      return;
    }
    var i = 0,
      length = images.localId.length;
    images.serverId = [];
    function upload() {
      wx.uploadImage({
        localId: images.localId[i],
        isShowProgressTips: 1,
        success: function(res) {
          i++;
          //alert('已上传：' + i + '/' + length);
          images.serverId.push(res.serverId);
          if (i < length) {
            upload();
          }
        },
        fail: function(res) {
          alert(JSON.stringify(res));
        }
      });
    }
    upload();
  };

  getPhoto = () => {
    var images = {
      localId: [],
      serverId: []
    };
    wx.chooseImage({
      success: res => {
        images.localId = res.localIds;
        this.uploadPhotos(images);
        alert("已选择 " + res.localIds.length + " 张图片");
      }
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
            <div className="am-input-control" onClick={this.getPhoto}>
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

export default createForm()(TaskCollect);
