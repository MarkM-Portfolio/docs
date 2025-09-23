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

dojo.provide("websheet.dialog.nameRange");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("websheet.dialog.newName");
dojo.require("concord.widgets.LotusTextButton");
dojo.requireLocalization("websheet.dialog","nameRange");

dojo.declare("websheet.dialog.nameRange", [concord.widgets.concordDialog], {
	nameRangeList: null,
	
	namesList: null,
	inputBox: null,
	currRange: null,
	
	invalidMsg: "",
	emptyMsg:"",
	warnMsg:"",
		
	inputText: "",
	
	nameHdl:null,
	
	tableDiv: null,
	referHelp: null,
	emptyInfo:null,
	
	modifyBtn:null,
	
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function (object, title, oklabel, visible, list) {
		this.nameRangeList = list;
		this.nameRangeList.sort(function(prange, lrange){
			return prange.getId().localeCompare(lrange.getId());
//			return prange.rangeId > lrange.rangeId;
		});
		if(list.length>0)
			this.inputText = list[0].getParsedRef().getAddress();
		this.inherited( arguments );

		this._toMode();
	},
		
	setDialogID: function() {
		this.dialogId = "S_d_nameRange";
		this.namesListId = "S_d_allNameRangesList";
		this.newButtonID = "NewButton";
		this.modifyButtonID = "ModifyButton";
	},
	
	createContent: function (contentDiv) {
		this.nameHdl = this.editor.getNameRangeHdl();
		var nls = dojo.i18n.getLocalization("websheet.dialog","nameRange");
		this.invalidMsg = nls.LABEL_INVALIDMSG;
		this.emptyMsg = nls.LABEL_EMPTYREF;
		
		var listlabel = dojo.create('div', null, contentDiv);
		var labelText = document.createTextNode(nls.LABEL_NAMES_LIST);
		listlabel.appendChild(labelText);		
		dojo.addClass(listlabel,"namesListLabel");		
		
		var tableDiv = dojo.create('div', null, contentDiv);
		dojo.addClass(tableDiv,"tableDiv");
		dijit.setWaiRole(tableDiv, "listbox");
		dijit.setWaiState(tableDiv, "label", nls.LABEL_NAMES_LIST);
		dijit.setWaiState(tableDiv, "multiselectable", false);
		
		this.tableDiv = tableDiv;
		var table = dojo.create('table',{id: this.namesListId, cellspacing: '0px'}, tableDiv);
		dijit.setWaiRole(table,'presentation');
		dojo.addClass(table,"namesList");
		var tBody = dojo.create('tbody',null,table);
		this.namesList = tBody;		
		
		var len = this.nameRangeList.length;
		
		if(len ==0 )
		    this._showEmptyInfo(true);
		for(var index = 0 ; index <len ; index++)
		{
			var range = this.nameRangeList[index];
			var opt = dojo.create('tr',null,tBody);
			var rangeName = range.getId();
			var address = range.getParsedRef().getAddress();
			var optTD = dojo.create('td', null, opt);
			if (BidiUtils.isBidiOn()){
				var dir = BidiUtils.getResolvedTextDir(rangeName);
				dojo.attr(optTD, "style","direction:" + dir + ";display: inline-block");
			}
			var optDiv = dojo.create('div', null, optTD);
			dojo.attr(optDiv, "tabIndex",0);
			optDiv.appendChild(document.createTextNode(rangeName));
			dijit.setWaiRole(optDiv, "option");
			dijit.setWaiState(optDiv, "label", [nls.ACC_NAMEDRANGE, rangeName, nls.ACC_REFERSTO, address].join());
			dijit.setWaiState(optDiv, "selected", false);
			
			dojo.connect(optDiv,"onkeydown",dojo.hitch(this,this.onOptKeyDown, range));
			
			if(typeof address == "string")
				address = websheet.Helper.escapeXml(address);
			dojo.create('td',{innerHTML:address},opt);
			var dBt = dojo.create('td', {title: nls.DELETE_HELP}, opt);
			var dDiv = dojo.create('div', null, dBt);
			dojo.attr(dDiv, "tabIndex",0);	
			dDiv.appendChild(document.createTextNode(' X '));
			dijit.setWaiRole(dDiv, "button");
			dijit.setWaiState(dDiv, "label", [nls.DELETE_NAME, rangeName].join());
			
			dojo.connect(dDiv,"onkeydown",dojo.hitch(this,this.ondDivKeyDown, range));
			dojo.addClass(dBt,"nrDeleteBt");
			dojo.style(dBt,"paddingRight","15px");
			dojo.style(dBt,"marginRight","15px");
			dojo.connect(opt,"onclick", dojo.hitch(this,this.onSelected,range));
			dojo.connect(dBt,"onclick", dojo.hitch(this,this.onDelete,range));
		}
		
		var referlabel = dojo.create('div', null, contentDiv);
		var referText = dojo.create('label', null, referlabel);
		referText.appendChild(document.createTextNode(nls.LABEL_REFERSTO));
		dojo.attr(referText,'for',this.dialogId+"InputArea");
		dojo.addClass(referlabel,"namesListLabel");
		dojo.addClass(referlabel,"referLabel");
		
		var inputDiv = dojo.create('div', null, contentDiv);
		//increase the tabindex of the text box to make it the default focused item of this dialog.
		var inputBox = new dijit.form.TextBox({tabIndex: 1, value:this.inputText, intermediateChanges:true, id:this.dialogId+"InputArea", style:{'width': '377px'}, onChange: dojo.hitch(this,"_onRefChange", null)});
		dojo.connect(inputBox.textbox, "onkeypress", dojo.hitch(this, this.onKeyPress));
		dojo.addClass (inputBox.domNode, "namesInputBox");
		inputDiv.appendChild(inputBox.domNode);
		this.inputBox = inputBox;
		
		
		var referHelp = dojo.create('div', null, contentDiv);
		var helpText = document.createTextNode(nls.REFERS_HELP);
		referHelp.appendChild(helpText);	
		this.referHelp = referHelp;
			
		if(len>0){
			dojo.addClass(this.namesList.childNodes[0],"selected");
			this.nameHdl.currAddress = this.inputText;
			this.nameHdl.refChanged = false;			
			this.nameHdl.highLightRange(this.nameRangeList[0]);
		}
		else
			this.inputBox.setDisabled(true);
	},

	ondDivKeyDown: function(range, e){
		if(e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE){
			this.onDelete(range);
		}
	},
	onOptKeyDown: function(range, e){
		if(e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE){
			this.onSelected(range);
		}
	},
	
	_showEmptyInfo:function(show){
		if(show){
			if(!this.emptyInfo){
				var nls = dojo.i18n.getLocalization("websheet.dialog","nameRange");
				var emptyInfo = dojo.create('tr',null,this.namesList);
				dojo.create('td',{innerHTML:nls.EMPTY_INFO},emptyInfo);
			    dojo.addClass(emptyInfo,'ll_default-information-text');
				this.emptyInfo = emptyInfo;
			}
			this.emptyInfo.style.display = '';
		}else{
			if(this.emptyInfo){
				this.emptyInfo.style.display = 'none';
			}
		}
		
	},
	
	postCreate: function()
	{		
		var nls = dojo.i18n.getLocalization("websheet.dialog","nameRange");
		var modifyBtn = new concord.widgets.LotusTextButton({label: nls.LABEL_MODIFY_BUTTON, id: this.modifyButtonID, onClick: dojo.hitch(this, "_onModify", this.nameHdl)});
		var newBtn = new concord.widgets.LotusTextButton({label: nls.LABEL_NEW_BUTTON, id: this.newButtonID, onClick: dojo.hitch(this, "_onNew", this.nameHdl)});
		
		var btnContainer = this.getBtnContainer();
		var okBtn = this.getOkBtn();
		if(btnContainer && okBtn)
		{
			btnContainer.insertBefore(modifyBtn.domNode,okBtn.domNode);
			btnContainer.insertBefore(newBtn.domNode,modifyBtn.domNode);
		}
		this.modifyBtn = modifyBtn;
		this.modifyBtn.setDisabled(true);
		
		var msgId = this.warnMsgID + this.dialogId;
		dojo.addClass(dojo.byId(msgId),"helpLabel");
	},
	

	onSelected: function(range)
	{
		if(range){
			var l = this.nameRangeList.length, item = null, focusItem = null;
			for(var i=0;i<l;i++){
				if(this.nameRangeList[i] == range){
					if(this.emptyInfo){
						dojo.addClass(focusItem = item = this.namesList.childNodes[i+1],"selected");
					}
					else{
						dojo.addClass(focusItem = item = this.namesList.childNodes[i],"selected");
					}//tr => td => div(focus node)
					dijit.setWaiState(item.firstChild.firstChild, "selected", true);
					this.modifyBtn.setDisabled(true);		
					this.inputBox.setDisabled(false);
				}else{
					if(this.emptyInfo)
						dojo.removeClass((item = this.namesList.childNodes[i+1]),"selected");
					else
						dojo.removeClass((item = this.namesList.childNodes[i]),"selected");
					//tr => td => div(focus node)
					dijit.setWaiState(item.firstChild.firstChild, "selected", false);
				}
			}
			try{
				setTimeout(dojo.hitch(this, function (_item){
					_item.focus();
			    }, focusItem.firstChild.firstChild), 200);
			}
			catch(e){}
			
			this.inputText = range.getParsedRef().getAddress();
			this.inputBox.set("value",this.inputText);
			this.nameHdl.currAddress = this.inputText;
			this.nameHdl.manualInput = false;
			this.nameHdl.highLightRange(range);
			this.nameHdl.refChanged = false;
			this._reset();
			this.warnMsg = "";
		}
	},
	
	onShow: function(){
		var l = this.namesList.rows.length;
		for(var i = 0; i < l; i++){
			if(dojo.hasClass(this.namesList.rows[i],'selected'))
			{
				this.onSelected(this.nameRangeList[i]);
				break;
			}	
		}
		dojo.publish("RangePickingStart", [{grid : this.editor.getCurrentGrid()}]);
	},
	
	onDelete: function(range){
		var rangeName = range.getId();
		var nls = dojo.i18n.getLocalization("websheet.dialog","nameRange");
		var confirmMsg = dojo.string.substitute(nls.DELETE_NAME_CONFIRM_MSG, [rangeName]);
		var params = {
			message: confirmMsg,
			callback: this._deleteRange
		};
		this.currRange = range;
		var dlg = new concord.widgets.ConfirmBox(this, nls.DELETE_NAME, null, true, params);
		this._toModeless();
		dlg.show();
	},
	
	_deleteRange: function(editor, bDelete){
		var nameRangeDlg = editor;
		if (!bDelete) {
			nameRangeDlg._toMode();
			return;
		}
		nameRangeDlg.modifyBtn.setDisabled(true);
		nameRangeDlg.nameHdl.currAddress = "";
		nameRangeDlg.nameHdl.highLightAddr();
		nameRangeDlg.inputBox.setDisabled(true);
		nameRangeDlg.nameHdl.deleteNameRange(nameRangeDlg.currRange);		
		nameRangeDlg._toMode();
	},
	
	_toMode: function()
	{
		if(dijit._underlay)
			dijit._underlay.domNode.style.display = 'none';
		this.handle1 = dojo.connect(this.dialog, "layout", function() {
			if(dijit._underlay)
				dijit._underlay.domNode.style.display = 'none';
		});
		this.handle2 = dojo.connect(this.dialog, "show", function() {
			if(dijit._underlay)
				dijit._underlay.domNode.style.display = 'none';
		});
	},
	
	_toModeless: function ()
	{
		if(dijit._underlay)
			dijit._underlay.domNode.style.display = "block";
		dojo.disconnect(this.handle1);
		dojo.disconnect(this.handle2);
	},
	
	updateAddress: function(address){
		if(this.dialog._isShown()){		
			this.inputText = address;
			this.inputBox.set("value", address);			
		}
	},
	
	updateRange: function(range){
		if(range){
			var l = this.nameRangeList.length;
			for(var i=0;i<l;i++){
				// when update range, compare its range id
				if(this.nameRangeList[i].getId() == range.getId()){
					var address = range.getParsedRef().getAddress();
					if(typeof address == "string")
						address = websheet.Helper.escapeXml(address);
					if(this.emptyInfo)
						this.namesList.childNodes[i+1].childNodes[1].innerHTML = address;
					else
						this.namesList.childNodes[i].childNodes[1].innerHTML = address;
					break;
				}
			}
		}
	},
	
	updateList:function(range, isDelete){
		if(isDelete){
			var l = this.nameRangeList.length;
			for(var i=0;i<l;i++){
				if(this.nameRangeList[i].getId() == range.getId()){
					var ilist = i;
					if(this.emptyInfo)	
						ilist++;
					if(dojo.hasClass(this.namesList.rows[ilist],'selected'))
					{
						var selectNext = i;
						if(i == l-1){
							selectNext = i - 1;
						}else {
							selectNext = i + 1;
						}
						if(selectNext >= 0)
							this.onSelected(this.nameRangeList[selectNext]);
					}	
					this.nameRangeList.splice(i,1);						
					this.namesList.deleteRow(ilist);					
					//this._reset();	
					break;
				}
			}
			if(this.nameRangeList.length == 0){
				this._showEmptyInfo(true);
				this.nameHdl.currAddress = ""; 
			}
		}else{
			var nls = dojo.i18n.getLocalization("websheet.dialog","nameRange");
			var searchIndex = this._search(range);
			if(searchIndex <= 0)
			{
				searchIndex *= -1;
				this.nameRangeList.splice(searchIndex, 0, range);
				var opt = null;
				//There may be an tr used as the 'emptyInfo' which is shown when no namerange exist, skip this tr (it's always the first one if exist).
				if(this.emptyInfo) searchIndex++;
				opt = this.namesList.insertRow(searchIndex);
				
				var optDiv = dojo.create('div', null, dojo.create('td', null, opt));
				var rangeName = range.getId(), address = range.getParsedRef().getAddress();
				dojo.attr(optDiv, "tabIndex",0);	
				optDiv.appendChild(document.createTextNode(range.getId()));			
				dijit.setWaiRole(optDiv, "listitem");
				dijit.setWaiState(optDiv, "label", [nls.ACC_NAMEDRANGE, rangeName, nls.ACC_REFERSTO, address].join());
				dijit.setWaiState(optDiv, "selected", false);
				dojo.connect(optDiv,"onkeydown",dojo.hitch(this,this.onOptKeyDown, range));					
				
				if(typeof address == "string")
					address = websheet.Helper.escapeXml(address);
				dojo.create('td',{innerHTML:address},opt);
				var dBt = dojo.create('td',{title: nls.DELETE_HELP},opt);
				var dDiv = dojo.create('div', null, dBt);
				dojo.attr(dDiv, "tabIndex",0);	
				dDiv.appendChild(document.createTextNode(' X '));
				dijit.setWaiRole(dDiv, "button");
				dijit.setWaiState(dDiv, "label", [nls.DELETE_NAME, rangeName].join());
				dojo.connect(dDiv,"onkeydown",dojo.hitch(this,this.ondDivKeyDown, range));
				dojo.addClass(dBt,"nrDeleteBt");
				dojo.connect(opt,"onclick", dojo.hitch(this,this.onSelected,range));			
				dojo.connect(dBt,"onclick", dojo.hitch(this,this.onDelete,range));
				setTimeout(dojo.hitch(this,this.onSelected,range), 50);
			}
			if(this.nameRangeList.length == 1)
				this._showEmptyInfo(false);	
		}
	},
	
	_search: function(range)
	{
		var low = 0;
		var high = this.nameRangeList.length - 1;
		var listId = null, searchId = range.getId();
		while(low <= high){
			var mid = (low + high) >> 1;
			listId = this.nameRangeList[mid].getId();
			if (listId < searchId)
				low = mid + 1;
		    else if (listId > searchId)
		    	high = mid - 1;
		    else
		    	return mid; // key found
		}
		return -(low);
	},
	
	_onNew: function(editor)
	{	
		this.nameHdl.showNewNrDlg();		
	},
	_onModify: function(editor)
	{		
		if(!dojo.trim(this.inputText)){
			this.setWarningMsg(this.emptyMsg);
			this.warnMsg = this.emptyMsg;
			return;
		}
		var isValidAddr = this.nameHdl._addressSerialize(this.inputText);
		if(!isValidAddr){
			this.setWarningMsg(this.invalidMsg);	
			this.warnMsg = this.invalidMsg;
		}
		else
			this.nameHdl.setSelectedRange();
		this.modifyBtn.setDisabled(true);		
		this.nameHdl.refChanged = false;
		this.nameHdl.manualInput = false;		   
	},
	
	setWarningMsg: function (msg) {
		this.inherited( arguments );
		if(this.hideWarnMsg)
			this.referHelp.style.display = '';
		else
			this.referHelp.style.display = 'none';
	},
	
	_onRefChange:function(){
		this.inputText = this.inputBox.get("value");
		this.nameHdl.onRefChange(this.inputText);
		this.modifyBtn.setDisabled(!this.nameHdl.refChanged);			
		this._reset();
		this.warnMsg = "";
	},
	
	_preClose: function(){
		this.nameHdl.closeManageDlg();
		this.nameHdl.isDlgShow = false;
		dijit._underlay.domNode.style.display = '';		
		this.editor.enableUI(false);
		this.editor.focus2Grid();
	},
	
	onKeyPress: function (e) {
		var dk = dojo.keys;
		if (e.keyCode == dk.ENTER)
			this._onModify(this.nameHdl);
		else {
			if (!this.hideWarnMsg) this.setWarningMsg("");
		}
		if (document.activeElement == this.inputBox.focusNode)
		{
			var key = e.keyCode;
			if (key == 0 && e.charOrCode == " " && (e.shiftKey || e.ctrlKey || e.metaKey))
			{
				key = dk.SPACE;
			}
			switch(key)
			{
				case dk.LEFT_ARROW:
				case dk.RIGHT_ARROW:
				case dk.UP_ARROW:
				case dk.DOWN_ARROW:
				case dk.PAGE_UP:
				case dk.SPACE:
				case dk.PAGE_DOWN:
					if(e.keyChar == "" || (e.charOrCode == " " && e.shiftKey || e.ctrlKey || e.metaKey))
					{
						var grid = this.editor.getCurrentGrid();
						grid.selection.moveRangePicker(e);
						this.nameHdl._addressSerialize();
						this.nameHdl.highLightAddr(this.nameHdl.currAddress);
						dojo.stopEvent(e);
						return;
					}
				default:
					break;
			}
		}
	},
	onOk: function (editor)
	{
		this._preClose();	
	},
	onCancel: function (editor) {
		this._preClose();	
	}
});	