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
dojo.provide("websheet.widget._MobileRangePickRectangle");
dojo.require("websheet.widget._MobileSelectRectangle");

dojo.declare("websheet.widget._MobileRangePickRectangle", [websheet.widget._MobileSelectRectangle], {
	// summary:
	//		Should always sync with websheet.widget._RangePickRectangle
	//		Used for mobile formula editing, chart data source editing etc.
	//		The range picking  work flow:
	//			|First|
	//			==> Start Picking Range (from data grid events handle) with pickingStart()
	//			|Second|				
	//			==> Range Picking with a cluster of selection methods (selectRow/selectColumn/selectCell/selectRange)
	//			|...repeating several times|		
	//			|Complete|
	//			==>	Range picking finished with the call of pickingComplete(), all the subscribers will be notified with a reference of this RangePickerRectangel object.
	//		Listeners need to define a call back with the following pattern,
	//			"rangePicking: function(rangePicker){}"// when range picking (changed);
	//			"rangePicked: function(rangePicker){}" // when range picking complete;
	_listeners			:			null,		//Object, list of listeners
	_isPickingRange		:			false,		//if it's picking range for something
	
	complete: function(id)
	{
		// summary:
		//		Range picking complete, mark the _isPickingRange flag with false, notify all the subscribes
		// id:		String, optional
		//		If you are giving this, you're intend to unsubscribe the range picking topic after this pick.
		if(this._isPickingRange)
		{
			for(var _id in this._listeners)
			{
				var listener = this._listeners[_id];
				if (listener.rangePicked)
				{
					listener.rangePicked(this);
				}
			}
			this._isPickingRange = false;
			this.hibernate().hide();
			(id) && this.unsubscribe(id);
		}
	},
	
	destroy: function () {
		// summary:
		//		Range picker is a singleton. 
		//		We will add this widget to a specific grid when picking range, 
		//		so dojo will destroy this when grid destroyed, but this picker should not be destroyed with data grid once it has been created.
		//		Do noting here, we will re-use this picker by attaching it to another grid with SelectionManager's pick().
	},
	
	isSelecting: function () {
		// summary:
		//		Selecting means if current rectangle should handle the mouse events the data grid delievered.
		// overwrite, range picker's selecting status is marked with "_isPickingRange"
		// while Select rectangle's selecting stauts is marked with "_isSelecting".
		return this._isPickingRange;
	},
	
	/*Boolean*/picking: function()
	{
		// summary:
		//		Simple get method for the flag's status
		return this._isPickingRange;
	},
	
	/*Object*/onupdateui: function()
	{
		// summary:
		//		Render self, but not notify in some cases (see _notify for more details), since it's not actively picking & rendering
		this._updating = true;
		this.inherited(arguments);
		this._updating = false;
		return this;
	},
	
	onmouseup: function(e)
	{
		// summary:
		//		Overwrite, notify name range handler or chart hander that the range picker has picked a new range, and need to perform related update
		//		
		if(this._isPickingRange)
		{
			this.grid.onMouseUp(e);
			this.complete();
		}
	},
	
	publishSelection: function(){},//do nothing for range picker,
	
	publishCellFocus: function(){},//do nothing for range picker,
	
	render: function()
	{
		// overwrite, need to 'pushStatus' when picking range, see the pushStatus method for more details
		this.inherited(arguments);
		this._notify();
	},
	
	start: function(listener)
	{
		// summary:
		//		Start picking range, will mark the _isPickingRange flag with true, all the listeners will be notified after pickingComplete.
		// listener:	Object, optional
		//		Add a new 'listener' to subscribers' list when this picking routine start.
		//		If you have already subscribed the picking topic, this argument can be ignored.
		this._isPickingRange = true;
		if(listener)
			return this.subscribe(listener);
		this.show();
	},
	
	/*String*/subscribe: function(listener)
	{
		// summary:
		//		We will make sure the given listener have not been registered to avoid repeating
		// returns:
		//		String id of the handler.
		if(listener != null)
		{
			for(var id in this._listeners)
			{
				var listen = this._listeners[id];
				if(listen == listener)
					return id;
			}
			var nid = this._generateId();
			this._listeners[nid] = listener;
			return id;
		}
	},
	
	/*Boolean*/unsubscribe: function(id)
	{
		// summary:
		//		remove the listener, unsubscribe the picking event
		// returns:
		//		Success or not.
		if(this._listeners[id])
		{
			return (delete this._listeners[id]);
		}
	},
	updateHeaderBackground: function(){/*do nothing*/},
	
	setSelectionMode: function(){/*do nothing*/},
	/***************************************************Initialize & Destroy & Inner fields***************************************************/
	_customizedInit: function()
	{
		//no _createCustomizedWidgets here, so 'this.cover, this.hotCell, this.autofill, this.earaser...' will not be created.
		//range picker have no cover, 
		this.dragNode = dojo.create('div', {className : 'select-draghandler'}, this.containerNode, 'last');
		this.coverFixed = true;
		//no autofill, no 'hot cell',
		this.autofillable = false;
		this.hotCellLocated = false;
		//and not moveable
		this.isMoveable = false;
		//and not respond to mouse events
		this._sleeping = true;
		this._listeners = [];
//		this.setBorderColor("transparent");
		this.setBorderColor('#000');
		this.setBorderStyle("dashed");
	},
	
	_generateId: function()
	{
		// return a unique id
		var self = this._generateId;
		if(self._count == null)
			return 'rp' + (self._count = 0);
		else
			return 'rp' + (self._count += 1);
	},
	
	_notify: function()
	{
		// notify to all subscribers
		if(!this._isPickingRange || (!this._scrolling && this._updating))
		//if it's scrolling now, updateui need to notify to make an immediate update for subscribers like in-line editor
		//other wise there's no need to notify since the picker has not been changed actually.
			return;
		for(var id in this._listeners)
		{
			var listener = this._listeners[id];
			if(listener.rangePicking)
				listener.rangePicking(this);
		}
	}
});
