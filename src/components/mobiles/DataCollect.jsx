import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button,TextareaItem,Picker, NavBar,List, InputItem } from "antd-mobile";
import {changeModel} from "../../actions/map";
import { createForm } from "rc-form";
import photopng from './assets/photo.png'
const  types=[{
    "value": "340000",
    "label": "安徽省"
    }]

class DataCollect extends Component {
  _onDataClick = () => {
    this.props.history.push("/");
    this.props.changeModel("dataedit");
  };
  submit=()=>{
    return axios.post(ServerUrl + "/acquisition/dataInformation/save",{
      "usrId":userName,
      "name": passWord,
      "geo":'',
      "content":'',
      "state":0,
      "track":'',
      "trackLength":'',
      "projectId":'',
      "patternSpotName":'',
      "patternSpotGeo":'',
      "describes":'',
      "tskClaId":''
  }).then((response) => {


  }).catch((e) => {
      //message.warning('提交数据失败,请稍后再试');
  });
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
          rightContent={
            <div onClick={this._onDataClick}>
              地图
            </div>
          }
          
        >
          
          数据采集
        </NavBar>
        <Picker
          data={types}
          cols={1}
          {...getFieldProps("district3")}
          className="forss"
        >
          <List.Item arrow="horizontal">城市名称</List.Item>
        </Picker>
        <Picker
          data={types}
          cols={1}
          {...getFieldProps("district3")}
          className="forss"
        >
          <List.Item arrow="horizontal">县级名称</List.Item>
        </Picker>
        <Picker
          data={types}
          cols={1}
          {...getFieldProps("district3")}
          className="forss"
        >
          <List.Item arrow="horizontal">项目名称</List.Item>
        </Picker>
        <InputItem
          {...getFieldProps("autofocus")}
          clear
          placeholder="请输入图斑名称"
          ref={el => (this.autoFocusInst = el)}
        >
          图斑名称
        </InputItem>
        <InputItem
          {...getFieldProps("autofocus")}
          clear
          placeholder="请输入数据名称"
          ref={el => (this.autoFocusInst = el)}
        >
          数据名称
        </InputItem>
        <TextareaItem
          {...getFieldProps("note1")}
          rows={3}
          title="备注信息"
          placeholder="请输入备注信息"
        ></TextareaItem>
        <InputItem
          {...getFieldProps("autofocus")}
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
                <img src={photopng}></img>
            </div>
          </div>
        </div>
        <Button
          className="taskroad-btn"  onClick={this.submit}
        >
          提交
        </Button>
      </div>
    );
  }
}


export default connect(
  state => {
    return {};
  },
  {
    changeModel
  }
)(createForm()(DataCollect));

