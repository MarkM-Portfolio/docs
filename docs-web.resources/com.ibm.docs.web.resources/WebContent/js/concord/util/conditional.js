dojo.provide("concord.util.conditional");

dojo.require("dojox.xmpp.util");
dojo.require("dojox.encoding.base64");

dojo.declare("concord.util.conditional",null,{});
concord.util.conditional.defaultIconPath = "";
concord.util.conditional.processUntilAvailable= function (callback, errback, test, passedInParam, pThrowIfExhausted, pWaitBetweenTries, pMaxTries) 
{
	if( typeof(callback) != "function" ) 
		return; // nothing to call back, so just get out
	// defaults
	var waitBetweenTries = 500; // milliseconds
	var maxTries = 20; // intervals before giving up
	var throwIfExhausted = true; // throw err exhausted all tries
	if( typeof(pWaitBetweenTries) == "number") waitBetweenTries = pWaitBetweenTries; // override with supplied parameter
		if( typeof(pMaxTries) == "number") 
			maxTries = pMaxTries; // override with supplied parameter
	if( typeof(pThrowIfExhausted) == "boolean") 
		throwIfExhausted = pThrowIfExhausted; // override with supplied parameter
	var intervalId = "";
	var tried = 0;
	if(eval(test))
	{
		if(passedInParam != null)
			callback(passedInParam);
		else
			callback();
		return;
	}
	intervalId = window.setInterval(function()
	{
		tried++;
		if(eval(test))
		{
			window.clearInterval(intervalId);
			if(passedInParam != null)
				callback(passedInParam);
			else
				callback();
		}
		else if(tried == maxTries)
		{
			window.clearInterval(intervalId);
			if (errback)
				errback();
			if( throwIfExhausted ) 
				throw new Error( "processUntilAvailable: test was never met: " + test );
		}
	}, waitBetweenTries);
};
concord.util.conditional.tryConnecting= function (RootPath,interval,attemptCount,onSuccess,onFail) 
{
	if (attemptCount > 0)
	{
		var nextAround = dojo.hitch(null,concord.util.conditional.tryConnecting,RootPath,interval,attemptCount-1,onSuccess,onFail,true);
		var ifFail = function() 
		{
			setTimeout(nextAround,interval);
		};
		var xhrArgs = {
			url: RootPath,
			handleAs:"xml",
			sync:false,
			load: onSuccess,
			error: ifFail
		};
		dojo.xhrGet(xhrArgs);
	}
	else
		onFail();
};
concord.util.conditional.getDefaultIcon= function (item) 
{
	return window.contextPath+ window.staticRootPath+ "/images/NoPhoto_Person_48.png";
};

concord.util.conditional.getInitials = function(displayName)
{
    // matching groups are:
    // 1: first initial
    // 2: last initial, if applicable
    // so running initialsRegex.exec("John Smith") gives ["John S", "J", "S"],
    // "Snap Crackle Pop" gives ["Snap ", "S"], "J. P. Licks" gives ["J. P. L", "J", "L"].
    // You can obtain the initials by using .slice(1).join('')
    var initialsRegex = /^(\w)\S*\s+(?:\S\.?\s+)?(?:(\w)(?!.*\s))?/;

    var matches = initialsRegex.exec(displayName.trim());
    // make sure we have at least 1 matching group
    if (matches && matches.length > 1) {
        return matches.slice(1).map(function(s){
            return s && s.toUpperCase();
        }).join('');
    }
    return displayName[0].toUpperCase();
};

concord.util.conditional.getInitialNameIcon= function (item) 
{
	var outer = document.createElement('div');
	dojo.addClass(outer,"initial_name");
	
	var bgLayer = document.createElement('div');
	dojo.addClass(bgLayer,"initial_name_bg");
	dojo.style(bgLayer, "backgroundColor", item.UserColor);
	
	var fgLayer = document.createElement('div');
	dojo.addClass(fgLayer,"initial_name_fg");
	
	var chLayer = document.createElement('p');
	dojo.addClass(chLayer,"initial_name_ch");
	
	if(item.UserName)
	{
        chLayer.innerHTML = concord.util.conditional.getInitials(item.UserName);	
	}
	else if(item.email && typeof(item.email)=="string")
	{
		chLayer.innerHTML = item.email.toUpperCase().substr(0,1);
	}
	else if(item.UID)
	{
		chLayer.innerHTML = item.UID.toUpperCase().substr(0,1);
	}
		
	fgLayer.appendChild(chLayer);
	outer.appendChild(bgLayer);
	outer.appendChild(fgLayer);

	return outer;
	
};
concord.util.conditional.hideDom= function(divID,visibilityOnly,nofx,callBack)
{
	var element = null;
	if((typeof divID) == "string")
		element = dojo.byId(divID);
	else
		element = divID;
	if(element != null)
	{
		var temp383 = function()
		{
			element.style.visibility = "hidden";
			if(!visibilityOnly)
				element.style.display = "none";
			if(callBack != null)
				callBack();
		};
		if(nofx == null || nofx == false)
		{
			var temp3892387 = dojo.fx.wipeOut({node: element, duration: 300, onEnd: temp383});
			temp3892387.play();
		}
		else
			temp383();
	}
	return false; 
};
concord.util.conditional.entitilementVerification= function(componentName)
{
	if (gIs_cloud)
	{
		if (!window.entitlements_decoded)
		{
			var encoded = dojo.cookie('entitlements').split('-')[1];
			window.entitlements_decoded = dojox.xmpp.util.Base64.decode(encoded);
		}
		if (window.entitlements_decoded.search(componentName) == -1)
			return false;
	}
	return true;
};

concord.util.conditional.identifyCIORequest= function()
{	
	var ids = dojo.cookie('ids');
	if (gIs_cloud && ids)
	{
		var idArr = ids.split(':');
		if (idArr.length == 2)
		{
			if (idArr[1] == "126" || idArr[1] == "20705119" || idArr[1] == "203182507")
				return true;
		}
	}
	//For other orgs, we get to know the entitlement via ajax request
	//If it returns false, ST widget will be shown.
	return gIs_cloud ? concord.util.conditional.identifySTConfig(): false;
};

concord.util.conditional.identifySTConfig = function()
{
	var url = concord.util.uri.getSTConfigUri();
	var response, ioArgs;
	var callback = function(r, io) {response = r; ioArgs = io;};			
	dojo.xhrGet({
		url: url,
		timeout: 5000,
		handleAs: "json",
		handle: callback,
		sync: true,
		preventCache: true
	});				
	if (response instanceof Error) {
		return false;
	}				
	if (response){
		var bannernext = response.bannernext;
		if(bannernext){
			var gk = bannernext.gk;
			if(gk){	
				var enabled;
				for (var i in gk){
					var gkElem = gk[i];
					if(gkElem.SAMETIME_ENABLE_STWEBCHAT != undefined){
						enabled = gkElem.SAMETIME_ENABLE_STWEBCHAT;
						break;
					}
				}
				//SAMETIME_ENABLE_STWEBCHAT is found.
				if(enabled != undefined){
			        if(enabled == "true" || enabled === true){
			        	enabled = true;
			        }else{
						enabled = false;
					} 
					
					var hasChat = false;
					var entitle = bannernext.entitle;
					if(entitle){
						for (var j in entitle){
							var chat = entitle[j];
							if(chat == "bh_chat"){
								hasChat = true;
								break;
							}
						}						
					}
					return !(enabled && hasChat);
				}else {
					return true;
				}
			}
		}
	}
	return false;
};
