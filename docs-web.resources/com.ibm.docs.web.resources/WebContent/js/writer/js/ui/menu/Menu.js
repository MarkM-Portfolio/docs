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
    "dijit/Menu",
    "writer/constants"
], function(declare, Menu, constants) {

    var Menu = declare("writer.ui.menu.Menu", Menu, {

        setMenuState: function() {
            var menuChildren = this.getChildren();
            var menuChild, cmdState, cmd;
            for (var i = 0; i < menuChildren.length; i++) {
                menuChild = menuChildren[i];
                if (menuChild.commandID) {
                    cmd = pe.lotusEditor.getCommand(menuChild.commandID);
                    if (!cmd) {
                        console.warn("Can't find command: " + menuChild.commandID);
                        continue;
                    }
                    cmdState = cmd.state;
                    menuChild.setDisabled(cmdState == constants.CMDSTATE.TRISTATE_DISABLED || cmdState == constants.CMDSTATE.TRISTATE_HIDDEN);
                    if (menuChild.attr) {
                        menuChild.set("checked", (cmdState == constants.CMDSTATE.TRISTATE_ON));
                    }
                }
            }
        },

        onOpen: function(e) {
            this.inherited('onOpen', arguments);
            this.setMenuState();

            if (pe.lotusEditor.popupPanel)
                pe.lotusEditor.popupPanel.close && pe.lotusEditor.popupPanel.close(true);
        }
    });

    return Menu;
});
