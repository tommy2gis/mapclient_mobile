/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:30:06 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:30:06 
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Table, Input, Divider, Drawer } from 'antd';
import { showErrorListPanel, onErrorClick, resetErrorQuery } from '../ToolBar/actions';
import './errorpanel.less';
var assign = require('object-assign');

const columns = [{
    title: '名称',
    dataIndex: 'name',
    key: 'name'
}, {
    title: '类型',
    dataIndex: 'typename',
    key: 'typename',
}, {
    title: '详细描述',
    dataIndex: 'describes',
    key: 'describes',
}];



export class ErrorList extends Component {

    onClose = () => {
        this.props.showErrorListPanel(false);
        this.props.resetErrorQuery();
    };
    onClick = (id) => {
        this.props.onErrorClick(id);
    };

    render() {


        return (
            <div className="errorlist">
                <Drawer
                    mask={false}
                    title="我的纠错列表"
                    placement="right"
                    width={500}
                    style={{
                        height: 'calc(100% - 55px)',
                        overflow: 'auto',
                        padding: 0
                    }}
                    zIndex={2000}
                    onClose={this.onClose}
                    visible={this.props.toolbar.errorlistpanelshow}
                >
                    {/* <Input.Search
                        placeholder="输入名称"
                        onSearch={value => console.log(value)}
                        style={{
                            width: 200,
                            margin: '10px',
                            float: 'right',
                            zIndex:1
                        }}
                    /> */}
                    <Table columns={columns} onRow={(record) => {
                        return {
                            onClick: () => {
                                this.onClick(record.id)
                            },       // click row
                            onMouseEnter: () => { },  // mouse enter row
                        };
                    }}
                        rowKey='id'
                        dataSource={this.props.toolbar.errorlist && this.props.toolbar.errorlist.list} />
                </Drawer>
            </div>
        )
    }
}



export default connect((state) => {
    return { toolbar: state.toolbar }
}, { showErrorListPanel, onErrorClick, resetErrorQuery })(ErrorList);
