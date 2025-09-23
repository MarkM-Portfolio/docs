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
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/has",
    "dojo/_base/window",
], function(declare, domConstruct, domStyle, domClass, has, windowModule) {

    var Base = declare("writer.view.selection.Base", null, {

        _selectLayer: 10,
        _domNode: null,
        _coEditColor: null,
        destroy: function() {
            if (this._domNode)
                domConstruct.destroy(this._domNode);
        },

        constructor: function(createParam) {
            if (createParam)
                this._coEditColor = createParam.coEditColor;
        },

        highLight: function(b) {
            var opacity = 0.20;
            var color = null;
            if (has("ff") && domClass.contains(windowModule.body(), "dijit_a11y"))
                opacity = 0.80;
            if (!b) {
                color = this._coEditColor ? this._coEditColor : '#36c';
            } else if (b == 'find') {
                domStyle.set(this._domNode, 'borderRadius', '2px 2px 2px 2px');
                color = '#FF00FF';
            } else {
                color = '#aaa';
            }
            domStyle.set(this._domNode, 'backgroundColor', this.color(color, opacity));
        },
        isPointInSelection: function(pt) {
            if (!this._domNode) return false;

            var rect = this._domNode.getBoundingClientRect();

            if (pt.x >= (rect.left - 0.5) && pt.x <= (rect.left + rect.width + 0.5) &&
                pt.y >= (rect.top - 0.5) && pt.y <= (rect.top + rect.height + 0.5))
                return true;
            else
                return false;
        },
        // update hex color to rgba(111,111,111, 0.20)
        color: function(hex, opacity) {
            var sColor = hex.toLowerCase();
            if (sColor) { 
                if(sColor.length === 4) { 
                    var sColorNew = "#"; 
                    for(var i=1; i<4; i+=1){ 
                        sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1)); 
                    } 
                    sColor = sColorNew; 
                } 
                var sColorChange = []; 
                for(var i=1; i<7; i+=2){ 
                    sColorChange.push(parseInt("0x"+sColor.slice(i,i+2))); 
                } 
                return "rgba(" + sColorChange.join(",")+","+opacity + ")"; 
            }else{ 
                return sColor; 
            }
            
        }
    });
    return Base;
});
