/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:32:17 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:32:17 
 */

function loginout (){
    sessionStorage.removeItem("userid");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userorg");
    sessionStorage.removeItem("userorgname");
    sessionStorage.removeItem("displayname");
    sessionStorage.removeItem("geokey");
    window.location.reload()
  }


  function login (){
    window.location.href='/login.html';
  }



module.exports = {
    loginout,
    login
};
