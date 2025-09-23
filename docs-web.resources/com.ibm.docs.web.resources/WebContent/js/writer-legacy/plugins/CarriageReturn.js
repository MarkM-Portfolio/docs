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

dojo.provide("writer.plugins.CarriageReturn");
dojo.require("writer.plugins.Plugin");
dojo.require("concord.util.BidiUtils");
dojo.declare("writer.plugins.CarriageReturn",
[writer.plugins.Plugin], {
	doToggle: function(){
		var doc = concord.util.browser.getEditAreaDocument();
		if(pe.scene.isCarriageReturn()){
			if(dojo.hasClass(doc.body,"carriageReturnDisabled"))
				dojo.removeClass(doc.body, "carriageReturnDisabled");
		}
		else{
			if(!dojo.hasClass(doc.body,"carriageReturnDisabled"))
				dojo.addClass(doc.body, "carriageReturnDisabled");
		}
	},
	init: function() {
		var toggleMethod = this.doToggle;
		var toggleCarriageReturn =
		{
			exec: function()
			{
				pe.scene.setCarriageReturn(!pe.scene.isCarriageReturn());
				toggleMethod();
				if(BidiUtils.isBidiOn())
					pe.lotusEditor.layoutEngine.layoutDocument();
			}
		};
		this.editor.addCommand("toggleCarriageReturn", toggleCarriageReturn);

		var toggleBeforeLoad = function(){
			this.doToggle();
			if(this.handler){
				dojo.unsubscribe(this.handler);
				delete this.handler;
			}
		};
		this.handler = dojo.subscribe(writer.EVENT.BEFORE_LOAD, this, toggleBeforeLoad);
}
});
