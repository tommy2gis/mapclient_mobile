/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:33:45 
 * @Last Modified by: 史涛
 * @Last Modified time: 2019-11-25 15:14:13
 */

const PropTypes = require('prop-types');
const React = require('react');
const { head, last: _last, isNil } = require('lodash');
const L = require('leaflet');

require('leaflet-draw');
require('leaflet-draw/dist/leaflet.draw.css');

import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';



// var originalOnTouch = L.Draw.Polyline.prototype._onTouch;
// 	L.Draw.Polyline.prototype._onTouch = function( e ) {
// 		if( e.originalEvent.pointerType != 'mouse'  && e.originalEvent.pointerType != 'touch' ) {
// 			return originalOnTouch.call(this, e);
// 		}
// 	}



L.Draw.Polygon.prototype._calculateFinishDistance = function (t) {
    if (this._markers.length > 0) {
        const first = this._map.latLngToContainerPoint(this._markers[0].getLatLng());
        const last = this._map.latLngToContainerPoint(this._markers[this._markers.length - 1].getLatLng());

        const clickedMarker = new L.Marker(t, {
            icon: this.options.icon,
            zIndexOffset: 2 * this.options.zIndexOffset
        });
        const clicked = this._map.latLngToContainerPoint(clickedMarker.getLatLng());
        return Math.min(first.distanceTo(clicked), last.distanceTo(clicked));
    }
    return 1 / 0;
};

const { isSimpleGeomType, getSimpleGeomType } = require('../../utils/MapUtils');
const { boundsToOLExtent } = require('../../utils/DrawSupportUtils');
const assign = require('object-assign');

const VectorUtils = require('../../utils/map/Vector');

const DEG_TO_RAD = Math.PI / 180.0;
/**
 * Converts the leaflet circle into the projected circle (usually in 3857)
 * @param  {number} mRadius leaflet radius of circle
 * @param  {array} center  The center point in EPSG:4326. Array [lng,lat]
 * @return {object}        center and radius of the projected circle
 */
const toProjectedCircle = (mRadius, center, projection) => {
    if (projection === "EPSG:4326") {
        return {
            center,
            srs: projection,
            radius: mRadius
        };
    }
};

/**
 * From projected circle into leaflet circle.
 * @param  {number} radius                   Projected radius
 * @param  {object} center                   `{lng: {number}, lat: {number}}`
 * @param  {String} [projection="EPSG:4326"] projection from where to convert
 * @return {object}                          center and radius of leaflet circle
 */
const toLeafletCircle = (radius, center, projection = "EPSG:4326") => {
    if (projection === "EPSG:4326" || radius === undefined) {
        return {
            center,
            projection,
            radius
        };
    }
    const leafletCenter = { x: center.lng, y: center.lat };
    if (radius === undefined) {
        return {
            center: leafletCenter,
            projection,
            radius
        };
    }
    const checkPoint = { x: center.lng + radius, y: center.lat }

    const lonRadius = Math.sqrt(Math.pow(leafletCenter.x - checkPoint.x, 2) + Math.pow(leafletCenter.y - checkPoint.y, 2));
    const mRadius = lonRadius * Math.cos(DEG_TO_RAD * leafletCenter.y) * 40075017 / 360;
    return {
        center: leafletCenter,
        projection: "EPSG:4326",
        radius: mRadius
    };
};
/**
 * Component that allows to draw and edit geometries as (Point, LineString, Polygon, Rectangle, Circle, MultiGeometries)
 * @class DrawSupport
 * @memberof components.map
 * @prop {object} map the map usedto drawing on
 * @prop {string} drawOwner the owner of the drawn features
 * @prop {string} drawStatus the status that allows to do different things. see componentWillReceiveProps method
 * @prop {string} drawMethod the method used to draw different geometries. can be Circle,BBOX, or a geomType from Point to MultiPolygons
 * @prop {object} options it contains the params used to enable the interactions or simply stop the DrawSupport after a ft is drawn
 * @prop {object[]} features an array of geojson features used as a starting point for drawing new shapes or edit them
 * @prop {func} onChangeDrawingStatus method use to change the status of the DrawSupport
 * @prop {func} onGeometryChanged when a features is edited or drawn this methos is fired
 * @prop {func} onDrawStopped action fired if the DrawSupport stops
 * @prop {func} onEndDrawing action fired when a shape is drawn
 * @prop {object} messages the localized messages that can be used to customize the tooltip text
*/
class DrawSupport extends React.Component {
    static displayName = 'DrawSupport';

    static propTypes = {
        map: PropTypes.object,
        drawOwner: PropTypes.string,
        drawStatus: PropTypes.string,
        drawMethod: PropTypes.string,
        options: PropTypes.object,
        features: PropTypes.array,
        onChangeDrawingStatus: PropTypes.func,
        onGeometryChanged: PropTypes.func,
        onDrawStopped: PropTypes.func,
        onEndDrawing: PropTypes.func,
        messages: PropTypes.object,
        style: PropTypes.object
    };

    static defaultProps = {
        map: null,
        drawOwner: null,
        drawStatus: null,
        drawMethod: null,
        features: null,
        options: {
            stopAfterDrawing: true
        },
        onChangeDrawingStatus: () => { },
        onGeometryChanged: () => { },
        onDrawStopped: () => { },
        onEndDrawing: () => { },
        style: {
            color: '#ffcc33',
            opacity: 1,
            weight: 3,
            fillColor: '#ffffff',
            fillOpacity: 0.2,
            clickable: false,
            editing: {
                fill: 1
            }
        }
    };

    /**
     * Inside this lyfecycle method the status is checked to manipulate the behaviour of the DrawSupport.<br>
     * Here is the list of all status:<br>
     * create allows to create features<br>
     * start allows to start drawing features<br>
     * drawOrEdit allows to start drawing or editing the passed features or both<br>
     * stop allows to stop drawing features<br>
     * replace allows to replace all the features drawn by Drawsupport with new ones<br>
     * clean it cleans the drawn features and stop the drawsupport
     * endDrawing as for 'replace' action allows to replace all the features in addition triggers end drawing action to store data in state
     * @memberof components.map.DrawSupport
     * @function componentWillReceiveProps
    */
    componentWillReceiveProps(newProps) {
        let drawingStrings = this.props.messages || this.context.messages ? this.context.messages.drawLocal : false;
        if (drawingStrings) {
            L.drawLocal = drawingStrings;
        }
        if (this.props.drawStatus !== newProps.drawStatus || newProps.drawStatus === "replace" || this.props.drawMethod !== newProps.drawMethod || this.props.features !== newProps.features) {
            switch (newProps.drawStatus) {
                case "create": this.addGeojsonLayer({ features: newProps.features, projection: newProps.options && newProps.options.featureProjection || "EPSG:4326", style: newProps.style }); break;
                case "start": this.addDrawInteraction(newProps); break;
                case "drawOrEdit": this.addDrawOrEditInteractions(newProps); break;
                case "stop": {
                    this.removeAllInteractions();
                } break;
                case "replace": this.replaceFeatures(newProps); break;
                case "clean": this.cleanAndStop(newProps); break;
                case "endDrawing": this.endDrawing(newProps); break;
                case "back": this.backDrawing(newProps); break;
                case "addCenterPoint": this.addCenterPoint(newProps); break;
                default:
                    return;
            }
        }
    }

    onDrawStart = () => {
        this.drawing = true;
    };

    onDrawCreated = (evt) => {
        this.drawing = false;
        const layer = evt.layer;
        // let drawn geom stay on the map
        let geoJesonFt = layer.toGeoJSON();
        let bounds;
        if (evt.shape === "CircleMarker") {
            bounds = L.latLngBounds(geoJesonFt.geometry.coordinates, geoJesonFt.geometry.coordinates);
        } else {
            if (!layer._map) {
                layer._map = this.props.map;
                layer._renderer = this.props.map.getRenderer(layer);
                layer._project();
            }
            bounds = layer.getBounds();
        }
        let extent = boundsToOLExtent(bounds);
        let center = bounds.getCenter();
        center = [center.lng, center.lat];
        let coordinates = geoJesonFt.geometry.coordinates;
        let projection = "EPSG:4326";
        let type = geoJesonFt.geometry.type;
        let radius = layer.getRadius ? layer.getRadius() : 0;
        if (evt.layerType === "circle") {
            // Circle needs to generate path and needs to be projected before
            // When GeometryDetails update circle it's in charge to generete path
            // but for first time we need to do this!
            geoJesonFt.projection = "EPSG:4326";
            const projCircle = toProjectedCircle(layer._mRadius, center, projection);
            center = projCircle.center;
            radius = projCircle.radius;
            coordinates = this.calculateCircleCoordinates(center, radius, 100);
            geoJesonFt.radius = layer.getRadius ? layer.getRadius() : 0;
            center = [center.x, center.y];
            type = "Polygon";
        }
        // We always draw geoJson feature
        this.drawLayer.addData(geoJesonFt);
        // Geometry respect query form panel needs
        let geometry = {
            type,
            extent,
            center,
            coordinates,
            radius,
            projection
        };
        if (this.props.options && this.props.options.stopAfterDrawing) {
            this.props.onChangeDrawingStatus('stop', this.props.drawMethod, this.props.drawOwner);
        }
        const newGeoJsonFt = this.convertFeaturesToGeoJson(evt.layer, this.props);
        this.props.onEndDrawing(geometry, this.props.drawOwner);
        this.props.onGeometryChanged([newGeoJsonFt], this.props.drawOwner, this.props.options && this.props.options.stopAfterDrawing ? "enterEditMode" : "");
    };

    onUpdateGeom = (features, props) => {
        const newGeoJsonFt = this.convertFeaturesToGeoJson(features, props);
        props.onGeometryChanged([newGeoJsonFt], props.drawOwner);
    };

    calculateCircleCoordinates = (center, radius, sides, rotation) => {
        let angle = Math.PI * (1 / sides - 1 / 2);

        if (rotation) {
            angle += rotation / 180 * Math.PI;
        }

        let rotatedAngle; let x; let y;
        let points = [[]];
        for (let i = 0; i < sides; i++) {
            rotatedAngle = angle + i * 2 * Math.PI / sides;
            x = center.x + radius * Math.cos(rotatedAngle);
            y = center.y + radius * Math.sin(rotatedAngle);
            points[0].push([x, y]);
        }

        points[0].push(points[0][0]);
        return points;
    };

    render() {
        return null;
    }

    addLayer = (newProps) => {
        this.clean();
        const vector = L.geoJson(null, {
            pointToLayer: function (feature, latLng) {
                const { center, radius } = toLeafletCircle(feature.radius, latLng, feature.projection);
                return L.circle(center, radius || 5);
            },
            style: {
                color: '#ffcc33',
                opacity: 1,
                weight: 3,
                fillColor: '#ffffff',
                fillOpacity: 0.2,
                clickable: false
            }
        });
        this.props.map.addLayer(vector);
        // Immediately draw passed features
        if (newProps.features && newProps.features.length > 0) {
            vector.addData(this.convertFeaturesPolygonToPoint(newProps.features, this.props.drawMethod));
        }
        this.drawLayer = vector;
    };

    addGeojsonLayer = (data) => {
        this.clean();
        let geoJsonLayerGroup = L.geoJson(data.features, {
            style: (f) => {
                return f.style || data.style;
            }, pointToLayer: (f, latLng) => {
                return VectorUtils.pointToLayer(L.latLng(latLng.lat, latLng.lng), f, data);
            }
        });
        this.drawLayer = geoJsonLayerGroup.addTo(this.props.map);
    };


    replaceFeatures = (newProps) => {
        if (!this.drawLayer) {
            this.addGeojsonLayer({ features: newProps.features, projection: newProps.options && newProps.options.featureProjection || "EPSG:4326", style: newProps.style });
        } else {
            this.drawLayer.clearLayers();
            if (this.props.drawMethod === "Circle") {
                this.drawLayer.options.pointToLayer = (feature, latLng) => {
                    const { center, radius } = toLeafletCircle(feature.radius, latLng, feature.projection);
                    return L.circle(center, radius || 5);
                };
                this.drawLayer.options.style = {
                    color: '#ffcc33',
                    opacity: 1,
                    weight: 3,
                    fillColor: '#ffffff',
                    fillOpacity: 0.2,
                    clickable: false
                };
            } else {
                this.drawLayer.options.pointToLayer = (f, latLng) => {
                    return VectorUtils.pointToLayer(L.latLng(latLng.lat, latLng.lng), f, newProps.style);
                };
            }
            this.drawLayer.addData(this.convertFeaturesPolygonToPoint(newProps.features, this.props.drawMethod));
        }
    };

    endDrawing = (newProps) => {
        this.replaceFeatures(newProps);
        const geometry = _last(newProps.features);
        if (this.props.drawMethod === "Circle" && geometry && !isNil(geometry.center) && !isNil(geometry.radius)) {
            this.props.onEndDrawing({ ...geometry, coordinates: this.calculateCircleCoordinates(geometry.center, geometry.radius, 100) }, this.props.drawOwner);
        } else if (geometry) {
            this.props.onEndDrawing(geometry, this.props.drawOwner);
        }
    };

    backDrawing=(newProps) => {
        if (newProps.drawMethod === "CircleMarker") {

        } else {

            newProps.map.pm.Draw[newProps.drawMethod]._removeLastVertex();
        }

    };

    addCenterPoint=(newProps) => {
        if (newProps.drawMethod === "CircleMarker") {

        } else  {
            let control=newProps.map.pm.Draw[newProps.drawMethod];
            const first = control._layer.getLatLngs().length === 0;
            const center=this.props.map.getCenter();
            control._layer.addLatLng(center);
            control._createMarker(center, first);
        }

    };

    addDrawInteraction = (newProps) => {
        this.removeAllInteractions();
        if (newProps.drawMethod === "Point" || newProps.drawMethod === "MultiPoint") {
            let data = {
                features: newProps.features,
                projection: newProps.options && newProps.options.featureProjection || "EPSG:4326",
                style: newProps.style
            };
            this.addGeojsonLayer(data);
        } else {
            this.addLayer(newProps);
        }
        this.props.map.on('pm:create', this.onDrawCreated, this);
        this.props.map.on('pm:drawstart', this.onDrawStart, this);

        if (newProps.drawMethod === 'LineString' || newProps.drawMethod === 'Line' || newProps.drawMethod === 'MultiLineString') {
            // this.drawControl = new L.Draw.Polyline(this.props.map, {
            //     shapeOptions: {
            //         color: '#ffcc33',
            //         opacity: 1,
            //         weight: 3,
            //         fillColor: '#ffffff',
            //         fillOpacity: 0.2,
            //     },
            //     showLength: false,
            //     repeatMode: true,
            //     icon: new L.DivIcon({
            //         iconSize: new L.Point(8, 8),
            //         className: 'leaflet-div-icon leaflet-editing-icon'
            //     }),
            //     touchIcon: new L.DivIcon({
            //         iconSize: new L.Point(8, 8),
            //         className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
            //     })
            // });
            this.props.map.pm.enableDraw('Line', { finishOn: 'dblclick' });
        } else if (newProps.drawMethod === 'Polygon' || newProps.drawMethod === 'MultiPolygon') {
            // this.drawControl = new L.Draw.Polygon(this.props.map, {
            //     shapeOptions: {
            //         color: '#000000',
            //         weight: 2,
            //         fillColor: '#ffffff',
            //         fillOpacity: 0.2,
            //         dashArray: [5, 5],
            //         guidelineDistance: 5
            //     },
            //     allowIntersection: false,
            //     showLength: false,
            //     showArea: false,
            //     repeatMode: true,
            //     icon: new L.DivIcon({
            //         iconSize: new L.Point(8, 8),
            //         className: 'leaflet-div-icon leaflet-editing-icon'
            //     }),
            //     touchIcon: new L.DivIcon({
            //         iconSize: new L.Point(8, 8),
            //         className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
            //     })
            // });
            this.props.map.pm.enableDraw('Polygon', { finishOn: 'dblclick' });
        } else if (newProps.drawMethod === 'BBOX') {
            
            this.props.map.pm.enableDraw('Rectangle');
            // this.drawControl = new L.Draw.Rectangle(this.props.map, {
            //     draw: false,
            //     shapeOptions: {
            //         color: '#000000',
            //         weight: 2,
            //         fillColor: '#ffffff',
            //         fillOpacity: 0.2,
            //         dashArray: [5, 5]
            //     },
            //     repeatMode: true,
            //     icon: new L.DivIcon({
            //         iconSize: new L.Point(8, 8),
            //         className: 'leaflet-div-icon leaflet-editing-icon'
            //     }),
            //     touchIcon: new L.DivIcon({
            //         iconSize: new L.Point(8, 8),
            //         className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
            //     })
            // });
        } else if (newProps.drawMethod === 'Circle') {
            this.props.map.pm.enableDraw('Circle');
            // this.drawControl = new L.Draw.Circle(this.props.map, {
            //     shapeOptions: {
            //         color: '#000000',
            //         weight: 2,
            //         fillColor: '#ffffff',
            //         fillOpacity: 0.2,
            //         dashArray: [5, 5]
            //     },
            //     repeatMode: true
            // });
        } else if (newProps.drawMethod === 'Point' || newProps.drawMethod === 'CircleMarker') {
            
            this.props.map.pm.enableDraw('CircleMarker');
            // this.drawControl = new L.Draw.CircleMarker(this.props.map, {
            //     shapeOptions: {
            //         color: '#000000',
            //         weight: 2,
            //         fillColor: '#ffffff',
            //         fillOpacity: 0.2
            //     },
            //     icon: VectorUtils.getIcon(newProps.style)|| new L.Icon.Default(),
            //     repeatMode: true
            // });
        }

        // start the draw control
        if (this.props.map.doubleClickZoom) {
            this.props.map.doubleClickZoom.disable();
        }
        //this.drawControl.enable();
    };

    addDrawOrEditInteractions = (newProps) => {
        let newFeature = head(newProps.features);

        if (newFeature && newFeature.geometry && newFeature.geometry.type && !isSimpleGeomType(newFeature.geometry.type)) {
            const newFeatures = newFeature.geometry.coordinates.map((coords, idx) => {
                return {
                    type: 'Feature',
                    properties: { ...newFeature.properties },
                    id: newFeature.geometry.type + idx,
                    geometry: {
                        coordinates: coords,
                        type: getSimpleGeomType(newFeature.geometry.type)
                    }
                };
            });
            newFeature = { type: "FeatureCollection", features: newFeatures };
        }
        const props = assign({}, newProps, { features: [newFeature ? newFeature : {}] });
        if (!this.drawLayer) {
            /* Reprojection is needed to implement circle initial visualization after querypanel geometry reload (on reload the 100 points polygon is shown)
             *
             * We should, for the future draw a circle also on reload.
             * NOTE: after some center or radius changes (e.g. )
            */
            this.addGeojsonLayer({
                features: newProps.features,
                projection: newProps.options && newProps.options.featureProjection || "EPSG:4326",
                style: newProps.style
            });
        } else {
            this.drawLayer.clearLayers();
            this.drawLayer.addData(this.convertFeaturesPolygonToPoint(props.features, props.drawMethod));
        }
        if (newProps.options.editEnabled) {
            this.addEditInteraction(props);
        }
        if (newProps.options.drawEnabled) {
            this.addDrawInteraction(props);
        }
    };

    addEditInteraction = (newProps) => {
        this.clean();

        this.addGeojsonLayer({
            features: newProps.features,
            projection: newProps.options && newProps.options.featureProjection || "EPSG:4326",
            style: assign({}, newProps.style, {
                poly: {
                    icon: new L.DivIcon({
                        iconSize: new L.Point(8, 8),
                        className: 'leaflet-div-icon leaflet-editing-icon'
                    }),
                    touchIcon: new L.DivIcon({
                        iconSize: new L.Point(8, 8),
                        className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
                    })
                }
            })
        });

        let allLayers = this.drawLayer.getLayers();
        setTimeout(() => {
            allLayers.forEach(l => {
                l.on('edit', (e) => this.onUpdateGeom(e.target, newProps));
                l.on('moveend', (e) => this.onUpdateGeom(e.target, newProps));
                if (l.editing) {
                    l.editing.enable();
                }
            });
        }, 0);

        this.editControl = new L.Control.Draw({
            edit: {
                featureGroup: this.drawLayer,
                poly: {
                    allowIntersection: false
                },
                edit: true
            },
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true
                }
            }
        });
        if (this.props.map.doubleClickZoom) {
            this.props.map.doubleClickZoom.disable();
        }
    }

    removeAllInteractions = () => {
        this.removeEditInteraction();
        this.removeDrawInteraction();
        // this.props.onDrawStopped();
    }

    removeDrawInteraction = () => {
        this.props.map.off('pm:create', this.onDrawCreated, this);
        this.props.map.off('pm:drawstart', this.onDrawStart, this);
        if (this.props.map.doubleClickZoom) {
            this.props.map.doubleClickZoom.enable();
        }
    };

    removeEditInteraction = () => {
        if (this.props.map.pm) {
            this.props.map.pm.disableGlobalEditMode();
        }
        if (this.props.map.doubleClickZoom) {
            this.props.map.doubleClickZoom.enable();
        }
    };

    cleanAndStop = () => {
        let layers=this.props.map.pm.findLayers();
        layers.forEach(layer => {
            layer.remove();
        });
         this.removeAllInteractions();

        // if (this.drawLayer) {
        //     this.drawLayer.clearLayers();
        //     this.props.map.removeLayer(this.drawLayer);
        //     this.drawLayer = null;
        // }
    };

    clean = () => {
        this.removeEditInteraction();
        this.removeDrawInteraction();

        if (this.drawLayer) {
            this.drawLayer.clearLayers();
            this.props.map.removeLayer(this.drawLayer);
            this.drawLayer = null;
        }
    };

    convertFeaturesPolygonToPoint = (features, method) => {
        return method === 'Circle' ? features.map((f) => {
            const { center, projection, radius } = ((f.center !== undefined && f.radius !== undefined) ? toLeafletCircle(f.radius, { lat: f.center.y, lng: f.center.x }, f.projection) : f);
            return {
                ...f,
                coordinates: center ? [center.x, center.y] : f.coordinates,
                center: center || f.center,
                projection: projection || f.projection,
                radius: radius !== undefined ? radius : f.radius,
                type: "Point"
            };
        }) : features;

    };

    convertFeaturesToGeoJson = (featureEdited, props) => {
        let geom;
        if (!isSimpleGeomType(props.drawMethod)) {
            let newFeatures = this.drawLayer.getLayers().map(f => f.toGeoJSON());
            geom = {
                type: props.drawMethod,
                coordinates: newFeatures.reduce((p, c) => {
                    return p.concat([c.geometry.coordinates]);
                }, [])
            };
        } else {
            geom = featureEdited.toGeoJSON().geometry;
        }
        return assign({}, featureEdited.toGeoJSON(), { geometry: geom });
    };
}


module.exports = DrawSupport;
