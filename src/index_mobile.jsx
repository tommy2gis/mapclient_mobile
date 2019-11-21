import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, HashRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux';
import App from './components/mobiles/App';
import TaskList from './components/mobiles/TaskList';
import TaskCollect from './components/mobiles/TaskCollect';
//import HistoryPatterns from './components/mobiles/HistoryPatterns';
import HistoryPatterns from './components/mobiles/HistoryPatterns';
import DataCollect from './components/mobiles/DataCollect';
import login from './components/mobiles/login';
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
                        <Route path="/tasks" component={TaskList} />
                        <Route path="/taskcollect" component={TaskCollect} />
                        <Route path="/history" component={HistoryPatterns} />
                        <Route path="/datacollect" component={DataCollect} />
                        <Route path="/login" component={login} />
                        
                    </Switch>
                </div>
        </HashRouter>
</Provider>
, document.getElementById('app'));