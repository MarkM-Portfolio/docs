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

dojo.provide("pres.bootstrap");
dojo.require("concord.main.App");
dojo.require("dojo.cookie");
dojo.require("pres.Scene");
dojo.require("pres.SceneMobile");
dojo.require("pres.CKLegacy");
dojo.require("concord.util.BidiUtils");

window.__pres2 = true;
concord.main.App.prototype.PRESDOC_SCENE = "pres.Scene";
clearFormatCookie();

dojo.addOnLoad(function()
{
	var banner = dojo.byId("banner");
	var isMobile = concord.util.browser.isMobile();
	if (isMobile)
	{
		if (banner)
			banner.style.display = "none";

		dojo.addClass(document.documentElement, "mobile_app");
	}
	if (dojo.isMac)
		dojo.addClass(document.documentElement, "dj_mac");
	else
		dojo.addClass(document.documentElement, "dj_not_mac");
	
	concord.main.App.onLoad(window, 'concord.main.App');
	if (g_locale.indexOf('ja') != -1)
		dojo.query("body").addClass("lotusJapanese");
	if (g_locale.indexOf('ko') != -1)
		dojo.query("body").addClass("lotusKorean");
	if (BidiUtils.isGuiRtl())
		dojo.query("body").addClass("dijitRtl");

	if (!gIs_cloud)
	{
		dojo.query("body").addClass("onpremise");
	}
	document.documentElement.style.overflow = "hidden";
	document.body.style.overflow = "hidden";
	dojo.attr(document.body, "spellCheck", "false");
	dojo.connect(document.body, "oncontextmenu", function(e)
	{
		dojo.stopEvent(e);
	});
	dojo.connect(document.body, "onkeydown", function(e)
	{
		if (e.keyCode == 8 && e.target)
		{
			var tag = e.target.tagName.toUpperCase();
			if (tag == "BODY" || tag == "HTML")
				// backspace key, people may press backspace by mistake to make browser navigate back.
				dojo.stopEvent(e);
		}
	});
});
dojo.addOnUnload(function()
{
	concord.main.App.onUnload(window);
});
dojo.addOnWindowUnload(function()
{
	concord.main.App.onWindowUnload(window);
});
if(concord.util.browser.isMobileBrowser()) {
	document.addEventListener('visibilitychange', function() {
		if (document.visibilityState == 'hidden') {
			pe.scene.saveDraft(true);
		}
	});
}

function clearFormatCookie()
{
	if (DOC_SCENE.mode == "edit")
	{
		clearEditFormatCookie();
	}
	else
	{
		var cookie = dojo.cookie("deepdetect");
		if (cookie != null)
		{
			var json = dojo.fromJson(cookie);
			if (json != null)
			{
				var view = json.view[DOC_SCENE.uri];
				if (view != null)
				{
					view.correctFormat = null;
					view.jobId = g_jobId;
					var cookiePath = contextPath + "/app/doc/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/view";
					dojo.cookie("deepdetect", dojo.toJson(json), {
						path: cookiePath
					});
				}
			}
		}
	}
}

function clearEditFormatCookie()
{
	var cookie = dojo.cookie("deepdetect");
	if (cookie != null)
	{
		var json = dojo.fromJson(cookie);
		if (json != null)
		{
			if (json.edit[DOC_SCENE.uri] != null)
			{
				json.edit[DOC_SCENE.uri] = null;
				var cookiePath = contextPath + "/app/doc/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/edit";
				var cookieProps = {
					path: cookiePath,
					expires: -1
				};
				dojo.cookie("deepdetect", dojo.toJson(json), cookieProps);
			}
		}
	}
}
