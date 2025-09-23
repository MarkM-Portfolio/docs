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
    "writer/model/DocPartObjFactory",
    "writer/model/Paragraph",
    "writer/model/table/Table",
    "writer/model/table/Row",
    "writer/model/table/Cell",
    "writer/model/notes/FootNote",
    "writer/global"
], function(declare, DocPartObjFactory, Paragraph, Table, Row, Cell, FootNote, global) {

    var FactoryProto = declare("writer.model.Factory", null, {
        docPartObjFactory: new DocPartObjFactory(),

        createModel: function(json, doc) {
            switch (json.t) {
                case 'p':
                    //          if( json.pPr && ( json.pPr.styleId== "Header" || json.pPr.styleId== "Footer" ) ) 
                    //              delete json.pPr.styleId;
                    return new Paragraph(json, doc, true);
                    break;
                case 'tbl':
                    return new Table(json, doc);
                    break;
                case "sdt":
                    //if it is toc
                    return this.docPartObjFactory.createModel(json, doc, this);
                    break;
                case "tr":
                    return new Row(json, doc);
                case "tc":
                    return new Cell(json, doc, doc.parent);
                    break;
                case "fn":
                    return new FootNote(json);
                    break;
            }
        }
    });

    var fac = new FactoryProto();
    global.modelFac = fac;
    
    return fac;
});
