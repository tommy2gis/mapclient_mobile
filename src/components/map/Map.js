/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:34:04 
 * @Last Modified by: 史涛
 * @Last Modified time: 2019-11-24 21:04:57
 */
var L = require('leaflet');
const PropTypes = require('prop-types');
var React = require('react');
var assign = require('object-assign');
const { throttle } = require('lodash');
var ConfigUtils = require('../../utils/ConfigUtils');
require('proj4');
require('proj4leaflet');
require('leaflet-contextmenu')

class LeafletMap extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className:PropTypes.string,
        zoom: PropTypes.number.isRequired,
        center: ConfigUtils.PropTypes.center,
        mapStateSource: ConfigUtils.PropTypes.mapStateSource,
        style: PropTypes.object,
        projection: PropTypes.string,
        onMapViewChanges: PropTypes.func,
        onClick: PropTypes.func,
        onRightClick: PropTypes.func,
        setRouteBegin: PropTypes.func,
        setRouteMid: PropTypes.func,
        setRouteEnd: PropTypes.func,
        mapOptions: PropTypes.object,
        zoomControl: PropTypes.bool,
        mousePointer: PropTypes.string,
        onMouseMove: PropTypes.func,
        onLayerLoading: PropTypes.func,
        onLayerLoad: PropTypes.func,
        onLayerError: PropTypes.func,
        resize: PropTypes.number,
        measurement: PropTypes.object,
        changeMeasurementState: PropTypes.func,
        registerHooks: PropTypes.bool,
        interactive: PropTypes.bool,
        resolutions: PropTypes.array,
        onCreationError: PropTypes.func
    };

    static defaultProps = {
        id: 'map',
        className:'map',
        onMapViewChanges: () => { },
        onCreationError: () => { },
        onClick: null,
        onMouseMove: () => { },
        zoomControl: false,
        mapOptions: {
            zoomAnimation: true,
            attributionControl: false
        },
        projection: "EPSG:4326",
        onLayerLoading: () => { },
        onLayerLoad: () => { },
        onLayerError: () => { },
        resize: 0,
        registerHooks: true,
        style: {},

        interactive: true
    };

    state = {};

    componentWillMount() {
        this.zoomOffset = 0;

        if (this.props.projection == "EPSG:4326") {
            let res = [];
            for (var i = 0; i < 21; i++) {
                res[i] = 1.40625 / Math.pow(2, i);
            }
            this.crs = new L.Proj.CRS(
                'EPSG:4326',
                "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs", {
                    origin: [-180.0, 90],
                    resolutions: res
                });
        }
    }

    componentDidMount() {
        let mapOptions = assign({}, this.props.interactive ? {} : {
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            minZoom:this.props.minZoom||0,
            maxZoom:this.props.maxZoom||20,
            boxZoom: false,
            tap: false,
            attributionControl: false
        }, {
                contextmenu: this.props.maxZoom||true,
                contextmenuWidth: 140,
                contextmenuItems: [{
                    text: '设置起点',
                    iconCls: 'anticon anticon-environment green-6',
                    callback: (e) => {
                        if (this.props.setBeginLoc) {
                            this.props.setBeginLoc('map',e.latlng);


                        }
                    }
                },
                {
                    text: '设置途径点',
                    iconCls: 'anticon anticon-environment yellow-6',
                    callback: (e) => {
                        if (this.props.setMidLoc) {
                            this.props.setMidLoc('map',e.latlng);
                        }
                    }
                },
                {
                    text: '设置终点',
                    iconCls: 'anticon anticon-environment red-6',
                    callback: (e) => {
                        if (this.props.setEndLoc) {

                            this.props.setEndLoc('map',e.latlng);


                        }
                    }
                }
                ]
            }, this.props.mapOptions, this.crs ? { crs: this.crs } : {});


        const map = L.map(this.props.id, assign({ zoomControl: this.props.zoomControl }, mapOptions)).setView([this.props.center.y, this.props.center.x],
            Math.round(this.props.zoom));
        const mapextend=this.props.mapextend;
        if(mapextend){
            map.fitBounds([
                [mapextend.miny, mapextend.minx],
                [mapextend.maxy, mapextend.maxx]
            ]);
        }
        this.map = map;


        /*         this.attribution = L.control.attribution();
                this.attribution.addTo(this.map); */
       

        this.map.on('moveend', this.updateMapInfoState);

        //函数节流0.1S内只执行一次
        const mouseMove = throttle(this.mouseMoveEvent, 100);
        this.map.on('dragstart', () => { this.map.off('mousemove', mouseMove); });
        this.map.on('dragend', () => { this.map.on('mousemove', mouseMove); });
        this.map.on('mousemove', mouseMove);
        this.map.on('contextmenu', (e) => {
            if (this.props.onRightClick) {
                this.props.onRightClick(event.containerPoint);
            }
        });

        this.updateMapInfoState();
        this.setMousePointer(this.props.mousePointer);
        // NOTE: this re-call render function after div creation to have the map initialized.
        this.forceUpdate();

        this.map.on('layeradd', (event) => {
            if(this.props.onLayerLoad){
                this.props.onLayerLoad(event);
            }
            
        });

        this.map.on('mousedown', (ev) => {
            if (this.props.onMouseDown) {
                this.props.onMouseDown(ev);
            }
        });

        this.map.on('layerremove', (event) => {
            if (event.layer.layerLoadingStream$) {
                event.layer.layerLoadingStream$.complete();
                event.layer.layerLoadStream$.complete();
                event.layer.layerErrorStream$.complete();
            }
        });

        this.drawControl = null;


    }

    componentWillReceiveProps(newProps) {

        if (newProps.mousePointer !== this.props.mousePointer) {
            this.setMousePointer(newProps.mousePointer);
        }
        // update the position if the map is not the source of the state change
        if (this.map && newProps.mapStateSource !== this.props.id) {
            this._updateMapPositionFromNewProps(newProps);
        }

        if (this.map && newProps.minZoom !== this.props.minZoom) {
            this.map.setMinZoom(newProps.minZoom);
        }

        if (this.map && newProps.maxZoom !== this.props.maxZoom) {
            this.map.setMaxZoom(newProps.maxZoom);
        }

        if (newProps.zoomControl !== this.props.zoomControl) {
            if (newProps.zoomControl) {
                this.map.addControl(L.control.zoom({ position: 'bottomright' }));
            } else {
                this.map.removeControl(this.map.zoomControl);
            }
        }
        //地图窗口变化时map重置
        if (this.map && newProps.resize !== this.props.resize) {
            setTimeout(() => {
                this.map.invalidateSize(false);
            }, 0);
        }
        return false;
    }

    componentWillUnmount() {
        const attributionContainer = this.props.mapOptions.attribution && this.props.mapOptions.attribution.container && document.querySelector(this.props.mapOptions.attribution.container);
        if (attributionContainer && this.attribution.getContainer() && attributionContainer.querySelector('.leaflet-control-attribution')) {
            attributionContainer.removeChild(this.attribution.getContainer());
        }
        try {
            this.map.remove();
        } catch (error) {

        }

    }

    getResolutions = () => {
        return this.props.resolutions;
    };

    render() {
        const map = this.map;
        const mapProj = this.props.projection;
        const children = map ? React.Children.map(this.props.children, child => {
            return child ? React.cloneElement(child, {
                map: map,
                projection: mapProj,
                zoomOffset: this.zoomOffset,
                onCreationError: this.props.onCreationError,
                onClick: this.props.onClick
            }) : null;
        }) : null;
        return (
            <div id={this.props.id} className={this.props.className} style={this.props.style}>
                {children}
            </div>
        );
    }

    _updateMapPositionFromNewProps = (newProps) => {
        // current implementation will update the map only if the movement
        // between 12 decimals in the reference system to avoid rounded value
        // changes due to float mathematic operations.
        const isNearlyEqual = function (a, b) {
            if (a === undefined || b === undefined) {
                return false;
            }
            return a.toFixed(12) - b.toFixed(12) === 0;
        };

        // getting all centers we need to check
        const newCenter = newProps.center;
        const currentCenter = this.props.center;
        const mapCenter = this.map.getCenter();
        // checking if the current props are the same
        const propsCentersEqual = isNearlyEqual(newCenter.x, currentCenter.x) &&
            isNearlyEqual(newCenter.y, currentCenter.y);
        // if props are the same nothing to do, otherwise
        // we need to check if the new center is equal to map center
        const centerIsNotUpdated = propsCentersEqual ||
            isNearlyEqual(newCenter.x, mapCenter.lng) &&
            isNearlyEqual(newCenter.y, mapCenter.lat);

        // getting all zoom values we need to check
        const newZoom = newProps.zoom;
        const currentZoom = this.props.zoom;
        const mapZoom = this.map.getZoom();
        // checking if the current props are the same
        const propsZoomEqual = newZoom === currentZoom;
        // if props are the same nothing to do, otherwise
        // we need to check if the new zoom is equal to map zoom
        const zoomIsNotUpdated = propsZoomEqual || newZoom === mapZoom;

        // do the change at the same time, to avoid glitches
        if (!centerIsNotUpdated && !zoomIsNotUpdated) {
            this.map.setView([newProps.center.y, newProps.center.x], Math.round(newProps.zoom));
        } else if (!zoomIsNotUpdated) {
            this.map.setZoom(newProps.zoom);
        } else if (!centerIsNotUpdated) {
            this.map.setView([newProps.center.y, newProps.center.x]);
        }
    };

    updateMapInfoState = () => {
        const bbox = this.map.getBounds().toBBoxString().split(',');
        const size = {
            height: this.map.getSize().y,
            width: this.map.getSize().x
        };
        var center = this.map.getCenter();
        this.props.onMapViewChanges({ x: center.lng, y: center.lat, crs: "EPSG:4326" }, this.map.getZoom(), {
            bounds: {
                minx: parseFloat(bbox[0]),
                miny: parseFloat(bbox[1]),
                maxx: parseFloat(bbox[2]),
                maxy: parseFloat(bbox[3])
            },
            crs: 'EPSG:4326',
            rotation: 0
        }, size, this.props.id, this.props.projection);
    };

    setMousePointer = (pointer) => {
        if (this.map) {
            const mapDiv = this.map.getContainer();
            mapDiv.style.cursor = pointer || 'auto';
        }
    };

    mouseMoveEvent = (event) => {
        let pos = event.latlng.wrap();
        this.props.onMouseMove({
            x: pos.lng || 0.0,
            y: pos.lat || 0.0,
            z: this.elevationLayer && this.elevationLayer.getElevation(pos, event.containerPoint) || undefined,
            crs: "EPSG:4326",
            pixel: {
                x: event.containerPoint.x,
                y: event.containerPoint.x
            }
        });
    };


}

module.exports = LeafletMap;