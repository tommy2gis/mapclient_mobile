/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:30:28 
 * @Last Modified by: 史涛
 * @Last Modified time: 2019-01-10 17:19:27
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { changeZoomLevel } from '../../actions/map';
import { changeDrawingStatus } from '../../actions/draw';
import SyncCompare from './synccompare';
import ScreemCompare from './screemcompare';
import { Card, Menu, Modal, Icon, Dropdown,message, Popover, Divider } from 'antd';
import ConfigUtils from '../../utils/ConfigUtils';
import './toolbar.css'

import * as screenfull from 'screenfull';



class ToolBar extends Component {
    static propTypes = {
        step: PropTypes.number,
        mapStateSource: PropTypes.string,
        currentZoom: PropTypes.number,
        changeZoomLevel: PropTypes.func,
        map: PropTypes.object,
        mapConfig: PropTypes.object,
    };

    static defaultProps = {
        step: 1,
        currentZoom: 3,
        changeZoomLevel: () => { },
    };

    state = {
        juanModalVisible: false,
        screemModalVisible: false,
        isFullscreen: false,
        mesurevisable: false,
    }

    setJuanModalVisible(juanModalVisible) {
        this.setState({ juanModalVisible });
    }

    setScreemModalVisible(screemModalVisible) {
        this.setState({ screemModalVisible });
    }

    setMeasureVisible(mesurevisable) {
        this.setState({ mesurevisable });
    }

    onVisibleChange = (e) => {
        this.setMeasureVisible(false);
    }

    handleScreenfull = () => {
        if (ConfigUtils.getBrowserProperties().ie) {
            message.info('ie模式下请使用键盘的F11键');
            return;
        }
        if (screenfull.enabled) {
            if (this.state.isFullscreen) {
                screenfull.exit();
            } else {
                screenfull.request();
                this.setState({ isFullscreen: true })
            }
        }
    }

    handleStartDraw = () => {
        const userid = window.sessionStorage.getItem('userid');
        if(!userid){
           message.info('请登录后使用纠错功能');
           return;
        }
        this.props.changeDrawingStatus('start', 'Point', "error", [], {}, {
            iconGlyph: 'jiucuoguanli',
            iconColor: 'cyan',
            iconPrefix: 'icon'
        });
    }


    render() {

        const menu = (
            <Menu className="toolbar_mapcompare_list">
                <Menu.Item>
                    <a onClick={() => this.setJuanModalVisible(true)} ><i className="iconfont icon-juanlianduibi"></i>卷帘对比</a>

                </Menu.Item>
                <Menu.Item>
                    <a onClick={() => this.setScreemModalVisible(true)} ><i className="iconfont icon-fenpingduibi"></i>分屏对比</a>

                </Menu.Item>

            </Menu>
        );

        const measuremenu = (
            <Menu className={this.state.mesurevisable ? "toolbar_measure_list" : "toolbar_measure_list ant-dropdown-hidden"}  >
                <Menu.Item>
                    <a id="toolbar_measure_dis" ></a>

                </Menu.Item>
                <Menu.Item>
                    <a id="toolbar_measure_area"></a>

                </Menu.Item>

            </Menu>
        );
        return (
            <div style={{}}>


                <Card className="toolbar_card" id="toolbar_card" bordered={false} >
                   
                    <Dropdown overlay={measuremenu} visible={true} onVisibleChange={this.onVisibleChange} getPopupContainer={() => document.getElementById('toolbar_card')}>
                        <button type="button" className="ant-btn toolbar_btn" onMouseMove={() => this.setMeasureVisible(true)} ><i className="iconfont icon-duibi"></i><span>测量</span><Icon type="down" /></button>
                    </Dropdown>
                    <Divider type="vertical" />

                   
                    <button type="button" className="ant-btn toolbar_btn" onClick={this.handleScreenfull}><i className="iconfont icon-quanping"></i><span>全屏</span></button>


                </Card>

                <Modal
                    title="卷帘对比"
                    style={{ top: 20, height: 'calc(100vh - 20px)' }}
                    visible={this.state.juanModalVisible}
                    onOk={() => this.setJuanModalVisible(false)}
                    onCancel={() => this.setJuanModalVisible(false)}
                    width="90%"
                    zIndex={2001}
                    footer={null}
                    wrapClassName="toolbar_comparemodal"
                >
                    <ScreemCompare map={this.props.map} mapConfig={this.props.mapConfig}></ScreemCompare>
                </Modal>
                <Modal
                    title="分屏对比"
                    style={{ top: 20, height: 'calc(100vh - 20px)' }}
                    visible={this.state.screemModalVisible}
                    onOk={() => this.setScreemModalVisible(false)}
                    onCancel={() => this.setScreemModalVisible(false)}
                    width="90%"
                    zIndex={2001}
                    footer={null}
                    wrapClassName="toolbar_comparemodal"
                >
                    <SyncCompare map={this.props.map} mapConfig={this.props.mapConfig}></SyncCompare>
                </Modal>

            </div>
        );
    }
}

export default connect((state) => {
    return { map: state.map || state.mapConfig && state.mapConfig.map, }
}, { changeZoomLevel, changeDrawingStatus })(ToolBar);