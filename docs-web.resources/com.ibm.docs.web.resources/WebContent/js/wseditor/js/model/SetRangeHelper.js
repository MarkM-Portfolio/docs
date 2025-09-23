dojo.provide("websheet.model.SetRangeHelper");

dojo.require("websheet.model.ModelHelper");
dojo.require("websheet.Constant");

/**
 * provide the basic framework to merge events with models
 */
dojo.declare("websheet.model.BasicMerger",null,{
	start			: -1,   // integer 1-based, the start of the event range 
	end				: -1,   // integer 1-based, the end of the event range
	index			: -1,
	events			: null, // json array
	sheet			: null,	// sheet model 
	bReplace		: false,// boolean, true means using event to replace model
	bColumn			: false,// boolean, true means column operations
	
	modelHelper		: websheet.model.ModelHelper,
	constant		: websheet.Constant,
	
	constructor: function(args)
	{
		if(args && args.bReplace)
			this.bReplace = true;
		if(args && args.bColumn)
			this.bColumn = true;
	},
	
	setStartIndex: function(index)
	{
		this.start = index;
	},
	
	setEndIndex: function(index)
	{
		this.end = index;
	},
	
	setEventList: function(events)
	{
		this.events = events;
	},
	
	setSheet: function(sheet)
	{
		this.sheet = sheet;
	},
	
	doMerge: function()
	{
		var pEvent = 0; // the pointer to the current consumed event 
		this.index = this.start;
		
		this.onStart();
		
		var event, eventIndex, eventRepeat ;
		var modelIndex, modelRepeat;
		
		while(this.index <= this.end)
		{
	        // pick up eventModel
	        event = null;
	        if(this.events != null && pEvent < this.events.length)
	        {
	        	event = this.events[pEvent];
	        	eventIndex = event.index;
	        	if(eventIndex > this.index)
	        	{
	                eventRepeat = eventIndex - this.index;
	                eventIndex =  this.index;
	                event = null;
	        	}	
	        	else if(eventIndex == this.index)
	        	{
	        		var tmpRep = (event.rn) ? parseInt(event.rn) : 0;
	                eventRepeat = Math.min(tmpRep + 1, this.end - this.index + 1);
	                pEvent++;
	        	}	
		        else
		        {
		        	throw "event index " + eventIndex + " before index " + this.index + ", setRange in error.";
		        }	
	        }	
	        else
	        {
	            // no more event models, event is null
	            eventIndex = this.index;
	            eventRepeat = this.end - this.index + 1;
	        }	
	        
	        // consume event, decrease eventRepeat and increase index
	        while(eventRepeat > 0)
	        {
	        	if (this.hasNextModel())
	        	{
	        		modelIndex = this.getModelIndex();
	                // since we looked down every index from start, we can't miss any model
	                // so model index can be only greater than, or equal to index
	                if (modelIndex > this.index)
	                {
	                  modelRepeat = Math.min(modelIndex - this.index - 1, eventRepeat - 1);
	                  this.createModel(event, modelRepeat);
	                  eventRepeat = eventRepeat - modelRepeat - 1;
	                  this.index += modelRepeat + 1;
	                }
	                else if (modelIndex == this.index)
	                {
	                  this.divideModel(this.index + eventRepeat - 1);
	                  // changeModel() returns repeat consumed, it includes the master model,
	                  // so the repeat is already +1
	                  modelRepeat = this.changeModel(event);
	                  eventRepeat = eventRepeat - modelRepeat - 1;
	                  this.index += modelRepeat + 1;
	                }
	                else
	                {
	                  throw "model index " + modelIndex + " before index " + this.index + ", setRange in error.";
	                }
	        	}	
	        	else
	        	{
	                this.createModel(event, eventRepeat - 1);
	                this.index += eventRepeat;
	                eventRepeat = 0; 
	        	}	
	        }	
		}	
	},
	
	// called when merging process starts
	onStart: function(){},
	
	// returns current model index, can only be called when has next model
	getModelIndex: function(){},
	
	// returns if current model list has next model
	hasNextModel: function(){},
	
	// create new model from event. the new model starts at current index and repeat to provided repeat
	createModel: function(/*json event*/event, /*integer*/repeat) {},
	
	// split current model to make sure the model end at or before index end.
	divideModel: function(/*integer*/ end){},
	
	// change model by applying the event, returns repeat that consumed
	changeModel: function(/*json event*/event){}
}); 

dojo.declare("websheet.model.ColumnMerger",websheet.model.BasicMerger,{
	modelColumns	: null,
	pModelColumns	: -1,
	currentColumn	: null,
	
	onStart: function()
	{
		this.modelColumns = this.sheet._columns;
		
		// find start
		this.modelHelper.splitColumn(this.sheet, this.start, this.constant.Position.PREVIOUS);
	 	var pos = this.sheet.getColumnPosition(this.start, false);
	 	if (pos < 0) {
	 		pos = -(pos + 1);
	 	}
	 	this.pModelColumns = pos;
	 	
	 	
	 	if(this.pModelColumns < this.modelColumns.length)
	 	{
	 		this.currentColumn = this.modelColumns[this.pModelColumns];
	 	}
	 	else
	 	{
	 		this.currentColumn = null;
	 	}
	},
	
	getModelIndex: function()
	{
		return this.currentColumn.getIndex();
	},
	
	hasNextModel: function()
	{
		return this.currentColumn != null;
	},
	
	createModel: function(/*json event*/event, /*integer*/repeat)
	{
		if(this.index > this.constant.MaxColumnIndex)
			return;
		
		if(event == null)
		{
			;// do nothing here,cause there is no model and the event is null too 
		}	
		else
		{
			var styleManager = this.sheet._parent._getStyleManager();
			var styleId = null;
			if(event.style && !event.style.id)
			{
				if(this.sheet._bProtected && !event.style[this.constant.Style.PROTECTION_UNLOCKED] && !websheet.style.DefaultStyleCode[this.constant.Style.PROTECTION_UNLOCKED]){
				    var styleB = dojo.clone(event.style);
					styleB[this.constant.Style.PROTECTION_UNLOCKED] = true;
					styleId = styleManager.addStyle(styleB);
				}
				else
					styleId = styleManager.addStyle(event.style);
			}	
			var column = this.sheet._createColumn(this.index,null,event[websheet.Constant.Style.WIDTH],styleId,repeat);
			if(event.visibility)
				column.setVisibility(event.visibility);
			this.pModelColumns++;
		}
	},
	
	divideModel: function(/*integer*/ end)
	{
		var repNum = this.currentColumn.getRepeatedNum() ? this.currentColumn.getRepeatedNum() : 0;
		if (this.currentColumn.getIndex() + repNum > end)
		{
			this.modelHelper.splitColumn(this.sheet, end + 1, this.constant.Position.PREVIOUS);
		}
	},
	
	changeModel: function(/*json event*/event)
	{
		var repeat = this.currentColumn.getRepeatedNum() ? this.currentColumn.getRepeatedNum() : 0;
		this.pModelColumns++;

		var column = this.currentColumn;
		
		if(this.pModelColumns < this.modelColumns.length)
		{
			this.currentColumn = this.modelColumns[this.pModelColumns];
		}	
		else
			this.currentColumn = null;
		
		if(this.bReplace)
		{
			if(this.sheet._bProtected && !websheet.style.DefaultStyleCode[this.constant.Style.PROTECTION_UNLOCKED])
				column.setStyleId(column._doc._styleManager.addStyle({unlocked : true}));			
			else
				column.setStyleId(null);
			column.setVisibility(null);
			column.setWidth(null);
		}
		this._mergeColAttr(event, column);
	    return repeat;
	},
	
	_mergeColAttr: function(eventData, column)
	{
		if(!eventData) return;
		if(eventData.style)
		{
			var styleManager = this.sheet._parent._getStyleManager();
			var newStyleId = null;
			//if there are style.id, means default cell style
			if(!eventData.style.id)
			{
				if(column._styleId)
				{
					newStyleId = styleManager.changeStyle(column._styleId,eventData.style); 
				}	
				else
				{
					newStyleId = styleManager.addStyle(eventData.style);
				}	
			}	
			column.setStyleId(newStyleId);
		}	
		var wcs = websheet.Constant.Style;
	    if(eventData[wcs.WIDTH] !== undefined)
	       column.setWidth(eventData[wcs.WIDTH]);
	    if (eventData.visibility)
	       column.setVisibility(eventData.visibility);
	}
});