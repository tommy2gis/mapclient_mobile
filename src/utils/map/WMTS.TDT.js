
const L = require('leaflet');

/**
 * [initialize description]
 * @param  {[type]} url                     [description]
 * @param  {[type]} options)                {                    this._url [description]
 * @param  {[type]} this.defaultWmtsParams) [description]
 * @return {[type]}                         [description]
 */
var GeoWMTS = L.TileLayer.extend({
    defaultWmtsParams: {
        service: 'WMTS',
        request: 'GetTile',
        version: '1.0.0',
        layer: '',
        style: 'default',
        tileMatrixSet: 'c',
        format: 'tiles'
    },
    layerType: 'WMTSLayer',
    initialize: function (url, options) { // (String, Object)
        this._url = url instanceof Array ? url : [url];
        var wmtsParams = L.extend({}, this.defaultWmtsParams),
            tileSize = options.tileSize || this.options.tileSize;
        if (options.detectRetina && L.Browser.retina) {
            wmtsParams.width = wmtsParams.height = tileSize * 2;
        } else {
            wmtsParams.width = wmtsParams.height = tileSize;
        }
        for (var i in options) {
            // all keys that are not TileLayer options go to WMTS params
            if (!this.options.hasOwnProperty(i) && i != "matrixIds"&& i != "url") {
                wmtsParams[i] = options[i];
            }
        }
        this.wmtsParams = wmtsParams;
       
        
        L.setOptions(this, options);
    },
    onAdd: function (map) {
        L.TileLayer.prototype.onAdd.call(this, map);
    },
    getTileUrl: function (tilePoint) {
        var url = this._url instanceof Array?this._url[(tilePoint.x + tilePoint.y) % this._url.length]:this._url;
        return url + L.Util.getParamString(this.wmtsParams, url) + "&tilematrix=" + tilePoint.z + "&tilerow=" + tilePoint.y + "&tilecol=" + tilePoint.x;
    },
    setParams: function (params, noRedraw) {
        L.extend(this.wmtsParams, params);
        if (!noRedraw) {
            this.redraw();
        }
        return this;
    }
});

/**
 * [initialize description]
 * @param  {[type]} url                     [description]
 * @param  {[type]} options)                {                    this._url [description]
 * @param  {[type]} this.defaultWmtsParams) [description]
 * @param  {[type]} tileSize                [description]
 * @return {[type]}                         [description]
 */
var GeoTDTWMTS = GeoWMTS.extend({
    initialize: function (urls, options) { // (String, Object)
        this._url = urls;
        var wmtsParams = L.extend({}, this.defaultWmtsParams),
            tileSize = options.tileSize || this.options.tileSize;
        if (options.detectRetina && L.Browser.retina) {
            wmtsParams.width = wmtsParams.height = tileSize * 2;
        } else {
            wmtsParams.width = wmtsParams.height = tileSize;
        }
        for (var i in options) {
            // all keys that are not TileLayer options go to WMTS params
            if (!this.options.hasOwnProperty(i) && i != "id"&& i != "matrixIds"&& i != "url"&&i!="onError") {
                wmtsParams[i] = options[i];
            }
        }
        this.wmtsParams = wmtsParams;
        L.setOptions(this, options);
    }
});


module.exports = {
    GeoWMTS,
    GeoTDTWMTS
};
