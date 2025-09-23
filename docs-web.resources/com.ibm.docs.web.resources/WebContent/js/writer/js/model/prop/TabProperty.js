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
    "dojo/_base/lang",
    "writer/common/tools",
    "writer/model/prop/Property"
], function(lang, tools, Property) {

    var TabProperty = function(json) {
        if (json && json.length > 0) {
            this.tabs = json;
        } else {
            this.tabs = [];
        }

        this.init();
    };
    TabProperty.prototype = {
        type: Property.TAB_PROPERTY,
        init: function() {
            var length = this.tabs.length;
            for (var i = 0; i < length; i++) {
                if (this.tabs[i].unit != 'px') {
                    //TODO: convertion should make sure that the unit is converted
                    var pos;
                    if ((/^([\+|-]?[\d|\.]*e?[\+|-]?\d+)(pc|px|pt|em|cm|in|mm|emu)$/i).test(this.tabs[i].pos))
                        pos = tools.toPxValue(this.tabs[i].pos);
                    else
                        pos = tools.toPxValue(parseFloat(this.tabs[i].pos) + 'pt');

                    this.tabs[i].pos = Math.floor(pos);
                    this.tabs[i].unit = "px";
                }
            }
        },

        getTabsJson: function() {
            return this.tabs;
        },

        getTab: function(offsetLeft) {
            for (var i = 0; i < this.tabs.length; i++) {
                // Defect 40530. The offset less than 1 px
                // this.tabs[i].pos != offsetLeft for defect 41794: [tab stop]tab in header not show correct
                if ((this.tabs[i].pos > offsetLeft || (Math.abs(this.tabs[i].pos - offsetLeft) < 1) && this.tabs[i].pos != offsetLeft) && this.tabs[i].val != "clear") {
                    return this.tabs[i];
                }
            }
        },
        toJson: function() {
            var ret = [];
            for (var i = 0; i < this.tabs.length; i++) {
                var tab = this.tabs[i];
                var cloneTab = lang.clone(tab);
                if (cloneTab.unit == "px") {
                    cloneTab.unit = "pt";
                    cloneTab.pos = tools.toPtValue(cloneTab.pos + "px") + "pt";
                }
                delete cloneTab.unit;
                ret.push(cloneTab);
            }
            return ret;
        }
    };
    return TabProperty;
});
