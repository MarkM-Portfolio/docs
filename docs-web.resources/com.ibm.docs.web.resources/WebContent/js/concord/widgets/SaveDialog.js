dojo.provide("concord.widgets.SaveDialog");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets","SaveDialog");

dojo.declare("concord.widgets.SaveDialog", [concord.widgets.concordDialog], {
	saveOptionMsg:null,
	saveOptionMsg2:null,
	saveDraftMsg: null,
	saveDocumentsMsg: null,
	submitDocumentMsg: null,
	deleteDocumentMsg: null,

	DRAFT_MODE: "draft",
	DOCUMENT_MODE: "document",
	SUBMIT_MODE: "submit",
	SUBMIT_DELETE: "submit_delete",
	SUBMIT_LABEL:"submit_label",
	
	saveDraftRadioID: "C_d_SaveDialogsavetype1",
	saveDocumentRadioID: "C_d_SaveDialogsavetype2",
	submitRadioID: "C_d_SaveDialogsavetype3",
	submitOptRadio: "C_d_SaveDialogsubmittype1",
	
	draftDiv: "draftDiv",
	documentDiv: "documentDiv",
	submitDiv: "submitDiv",
	submitDeleteDiv: "submitDeleteDiv",
	optionMsgDiv: "optionMsgDiv",	
	
	constructor: function() {
		// dialog has been created
	},
	
	setDialogID: function() {
		this.dialogId = "C_d_SaveDialog";
	},	
	
	createContent: function (contentDiv) {
		var nls = dojo.i18n.getLocalization("concord.widgets","SaveDialog");
		this.saveOptionMsg=nls.saveOptionMsg ;
		this.saveOptionMsg2=nls.saveOptionMsg2 ;
		this.saveDraftMsg= nls.saveDraftMsg ;
		this.saveDocumentsMsg= nls.saveDocumentsMsg ;
		this.submitDocumentMsg= nls.submitDocumentMsg ; 
		this.deleteDocumentMsg = nls.deleteDocumentMsg;
		
		var doc = dojo.doc;
		var optionDiv = dojo.create('div', {id: this.optionMsgDiv}, contentDiv);
		dojo.style( optionDiv, "width", "400px" );
		var textNode = doc.createTextNode(this.saveOptionMsg);
		optionDiv.appendChild(textNode);
		dojo.addClass (optionDiv, "concordDialogBold");
		
		var typeSelectionDiv1 = dojo.create('div', {id: this.draftDiv}, contentDiv);
		var typeSelectionDiv2 = dojo.create('div', {id: this.documentDiv}, contentDiv);
		var typeSelectionDiv3 = dojo.create('div', {id: this.submitDiv}, contentDiv);
		var radio1 = null;
		if (dojo.isIE) {
			radio1 = dojo.create("<input name='saveType1' type='radio'/>", null, typeSelectionDiv1);
			radio1.id = this.saveDraftRadioID;
			radio1.checked = true;
			radio1.value = this.DRAFT_MODE;
		} else {
			radio1 = dojo.create('input', null, typeSelectionDiv1);
			dojo.attr(radio1, {
					id: this.saveDraftRadioID,
					name: "saveType1",
					type: "radio",
					checked: "checked",
					value: this.DRAFT_MODE
				});
		}
		var label1 = dojo.create('label', null, typeSelectionDiv1);
		dojo.attr(label1, "for", this.saveDraftRadioID);
		label1.appendChild(doc.createTextNode(this.saveDraftMsg));

		var radio2 = null;
		if (dojo.isIE) {
			radio2 = dojo.create("<input name='saveType2' type='radio'/>", null, typeSelectionDiv2);
			radio2.id = this.saveDocumentRadioID;
//			radio2.checked = true;
			radio2.value = this.DOCUMENT_MODE;
		} else {
			radio2 = dojo.create('input', null, typeSelectionDiv2);
			dojo.attr(radio2, {
					id: this.saveDocumentRadioID,
					name: "saveType2",
					type: "radio",
					value: this.DOCUMENT_MODE
				});
		}
		var label2 = dojo.create('label', null, typeSelectionDiv2);
		dojo.attr(label2, "for", this.saveDocumentRadioID);
		label2.appendChild(doc.createTextNode(this.saveDocumentsMsg));

		var radio3 = null;
		if (dojo.isIE) {
			radio3 = dojo.create("<input name='saveType3' type='radio'/>", null, typeSelectionDiv3);
			radio3.id = this.submitRadioID;
//			radio3.checked = true;
			radio3.value = this.SUBMIT_MODE;
		} else {
			radio3 = dojo.create('input', null, typeSelectionDiv3);
			dojo.attr(radio3, {
					id: this.submitRadioID,
					name: "saveType3",
					type: "radio",
					value: this.SUBMIT_MODE
				});
		}
		var label3 = dojo.create('label', null, typeSelectionDiv3);
		dojo.attr(label3, "for", this.submitRadioID);
		label3.appendChild(doc.createTextNode(this.submitDocumentMsg));
		
//		var typeSubmitDiv1 = dojo.create('div', 
//										{id: this.submitNoDeleteDiv,
//										 style: "margin-left: 15px"},
//										typeSelectionDiv3);
//		var radio4 = null;
//		if (dojo.isIE) {
//			radio4 = dojo.create("<input name='submitType1' type='radio'/>", null, typeSubmitDiv1);
//			radio4.id = this.submitOptRadioID1;
//			radio4.checked = true;
//			radio4.value = this.SUBMIT_NO_DELETE;
//		} else {
//			radio4 = dojo.create('input', null, typeSubmitDiv1);
//			dojo.attr(radio4, {
//					id: this.submitOptRadioID1,
//					name: "submitType1",
//					type: "radio",
//					checked: true,
//					value: this.SUBMIT_NO_DELETE,
//				});
//		}
//		var label4 = dojo.create('label', null, typeSubmitDiv1);
//		dojo.attr(label4, "for", this.submitOptRadioID1);
//		label4.appendChild(doc.createTextNode("Leave it in Files"));		
		
		var typeSubmitDiv2 = dojo.create('div', 
										{id: this.submitDeleteDiv, 
										 style: "margin-left: 20px"
										 }, typeSelectionDiv3);
		var radio5 = null;
		if (dojo.isIE) {
			radio5 = dojo.create("<input name='submitType2' type='checkbox'/>", null, typeSubmitDiv2);
			radio5.id = this.submitOptRadio;
			radio5.checked = true;
			radio5.value = this.SUBMIT_DELETE;
		} else {
			radio5 = dojo.create('input', null, typeSubmitDiv2);
			dojo.attr(radio5, {
					id: this.submitOptRadio,
					name: "submitType2",
					type: "checkbox",
					checked: true,
					value: this.SUBMIT_DELETE
				});
		}
		var label5 = dojo.create('label', {id: this.SUBMIT_LABEL}, typeSubmitDiv2);
		dojo.attr(label5, "for", this.submitOptRadio);
		label5.appendChild(doc.createTextNode(this.deleteDocumentMsg));			
		
        dojo.addClass(radio1, "concordDialogRadio");
        dojo.addClass(radio2, "concordDialogRadio");
        dojo.addClass(radio3, "concordDialogRadio");
        dojo.addClass(radio5, "concordDialogRadio");
        
        
        dojo.addClass(typeSelectionDiv1, "concordDialogDivMargin");
        dojo.addClass(typeSelectionDiv2, "concordDialogDivMargin");
        dojo.addClass(typeSelectionDiv3, "concordDialogDivMargin");
        dojo.addClass(typeSubmitDiv2, "concordDialogDivMargin");
        		
		dojo.connect(radio1, 'onclick', dojo.hitch(this, "changeMode", this.DRAFT_MODE));
		dojo.connect(radio2, 'onclick', dojo.hitch(this, "changeMode", this.DOCUMENT_MODE));
		dojo.connect(radio3, 'onclick', dojo.hitch(this, "changeMode", this.SUBMIT_MODE));
		
	},
	
	reset: function()
	{
		var bFragDoc = this.editor.isPrivateDoc();
		var submitArea = dojo.byId(this.submitDiv);
		var documentArea = dojo.byId(this.documentDiv);
		var optionDiv = dojo.byId(this.optionMsgDiv);
		var draftRadio = dojo.byId(this.saveDraftRadioID);
		var documentRadio = dojo.byId(this.saveDocumentRadioID);
		var submitRadio = dojo.byId(this.submitRadioID);
		
		var submitDeleteArea = dojo.byId(this.submitDeleteDiv);
		
		if (bFragDoc){
			optionDiv.innerHTML = this.saveOptionMsg2;
			dojo.style(submitArea, "display", "");
			dojo.style(submitDeleteArea, "display", "");			
			dojo.style(documentArea, "display", "none");
			
			if (draftRadio.checked)
				submitRadio.checked = false;
			else
				submitRadio.checked = true;
				
			if (submitRadio.checked)
				this.enableSubmitOptions(true);
			else
				this.enableSubmitOptions(false);
		}else{
			optionDiv.innerHTML = this.saveOptionMsg;
			dojo.style(submitArea, "display", "none");
			dojo.style(submitDeleteArea, "display", "none");			
			dojo.style(documentArea, "display", "");

			if (draftRadio.checked)
				documentRadio.checked = false;
			else
				documentRadio.checked = true;
		}	
			
	},
	
	changeMode: function(mode)
	{
		var documentRadio = dojo.byId(this.saveDocumentRadioID);
		var draftRadio = dojo.byId(this.saveDraftRadioID);
		var submitRadio = dojo.byId(this.submitRadioID);
		
		if (mode == this.DRAFT_MODE) {
			this.enableSubmitOptions(false);
			documentRadio.checked = false;
			submitRadio.checked = false;
		} else if (mode == this.DOCUMENT_MODE) {
			this.enableSubmitOptions(false);
			draftRadio.checked = false;
			submitRadio.checked = false;
		} else if (mode == this.SUBMIT_MODE){
			this.enableSubmitOptions(true);
			documentRadio.checked = false;
			draftRadio.checked = false;			
		}
	},
	
	enableSubmitOptions: function (bShow){
		var submitDelete = dojo.byId(this.submitOptRadio);	
		var submitLabel = dojo.byId(this.SUBMIT_LABEL);
		if (bShow){		 		   
			dojo.attr(submitDelete, "disabled",false);
			dojo.style(submitLabel, "color","black");
		}else{		       
			dojo.attr(submitDelete, "disabled",true);
			dojo.style(submitLabel, "color","gray");
		}				
	},
	
	onOk: function (editor) {		
		var draftRadio = dojo.byId(this.saveDraftRadioID);
		var documentRadio = dojo.byId(this.saveDocumentRadioID);
		var submitRadio = dojo.byId(this.submitRadioID);
		var submitDelete = dojo.byId(this.submitOptRadio);
		if(draftRadio.checked){
			editor.saveDraft();
		} else if (documentRadio.checked){
			editor.publish();
		} else if (submitRadio.checked){
			var data = {"clean" : submitDelete.checked};
			editor.submitTask(data);
		}
		
		return true;
	}
});
