/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:31:12 
 * @Last Modified by: 史涛
 * @Last Modified time: 2019-11-18 17:35:19
 */

const {
    CHANGE_QUERYPAGEINDEX,
    QUERY_RESULT,
    COLLAPSE_RESULT,
    HOVER_RESULTINDEX,
    QUERY_ERROR,
    QUERY_ONFOCUS,
    CHANGE_QUERYKEY,
    CHANGE_QUERYAREAKEY,
    QUERY_TASKS_RESULT,
    QUERY_SIMPLERESULT,
    RESET_QUERY
} = require('../actions/query');

const assign = require('object-assign');



const initialState = {
    featureTypes: {},
    data: {},
    pageindex: 1,
    page: 4,
    type: '',
    key: '',
    areakey:null,
    areatype:'',
    inputfocus: false,
    result: '',
    resultcollapsed: false,
    simpleresult: '',
    hoverid: null,
    selectedid: null,
    resultError: null
};

function query(state = initialState, action) {
    switch (action.type) {
        case QUERY_RESULT: {
            return assign({}, state, {
                result: action.result,
                resultError: null
            });
        }

        case COLLAPSE_RESULT: {
            return assign({}, state, {
                resultcollapsed: action.collapse
            });
        }


        case QUERY_ERROR: {
            return assign({}, state, {
                result: '',
                resultError: action.error
            });
        }
        case RESET_QUERY: {
            return assign({}, state, {
                result: '',
                key: '',
                resultError: null
            });
        }
        case QUERY_SIMPLERESULT: {
            return assign({}, state, {
                simpleresult: action.simpleresult
            });
        }

        case QUERY_TASKS_RESULT:{
            return assign({}, state, {
                tasksresult: action.result
            });
        }


        case QUERY_ONFOCUS: {
            return assign({}, state, {
                inputfocus: action.inputfocus,
            });
        }

        case CHANGE_QUERYPAGEINDEX: {
            return assign({}, state, {
                pageindex: action.pageindex,
            });
        }
        case HOVER_RESULTINDEX: {
            return assign({}, state, {
                hoverid: action.hoverid,
            });
        }
        case CHANGE_QUERYKEY: {
            return assign({}, state, {
                key: action.key,
                type: action.querytype
            });
        }
        case CHANGE_QUERYAREAKEY: {
            return assign({}, state, {
                areakey: action.key,
                areatype: action.querytype
            });
        }
        


        default:
            return state;
    }
}

module.exports = query;
