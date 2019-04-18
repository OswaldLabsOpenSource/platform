const script = `!function(){"use strict";var s=new XMLHttpRequest;s.onreadystatechange=function(){if(4===s.readyState){var e=JSON.parse(s.responseText),t=e["plugin-url"]+"/agastya."+e["cache-key"]+".js",a=document.createElement("script");a.id="agastyascript",a.setAttribute("data-cache-key",e["cache-key"]),a.setAttribute("data-app-url",e["app-url"]),a.setAttribute("data-api-key","__KEY__"),a.setAttribute("data-plugin-url",e["plugin-url"]),a.setAttribute("src",t),(document.getElementsByTagName("head")[0]||document.head||document.body||document.documentElement).appendChild(a)}},s.open("GET","https://agastya-version.oswaldlabs.com/meta.__ENVIRONMENT__.json",!0),s.setRequestHeader("cache-control","no-cache,must-revalidate,post-check=0,pre-check=0,max-age=0"),s.send()}();`;

module.exports.development = (req, res) => {
    const send =
        script
            .replace(/__KEY__/g, req.params.apiKey.replace(".js", ""))
            .replace(/__ENVIRONMENT__/g, "development");
    res.type("js").set({
        "Cache-Control": "no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0"
    }).send(send);
}

module.exports.acceptance = (req, res) => {
    const send =
        script
            .replace(/__KEY__/g, req.params.apiKey.replace(".js", ""))
            .replace(/__ENVIRONMENT__/g, "acceptance");
    res.type("js").set({
        "Cache-Control": "public, max-age=3600"
    }).send(send);
}

module.exports.production = (req, res) => {
    const send =
        script
            .replace(/__KEY__/g, req.params.apiKey.replace(".js", ""))
            .replace(/__ENVIRONMENT__/g, "production");
    res.type("js").set({
        "Cache-Control": "public, max-age=86400"
    }).send(send);
}
