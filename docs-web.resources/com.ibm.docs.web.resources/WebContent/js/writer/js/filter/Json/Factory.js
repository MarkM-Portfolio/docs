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
    "writer/filter/Json/Cell",
    "writer/filter/Json/Div",
    "writer/filter/Json/Paragraph",
    "writer/filter/Json/RichText",
    "writer/filter/Json/Row",
    "writer/filter/Json/Table",
    "writer/global"
], function(declare, Cell, Div, Paragraph, RichText, Row, Table, global) {

    var Factory = {

        createBlock: function(json) {
            if (json.t == null && json.c) {
                //rich text
                return new RichText(json);
            }

            switch (json.t) {
                case 'p':
                    return new Paragraph(json);
                    break;
                case 'tbl':
                    return new Table(json);
                    break;
                case 'tr':
                    return new Row(json);
                    break;
                case 'tc':
                    return new Cell(json);
                    break;
                case "sdt":
                    return new Div(json);
                    // todo:
                    break;
            }
        }
    };
    
    global.copy_json_factory = Factory;
    return Factory;
});
