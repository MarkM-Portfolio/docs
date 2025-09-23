dojo.provide("concord.pres.test2.common.commonOperation");
dojo.require("concord.pres.PresCKUtil");

function refreshDoc(window){
	window.location.reload(true);
}

function getSlideSorter(window){
	return window.pe.scene.slideSorter;
}

function getSlideEditor(window){
	return window.pe.scene.slideEditor;
}

function getSorterDocument(window){
	return window.pe.scene.slideSorter.editor.document.$;
}

function getEditorDocument(window){
	return window.pe.scene.slideEditor.editor.document.$;
}

function getElementById(document, id){
	return dojo.byId(id, document);
}

function publishLoadFinished(window){
	clearTimeout(this._plfTimer);
	console.log("enter publishFinishedLoaded");
	if(window && window.pe && window.pe.scene && window.pe.scene.bLoadFinished){
		setTimeout(function(){dojo.publish("subDocLoadFinished");}, 2000);
	}
	else{
		this._plfTimer = setTimeout(function(){publishLoadFinished(window);}, 2000);
	}
	return;
}

function checkLoadFinished(window,callback){
	clearTimeout(this._plfTimer);
	console.log("enter checkLoadFinished");
	if(window)console.log("window:"+window);
	if(window && window.pe)console.log("window.pe:"+window.pe);
	if(window && window.pe && window.pe.scene)console.log("window.pe.scene:"+window.pe.scene);
	if(window && window.pe && window.pe.scene)console.log("window.pe.scene.bLoadFinished:"+window.pe.scene.bLoadFinished);
	
	if(window && window.pe && window.pe.scene && window.pe.scene.bLoadFinished){
		setTimeout(callback, 2000);
	}
	else{
		this._plfTimer = setTimeout(function(){checkLoadFinished(window, callback);}, 2000);
	}
	return;
}

function loadFinished(window, callback){
	console.log("enter loadFinished");
	setTimeout(function(){
		checkLoadFinished(window,callback);
	   }, 1000
	);
}

function createNewSlide(window){
	var slideEditor = window.pe.scene.slideEditor;
	var slideSorter = window.pe.scene.slideSorter;
	slideEditor && slideEditor.deSelectAll();
    slideSorter.createSlide(slideSorter.selectedSlide);
}

function deleteSlides(window){
	var slideSorter = window.pe.scene.slideSorter;
	slideSorter.deleteSlides();
}

function selectSlide(window, slideElem){
	var slideSorter = window.pe.scene.slideSorter;
	slideSorter.selectSlide(slideElem);
}

function getAllSlides(window){
	var slideSorter = window.pe.scene.slideSorter;
	slideSorter.refreshSlidesObject();
    return slideSorter.slides;
}

function getAllSlideNumbers(window){
	var slideSorter = window.pe.scene.slideSorter;
	var slides =  slideSorter.getAllSlides();
	return slides.length;
}

function getSlideNumber(window, slideElem){
	var slideSorter = window.pe.scene.slideSorter;
	return slideSorter.getSlideNumber(slideElem);
}

function enterEditMode(shapeObj, window){
	if (!shapeObj) return;
	
	shapeObj.handleContentOnDblClick_isEitable();
	var shapeObjInEdit = window.pe.scene.getContentBoxCurrentlyInEditMode();
	return shapeObjInEdit;
}

function setTextInEditObject(window, objectInEdit, content){
	if (!objectInEdit || !content) return;
	
	var editor = objectInEdit.editor;

	var dfNode = PresCKUtil.getDFCNode(editor);
	var spans = dfNode.getElementsByTagName('span');
	if (spans && spans.length >0){
		var span =  spans[0];
		var spanNode = new window.CKEDITOR.dom.node(span);
		spanNode.setText(content);
	
		var ckRange = new window.CKEDITOR.dom.range(editor.document);
		ckRange.moveToElementEditEnd(spanNode);
		ckRange.select();
		editor.contentBox.synchAllData();
	}
}

function getTextInEditObject(window, objectInEdit){
	if (!objectInEdit) return '';
	
	var editor = objectInEdit.editor;

	var dfNode = PresCKUtil.getDFCNode(editor);
	var spans = dfNode.getElementsByTagName('span');
	if (spans && spans.length >0){
		var span =  spans[0];
		var spanNode = new window.CKEDITOR.dom.node(span);
		return spanNode.getText();
	}
	return '';
}

function cleanTextInEditObject(window, objectInEdit){
	if (!objectInEdit) return;
	
	var editor = objectInEdit.editor;

	var dfNode = PresCKUtil.getDFCNode(editor);
	var spans = dfNode.getElementsByTagName('span');
	if (spans && spans.length >0){
		var span =  spans[0];
		var spanNode = new window.CKEDITOR.dom.node(span);
		spanNode.setHtml('&#8203');
		
		var ckRange = new window.CKEDITOR.dom.range(editor.document);
		ckRange.moveToElementEditEnd(spanNode);
		ckRange.select();
		editor.contentBox.synchAllData();
	}
}
