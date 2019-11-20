import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button,TextareaItem,Radio, NavBar,List, InputItem } from "antd-mobile";
import { createForm } from 'rc-form';
import { withRouter } from 'react-router-dom';
import yonghumima from './assets/yonghumima.png'
import yonghuming from './assets/yonghuming.png'

 class login extends Component {
    static propTypes = {
        prop: PropTypes
    }

    render() {
        const { getFieldProps } = this.props.form;
        return (
            <div className=" container logincontainer">
        <NavBar
          mode="light"
          onLeftClick={() => this.props.history.push("/")}
          leftContent={
            <div>
              <a className="back-main"></a>
            </div>
          }
        >
          用户登录
        </NavBar>
        <div className="form">
        <InputItem
            {...getFieldProps('username')}
            placeholder="请输入用户名"
          >
            <img src={yonghuming}></img>
          </InputItem>
          <InputItem
            {...getFieldProps('password')}
            placeholder="请输入密码"
          >
            <img src={yonghumima}></img>
          </InputItem>
          <Radio className="my-radio" onChange={e => console.log('checkbox', e)}>记住密码</Radio>
          <Radio className="my-radio" onChange={e => console.log('checkbox', e)}>自动登录</Radio>
        <Button
          className="login-btn"
        >
          登录
        </Button>
        </div>
        
      </div>
    );
           
    }
}
export default createForm()(withRouter(login))