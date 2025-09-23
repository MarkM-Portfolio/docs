/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.util.ApiEngine");

dojo.declare("concord.util.ApiEngine", null, {

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	/// IMPORTANT SETTING, THE VERSION SHOULD BE MATCHED TO THE VERSION DEFINED IN THE SDK/API.JS FILE ///
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	Docs_SDK_Version: "0.8",
	
	domainList: [], // white list of domains
	blackListKey: "_untrustedOriginsForDocs_",
	
	domainSources: {}, // {'domain-key': window object}	
	eventStat: {}, // {"domain-key': {count: count, timeStamp: timeStamp}}
	
	configure: function() {
		// docs server's domain is the default domain
		var origin = window.location.origin;
		
		var blackList = [];
		var item = window.localStorage.getItem(this.blackListKey);
		if (item) blackList = JSON.parse(item);
		for (var i = 0; i < blackList.length; i++) {
			if (blackList[i] == origin) {
				origin = null;
				break;
			}
		}
		
		if (origin) this.domainList.push(origin);

		if (window.g_whiteDomains) {
			var list = window.g_whiteDomains["domain_list"];
			if(list)
			{
				for (var i = 0; i < list.length; i++) {
					// Ignore wildcards domain that is used for the Content-Security-Policy setting
					if (list[i].indexOf("*") == -1){
						this.domainList.push(list[i].replace(/\/$/, ''));
					}
				}
			}
		}
	},
	
    startListener: function () {
        window.addEventListener("message", dojo.hitch(this, function (event) {
            this.eventReceived(event);
        }), false);
    },

    _genError: function (errorMsg) {
        var json = { status: "error" };
        if (errorMsg)
            json.detail = errorMsg;
        return json;
    },

    _genResult: function (result) {
        var json = { status: "success" };
        if (result !== undefined)
            json.detail = result;
        return json;
    },

    _assembleMsg: function (eventId, eventType, status, detail) {
        var m = {
            detail: detail,
            generated: new Date().valueOf()
        }
        if (status)
            m.status = status;
        if (eventType)
            m.eventType = eventType;
        if (eventId || eventId === 0)
            m.eventId = eventId;
        return JSON.stringify(m);
    },

    notify: function(domain, eventType, detail) {
        if (!domain) return;
        
        var domains = {};
        if (domain == "*")
        	domains = this.domainSources;
        else {
        	if (this.domainSources[domain])
        		domains[domain] = this.domainSources[domain];
        }
        
        var json = this._assembleMsg(null, eventType, "", detail);
        for (var domain in domains) {
        	var source = domains[domain];
        	source.postMessage(json, domain);
        }
    },

    responseApiCall: function (domain, eventId, status, data) {
        if (!domain) return;

		var source = this.domainSources[domain];
		if (!source) return;

        var json = this._assembleMsg(eventId, null, status, data);
        source.postMessage(json, domain);
    },

    /*boolean*/_checkParam: function(params) {
    	var MAX_STRING_SIZE = 100000;
    	var valid = true;
    	
    	for (var i = 0; i < params.length; i++) {
    		var param = params[i];
    		if (!param) continue;
    		
    		var type = typeof param;
    		if (type == "string") {
    			if (param.length > MAX_STRING_SIZE) {
    				valid = false;
    				break;
    			}
    		} else if (type == "object" && Array.isArray(param) && param.length > 0) {
    			if (!this._checkParam(param)) {
    				valid = false;
    				break;
    			}
    		}
    	}
    	
    	return valid;
    },
    
    msgReceived: function (domain, json) {
        var id = json.id;
        var name = json.name;
        var params = json.params || [];
        params.push(domain);
        params.push(id);
        
        if (id || id === 0) {
            var impl = this;
            var result = {
                status: "error",
                detail: "not supported api call"
            };
            
            // check that the data in question is of the expected format
            if (this._checkParam(params)) {
                if (name && impl[name] && dojo.isFunction(impl[name])) {
                    result = impl[name].apply(impl, params);
                }
            } else
            	result.detail = "too large message content";

            if (result)
            	this.responseApiCall(domain, id, result.status, result.detail);
        }
    },

    // only accept a certain number of messages per minute to avoid a denial-of-service attack
    /*boolean*/_detectDoSAttack: function(domain) {
    	var MAX_EVENT_COUNT_PER_MINUTE = 100;

		var timeStamp = Math.round(new Date().getTime()/1000); // in second
    	if (!this.eventStat[domain])
    		this.eventStat[domain] = {count: 0, timeStamp: timeStamp};
    	
    	var stat = this.eventStat[domain];
    	if ((timeStamp - stat.timeStamp) > 60) {
       		// one minute elapsed
   			stat.count = 0;
   			stat.timeStamp = timeStamp;
   		}
    	stat.count++;
    	
    	return stat.count > MAX_EVENT_COUNT_PER_MINUTE ? true : false;
    },
    
    eventReceived: function (event) {
        var origin = event.origin || event.originalEvent.origin;
        var source = event.source; // window
        var data = event.data;
       	if (!data) return;

        var valid = false;
        var index = 0;
        for (; index < this.domainList.length; index++) {
        	if (origin == this.domainList[index]) {
        		this.domainSources[origin] = source;
        		valid = true;
        		break;
        	}
        }
        
        if (!valid) return; // ignore this event
        
        if (this._detectDoSAttack(origin)) {
        	this.domainList.splice(index, 1);
        	
        	var blackList = [];
    		var item = window.localStorage.getItem(this.blackListKey);
    		if (item) blackList = JSON.parse(item);
    		blackList.push(origin);
        	window.localStorage.setItem(this.blackListKey, JSON.stringify(blackList));
			
        	console.info("Denial-of-service attack?");
        	return;
        }
        
        if (typeof data == "string" && data.substring(0, 9) == "handshake") {
        	var version = data.substring(10); // like "handshake-0.1"
        	if (version && version.length > 0) {
        		version = parseFloat(version);
        		var currentVersion = parseFloat(this.Docs_SDK_Version);
        		var detail = {supportedVersion: currentVersion};
        		if (version != currentVersion) {
        			detail.higherThan = version > currentVersion ? true : false;
        			this.notify(origin, "IDOCS.EVENT.versionMismatch", detail);
        		}
        	}
        }
        else {
            try {
                var json = JSON.parse(data, function (key, value) {
           			if (value && typeof value === "string" && value.substr(0,8) == "function") {
           				var startBody = value.indexOf('{') + 1;
           				var endBody = value.lastIndexOf('}');
             			var startArgs = value.indexOf('(') + 1;
                		var endArgs = value.indexOf(')');
                			
                		return new Function(value.substring(startArgs, endArgs), value.substring(startBody, endBody));
                	}
                	
                	return value;
                });
                this.msgReceived(origin, json);
            } catch (e) {
            	console.info(e);
            }
        }
    }
});