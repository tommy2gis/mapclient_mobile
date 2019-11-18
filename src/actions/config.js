/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:33:17 
 * @Last Modified by: 史涛
 * @Last Modified time: 2019-01-08 11:16:11
 */
const axios = require('axios');

const MAP_CONFIG_LOADED = 'MAP_CONFIG_LOADED';
const MAP_CONFIG_LOAD_ERROR = 'MAP_CONFIG_LOAD_ERROR';
const MAP_INFO_LOAD_START = 'MAP_INFO_LOAD_START';
const MAP_INFO_LOADED = 'MAP_INFO_LOADED';
const MAP_INFO_LOAD_ERROR = 'MAP_INFO_LOAD_ERROR';
const LAYERDEFS_CHANGE = 'LAYERDEFS_CHANGE';
const LAYERIDS_CHANGE='LAYERIDS_CHANGE';
const LAYERVISIABLE_CHANGE='LAYERVISIABLE_CHANGE';


function changeLayerDefs(defs) {
    return {
        type: LAYERDEFS_CHANGE,
        defs: defs
    }
}

function changeLayerIds(layerids,layername){
    return {
        type: LAYERIDS_CHANGE,
        layerids,
        layername
    }
}


function changeLayerVisiable(layername,visiable){
    return {
        type: LAYERVISIABLE_CHANGE,
        layername,
        visiable
    }
}

function configureMap(conf, mapId) {
    return {
        type: MAP_CONFIG_LOADED,
        config: conf,
        legacy: !!mapId,
        mapId: mapId
    };
}

function configureError(e, mapId) {
    return {
        type: MAP_CONFIG_LOAD_ERROR,
        error: e,
        mapId
    };
}

function loadMapConfig(configName, mapId) {
    return (dispatch) => {
        return axios.get(configName).then((response) => {
            if (typeof response.data === 'object') {
                dispatch(configureMap(response.data, mapId));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(configureError('Configuration file broken (' + configName + '): ' + e.message, mapId));
                }
            }
        }).catch((e) => {
            dispatch(configureError(e, mapId));
        });
    };
}
function mapInfoLoaded(info, mapId) {
    return {
        type: MAP_INFO_LOADED,
        mapId,
        info
    };
}
function mapInfoLoadError(mapId, error) {
    return {
        type: MAP_INFO_LOAD_ERROR,
        mapId,
        error
    };
}
function mapInfoLoadStart(mapId) {
    return {
        type: MAP_INFO_LOAD_START,
        mapId
    };
}
function loadMapInfo(url, mapId) {
    return (dispatch) => {
        dispatch(mapInfoLoadStart(mapId));
        return axios.get(url).then((response) => {
            if (typeof response.data === 'object') {
                if (response.data.ShortResource) {
                    dispatch(mapInfoLoaded(response.data.ShortResource, mapId));
                } else {
                    dispatch(mapInfoLoaded(response.data, mapId));
                }

            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(mapInfoLoadError(mapId, e));
                }
            }
        }).catch((e) => {
            dispatch(mapInfoLoadError(mapId, e));
        });
    };

}
module.exports = {
    MAP_CONFIG_LOADED,
    MAP_CONFIG_LOAD_ERROR,
    MAP_INFO_LOAD_START,
    LAYERDEFS_CHANGE,
    LAYERIDS_CHANGE,
    changeLayerIds,
    MAP_INFO_LOADED,
    MAP_INFO_LOAD_ERROR,
    loadMapConfig,
    changeLayerVisiable,
    LAYERVISIABLE_CHANGE,
    loadMapInfo,
    configureMap,
    configureError,
    changeLayerDefs,
    mapInfoLoaded
};