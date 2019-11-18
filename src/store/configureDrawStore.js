/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:31:18 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:31:18 
 */
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createLogger } from 'redux-logger'
import mapConfig from '../reducers/config';
import map from '../reducers/map';
import query from '../reducers/query';
import layers from '../reducers/layers';
import draw from '../reducers/draw'
import toolbar from '../modules/ToolBar/reducers';
import drawapp from "../modules/DrawApp/reducers";

import { routerReducer } from 'react-router-redux';

import {default as thunkMiddleware } from 'redux-thunk';

const loggerMiddleware = createLogger(); // logger 初始化
const createStoreWithMiddleware = applyMiddleware(thunkMiddleware,loggerMiddleware)(createStore); // thunk和logger整合
const reducers = combineReducers({
  routerReducer,mapConfig,map,query,layers,draw,toolbar,drawapp
  });

// export the store with the given reducers (and middleware applied)
module.exports = createStoreWithMiddleware(reducers, {});