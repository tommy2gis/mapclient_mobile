import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, HashRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux';
import App from './components/mobiles/App';
import Tasks from './components/mobiles/Tasks';
import store from './store/configureStore';
import './index_mobile.less';

var loadMapConfig = require('./actions/config').loadMapConfig;
store.dispatch(loadMapConfig('config.json', false));



ReactDOM.render(
    <Provider store={store}>
        <HashRouter>
                <div>
                    <Switch>
                        <Route exact path="/" component={App} />
                        <Route path="/tasks" component={Tasks} />
                    </Switch>
                </div>
        </HashRouter>
</Provider>
, document.getElementById('app'));