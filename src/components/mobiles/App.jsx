import React from "react";
import { connect } from "react-redux";
import { Button, NavBar, WingBlank } from "antd-mobile";
import { changeMapView, mouseDownOnMap } from "../../actions/map";
import { endDrawing } from "../../actions/draw";
import { switchLayers } from "../../actions/layers";
import { queryTasks } from "../../actions/query";
import LMap from "../map/Map";
import LLayer from "../map/Layer";
import Feature from "../map/Feature";
import DrawSupport from "../map/DrawSupport";
import ZoomControl from "../map/ZoomControl";
import { NavLink } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./style.less";
import "../../themes/iconfont/iconfont.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "app",
      open: false
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
      });
    }
    return null;
  };

  render() {
    const { mapConfig, map, draw, query } = this.props;
    const taskcount=query.tasksresult&&query.tasksresult.count;
    // console.log(this.props.route, this.props.params, this.props.routeParams);
    if (mapConfig && mapConfig.map) {
      return (
        <div className="container">
          <NavBar
            mode="light"
            leftContent={
              <div>
                <a className="login-btn"></a>
                <span style={{ marginLeft: 40 }}>点击登录</span>
              </div>
            }
            rightContent={
              <b onClick={() => this.setState({ open: true })}>...</b>
            }
          ></NavBar>

          <a className="circlebtn compass-btn"></a>
          <a className="circlebtn layerchange-btn"></a>
          <a className="circlebtn location-btn"></a>
          <NavLink
          to="/tasks"
          className="tasknum-btn"
          replace
        >
          {'当前任务数('+taskcount+')'}
        </NavLink>

          <LMap
            id="map"
            ref="map"
            className="clientmap"
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
        </div>
      );
    }
    return null;
  }
}

require("../map/WMTSLayer");

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
    queryTasks
  }
)(App);
