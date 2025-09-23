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

dojo.provide("pres.test.api.field.rotate_element");
dojo.require("pres.test.api.utils.slideUtil");

/**
 * test url
 * http://localhost:9080/docs/static/js/concord/tests/jasmine_api_runner.html?group=rotate_element&testFiles=t2.pptx&pv=2#
 */

apiTest(function()
{
	describe("pres.test.api.rotate_element", function()
	{
		it.asyncly("element rotate", function()
		{
			var asynFin = false;
			
			var initTrans;
			
			runs(function()
			{
				setTimeout(function() {
					var slideEditor = pe.scene.slideEditor;
					var editBox = slideEditor.getChildren()[0];
					editBox.enterSelection();
					
					var initStyle = pres.utils.htmlHelper.extractStyle(editBox.element.getFinalStyle());
					initTrans = initStyle.transform;
					
					editBox.rotateMe(10);
					dojo.publish("/box/trans/changed", [[editBox]]);
					asynFin = true;
				}, 1000);
			});
			
			waitsFor(function()
			{
				return asynFin;				
			}, "Rotate box", 1500);
			
			runs(function()
			{
				var slideEditor = pe.scene.slideEditor;
				var editBox = slideEditor.getChildren()[0];
				
				var style = pres.utils.htmlHelper.extractStyle(editBox.element.getFinalStyle());				
				var oldstyle = pres.utils.shapeUtil.parseTransformStyle(initTrans);
				var newstyle = pres.utils.shapeUtil.parseTransformStyle(style.transform);
				
				expect(oldstyle.rot + 10).toEqual(newstyle.rot);
			});
			
		});
	});

});