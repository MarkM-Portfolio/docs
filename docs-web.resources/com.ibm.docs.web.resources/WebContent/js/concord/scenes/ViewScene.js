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

dojo.provide("concord.scenes.ViewScene");

dojo.require("concord.util.uri");
dojo.require("concord.scenes.ErrorScene");
dojo.require("concord.beans.Document");
dojo.require("concord.widgets.FileDeepDetectDialog");
dojo.require("dojo.i18n");
dojo.require("dojo.cookie");
dojo.require("dojo.string");
dojo.require("concord.util.strings");
dojo.requireLocalization("concord.scenes","Scene");
dojo.requireLocalization("concord.scenes","AppCheckScene");

dojo.declare("concord.scenes.ViewScene", null, {

	nls:null,
	deepDetectKey : null,
	cookiePath : null,
	interval : 1000, //1 seconds
	timer : null,
	resourceBundle : null,
	
	constructor: function()
	{
		this.nls = dojo.i18n.getLocalization("concord.scenes", "Scene");
		this.deepDetectKey = "export_deepdetect_" + encodeURIComponent(VIEW_CONTEXT.docUri) + "_" + VIEW_CONTEXT.asFormat;
		this.cookiePath = window.contextPath + "/app/doc/" + VIEW_CONTEXT.repoId + "/" + VIEW_CONTEXT.docUri + "/view/";
		this.resourceBundle = dojo.i18n.getLocalization("concord.scenes", "AppCheckScene");
		document.title = dojo.string.substitute(this.resourceBundle.appcheck_product_name, { 'productName' : concord.util.strings.getProdName() });
		document.getElementById("scene-title").innerHTML = this.resourceBundle.appcheck_inprocess;
		var msg = this.resourceBundle.appcheck_msg_normal;

		if (VIEW_CONTEXT.mode == "view")
		{
			msg = this.resourceBundle.appcheck_msg_normal_view;
		}

		if (VIEW_CONTEXT.isAsFormat == "true")
		{
			msg = this.resourceBundle.appcheck_msg_normal_export;
		}

		msg = msg + "<br>" + this.resourceBundle.appcheck_msg_normal_next;
		if (VIEW_CONTEXT.bConvertingToODF == "true")
		{
			msg = this.resourceBundle.appcheck_msg_notodf + "<br>" + this.resourceBundle.appcheck_msg_notodf_next;
		}
		document.getElementById("scene-message").innerHTML = msg;
	},
	
	init : function()
  	{	
		this.queryJob();
  	},
  	
  	queryJob : function()
  	{
  		var url = window.contextPath + "/api/job/" + VIEW_CONTEXT.repoId + "/" + VIEW_CONTEXT.docUri + "/" + VIEW_CONTEXT.taskId + "?mode=" + VIEW_CONTEXT.mode + "&draft=" + VIEW_CONTEXT.isDraft;
  		dojo.xhrGet
  		(
  			{
				url: url,
				handleAs: "json",
				handle: dojo.hitch(this, this.handleJob),
				sync: false,
				preventCache: true
			}
		);
  	},
  	
  	redirect : function(response, aborted) 
  	{
		var data = response.data;
		var json = dojo.fromJson(dojo.cookie(this.deepDetectKey));
		if(!json)
		{
			json = {};
		}
		if(aborted || (data.correctFormat != null && data.correctFormat.search(/unsupported/i) != -1))
		{
			dojo.cookie(this.deepDetectKey, dojo.toJson(json), {path : contextPath});
//			dojo.cookie(this.deepDetectKey, dojo.toJson(json), {path : this.cookiePath});
			concord.scenes.ErrorScene.renderError(response.error_code);
			return;
		}
		var url = window.location.href;
		json.correctFormat = data.correctFormat;
		dojo.cookie(this.deepDetectKey, dojo.toJson(json), {path : contextPath});
		//dojo.cookie(this.deepDetectKey, dojo.toJson(json), {path : this.cookiePath});
		window.location.href = url;
		this.updateContent(url);
  	},
  	
  	handleJob : function(response, ioArgs)
  	{
	  	if (response instanceof Error)
	  	{
	  		// check again
	  		this.timer = setTimeout(dojo.hitch(this, this.queryJob), this.interval);
	  		return;
	  	}
	  	
	  	if (response.status == "complete")
	  	{
	  		clearTimeout(this.timer);
	  		var url = window.location.href;
			var ss = url.split("?", 2);
			if (response.data)
			{
				doc = new concord.beans.Document(response.data);
				url = concord.util.uri.getDocViewModeUri(doc, VIEW_CONTEXT.isDraft);
			}
			else
				url = concord.util.uri.getViewModeUri(VIEW_CONTEXT.repoId, VIEW_CONTEXT.docUri, VIEW_CONTEXT.isDraft);
			
			if (ss && ss[1])
			{
				url = url + "?" + ss[1];
			}
			if(this.checkAsFormat())
			{
				this.updateContent(url);
			}
			else
			{
				window.location.href = url;
			}
	  	}
	  	else if (response.status == "error")
	  	{
	  		clearTimeout(this.timer);
	  		var data = response.data;
			var problem_id ="";
			try
			{
				problem_id = response.data.problem_id;
			}
			catch (ex)
			{
				console.log("Error happens while get problem id from response data .", ex);
			}
			if(problem_id == null || problem_id == "")
			{
				problem_id = ioArgs.xhr.getResponseHeader("problem_id");
			}
	  		if(data != null && data.correctFormat != null && data.correctFormat.search(/unsupported/i) == -1)
	  		{
	  			var data_msg = this.nls.fileDeepDetectMsg ;
	  			var params =
	  			{
	  				message : data_msg, 
	  				callback : dojo.hitch(this, this.redirect),
	  				response : response
	  			};
	  			var dlg = new concord.widgets.FileDeepDetectDialog(null, this.nls.fileDeepDetectTitle, this.nls.fileDeepDetectOkLabel, true, params);
	  			dlg.show();
	  			if(problem_id && problem_id != "")
				{	 
		  			var topDiv = dojo.query("[id^='fileDeepDetectInfoId']")[0];
		  			concord.scenes.ErrorScene.showProblemID(problem_id,topDiv.id);
				}
	  		}
	  		else
	  		{
	  			if (data == null)
	  			{
	  				data = {};
	  			}
	  			data.mode = "view";
	  			if(problem_id && problem_id != "")
				{
					data.problem_id = problem_id ;
				}
	  			this.clearDeepdetectCookie();
				concord.scenes.ErrorScene.renderError(response.error_code, data);	
	  		}
	  	}
	  	else if (response.status == "pending")
	  	{
	  		// check again
	  		this.timer = setTimeout(dojo.hitch(this, this.queryJob), this.interval);
	  		return;
	  	}
	  	else
	  	{
	  		var problem_id ="";
			try
			{
				problem_id = response.data.problem_id;
			}
			catch (ex)
			{
				console.log("Error happens while get problem id from response data .", ex);
			}
			if(problem_id == null || problem_id == "")
			{
				problem_id = ioArgs.xhr.getResponseHeader("problem_id");
			}
			var data = {};
  			if(problem_id && problem_id != "")
			{
				data.problem_id = problem_id ;
			}
	  		console.log("unknown job status: " + response.status);
	  		clearTimeout(this.timer);
	  		this.clearDeepdetectCookie();
	  		concord.scenes.ErrorScene.renderError(0, data);
	  	}
	},
	
	checkAsFormat : function()
	{
		var url = window.location.href;
		var index = url.indexOf("?");
		if(index != -1)
		{
			var parameter = url.substring(index + 1, url.length);
			if(parameter.indexOf("asFormat=") != -1)
			{
				return true;
			}
		}
		return false;
	},
	
	updateContent : function(url)
  	{
		
		var mainDiv = document.getElementById("lotusFrame");
		if(mainDiv){			
			dijit.setWaiRole(mainDiv, "main");		
		}
		
		document.getElementById("scene-title").innerHTML = this.resourceBundle.appcheck_msg_complete;
		document.getElementById("scene-message").innerHTML = this.resourceBundle.appcheck_msg_complete_text;
		//insert link
		var link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("id", "download");

		var action = document.getElementById("scene-action");
		txt = document.createTextNode(this.resourceBundle.appcheck_msg_download);
		link.appendChild(txt);
		action.appendChild(link);
		var loadingIcon = document.getElementById("loading");
		loadingIcon.setAttribute("src", window.contextPath + VIEW_CONTEXT.staticRootPath + "/images/confirmation_48.png");			
  	},
  	
  	clearDeepdetectCookie : function()
	{
		var json = {};
		dojo.cookie(this.deepDetectKey, dojo.toJson(json), {path : contextPath, expires:-1});
	}
});