/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.widgets.Zoomer");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.number");
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.requireLocalization("viewer.widgets", "Zoomer");

dojo.declare(
	"viewer.widgets.Zoomer",
	[dijit._Widget, dijit._Templated],
	{
		templateString: dojo.cache("viewer.widgets", "templates/Zoomer.html"),
		index:3,
		widgetsInTemplate: true,
		viewManager: null,
		percentage: 0,
		
		values:[],
		scaleValues:['0.10','0.25','0.50','0.75','1.00','1.25','1.50','2.00','4.00'],
		options:null,
		
		postMixInProperties: function()
		{
			var _nlsResources = dojo.i18n.getLocalization("viewer.widgets", "Zoomer");
			dojo.mixin(this, _nlsResources);
			this.inherited(arguments);
		},
		
		postCreate: function()
		{	
			this.buildScaleValue();
			this.updateInputStyle();
			dojo.subscribe(viewer.util.Events.SCALE_CHANGED, this, this._onUpdateCombox);
			this.inherited(arguments);
		},
		buildScaleValue:function()
		{
			this.options = new dojo.data.ItemFileWriteStore({data: {identifier: 'name', items:[]}});
			dojo.forEach(this.scaleValues,function(item){
				this.values = this.values.concat(this.float2percentage(item));
				this.options.newItem({name: this.float2percentage(item)});
			},this);		
			var oldStore = this.sizeSelector.attr("store"); //free memory
			if(oldStore)
				delete oldStore;
	     	this.sizeSelector.attr('store',this.options);
		},
		updateInputStyle:function()
		{
//			dojo.query('input',this.sizeSelector.domNode).forEach(
//					function(node,index,array){
//						dojo.style(node,{
//							'height':'22px',
//							'background':'#FFFFFF'
//						});
//						dojo.attr(node, 'readonly', 'true');
//					}
//				);
			dojo.attr(this.sizeSelector.textbox, 'readonly','true');
//			dojo.style(this.sizeSelector.textbox, {'height': '22px'}); // FIXME incorrect code, need to find root cause 
		},
		_onZoomInSelect: function()
		{
			var newIndex=Math.floor(this.index+1);
			if(newIndex>=0&&newIndex<this.values.length)
				this.sizeSelector.setValue(this.values[newIndex]);
		},

		_onZoomOutSelect: function()
		{
			var newIndex=Math.ceil(this.index-1);
			if(newIndex>=0&&newIndex<this.values.length)
				this.sizeSelector.setValue(this.values[newIndex]);
		},
		
		_onSizeChange:function(per){
			var val=this.percentage2float(per);
			if(val<this.scaleValues[0])
			{
				this.zoomIn.attr('disabled', false);
				this.zoomOut.attr('disabled', true);
				return;
			}
			else if(val>this.scaleValues[this.values.length-1])
			{
				this.zoomIn.attr('disabled', true);
				this.zoomOut.attr('disabled', false);
				return;
			}
			else
			{
				for(var i=0;i<this.scaleValues.length;i++)
				{
					if(val==this.scaleValues[i])
					{
						this.index=i;
						break;
					}
					else if(val>this.scaleValues[i]&&val<this.scaleValues[i+1])
					{
						this.index=i+0.5;
						break;
					}
				}
			}
			if(this.index==this.values.length-1)
			{
				this.zoomIn.attr('disabled', true);
				this.zoomOut.attr('disabled', false);
			}
			else if(this.index==0)
			{
				this.zoomIn.attr('disabled', false);
				this.zoomOut.attr('disabled', true);
			}
			else
			{
				this.zoomIn.attr('disabled', false);
				this.zoomOut.attr('disabled', false);
			}
			
			for(var i=0;i<this.values.length;i++)
			{
				if(per==this.values[i])
				{
					if (this.percentage != per){ // defect 4566
						this.percentage = per;
						this.viewManager.setCurrentScale(this.scaleValues[i]);
					}
					this.index=i;
					return;
				}
			}
		},
		float2percentage:function(val)
		{
			return dojo.number.format(val,{type: "percent",pattern:this.percentFormat});
		},
		percentage2float:function(val)
		{
			return dojo.number.parse(val,{type: "percent",pattern:this.percentFormat});
		},
		_onUpdateCombox:function(newScale)
		{
			this.percentage = this.float2percentage(newScale);
			this.sizeSelector.setValue(this.percentage);
		}
	});