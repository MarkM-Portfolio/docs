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
    "dojo/_base/declare",
    "dojo/dom-style",
    "writer/ui/widget/MobileIndicator"
], function(declare, domStyle, MobileIndicator) {

    var MobileIndicatorManager = declare("writer.controller.MobileIndicatorManager",
        null, {
            _mobileIndicators: null,
            _newSelectionLayer: 11,
            constructor: function(createParam) {
                this._mobileIndicators = [];
            },
            //for cursor
            createCursorIndicator: function(shell, parentNode, visible) {
                if (shell && parentNode) {
                    var mobileCursorIndicator = new MobileIndicator({
                        shell: shell,
                        relatedNode: parentNode,
                        visible: visible
                    });
                    return mobileCursorIndicator;
                } else 
                    console.error("failed to create mobile cursor indicator");
                
            },
            // for selection
            showIndicator: function(startSelect, endSelect) {

                if (startSelect && startSelect._domNode)
                    this.createIndicator(startSelect._domNode, true);
                if (endSelect && endSelect._domNode)
                    this.createIndicator(endSelect._domNode, false);
            },            
            createIndicator: function(brotherNode, isLeft) {
                var width = brotherNode.style.width;
                var height = brotherNode.style.height;
                var pTop = brotherNode.style.top;
                var pLeft = brotherNode.style.left;
                var top =  this.getNumber(height)+ this.getNumber(pTop);               
                var left = this.getNumber(pLeft) + (isLeft? 0 : this.getNumber(width));
                    var mobileSelect = new MobileIndicator({
                        shell: pe.lotusEditor._shell,
                        relatedNode: brotherNode,
                        isSelection: true,
                        visible: true,
                        isLeft: isLeft,
                        top: top,
                        left: left
                    });
                    this._mobileIndicators.push(mobileSelect);
            },
            getNumber: function(strWithPX) {
                var num = strWithPX.substring(0, strWithPX.length - 2);
                return parseInt(num, 10);
            },
            destroy: function() {
                var indicator;
                while (this._mobileIndicators.length > 0) {
                    indicator = this._mobileIndicators.pop();
                    indicator.destroy();
                }
                this._mobileIndicators = [];
            }

        });

    return MobileIndicatorManager;
});
