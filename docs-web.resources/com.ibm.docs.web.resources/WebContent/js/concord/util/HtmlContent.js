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

dojo.provide("concord.util.HtmlContent");
dojo.require("concord.i18n.ClassName");
//////
////// change id for svg shape, refresh the ref
//////
concord.util.HtmlContent.refreshIdForSVGElement = function(svgNode) {
	// check num
	var num = svgNode.childNodes.length;
	if (num < 2)
		return;
	
	// get node for <defs> group
	var defGroupNode = svgNode.childNodes[0];
	if (defGroupNode.tagName != "g")
		return;
	if (dojo.attr(defGroupNode, "groupfor") != "defs")
		return;
	
	var changedIdNum = 0;
	
	for (var i=0; i < defGroupNode.childNodes.length; ++i) {
		var defNode = defGroupNode.childNodes[i];
		if (defNode.childNodes.length != 1)
			continue;
		
		var subDef = defNode.childNodes[0];
		var subName = subDef.tagName.toLowerCase();
		// For webkit, if the id is not updated and referenced again
		// the effect will not take effect when exit from edit mode
		if (subName == "clippath" || subName == "lineargradient" || subName == "radialgradient" || subName == "pattern") {
			var oldId = dojo.attr(subDef, "id");
			var newId = oldId;
			var appendSuffix = "_upd";
			var appendSuffixLen = appendSuffix.length;
			if (oldId.slice(-appendSuffixLen) == appendSuffix) {
				newId = oldId.substring(0, oldId.length-appendSuffixLen);
			} else {
				newId = oldId + appendSuffix;
			}
			
			dojo.attr(subDef, "id", newId);
			changedIdNum++;
		}
	}  // end for
	
	if (changedIdNum > 0) {
		concord.util.HtmlContent.checkIdRefForSVGElement(svgNode);
	}
		
};

//////
////// only update the ref by existing id
//////
concord.util.HtmlContent.checkIdRefForSVGElement = function(svgNode) {
	// check num
	var num = svgNode.childNodes.length;
	if (num < 2)
		return;
	
	// get node for <defs> group
	var defGroupNode = svgNode.childNodes[0];
	if (defGroupNode.tagName != "g")
		return;
	if (dojo.attr(defGroupNode, "groupfor") != "defs")
		return;
	
	var clipId;
	var fillId;
	var strokeId;
	for (var i=0; i < defGroupNode.childNodes.length; ++i) {
		var defNode = defGroupNode.childNodes[i];
		if (defNode.childNodes.length != 1)
			continue;
		
		var subDef = defNode.childNodes[0];
		var subName = subDef.tagName.toLowerCase();
		if (subName == "clippath") {
			clipId = dojo.attr(subDef, "id");
		} else if ((subName == "lineargradient") || (subName == "radialgradient")) {
			var gradTarget = dojo.attr(subDef, "gradtarget");
			if (gradTarget == "fill") {
				fillId = dojo.attr(subDef, "id");
			} else if (gradTarget == "stroke") {
				strokeId = dojo.attr(subDef, "id");
			}
		}  else if ((subName == "pattern")) {
			var imgTarget = dojo.attr(subDef, "imgtarget");
			if (imgTarget == "fill") {
				fillId = dojo.attr(subDef, "id");
			}
		}
	}  // end for
	
	// get node for <group>
	var grpNode = svgNode.childNodes[1];
	if (dojo.attr(grpNode, "groupfor") != "fill-line-arrow")
		return;
	
	for (var j=0; j < grpNode.childNodes.length; ++j) {
		var subGrp = grpNode.childNodes[j];
		var subGrpFor = dojo.attr(subGrp, "groupfor");
		
		if (subGrpFor == "fill") {
			// clipPath, fill
			if (clipId)
				var clipPathRef = "url(#" + clipId + ")";
			if (fillId)
				var fillRef = "url(#" + fillId + ")";
			for (var i=0; i < subGrp.childNodes.length; ++i) {
				var subNode = subGrp.childNodes[i];
				
				// clipPath
				var curClipPath = dojo.attr(subNode, "clip-path");
				// no clippath or clippath need be updated
				if (!curClipPath || (curClipPath && clipPathRef && (curClipPath != clipPathRef))) {
					dojo.attr(subNode, "clip-path", clipPathRef);
				}
				
				// fill
				var curFill = dojo.attr(subNode, "fill");
				if (curFill && fillRef && (curFill.indexOf("url(#") == 0) && (curFill != fillRef)) {
					dojo.attr(subNode, "fill", fillRef);
				}
			}  // end for
			
		} else if ((subGrpFor == "line") || (subGrpFor == "arrow")) {
			// stroke, fill
			if (strokeId)
				var strokeRef = "url(#" + strokeId + ")";
			for (var i=0; i < subGrp.childNodes.length; ++i) {
				var subNode = subGrp.childNodes[i];
				
				// fill for some types of arrow
				var curFill = dojo.attr(subNode, "fill");
				if (curFill && strokeRef && (curFill.indexOf("url(#") == 0) && (curFill != strokeRef)) {
					dojo.attr(subNode, "fill", strokeRef);
				}
				
				// stroke
				var curStroke = dojo.attr(subNode, "stroke");
				if (curStroke && strokeRef && (curStroke.indexOf("url(#") == 0) && (curStroke != strokeRef)) {
					dojo.attr(subNode, "stroke", strokeRef);
				}
				
			}  // end for
		}
	}
	
};

concord.util.HtmlContent.injectRdomIdsForElement = function(element) {
	if(element!=null) {
			var elementName;
			if(element.tagName!=null){
				elementName = (element.tagName).toLowerCase();
			}else if(element.getName()!=null){
				elementName = (element.getName()).toLowerCase();
			}
    		if(elementName == "br" 
    			&& !dojo.hasClass(element, "hideInIE")
    			&& !dojo.hasClass(element, "text_line-break")
    			&& element.parentNode!=null) { 
    			element.parentNode.removeChild(element);
    		}
    		//alert("elemntName:"+elementName);

    		//do a setTimeout when calling MSGUTIL.getUUID()
    		//to work around the issue of having the same UUID for consecutive elements
    		//somehow there's a timing issue that creates same element id twice
    		var idValue = MSGUTIL.getUUID(); 
    		element.setAttribute("id", idValue );
    		return idValue;
	}
};

concord.util.HtmlContent.getStyleElements = function(document){
	//var styleElementArray = new Array();
	var styleNodeList = document.getElementsByTagName("style");
	return styleNodeList;
};
concord.util.HtmlContent.getLinkElements = function(document){
	//var styleElementArray = new Array();
	var linkNodeList = document.getElementsByTagName("link");
	return linkNodeList;
};

concord.util.HtmlContent.addBackgroundImgFromCssToDiv = function(divElement, windowObj, documentObj){
	if(divElement != null && windowObj !=null ){
		var bgImgCss= "";
		var bgRepeatCss = "";
		
		if(divElement.currentStyle) {
			//IE Opera
			bgImgCss = divElement.currentStyle.backgroundImage;
			bgRepeatCss = divElement.currentStyle.backgroundRepeat;
		}
		else { 
			//Firefox
			if (windowObj.getComputedStyle(divElement,'') != null)
			{
				bgImgCss= windowObj.getComputedStyle(divElement,'').getPropertyValue('background-image');
				bgRepeatCss = windowObj.getComputedStyle(divElement,'').getPropertyValue('background-repeat');
			}
		}
		/*this doesn't work to indicate that the background image in css is a repeat, because 
		 *there is other style that set the background repeat that has nothing to do with the image
		 *need to find other ways for client to know that the background image is a repeat.
		 */
		/*
		if(bgRepeatCss!=null && bgRepeatCss.indexOf("repeat")>=0){
			return;
		}
		*/
		if(bgImgCss !=null && bgImgCss !="" && bgImgCss !="none" && bgImgCss.indexOf(".")>=0){
			var bgImgCssSrc = "";
			if(bgImgCss.indexOf("(\"")>=0){
				var startIdx = bgImgCss.indexOf("(\"");
				var endIdx = bgImgCss.indexOf("\")");
				bgImgCssSrc = bgImgCss.substring(startIdx+2,endIdx);
			}else if(bgImgCss.indexOf("('")>=0){
				var startIdx = bgImgCss.indexOf("('");
				var endIdx = bgImgCss.indexOf("')");
				bgImgCssSrc = bgImgCss.substring(startIdx+2,endIdx);
			}else if(bgImgCss.indexOf("(")>=0){
				var startIdx = bgImgCss.indexOf("(");
				var endIdx = bgImgCss.indexOf(")");
				bgImgCssSrc = bgImgCss.substring(startIdx+1,endIdx);
			}else {
				bgImgCssSrc = bgImgCss;
			}
			//currently bgImgCss contains the absolute path including hostname and port
			//eventhough the url in the css is relative "Pictures/xyz.png", but when queried using javascript code above to get bgImgCss, it returns absolute
			//if it is the document's own attachment, we need to change absolute path to relative path
			//so just in case the document is transferred to another server or the server changes hostname, the url still resolves
			var bgImgCssSrcAbs = bgImgCssSrc;
			if(concord.util.uri.getEditAttRootUri()!=null && concord.util.uri.getEditAttRootUri().length>0){
				var docEditAttRootUri =concord.util.uri.getEditAttRootUri()+"/";
				if(bgImgCssSrc.indexOf(docEditAttRootUri)>=0){
					bgImgCssSrc = bgImgCssSrc.substring(bgImgCssSrc.indexOf(docEditAttRootUri) + docEditAttRootUri.length);
				}
			}
			//if the backgroundImage with absolute url already exist, need to change it to flag the caller to change it to relative path
			//returning img css src info json
			if(bgImgCssSrcAbs!= bgImgCssSrc){
				var bgImageDivsAbs = dojo.query("div.draw_frame.backgroundImage > img", divElement);
				if(bgImageDivsAbs !=null && bgImageDivsAbs.length >0){
					/*
					for(var j=0; j<bgImageDivsAbs.length; j++){
						bgImageDivsAbs[j].src = bgImgCssSrc;
					}
					*/
					var bgImgCssSrcJson = {};
					bgImgCssSrcJson.bgImgCssSrcAbs = bgImgCssSrcAbs;
					bgImgCssSrcJson.bgImgCssSrc = bgImgCssSrc;
					bgImgCssSrcJson.absSrcDivsArray = bgImageDivsAbs;
					return bgImgCssSrcJson;
				}
			}
			
			//check if it already exist
			var bgImageDivs = dojo.query("div.draw_frame.backgroundImage > img", divElement);//[src="+bgImgCssSrc+"]
			if(bgImageDivs == null || bgImageDivs.length == 0){
				//create a div and img element
				var backgroundImgDiv = dojo.query(dojo.create("div",null, divElement,"first")).addClass("draw_frame backgroundImage");
				concord.util.HtmlContent.injectRdomIdsForElement(backgroundImgDiv[0]);

				dojo.style(backgroundImgDiv[0],{
					"position": "absolute",
					"width": "100%",
					"height": "100%",
					"top": "0%",
					"left": "0%"
				});
				
				//create image element
				var imgElem = documentObj.createElement("img");
				concord.util.HtmlContent.injectRdomIdsForElement(imgElem);
				try{
					imgElem.src=bgImgCssSrc;
				}catch(e){
					console.log("addBackgroundImgFromCssToDiv error occur: bgImgCssSrc = "+bgImgCssSrc);
					console.log("addBackgroundImgFromCssToDiv error occur:"+e);
				}
				if((bgRepeatCss!=null && bgRepeatCss.indexOf("repeat")>=0 && bgRepeatCss.indexOf("no-repeat")<0)){ //if it is repeat, we need to set display none, let the background from css coming thru
					dojo.style(imgElem,{
						"width": "100%",
						"height": "100%",
						"display": "none"
					});
				}else{
					dojo.style(imgElem,{
						"width": "100%",
						"height": "100%"
					});
				}
				
				//append to backgroundImageDiv
				backgroundImgDiv[0].appendChild(imgElem);
				
				return backgroundImgDiv[0];
			} else {
				return null;
			}
		}
	}
};
concord.util.HtmlContent.findAncestor= function ( node, comparisonFunc ) {
	if (comparisonFunc(node) == true) 
		return node;
	else if (node.parentNode) {
		return arguments.callee(node.parentNode, comparisonFunc);
	}
	else return false;
};
concord.util.HtmlContent.updateViewUrl = function(htmlString){
	if(htmlString!=null){
		
	}
	
};
//change relative path to concord url with absolute adding a base href (urlPrefixNew)
concord.util.HtmlContent.fixDocumentURL = function(document, urlPrefixNew){
	if(document!=null && urlPrefixNew!=null){
		var head =  document.getElementsByTagName("head")[0];
		var hrefLinks= dojo.query("[href]", document);
		
		var srcLinks  =  dojo.query("[src]", document);
		
		for(var i=0; i<hrefLinks.length; i++){
			var hrefLinksUrl = hrefLinks[i].getAttribute("href");
			//if href doesn't contain "://" and doesn't start with "/", meaning relative path
			if(hrefLinksUrl.indexOf("://")<0 && hrefLinksUrl.indexOf(window.contextPath)!=0 
					&& hrefLinksUrl.indexOf("concordstyles.css")<0 && hrefLinksUrl.indexOf("odpprint.css")<0 && hrefLinksUrl.indexOf("contents.css")<0){
				var hrefLinksUrlNew = urlPrefixNew +"/"+hrefLinksUrl;
				hrefLinks[i].setAttribute("href", hrefLinksUrlNew);
			}
		}
		for(var i=0; i<srcLinks.length; i++){
			var srcLinksUrl = srcLinks[i].getAttribute("src");
			//if src doesn't contain "://" and doesn't start with "/", meaning relative path
			if(srcLinksUrl.indexOf("://")<0 || srcLinksUrl.indexOf("/")!=0){
				var srcLinksUrlNew = urlPrefixNew +"/"+srcLinksUrl;
				srcLinks[i].setAttribute("src", srcLinksUrlNew);
			}
		}
	}
};

concord.util.HtmlContent.addI18nClassToBody=function (body) {

	var classname = new concord.i18n.ClassName();
	var cname = classname.getLangClass();
	if(cname) {
		dojo.addClass(body,cname);
	}
	return cname;

};

concord.util.HtmlContent.temporarilyDetachElement = function(element) {
	var pNode = element.parentNode;
	var nNode = element.nextSibling;
	if (pNode)
		pNode.removeChild(element);
	else
		return null;

	var reinsertElm = function(){
		if (pNode) {
			if (nNode){
				pNode.insertBefore(element, nNode);
			}else {
				pNode.appendChild(element);
			}
		}
	};

	return reinsertElm;
};

