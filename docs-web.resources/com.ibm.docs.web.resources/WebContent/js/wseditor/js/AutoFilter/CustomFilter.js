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

dojo.provide("websheet.AutoFilter.CustomFilter");
dojo.require("concord.widgets.concordDialog");
dojo.require("websheet.AutoFilter.FilterConditionBtn");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("websheet.AutoFilter","CustomFilter");

dojo.declare('websheet.AutoFilter.CustomFilter', [concord.widgets.concordDialog],{
	
	col: 0,
	sheetName: null,
	colId: null,
	sheetId: null,
	constructor: function() 
	{
	},
	
	createContent: function (contentDiv) 
	{
		this.nls = dojo.i18n.getLocalization("websheet.AutoFilter","CustomFilter");
		
//		dojo.style(contentDiv,"width", "450px");
//		dojo.style(contentDiv,"height", "120px");
		this.header = dojo.create("div",{innerHTML:this.nls.header,style:{"marginBottom":"5px"}},contentDiv);
		//condition 1 div 
		var cond1Div = dojo.create("div",{style:{"marginBottom":"5px"}},contentDiv);
		var btn1 = this.conditionBtn1 = new websheet.AutoFilter.FilterConditionBtn({title:this.nls.acc3 + " " + this.nls.acc1});
		btn1.placeAt(cond1Div);
		dojo.style(btn1.domNode,"height","26px");
		
		this.condition1 = dojo.create("input",{
			type:"text",
			"class":"customFilterConditionInputbox", 
			"title":this.nls.acc1
		},cond1Div);
		if (BidiUtils.getTextDir() != "")
			dojo.attr(this.condition1, "dir",BidiUtils.getTextDir());
		if (dojo.attr(this.condition1, "dir") == "contextual")
				    dojo.connect(this.condition1, 'onkeyup', dojo.hitch(this, function(){
    				this.condition1.dir = BidiUtils.calculateDirForContextual(this.condition1.value);
			    }));

		
		dijit.setWaiState(this.condition1,"label",this.nls.acc1);
		dijit.removeWaiState(this.conditionBtn1.focusNode, 'labelledby');
		
		dojo.connect(this.conditionBtn1,"setCondition",this,dojo.hitch(this,this._changeConditionHeight,this.conditionBtn1,this.condition1));
		dojo.connect(this.condition1,"onkeydown",this,this.onKeyPress);
		// and or radio button
		var middleButtonDiv;
		if (BidiUtils.isGuiRtl())
			middleButtonDiv = dojo.create("div",{style:{"marginRight":"50px"}},contentDiv);
		else
			middleButtonDiv = dojo.create("div",{style:{"marginLeft":"50px"}},contentDiv);
		this.andBtn = new dijit.form.RadioButton({
			id: "filter_and_btn",
			name: "filter_condition",
			"class":"lotusCheckbox",
			value: 'and',
			checked: true
		}, 'filter_and_btn');
		
		this.andBtn.placeAt(middleButtonDiv);
//		dojo.style(this.andBtn.domNode,{clear:"left", "float":"left"});
		dojo.create("label",{
			"class":"lotusCheckbox", 
			"for":"filter_and_btn", 
//			style:'float:left',
			innerHTML:this.nls.and},middleButtonDiv);
		
		this.orBtn = new dijit.form.RadioButton({
			id: "filter_or_btn",
			name: "filter_condition",
			"class":"lotusCheckbox",
			value: 'or'
		}, 'filter_or_btn');
		
		this.orBtn.placeAt(middleButtonDiv);
		dojo.style(this.orBtn.domNode,{"marginLeft":"20px"});
		dojo.create("label",{
			"class":"lotusCheckbox", 
			"for":"filter_or_btn", 
//			style:"float:left",
			innerHTML:this.nls.or},middleButtonDiv);
		
		//////condition 2 div 
		var cond2Div = dojo.create("div",{style:{"marginTop":"5px"}},contentDiv);
		var btn2 = this.conditionBtn2 = new websheet.AutoFilter.FilterConditionBtn({title:this.nls.acc3 + " " + this.nls.acc2});
		btn2.placeAt(cond2Div);
		dojo.style(btn2.domNode,"height","26px");
		
		this.condition2 = dojo.create("input",{
			type:"text",
			"class":"customFilterConditionInputbox", 
			"title":this.nls.acc2
		},cond2Div);
		if (BidiUtils.getTextDir() != "")
			dojo.attr(this.condition2, "dir",BidiUtils.getTextDir());
		if (dojo.attr(this.condition2, "dir") == "contextual")
				    dojo.connect(this.condition2, 'onkeyup', dojo.hitch(this, function(){
    				this.condition2.dir = BidiUtils.calculateDirForContextual(this.condition2.value);
			    }));
		dijit.setWaiState(this.condition2,"label",this.nls.acc2);
		dijit.removeWaiState(this.conditionBtn2.focusNode, 'labelledby');
		
		dojo.connect(this.conditionBtn2,"setCondition",this,dojo.hitch(this,this._changeConditionHeight,this.conditionBtn2,this.condition2));
		dojo.connect(this.condition2,"onkeydown",this,this.onKeyPress);
		////hints
		var hintsDiv = dojo.create("div",{style:{"marginTop":"5px"}},contentDiv);
		dojo.create("div",{
			innerHTML:this.nls.hint1},hintsDiv);
		dojo.create("div",{
			innerHTML:this.nls.hint2},hintsDiv);
		
		this._updateConditionLabels();
	},
	
	_changeConditionHeight: function(conditionBtn, conditonInput)
	{
		if(conditionBtn.selected == "")
			conditonInput.style.height = "11px";
		else
		{
			conditonInput.style.height = "14px";
			this.setWarningMsg("");
		}
			
	},
	
	_updateConditionLabels: function()
	{
		//For ACC, JAWS reading
		dijit.setWaiState(this.conditionBtn1.focusNode, "label", this.header.textContent + " " + this.conditionBtn1.containerNode.textContent);
		dijit.setWaiState(this.conditionBtn2.focusNode, "label", this.header.textContent + " " + this.conditionBtn1.containerNode.textContent);
	},
	
	setDialogID: function() {
		this.dialogId ="S_d_custom_filter";
	},
	
	show: function()
	{
		try{
			this._setState();
			this.inherited(arguments);
		}catch(e)
		{
			console.log(e);
		}
	},
	
	_updateHeader: function(value)
	{
		//max show 70 characters here
		if(value.length > 70)
		{
			value = websheet.Utils.truncateStrWithEllipsis(value,70);
		}
		
		this.header.innerHTML = websheet.Helper.escapeXml(value);
		this._updateConditionLabels();
	},
	
	_setState: function()
	{
		//reset
		//for the first condition , default set equal
		this.conditionBtn1.setCondition("=");
		this.condition1.value = "";
		this.conditionBtn2.setCondition("");
		this.condition2.value = "";
		this.andBtn.setChecked(true);
		
		var filter = this.editor.getAutoFilterHdl().getFilter(this.sheetName);
		if(!filter)
			return;
		
		var headerValue = filter.getHeaderShowValue();
		if (BidiUtils.isBidiOn())
			headerValue = BidiUtils.addEmbeddingUCC(headerValue);
		this._updateHeader(this.nls.header + " " + headerValue);
		
		var rule = this.rule = filter.getRule(this.col);
		
		if(!rule || !rule.rules)
			return;
		
		if(rule.and==1)
			this.andBtn.setChecked(true);
		else
			this.orBtn.setChecked(true);
		
		for(var i=0;i<rule.rules.length;i++)
		{
			if(i>1)  //only support 2 rules
				break;
			var item = rule.rules[i];
			if(!item)
				break;  //should never happen
			var btn = this["conditionBtn" + (i+1)];
			var text = this["condition" + (i+1)];
			
			if(item.op==">" || item.op==">=" || item.op=="<" || item.op=="<=")
			{
				btn.setCondition(item.op);
				text.value = item.v;
			}
			else
			{
				var v = item.v;
//				if(!v)
//					continue;  //should never happen
				
				var logic = "";
				if(item.op == "!=")
					logic = "!";
				
				if(v[0]=="*" && v[v.length-1]=="*" &&  //contains 
				   (v.length<=1 ||(v.length>1 && v[v.length-2]!="~"))) // ~* should be treat as a common character 
				{
					btn.setCondition( logic + "*a*");
					text.value = v.substring(1,v.length-1);
				}
				else if(v[0]=="*")  //end with
				{
					btn.setCondition(logic + "*a");
					text.value = v.substring(1,v.length);
				}
				else if(v[v.length-1]=="*") //start with
				{
					btn.setCondition(logic + "a*");
					text.value = v.substring(0,v.length-1);
				}
				else
				{
					btn.setCondition(logic + "=");
					text.value = v;
				}
			}
		}
	},
	
	onOk: function ()
	{
        var docObj = this.editor.getDocumentObj();
        var sheet = docObj.getSheetById(this.sheetId);
        if (sheet==null) 
        	return; // sheet is deleted
		this.sheetName = sheet.getSheetName();
		var colIdx = sheet.getColIndex(this.colId);
		if (colIdx<0)
			return; // column is deleted
		this.col = colIdx + 1; // ensure the col index is correct in co-editing
		var filter = this.editor.getAutoFilterHdl().getFilter(this.sheetName);
		if (filter == null)
			return; // filter is deleted
		var rules = [];
		for(var i=1;i<=2;i++)
		{
			var btn = this["conditionBtn" + i];
			var cond = btn.selected;
			if(cond == "")
			{
				if(i==1)
				{
					this.setWarningMsg(this.nls.error);
					btn.focus();
					return false;
				}
				else
					continue;
				
			}
			var text = this["condition" + i];
			var v = text.value;
			if(!v) v ="";
			v = filter._trimSpace(v);
//			if(!v)
//			{
//				if(i==1)
//				{
//					this.setWarningMsg(this.nls.error);
//					text.focus();
//					return false;
//				}
//				else
//					continue;
//			}
			
			var rule = {};
			if(cond==">" || cond==">=" || cond=="<" || cond=="<=")
			{
				rule.op = cond;
				rule.v = v;
			}
			else
			{
				if(cond[0]=="!")
				{
					cond = cond.substring(1);
					rule.op = "!=";
				}
				if(cond=="=")
					rule.v = v;
				else
					rule.v = cond.replace("a", v);
			}
			rules.push(rule);
		}
		
		var newRule = {};
		newRule.and = this.andBtn.checked ? 1:0;
		
		newRule.rules = rules;
		
		//check if the rule is changed
		var changed = false;
		if(this.rule)
		{
			if(this.rule.and != newRule.and)
				changed = true;
			
			var len = newRule.rules.length;
			if(!changed && this.rule.rules.length != len)
				changed = true;
			
			for(var i=0;i<len && !changed;i++)
			{
				var item = newRule.rules[i];
				var item1 = this.rule.rules[i];
				if(item.op != item1.op)
				{
					changed = true;
					break;
				}
				if(item.v != item1.v)
				{
					changed = true;
					break;
				}
			}
		}
		else
			changed = true;
		
		if(changed)
		{
			var data = {type:"custom", set:newRule};
			this.editor.execCommand(window.commandOperate.FILTERROWS,[this.col, data]);
		}
	}
});