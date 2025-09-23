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

dojo.provide("pres.utils.htmlHelper");

pres.utils.htmlHelper = {

	getNativeSel: function(document)
	{
		var sel = null;
		if (window.getSelection)
		{
			sel = window.getSelection();
		}
		if (!sel && document.selection)
			sel = document.selection;
		return sel;
	},

	clearNativeSel: function(document)
	{
		var sel = this.getNativeSel(document);
		if (sel)
			sel.removeAllRanges();
	},

	fromHTML : function(s)
	{
		var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
		var translate = {
			"nbsp" : " ",
			"amp" : "&",
			"quot" : "\"",
			"lt" : "<",
			"gt" : ">"
		};
		return (s.replace(translate_re, function(match, entity)
		{
			return translate[entity];
		}));
	},

	toHTML : function(t)
	{
		t = t.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/\"/gm, "&quot;").replace(/ /g, "&nbsp;");
		return t;
	},
    
    setSelectable: function(node, selectable){
    	if(dojo.isChrome){
    		node.style.WebkitUserSelect = selectable ? "auto" : "none";
    	}else{
    		dojo.setSelectable(node, selectable);
    	}
    },
    
	extractStyle: function(styleStr)
	{
		styleStr = styleStr || '';
		var style = {};
		var arr = styleStr.split(";");
		dojo.forEach(arr, function(a)
		{
			if (a.indexOf(":") > 0)
			{
				var kv = a.split(":");
				if (kv.length == 2 && kv[0] && kv[1])
				{
					style[dojo.trim(kv[0])] = dojo.trim(kv[1]);
				}
			}
		});
		return style;
	},
	
	stringStyle: function(styleArr)
	{
		var value = "";
		for ( var s in styleArr)
		{
			if (value)
				value += ";";
			value += s + ":" + styleArr[s];
		}
		return value;
	},
	
	removeTabIndex: function(dom)
	{
		if (dom)
		{
			dom.removeAttribute("tabIndex");
			dojo.forEach(dojo.query("[tabIndex]", dom), function(z){z.removeAttribute("tabIndex");});
			dojo.forEach(dojo.query("a", dom), function(z){z.setAttribute("tabIndex","-1");});
		}
	},
	
	blockContentImage : function(str, viewerSnapshotId)
	{
		var temStr=str;
		if(viewerSnapshotId){
			temStr=temStr.replace('src="'+viewerSnapshotId+'\/Pictures','src="Pictures');
			temStr=temStr.replace('href="'+viewerSnapshotId+'\/Pictures','href="Pictures');	
		}
		var sidRegxp=/<img(.*?)src=['"]Pictures\/(.*?)>/ig;
		var img=sidRegxp.exec(temStr);
		sidRegxp.lastIndex=0;
		while(img!=null)
		{
			var imgNode=img[0];
			var imgAttrReg=/src=['"]Pictures\/(.*?)['"]/ig;
			var imgAttr=imgAttrReg.exec(imgNode);
			imgAttrReg.lastIndex=0;
			while(imgAttr!=null){
				var imgAttrStr=imgAttr[0];
				imgAttrStr= "data-" + imgAttrStr;
				if(viewerSnapshotId){
					imgAttrStr=imgAttrStr.replace('src="Pictures','src="'+viewerSnapshotId+'\/Pictures');
				}
				imgNode=imgNode.replace(imgAttr[0],imgAttrStr);
				imgAttrReg.lastIndex=imgAttr.index+imgAttr[0].length;
				imgAttr=imgAttrReg.exec(imgNode);
			}
			temStr=temStr.replace(img[0],imgNode);
			sidRegxp.lastIndex=img.index+img[0].length;
			img=sidRegxp.exec(temStr);
		}
		// for svg
		var sidRegxp=/<image(.*?)href=['"]Pictures\/(.*?)>/ig;
		var img=sidRegxp.exec(temStr);
		sidRegxp.lastIndex=0;
		while(img!=null)
		{
			var imgNode=img[0];
			var imgAttrReg=/href=['"]Pictures\/(.*?)['"]/ig;
			var imgAttr=imgAttrReg.exec(imgNode);
			imgAttrReg.lastIndex=0;
			while(imgAttr!=null){
				var imgAttrStr=imgAttr[0];
				imgAttrStr= "data-" + imgAttrStr;
				if(viewerSnapshotId){
					imgAttrStr=imgAttrStr.replace('href="Pictures','href="'+viewerSnapshotId+'\/Pictures');	
				}
				imgNode=imgNode.replace(imgAttr[0],imgAttrStr);
				imgAttrReg.lastIndex=imgAttr.index+imgAttr[0].length;
				imgAttr=imgAttrReg.exec(imgNode);
			}
			temStr=temStr.replace(img[0],imgNode);
			sidRegxp.lastIndex=img.index+img[0].length;
			img=sidRegxp.exec(temStr);
		}
		
		return temStr;
	},
	loadContentImage : function(str, viewerSnapshotId)
	{
		var temStr=str;
		if(viewerSnapshotId){
			temStr=temStr.replace('src="'+viewerSnapshotId+'\/Pictures','src="Pictures');
			temStr=temStr.replace('href="'+viewerSnapshotId+'\/Pictures','href="Pictures');	
		}
		var sidRegxp=/<img(.*?)data-src=['"]Pictures\/(.*?)>/ig;
		var img=sidRegxp.exec(temStr);
		sidRegxp.lastIndex=0;
		while(img!=null)
		{
			var imgNode=img[0];
			var imgAttrReg=/data-src=['"]Pictures\/(.*?)['"]/ig;
			var imgAttr=imgAttrReg.exec(imgNode);
			imgAttrReg.lastIndex=0;
			while(imgAttr!=null){
				var imgAttrStr=imgAttr[0];
				imgAttrStr = imgAttrStr.substring(5);
				if(viewerSnapshotId){
					imgAttrStr=imgAttrStr.replace('src="Pictures','src="'+viewerSnapshotId+'\/Pictures');
				}
				imgNode=imgNode.replace(imgAttr[0],imgAttrStr);
				imgAttrReg.lastIndex=imgAttr.index+imgAttr[0].length;
				imgAttr=imgAttrReg.exec(imgNode);
			}
			temStr=temStr.replace(img[0],imgNode);
			sidRegxp.lastIndex=img.index+img[0].length;
			img=sidRegxp.exec(temStr);
		}
		
		// for svg
		var sidRegxp=/<image(.*?)data-href=['"]Pictures\/(.*?)>/ig;
		var img=sidRegxp.exec(temStr);
		sidRegxp.lastIndex=0;
		while(img!=null)
		{
			var imgNode=img[0];
			var imgAttrReg=/data-href=['"]Pictures\/(.*?)['"]/ig;
			var imgAttr=imgAttrReg.exec(imgNode);
			imgAttrReg.lastIndex=0;
			while(imgAttr!=null){
				var imgAttrStr=imgAttr[0];
				imgAttrStr = imgAttrStr.substring(5);
				if(viewerSnapshotId){
					imgAttrStr=imgAttrStr.replace('href="Pictures','href="'+viewerSnapshotId+'\/Pictures');	
				}
				imgNode=imgNode.replace(imgAttr[0],imgAttrStr);
				imgAttrReg.lastIndex=imgAttr.index+imgAttr[0].length;
				imgAttr=imgAttrReg.exec(imgNode);
			}
			//IE specific issue: Wrong prefix NS1 is added to xlink:href by node.innerHTML,
			//the image will be unavailable in this case, need to be removed
			if(dojo.isIE)
				imgNode = imgNode.replace(/NS1:xlink/ig, 'xlink');
			temStr=temStr.replace(img[0],imgNode);
			sidRegxp.lastIndex=img.index+img[0].length;
			img=sidRegxp.exec(temStr);
		}
		return temStr;
	}
}
