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
define([
    "dojo/dom-style",
    "dojo/i18n!writer/nls/lang",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/string",
    "dojo/topic",
    "writer/constants",
    "writer/core/Event"
], function(domStyle, i18nlang, lang, dom, domConstruct, string, topic, constants, Event) {

    (function() {
        var displayNode = null;
        var displayTimer = null;
        var displayFunc = function(curPageNum, totalPageNum) {
            if (pe.scene.isHTMLViewMode())
                return;

            var nls = i18nlang;
            var pageNumberStr = nls.PAGE_NUMBER;

            var editorNode = dom.byId("editorFrame");
            var left = (editorNode.clientWidth - 90 - 30) + "px";
            if (concord.util.browser.isIOSBrowser()) {
            	// on ios browser just use document width
                left = (document.body.clientWidth -90 -30) + "px";
            }

            if (displayNode == null) {
                var mainNode = dom.byId('mainNode');
                displayNode = domConstruct.create('div', null, mainNode);
                displayNode.id = "PageInfo";
                displayNode.className = 'PageInfo';
                domStyle.set(displayNode, {
                    "position": "absolute",
                    "paddingLeft": "5px",
                    "left": left,
                    "bottom": "20px",
                    "width": "90px",
                    "background": "#ffffff",
                    "boxShadow": "2px 2px #a0a0a0"
                });
            }

            var displayNum = string.substitute(pageNumberStr, {
                'pageNumber': curPageNum,
                'totalPageNumber': totalPageNum
            });
            if (BidiUtils.isArabicLocale()) {
            	displayNum = BidiUtils.convertArabicToHindi(displayNum);
            }
            displayNode.innerHTML = displayNum;
            domStyle.set(displayNode, {
                "display": "",
                "left": left
            });

            if (displayTimer)
                clearTimeout(displayTimer);

            displayTimer = setTimeout(function() {
                displayTimer = null;
                domStyle.set(displayNode, "display", "none");
            }, 2000);
        };

        topic.subscribe(constants.EVENT.SCROLLPAGE, displayFunc);

    })();

});
