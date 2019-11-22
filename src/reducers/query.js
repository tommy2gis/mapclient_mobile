/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:31:12 
 * @Last Modified by: 史涛
 * @Last Modified time: 2019-11-22 16:47:57
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
    SELECT_TASK,
    QUERY_PATTENS_RESULT,
    SELECT_PATTEN,
    RESET_QUERY,
    GET_USERLOCATION,
    LOGIN
} = require('../actions/query');

const assign = require('object-assign');



const initialState = {
    featureTypes: {},
    data: {},
    pageindex: 1,
    page: 7,
    type: '',
    key: '',
    areakey:null,
    areatype:'',
    inputfocus: false,
    result: '',
    resultcollapsed: false,
    simpleresult: '',
    tasksresult:null,
    hoverid: null,
    curloc:null,
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

        case GET_USERLOCATION: {
            return assign({}, state, {
                curloc: action.loc,
                resultError: null
            });
        }

        case LOGIN: {
            return assign({}, state, {
                userinfo: action.userinfo,
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

        case SELECT_TASK:{
            return assign({}, state, {
                selecttask: action.task
            });
        }

        case QUERY_TASKS_RESULT:{
            return assign({}, state, {
                tasksresult: action.result
            });
        }

        case SELECT_PATTEN:{
            return assign({}, state, {
                selectpatten: action.task
            });
        }

        case QUERY_PATTENS_RESULT:{
            return assign({}, state, {
                pattensresult: action.result
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
