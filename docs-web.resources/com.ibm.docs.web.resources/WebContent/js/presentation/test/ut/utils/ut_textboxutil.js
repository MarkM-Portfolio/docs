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

dojo.provide("pres.test.ut.utils.ut_textboxutil");

dojo.require("pres.utils.textboxUtil");
dojo.require("pres.test.ut_baselines");

describe("pres.test.ut.utils.ut_textboxutil", function(){
	it("createDefaultTextBox", function(){
		pe = {};
		pe.scene = {};
		pe.scene.doc = {};
		pe.scene.doc.fontSize = 18;
		var fakeParams = {pos: {t: 200, l: 200, w: 500, h: 500}};
		var txtbox = pres.utils.textboxUtil.createDefaultTextBox(fakeParams);
		
		var bl = pres.test.ut_baselines;
		var baseDiv = document.createElement("div");
		dojo.addClass(baseDiv, "draw_frame layoutClass bc resizableContainer");
		baseDiv.setAttribute("presentation_class", "textbox");
		baseDiv.setAttribute("pfs", "18");
		baseDiv.setAttribute("draw_layer", "layout");
		baseDiv.setAttribute("text_anchor-type", "paragraph");
        dojo.style(baseDiv, {
            'position': 'absolute',
            'top': '20%',
            'left': '20%',
            'height': '50%',
            'width': '50%'
        });
        
		baseDiv.innerHTML = bl.bl_menu_textbox;
		var ret = window.compareDOMwithChecklist(txtbox, baseDiv, "textbox_default", /* start layer*/0);
	    expect(true).toBe(true);
	});
});