/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:33:55 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:33:55 
 */
const PropTypes = require('prop-types');
var React = require('react');
var Layers = require('../../utils/map/LayersUtils');
var assign = require('object-assign');
var {isEqual} = require('lodash');

class LeafletLayer extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        type: PropTypes.string,
        srs: PropTypes.string,
        options: PropTypes.object,
        position: PropTypes.number,
        zoomOffset: PropTypes.number,
        onCreationError: PropTypes.func,
        onClick: PropTypes.func
    };

    static defaultProps = {
        onCreationError: () => {}
    };

    componentDidMount() {
        this.valid = true;
        this.createLayer(this.props.type, this.props.options, this.props.position, this.props.securityToken);
        if (this.props.options && this.layer && this.props.options.visibility !== false) {
            this.addLayer();
            this.updateZIndex();
        }
    }

    componentWillReceiveProps(newProps) {
        const newVisibility = newProps.options && newProps.options.visibility !== false;
        this.setLayerVisibility(newVisibility);

        const newOpacity = newProps.options && newProps.options.opacity !== undefined ? newProps.options.opacity : 1.0;
        this.setLayerOpacity(newOpacity);

        const newdefs = newProps.options && newProps.options.layerDefs;
        this.setLayerDefs(newdefs);

        const newids = newProps.options && newProps.options.layers;
        this.setLayers(newids);

        if (newProps.position !== this.props.position) {
            this.updateZIndex(newProps.position);
        }
        this.updateLayer(newProps, this.props);
    }

    shouldComponentUpdate(newProps) {
        // the reduce returns true when a prop is changed
        // optimizing when options are equal ignorning loading key
        return !["map", "type", "srs", "position", "layerDefs","layers","zoomOffset", "onClick", "options", "children"].reduce( (prev, p) => {
            switch (p) {
            case "map":
            case "type":
            case "srs":
            case "layerDefs":
            case "layers":
            case "position":
            case "zoomOffset":
            case "onClick":
            case "children":
                return prev && this.props[p] === newProps[p];
            case "options":
                return prev && (this.props[p] === newProps[p] || isEqual({...this.props[p], loading: false}, {...newProps[p], loading: false}));
            default:
                return prev;
            }
        }, true);
    }

    componentWillUnmount() {
        if (this.layer && this.props.map) {
            this.removeLayer();
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }
        }
    }

    render() {
        if (this.props.children) {
            const layer = this.layer;
            const children = layer ? React.Children.map(this.props.children, child => {
                return child ? React.cloneElement(child, {container: layer, styleName: this.props.options && this.props.options.styleName, onClick: this.props.onClick,
                options: this.props.options || {}}) : null;
            }) : null;
            return (
                <noscript>
                    {children}
                </noscript>
            );
        }
        return Layers.renderLayer(this.props.type, this.props.options, this.props.map, this.props.map.id, this.layer);

    }

    setLayerVisibility = (visibility) => {
        var oldVisibility = this.props.options && this.props.options.visibility !== false;
        if (visibility) {
            this.addLayer();
        } else {
            this.removeLayer();
        }
        this.updateZIndex();
    };

    setLayerOpacity = (opacity) => {
        var oldOpacity = this.props.options && this.props.options.opacity !== undefined ? this.props.options.opacity : 1.0;
        if (opacity !== oldOpacity && this.layer && this.layer.setOpacity) {
            this.layer.setOpacity(opacity);
        }
    };

    setLayerDefs = (defs) => {
        var oldLayerDefs= this.props.options && this.props.options.layerDefs;
        if (defs !== oldLayerDefs && this.layer&& this.layer.setLayerDefs) {
            this.layer.setLayerDefs(defs);
            this.props.map.closePopup();
        }
    };

    setLayers= (ids) => {
        var oldids= this.props.options && this.props.options.layers;
        if (ids !== oldids && this.layer&& this.layer.setLayers) {
            this.layer.setLayers(ids);
            this.props.map.closePopup();
        }
    };

    generateOpts = (options, position, securityToken) => {
        return assign({}, options, position ? {zIndex: position, srs: this.props.srs } : null, {
            zoomOffset: -this.props.zoomOffset,
            onError: () => {
                this.props.onCreationError(options);
            },
            securityToken
        });
    };

    updateZIndex = (position) => {
        let newPosition = position || this.props.position;
        if (newPosition && this.layer && this.layer.setZIndex) {
            this.layer.setZIndex(newPosition);
        }
    };

    createLayer = (type, options, position, securityToken) => {
        if (type) {
            const opts = this.generateOpts(options, position, securityToken);
            this.layer = Layers.createLayer(type, opts);
            if (this.layer) {
                this.layer.layerName = options.name;
                this.layer.layerId = options.id;
            }
            /*if (!this.layer && options.group === "background") {
                this.props.onCreationError(options);
            }*/
            this.forceUpdate();
        }
    };

    updateLayer = (newProps, oldProps) => {
        const newLayer = Layers.updateLayer(newProps.type, this.layer, this.generateOpts(newProps.options, newProps.position, newProps.securityToken),
            this.generateOpts(oldProps.options, oldProps.position, oldProps.securityToken));
        if (newLayer) {
            this.removeLayer();
            this.layer = newLayer;
            this.addLayer();
        }
    };

    addLayer = () => {
        if (this.isValid()) {
            this.props.map.addLayer(this.layer);
            if (this.props.options.refresh && this.layer.setParams) {
                let counter = 0;
                this.refreshTimer = setInterval(() => {
                    this.layer.setParams(assign({}, this.props.options.params, {_refreshCounter: counter++}));
                }, this.props.options.refresh);
            }

            if(this.layer.layerName==='无锡城管网格'&&this.layer.options.layers>0){
                this.layer.bindPopup(
                    function(err, featureCollection, response){
                        var length=featureCollection.features.length;
                        if(err || length === 0) {
                            return false;
                          } else {
                              var  fea=featureCollection.features[length-1];
                              if(fea.layerId==0){
                                return '名称: ' + fea.properties['名称']+'<br>'
                                +'编码: ' + fea.properties['编码']+'<br>'
                                +'类别: ' + fea.properties['类别']+'<br>'
                                +'公路等级: ' + fea.properties['公路等级'];
                              
                              }else{
                                return '名称: ' + fea.properties['名称']+'<br>'
                                +'编码: ' + fea.properties['编码']+'<br>'
                                +'网格类型: ' + fea.properties['网格类型']+'<br>'
                                +'是否多网格: ' + fea.properties['是否多网格']+'<br>'
                                +'流水号: ' + fea.properties['流水号']+'<br>'
                                +'责任人: ' + fea.properties['责任人']+'<br>'
                                +'联系电话: ' + fea.properties['联系电话']+'<br>'
                                +'区划街道: ' + fea.properties['区划']+ fea.properties['街道'];
                              
                              }
                            }
                  });
            }
            if(this.layer.layerName==='无锡城管POI'&&this.layer.options.layers>0){
                this.layer.bindPopup(
                    function(err, featureCollection, response){
                        var length=featureCollection.features.length;
                        if(err || length === 0) {
                            return false;
                          } else {
                              var  fea=featureCollection.features[length-1];
                              return '名称: ' + fea.properties['名称']+'<br>'
                              +'编码: ' + (fea.properties['管理分类编码']||fea.properties['OBJECTID_1'])+'<br>'
                              +'地址: ' + fea.properties['地址']+'<br>';
                            }
                  });
            }
        }
    };

    removeLayer = () => {
        if (this.isValid()) {
            this.props.map.removeLayer(this.layer);
        }
    };

    isValid = () => {
        if (this.layer) {
            const valid = Layers.isValid(this.props.type, this.layer);
            this.valid = valid;
            return valid;
        }
        return false;
    };
}

module.exports = LeafletLayer;