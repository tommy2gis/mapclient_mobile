/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:33:51 
 * @Last Modified by: 史涛
 * @Last Modified time: 2019-11-22 16:55:22
 */
const PropTypes = require("prop-types");

const React = require("react");
const L = require("leaflet");
const { isEqual } = require("lodash");

const VectorUtils = require("../../utils/map/Vector");

const coordsToLatLngF = function(coords) {
  return new L.LatLng(coords[1], coords[0], coords[2]);
};

const coordsToLatLngs = function(coords, levelsDeep, coordsToLatLng) {
  var latlngs = [];
  var len = coords.length;
  for (let i = 0, latlng; i < len; i++) {
    latlng = levelsDeep
      ? coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng)
      : (coordsToLatLng || this.coordsToLatLng)(coords[i]);

    latlngs.push(latlng);
  }

  return latlngs;
};
// Create a new Leaflet layer with custom icon marker or circleMarker
const getPointLayer = function(pointToLayer, geojson, latlng, options) {
  if (pointToLayer) {
    return pointToLayer(geojson, latlng);
  }
  return VectorUtils.pointToLayer(latlng, geojson, options);
};

const geometryToLayer = function(geojson, options) {
  var geometry = geojson.type === "Feature" ? geojson.geometry : geojson;
  var coords = geometry ? geometry.coordinates : null;
  var layers = [];
  var pointToLayer = options && options.pointToLayer;
  var onEachFeature = options && options.onEachFeature;
  var getColor = options && options.getColor;
  var highlight = options && options.highlight;
  var latlng;
  var latlngs;
  var i;
  var len;
  let coordsToLatLng = (options && options.coordsToLatLng) || coordsToLatLngF;

  if (!coords && !geometry) {
    return null;
  }

  const style =
    (options.style && options.style[geometry.type]) || options.style;
  let layer;
  switch (geometry.type) {
    case "Point":
      latlng = coordsToLatLng(coords);
      layer = getPointLayer(pointToLayer, geojson, latlng, options);
      layer.msId = geojson.id;
      return layer;
    case "MultiPoint":
      for (i = 0, len = coords.length; i < len; i++) {
        latlng = coordsToLatLng(coords[i]);
        layer = getPointLayer(pointToLayer, geojson, latlng, options);
        layer.msId = geojson.id;
        layers.push(layer);
      }
      return new L.FeatureGroup(layers);

    case "LineString":
      latlngs = coordsToLatLngs(
        coords,
        geometry.type === "LineString" ? 0 : 1,
        coordsToLatLng
      );
      layer = new L.Polyline(latlngs, style);
      layer.msId = geojson.id;
      return layer;
    case "MultiLineString":
      latlngs = coordsToLatLngs(
        coords,
        geometry.type === "LineString" ? 0 : 1,
        coordsToLatLng
      );
      for (i = 0, len = latlngs.length; i < len; i++) {
        layer = new L.Polyline(latlngs[i], style);
        layer.msId = geojson.id;
        if (layer) {
          layers.push(layer);
        }
      }
      return new L.FeatureGroup(layers);
    case "Polygon":
      latlngs = coordsToLatLngs(
        coords,
        geometry.type === "Polygon" ? 1 : 2,
        coordsToLatLng
      );
      layer = new L.Polygon(latlngs, style);
      layer.msId = geojson.id;
      return layer;
    case "MultiPolygon":
      latlngs = coordsToLatLngs(
        coords,
        geometry.type === "Polygon" ? 1 : 2,
        coordsToLatLng
      );
      for (i = 0, len = latlngs.length; i < len; i++) {
        layer = new L.Polygon(latlngs[i], style);
        layer.msId = geojson.id;
        if (layer) {
          layers.push(layer);
        }
      }
      return new L.FeatureGroup(layers);
    case "GeometryCollection":
      for (i = 0, len = geometry.geometries.length; i < len; i++) {
        layer = geometryToLayer(
          {
            geometry: geometry.geometries[i],
            type: "Feature",
            properties: geojson.properties
          },
          options
        );

        if (layer) {
          layers.push(layer);
        }
      }
      return new L.FeatureGroup(layers);
    case "FeatureCollection":
      function thematicstyle(feature) {
        if (style) {
          return {
            weight: style.weight || 3,
            opacity: style.opacity || 1,
            color: style.color || "#3388ff",
            dashArray: style.dashArray || null,
            fillOpacity: style.fillOpacity || 0.2,
            fillColor: getColor
              ? getColor(feature.properties.value)
              : style.fillColor
              ? style.fillColor
              : "#3388ff"
          };
        } else {
          return null;
        }
      }

      return new L.geoJson(geometry.geometry, {
        style: thematicstyle,
        onEachFeature: onEachFeature
      });
    default:
      throw new Error("Invalid GeoJSON object.");
  }
};

class Feature extends React.Component {
  static propTypes = {
    msId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
    styleName: PropTypes.string,
    properties: PropTypes.object,
    container: PropTypes.object, // TODO it must be a L.GeoJSON
    geometry: PropTypes.object, // TODO check for geojson format for geometry
    style: PropTypes.any,
    onClick: PropTypes.func,
    options: PropTypes.object
  };

  componentDidMount() {
    if (this.props.container && this.props.geometry) {
      this.createLayer(this.props);
    }
  }

  componentWillReceiveProps(newProps) {
    if (
      !isEqual(newProps.properties, this.props.properties) ||
      !isEqual(newProps.geometry, this.props.geometry) ||
      !isEqual(newProps.labeloptions, this.props.labeloptions) ||
      !isEqual(newProps.bullleoptions, this.props.bullleoptions) ||
      !isEqual(newProps.pieoptions, this.props.pieoptions) ||
      !isEqual(newProps.baroptions, this.props.baroptions) ||
      !isEqual(newProps.style, this.props.style)
    ) {
      this.props.container.removeLayer(this._layer);
      this.props.container.removeLayer(this._labellayer);
      this.props.container.removeLayer(this._markerlayer);

      this.createLayer(newProps);
    }
  }

  shouldComponentUpdate(nextProps) {
    return (
      !isEqual(nextProps.properties, this.props.properties) ||
      !isEqual(nextProps.geometry, this.props.geometry)
    );
  }

  componentWillUnmount() {
    if (this._layer) {
      this.props.container.removeLayer(this._layer);
    }
    if (this._labellayer) {
      this.props.container.removeLayer(this._labellayer);
    }

    if (this._markerlayer) {
      this.props.container.removeLayer(this._markerlayer);
    }
  }

  render() {
    return null;
  }

  isMarker = props => {
    return (
      props.styleName === "marker" ||
      (props.style && (props.style.iconUrl || props.style.iconGlyph))
    );
  };

  highlightFeature = e => {
    var layer = e.target;

    layer.setStyle({
      fillOpacity: layer.options.fillOpacity * 1.2
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  };

  createLayer = props => {
    this._labellayer = new L.FeatureGroup();
    this._markerlayer = new L.FeatureGroup();
    this._markerlayer.id = "theme_markerlayer";
    this._layer = geometryToLayer(
      {
        type: props.type,
        geometry: props.geometry,
        properties: props.properties,
        msId: props.msId
      },
      {
        style: props.style,
        zIndexOffset: props.zIndexOffset || 0,
        getColor: props.getColor,
        onEachFeature: (feature, layer) => {
          if (props.highlight) {
            layer.on({
              mouseover: this.highlightFeature,
              mouseout: e => {
                this._layer.resetStyle(e.target);
              }
            });
          }

          if (props.bullleoptions && props.bullleoptions.showBubble) {
            var attrs = [];
            props.bullleoptions.style.radius = Number(
              props.getRadius(feature.properties.value)
            );
            var bubble = L.circleMarker(
              layer.getBounds().getCenter(),
              props.bullleoptions.style
            ).addTo(this._markerlayer);
          }

          if (props.pieoptions && props.pieoptions.showPie) {
            var chartmarkers = L.marker(layer.getBounds().getCenter(), {
              icon: L.divIcon({
                className: "leaflet-echart-icon",
                iconSize: [
                  props.pieoptions.style.size,
                  props.pieoptions.style.size
                ],
                html:
                  '<div id="marker' +
                  feature.properties.name +
                  '" style="width: ' +
                  props.pieoptions.style.size +
                  "px; height: " +
                  props.pieoptions.style.size +
                  'px; position: relative; background-color: transparent;"></div>'
              })
            }).addTo(this._markerlayer);
            // props.addChart('marker'+feature.properties.name);
          }

          if (props.baroptions && props.baroptions.showBar) {
            var chartmarkers = L.marker(layer.getBounds().getCenter(), {
              icon: L.divIcon({
                className: "leaflet-echart-icon",
                iconSize: [
                  props.baroptions.style.size,
                  props.baroptions.style.size
                ],
                html:
                  '<div id="marker' +
                  feature.properties.name +
                  '" style="width: ' +
                  props.baroptions.style.size +
                  "px; height: " +
                  props.baroptions.style.size +
                  'px; position: relative; background-color: transparent;"></div>'
              })
            }).addTo(this._markerlayer);
            // props.addChart('marker'+feature.properties.name);
          }

          if (props.labeloptions && props.labeloptions.showlabel) {
            var attrs = [];
            props.labeloptions.labelattrs.forEach(attr => {
              attrs.push(feature.properties[attr]);
            });
            var label = L.marker(layer.getBounds().getCenter(), {
              icon: L.divIcon({
                className: "label",
                html:
                  "<div style='font-family:" +
                  props.labeloptions.fontfamily +
                  ";color: " +
                  props.labeloptions.color +
                  ";font-size: " +
                  props.labeloptions.fontsize +
                  "px'>" +
                  attrs.join("<br/>") +
                  "</div>",
                iconSize: [100, 40]
              })
            }).addTo(this._labellayer);
          }
        },
        pointToLayer: !this.isMarker(props)
          ? function(feature, latlng) {
              return L.circleMarker(
                latlng,
                props.style || {
                  radius: 5,
                  color: "red",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0
                }
              );
            }
          : null
      }
    );

    props.container.addLayer(this._layer);

    if (props.pieoptions && props.pieoptions.showPie) {
      props.container.addLayer(this._markerlayer);
    }
    if (props.baroptions && props.baroptions.showBar) {
      props.container.addLayer(this._markerlayer);
    }

    if (props.bullleoptions && props.bullleoptions.showBubble) {
      props.container.addLayer(this._markerlayer);
    }

    if (props.labeloptions && props.labeloptions.showlabel) {
      props.container.addLayer(this._labellayer);
    }

    let mapbounds = props.container._map.getBounds();
    if (this._layer instanceof L.Marker||this._layer instanceof L.CircleMarker) {
      let point = this._layer.getLatLng();
      if (props.zoomTo) {
          props.container._map.setView(point,18);
      }
  } else {
      let feabounds = this._layer.getBounds();
      if (props.zoomTo ) {
          props.container._map.flyToBounds(feabounds);
      }

  }

    if (props.title) {
      this._layer.bindTooltip(props.title, {
        offset: L.point(12, -20),
        direction: "right"
      });
      if (props.zIndexOffset > 0) {
        this._layer.openTooltip();
      }
    }

    if (props.popup) {
      if (props.style.pulse) {
        this._layer
          .bindPopup(props.popup, {
            offset: L.point(0, this._layer instanceof L.Marker ? -20 : 0)
          })
          .openPopup();
      } else {
        this._layer.bindPopup(props.popup);
      }
    }

    this._layer.on("click", event => {
      if (props.onClick) {
        props.onClick(
          {
            pixel: {
              x: event.originalEvent && event.originalEvent.x,
              y: event.originalEvent && event.originalEvent.y
            },
            latlng: event.latlng
          },
          this.props.options.handleClickOnLayer ? this.props.options.id : null
        );
      }
    });
  };
}

module.exports = Feature;
