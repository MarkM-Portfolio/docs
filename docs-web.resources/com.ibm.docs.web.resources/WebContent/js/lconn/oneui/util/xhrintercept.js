(function () {
	/**
	 * When invoked, replaces the default dojo XHR behavior with the override from com.ibm.oneui.util.xhr
	 */
	dojo.provide('lconn.oneui.util.xhrintercept');
	dojo.require('lconn.oneui.util.xhr');
	
	var originalXhr = dojo.xhr;
	
	var f = lconn.oneui.util.xhr;
	f.setMethod(originalXhr);
	
    dojo.xhr = f;
})();
