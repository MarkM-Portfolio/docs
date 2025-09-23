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
    "writer/model/prop/TableProperty",
    "writer/model/prop/TableCommonProperty"
], function(lang, tools, TableProperty, TableCommonProperty) {

    var RowProperty = function(json, row) {
        this.row = row;
        if (!json) {
            return;
        }
        this.tblHeaderRepeat = "none";
        //	this.json = json;
        if (json.tblHeader && json.tblHeader == "1")
            this.tblHeaderRepeat = true;
        json.cnfStyle && this.initConditionStyle(json.cnfStyle);
        json.trHeight && this.initHeight(json.trHeight);
        this.tableProperty = null;
    };
    RowProperty.prototype = {
        getTableProperty: function() {
            if (this.row) {
                return this.row.parent.getProperty();
            }
        },
        getTblHeaderRepeat: function() {
            return this.tblHeaderRepeat == true ? true : "none";
        },
        setTblHeaderRepeat: function(value) {
            if (value != null && value != this.getTblHeaderRepeat()) {
                this.tblHeaderRepeat = value;
            }
        },
        toJson: function() {
            var json = {};
            if (this.conditionStyle) {
                json.cnfStyle = lang.clone(this.conditionStyle);
            }
            if (this.h != null && this.h > 0) {
                json.trHeight = tools.PxToPt(this.h) + "pt";
            }
            if (this.tblHeaderRepeat == true)
                json.tblHeader = "1";
            if (tools.isEmpty(json)) {
                return null;
            }
            return json;
        },
        initHeight: function(value) {
            this.h = tools.toPxValue(value);
        },
        setHeight: function(h) {
            this.h = h;
        }
    };
    tools.extend(RowProperty.prototype, new TableCommonProperty());
    return RowProperty;
});
