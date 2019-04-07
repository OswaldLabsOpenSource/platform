const script = `!function(){"use strict";var c="https://agastya-version.oswaldlabs.com",s=new XMLHttpRequest;s.onreadystatechange=function(){if(4===s.readyState){var e=JSON.parse(s.responseText),t=(e.__ENVIRONMENT__["plugin-url"]||c)+"/agastya."+.__ENVIRONMENT__e["cache-key"]+".js",a=document.createElement("script");a.id="agastyascript",a.setAttribute("data-cache-key",e.__ENVIRONMENT__["cache-key"]),a.setAttribute("data-baseUrl",c),a.setAttribute("data-app-url",e.__ENVIRONMENT__["app-url"]),a.setAttribute("data-plugin-url",e.__ENVIRONMENT__["plugin-url"]),a.setAttribute("src",t),(document.getElementsByTagName("head")[0]||document.head||document.body||document.documentElement).appendChild(a)}},s.open("GET",c+"/meta.json",!0),s.setRequestHeader("cache-control","no-cache,must-revalidate,post-check=0,pre-check=0,max-age=0"),s.send()}();
window.a11ySettings=window.a11ySettings||{};window.a11ySettings.token="__TOKEN__";`;

module.exports.development = (req, res) => {
    res.send(script);
}

module.exports.acceptance = (req, res) => {
    res.send(script);
}

module.exports.production = (req, res) => {
    res.send(script);
}
