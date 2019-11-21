import React from "react";
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import renwupng from "./assets/renwu.png";
import { withRouter } from "react-router-dom";
import { selectTask, queryTasks,queryPattens } from "../../actions/query";
import { changeModel } from "../../actions/map";

import { NavBar, ListView, Button, Toast, List } from "antd-mobile";

class OutputList extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    });

    this.state = {
      dataSource: dataSource,
      refreshing: false,
      height: document.documentElement.clientHeight,
      currentPage: 1,
      pageSize: 7,
      data: [],
      hasMore: true,
      isLoading: false
    };
  }

  componentDidMount() {
    this.renderResize();

    if (this.props.query.tasksresult) {
      this.initData = this.props.query.tasksresult.result;
      if (this.initData.length < this.state.pageSize) {
        this.setState({
          hasMore: false
        });
      }
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.initData)
      });
    }
    // Set the appropriate height
    setTimeout(
      () =>
        this.setState({
          height: this.state.height - 50 + "px"
        }),
      0
    );
  }

  renderResize = () => {
    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;
    if (width > height) {
      this.setState({
        height: height - 50 + "px"
      });
    } else {
      this.setState({
        height: height - 50 + "px"
      });
    }
  };

  componentWillMount() {
    window.addEventListener("resize", this.renderResize, false);
  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.renderResize, false);
  };

  onScroll = e => {
    e;
  };

  getOutputList = () => {
    this.setState(
      { currentPage: this.state.currentPage + 1, isLoading: true },
      () => {
        this.props.queryTasks(this.state.currentPage, this.state.pageSize);
      }
    );
  };

  onEndReached = event => {
    if (this.state.isLoading) {
      return false;
    }
    if (!this.state.hasMore) {
      return false;
    }
    this.setState({ isLoading: true });
    setTimeout(() => {
      this.getOutputList();
    }, 1000);
  };

  // If you use redux, the data maybe at props, you need use `componentWillReceiveProps`
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.query.tasksresult.result !== this.props.query.tasksresult.result
    ) {
      this.initData=this.initData.concat(nextProps.query.tasksresult.result);
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(
          this.initData
        )
      });
      if (this.initData.length >= nextProps.query.tasksresult.count) {
        this.setState({
          hasMore: false,
          isLoading: false
        });
      }
    }
  }

  _onTaskClick = task => {
    this.props.history.push("/");
    this.props.selectTask(task);
    this.props.changeModel("taskdetail");
    this.props.queryPattens();
    
  };

  renderList() {
    const row = dataRow => {
      return (
        <div key={dataRow} style={{ padding: "0 15px" }}>
          <div
            style={{
              lineHeight: "50px",
              color: "#888",
              fontSize: 18
            }}
          >
            <img className="taskimg" src={renwupng} alt="" />
            <span onClick={() => this._onTaskClick(dataRow)} className="title">
              {dataRow.name}
            </span>
            <span className="datetime">{dataRow.createDate}</span>
          </div>
          <div className="detail">
            <span>图版名称: </span>
            {dataRow.patternName}
            <br />
            <span>任务描述: </span>
            {dataRow.describes}
          </div>
        </div>
      );
    };
    return (
      <ListView
        ref={el => (this.lv = el)}
        dataSource={this.state.dataSource}
        renderRow={row}
        pageSize={this.state.pageSize}
        style={{
          height: this.state.height
        }}
        scrollerOptions={{ scrollbars: true }}
        onScroll={this.onScroll}
        scrollRenderAheadDistance={200}
        scrollEventThrottle={20}
        onEndReached={this.onEndReached}
        onEndReachedThreshold={20}
        renderFooter={() => (
          <p>
            {this.state.hasMore ? "正在加载更多的数据..." : "已经全部加载完毕"}
          </p>
        )}
      />
    );
  }

  render() {
    return (
      <div className=" container taskcontainer">
        <NavBar
          mode="light"
          onLeftClick={() => this.props.history.push("/")}
          leftContent={
            <div>
              <a className="back-main"></a>
            </div>
          }
        >
          我的任务
        </NavBar>
        {this.renderList()}
      </div>
    );
  }
}

export default connect(
  state => {
    return { query: state.query };
  },
  {
    selectTask,
    changeModel,
    queryTasks,
    queryPattens
  }
)(withRouter(OutputList));
