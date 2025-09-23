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

    var row = declare("writer.filter.htmlParser.row", JsonWriter, {
        toJson: function(fillCells, colCount) {
            var elementModule = global.filterEle;
            if (this.element && !this.element.parent.name)
            //tr in root ??
            //not fixed.
                return {};

            var retVal = {};
            retVal.id = msgHelper.getUUID();
            retVal.t = "tr";
            retVal.trPr = {};
            retVal.tcs = [];
            var element = this.element;
            if (element.children.length == 0)
                element.children.push(new elementModule("td"));

            var colIndex = 0;
            for (var i = 0; i < element.children.length; i++) {
                if (fillCells && fillCells[colIndex]) {
                    retVal.tcs.push(fillCells[colIndex].cell);
                    colIndex += fillCells[colIndex].colspan;
                }
                retVal.tcs.push(element.children[i].writeJson());
                colIndex += element.children[i].getColspan();
            }

            var cellJson;
            for (var j = colIndex; j < colCount;) {
                if (fillCells && fillCells[j]) {
                    retVal.tcs.push(fillCells[colIndex].cell);
                    j += fillCells[colIndex].colspan;
                } else {
                    if (!cellJson) cellJson = (new elementModule("td")).writeJson();
                    retVal.tcs.push(cellJson);
                    j++;
                }
            }
            return retVal;
        }
    });


    return row;
});
