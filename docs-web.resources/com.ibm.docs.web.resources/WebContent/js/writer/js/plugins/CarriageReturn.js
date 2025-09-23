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
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/topic",
    "concord/util/BidiUtils",
    "concord/util/browser",
    "writer/constants",
    "writer/plugins/Plugin"
], function(declare, lang, domClass, topic, BidiUtilsModule, browser, constants, Plugin) {


    var CarriageReturn = declare("writer.plugins.CarriageReturn", Plugin, {
        doToggle: function() {
            var doc = browser.getEditAreaDocument();
            if (pe.scene.isCarriageReturn()) {
                if (domClass.contains(doc.body, "carriageReturnDisabled"))
                    domClass.remove(doc.body, "carriageReturnDisabled");
            } else {
                if (!domClass.contains(doc.body, "carriageReturnDisabled"))
                    domClass.add(doc.body, "carriageReturnDisabled");
            }
        },
        init: function() {
            var toggleMethod = this.doToggle;
            var toggleCarriageReturn = {
                exec: function() {
                    pe.scene.setCarriageReturn(!pe.scene.isCarriageReturn());
                    toggleMethod();
                    if (window.BidiUtils.isBidiOn())
                        pe.lotusEditor.layoutEngine.layoutDocument();
                }
            };
            this.editor.addCommand("toggleCarriageReturn", toggleCarriageReturn);

            var toggleBeforeLoad = function() {
                this.doToggle();
                if (this.handler) {
                    this.handler.remove();
                    delete this.handler;
                }
            };
            this.handler = topic.subscribe(constants.EVENT.BEFORE_LOAD, lang.hitch(this, toggleBeforeLoad));
        }
    });

    return CarriageReturn;
});
