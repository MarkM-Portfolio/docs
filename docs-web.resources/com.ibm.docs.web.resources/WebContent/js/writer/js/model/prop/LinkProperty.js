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
    "writer/model/prop/Property"
], function(Property) {

    var LinkProperty = function(json, hint) {
        //	this.source = json;
        this.hint = hint;
        this.paragraph = hint && hint.paragraph;
        this.init();
    };
    LinkProperty.prototype = {
        type: Property.LINK_PROPERTY,
        init: function() {

        }
    };

    return LinkProperty;
});
