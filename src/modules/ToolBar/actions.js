/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:30:01 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:30:01 
 */
const ERRORPANEL_SHOW = 'ERRORPANEL_SHOW';
const ERRORLISTPANEL_SHOW='ERRORLISTPANEL_SHOW';
const ERRORQUERY_RESULT='ERRORQUERY_RESULT';
const ERRORHOVER_RESULTINDEX='ERRORHOVER_RESULTINDEX';
const ADD_ERROR = 'ADD_ERROR';
const RESET_ERRORQUERY='RESET_ERRORQUERY';
import { message } from 'antd';
const axios = require('axios');


function showErrorPanel(show) {

    return (dispatch) => {
        dispatch({
            type: ERRORPANEL_SHOW,
            show
        });  
    }
}

function showErrorListPanel(show) {

    return (dispatch) => {
        dispatch({
            type: ERRORLISTPANEL_SHOW,
            show
        });  
    }
}

function onErrorClick(hoverid) {
    return (dispatch) => {
        dispatch({
            type: ERRORHOVER_RESULTINDEX,
            hoverid
        });
    }

}


function addErrorResponse(errorinfo) {
    return {
        type: ADD_ERROR,
        errorinfo
    };
}

function queryErrorSearchResponse(result) {
    return {
        type: ERRORQUERY_RESULT,
        result
    };
}

function onErrorQuery(userid) {
    return (dispatch, getState) => {
        const toolbar=getState().toolbar;

        return axios.get(ServerUrl+"/gateway/map/errorInfor/findListByPage", {
            params: {
                page: 1,
                size: 100,
                userid: userid,
                type_id:'',
                name:''
            }
        }).then((response) => {
            dispatch(queryErrorSearchResponse(response.data.result));
        }).catch((e) => {
            message.warning('数据查询失败,请稍后再试');
            
        });
    };
}


function resetErrorQuery() {
    return {
        type: RESET_ERRORQUERY,
    }
}

function onAddError(params) {
    return (dispatch, getState) => {
        const toolbar = getState().toolbar;
        const draw=getState().draw;
        if (draw.drawOwner !=='error') {
            message.warning('未添加坐标点');
            return;
        }
        return axios.post(ServerUrl+"/gateway/map/errorInfor/addInfor", {
            "name": params.name,
            "userid": params.userid,
            "type_id": params.type_id,
            "describes": params.describes,
            "email": params.email,
            "phone": params.phone,
            "x":draw.geometry.center[1],
            "y":draw.geometry.center[0]}).then((response) => {
                if(response.data.code===1){
                    dispatch(showErrorPanel(false));
                    dispatch(addErrorResponse(response.data.msg));
                   
                    message.info('添加成功');
                }else{
                    message.warning('提交数据失败,请稍后再试');
                }
               
        }).catch((e) => {
            message.warning('提交数据失败,请稍后再试');
            //dispatch(queryError(e));
        });
    };
}


module.exports = {
    ERRORPANEL_SHOW,
    ERRORLISTPANEL_SHOW,
    RESET_ERRORQUERY,
    ERRORHOVER_RESULTINDEX,
    ERRORQUERY_RESULT,
    showErrorListPanel,
    showErrorPanel,
    onErrorQuery,
    resetErrorQuery,
    onErrorClick,
    ADD_ERROR,
    onAddError
};