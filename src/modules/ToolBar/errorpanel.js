/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:30:10 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:30:10 
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Form, Input, Radio, Select, Button, Modal } from 'antd';
import { showErrorPanel, onAddError } from '../ToolBar/actions';
import { drawSupportReset } from '../../actions/draw';
import './errorpanel.less';
var assign = require('object-assign');
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { TextArea } = Input;

export class ErrorPanel extends Component {

    onClose = () => {
        this.props.showErrorPanel(false);
        this.props.drawSupportReset();
    };

    handleSubmit = (e) => {
        e.preventDefault();
        const userid = window.sessionStorage.getItem('userid');
        if (!userid) {
            return;
        }
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.userid = userid;
                this.props.onAddError(values)
            } else {

            }
        });
    }


    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 20,
                    offset: 10,
                },
                sm: {
                    span: 10,
                    offset: 10,
                },
            },
        };

        const prefixSelector = getFieldDecorator('prefix', {
            initialValue: '86',
        })(
            <Select style={{ width: 70 }}>
                <Option value="86">+86</Option>
                <Option value="87">+87</Option>
            </Select>
        );

        return (
            <div className="">

                <Modal
                    footer={null}
                    title="地图纠错"
                    zIndex={2000}
                    onCancel={this.onClose}
                    visible={this.props.toolbar.errorpanelshow}
                >
                    <Form onSubmit={this.handleSubmit}>
                        <FormItem
                            {...formItemLayout}
                            label={(
                                <span>
                                    地点名称
                                </span>
                            )}
                        >
                            {getFieldDecorator('name', {
                                rules: [{ required: true, message: '请输入地点名称!', whitespace: true }],
                            })(
                                <Input name="name" />
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="问题类型"
                        >
                            {getFieldDecorator('type_id')(
                                <RadioGroup name="type_id">
                                    <RadioButton value={1}>地点不存在</RadioButton>
                                    <RadioButton value={2}>位置不正确</RadioButton>
                                    <RadioButton value={3}>地点信息有误</RadioButton>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={(
                                <span>
                                    详细描述
                                </span>
                            )}
                        >
                            {getFieldDecorator('describes', {
                                rules: [{ required: true, message: '请输入详细描述!', whitespace: true }],
                            })(
                                <TextArea name="describes" rows={4} />
                            )}
                        </FormItem>

                        <FormItem
                            {...formItemLayout}
                            label="联系电话"
                        >
                            {getFieldDecorator('phone', {
                                rules: [{ required: false, message: '请输入您的电话号码!' }],
                            })(
                                <Input addonBefore={prefixSelector} name="phone" style={{ width: '100%' }} />
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="E-mail"
                        >
                            {getFieldDecorator('email', {
                                rules: [{
                                    type: 'email', message: '请输入正确的邮箱地址',
                                }, {
                                    required: false, message: '请输入邮箱地址',
                                }],
                            })(
                                <Input name="email" />
                            )}
                        </FormItem>

                        <FormItem {...tailFormItemLayout}>
                            <Button type="primary" size="large" htmlType="submit">提交</Button>
                        </FormItem>
                    </Form>
                </Modal>
                {/*  <Drawer
                    title="填写位置信息"
                    placement="right"
                    width={500}
                    style={{
                        height: 'calc(100% - 55px)',
                        overflow: 'auto',
                        paddingBottom: 53,
                    }}
                   
                >
                  
                </Drawer> */}
            </div>
        )
    }
}



export default connect((state) => {
    return { toolbar: state.toolbar }
}, { showErrorPanel, onAddError, drawSupportReset })(Form.create()(ErrorPanel));
