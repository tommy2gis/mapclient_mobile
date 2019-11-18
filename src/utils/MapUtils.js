/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:32:01 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:32:01 
 */

const DEFAULT_SCREEN_DPI = 96;
const EXTENT_TO_ZOOM_HOOK = 'EXTENT_TO_ZOOM_HOOK';
const RESOLUTIONS_HOOK = 'RESOLUTIONS_HOOK';
const RESOLUTION_HOOK = 'RESOLUTION_HOOK';
const COMPUTE_BBOX_HOOK = 'COMPUTE_BBOX_HOOK';
const GET_PIXEL_FROM_COORDINATES_HOOK = 'GET_PIXEL_FROM_COORDINATES_HOOK';
const GET_COORDINATES_FROM_PIXEL_HOOK = 'GET_COORDINATES_FROM_PIXEL_HOOK';

var hooks = {};


function registerHook(name, hook) {
    hooks[name] = hook;
}

function getHook(name) {
    return hooks[name];
}

function executeHook(hookName, existCallback, dontExistCallback) {
    const hook = getHook(hookName);
    if (hook) {
        return existCallback(hook);
    }
    if (dontExistCallback) {
        return dontExistCallback();
    }
    return null;
}

function isSimpleGeomType(geomType) {
    switch (geomType) {
        case "MultiPoint": case "MultiLineString": case "MultiPolygon": return false;
        case "Point": case "LineString": case "Polygon": case "Circle": default: return true;
    }
}

function getSimpleGeomType(geomType = "Point") {
    switch (geomType) {
        case "Point": case "LineString": case "Polygon": case "Circle": return geomType;
        case "MultiPoint": return "Point";
        case "MultiLineString": return "LineString";
        case "MultiPolygon": return "Polygon";
        default: return geomType;
    }
}


module.exports = {
    EXTENT_TO_ZOOM_HOOK,
    RESOLUTIONS_HOOK,
    RESOLUTION_HOOK,
    COMPUTE_BBOX_HOOK,
    GET_PIXEL_FROM_COORDINATES_HOOK,
    GET_COORDINATES_FROM_PIXEL_HOOK,
    DEFAULT_SCREEN_DPI,
    isSimpleGeomType,
    getSimpleGeomType,
    registerHook,
    getHook,
};
