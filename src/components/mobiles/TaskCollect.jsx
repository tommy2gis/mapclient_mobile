import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button,TextareaItem,Picker, NavBar,List, InputItem } from "antd-mobile";
import { createForm } from "rc-form";
import photopng from './assets/photo.png'
const  types=[{
    "value": "340000",
    "label": "安徽省"
    }]

class TaskCollect extends Component {
  submit=()=>{
    return axios.post(ServerUrl + "/acquisition/dataInformation/save",{
      "usrId":userName,
      "name": passWord,
      "geo":'',
      "content":'',
      "state":0,
      "type":'',
      "tskId":'',
      "fileTemporaryNames":'',
      "fileNames":''


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
        >
          任务数据采集
        </NavBar>
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
        <Picker
          data={types}
          cols={1}
          {...getFieldProps("district3")}
          className="forss"
        >
          <List.Item arrow="horizontal">数据类型</List.Item>
        </Picker>
        <div className="am-list-item am-input-item am-list-item-middle">
          <div className="am-list-line">
            <div className="am-input-label am-input-label-5">添加照片</div>
            <div className="am-input-control">
                <img src={photopng}></img>
            </div>
          </div>
        </div>
        <Button onClick={this.submit}
          className="taskroad-btn"
        >
          提交
        </Button>
      </div>
    );
  }
}

export default createForm()(TaskCollect);
