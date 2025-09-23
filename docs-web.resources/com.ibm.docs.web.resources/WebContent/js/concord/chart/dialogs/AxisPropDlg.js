dojo.provide("concord.chart.dialogs.AxisPropDlg");
dojo.require("concord.widgets.concordDialog");

dojo.declare("concord.chart.dialogs.AxisPropDlg",[concord.widgets.concordDialog],{
	
	nls:null,	
	changedProps: null,
	chart: null,
	error: 0,
	axisModel: null,
	
	constructor: function() {	
		this.dialog.attr("title", this.concordTitle);
		this.changedProps = {};
	},
	
	createContent: function (contentDiv) 
	{	
		//dojo.style(contentDiv,"height", "200px");
		dojo.style(contentDiv,"width", "230px");
		
		var titleDiv = dojo.create('div', {style:{"width": "220px", border:"2px solid #ccc", padding:"2px"}}, contentDiv);
		
		dojo.create('div', {innerHTML:"Title",style:{"float": "left"}}, titleDiv);
		
		var titleColorPalette = new websheet.ColorPalette();
		this.titleFontBtn = new concord.chart.widget.DropDownButton({dropDown : titleColorPalette,label:"color"}).placeAt(titleDiv);
		dojo.style(this.titleFontBtn.domNode,{"float": "right"});
		dojo.connect(titleColorPalette,"onChange", dojo.hitch(this, function()
		{
			if(this.changedProps.title==null)
				this.changedProps.title = {};
			var txPr = this.changedProps.title.txPr;
			if(txPr==null)
				txPr = this.changedProps.title.txPr = {};
			
			dojo.style(this.titleFontBtn.titleNode,{"color": titleColorPalette.value});
			txPr.color = titleColorPalette.value;
		}));
		
		this.titleFontSizeSelect = dojo.create('select', {style:{"width": "50px","height":"27px", margin:"3px"}}, titleDiv);
		dojo.style(this.titleFontSizeSelect,{"float": "right"});
		for(var i=10;i<37;i++)
			this.titleFontSizeSelect.options.add(new Option(i,i));
		
		dojo.connect(this.titleFontSizeSelect,"onchange", dojo.hitch(this, function()
		{
			if(this.changedProps.title==null)
				this.changedProps.title = {};
			var txPr = this.changedProps.title.txPr;
			if(txPr==null)
				txPr = this.changedProps.title.txPr = {};
			txPr.sz = parseFloat(this.titleFontSizeSelect.value);
		}));
		
		this.titleInput = dojo.create('input', {id: this.titleId,style:{"width": "210px", "clear":"both"}}, titleDiv);
		dojo.connect(this.titleInput,"onchange", dojo.hitch(this, function()
		{
			if(this.changedProps.title==null)
				this.changedProps.title = {};
			this.changedProps.title.text = this.titleInput.value;
		}));
		
		this.scalingDiv = dojo.create('div',null,contentDiv);
		
		dojo.create('div', {innerHTML:"Max",style:{"float": "left","marginTop":"8px"}}, this.scalingDiv);
		this.maxInput = dojo.create('input', {className:"inputBox",style:{"float":"right","width":"60px","margin":"2px"}}, this.scalingDiv);
		dojo.connect(this.maxInput,"onchange", dojo.hitch(this, function()
		{
			var value = parseFloat(this.maxInput.value);
			if(isNaN(value))
			{
				this.setWarningMsg("Invalid input");
				this.error |= 1;
				this.maxInput.focus();
				return;
			}
			this.changedProps.max = value;
		}));
		
		dojo.create('div', {innerHTML:"Min",style:{"float": "left", "clear":"both","marginTop":"8px"}}, this.scalingDiv);
		this.minInput = dojo.create('input', {className:"inputBox",style:{"float":"right","width":"60px","margin":"2px"}}, this.scalingDiv);
		dojo.connect(this.minInput,"onchange", dojo.hitch(this, function()
		{
			var value = parseFloat(this.minInput.value);
			if(isNaN(value))
			{
				this.setWarningMsg("Invalid input");
				this.error |= 2;
				this.minInput.focus();
				return;
			}
			this.changedProps.min = value;
		}));
		
		dojo.create('div', {innerHTML:"Major Unit",style:{"float": "left","clear":"both","marginTop":"8px"}}, this.scalingDiv);
		this.majorInput = dojo.create('input', {className:"inputBox",style:{"float":"right","width":"60px","margin":"2px"}}, this.scalingDiv);
		dojo.connect(this.majorInput,"onchange", dojo.hitch(this, function()
		{
			var value = parseFloat(this.majorInput.value);
			if(isNaN(value))
			{
				this.setWarningMsg("Invalid input");
				this.error |= 3;
				this.majorInput.focus();
				return;
			}
			this.changedProps.majorUnit = value;
		}));
		
		dojo.create('div', {innerHTML:"Minor Unit",style:{"float": "left", "clear":"both","marginTop":"8px"}}, this.scalingDiv);
		this.minorInput = dojo.create('input', {className:"inputBox",style:{"float":"right","width":"60px","margin":"2px"}}, this.scalingDiv);
		dojo.connect(this.minorInput,"onchange", dojo.hitch(this, function()
		{
			var value = parseFloat(this.minorInput.value);
			if(isNaN(value))
			{
				this.setWarningMsg("Invalid input");
				this.error |= 4;
				this.minorInput.focus();
				return;
			}
			this.changedProps.minorUnit = value;
		}));
		
		dojo.create('div',{innerHTML:"Font", style:{"clear":"both"}}, contentDiv);
		
		var fontColorPalette = new websheet.ColorPalette();
		this.fontBtn = new concord.chart.widget.DropDownButton({dropDown : fontColorPalette,label:"color"}).placeAt(contentDiv);
		dojo.style(this.fontBtn.domNode,{"float": "left"});
		dojo.connect(fontColorPalette,"onChange", dojo.hitch(this, function()
		{
			var txPr = this.changedProps.txPr;
			if(txPr==null)
				txPr = this.changedProps.txPr = {};
			
			dojo.style(this.fontBtn.titleNode,{"color": fontColorPalette.value});
			txPr.color = fontColorPalette.value;
		}));
		
		this.fontSizeSelect = dojo.create('select', {style:{"width": "50px","height":"27px", margin:"3px"}}, contentDiv);
		dojo.style(this.fontSizeSelect,{"float": "left"});
		for(var i=10;i<37;i++)
			this.fontSizeSelect.options.add(new Option(i,i));
		
		dojo.connect(this.fontSizeSelect,"onchange", dojo.hitch(this, function()
		{
			var txPr = this.changedProps.txPr;
			if(txPr==null)
				txPr = this.changedProps.txPr = {};
			txPr.sz = parseFloat(this.fontSizeSelect.value);
		}));
		
		dojo.create('div', {innerHTML:"Line Border: ",style:{"clear":"both"}}, contentDiv);
		var borderPalette = new websheet.ColorPalette();
		this.borderBtn = new concord.chart.widget.DropDownButton({dropDown : borderPalette,label:"Color"}).placeAt(contentDiv);
		dojo.connect(borderPalette,"onChange", dojo.hitch(this, function()
		{
			if(this.changedProps.spPr==null)
				this.changedProps.spPr = {};
			var ln = this.changedProps.spPr.ln;
			if(ln==null)
				ln = this.changedProps.spPr.ln = {};
			
			ln.solidFill = borderPalette.value;
			dojo.style(this.borderBtn.titleNode,{"color": borderPalette.value});
		}));
		
		this.borderWidthSelect = dojo.create('select', {style:{"width": "60px","height":"27px", margin:"3px"}}, contentDiv);
		this.borderWidthSelect.options.add(new Option("1px",1));
		this.borderWidthSelect.options.add(new Option("2px",2));
		this.borderWidthSelect.options.add(new Option("4px",4));
		this.borderWidthSelect.options.add(new Option("8px",8));
		
		dojo.connect(this.borderWidthSelect,"onchange", dojo.hitch(this, function()
		{
			if(this.changedProps.spPr==null)
				this.changedProps.spPr = {};
			var ln = this.changedProps.spPr.ln;
			if(ln==null)
				ln = this.changedProps.spPr.ln = {};
			if(!this.borderWidthSelect.value)
				ln.noFill = 1;
			else
				ln.w = parseFloat(this.borderWidthSelect.value);
			
		}));
	},	
	
	setState: function(state)
	{
		var axis = this.axisModel = state.model;
		if(axis.type && axis.type!="catAx")
		{
			if(axis.max!=null)
				this.maxInput.value = axis.max;
			if(axis.min!=null)
				this.minInput.value = axis.min;
			if(axis.majorUnit!=null)
				this.majorInput.value = axis.majorUnit;
			if(axis.minorUnit!=null)
				this.minorInput.value = axis.minorUnit;
			
			dojo.style(this.scalingDiv,{"display":""});
		}
		else
			dojo.style(this.scalingDiv,{"display":"none"});
		
		if(axis.textPro!=null && axis.textPro.color)
			dojo.style(this.fontBtn.titleNode,{"color": axis.textPro.color});
		else
			dojo.style(this.fontBtn.titleNode,{"color": ""});
		
		var spPr = axis.spPr;
		if(spPr!=null && spPr.ln)
		{
			var ln = spPr.ln;
			if(ln!=null && ln.solidFill!=null)
				dojo.style(this.borderBtn.titleNode,{"color": ln.solidFill});
		}
		
		var title = axis.title;
		if(title!=null)
		{
			this.titleInput.value = title.text;
			if(title.textPro)
				dojo.style(this.titleFontBtn.titleNode,{"color": title.textPro.color});
		}
	},
	
	setDialogID: function() {
		this.dialogId = "S_d_SeriesProp";
	},
	
	hide: function()
	{
		this.inherited(arguments);
		this.editor.show();
	},

	onKeyPressed: function(e){
		if (e.keyCode == dojo.keys.ENTER) {
			if(this.getOkBtn()){
				//move focus out input, or get its value should be old value
				this.getOkBtn().focus();
				if(this.onOk())
					this.hide();
			}			
		}
	},
	
	prepareAxis: function()
	{
		var axisList = this.editor.changedProps.axis;
		if(axisList==null)
			axisList = this.editor.changedProps.axis = {};
		var axis = axisList[this.axisModel.id];
		if(axis==null)
			axis = axisList[this.axisModel.id] = {};
		
		return axis;
	},
	
	onOk: function ()
	{		
		if(this.error!=0)
		{
			this.setWarningMsg("Invalid input");
			return false;
		}
		
		var axisList = this.editor.changedProps.axis;
		if(axisList==null)
			axisList = this.editor.changedProps.axis = {};
		var axis = axisList[this.axisModel.id];
		if(axis==null)
			axis = axisList[this.axisModel.id] = {};
		
		if("max" in this.changedProps)
		{
			if(!axis.scaling)
				axis.scaling = {};
			axis.scaling.max = this.changedProps.max;
		}
		if("min" in this.changedProps)
		{
			if(!axis.scaling)
				axis.scaling = {};
			axis.scaling.min = this.changedProps.min;
		}
		if("majorUnit" in this.changedProps)
			axis.majorUnit = this.changedProps.majorUnit;
		if("minorUnit" in this.changedProps)
			axis.minorUnit = this.changedProps.minorUnit;
		
		if("txPr" in this.changedProps)
		{
			if(axis.txPr==null)
				axis.txPr = this.changedProps.txPr;
			else
				dojo.mixin(axis.txPr,this.changedProps.txPr);
		}
		
		if("spPr" in this.changedProps)
		{
			if(axis.spPr==null)
				axis.spPr = this.changedProps.spPr;
			else
				dojo.mixin(axis.spPr,this.changedProps.spPr);
		}
		if("title" in this.changedProps)
		{
			if(axis.title==null)
				axis.title = this.changedProps.title;
			else
			{
				if("text" in this.changedProps.title)
					axis.title.text = this.changedProps.title.text;
				if("txPr" in this.changedProps.title)
				{
					if(axis.title.txPr==null)
						axis.title.txPr = this.changedProps.title.txPr;
					else
						dojo.mixin(axis.title.txPr,this.changedProps.title.txPr);
				}
			}
		}
		
		return true;
	}

});