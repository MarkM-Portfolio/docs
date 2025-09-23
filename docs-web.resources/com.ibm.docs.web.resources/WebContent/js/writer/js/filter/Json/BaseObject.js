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
    "dojo/_base/declare"
], function(declare) {

    var BaseObject = declare("writer.filter.Json.BaseObject", null, {
        htmlString: "",
        json: null,

        constructor: function(json) {
            this.json = json;
        },

        toHtml: function() {
            console.warn("this function need to be implemented!");
            return "";
        }
    });
    return BaseObject;
});
