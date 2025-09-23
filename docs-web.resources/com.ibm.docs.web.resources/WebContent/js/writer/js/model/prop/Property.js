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
define(["dojo/_base/lang"], function(lang) {

    var Property = lang.mixin(lang.getObject("writer.model.prop.Property", true), {
        TEXT_PROPERTY: "rPr",
        PARAGRAPH_PROPERTY: "pPr",
        BOOKMARK_PROPERTY: "bmk", // Enclosed or not. should remove continuous <bmk start><bmk end>
        COMMENTS_PROPERTY: "cmt",
        REVISION_PROPERTY: "rev",
        FIELD_PROPERTY: "fld",
        LINK_PROPERTY: "lnk",

        // Compound property include: comments, revision, field and link
        COMPOUND_PROPERTY: "cpd",
        TAB_PROPERTY: "tabs",
        TABLE_PROPERTY: "tblPr",
        CELL_PROPERTY: "tcPr"
    });
    return Property;
});
