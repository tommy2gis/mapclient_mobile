/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:32:05 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:32:05 
 */
import {withRouter} from 'react-router-dom';
import React, { Component } from 'react';

class ScrollToTop extends Component {
    componentDidUpdate(prevProps) {
      if (this.props.location !== prevProps.location) {
        window.scrollTo(0, 0)
      }
    }
  
    render() {
      return this.props.children
    }
  }
  
  export default withRouter(ScrollToTop)