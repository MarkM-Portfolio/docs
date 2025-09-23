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
    "writer/filter/htmlParser/JsonWriter",
    "writer/msg/msgHelper",
    "writer/global"
], function(declare, JsonWriter, msgHelper, global) {

    var cell = declare("writer.filter.htmlParser.cell", JsonWriter, {
        constructor: function(element) {
            element.getColspan = function() {
                return parseInt(this.attributes.colspan || 1);
            };

            element.getRowspan = function() {
                return parseInt(this.attributes.rowspan || 1);
            };
        },

        toJson: function() {
            var tc = {};
            tc.t = "tc";
            tc.id = msgHelper.getUUID();
            tc.tcPr = {};
            var value;
            if (value = this.element.getStyle()["background-color"]) {
                if (value.indexOf("#") == 0)
                    value = value.substring(1);
                tc.tcPr.shd = {
                    "fill": value,
                    "color": "auto"
                };
            }
            var colspan = this.element.getColspan();
            if (colspan != 1)
                tc.tcPr.gridSpan = {
                    "val": colspan
                };
            var rowspan = this.element.getRowspan();
            if (rowspan != 1)
                tc.tcPr.vMerge = {
                    "val": "restart"
                };

            tc.ps = JsonWriter.prototype.writeBlockContentsJson.apply(this);
            if (tc.ps.length == 0) {
                var Ele = global.filterEle;
                var p = new Ele("p");
                tc.ps.push(p.writeJson());
            }
            return tc;
        },
        /**
         * get width
         * @returns
         */
        getWidth: function() {
            if (this.width == null) {
                var width = this.element.getStyle().width,
                    unit, tmp;
                if (width && (tmp = width.toLowerCase().match(/^(-?[\d|\.]*)(pc|px|pt|em|cm|in|mm|emu|%)$/i))) {
                    width = tmp[1];
                    unit = tmp[2];
                    this.width = {
                        "val": width,
                        "unit": unit
                    };
                }
            }
            return this.width;
        }
    });


    return cell;
});
