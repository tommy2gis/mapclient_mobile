import React from "react";
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
    this.props.queryTasks();
  }

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
      !this.props.map.model || this.props.map.model == "main"
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
      return layers.map(layer => {
        return (
          <LLayer type={layer.type} key={layer.name} options={layer}>
            {this.renderLayerContent(layer, projection)}
          </LLayer>
        );
      }).concat([
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
    const loc=this.props.query.curloc
    if (loc) {
      let style={
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
      return  <Feature
      key='userloc'
      type={fea.type}
      crs={this.props.map.projection}
      geometry={fea.geometry}
      featuresCrs={"EPSG:4326"}
      style={style}
      zoomTo={true}
      properties={fea.properties}
    />;
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
  getLocation=e=>{
    wx.getLocation({
      success: (res)=>{
        this.props.getUserLocation(res);
      },
      cancel: function (res) {
        Toast.info('用户拒绝授权获取地理位置', 1);
      }
    });
  }

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
          {
            model == "main"&&<NavLink
            to="/datacollect"
            className="circlebtn adddata-btn"
            replace
            ></NavLink>
          }
         
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

          <LMap
            id="map"
            ref="map"
            className={"clientmap " + (model != "main" && " bottommodel")}
            contextmenu={false}
            zoom={map.zoom}
            center={map.center}
            onMapViewChanges={this.props.onMapViewChanges}
            onMouseDown={this.handleMouseDown}
            projection={map.projection}
          >
            {this.renderLayers(mapConfig.layers)}

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
