/* eslint no-dupe-keys: 0, no-mixed-operators: 0 */
import { ListView, NavBar } from "antd-mobile";
import React from "react";
import ReactDOM from "react-dom";
import renwupng from "./assets/renwu.png";
import { hashHistory } from 'react-router';

const data = [
    {
        "id": "c45ae84e16a6476daf6ed4c0df25c00e",
        "tskClaId": "cdf8acf486434d31b86adcabd21bda7f",
        "usrId": -1,
        "pjtId": "bbf0ae890ef642da81a3d61299a42f00",
        "ptnSptId": "525fd14316e140ba92644a8c3806dcef",
        "name": "测试任务1",
        "code": "TK0000005",
        "startTime": "2019-11-05 00:00:00",
        "endTime": "2019-11-21 00:00:00",
        "sourceState": 0,
        "flowState": 0,
        "describes": "测试任务1",
        "createDate": "2019-11-18 16:40:21",
        "taskClassifyName": "测试分类",
        "projectName": "测试项目",
        "patternName": "测试图斑",
        "patternGeo": "POINT(115.78011110817518 33.789996052312866)",
        "userName": "超级管理员"
        },
        {
        "id": "e1abae693eb3468a916c10e208eff646",
        "tskClaId": "cdf8acf486434d31b86adcabd21bda7f",
        "usrId": -1,
        "pjtId": "bbf0ae890ef642da81a3d61299a42f00",
        "ptnSptId": "525fd14316e140ba92644a8c3806dcef",
        "name": "测试任务2",
        "code": "TK0000006",
        "startTime": "2019-11-06 00:00:00",
        "endTime": "2019-11-23 00:00:00",
        "sourceState": 0,
        "flowState": 0,
        "describes": "测试任务2",
        "createDate": "2019-11-18 16:40:44",
        "taskClassifyName": "测试分类",
        "projectName": "测试项目",
        "patternName": "测试图斑",
        "patternGeo": "POINT(115.78011110817518 33.789996052312866)",
        "userName": "超级管理员"
        },
        {
        "id": "0ea2e93f9a244a8fa551b44da82ebfe4",
        "tskClaId": "cdf8acf486434d31b86adcabd21bda7f",
        "usrId": -1,
        "pjtId": "bbf0ae890ef642da81a3d61299a42f00",
        "ptnSptId": "525fd14316e140ba92644a8c3806dcef",
        "name": "测试任务3",
        "code": "TK0000007",
        "startTime": "2019-11-12 00:00:00",
        "endTime": "2019-11-22 00:00:00",
        "sourceState": 0,
        "flowState": 0,
        "describes": "测试任务3",
        "createDate": "2019-11-18 16:41:06",
        "taskClassifyName": "测试分类",
        "projectName": "测试项目",
        "patternName": "测试图斑",
        "patternGeo": "POINT(115.78011110817518 33.789996052312866)",
        "userName": "超级管理员"
        },
        {
        "id": "5e967226f7364d59ba5b573fe887b049",
        "tskClaId": "cdf8acf486434d31b86adcabd21bda7f",
        "usrId": -1,
        "pjtId": "bbf0ae890ef642da81a3d61299a42f00",
        "ptnSptId": "525fd14316e140ba92644a8c3806dcef",
        "name": "测试任务4",
        "code": "TK0000008",
        "startTime": "2019-11-12 00:00:00",
        "endTime": "2019-11-30 00:00:00",
        "sourceState": 0,
        "flowState": 0,
        "describes": "测试任务4",
        "createDate": "2019-11-18 16:41:29",
        "taskClassifyName": "测试分类",
        "projectName": "测试项目",
        "patternName": "测试图斑",
        "patternGeo": "POINT(115.78011110817518 33.789996052312866)",
        "userName": "超级管理员"
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

export default class Tasks extends React.Component {
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

  goBack=()=>{
    this.props.history.goBack();
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

  // If you use redux, the data maybe at props, you need use `componentWillReceiveProps`
//   componentWillReceiveProps(nextProps) {
//     if (nextProps.dataSource !== this.props.dataSource) {
//       this.setState({
//         dataSource: this.state.dataSource.cloneWithRowsAndSections(nextProps.dataSource),
//       });
//     }
//   }


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
        <div key={rowID} style={{ padding: "0 15px" }}>
          <div
            style={{
              lineHeight: "50px",
              color: "#888",
              fontSize: 18
            }}
          >
            <img
              className='taskimg'
              src={renwupng}
              alt=""
            />
            <span className='title'>{obj.name}</span>
            <span className='datetime'>{obj.createDate}</span>
            
          </div>
          <div className='detail' >
                <span>图版名称: </span>{obj.patternName}
                <br/>
                <span>任务描述: </span>{obj.describes}
          </div>
        </div>
      );
    };

    return (
      <div className=" container taskcontainer">
        <NavBar
          mode="light"
          onLeftClick={() => hashHistory.goBack()}
          leftContent={
            <div>
              <a className="back-main"  ></a>
            </div>
          }
        >
          我的任务
        </NavBar>
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
      </div>
    );
  }
}
