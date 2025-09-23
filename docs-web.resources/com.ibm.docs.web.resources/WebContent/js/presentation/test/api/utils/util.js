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

dojo.provide("pres.test.api.utils.util");
dojo.require("concord.pres.TextMsg");
pres.test.api.utils.util = {

	compareElement: function(element1, element2)
	{
		var bIsEqual = false;
		if(element1.getFamily() == element2.getFamily()) {
			if(app.dojo.number.round(element1.w, 4) == app.dojo.number.round(element2.w, 4)
    				&& app.dojo.number.round(element1.h, 4) == app.dojo.number.round(element2.h, 4)
    				&& app.dojo.number.round(element1.t, 4) == app.dojo.number.round(element2.t, 4) 
    				&& app.dojo.number.round(element1.l, 4) == app.dojo.number.round(element2.l, 4)
    				&& app.dojo.number.round(element1.z, 4) == app.dojo.number.round(element2.z, 4)) {
				if(element1.getFamily() != "graphic") {
					var div1 = app.dojo.create("div", {
						innerHTML: element1.getHTML()
					});
					var div2 = app.dojo.create("div", {
						innerHTML: element2.getHTML()
					});
					if (div1.textContent == div2.textContent)
						bIsEqual = true;
				} else {
					bIsEqual = true;
				}
    		}
		}
		return bIsEqual;
	},

	
	compareElements: function(elements1, elements2)
	{
		return this.compareArrays(elements1, elements2, this.compareElement);
	},
	
	compareArrays: function(elements1, elements2, compareFunction)
	{
		var length1 = elements1.length;
		var length2 = elements2.length;
		if (length1 != length2)
			return false;
		var bIsAllEqual = true;
		for (var i = 0; i < length1; i++) {
			var element = elements1[i];
			var bIsEqual = false;
			for (var j = 0; j < length2; j++) {
				var ele = elements2[j];
				bIsEqual = compareFunction(element, ele);
				if (bIsEqual)
					break;
			}
			if(!bIsEqual) {
				bIsAllEqual = false;
	    		 break;
	    	}
		}
		return bIsAllEqual;
	},
	
	compareNodes: function(nodes1, nodes2)
	{
		return this.compareArrays(nodes1, nodes2, this.compareDomNode);
	},
	compareDomNode: function(node1, node2)
	{
		var bIsEqual = false;
		if(app.dojo.attr(node1,'presentation_class') == app.dojo.attr(node2,'presentation_class')) {
			if(app.dojo.number.round(parseFloat(node1.style.top)/100, 4) == app.dojo.number.round(parseFloat(node2.style.top)/100, 4)
    				&& app.dojo.number.round(parseFloat(node1.style.left)/100, 4) == app.dojo.number.round(parseFloat(node2.style.left)/100, 4)
    				&& app.dojo.number.round(parseFloat(node1.style.width)/100, 4) == app.dojo.number.round(parseFloat(node2.style.width)/100, 4) 
    				&& app.dojo.number.round(parseFloat(node1.style.height)/100, 4) == app.dojo.number.round(parseFloat(node2.style.height)/100, 4)
    				) {
				if(app.dojo.attr(node1,'presentation_class') != "graphic") {
					if (pres.test.api.utils.util.getNodeTextContent(node1) == pres.test.api.utils.util.getNodeTextContent(node2))
						bIsEqual = true;
				} else {
					bIsEqual = true;
				}
    		}
		}
		return bIsEqual;
	},
	undo: function() {
		app.dojo.publish("/command/exec", [app.pres.constants.CMD_UNDO]);
	},
	
	redo: function() {
		app.dojo.publish("/command/exec", [app.pres.constants.CMD_REDO]);
	},
	
	getNodeTextContent: function(node)
	{
		return TEXTMSG.getTextContent(node);
	},
	reload: function(deferred)
	{
		app.location.reload(true);
	},
	verifyWhenLoadFinished: function(callback, deferred)
	{
		var def = deferred || new app.dojo.Deferred();
		def.addCallback(callback);
		var waitForApp = setInterval(function() {
			if (app.pe && app.pe.scene && app.pe.scene.bLoadFinished && !app.concord.net.Beater._stopped) {
				clearInterval(waitForApp);
				def.callback();
			}
		}, 100);
		return def;
	}

}