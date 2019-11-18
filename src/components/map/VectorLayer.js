/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:34:19 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:34:19 
 */
const Layers = require('../../utils/map/LayersUtils');
var L = require('leaflet');

var defaultStyle = {
    radius: 5,
    color: "red",
    weight: 1,
    opacity: 1,
    fillOpacity: 0
};

const assign = require('object-assign');

const setOpacity = (layer, opacity) => {
    if (layer.eachLayer) {
        layer.eachLayer(l => {
            if (l.setOpacity) {
                l.setOpacity(opacity);
            }
            setOpacity(l, opacity);
        });
    }
};

var createVectorLayer = function(options) {
    const {hideLoading} = options;
    const layer = L.geoJson([]/* options.features */, {
        pointToLayer: options.styleName !== "marker" ? function(feature, latlng) {
            return L.circleMarker(latlng, options.style || defaultStyle);
        } : null,
        hideLoading: hideLoading,
        style: options.nativeStyle || options.style || defaultStyle
    });
    layer.setOpacity = (opacity) => {
        const style = assign({}, layer.options.style || defaultStyle, {opacity: opacity, fillOpacity: opacity});
        layer.setStyle(style);
        setOpacity(layer, opacity);
    };
    return layer;
};

Layers.registerType('vector', {
    create: (options) => {
        return createVectorLayer(options);
    },
    render: () => {
        return null;
    }
});