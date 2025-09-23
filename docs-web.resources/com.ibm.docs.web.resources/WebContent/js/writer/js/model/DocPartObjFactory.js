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
    "writer/common/Container",
    "writer/model/Toc"
], function(declare, Container, Toc) {

    var DocPartObjFactory = declare("writer.model.DocPartObjFactory", null, {
        createModel: function(json, doc, modelfactory) {
            if (json.t != "sdt")
                return null;
            var sdr = json.sdtPr,
                type = sdr && sdr.docPartObj && sdr.docPartObj.docPartGallery && sdr.docPartObj.docPartGallery.val;

            switch (type) {
                case "Table of Contents":
                    return new Toc(json, doc);
                    break;
                default:
                    {
                        var content = json.sdtContent,
                            ret = new Container(this);
                        for (var i = 0; i < content.length; i++) {
                            if (content[i].t == "e" || content[i].t == "s")
                                continue;
                            if (content[i].t == "p" && (content[i].pPr && content[i].pPr.styleId == "Header" || content[i].pPr && content[i].pPr.styleId == "Footer"))
                                delete content[i].pPr.styleId;

                            var m = modelfactory.createModel(content[i], doc);
                            if (m && m.isContainer)
                                ret.appendAll(m);
                            else if (m)
                                ret.append(m);
                        }
                        return ret;
                    }
                    break;
            }
            return null;
        }
    });
    return DocPartObjFactory;
});
