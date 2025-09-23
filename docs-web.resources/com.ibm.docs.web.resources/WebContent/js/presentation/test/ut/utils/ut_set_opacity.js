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

dojo.provide("pres.test.ut.utils.ut_set_opacity");
dojo.require("pres.editor.model.Content");

describe("pres.test.ut.utils.ut_set_opacity", function(){
	
	var testPage1 = "slide_id_193";//"slide_id_171";
	var testImageID = "pic_id_460";
	var shapeId = "cust_shape_id_197";
	var textboxID = "body_id_fc8fe1a9d8d4";
	
	var testData = getTestData("editing_ut_sample.html");//("opacity_ut_sample.html");
	function _BuildContext(slideID, eleID)
	{
		var doc = new pres.model.Document(testData);		
		var eleDom = document.getElementById(eleID);		
		var box = {
				domNode : eleDom,
				getEditNode : function()
				{
					return this.domNode;
				},
				getTextNode: function(rootNode)
				{
					var node = rootNode || this.domNode;
					if (this.element.family == "text")
						return node.children[0].children[0].children[0];
					else if (this.element.family == "notes")
					{
						var notesDrawText = this.getNotesNode(rootNode);
						var resultNode = null;
						if (notesDrawText)
							resultNode = dojo.query(".draw_frame_classes", notesDrawText)[0];
						if (!resultNode)
							resultNode = node.children[0].children[0].children[0];
						return resultNode;
					}
					else if (this.element.family == "group")
					{
						var subs = node.firstElementChild.children;
						var textNode;
						for (var i = 0; i < subs.length; i++)
						{
							var child = subs[i];
							if (dojo.attr(child, "presentation_class") != 'graphic')
							{
								textNode = child;
								break;
							}
						}
						if (textNode)
						{
							return textNode.children[0].children[0].children[0];
						}
					}
				},
				element : doc.find(eleID)
		};

		return {
			box : box
		};
	};
	
	function _buildShapeContext(slideID, shapeId)
	{
		var doc = new pres.model.Document(testData);
		var slideElement = doc.find(slideID);
		var shapeElement = '';
		dojo.forEach(slideElement.elements, function(slideele)
		{
			if(slideele.family == 'group' && slideele.id == shapeId)
			{
				shapeElement = new pres.model.ShapeElement(slideele);
			}
		});
		var box = {
				element : shapeElement
		};
		return {
			box : box
		};

	};
	
	function _ClearContext(context)
	{
		dojo.destroy(context.slideDom);		
	};
	
	it("set image Opacity", function() {
		var imageContext = _BuildContext(testPage1, testImageID);
		var value = 0.28;
		
		var eleHandler = new pres.handler.ElementHandler();
		eleHandler.textBoxContentUpdated = function(){};
		eleHandler.imageSetOpacity([imageContext.box] , value);
		expect(imageContext.box.element.attr("opacity")).toBe(value);

		_ClearContext(imageContext);
		
	});
	
	it("set textbox Opacity", function() {
		var txtContext = _BuildContext(testPage1, textboxID);

		var value = 0.34;
		var eleHandler = new pres.handler.ElementHandler();
		var textBoxNode = txtContext.box.getTextNode();		
		eleHandler.textBoxContentUpdated = function(){};
		eleHandler.boxSetOpacity([txtContext.box] , value);
		var opValue = textBoxNode.style.backgroundColor.split(',')[3].replace(')','');
		expect(Math.round(opValue*100)/100).toBe(value);

		_ClearContext(txtContext);
		
	});
	
	it("set shape opacity", function() {
		var shapeContext = _buildShapeContext(testPage1, shapeId);
		var value = 0.79;		
		var e = shapeContext.box.element;
		var fill = e.svg.fill;
		var oldAttrObj = {};
		var newAttrObj = {};
		pres.utils.shapeUtil.setOpacity(fill, value,'fill',oldAttrObj, newAttrObj);
		expect(fill.attr("fill-opacity")).toBe(value);
		
		_ClearContext(shapeContext);
	});
	
});