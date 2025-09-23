/*****************************************************
 *\class	writer.model.text.Canvas
 *\base		writer.model.text.Image
 *\brief	provide a model to manage canvas that contains group or shapes.
 *\author	Hao Yu
 *\date 	2/27/2014
 *****************************************************
 */
dojo.provide("writer.model.text.Canvas");
dojo.require("writer.model.text.Image");
dojo.declare("writer.model.text.Canvas",[writer.model.text.Image],
{
	modelType: writer.MODELTYPE.CANVAS,
	WRAP : {
		//before text or after text
		wrapNone: writer.MODELTYPE.FLCANVAS,
		wrapSquare: writer.MODELTYPE.SQCANVAS,
		wrapTopAndBottom: writer.MODELTYPE.TBCANVAS
	},
	bodyPr: null,
	delayUpdate:true,

	isGroup: false,
	
	isSmartArt:false,

	_children: null,
	
	isLockedCanvas: false,

	_createChildren: function(json, modelConstructor)
	{
		for (var i = 0; i < json.length; ++i)
		{
			var newChild = new modelConstructor(json[i], this, true);
			newChild.parent = this;
			this._children.append(newChild);
		}
	},

	getChildren: function()
	{
		return this._children;
	},

	constructor: function(json, owner, simpleStruct) {
		if (simpleStruct)
			this.modelType = writer.MODELTYPE.SIMPLECANVAS;

		this._children	= new common.Container(this);
		this.simpleStruct = simpleStruct;

		//use parent's constructor to init anchor, position...
		var wpx = null;
		if (simpleStruct)
		{
			this.t = json.t;
			wpx = json;
		}
		else
		{
			this.rt = json.rt;

			wpx = json.anchor && json.anchor.graphicData && (json.anchor.graphicData.wpc || json.anchor.graphicData.wgp || json.anchor.graphicData.smartart);
			if (!wpx)
			{
				wpx = json.inline && json.inline.graphicData && (json.inline.graphicData.wpc || json.inline.graphicData.wgp || json.inline.graphicData.smartart);
			}
		}

		if (!wpx)
			return;

		this.wpx = wpx;

		if ("wgp" == this.rt || "grpSp" == this.t)
			this.isGroup = true;
		else if(this.rt == "smartart")
			this.isSmartArt = true;

		if(this.wpx.preserveNodeName == "lockedCanvas")
			this.isLockedCanvas = true;
				
		// canvas attribute
		this.wpxId = wpx.id;

		var xfrm = wpx.grpSpPr && wpx.grpSpPr.xfrm;
		if (xfrm)
		{
			this.offX = xfrm.off && xfrm.off.x || "0emu";
			this.offY = xfrm.off && xfrm.off.y || "0emu";

			this.extX = xfrm.ext && xfrm.ext.cx || "0emu";
			this.extY = xfrm.ext && xfrm.ext.cy || "0emu";

			this.chOffX = xfrm.chOff && xfrm.chOff.x || "0emu";
			this.chOffY = xfrm.chOff && xfrm.chOff.y || "0emu";

			this.chExtX = xfrm.chExt && xfrm.chExt.cx || "0emu";
			this.chExtY = xfrm.chExt && xfrm.chExt.cy || "0emu";
		}

		// background color
		if (wpx.grpSpPr && wpx.grpSpPr.solidFill)
		{
			this._initBgSolidFillColor(wpx.grpSpPr.solidFill);
		}

		// generate children container
		wpx.wgp 	&& this._createChildren(wpx.wgp, 	writer.model.text.Canvas);
		wpx.grpSp 	&& this._createChildren(wpx.grpSp, 	writer.model.text.Canvas);
		wpx.txbx 	&& this._createChildren(wpx.txbx, 	writer.model.text.TextBox);
		wpx.pic 	&& this._createChildren(wpx.pic, 	writer.model.text.Image);

		this._sortChildrenByZ();
	},

	// sort children by z-index
	_sortChildrenByZ: function()
	{
		var comp = function(child1, child2) { return child1.relativeHeight - child2.relativeHeight; };
		this._children.sortByFunc(comp);
	},

	// set size
	setSize: function(newSz)
	{
		this.width  = newSz.cx;
		this.height = newSz.cy;

		if (this.extX) this.extX = newSz.cx;
		if (this.extY) this.extY = newSz.cy;

		// update
		this.updateAll();
	},
	
	toJson: function(index, length){
		var jsonData = null;

		var wpx = this.wpx ? this.wpx : {};

		delete wpx.grpSp;
		delete wpx.pic;
		delete wpx.txbx;

		wpx.id = this.wpxId;
		if (this.offX)
		{
			wpx.grpSpPr = wpx.grpSpPr ? wpx.grpSpPr : {};
			wpx.grpSpPr.xfrm = wpx.grpSpPr.xfrm ? wpx.grpSpPr.xfrm : {};
			var xfrm = wpx.grpSpPr.xfrm;
			xfrm.off = xfrm.off ? xfrm.off : {};
			xfrm.off.x = this.offX;
			xfrm.off.y = this.offY;
			xfrm.ext = xfrm.ext ? xfrm.ext : {};
			xfrm.ext.cx = this.extX;
			xfrm.ext.cy = this.extY;
			xfrm.chOff = xfrm.chOff ? xfrm.chOff : {};
			xfrm.chOff.x = this.chOffX;
			xfrm.chOff.y = this.chOffY;
			xfrm.chExt = xfrm.chExt ? xfrm.chExt : {};
			xfrm.chExt.cx = this.chExtX;
			xfrm.chExt.cy = this.chExtY;
		}

		var pushChildren = function(child)
		{
			var t = child.t;
			if (!t || "" == t)
			{
				console.error("group children's type is incorrect!");
				return;
			}

			if (!wpx[t])
				wpx[t] = [];

			wpx[t].push(child.toJson());
		};

		this._children.forEach(function(child, i)
		{
			pushChildren(child);
		});

		if (this.simpleStruct)
		{
			jsonData = wpx;
			jsonData.t = this.t;
		}
		else
		{
			// base method
			jsonData = this.inherited(arguments);
			jsonData.rt = this.rt;
			var graphic = jsonData.anchor && jsonData.anchor.graphicData && jsonData.anchor.graphicData;
			if (!graphic){
				graphic = jsonData.inline && jsonData.inline.graphicData && jsonData.inline.graphicData;
			}
			
			if (graphic)
			{
				delete graphic.pic;

				if ("wgp" == this.rt)
					graphic.wgp = wpx;
				else if ("wpc" == this.rt)
					graphic.wpc = wpx;
				else if("smartart" == this.rt)
					graphic.smartart = wpx;
			}
		}

		return jsonData;
	},
	/**
	 * Get the message target by id
	 * @param id
	 */
	byId: function(id)
	{
		if(!id || id == 'body')
			return this;
		
		var retModel = null;
		retModel = window._IDCache.getById(id);
		if(retModel){
			return retModel;
		}
//		retModel = this._children.getById(id);
		!retModel&&this._children&&this._children.forEach(function(child){
			if( child.id == id)
			{
				retModel = child;
				return false;
			}
			else
			{
				var ret = child.byId && child.byId(id);
				if(ret)
				{
					retModel = ret;
					return false;
				}
			}	
		});
		// only paragraph need cache
		if (retModel && retModel.modelType == writer.MODELTYPE.PARAGRAPH)
			window._IDCache.addCache(id,retModel);
		return retModel;
	},
	getStyleId: function(){
    	return this.textProperty.getStyleId();
    },
	mark:function(tag){
		this[tag]=true;
		//this.parent.markDirty();	// TODO Check anchored to page object.
	},
	markDirty:function(){
		this.clearCache();
		this.mark("dirty");
	},
	markReset:function(){
		this.reset();
		this.mark("reseted");
	},
	markInsert:function(){
		this.notifyInsertToModel();
		this.mark("inserted");
	},
	markDelete:function(){
		this.notifyRemoveFromModel();
		this.mark("deleted");
	},
	getByIndex:function(index)
	{
		return this._children.getByIndex(index);
	},
	indexOf: function(sub)
	{
		return this._children.indexOf(sub);
	},
	notifyInsertToModel:function(){
		var mTools = writer.util.ModelTools;
		this._children.forEach(function(child){
			if(mTools.isTextBox(child) || mTools.isCanvas(child))
				child.notifyInsertToModel();
		});
	},
	notifyRemoveFromModel:function(){
		var mTools = writer.util.ModelTools;
		window._IDCache.removeId(this.id);
		this._children.forEach(function(child){
			if(mTools.isTextBox(child) || mTools.isCanvas(child))
				child.notifyRemoveFromModel();
		});
	},
	removeTextLength: function(index, len, container)
	{
		if(this.start >= index )
		{			
			var delta = index + len - this.start;
			if(delta > 0)
			{
				container.remove(this);
				this.deleted = true;
				this.notifyRemoveFromModel();
				if(this.modelType != writer.MODELTYPE.TXBX)
					this.paragraph.AnchorObjCount -= 1;
			}
			else
			{
				this.start -= len;
				this.markDirty();
			}
		}
	}
});
