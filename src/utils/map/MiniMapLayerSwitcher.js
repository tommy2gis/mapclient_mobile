


import L from 'leaflet';
import './MiniMapLayerSwitcher.less';
import { GeoTDTWMTS } from './WMTS.TDT';
var MiniMapLayerSwitcher = L.Control.extend({
    _className: 'leaflet-mini-map-control-layers',
    currentcode: 'MS0000001',
    options: {
        miniMapLabelHeight: 22,
        miniMapHeight: 80,
        miniMapWidth: 90,
        miniMapMargin: 10,
        miniMapZoomOffset: -3,
        position: 'bottomright',
        crs: null,
        title: '地图切换',
        autoZIndex: true
    },

    initialize: function (baseLayers, overLayers, options) {
        L.setOptions(this, options);

        this._layers = [];
        this._overlayers = [];
        this._miniMaps = {};
        this._lastZIndex = 0;


        let layergroups = this.arrayTranform(baseLayers.filter(item => item.group));
        for (var i in layergroups) {
            this._addLayer(layergroups[i].data, layergroups[i].name);
        }
        for (var i in overLayers) {
            this._addOverLayer(overLayers[i], i);
        }
    },

    arrayTranform: function (arr) {
        var map = {},
            dest = [];
        for (var i = 0; i < arr.length; i++) {
            var ai = arr[i];
            if (!map[ai.group]) {
                dest.push({
                    name: ai.group,
                    data: [ai]
                });
                map[ai.group] = ai;
            } else {
                for (var j = 0; j < dest.length; j++) {
                    var dj = dest[j];
                    if (dj.group == ai.group) {
                        dj.data.push(ai);
                        break;
                    }
                }
            }
        }
        return dest;
    },

    addTo: function (map) {
        var that = this;

        L.Control.prototype.addTo.call(this, map);

        this._updateMiniMaps();

        this._forEachLayer(function (layerObj) {
            var layerId = layerObj.id,
                miniMap = that._miniMaps[layerId];

            miniMap.invalidateSize();
        });

        return this;
    },

    onAdd: function () {
        this._map
            .on('move', this._updateMiniMaps, this)
            .whenReady(this._onMapReady, this);

        this._render();

        return this._container;
    },

    onRemove: function () {
        this._map.off('move', this._updateMiniMaps, this);
    },

    _render: function () {
        var container = this._container = L.DomUtil.create('div', this._className),
            innerup = this._innerup = L.DomUtil.create('div', this._className + '-innerup'),
            inner = this._inner = L.DomUtil.create('div', this._className + '-inner'),
          //  innersub = this._innersub = L.DomUtil.create('ul', this._className + '-innersub'),
            initialActiveLayerId, initialActiveMiniMapLayerId;

        container.setAttribute('aria-haspopup', true);

        L.DomEvent.disableClickPropagation(container);

        if (!L.Browser.touch) {
            L.DomEvent
                .on(container, 'mousewheel', L.DomEvent.stopPropagation)
                .on(container, 'mouseenter', this._expand, this)
                .on(container, 'mouseleave', this._contract, this);
        } else {
            L.DomEvent.on(container, 'click', this._toggleMiniMaps, this);
        }

        container.style.height = this.options.miniMapHeight + this.options.miniMapLabelHeight + 50 + 'px';
        innerup.innerHTML = ' ' + this.options.title;
        container.appendChild(innerup);
        container.appendChild(inner);
       // container.appendChild(innersub);

        var overlayers = this._overlayers.filter(function (item) {
            return item.overMapLayer.code == 'MS0000001';
        });

       // this._renderOverLayers();
        this._forEachLayer(function (layerObj) {
            this._renderMiniMap(layerObj, inner);
        }, this);

        if (!this._hasMultipleLayers()) {
            this._container.style.display = 'none';
            return;
        }

        initialActiveLayerId = this._getInitialMainMapLayerId();
        initialActiveMiniMapLayerId = this._getInitialMiniMapLayerId(initialActiveLayerId);

        this._activeLayerId = initialActiveMiniMapLayerId;
        this._switchLayer(initialActiveLayerId);
    },

    _toggleMiniMaps: function () {
        var isExpanded = L.DomUtil.hasClass(this._container, 'expanded');

        this._animateMiniMaps(!isExpanded);
    },

    _expand: function () {
        this._animateMiniMaps(true);
    },

    _contract: function () {
        this._animateMiniMaps(false);
    },
/*     _renderOverLayers: function () {
        var that = this;
        var layerObjs = this._overlayers.filter(function (item) {
            return item.overMapLayer.code == that.currentcode;
        });
        this._innersub.innerHTML = "";
        // var overlayerContainer = this._mapContainer = L.DomUtil.create('div', 'overlayer-container');
        var layerId, layer;
        layerObjs.forEach(function (ele) {
            layerId = ele.id;
            layer = this._findOverLayer(layerId);
            var input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'leaflet-control-layers-selector';
            // input.defaultChecked = checked;
            input.layerId = layerId;

            L.DomEvent.on(input, 'click', this._onInputClick, this);

            var name = document.createElement('span');
            if (this.GetLength(ele.name) > 16) {
                name.innerHTML = ' ' + this.cutstr(ele.name, 16);
                name.title = ele.name;
            } else {
                name.innerHTML = ' ' + ele.name;
            }
            var li = document.createElement('li');
            li.appendChild(input);
            li.appendChild(name);
            this._innersub.appendChild(li);

        }, this);
        this._innersub.style.height = (10 + layerObjs.length * 25) + 'px';
    }, */
    GetLength: function (str) {
        ///<summary>获得字符串实际长度，中文2，英文1</summary>
        ///<param name="str">要获得长度的字符串</param>
        var realLength = 0,
            len = str.length,
            charCode = -1;
        for (var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128) realLength += 1;
            else realLength += 2;
        }
        return realLength;
    },

    cutstr: function (str, len) {
        var str_length = 0;
        var str_len = 0;
        str_cut = new String();
        str_len = str.length;
        for (var i = 0; i < str_len; i++) {
            a = str.charAt(i);
            str_length++;
            if (escape(a).length > 4) {
                //中文字符的长度经编码之后大于4  
                str_length++;
            }
            str_cut = str_cut.concat(a);
            if (str_length >= len) {
                str_cut = str_cut.concat("...");
                return str_cut;
            }
        }
        //如果给定字符串小于指定长度，则返回源字符串；  
        if (str_length < len) {
            return str;
        }
    },

    _onInputClick: function (e) {
        var selected = this._findOverLayer(e.target.layerId);
        var hasLayer = this._map.hasLayer(selected.overMapLayer);

        if (e.target.checked && !hasLayer) {
            // this._map.addLayer(selected.overMapLayer);

        } else {
            //this._map.removeLayer(selected.overMapLayer);
        }

    },

    hideLayers: function () {
        var layer = this._findLayer(this._activeLayerId).mainMapLayer;
        //this._map.removeLayer(layer);
    },
    showLayers: function () {
        var layer = this._findLayer(this._activeLayerId).mainMapLayer;

        //this._map.addLayer(layer);
    },

    _renderMiniMap: function (layerObj, container) {
        var code = layerObj.mainMapLayer.code || '';
        var miniMapContainer = this._mapContainer = L.DomUtil.create('div', 'map-container'),
            miniMapContainerInner = L.DomUtil.create('div', 'map-container-inner'),
            miniMap = this._mapContainer = L.DomUtil.create('div', 'minmap ' + code),
            miniMapLabel = L.DomUtil.create('div', 'map-label'),
            layerId = layerObj.id,
            layer = this._findLayer(layerId);

        L.DomEvent.on(miniMapContainer, 'click', this._onMiniMapClicked, this);

        miniMap.style.height = this.options.miniMapHeight + 'px';
        miniMap.style.width = this.options.miniMapWidth + 'px';
        miniMapLabel.innerHTML = layerObj.name;

        miniMapContainerInner.appendChild(miniMap);
        miniMapContainerInner.appendChild(miniMapLabel);

        miniMapContainer.layerId = layerId;
        miniMapContainer.style.width = this.options.miniMapWidth + 'px';
        miniMapContainer.appendChild(miniMapContainerInner);

        container.appendChild(miniMapContainer);

        this._addMiniMap(layerId, layer.miniMapLayer, miniMap);
    },

    _addMiniMap: function (layerId, miniMapLayer, mapContainer) {
        var zoomOffset = this.options.miniMapZoomOffset,
            minZoom = this._map.getMinZoom(),
            maxZoom = this._map.getMaxZoom(),

            miniMap = new L.Map(mapContainer, {
                dragging: false,
                touchZoom: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                trackResize: false,
                attributionControl: false,
                zoomControl: false,
                inertia: false,
                crs: this.options.crs,
                worldCopyJump: false,
                layers: [miniMapLayer],
                minZoom: minZoom + zoomOffset,
                maxZoom: maxZoom + zoomOffset
            });

        /*miniMap = L.map(mapContainer, {
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            trackResize: false,
            attributionControl: false,
            zoomControl: false,
            inertia: false,
            worldCopyJump: false,
            layers: [miniMapLayer],
            minZoom: minZoom + zoomOffset,
            maxZoom: maxZoom + zoomOffset
        });*/

        this._miniMaps[layerId] = miniMap;
    },

    _addOverLayer: function (layer, name) {
        var id = L.stamp(layer);

        this._overlayers.push({
            id: id,
            name: name,
            overMapLayer: layer
        });

        if (this.options.autoZIndex && layer.setZIndex) {
            this._lastZIndex++;
            layer.setZIndex(this._lastZIndex);
        }
    },


    _addLayer: function (layers, name) {
        var i, clonedLayer;

        if (layers.length>0) {
            clonedLayer = new L.LayerGroup();
            for (i in layers) {
                clonedLayer.addLayer(new GeoTDTWMTS(layers[i].url, layers[i]));
            }
        } else {
            clonedLayer = new GeoTDTWMTS(layers[0].url, layers[0]);

        }
        var id = L.stamp(clonedLayer);
        clonedLayer.name=name;
        this._layers.push({
            id: id,
            name: name,
            mainMapLayer: clonedLayer,
            miniMapLayer: clonedLayer
        });

       
    },

    _findLayer: function (layerId) {
        var layers = this._layers,
            layerCount = layers.length,
            i, layer;

        for (i = 0; i < layerCount; i++) {
            layer = layers[i];
            if (layer.id === layerId) {
                return layer;
            }
        }
        return null;
    },
    _findOverLayer: function (layerId) {
        var layers = this._overlayers,
            layerCount = layers.length,
            i, layer;

        for (i = 0; i < layerCount; i++) {
            layer = layers[i];
            if (layer.id === layerId) {
                return layer;
            }
        }
        return null;
    },

    _getCurrentTarget: function (event) {
        if (event.currentTarget) {
            return event.currentTarget;
        }

        return this._getFirstElementWithClass(event.srcElement, 'map-container');
    },

    _getFirstElementWithClass: function (el, className) {
        var hasClass = L.DomUtil.hasClass(el, className),
            parent = el.parentNode;

        return hasClass ? el : this._getFirstElementWithClass(parent, className);
    },

    _onMiniMapClicked: function (e) {
        var container = this._container,
            mapContainer = this._getCurrentTarget(e),
            clickedLayerId = mapContainer.layerId,
            isExpanded = L.DomUtil.hasClass(this._container, 'expanded'),
            clickedMainMapLayer;

        if (!isExpanded) {
            return;
        }

        if (clickedLayerId === this._activeLayerId) {
            return;
        }

        var lastActiveLayer = this._findLayer(this._activeLayerId);
        clickedMainMapLayer = this._findLayer(clickedLayerId);

        L.DomUtil.addClass(container, 'notransition');
        this._switchLayer(clickedLayerId);
        /* var layers = {
            newlayer: clickedMainMapLayer.mainMapLayer,
            oldlayer: lastActiveLayer.mainMapLayer
        } */

        this._map.fire('baselayerchanged', {name:clickedMainMapLayer.mainMapLayer.name});
        this.currentcode = clickedMainMapLayer.mainMapLayer.code;
      //  this._renderOverLayers();
        console.info(this.currentcode);
        L.Util.falseFn(mapContainer.offsetWidth);

        L.DomUtil.removeClass(container, 'notransition');
    },

    _switchLayer: function (newActiveLayerId) {
        var lastActiveLayerId = this._activeLayerId,
            lastActiveLayer = this._findLayer(lastActiveLayerId),
            newActiveLayer = this._findLayer(newActiveLayerId),
            newActiveMiniMapContainer = this._getMiniMapContainer(newActiveLayerId),
            mapContainer, suggestedLayerId, suggestedMiniMapContainer;

        this._moveLayerToBack(newActiveLayer);

        suggestedLayerId = newActiveLayerId;
        suggestedMiniMapContainer = this._getMiniMapContainer(suggestedLayerId);

        /*  var by = function(name) {
             return function(o, p) {
                 var a, b;
                 if (typeof o === "object" && typeof p === "object" && o && p) {
                     a = o[name];
                     b = p[name];
                     if (a === b) {
                         return 0;
                     }
                     if (typeof a === typeof b) {
                         return a < b ? -1 : 1;
                     }
                     return typeof a < typeof b ? -1 : 1;
                 } else {
                     throw ("error");
                 }
             }
         }
         this._layers.sort(by("id"));

         suggestedLayerId = this._layers[this._layers.length - 1].id;
         suggestedMiniMapContainer = this._getMiniMapContainer(suggestedLayerId); */



        this._suggestedLayerId = suggestedLayerId;
        this._activeLayerId = newActiveLayerId;

        this._forEachLayer(function (layerObj) {
            mapContainer = this._getMiniMapContainer(layerObj.id);

            L.DomUtil.removeClass(mapContainer, 'active-map');
            L.DomUtil.removeClass(mapContainer, 'suggested-map');
        });

        L.DomUtil.addClass(newActiveMiniMapContainer, 'active-map');
        L.DomUtil.addClass(suggestedMiniMapContainer, 'suggested-map');
        if (lastActiveLayer) {
            //this._map.removeLayer(lastActiveLayer.mainMapLayer);
        }

        //this._map.addLayer(newActiveLayer.mainMapLayer);
    },

    _moveLayerToBack: function (activeLayer) {
        var activeLayerId = activeLayer.id,
            layers = this._layers,
            layerCount = layers.length,
            i;

        for (i = 0; i < layerCount; i++) {
            if (layers[i].id === activeLayerId) {
                activeLayer = layers.splice(i, 1)[0];
                layers.push(activeLayer);
                break;
            }
        }
    },

    _animateMiniMaps: function (expand) {
        var mapsShown = 0,
            mapWidth = this.options.miniMapWidth,
            mapMargin = this.options.miniMapMargin,
            controlContainer = this._container,
            currentlyExpanded = L.DomUtil.hasClass(controlContainer, 'expanded'),
            mapContainer, layerId;

        if (currentlyExpanded === expand) {
            return;
        }

        this._forEachLayer(function (layerObj) {
            layerId = layerObj.id;
            mapContainer = this._getMiniMapContainer(layerId);

            // update the position on all the visible maps
            this._updateMiniMapPosition(layerId);

            if (expand) {
                mapContainer.style.right = (mapsShown * (mapWidth + mapMargin)) + 'px';
                mapsShown++;
            } else {
                mapContainer.style.right = '0';
            }
        });
        var that = this;
        if (expand) {
            controlContainer.style.width = (mapsShown * (mapWidth + mapMargin)) - mapMargin + 20 + 'px';
            var layerObjs = this._overlayers.filter(function (item) {
                return item.overMapLayer.code == that.currentcode;
            });

            controlContainer.style.height = (150 + layerObjs.length * 25) + 'px';
            L.DomUtil.addClass(controlContainer, 'expanded');
           // this._innersub.style.display = 'block';
            this._innerup.style.display = 'block';
        } else {

            controlContainer.style.width = '0';
            controlContainer.style.height = '150px';
           // this._innersub.style.display = 'none';
            this._innerup.style.display = 'none';
            L.DomUtil.removeClass(controlContainer, 'expanded');
        }
    },

    _getInitialMainMapLayerId: function () {
        var layer, initialLayerId;

        // set the current main map layer to the first layer that the map has
        this._forEachLayer(function (layerObj) {
            layer = layerObj.mainMapLayer;

            if (this._map.hasLayer(layer)) {
                initialLayerId = layerObj.id;
                return false;
            }
        });

        if (initialLayerId) {
            return initialLayerId;
        }

        // if the map didn't have any layers layers on it, just pick the first in the list
        this._forEachLayer(function (layerObj) {
            initialLayerId = layerObj.id;
            return false;
        });

        return initialLayerId;
    },

    _getInitialMiniMapLayerId: function (initialMapLayer) {
        var layerId, initialLayerId;

        this._forEachLayer(function (layerObj) {
            layerId = layerObj.id;
            if (layerId !== initialMapLayer) {
                initialLayerId = layerId;
                return false;
            }
        });

        return initialLayerId;
    },

    _forEachLayer: function (callback, disorder) {
        var layers = this._layers,
            layerCount = layers.length,
            layer, i;
        if (disorder) {
            for (i = layerCount - 1; i >= 0; i--) {
                layer = layers[i];
                if (callback.call(this, layer) === false) {
                    break;
                }
            }
        } else {
            for (i = 0; i < layerCount; i++) {
                layer = layers[i];

                if (callback.call(this, layer) === false) {
                    break;
                }
            }
        }

    },

    _getMiniMapContainer: function (layerId) {
        var miniMap = this._miniMaps[layerId];
        return miniMap.getContainer().parentNode.parentNode;
    },

    _updateMiniMaps: function () {
        var suggestedLayerId = this._suggestedLayerId,
            isExpanded = L.DomUtil.hasClass(this._container, 'expanded');

        if (isExpanded) {
            this._forEachLayer(function (layerObj) {
                this._updateMiniMapPosition(layerObj.id);
            }, this);
        } else {
            this._updateMiniMapPosition(suggestedLayerId);
        }
    },

    _updateMiniMapPosition: function (layerId) {
        var mainMap, center, zoom, miniMap;

        if (!this._mainMapReady || !this._hasMultipleLayers()) {
            return;
        }

        mainMap = this._map;
        center = mainMap.getCenter();

        zoom = mainMap.getZoom() + this.options.miniMapZoomOffset;
        if (zoom < mainMap.getMinZoom()) {
            zoom = mainMap.getMinZoom()
        }
        // update minimap position
        miniMap = this._miniMaps[layerId];
        miniMap.setView(center, zoom, {
            pan: {
                animate: false
            },
            zoom: {
                animate: true
            }
        });
    },

    _onMapReady: function () {
        this._mainMapReady = true;
    },

    _hasMultipleLayers: function () {
        return this._layers.length > 0;
    }
});



module.exports = MiniMapLayerSwitcher

