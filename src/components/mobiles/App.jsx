import React from "react";
const axios = require('axios');
import { connect } from "react-redux";
import { Toast, NavBar, WingBlank } from "antd-mobile";
import { changeMapView, mouseDownOnMap, changeModel } from "../../actions/map";
import { endDrawing } from "../../actions/draw";
import { switchLayers } from "../../actions/layers";
import { queryTasks,getUserLocation } from "../../actions/query";
import LMap from "../map/Map";
import LLayer from "../map/Layer";
import Feature from "../map/Feature";
import DrawSupport from "../map/DrawSupport";
import ZoomControl from "../map/ZoomControl";
import { NavLink } from "react-router-dom";
import LayerSwitch from "../mobiles/LayerSwitch";
import TaskDetail from "../mobiles/TaskDetail";
import DataEdit from "../mobiles/DataEdit";
import MapCenterCoord from '../map/MapCenterCoord';
import "leaflet/dist/leaflet.css";
import "./style.less";
import "../../themes/iconfont/iconfont.css";
import wx from 'weixin-js-sdk';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "app",
      open: false,
      model: "layerswitch"
    };
  }

  componentDidMount() {
    this.weixin();
    this.props.queryTasks();
  }

  weixin = () => {
    axios
      .get(ServerUrl + "/wx/config", {
        params: {
          url: window.location.href.split('#')[0]
        }
      })
      .then(res => {
        let config=res.data.data;
       // alert(JSON.stringify(config));
       // alert(JSON.stringify(window.location.href.split('#')[0]))
        wx.config({ debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: config.appId, // 必填，公众号的唯一标识
          timestamp: config.timestamp, // 必填，生成签名的时间戳
          nonceStr: config.nonceStr, // 必填，生成签名的随机串
          signature: config.signature,// 必填，签名，见附录1
          jsApiList: ["chooseImage",
          "previewImage",
          "uploadImage",
          "downloadImage",
          "translateVoice",
          "getNetworkType",
          "openLocation",
          "getLocation",
          "hideOptionMenu",
          "showOptionMenu",
          "hideMenuItems",
          "showMenuItems",
          "hideAllNonBaseMenuItem",
          "showAllNonBaseMenuItem"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2});
        });
          wx.ready(res => {
         // alert("wx.ready")
          wx.getLocation({
            success: res => {
              this.props.getUserLocation(res);
            },
            cancel: function(res) {
              Toast.info("用户拒绝授权获取地理位置", 1);
            }
          });
        });
        wx.error(err => {
         // alert(JSON.stringify(err))
          Toast.info(JSON.stringify(err), 1);
        });
      })
      .catch(e => {});
  };

  /**
   *渲染图层
   *
   * @param {*} layer
   * @param {*} projection
   * @returns
   */
  renderLayerContent = (layer, projection) => {
    if (layer.features && layer.type === "vector") {
      return layer.features.map(feature => {
        return (
          <Feature
            key={feature.properties.id}
            msId={feature.properties.id}
            type={feature.type}
            crs={projection}
            geometry={feature.geometry}
            msId={feature.properties.id}
            featuresCrs={layer.featuresCrs || "EPSG:4326"}
            // FEATURE STYLE OVERWRITE LAYER STYLE
            layerStyle={layer.style}
            style={feature.style || layer.style || null}
            properties={feature.properties}
          />
        );
      });
    }
    return null;
  };

  showLayerChangeControl = () => {
    const model =
      (!this.props.map.model || this.props.map.model == "main")
        ? "layerswitch"
        : "main";
    this.props.changeModel(model);
  };

  /**
   *渲染图层
   *
   * @param {*} layers
   * @returns
   */
  renderLayers = layers => {
    const projection = this.props.map.projection || "EPSG:3857";
    if (layers) {
      if (layers.refreshing) {
        layers = layers.refreshing;
      }
      return layers
        .map(layer => {
          return (
            <LLayer type={layer.type} key={layer.name} options={layer}>
              {this.renderLayerContent(layer, projection)}
            </LLayer>
          );
        })
        .concat([
          <LLayer
            type="vector"
            key="location_marker"
            options={{
              name: "location_marker",
              type: "vector",
              visibility: true
            }}
          >
            {this.renderLocationContent()}
          </LLayer>
        ]);
    }
    return null;
  };

  renderLocationContent = () => {
    const loc = this.props.query.curloc;
    if (loc) {
      let style = {
        color: "#eee",
        weight: 4,
        opacity: 0.8,
        fill: true,
        fillColor: "#fd8e2c",
        fillOpacity: 1
      };
      let fea = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [loc.longitude, loc.latitude]
        },
        properties: {}
      };
      return (
        <Feature
          key="userloc"
          type={fea.type}
          crs={this.props.map.projection}
          geometry={fea.geometry}
          featuresCrs={"EPSG:4326"}
          style={style}
          zoomTo={true}
          properties={fea.properties}
        />
      );
    }
    return null;
  };

  /**
   *创建要素
   *
   * @param {*} fea
   * @param {*} option
   * @returns
   */
  createMarker = (fea, option) => {
    if (typeof fea.geometry != "object") {
      fea.geometry = JSON.parse(fea.geometry);
      //fea.geometry.indexOf('type')>-1?JSON.parse(fea.geometry):parse(fea.geometry);
    }

    let style =
      option.style ||
      (fea.geometry.type == "Point"
        ? {
            iconGlyph: "embassy",
            iconColor: "cyan",
            iconPrefix: "map-icon",
            iconLibrary: "extra"
          }
        : {
            color: "#eee",
            weight: 4,
            opacity: 0.8,
            fill: true,
            fillColor: "#000",
            fillOpacity: 0.8
          });
    return (
      <Feature
        key={option.key}
        type={fea.type}
        crs={this.props.map.projection}
        geometry={fea.geometry}
        featuresCrs={"EPSG:4326"}
        styleName={fea.properties.styleName}
        style={style}
        title={option.title}
        zIndexOffset={option.zIndexOffset || 0}
        properties={fea.properties}
      />
    );
  };

  renderHeadLeft = model => {
    const userinfo = this.props.query.userinfo;
    switch (model) {
      case "main":
      case "layerswitch":
        return (
          <div>
            <NavLink to="/login" className="login-btn" replace></NavLink>
            <span style={{ marginLeft: 40 }}>
              {userinfo ? userinfo.realName : "点击登录"}
            </span>
          </div>
        );
        break;
      case "taskdetail":
        return (
          <div>
            <a className="back-main"></a>
          </div>
        );
        break;
      case "dataedit":
        return (
          <div>
            <a className="back-main"></a>
          </div>
        );
        break;

      default:
        break;
    }
  };
  getLocation = e => {
    wx.getLocation({
      success: res => {
        this.props.getUserLocation(res);
      },
      cancel: function(res) {
        Toast.info("用户拒绝授权获取地理位置", 1);
      }
    });
  };

  renderHeadRight = model => {
    switch (model) {
      case "main":
        return <b onClick={() => this.setState({ open: true })}>...</b>;
        break;
      case "dataedit":
        return (
          <NavLink to="/datacollect" style={{ color: "#fff" }} replace>
            完成
          </NavLink>
        );
        break;

      default:
        break;
    }
  };

  render() {
    const { mapConfig, map, draw, query } = this.props;
    const model = (map && map.model) || "main";
    const taskcount = (query.tasksresult && query.tasksresult.count) || 0;
    // console.log(this.props.route, this.props.params, this.props.routeParams);
    if (mapConfig && mapConfig.map) {
      return (
        <div className="container">
          <NavBar
            mode="light"
            onLeftClick={() => {
              if (model == "taskdetail" || model == "dataedit") {
                this.props.changeModel("main");
              }
            }}
            leftContent={this.renderHeadLeft(model)}
            rightContent={this.renderHeadRight(model)}
          >
            {model == "taskdetail"
              ? "详细信息"
              : model == "dataedit"
              ? "数据编辑"
              : ""}
          </NavBar>

          {/* <a className="circlebtn compass-btn"></a> */}
          {model == "main" && (
            <NavLink
              to="/datacollect"
              className="circlebtn adddata-btn"
              replace
            ></NavLink>
          )}

          <a
            className="circlebtn layerchange-btn"
            onClick={this.showLayerChangeControl}
          ></a>
          <a className="circlebtn location-btn" onClick={this.getLocation}></a>
          {model == "main" && (
            <NavLink to="/tasks" className="tasknum-btn" replace>
              {"当前任务数(" + taskcount + ")"}
            </NavLink>
          )}

          <div  className={"clientmap " + (model != "main" ? " bottommodel":"")}>
          <LMap
            id="map"
            ref="map"
            contextmenu={false}
            zoom={map.zoom}
            center={map.center}
            onMapViewChanges={this.props.onMapViewChanges}
            onMouseDown={this.handleMouseDown}
            projection={map.projection}
          >
            {this.renderLayers(mapConfig.layers)}
            {model == "dataedit"&&<MapCenterCoord/>} 
            <ZoomControl />
            <DrawSupport
              drawStatus={draw.drawStatus}
              drawOwner={draw.drawOwner}
              drawMethod={draw.drawMethod}
              style={draw.style}
              onEndDrawing={this.props.endDrawing}
              features={draw.features}
            />
          </LMap>
          </div>

          
          <div className="bottom-container">
            {model == "layerswitch" && <LayerSwitch></LayerSwitch>}
            {model == "taskdetail" && (
              <TaskDetail task={query.selecttask}></TaskDetail>
            )}
            {model == "dataedit" && <DataEdit></DataEdit>}
          </div>
        </div>
      );
    }
    return null;
  }
}

require("../map/WMTSLayer");
require("../map/VectorLayer");

export default connect(
  state => {
    return {
      mapConfig: state.mapConfig,
      map: state.map || (state.mapConfig && state.mapConfig.map),
      mapStateSource: state.map && state.map.mapStateSource,
      layers: state.layers,
      query: state.query,
      arealocation: state.arealocation,
      routing: state.routing,
      draw: state.draw,
      sidebar: state.sidebar,
      toolbar: state.toolbar
    };
  },
  {
    onMapViewChanges: changeMapView,
    onSwitchLayer: switchLayers,
    endDrawing,
    mouseDownOnMap,
    changeModel,
    queryTasks,
    getUserLocation
  }
)(App);
