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
  static propTypes = {
    prop: PropTypes
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
        <div class="am-list-item am-input-item am-list-item-middle">
          <div class="am-list-line">
            <div class="am-input-label am-input-label-5">添加照片</div>
            <div class="am-input-control">
                <img src={photopng}></img>
            </div>
          </div>
        </div>
        <Button
          className="taskroad-btn"
        >
          提交
        </Button>
      </div>
    );
  }
}

export default createForm()(TaskCollect);
