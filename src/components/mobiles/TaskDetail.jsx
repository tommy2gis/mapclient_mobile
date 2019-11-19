import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card,Grid } from "antd-mobile";
import { NavLink } from "react-router-dom";

export default class TaskDetail extends Component {
  static propTypes = {
    prop: PropTypes
  };

  render() {
    
    if(this.props.task){
      const task=this.props.task;
      return (
        <Card>
          <Card.Header title={task.name} extra={<span>历史记录</span>}/>
          <Card.Body>
            <div className='detail' >
                  <span>图版名称: </span>{task.patternName}
                  <br/>
                  <span>任务描述: </span>{task.describes}
            </div>
            <NavLink
          to="/tasks"
          className="taskroad-btn"
          replace
        >
          任务巡查
        </NavLink>
          </Card.Body>
        </Card>
      );
    }

    return null;
    
  }
}
