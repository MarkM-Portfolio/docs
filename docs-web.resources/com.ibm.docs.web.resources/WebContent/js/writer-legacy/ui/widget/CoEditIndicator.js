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

dojo.provide("writer.ui.widget.CoEditIndicator");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Tooltip");
dojo.declare('writer.ui.widget.CoEditIndicator', [dijit._Widget, dijit._Templated], {

    userId: null,
    label: null,
    forCursor: true,

    templateString: dojo.cache("writer.ui.widget", "templates/CoEditIndicator.html"),

    postCreate: function() {
        this.inherited(arguments);
        this.domNode.style.display = "none";
        this.ownerDocumentBody.appendChild(this.domNode);
        if (!this.forCursor)
        	dojo.addClass(this.domNode, "forLine");
        else
        	dojo.addClass(this.domNode, "forCursor");
    },

    show: function(target, line) {
    	
    	if (!target || dojo.style(target, "display") == "none" || !target.parentNode)
		{
			return;
		}
    	
        dojo.withDoc(this.ownerDocument, function() {
            var pos = dojo.coords(target, true);
            this.domNode.style.position = "absolute";
            this.domNode.style.visibility = "hidden";
            this.domNode.style.display = "";
            var myHalfHeight = 10;
            if (this.forCursor) {
        		this.domNode.style.left = (pos.l + 3) + "px";
        		this.domNode.style.top = pos.t + pos.h/ 2 - myHalfHeight + "px";
            } else {
            	var scale = pe.lotusEditor.getScale() || 1;
            	var pos2 = dojo.coords(line, true);
            	var padding = 10;
            	if (scale != 1)
            	{
            		pos.x = (pos.x - padding) / scale + padding;
            		pos2.y = (pos2.y - padding) / scale + padding;
           		}
                this.domNode.style.left = (pos.x - this.domNode.offsetWidth - 20) + "px";
                this.domNode.style.top = pos2.y + pos2.h / 2 - myHalfHeight + "px";
            }
            this.domNode.style.visibility = "visible";
        }, this);
    },

    hide: function(aroundNode) {
       this.domNode.style.display = "none";
    }

});
