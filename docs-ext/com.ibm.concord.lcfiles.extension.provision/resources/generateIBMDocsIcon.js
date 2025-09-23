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

dojo.provide("concord.generateIBMDocsIcon");

dojo.require("lconn.core.uiextensions");
dojo.require("lconn.share.bean.File");
dojo.require("lconn.share.bean.Version");
dojo.require("lconn.share.scenehelper");

(function() {

	var IBMDocsIconsStrings = [ "wordprocessing_", "presentations_", "spreadsheets_" ];
	//these type can be a big icon in summary page. others only show in version list, such as 'txt',template.
	var IBMDocsIconsMapping = {
		"odt" : 0,
		"doc" : 0,
		"docx" : 0,
		"txt" : 0,
		"odp" : 1,
		"ppt" : 1,
		"pptx" : 1,
		"ods" : 2,
		"xls" : 2,
		"xlsx" : 2,
		"xlsm" : 2,
		"csv" : 2
	};

	//mimic app.routes.generateFileTypeImage, when there is special css class for IBMDocs icon in future, this will be changed.
	function generateIBMDocsImage(img, extension, size, file) {
		var size = size || 16;
		//img.src = dijit._Widget.prototype._blankGif;
		img.className = lconn.core.utilities.getFileIconClassName('.' + extension, size);
		// Explictly remove the original background image defined in that css class.
		dojo.style(img, "backgroundImage", "url(" + dijit._Widget.prototype._blankGif + ")");
		img.src = concord.global.getIconBaseURL() + "ibmdocs_" + IBMDocsIconsStrings[IBMDocsIconsMapping[extension.toLowerCase()]] + size + ".png";
	}
	var orgCustomizeViewObject = lconn.share.scenehelper.customizeViewObject;
	
	lconn.share.scenehelper.customizeViewObject = function(file, viewObj, size) {
		var size = size || 16;
		viewOjb = orgCustomizeViewObject(file, viewObj);
		if (typeof (IBMDocsIconsMapping[file.getExtension().toLowerCase()]) != "undefined" && concord.global.isIBMDocFile(file)) {
			viewOjb.fileTypeIconPath = concord.global.getIconBaseURL() + "ibmdocs_" + IBMDocsIconsStrings[IBMDocsIconsMapping[file.getExtension().toLowerCase()]] + size + ".png";
			return viewObj;
		}
		return viewObj;
	}

	function overrideFileTypeIcon(app) {
		var generateFileTypeImage = app.routes.generateFileTypeImage;

		// we will set image class as "lconn-ftype<size> lconn-ftype<size>-<extension>"
		//TODO: the 'setting protyotype' method is just a workaround, the defect is tracked by files 70106.
		dojo.getObject(app.routes.declaredClass).prototype.generateFileTypeImage = app.routes.generateFileTypeImage = function(img,
				extension, size, file) {
			// there is a bug in files, for bean.Version object, once one
			// Version is IBMDocs type, then all the Versions are.
			// 1st condition is for version list icons.
			if (typeof (IBMDocsIconsMapping[extension.toLowerCase()]) != "undefined" && concord.global.isIBMDocFile(file)) {
				return generateIBMDocsImage(img, extension, size, file);
			} else {
				return generateFileTypeImage(img, extension, size, file);
			}
		}
	}

	lconn.core.uiextensions.when("lconn/files/app/start").addCallback(overrideFileTypeIcon);
	lconn.core.uiextensions.when("lconn/files/comm/ref/app/start/fullpage").addCallback(overrideFileTypeIcon);
})();