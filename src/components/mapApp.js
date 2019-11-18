/*
 * @Author: 史涛 
 * @Date: 2019-01-05 17:40:59 
 * @Last Modified by: 史涛
 * @Last Modified time: 2019-01-10 17:42:21
 */
import "leaflet/dist/leaflet.css";
import "./mapApp.less";
import "../themes/iconfont/iconfont.css";
import PropTypes from "prop-types";
import React from "react";
import LMap from "./map/Map";
import LLayer from "./map/Layer";
import Feature from "./map/Feature";
import ScaleBar from "./map/ScaleBar";
import DrawSupport from "./map/DrawSupport";
import SwitchLayer from "./map/SwitchLayer";
import ZoomControl from "./map/ZoomControl";
import Measure from "./map/measure";
import ToolBar from "../modules/ToolBar/toolbar";
import CopyLine from "../modules/CopyLine/copyline";
import Animate from "rc-animate";
import ConfigUtils from "../utils/ConfigUtils";

class mapApp extends React.Component {
  static propTypes = {
    // redux store slice with map configuration (bound through connect to store at the end of the file)
    mapConfig: PropTypes.object,
    map: PropTypes.object,
    layers: PropTypes.object,
    step: PropTypes.number,
    mapStateSource: PropTypes.string,
    currentZoom: PropTypes.number,
    changeZoomLevel: PropTypes.func,
    mapOnClick: PropTypes.func,
    showsidebar: PropTypes.bool,
    drawStatus: PropTypes.string,
    drawOwner: PropTypes.string,
    drawMethod: PropTypes.string,
    features: PropTypes.array,
    query: PropTypes.object
  };

  static defaultProps = {
    step: 1,
    currentZoom: 3,
    showsidebar: false,
    drawStatus: null,
    drawOwner: null,
    drawMethod: null,
    features: [],
    changeZoomLevel: () => {},
    style: {
      radius: 5,
      color: "blue",
      weight: 1,
      opacity: 1,
      fillOpacity: 0
    },
    arealocationstyle: {
      dashArray: "6",
      radius: 5,
      color: "red",
      weight: 2,
      opacity: 0.4,
      fillOpacity: 0.2,
      fillColor: "#1890ff"
    }
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
            key="query"
            options={{
              name: "query",
              type: "vector",
              visibility: true
            }}
          >
            {this.renderQueryContent()}
          </LLayer>
        ]).concat([
          <LLayer
            type="vector"
            key="errorquery"
            options={{
              name: "errorquery",
              type: "vector",
              visibility: true
            }}
          >
            {this.renderErrorQueryContent()}
          </LLayer>
        ]);
    }
    return null;
  };

  /**
   *渲染纠错要素
   *
   * @returns
   */
  renderErrorQueryContent = () => {
    if (this.props.toolbar.errorlist) {
      return this.props.toolbar.errorlist.list.map((item, index) => {
        return this.createMarker([Number(item.x), Number(item.y)], {
          style: {
            iconGlyph: "number",
            iconColor:
              this.props.toolbar.errorhoverid == item.id
                ? "orange-dark"
                : "cyan",
            number: index + 1
          },
          key: item.id,
          title: item.name,
          zIndexOffset: this.props.toolbar.errorhoverid == item.id ? 100 : 0
        });
      });
    }
    return null;
  };
  /**
   *渲染查询结果
   *
   * @returns
   */
  renderQueryContent = () => {
    if (this.props.query.result) {
      return this.props.query.result.docs.map((item, index) => {
        return this.createMarker([Number(item.x), Number(item.y)], {
          style: {
            iconGlyph: "number",
            iconColor:
              this.props.query.hoverid == item.id ? "cyan" : "orange-dark",
            number: index + 1
          },
          key: item.id,
          title: item.name,
          zIndexOffset: this.props.query.hoverid == item.id ? 100 : 0
        });
      });
    }
    return null;
  };

  /**
   *渲染路径起点 终点 途经点
   *
   * @returns
   */
  renderRoutingContent = () => {
    let routlayers = [];

    ["beginloc", "midloc", "endloc", "result"].forEach(key => {
      if (key == "beginloc" && this.props.routing.beginloc) {
        routlayers.push(
          this.createMarker(
            [this.props.routing.beginloc.lng, this.props.routing.beginloc.lat],
            {
              style: {
                iconGlyph: "number",
                iconColor: "green-light",
                number: "起"
              },
              key: "begin"
            }
          )
        );
      } else if (key == "midloc" && this.props.routing.midlocs) {
        this.props.routing.midlocs.forEach((ele, index) => {
          routlayers.push(
            this.createMarker([ele.latlng.lng, ele.latlng.lat], {
              key: "mid" + index,
              style: { iconGlyph: "number", iconColor: "yellow", number: "途" }
            })
          );
        });
      } else if (key == "endloc" && this.props.routing.endloc) {
        routlayers.push(
          this.createMarker(
            [this.props.routing.endloc.lng, this.props.routing.endloc.lat],
            {
              key: "end",
              style: {
                iconGlyph: "number",
                iconColor: "orange-dark",
                number: "终"
              }
            }
          )
        );
      } else if (key == "result" && this.props.routing.result.routelatlon) {
        routlayers.push(
          this.createRoutingLine(this.props.routing.result.routelatlon)
        );
      } else if (
        key == "result" &&
        this.props.routing.busline &&
        this.props.routing.result.results
      ) {
        routlayers.push(this.createBusLine(this.props.routing.result.results));
        routlayers.push(
          this.createBusStation(this.props.routing.result.results)
        );
      }
    });

    return routlayers;
  };

  /**
   *创建公交路径线
   *
   * @param {*} datas
   * @returns
   */
  createBusLine = datas => {
    let lines = datas[0].lines[this.props.routing.busline].segments;
    let i = 0;
    return lines.map(ele => {
      i++;
      let line = ele.segmentLine[0];
      let points = line.linePoint.split(";");
      let lnglats = [];
      let style = null;
      points.forEach(point => {
        if (point.indexOf(",") != -1) {
          var lnglat = point.split(",");
          lnglats.push([Number(lnglat[0]), Number(lnglat[1])]);
        }
      });

      switch (ele.segmentType) {
        case 1:
          style = {
            radius: 5,
            color: "#BA92F1",
            dashArray: "4",
            weight: 4,
            opacity: 0.8
          };
          break;
        case 2:
          style = {
            radius: 5,
            color: "#2196f3",
            weight: 8,
            opacity: 0.8
          };
          break;
        case 3:
          style = {
            radius: 5,
            color: "#2196f3",
            weight: 8,
            opacity: 0.8
          };
          break;
        default:
          style = {
            radius: 5,
            color: "#2196f3",
            weight: 8,
            opacity: 0.8
          };
          break;
      }
      let fea = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: lnglats
        },
        style: style
      };
      return (
        <Feature
          key={"busrouting" + i}
          type={fea.type}
          crs={this.props.map.projection}
          geometry={fea.geometry}
          featuresCrs={"EPSG:4326"}
          style={fea.style || this.props.style || null}
          properties={fea.properties}
        />
      );
    });
  };

  /**
   *创建公交点要素
   *
   * @param {*} datas
   * @returns
   */
  createBusStation = datas => {
    let lines = datas[0].lines[this.props.routing.busline].segments;
    let i = 0;
    return lines.map(ele => {
      i++;
      let latlon = ele.stationEnd.lonlat.split(",");
      let latlon2 = ele.stationStart.lonlat.split(",");
      if (ele.segmentType != 1) {
        return [
          this.createMarker([Number(latlon[0]), Number(latlon[1])], {
            style: {
              iconGlyph: " icon-luxian1",
              iconColor: "cyan",
              iconPrefix: "iconfont"
            }
          }),
          this.createMarker([Number(latlon2[0]), Number(latlon2[1])], {
            style: {
              iconGlyph: " icon-luxian1",
              iconColor: "cyan",
              iconPrefix: "iconfont"
            }
          })
        ];
      }
    });
  };

  /**
   *创建路径线
   *
   * @param {*} data
   * @returns
   */
  createRoutingLine = data => {
    let points = data.split(";");
    let lnglats = [];
    points.forEach(point => {
      if (point.indexOf(",") != -1) {
        var lnglat = point.split(",");
        lnglats.push([Number(lnglat[0]), Number(lnglat[1])]);
      }
    });

    let fea = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: lnglats
      },
      style: {
        radius: 5,
        color: "#2196f3",
        weight: 8,
        opacity: 0.8
      }
    };
    return (
      <Feature
        key="routingall"
        type={fea.type}
        crs={this.props.map.projection}
        geometry={fea.geometry}
        featuresCrs={"EPSG:4326"}
        style={fea.style || this.props.style || null}
        properties={fea.properties}
      />
    );
  };

  /**
   *创建要素
   *
   * @param {*} location
   * @param {*} option
   * @returns
   */
  createMarker = (location, option) => {
    let fea = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: location
      },
      properties: { styleName: "marker" }
    };
    return (
      <Feature
        key={option.key}
        type={fea.type}
        crs={this.props.map.projection}
        geometry={fea.geometry}
        featuresCrs={"EPSG:4326"}
        styleName={fea.properties.styleName}
        style={option.style}
        title={option.title}
        zIndexOffset={option.zIndexOffset || 0}
        properties={fea.properties}
      />
    );
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

  /**
   *
   *
   * @param {*} e
   */
  handleMouseDown = e => {
    if (this.props.sidebar.module === "1" && e.originalEvent.which === 1) {
      this.props.mouseDownOnMap();
    }
  };

  componentDidMount() {
    const ele = document.getElementById("loading");
    ele.style.display = "none";
  }

 

  render() {
    // wait for loaded configuration before rendering
    if (this.props.mapConfig && this.props.mapConfig.map) {
      return (
        <div id="maincontaint">
          <Animate transitionName="fade" transitionAppear>
            <ToolBar />
          </Animate>


        
          <CopyLine zoom={this.props.map.zoom}/>

          <LMap
            id="map"
            ref="map"
            className="clientmap"
            zoom={this.props.map.zoom}
            center={this.props.map.center}
            onMapViewChanges={this.props.onMapViewChanges}
            setBeginLoc={this.props.setBeginLoc}
            setMidLoc={this.props.setMidLoc}
            setEndLoc={this.props.setEndLoc}
            onMouseDown={this.handleMouseDown}
            loadRouting={this.props.loadRouting}
            projection={this.props.map.projection}
          >
            {this.renderLayers(this.props.mapConfig.layers)}
            <ScaleBar container="#scalebar" />
            <Measure
              discontainer="#toolbar_measure_dis"
              areacontainer="#toolbar_measure_area"
            />

            <ZoomControl />
            <SwitchLayer
              onSwitchLayer={this.props.onSwitchLayer}
              blayers={this.props.mapConfig.layers}
            />
            <DrawSupport
              drawStatus={this.props.draw.drawStatus}
              drawOwner={this.props.draw.drawOwner}
              drawMethod={this.props.draw.drawMethod}
              style={this.props.draw.style}
              onEndDrawing={this.props.endDrawing}
              features={this.props.draw.features}
            />
          </LMap>
        </div>
      );
    }
    return null;
  }
}

// include support for OSM and WMS layers

require("./map/WMTSLayer");
require("./map/ARCGISLayer");
require("./map/VectorLayer");
export default mapApp;
