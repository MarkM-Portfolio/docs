/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
define([
    "dojo/_base/declare",
    "writer/constants",
    "writer/core/Range",
    "writer/plugins/Plugin",
    "writer/util/ModelTools"
], function(declare, constants, Range, Plugin, ModelTools) {

    var PrintHtml = declare("writer.plugins.PrintHTML", Plugin, {
        init: function() {
            //init commands
            var printHtmlCmd = {
                exec: function() {
                    pe.scene.printHtml();
                    return true;
                }
            };

            this.editor.addCommand("printHtml", printHtmlCmd, constants.KEYS.CTRL + 80 /* P */ );
        }
    });
    return PrintHtml;
});