/* eslint no-dupe-keys: 0, no-mixed-operators: 0 */
import { ListView, NavBar } from "antd-mobile";
import { Timeline } from 'antd';
import React from "react";
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import renwupng from "./assets/renwu.png";
import { withRouter } from 'react-router-dom';
import {selectTask} from '../../actions/query'
import { changeModel } from "../../actions/map";

const data = [
  {
    "id": "4b2513ef37334e969495f081566ce6d5",
    "usrId": 25,
    "name": "二次勘查数据",
    "geo": "POINT(117.254182016447 31.8513633964723)",
    "content": "数据回传",
    "state": 2,
    "createDate": "2019-01-08 13:36:21",
    "tskId": "1cb2cf390d2c4dbe89eedcf6d3630f66",
    "taskName": "安徽大学二次勘察",
    "projectName": "国土局校园勘察项目",
    "patternSpotName": "安徽大学校园",
    "fileList": [
    {
    "formart": "jpg",
    "fileName": "20190108_013620.jpg",
    "size": 773403,
    "fileId": "708c6a5ec97245708449a912577b81a4",
    "createDate": "2019-01-08"
    }
    ],
    "userName": "国土局采集员"
    },
    {
    "id": "e8bd658c91a540cca9a0c17f5c6af137",
    "usrId": 25,
    "name": "国土局勘查安徽大学校园",
    "geo": "POINT(117.254300176406 31.8515085077522)",
    "content": "返回数据图片",
    "state": 2,
    "createDate": "2019-01-08 13:29:49",
    "tskId": "8f7fbad6eaa8439ea3aaa8c9774209fa",
    "taskName": "安徽大学校园勘察",
    "projectName": "国土局校园勘察项目",
    "patternSpotName": "安徽大学校园",
    "fileList": [
    {
    "formart": "jpg",
    "fileName": "20190108_012948.jpg",
    "size": 827390,
    "fileId": "40e5a2b2dc07466c920d44bbd572a480",
    "createDate": "2019-01-08"
    }
    ],
    "userName": "国土局采集员"
    }
];
const NUM_SECTIONS = 1;
const NUM_ROWS_PER_SECTION = 6;
let pageIndex = 0;

const dataBlobs = {};
let sectionIDs = [];
let rowIDs = [];
function genData(pIndex = 0) {
  for (let i = 0; i < NUM_SECTIONS; i++) {
    const ii = pIndex * NUM_SECTIONS + i;
    const sectionName = `Section ${ii}`;
    sectionIDs.push(sectionName);
    dataBlobs[sectionName] = sectionName;
    rowIDs[ii] = [];

    for (let jj = 0; jj < NUM_ROWS_PER_SECTION; jj++) {
      const rowName = `S${ii}, R${jj}`;
      rowIDs[ii].push(rowName);
      dataBlobs[rowName] = rowName;
    }
  }
  sectionIDs = [...sectionIDs];
  rowIDs = [...rowIDs];
}

 class HistoryPatterns extends React.Component {
  constructor(props) {
    super(props);
    const getSectionData = (dataBlob, sectionID) => dataBlob[sectionID];
    const getRowData = (dataBlob, sectionID, rowID) => dataBlob[rowID];

    const dataSource = new ListView.DataSource({
      getRowData,
      getSectionHeaderData: getSectionData,
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2
    });

    this.state = {
      dataSource,
      isLoading: true,
      height: (document.documentElement.clientHeight * 3) / 4
    };
  }

  componentDidMount() {
    // you can scroll to the specified position
    // setTimeout(() => this.lv.scrollTo(0, 120), 800);

    const hei =
      document.documentElement.clientHeight -
      ReactDOM.findDOMNode(this.lv).parentNode.offsetTop;
    // simulate initial Ajax
    setTimeout(() => {
      genData();
      this.setState({
        dataSource: this.state.dataSource.cloneWithRowsAndSections(
          dataBlobs,
          sectionIDs,
          rowIDs
        ),
        isLoading: false,
        height: hei
      });
    }, 600);
  }

  _onTaskClick=(task)=>{
    this.props.history.push("/");
    this.props.selectTask(task);
    this.props.changeModel('taskdetail')
  }

  onEndReached = (event) => {
    // load new data
    // hasMore: from backend data, indicates whether it is the last page, here is false
    if (this.state.isLoading && !this.state.hasMore) {
      return;
    }
    console.log('reach end', event);
    this.setState({ isLoading: true });
    setTimeout(() => {
      genData(++pageIndex);
      this.setState({
        dataSource: this.state.dataSource.cloneWithRowsAndSections(dataBlobs, sectionIDs, rowIDs),
        isLoading: false,
      });
    }, 1000);
  }


  render() {
    const separator = (sectionID, rowID) => (
      <div
        key={`${sectionID}-${rowID}`}
        style={{
          backgroundColor: "#F5F5F9",
          borderBottom: "1px solid #ECECED"
        }}
      />
    );
    let index = data.length - 1;
    const row = (rowData, sectionID, rowID) => {
      if (index < 0) {
        index = data.length - 1;
      }
      const obj = data[index--];
      return (
        <Timeline.Item> 
        <div key={rowID} style={{ padding: "10px 15px" }}>
          <div
            style={{
              lineHeight: "30px",
              color: "#888",
              fontSize: 18
            }}
          >
            
             <span className='datetime'>{obj.createDate}</span>
            <span onClick={()=>this._onTaskClick(obj)} className='title'>数据名称: {obj.name}</span>
          </div>
          <div className='detail' >
                <span>巡查员: </span>{obj.userName}
                <br/>
                <span>数据内容: </span>{obj.content}
          </div>
        </div>
        </Timeline.Item>
      );
    };

    return (
      <div className=" container historycontainer">
        <NavBar
          mode="light"
          onLeftClick={() => this.props.history.push("/")}
          leftContent={
            <div>
              <a className="back-main"  ></a>
            </div>
          }
        >
          图斑历史巡查记录
        </NavBar>
        <Timeline>
        <ListView
          ref={el => (this.lv = el)}
          dataSource={this.state.dataSource}
          renderFooter={() => (
            <div style={{ padding: 30, textAlign: "center" }}>
              {this.state.isLoading ? "加载中..." : "已全部加载"}
            </div>
          )}
          renderRow={row}
          renderSeparator={separator}
          style={{
            height: this.state.height,
            overflow: "auto"
          }}
          pageSize={4}
          onScroll={() => {
            console.log("scroll");
          }}
          scrollRenderAheadDistance={500}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={10}
        />

  </Timeline>
       
      </div>
    );
  }
}


export default connect(
  state => {
    return {
    };
  },
  {
    selectTask,
    changeModel
  }
)(withRouter(HistoryPatterns));

