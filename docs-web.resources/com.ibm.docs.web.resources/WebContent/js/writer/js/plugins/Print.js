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
    "writer/constants",
    "writer/core/Range",
    "writer/plugins/Plugin",
    "writer/util/ModelTools"
], function(declare, constants, Range, Plugin, ModelTools) {

    var Print = declare("writer.plugins.Print", Plugin, {
        init: function() {
            //init commands
            var printCmd = {
                exec: function() {
                    pe.scene.exportPdf(pe.lotusEditor);
                    return true;
                }
            };

            this.editor.addCommand("Print", printCmd, constants.KEYS.CTRL + 80 /* P */ );
        }
    });
    return Print;
});