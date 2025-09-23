(function() {
	dojo.provide('lconn.oneui.util.proxy');
	var com_ibm_oneui_util = lconn.oneui.util;

	var defaultPort = function(scheme) {
		return scheme == "https" ? 443 : 80;
	}
	
	var proxy = dojo.config.proxy;
	if (proxy) {
		var location = window.location;
		var host = location.hostname || localhost;
		var scheme = (location.protocol || "http").replace(':','');
		var port = location.port || defaultPort(scheme); 
		
		com_ibm_oneui_util.proxy = function(url) {
			var uri = new dojo._Url(url);
			var newHost = uri.host;
			if (newHost) {
				var newScheme = uri.scheme || scheme;
				var newPort = uri.port || defaultPort(newScheme);
				if (newScheme != scheme || newPort != port || newHost != host)
					return proxy + "/" + scheme + "/" + encodeURIComponent(newHost+":"+newPort) + (uri.path || "") + (uri.query ? ("?"+uri.query) : "");
			}
			return url;
		}
	}
	else
		com_ibm_oneui_util.proxy = function(url) {return url;}
})();


