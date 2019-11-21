import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  Button,
  Toast,
  Radio,
  NavBar,
  List,
  InputItem
} from "antd-mobile";
import { createForm } from "rc-form";
import { withRouter } from "react-router-dom";
import yonghumima from "./assets/yonghumima.png";
import yonghuming from "./assets/yonghuming.png";
import {login} from '../../actions/query';

class loginComponent extends Component {

  handleLogin= (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
        if (!err) {
           let info=this.props.login(values.username,values.password);
        }else{
          for (const key in err) {
            const el = err[key];
            Toast.info(el.errors[0].message, 1);
            return;
          }
        }
    });
}

componentWillReceiveProps(nextProps) {
  if (
    nextProps.query&&nextProps.query.userinfo !== this.props.query.userinfo
  ) {
    this.props.history.push("/");
  }
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
          <InputItem {...getFieldProps("username", {
                                        rules: [{ required: true, message: '请输入用户名!' }],
                                    })} placeholder="请输入用户名">
            <img src={yonghuming}></img>
          </InputItem>
          <InputItem {...getFieldProps("password", {
                                        rules: [{ required: true, message: '请输入密码!' }],
                                    })} placeholder="请输入密码" type="password">
            <img src={yonghumima}></img>
          </InputItem>
          <Radio
            className="my-radio"
            onChange={e => console.log("checkbox", e)}
          >
            记住密码
          </Radio>
          <Radio
            className="my-radio"
            onChange={e => console.log("checkbox", e)}
          >
            自动登录
          </Radio>
          <Button onClick={this.handleLogin} className="login-btn">登录</Button>
        </div>
      </div>
    );
  }
}

export default createForm()(withRouter(connect(
  state => {return{
    query:state.query
  }
  },
  {
    login
  }
)(loginComponent)));

