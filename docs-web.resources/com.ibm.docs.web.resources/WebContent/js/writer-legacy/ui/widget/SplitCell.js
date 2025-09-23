dojo.provide("writer.ui.widget.SplitCell");
dojo.requireLocalization("concord.widgets","SplitCellDlg");
dojo.require("concord.widgets.concordDialog");
dojo.require("dijit.Dialog");
dojo.require("dijit.Tooltip");
dojo.require("dijit.form.NumberSpinner");
dojo.declare("writer.ui.widget.SplitCell", [concord.widgets.concordDialog], {
	
	_focueCell:null,
	onShow : function()
	{
		this.inherited( arguments );	
		this._value = this.getValidValue();
		this.initErrorMessage();
		this.initConstraints();
		this._rowValueChange();
		this._colValueChange();		
	},
	onHide : function() {
		this.inherited( arguments );
		this._focueCell = null;
	},
	onOk: function (editor)
	{
		if(this.rowNumberInput.isValid() && this.colNumberInput.isValid()){
			editor.execCommand("splitCell",{r:this.rowNumberInput.getValue(),c:this.colNumberInput.getValue()});
			return true;
		}else{
			return false;
		}
		
	},
	onCancel: function (editor)
	{
		console.info("cancel");
		return true;
	},
	reset: function(){
		console.info("reset");
	},
	setDialogID: function() {
		this.dialogId = "concord_table_splitCell";
		this.toSplitRowNumId='concord_table_splitRowNum';
		this.toSplitColNumId='concord_table_splitColNum';
	},	
	createContent: function (contentDiv){
          this.nls = dojo.i18n.getLocalization("concord.widgets","SplitCellDlg");
		  var inputContainerTable =  dojo.create('table',{},contentDiv);
		  var inputContainerTableBody =  dojo.create('tbody',{},inputContainerTable);
		  dijit.setWaiRole(inputContainerTable,'presentation');
		  var splitColNumRow = dojo.create('tr',{style:'height: 25px;'},inputContainerTableBody);
		  var td = dojo.create('td',{style:"white-space:nowrap"},splitColNumRow);
		  var label = dojo.create('label',{'for':this.toSplitColNumId},td);
		  if (dojo.isIE && dojo.isIE < 9) {
			  label.innerText = this.nls.splitColNum;
			} else {
				label.textContent = this.nls.splitColNum;
			}		 
//		  var html = '<td style="white-space:nowrap;"><label for="'+this.toSplitColNumId+'">'+this.nls.splitColNum+'</label></td>';
//		  splitColNumRow.innerHTML = html;
		  var colNumInputContainer = dojo.create('div',{style:"width:60px; margin: 5px;"},dojo.create('td',{},splitColNumRow));  		  
		  this.colNumberInput = new dijit.form.NumberSpinner({
			    value: 1,
			    smallDelta: 1,
			    constraints: { min:1, max:5, places:0 },//{ min:1, max:10, places:0 },
			    id: this.toSplitColNumId,
			    style: "width:60px"
		  }, colNumInputContainer );
		  dojo.style(this.colNumberInput.upArrowNode,"display","block");
		  dojo.style(this.colNumberInput.downArrowNode,"display","block");
		  var rowNumTR = dojo.create('tr',{style:'height: 25px;'},inputContainerTableBody);
		  var td = dojo.create('td',{style:"white-space:nowrap"},rowNumTR);
		  var label = dojo.create('label',{'for':this.toSplitRowNumId},td);
		  if (dojo.isIE && dojo.isIE < 9) {
			  label.innerText = this.nls.splitRowNum;
			} else {
				 label.textContent = this.nls.splitRowNum;
			}		 
//		  rowNumTR.innerHTML =  '<td style="white-space:nowrap;"><label for="'+this.toSplitRowNumId+'">'+this.nls.splitRowNum+'</label></td>';
		  var rowNumInputContainer = dojo.create('div',{style:"width:60px; margin: 5px;"},dojo.create('td',{},rowNumTR));  
		  this.rowNumberInput = new dijit.form.NumberSpinner({
			    value: 1,
			    smallDelta: 1,
			    constraints: { min:1, max:5, places:0 },
			    id: this.toSplitRowNumId,
			    style: "width:60px"
		  }, rowNumInputContainer );
		  dojo.style(this.rowNumberInput.upArrowNode,"display","block");
		  dojo.style(this.rowNumberInput.downArrowNode,"display","block");		
		  this.rowNumberInput.adjust = this._adjust;
		  this.rowNumberInput.rangeCheck = this.rangeCheck;
		  this.rowNumberInput._isDefinitelyOutOfRange = this._isDefinitelyOutOfRange;
		  this.colNumberInput.adjust = this._adjust;
		  this.colNumberInput.rangeCheck = this.rangeCheck;
		  this.colNumberInput._isDefinitelyOutOfRange = this._isDefinitelyOutOfRange;
//		  window._numInput = this.rowNumberInput;

	},
	setFocuCell:function(cell){
		this._focueCell = cell;
	},
	getValidValue:function(){
		var value = {};
		value.r=[];
		value.c=[];
		var cellRowSpan  =this._focueCell.getRowSpan();
		var cellColSpan  =this._focueCell.getColSpan();
		if(cellRowSpan>1){
			for(var i=1;i<=cellRowSpan;i++){
				if(cellRowSpan%i==0){
					value.r.push(i);
				}
			}
		}else{
			for(var i=1;i<=5;i++){
				value.r.push(i);
			}
		}
		if(cellColSpan>1){
			for(var i=1;i<=cellColSpan;i++){
				if(cellColSpan%i==0){
					value.c.push(i);
				}
			}
		}else{
			for(var i=1;i<=5;i++){
				value.c.push(i);
			}
		}
		return value;
	},
	initErrorMessage:function(){
		var rowValue = this._value.r;
		var rowStr = dojo.string.substitute(this.nls.inputError,{0:rowValue.join(",")});
		this.rowNumberInput.invalidMessage = rowStr;
		this.rowNumberInput.rangeMessage = rowStr;
		this.rowNumberInput.promptMessage = rowStr;
		var colValue = this._value.c;
		var colStr = dojo.string.substitute(this.nls.inputError,{0:colValue.join(",")});
		this.colNumberInput.invalidMessage = colStr;
		this.colNumberInput.rangeMessage = colStr;
		this.colNumberInput.promptMessage = rowStr;
	},
	initConstraints:function(){
		var rowValue = this._value.r;
		this.rowNumberInput.constraints = { min:rowValue[0], max:rowValue[rowValue.length-1], places:0 };
		this.rowNumberInput._validValue = rowValue;
		this.rowNumberInput.setValue(rowValue[0]);
		var colValue = this._value.c;
		this.colNumberInput.constraints = { min:colValue[0], max:colValue[colValue.length-1], places:0 };
		this.colNumberInput._validValue = colValue;
		this.colNumberInput.setValue(colValue[0]);
	},
	_valueChangeLock:false,
	_rowValueChange:function(){
		var that = this;
		var defaultRowValue = this._value.r[0];
		dojo.connect(this.rowNumberInput,"_setValueAttr",this.rowNumberInput,function(){
			valueChange(this.getValue());
		});
		this.rowNumberInput.textbox.oninput = function(){
			if(that.rowNumberInput.isValid()){
				valueChange(that.rowNumberInput.getValue());
			}else{
				console.info("inValid value");
			}
			
		};
		var valueChange = function(value){
			if(that._valueChangeLock){
				return;
			}else{
				that._valueChangeLock=true;
			}
			var cellRowSpan  =that._focueCell.getRowSpan();
			var cellColSpan  =that._focueCell.getColSpan();
			if((cellColSpan==1||cellRowSpan==1)&& value!=defaultRowValue){
				that.colNumberInput.setValue(1);
			}
			that._valueChangeLock=false;
		};
	},
	_colValueChange:function(){
		var that = this;
		var defaultColValue = this._value.c[0];
		dojo.connect(this.colNumberInput,"_setValueAttr",this.colNumberInput,function(){
			valueChange(this.getValue());
		});
		this.colNumberInput.textbox.oninput = function(){
			if(that.colNumberInput.isValid()){
				valueChange(that.colNumberInput.getValue());
			}else{
				console.info("inValid value");
			}
			
		};
		var valueChange = function(value){
			if(that._valueChangeLock){
				return;
			}else{
				that._valueChangeLock=true;
			}
			var cellRowSpan  =that._focueCell.getRowSpan();
			var cellColSpan  =that._focueCell.getColSpan();
			if((cellRowSpan==1||cellColSpan==1) && value!=defaultColValue){
				that.rowNumberInput.setValue(1);
			}
			that._valueChangeLock=false;
		};
	},
	_adjust:function(value,step){
		var index = this._validValue.indexOf(value)+step; 
		if(index>= this._validValue.length){
			return this._validValue[this._validValue.length-1];
		}
		if(index<=0){
			return this._validValue[0];
		}
		return this._validValue[index];
	},
	rangeCheck: function(value){
		if(this._validValue.indexOf(value)<0){
			return false;
		}
		return true;
	},
	_isDefinitelyOutOfRange:function(value){
		var val = this.get('value');
		if(this._validValue.indexOf(value)<0){
			return true;
		}
		return false;
	}
});