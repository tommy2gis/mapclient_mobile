/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const L = require('leaflet');
const {isFunction} = require('lodash');
require('@ansur/leaflet-pulse-icon');
require('@ansur/leaflet-pulse-icon/dist/L.Icon.Pulse.css')
require('leaflet-extra-markers');
require('leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css');

module.exports = {
    extra: {
        getIcon: (style) => {
            if(style.pulse){
                return L.icon.pulse({iconSize:[20,20],fillColor:'#fdfcfc00',color:style.iconColor||'#fdfcfc00'});
            }
            const prefix = style.iconPrefix || 'fa';
            return L.ExtraMarkers.icon({
                icon: prefix + '-' + style.iconGlyph,
                markerColor: style.iconColor || 'blue',
                shape: style.iconShape || 'circle',
                number:style.number||'',
                prefix: prefix+' '+prefix+'font',
                extraClasses: style.highlight ? 'marker-selected' : ''
            });
        }
    },
    standard: {
        getIcon: (style) => {
            return L.icon({
                iconUrl: style.iconUrl,
                shadowUrl: style.shadowUrl,
                iconSize: style.iconSize,
                shadowSize: style.shadowSize,
                iconAnchor: style.iconAnchor,
                shadowAnchor: style.shadowAnchor,
                popupAnchor: style.popupAnchor
            });
        }
    },
    html: {
        getIcon: (style, geojson) => {
            return L.divIcon(isFunction(style.html) ? style.html(geojson) : style.html);
        }
    }
};
