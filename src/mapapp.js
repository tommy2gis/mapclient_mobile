/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:32:33 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:32:33 
 */

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MapContainer from './containers/mapContainer';
import store from './store/configureStore';



var loadMapConfig = require('./actions/config').loadMapConfig;
store.dispatch(loadMapConfig('config.json', false));




class App extends React.Component {
    render() { // Every react component has a render method.
        return ( // Every render method returns jsx. Jsx looks like HTML, but it's actually javascript and functions a lot like xml, with self closing tags requiring the `/` within the tag in order to work propperly
            <Provider store={store} >
                <MapContainer />
            </Provider>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));

if (module.hot)
    module.hot.accept();