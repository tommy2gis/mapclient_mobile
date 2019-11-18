

import { connect } from 'react-redux';
import mapApp from '../components/mapApp.js';
import { changeMapView,mouseDownOnMap } from '../actions/map';
import {endDrawing} from '../actions/draw';
import { switchLayers }  from '../actions/layers';
export default connect((state) => {
  return {
    mapConfig: state.mapConfig,
    map: state.map || state.mapConfig && state.mapConfig.map,
    mapStateSource: state.map && state.map.mapStateSource,
    layers: state.layers,
    query: state.query,
    arealocation: state.arealocation,
    routing:state.routing,
    draw:state.draw,
    sidebar:state.sidebar,
    toolbar:state.toolbar
  };
}, {
  onMapViewChanges: changeMapView,
    onSwitchLayer: switchLayers,
    endDrawing,
    mouseDownOnMap
  })(mapApp);








