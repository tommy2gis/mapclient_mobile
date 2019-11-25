import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, Grid } from "antd-mobile";
import { NavLink } from "react-router-dom";

export default class TaskDetail extends Component {
  static propTypes = {
    prop: PropTypes
  };

  render() {
    if (this.props.task) {
      const task = this.props.task;
      return (
        <Card>
          <Card.Header
            title={task.name}
            extra={
              <NavLink
                to="/history"
                replace
                style={{ fontSize: "initial", color: "#2b87fd" }}
              >
                历史记录
              </NavLink>
            }
          />
          <Card.Body>
            <div className="detail">
              <span>图版名称: </span>
              {task.patternName}
              <br />
              <span>任务描述: </span>
              {task.describes}
            </div>
            <NavLink to="/taskcollect" className="taskroad-btn" replace>
              任务巡查
            </NavLink>
          </Card.Body>
        </Card>
      );
    }

    return null;
  }
}
