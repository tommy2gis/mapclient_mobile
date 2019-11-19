/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:31:08 
 * @Last Modified by: 史涛
 * @Last Modified time: 2019-11-19 10:55:19
 */


var {CHANGE_MAP_VIEW, CHANGE_MOUSE_POINTER,CHANGE_MODEL,
    CHANGE_ZOOM_LVL, CHANGE_MAP_CRS, CHANGE_MAP_SCALES, ZOOM_TO_EXTENT, PAN_TO,
    CHANGE_MAP_STYLE, CHANGE_ROTATION, UPDATE_VERSION, ZOOM_TO_POINT, RESIZE_MAP} = require('../actions/map');
const {isArray} = require('lodash');


var assign = require('object-assign');



function mapConfig(state = null, action) {
    switch (action.type) {
    case CHANGE_MAP_VIEW:
        const {type, ...params} = action;
        return assign({}, state, params);
    case CHANGE_MOUSE_POINTER:
        return assign({}, state, {
            mousePointer: action.pointer
        });
    case CHANGE_ZOOM_LVL:
    var data=assign({}, state, {
        zoom: action.zoom,
        mapStateSource: action.mapStateSource
    });
        return data;
    case CHANGE_MAP_CRS:
        return assign({}, state, {
            projection: action.crs
        });
    case CHANGE_MODEL:
            return assign({}, state, {
                model: action.model
            });
   
    case ZOOM_TO_POINT: {
        return assign({}, state, {
            center: CoordinatesUtils.reproject(action.pos, action.crs, 'EPSG:4326'),
            zoom: action.zoom,
            mapStateSource: null
        });
    }
    case PAN_TO: {
        const center = CoordinatesUtils.reproject(
                action.center,
                action.center.crs,
                'EPSG:4326');
        return assign({}, state, {
            center,
            mapStateSource: null
        });
    }
    case CHANGE_MAP_STYLE: {
        return assign({}, state, {mapStateSource: action.mapStateSource, style: action.style, resize: state.resize ? state.resize + 1 : 1});
    }
    case RESIZE_MAP: {
        return assign({}, state, {resize: state.resize ? state.resize + 1 : 1});
    }
    case CHANGE_ROTATION: {
        let newBbox = assign({}, state.bbox, {rotation: action.rotation});
        return assign({}, state, {bbox: newBbox, mapStateSource: action.mapStateSource});
    }
    case UPDATE_VERSION: {
        return assign({}, state, {version: action.version});
    }
    default:
        return state;
    }
}

module.exports = mapConfig;
