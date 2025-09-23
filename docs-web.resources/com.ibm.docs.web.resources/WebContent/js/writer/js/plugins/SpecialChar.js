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
    "concord/widgets/specialcharDlg",
    "writer/plugins/Plugin"
], function(declare, specialcharDlg, Plugin) {

    var SpecialChar = declare("writer.plugins.SpecialChar", Plugin, {
        init: function() {
            var insertSpecialCmd = {
                exec: function() {
                    var dlg = new specialcharDlg();
                    dlg.show();
                }
            };

            this.editor.addCommand("specialchar", insertSpecialCmd);
        }
    });
    return SpecialChar;
});
