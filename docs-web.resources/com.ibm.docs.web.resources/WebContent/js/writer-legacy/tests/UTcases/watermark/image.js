dojo.provide("writer.tests.UTcases.watermark.image");
dojo.require("writer.tests.Util");

describe("writer.tests.UTcases.watermark.image", function() {
	common.MeasureText.init();
	common.tools.getDPI();
	writer.view.Run.prototype.getCSSStr = function() {
		return "font-family:Calibri;font-size:11pt;";
	};
	var getTestData = window.getTestData = function(url)
	{
		var ret = null;
		dojo.xhrGet({
			url: url,
			sync: true,
			handleAs: "json",
			load: function(resp)
			{
				ret = resp;
			},
			error: function(resp)
			{
				console.error("getTestData failed, ", resp);
				throw "getTestData failed";
			}
		});

		return ret;
	};
	
	var loadTestData = function(){
		return loadTestDocument('imgSample');
	};

	var assembleContent = function (folder) {
		var prepath = "watermark/" + folder + "/";
		var content, styles, numbering, settings, relations;
		content = getTestData(prepath + "content.json");
		styles = getTestData(prepath + "styles.json");
		numbering = getTestData(prepath + "numbering.json");
		settings = getTestData(prepath + "settings.json");
		relations = getTestData(prepath + "relations.json");

		var jsonCnt = {};
		jsonCnt.content = content.body;
		jsonCnt.style = styles;
		jsonCnt.setting = settings;
		jsonCnt.numbering = numbering;
		jsonCnt.relations = relations;

		return jsonCnt;
	};

	var loadTestDocument = function (folder) {
		var jsonCnt = assembleContent(folder);
	
		pe.lotusEditor.relations = new writer.model.Relations(jsonCnt.relations);
		pe.lotusEditor.number = new writer.model.Numbering(jsonCnt.numbering);
		pe.lotusEditor.styles = new writer.model.style.Styles(jsonCnt.style);
		pe.lotusEditor.styles.createCSSStyle();
		pe.lotusEditor.setting = new writer.model.Settings(jsonCnt.setting);
		pe.lotusEditor.relations.loadContent();
		pe.lotusEditor.document = new writer.model.Document(jsonCnt.content, pe.lotusEditor.layoutEngine);

		pe.scene = {
				editorLeft:null,
				getEditorLeft: function()
				{
					return pe.scene.editorLeft;
				},
				setEditorLeft: function(left)
				{
					pe.scene.editorLeft = left;
				},
			    isHTMLViewMode: function() {
			    	return false;
			    },	
			    addResizeListener: function() {}
			};

		return pe.lotusEditor.document;
	};

	var loadView = function(paramodel) {
		
		var view = paramodel.preLayout("rootView");
		var space = new common.Space(624, 864);
		var textArea = new writer.view.text.TextArea({}, space.clone(), null);
		view.layout(textArea);
		return view;
	};

	it("Check image watermark rendering and rotation", function() {
		
		var doc = loadTestData();

		var relHdrDoc = pe.lotusEditor.relations.byId("rId7");
		var firstPara = relHdrDoc.container.getFirst();
		var firstR = firstPara.firstChild();
		var imgObj = firstR.next();

		expect(imgObj.isInline).toEqual(false);
		expect(0).toEqual(imgObj.rot);
		expect("run.floatImage").toEqual(imgObj.modelType);
	});
	
	it("Check image watermark rendering position", function() {		
		var doc = loadTestData();

		var relHdrDoc = pe.lotusEditor.relations.byId("rId7");
		var firstPara = relHdrDoc.container.getFirst();
		var firstR = firstPara.firstChild();
		var imgObj = firstR.next();		
		pe.scene.setEditorLeft(220);
		var docView = doc.preLayout("rootView");
		docView.addPage(pe.lotusEditor.setting.getFirstSection(),null);
		
		var txtArea = docView.getFristConteArea();
	
		var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
		var paraObj = new writer.model.Paragraph( paraData, doc, true );
		var newPV = paraObj.preLayout("rootView");
		newPV.layout(txtArea);

		var newLine = newPV.lines.getFirst();
		var imageV = new writer.view.AnchorView.FloatImageView(imgObj, "_testFloadImage", 0, 1);
		newLine._appendView(imageV);
		imageV.bodyW = 553.73;
		
		var getPxValue = common.tools.toPxValue;
		var distant = imgObj.distant;
		if (distant){
			imageV.distant.left = getPxValue(distant.left || "0emu");
			imageV.distant.right = getPxValue(distant.right || "0emu");
			imageV.distant.top = getPxValue(distant.top || "0emu");
			imageV.distant.bottom = getPxValue(distant.bottom || "0emu");
		}

		var l1 = newPV.lines.getFirst();
		imageV._calculateSize(l1);
		imageV._updatePositionH(l1);
		imageV._updatePositionV(l1);

		if(imageV)
		{
			var oMT = imageV.marginTop;
			var curPage = writer.util.ViewTools.getPage(imageV.parent);
			var curBody =  writer.util.ViewTools.getTextContent(imageV.parent);
			var imgVH = imageV.getWholeHeight();
			var curPageH = curPage.getHeight();
			var curBodyH = curBody.getHeight();
			var virtualTopOffset = 0 - writer.util.ViewTools.getBody(curBody).getTop();
			
			var topMoved = curBodyH/2 - imgVH/2;
			topMoved -= imageV.marginTop;
			expect(Math.abs(topMoved) < 1).toEqual(true);

			imageV.model.positionV.relativeFrom = "page";
			imageV.model.positionV.align= "top";
			imageV._calculateAbsolutePosV(imageV.parent);
			topMoved = imageV.marginTop - virtualTopOffset;
			expect(Math.abs(topMoved) < 1).toEqual(true);
		
			imageV.model.positionV.relativeFrom = "topMargin";
			imageV.model.positionV.align= "bottom";
			imageV._calculateAbsolutePosV(imageV.parent);
			topMoved = imageV.marginTop + imgVH;
			expect(Math.abs(topMoved) < 1).toEqual(true);
			
			imageV.model.positionV.relativeFrom = "bottomMargin";
			imageV._calculateAbsolutePosV(imageV.parent);
			topMoved = imageV.marginTop - (curPageH - imgVH +virtualTopOffset);
			expect(Math.abs(topMoved) < 1).toEqual(true);			
			
			res = 1;
		}
		expect(res).toEqual(1);
	});
});
