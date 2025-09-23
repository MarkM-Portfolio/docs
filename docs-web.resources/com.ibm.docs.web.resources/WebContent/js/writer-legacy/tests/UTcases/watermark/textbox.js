dojo.provide("writer.tests.UTcases.watermark.textbox");
dojo.require("writer.tests.Util");

describe("writer.tests.UTcases.watermark.textbox", function() {
	
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
		return loadTestDocument('textSample');
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

	it("Check text box watermark rotation", function() {
		
		var doc = loadTestData();

		var relHdrDoc = pe.lotusEditor.relations.byId("rId7");
		var firstPara = relHdrDoc.container.getFirst();
		var firstR = firstPara.firstChild();
		var txbxObj = firstR.next();

		expect(txbxObj.isWaterMarker).toEqual(true);
		expect(18900000).toEqual(txbxObj.rot);
	});

	it("Check text box watermark position", function() {
		
		var doc = loadTestData();

		var relHdrDoc = pe.lotusEditor.relations.byId("rId7");
		var firstPara = relHdrDoc.container.getFirst();
		var firstR = firstPara.firstChild();
		var txbxObj = firstR.next();

		pe.scene.setEditorLeft(220);
		var docView = doc.preLayout("rootView");
		docView.addPage(pe.lotusEditor.setting.getFirstSection(),null);
		
		var txtArea = docView.getFristConteArea();
	
		var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
		var paraObj = new writer.model.Paragraph( paraData, doc, true );
		var newPV = paraObj.preLayout("rootView");
		newPV.layout(txtArea);

		var newLine = newPV.lines.getFirst();
		var anchorTxtV = new writer.view.AnchorView.AnchorTextBox(txbxObj, "_testAnchorTextBox", 0, 1);
		newLine._appendView(anchorTxtV);

		var pos = {"obj":newLine,"index":0};
		var retPos = writer.util.RangeTools.getDocumentPosition(pos, true);
		expect(retPos.x > 0).toEqual(true);
		expect(retPos.y > 0).toEqual(true);
	});
});
