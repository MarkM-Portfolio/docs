/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.global");
dojo.require("dojo.cookie");
dojo.requireLocalization("viewer", "ccdfilesext");
dojo.require["lconn.core.config.features"];
dojo.require("viewer.viewerPreload");

/**
 * When EntitlementCheck value as true, code need to check if current domain 
 * contains a cookie called "IBMDocsEntitlement" to determine whether show view or not
  * glb_viewer_url = "/ajaxProxy/proxy/http/w3.tap.ibm.com/docs";
 * glb_viewer_url_wnd_open = "http://w3.tap.ibm.com/docs";
 **/
glb_viewer_url = "/viewer";
glb_viewer_url_wnd_open = "/viewer";

viewer.global = new function() {
    this._locMap = {
		"zh-hk": "zh-tw",
		"zh-mo": "zh-tw",
		"zh-sg": "zh-cn",
		"zh": "zh-cn",
		"no": "nb",
		"nb-no": "nb",
		"nn-no": "nb",
		"nn": "nb",
		"id-id": "id",
		"in-id": "id"
    };
    
    // copied from dojo.i18n of dojo 1.9 and overwrote the locale
    this._getLocalization = function(pack, name, locale) {
    	var base = pack + ".nls." + name;
    	var localization, bundle = dojo.getObject(base), elements = locale.split('-');
    	for(var i = elements.length; i > 0; i--){
    		var loc = elements.slice(0, i).join('_');
    		if (dojo.exists(loc, bundle)) {
    			localization = bundle[loc];
    			break;
    		}
    	}
    	if (!localization && bundle && bundle.ROOT)
    		localization = bundle.ROOT;
    	return localization; 
    }
    
    this.nls = null;

    this.entitlementCheck = {
    		checked: false,
    		entitled: false
   	};

	this.getLocale = function() {
		var mappedLoc = this._locMap[dojo.locale.toLowerCase()];
		if(!(mappedLoc == undefined)){
			return mappedLoc
		} else{
			mappedLoc = dojo.locale.toLowerCase()
		}
		
		if(!((mappedLoc == "pt-br") || (mappedLoc == "zh-cn") || (mappedLoc == "zh-tw"))) {
			mappedLoc = mappedLoc.split("-")[0];
		}
		
		return mappedLoc;
	},

    this.showViewEntry = function(bNoCheckDetailpage) {
		if (!bNoCheckDetailpage && lconn.core.config && lconn.core.config.features && lconn.core.config.features("fileviewer-detailspage")) {
			return false;
		}
		
		if(dojo.cookie("entitlements")){
			this.entitlementCheck.entitled = true;
			this.entitlementCheck.checked = true;
		}
		
		if(lconn.core.auth.isAuthenticated() && !this.entitlementCheck.checked) {
			var response;
			dojo.xhrGet({
				url: '/viewer/api/entitlement',
				handleAs:"json",
				timeout: 30000,
				sync: true,
				preventCache: true,
				handle: function(r, io){
					response = r;
				}
			});
			if(response instanceof Error){
				this.entitlementCheck.entitled = false;
			}
			else{
				this.entitlementCheck.entitled = (response.entitled == 'true');
				this.entitlementCheck.checked = true;
				if( undefined != response.error) {
					console.log(response.error);
				}
			}
		}
		return this.entitlementCheck.entitled;
//        return !EntitlementCheck || dojo.cookie("IBMDocsEntitlement");
    };
    
    var loc = dojo.locale.toLowerCase();
    var beforeDojo19 = dojo.version.major == 1 && dojo.version.minor < 7;
    
    if( !beforeDojo19 ){
		this._dojo19locMap = {
				  "zh-hk": "zh-tw",
				  "zh-mo": "zh-tw",
				  "zh-sg": "zh-cn",
				  "zh": "zh-cn",
				  "nb": "nb",
				  "nb-no": "nb",
				  "nn-no": "nb",
				  "nn": "nb",
				  "no": "nb",
				  "id-id": "id",
				  "in-id": "id"
			};
			var useLocMap = true;
			if(dojo.isIE && loc == "id-id"){
				useLocMap = false;
			}
			if(this._dojo19locMap[loc] && useLocMap){
				loc = this._dojo19locMap[loc];
			} 
			this.nls = this._getLocalization("viewer", "ccdfilesext", loc);				
    } else if((loc.indexOf("en")==0)){
    	this.getLocale = function() {
    		return undefined;
    	}
    	this.nls = dojo.i18n.getLocalization("viewer", "ccdfilesext");
    } else {
	    var localizationComplete = dojo.config.localizationComplete;
	    if(localizationComplete) {
	    	dojo.config.localizationComplete = false;	//force downloading the resource js file
	    }
	    
	    dojo.requireLocalization("viewer", "ccdfilesext", this.getLocale());
	    dojo.config.localizationComplete = localizationComplete;
	    this.nls = dojo.i18n.getLocalization("viewer", "ccdfilesext", this.getLocale());
	}
}();
//todo:docs is not installed.
dojo.addOnLoad( function() {
	if(viewer.global.showViewEntry(true)) {
		var viewerPreloadFrm = new viewer.viewerPreload();
		viewerPreloadFrm.preload(5);
	}
});