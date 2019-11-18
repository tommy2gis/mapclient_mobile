/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:30:14 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:30:14 
 */

const {
    ERRORPANEL_SHOW,
    ERRORLISTPANEL_SHOW,
    ERRORQUERY_RESULT,
    ERRORHOVER_RESULTINDEX,
    RESET_ERRORQUERY,
    ADD_ERROR

} = require('./actions');

const assign = require('object-assign');


const initialState = {
    errorpanelshow: false,
    errorlistpanelshow:false,
    errorlist:null,
    errorinfo:null,
    errorhoverid:null,
};

function toolbar(state = initialState, action) {
    switch (action.type) {

        case ERRORPANEL_SHOW: {
            return assign({}, state, {
                errorpanelshow: action.show
            });
        }

        case ADD_ERROR: {
            return assign({}, state, {
                errorinfo: action.errorinfo
            });
        }
        case ERRORLISTPANEL_SHOW: {
            return assign({}, state, {
                errorlistpanelshow: action.show
            });
        }
        case ERRORQUERY_RESULT: {
            return assign({}, state, {
                errorlist: action.result
            });
        }
        case ERRORHOVER_RESULTINDEX:{
            return assign({}, state, {
                errorhoverid: action.hoverid,
            });
        }
        case RESET_ERRORQUERY: {
            return assign({}, state, {
                errorlist: null
            });
        }
        
        

        default:
            return state;
    }
}

module.exports = toolbar;
