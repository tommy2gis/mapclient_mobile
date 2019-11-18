import L from 'leaflet';
let SwipeControl = L.Control.extend({
    options: {
        thumbSize: 42,
        padding: 0
    },
    dragging: false,
    mouselocation: '',
    initialize: function(leftLayers, rightLayers, options) {
        this.setLeftLayers(leftLayers)
        this.setRightLayers(rightLayers)
        L.setOptions(this, options)
    },

    includes: L.Events,

    addTo: function(map) {
        this.remove();
        this._map = map;
        var that = this;

        this._container = L.DomUtil.create('div', 'swipe', this._map.getContainer().parentElement);
        this._container.id = 'swipe1';
        var swiperigth = L.DomUtil.create('div', 'swiperigth', this._container);
        var swipeleft = L.DomUtil.create('div', 'swipeleft', this._container);
        var swipetop = L.DomUtil.create('div', 'swipetop', this._container);
        var swipebottom = L.DomUtil.create('div', 'swipebottom', this._container);

        swipetop.onmousemove = function() {
            if (that.dragging)
                return;
            that._container.style.cursor = 's-resize';
            that.mouselocation = 'top';
        };
        swipebottom.onmousemove = function() {
            if (that.dragging)
                return;
            that._container.style.cursor = 's-resize';
            that.mouselocation = 'bottom';
        };
        swiperigth.onmousemove = function() {
            if (that.dragging)
                return;
            that._container.style.cursor = 'w-resize';
            that.mouselocation = 'right';
        };
        swipeleft.onmousemove = function() {
            if (that.dragging)
                return;
            that._container.style.cursor = 'e-resize';
            that.mouselocation = 'left';
        };


        this._container.onmousedown = function() {
            that.dragging = true;
            return false;
        };

        document.onmouseup = function() {
            that.dragging = false;
            that.setDivide(0);
        };
        document.onmousemove = function(e) {
            if (!that.dragging)
                return;

            switch (that.mouselocation) {
                case 'top':
                    that.setTopDivide(e.screenY);
                    break;
                case 'left':
                    that.setDivide(e.screenX);
                    break;
                case 'bottom':
                    that.setBotttomDivide(e.screenY);
                    break;
                case 'right':
                    that.setRightDivide(e.screenX);
                    break;
                default:
                    break;
            };


        };

        //  this._addEvents()
        this._updateLayers()

        this.setDivide(0);
        return this
    },

    remove: function() {
        if (!this._map) {
            return this
        }
        /*         if (this._leftLayer) {
                    this._leftLayer.getContainer().style.clip = ""
                }
                if (this._rightLayer) {
                    this._rightLayer.getContainer().style.clip = ""
                } */
        L.DomUtil.remove(this._container)

        this._map = null

        return this
    },

    asArray: function(arg) {
        return (arg === 'undefined') ? [] : Array.isArray(arg) ? arg : [arg]
    },

    setLeftLayers: function(leftLayers) {
        this._leftLayers = this.asArray(leftLayers)
        this._updateLayers()
        return this
    },

    setRightLayers: function(rightLayers) {
        this._rightLayers = this.asArray(rightLayers)
        this._updateLayers()
        return this
    },

    setDivide: function(x) {
        //  var l_parent = this.getLayer(this._map._layers)._container;
        var nw = this._map.containerPointToLayerPoint([0, 0]),
            se = this._map.containerPointToLayerPoint(this._map.getSize()),
            layerX = this._map.containerPointToLayerPoint(x, 0).x-100;
        if (this._leftLayer instanceof L.LayerGroup) {
            this._leftLayer.eachLayer(function(layer) {
                layer.getContainer().style.clip = 'rect(' + [nw.y, layerX, se.y, nw.x].join('px,') + 'px)';
            })
        } else {
            this._leftLayer.getContainer().style.clip = 'rect(' + [nw.y, layerX, se.y, nw.x].join('px,') + 'px)';
        }

    },

    setRightDivide: function(x) {
        // var l_parent = this.getLayer(this._map._layers)._container;
        var nw = this._map.containerPointToLayerPoint([0, 0]),
            se = this._map.containerPointToLayerPoint(this._map.getSize()),
            layerX = this._map.containerPointToLayerPoint(x, 0).x-100;

        if (this._leftLayer instanceof L.LayerGroup) {
            this._leftLayer.eachLayer(function(layer) {
                layer.getContainer().style.clip = 'rect(' + [nw.y, se.x, se.y, layerX].join('px,') + 'px)';
            })
        } else {
            this._leftLayer.getContainer().style.clip = 'rect(' + [nw.y, se.x, se.y, layerX].join('px,') + 'px)';
        }
    },

    setTopDivide: function(ypoint) {
        // var l_parent = this.getLayer(this._map._layers)._container;
        var nw = this._map.containerPointToLayerPoint([0, 0]),
            se = this._map.containerPointToLayerPoint(this._map.getSize()),
            layerY = this._map.containerPointToLayerPoint(L.point(0, ypoint)).y - 180;

        if (this._leftLayer instanceof L.LayerGroup) {
            this._leftLayer.eachLayer(function(layer) {
                layer.getContainer().style.clip = 'rect(' + [nw.y, se.x, layerY, nw.x].join('px,') + 'px)';
            })
        } else {
            this._leftLayer.getContainer().style.clip = 'rect(' + [nw.y, se.x, layerY, nw.x].join('px,') + 'px)';
        }
        // l_parent.style.clip = 'rect(' + [nw.y, se.x, layerY, nw.x].join('px,') + 'px)';
    },

    setBotttomDivide: function(ypoint) {
        //  var l_parent = this.getLayer(this._map._layers)._container;
        var nw = this._map.containerPointToLayerPoint([0, 0]),
            se = this._map.containerPointToLayerPoint(this._map.getSize()),
            layerY = this._map.containerPointToLayerPoint(L.point(0, ypoint)).y - 180;
        if (this._leftLayer instanceof L.LayerGroup) {
            this._leftLayer.eachLayer(function(layer) {
                layer.getContainer().style.clip = 'rect(' + [layerY, se.x, se.y, nw.x].join('px,') + 'px)';
            })
        } else {
            this._leftLayer.getContainer().style.clip = 'rect(' + [layerY, se.x, se.y, nw.x].join('px,') + 'px)';
        }

    },


    _updateLayers: function() {
        if (!this._map) {
            return this
        }
        var prevLeft = this._leftLayer
        var prevRight = this._rightLayer
        this._leftLayer = this._rightLayer = null
        this._leftLayers.forEach(function(layer) {
            if (this._map.hasLayer(layer)) {
                this._leftLayer = layer
            }
        }, this)
        this._rightLayers.forEach(function(layer) {
            if (this._map.hasLayer(layer)) {
                this._rightLayer = layer
            }
        }, this)
        if (prevLeft !== this._leftLayer) {
            prevLeft && this.fire('leftlayerremove', { layer: prevLeft })
           // this._leftLayer && this.fire('leftlayeradd', { layer: this._leftLayer })
        }
        if (prevRight !== this._rightLayer) {
            prevRight && this.fire('rightlayerremove', { layer: prevRight })
           // this._rightLayer && this.fire('rightlayeradd', { layer: this._rightLayer })
        }
    },

})

module.exports =SwipeControl