/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:34:23 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:34:23 
 */


const Layers = require('../../utils/map/LayersUtils');
const L = require('leaflet');

const { GeoWMTS,
    GeoTDTWMTS } = require('../../utils/map/WMTS.TDT');


L.geoWmtsLayer = function(url, options) {
    return new GeoWMTS(url, options);
};

L.geoTDTWMTSLayer = function(urls, options) {
    return new GeoTDTWMTS(urls, options);
};

const createGeoLayer = options => {
    return L.geoWmtsLayer(options.url,options);
};
Layers.registerType('geowmts', { create: createGeoLayer});


const createGeoTDTLayer = options => {
    return L.geoTDTWMTSLayer(options.url,options);
};
Layers.registerType('geotdtwmts', { create: createGeoTDTLayer});