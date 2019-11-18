/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:33:32 
 * @Last Modified by: 史涛
 * @Last Modified time: 2019-01-10 17:23:49
 */

const FEATURE_TYPE_LOADED = 'FEATURE_TYPE_LOADED';
const FEATURE_LOADED = 'FEATURE_LOADED';
const FEATURE_TYPE_ERROR = 'FEATURE_TYPE_ERROR';
const FEATURE_ERROR = 'FEATURE_ERROR';
const QUERY_RESULT = 'QUERY_RESULT';
const QUERY_ERROR = 'QUERY_ERROR';
const QUERY_ONFOCUS = 'QUERY_ONFOCUS';
const RESET_QUERY = 'RESET_QUERY';
const CHANGE_QUERYPAGEINDEX = 'CHANGE_QUERYPAGEINDEX';
const HOVER_RESULTINDEX = 'HOVER_RESULTINDEX';
const CHANGE_QUERYKEY = 'CHANGE_QUERYKEY';
const CHANGE_QUERYAREAKEY = 'CHANGE_QUERYAREAKEY';
const QUERY_SIMPLERESULT = 'QUERY_SIMPLERESULT';
const COLLAPSE_RESULT = 'COLLAPSE_RESULT';
const axios = require('axios');
import { message } from 'antd';
var CancelToken = axios.CancelToken;
var cancel;




function featureTypeLoaded(typeName, featureType) {
    return {
        type: FEATURE_TYPE_LOADED,
        typeName,
        featureType
    };
}

function featureTypeError(typeName, error) {
    return {
        type: FEATURE_TYPE_ERROR,
        typeName,
        error
    };
}

function featureLoaded(typeName, feature) {
    return {
        type: FEATURE_LOADED,
        typeName,
        feature
    };
}

function featureError(typeName, error) {
    return {
        type: FEATURE_ERROR,
        typeName,
        error
    };
}

function querySearchResponse(result) {
    return {
        type: QUERY_RESULT,
        result
    };
}

function simpleQuerySearchResponse(simpleresult) {
    return {
        type: QUERY_SIMPLERESULT,
        simpleresult
    };
}


function changeQueryPageIndex(pageindex) {
    return (dispatch,getState) => {
        const query = getState().query;
        dispatch({
            type: CHANGE_QUERYPAGEINDEX,
            pageindex
        });
        if(query.type==='name'){
            dispatch(query());
        }else{
            dispatch(onHotQuery());
        }
       
    }

}

function onHoverResult(hoverid) {
    return (dispatch) => {
        dispatch({
            type: HOVER_RESULTINDEX,
            hoverid
        });
    }

}


function queryError(error) {
    return {
        type: QUERY_ERROR,
        error
    };
}

function describeFeatureType(baseUrl, typeName) {
    return (dispatch) => {
        return axios.get(baseUrl + '?service=WFS&version=1.1.0&request=DescribeFeatureType&typeName=' + typeName + '&outputFormat=application/json').then((response) => {
            if (typeof response.data === 'object') {
                dispatch(featureTypeLoaded(typeName, response.data));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(featureTypeError(typeName, 'Error from WFS: ' + e.message));
                }

            }

        }).catch((e) => {
            dispatch(featureTypeError(typeName, e));
        });
    };
}

function loadFeature(baseUrl, typeName) {
    return (dispatch) => {
        return axios.get(baseUrl + '?service=WFS&version=1.1.0&request=GetFeature&typeName=' + typeName + '&outputFormat=application/json').then((response) => {
            if (typeof response.data === 'object') {
                dispatch(featureLoaded(typeName, response.data));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(featureError(typeName, 'Error from WFS: ' + e.message));
                }

            }

        }).catch((e) => {
            dispatch(featureError(typeName, e));
        });
    };
}

function query(key) {

    return (dispatch, getState) => {
        const query = getState().query;
        const mapConfig = getState().mapConfig;
        if (cancel != undefined) {
            cancel();
        }
        return axios.get(mapConfig.solrurl, {
            cancelToken: new CancelToken(function executor(c) {
                cancel = c;
            }),
            params: {
                q: 'name:' + (key || query.key),
                indent: 'on',
                df: 'text',
                wt: 'json',
                start: (query.pageindex) * query.page,
                rows: query.page
            }
        }).then((response) => {
            dispatch(querySearchResponse(response.data.response));
        }).catch((e) => {
            message.warning('数据查询失败,请稍后再试');
            dispatch(queryError(e));
        });
    };
}



function onHotQuery(leve, type, model) {
    return (dispatch, getState) => {
        const query = getState().query;
        const mapConfig = getState().mapConfig;
        if (cancel != undefined) {
            cancel();
        }
        let params = {
            q: (leve||query.type) + ':' + (type||query.key),
            indent: 'on',
            df: 'text',
            wt: 'json',
            start: (query.pageindex) * query.page,
            rows: query.page
        };
        if (model === 'fq') {
            params.fq = leve + ':' + type;
            if(!type){
              delete params.fq;
            }
            
            params.q = query.type + ':' + query.key
        }


        return axios.get(mapConfig.solrurl, {
            cancelToken: new CancelToken(function executor(c) {
                cancel = c;
            }),
            params: params
        }).then((response) => {
            dispatch(querySearchResponse(response.data.response));
        }).catch((e) => {
            message.warning('数据查询失败,请稍后再试');
            dispatch(queryError(e));
        });
    };
}

function simpleQuery(key) {

    return (dispatch, getState) => {
        if(key.trim()===''){
            dispatch(simpleQuerySearchResponse([]));
            return;
        }
        const mapConfig = getState().mapConfig;
        if (cancel != undefined) {
            //取消上一次请求
            cancel();
        }
        return axios.get(mapConfig.solrurl, {
            cancelToken: new CancelToken(function executor(c) {
                cancel = c;
            }),
            params: {
                indent: 'on',
                q: 'name:' + key,
                df: 'text',
                wt: 'json',
                start: 0,
                rows: 6
            }
        }).then((response) => {
            dispatch(simpleQuerySearchResponse(response.data.response.docs));
        }).catch((e) => {
            dispatch(queryError(e));
        });
    };
}

function resetQuery() {
    return (dispatch) => {
        dispatch({
            type: RESET_QUERY,
        });
        dispatch(collapseResult(false))
    }
}
function collapseResult(collapse) {

    return {
        type: COLLAPSE_RESULT,
        collapse
    }

}
function changeQueryKey(key, querytype) {
    return {
        type: CHANGE_QUERYKEY,
        key,
        querytype
    }
}

function changeQueryAreaKey(key, querytype) {
    return {
        type: CHANGE_QUERYAREAKEY,
        key,
        querytype
    }
}

function queryOnFocus(inputfocus) {

    return (dispatch, getState) => {
        const query = getState().query;
        dispatch({
            type: QUERY_ONFOCUS,
            inputfocus
        });
 

    }


}

module.exports = {
    FEATURE_TYPE_LOADED,
    FEATURE_LOADED,
    FEATURE_TYPE_ERROR,
    FEATURE_ERROR,
    changeQueryPageIndex,
    CHANGE_QUERYPAGEINDEX,
    QUERY_RESULT,
    QUERY_ERROR,
    changeQueryKey,
    CHANGE_QUERYKEY,
    CHANGE_QUERYAREAKEY,
    changeQueryAreaKey,
    QUERY_ONFOCUS,
    RESET_QUERY,
    collapseResult,
    COLLAPSE_RESULT,
    onHoverResult,
    onHotQuery,
    simpleQuery,
    QUERY_SIMPLERESULT,
    HOVER_RESULTINDEX,
    describeFeatureType,
    loadFeature,
    queryOnFocus,
    query,
    resetQuery
};
