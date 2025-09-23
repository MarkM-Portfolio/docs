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
    "writer/common/Container",
    "writer/common/tools",
    "writer/constants",
    "writer/model/notes/FootNote",
    "writer/model/update/BlockContainer"
], function(Container, tools, constants, FootNote, BlockContainer) {

    var EndNote = function(json) {
        if (!json) {
            console.error("the json source can not be null!");
            return;
        }
        this.container = new Container(this);
        this.fromJson(json);
    };
    EndNote.prototype = {
        modelType: constants.MODELTYPE.ENDNOTE
    };
    tools.extend(EndNote.prototype, new FootNote());
    return EndNote;
});
