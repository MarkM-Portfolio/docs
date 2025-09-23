(function() {
	/**
	 * Automatically proxies requests made to dojo xhr using the default configured proxy.
	 */
	dojo.provide('lconn.oneui.util.xhrproxy');
	dojo.require('lconn.oneui.util.xhr');
	dojo.require('lconn.oneui.util.proxy');

	var proxy = dojo.config.proxy;
	if (proxy)
	{
		var com_ibm_oneui_util = lconn.oneui.util;
		com_ibm_oneui_util.xhr.addRequestInterceptor(function(request) {
			var args = request.args;
			var url = request._originalUrl = args.url; 
			args.url = com_ibm_oneui_util.proxy(url);
		});
		com_ibm_oneui_util.xhr.addResponseInterceptor(function(request) {
			request.args.url = request._originalUrl;
		});
	}
})();


