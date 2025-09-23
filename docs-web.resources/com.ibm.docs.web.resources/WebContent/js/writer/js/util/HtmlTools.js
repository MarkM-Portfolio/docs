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
define(["dojo/query", "dojo/has"], function (query, has) {

    var spaces = /\s+/;
    var HtmlTools = {
        str2array: function (s) {
            if (!s) {
                return [];
            }
            var a = s.split(spaces);
            if (a.length && !a[0]) {
                a.shift();
            }
            if (a.length && !a[a.length - 1]) {
                a.pop();
            }
            return a;
        },

        writerCss: function (doc, id, style, overwrite) {
            var head, css;
            query('head', doc).some(function (oNode) {
                head = oNode;
                return true;
            });
            query('style[type=\"text/css\"][id="' + id + '"]', head).some(function (oNode) {
                css = oNode;
                if (overwrite) {
                    if (has("ie") && has("ie") < 11) {
                        css.styleSheet.cssText = "";
                    } else {
                        css.innerHTML = "";
                    }
                }
                return true;
            });
            if (!css) {
                if (has("ie") || has("trident")) {
                    css = doc.createElement('style');
                    css.setAttribute('type', 'text/css');
                    css.id = id;
                    head.appendChild(css);
                } else {
                    css = doc.createElement("style");
                    css.type = "text/css";
                    css.id = id;
                    head.appendChild(css);
                }
            }
            var cssStr;
            if (has("ie") && has("ie") < 11) {
                cssStr = css.styleSheet.cssText + style;
                css.styleSheet.cssText = cssStr;
            } else {
                cssStr = css.innerHTML + style;
                css.innerHTML = cssStr;
            }
        },

        getRootNode: function(domNode){
        	if(domNode){
        		if(domNode.getRootNode)
        			return domNode.getRootNode();
        		else {
        			var parent = domNode.parentNode;
        			while(domNode && parent){
        				domNode = parent;
        				parent = domNode.parentNode;
        			}
        			return domNode;
        		}
        	}
        }
    };

    return HtmlTools;
});
