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
    "writer/model/text/AltContent",
    "writer/model/text/BookMark",
    "writer/model/text/Canvas",
    "writer/model/text/Field",
    "writer/model/text/Image",
    "writer/model/text/Link",
    "writer/model/text/REndNote",
    "writer/model/text/RFootNote",
    "writer/model/text/TextBox",
    "writer/model/text/TextRun",
    "writer/model/text/TrackDeletedObjs",
    "writer/model/text/TrackOverRef",
    "writer/constants",
    "dojo/_base/lang",
    "writer/global"
], function(AltContent, BookMark, Canvas, Field, Image, Link, REndNote, RFootNote, TextBox, TextRun, TrackDeletedObjs, TrackOverRef, constants, lang, global) {
    var Run = {};
    Run.createRun = function(attJson, owner) {
        var type = attJson.rt;
        if (!type) //Simple field only have t?
            type = attJson.t;

        var proType = constants.RUNMODEL;
        switch (type) {
            case proType.TEXT_Run:
                if (attJson.AlternateContent)
                    return new AltContent(attJson, owner);
                else
                    return new TextRun(attJson, owner);
                break;
            case proType.LINK_Run:
                return new Link(attJson, owner);
            case proType.IMAGE:
            case proType.SMARTART:
                return new Image(attJson, owner);
            case proType.TXBX:
                return new TextBox(attJson, owner);
            case proType.CANVAS:
            case proType.GROUP:
                return new Canvas(attJson, owner);
            case proType.FIELD_Run:
            case proType.SIMPLE_FIELD_Run:
                return new Field(attJson, owner);
            case proType.BOOKMARK:
                return new BookMark(attJson, owner);
            case proType.FOOTNOTE:
                return new RFootNote(attJson, owner);
            case proType.ENDNOTE:
                return new REndNote(attJson, owner);
            case proType.TRACKDELETEDOBJS:
                return new TrackDeletedObjs(attJson, owner);
            case proType.TRACKOVERREF:
                return new TrackOverRef(attJson, owner);
        };
        return null;
    };

    global.runFac = Run;

    return Run;

});
