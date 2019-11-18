import React, { Component } from 'react';
import { Form, message, Input, Alert, Button, Modal } from 'antd';
const { TextArea } = Input;
const FormItem = Form.Item;
const axios = require('axios');

import './copyline.css'


export class CopyLine extends Component {
  state = {
    contactvisible: false,
    reliefvisible: false,
    suggestvisible: false
  }




  showReliefModal = () => {
    this.setState({
      reliefvisible: true,
    });
  }

  showSuggestModal = () => {
    window.location.href = "/#/suggestionapp"
    /* this.setState({
      suggestvisible: true,
    }); */
  }
  handleSuggestOk = (e) => {
    this.setState({
      suggestvisible: false,
    });
  }
  handleReliefOk = (e) => {
    this.setState({
      reliefvisible: false,
    });
  }

  showContactModal = () => {
    this.setState({
      contactvisible: true,
    });
  }

  handleOk = (e) => {
    this.setState({
      contactvisible: false,
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="copyline_bottom">
        <div id="scalebar"> &nbsp;&nbsp;地图来源:{this.props.zoom > 17 ? '无锡天地图' : '国家天地图'}&nbsp;&nbsp;审图号:苏S(2018)060号&nbsp;&nbsp;版权所有&nbsp;&nbsp;翻版必究&nbsp;&nbsp;<a href='/'>首页</a>&nbsp;&nbsp;<a onClick={this.showContactModal}>联系我们</a>&nbsp;&nbsp;<a onClick={this.showReliefModal}>免责说明</a>&nbsp;&nbsp;<a onClick={this.showSuggestModal}>意见反馈</a></div>

        <Modal
          title="联系我们"
          visible={this.state.contactvisible}
          footer={null}
          onCancel={this.handleOk}
        >
          <div className="infoText">
            <div>名称：无锡市国土资源局</div>
            <div>邮编：214002</div>
            <div>地址：无锡市文华路199号 </div>
            <div>邮箱：tdtsupport@163.com</div>
            <div>电话：0510-85726726</div>
          </div>
        </Modal>

        <Modal
          title="意见反馈"
          visible={this.state.suggestvisible}
          footer={null}
          onCancel={this.handleSuggestOk}
        >
          <Alert style={{ marginBottom: 10 }}
            description="感谢使用天地图·无锡相关产品！您在使用过程中遇到的各种问题，或者对我们产品有什么好的建议，都欢迎您通过天地图·无锡意见反馈平台向我们提出。我们会认真研究您所提供的反馈，来不断完善我们的产品和服务。"
            type="info"
          />
          <Form onSubmit={this.handleSubmit} >
            <FormItem>
              {getFieldDecorator('msg', {
                rules: [{ required: true, message: '请输入建议意见!' }],
              })(
                <TextArea rows={4} />
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" style={{ float: 'right' }} htmlType="submit" >
                添加
          </Button>
            </FormItem>
          </Form>
        </Modal>

        <Modal
          title="免责说明"
          style={{ minWidth: '50%', top: 40 }}
          visible={this.state.reliefvisible}
          footer={null}
          onCancel={this.handleReliefOk}
        >
          <div className="customscrollbar" style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <h1 align="center">“天地图·无锡” 免责声明</h1>
            <p >请您在使用“天地图·无锡”前仔细阅读本责任声明，您使用“天地图·无锡”即表示您认同并遵守以下声明, 这些声明适用于您对“天地图·无锡”的查询及以各种方式使用“天地图·无锡”的情形。</p>
            <h2>（一）关于版权 </h2>
            <p> 1、“天地图·无锡”定义的互联网服务内容包括：电子地图、文字、软件、音频、图片、视频、图表、各种有形产品、广告中的全部内容；电子邮件的全部内容；“天地图·无锡”为用户提供的其它信息。所有这些内容受版权、商标、标签和其它财产所有权法律的保护。 </p>
            <p> 2、您使用“天地图·无锡”，表明您承诺在任何方式下都不会删除或不会以任何方式更改“天地图·无锡”提供的服务中所显示的有关权利人对其拥有著作权、商标权或其他专有权利及知识产权的标识和通知。 </p>
            <p> 3、如果任何单位或个人发现“天地图·无锡”形成的链接所指向的第三方网页的内容可能涉嫌侵犯其权利的，应该及时以书面的通讯方式（信件、传真、电子邮件等）向网站主办方提交权利通知，并提供身份证明、权属证明及详细侵权情况证明。“天地图·无锡”在收到上述法律文件后，将会依法尽快断开相关链接内容。 </p>
            <p> 4、网站主办方拥有或与相关内容提供者共同拥有“天地图·无锡”（电子地图、文字、软件、音频、图片、视频、图表、各种有形产品、广告中的全部内容、电子邮件的全部内容及页面设计等）的版权和/或其他相关知识产权。未经网站主办方书面许可，对于“天地图·无锡”拥有版权和/或其他知识产权的任何内容，任何人或机构不得进行全部或部分复制、翻译、更改，不得将全部或部分服务聚合至其他数据、软件系统或任何派生产品，不得出售、出租、发行或转让全部或部分服务，不得在非“天地图·无锡”所属的服务器上做镜像或以其他任何方式进行使用，不得擅自使用“天地图·无锡”标志。对于违法此条款者，网站主办方将向其追求法律责任。 </p>
            <h2>（二）声明</h2>
            <p> 1、关于内容：“天地图·无锡”将对所提供的数据进行不断更新，但受数据更新频率的限制，不保证当前提供的数据完全准确、真实、完整。“天地图·无锡”对数据的准确性、及时性不作担保。同时，“天地图·无锡”力求提供的其他内容（包括但不限于文字、音频、视频、软件、图片、图标等）准确、真实、完整，但不担保完全符合实际情况，对于用户因使用“天地图·无锡”所提供的所有内容而引起的责任事故，“天地图·无锡”不承担任何责任。 </p>
            <p> 2、关于网络：“天地图·无锡”通过互联网及移动互联网提供服务，由于网络使用本身的风险及相关的不稳定因素，“天地图·无锡”不担保服务不会中断；对于因网络、通讯线路及使用“天地图·无锡”或任何第三方的服务、资料、网址等任何原因而引起的任何直接或间接的损害，网站主办方不承担任何法律责任；同时，用户个人需对网络服务的使用承担风险，网上交易安全自负，网站主办方对服务的稳定性、及时性、安全性都不作担保。 </p>
            <p> 3、除上述情况以外，对于因使用“天地图·无锡”而引起的或与之有关的任何直接或间接的损害，“天地图·无锡”概不承担责任。 </p>
            <h2>（三）相关法律</h2>
            <p>1、用户对“天地图·无锡”服务的使用要遵循所有适用于“天地图·无锡”的国家法律、地方法律和国际法律， 包括：《中华人民共和国保守国家秘密法》、《中华人民共和国著作权法》、《中华人民共和国计算机信息系统安全保护条例》、《计算机软件保护条例》、《互联网电子公告服务管理规定》、《信息网络传播权保护条例》、“国际互联网条约”（包括《世界知识产权组织版权条约》和《世界知识产权组织表演和录音制品条约》）等有关计算机及互联网规定的相关法律、法规、实施办法。</p>
            <p>2、在任何情况下，“天地图·无锡”合理地认为用户的行为可能违反上述法律、法规，本网站可以在任何时候，终止向该用户提供服务，并通知用户。</p>
            <p>3、“天地图·无锡”服务条款要与国家法律、地方法律和国际法律相一致，用户和网站主办方一致默认服从网站所有权人所在地的法院管辖。如发生“天地图·无锡”服务条款与国家法律、地方法律和国际法律相抵触时，则这些条款将完全按法律规定重新解释，而其它的与国家法律、地方法律和国际法律等不相抵触的条款依旧保持不变，仍对用户产生法律效力和影响。</p>
            <h2>（四）保留权利</h2>
            <p>1、网站主办方保留对本条款随时进行修改的权利。网站主办方有权在必要时修改服务条款，“天地图·无锡”服务条款一旦发生变动，将会在重要页面上提示修改内容。</p>
            <p>2、用户同意保障和维护网站主办方的利益，负责支付由于用户违反服务条款而引起纠纷的律师费用、损害补偿费用等。</p>
            <p>3、网站主办方对本条款拥有最终的解释权。</p>
          </div>
        </Modal>
      </div>
    )
  }
}

export default Form.create()(CopyLine)
