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

dojo.provide("pres.model.ShapeElement");

dojo.require("pres.model.Element");
dojo.require("pres.model.ShapeImg");
dojo.require("pres.model.ShapeSvg");
dojo.require("pres.utils.helper");

dojo.declare("pres.model.ShapeElement", [pres.model.Element], {

	constructor: function(json)
	{
		if (json)
		{
			// For top level div
			this.inherited(arguments);

			// Data node id
			this.dataId = json.dataId;

			// For text content box
			if (json.txtBox)
			{ // Connector shape has no txtBox
				this.txtBox = new pres.model.Element(json.txtBox);
				this.txtBox.parent = this;
			}

			// For SVG shape or image
			if (json.img)
			{ // For image(ODP imported)
				this.img = new pres.model.ShapeImg(json.img, this);
			}
			else if (json.svg)
			{ // For SVG shape
				this.svg = new pres.model.ShapeSvg(json.svg, this);
			}

			if (json.others)
			{
				this.others = JSON.parse(JSON.stringify(json.others));
			}
		}
	},

	isValid: function()
	{
		return this.inherited(arguments) && (this.img.isValid() || this.svg.isValid());
	},

	clone: function()
	{
		var shape = new pres.model.ShapeElement();
		// Element model members
		shape.attrs = dojo.clone(this.attrs);
		shape.family = this.family;
		shape.content = this.content;
		shape.w = this.w;
		shape.h = this.h;
		shape.t = this.t;
		shape.l = this.l;
		shape.z = this.z;
		shape.isNotes = this.isNotes;

		shape.id = this.id;

		// data node id
		shape.dataId = this.dataId;

		// For text content box
		if (this.txtBox)
			shape.txtBox = this.txtBox.clone();

		// For SVG shape or image
		if (this.img)
		{ // For image(ODP imported)
			shape.img = this.img.clone();
		}
		else if (this.svg)
		{ // For SVG shape
			shape.svg = this.svg.clone();
		}

		if (this.others)
		{ // other things
			shape.others = JSON.parse(JSON.stringify(this.others));
		}

		return shape;
	},

	toJson: function()
	{
		var result = this.inherited(arguments);

		// data node id
		result.dataId = this.dataId;

		// For text content box
		if (this.txtBox)
			result.txtBox = this.txtBox.toJson();

		// For SVG shape or image
		if (this.img)
		{ // For image(ODP imported)
			result.img = this.img.toJson();
		}
		else if (this.svg)
		{ // For SVG shape
			result.svg = this.svg.toJson();
		}

		if (this.others)
		{ // For SVG shape
			result.others = JSON.parse(JSON.stringify(this.others));
		}

		return result;
	},

	getPositionStyle: function()
	{
		if(this.isPreview) //use for WYSWYG creating
		{
			var w = pres.utils.helper.cm2px(this.w) + "px";
			var l = pres.utils.helper.cm2px(this.l) + "px";
			var t = pres.utils.helper.cm2px(this.t) + "px";
			var h = pres.utils.helper.cm2px(this.h) + "px";
			this.z = 166666;
		}
		else
		{
			var slide = this.parent;
			var w = (this.w * 100 / slide.w) + "%";
			var l = (this.l * 100 / slide.w) + "%";
			var t = (this.t * 100 / slide.h) + "%";
			var h = (this.h * 100 / slide.h) + "%";
		}
		
		var str = "position:absolute;top:" + t + ";width:" + w + ";left:" + l + ";height:" + h + ";z-index:" + this.z + ';';
		str += this._getTransformStyle();
		
		return str;
	},
	
	_getTransformStyleValue: function()
	{
		var result = "";
		var svg = this.svg;
		if (svg)
		{
			// Handle rotation info
			var rotStr = '';
			if (svg.frm.rot)
			{
				rotStr = 'rotate(' + svg.frm.rot + 'deg)';
			}
			
			var flipStr = '';
			if (svg.dir !== null && svg.dir !== undefined)
			{
				switch (svg.dir)
				{
					case 3:
					case 4:
						flipStr = 'scale(-1,1)';
						break;
					case 5:
					case 6:
						flipStr = 'scale(-1,-1)';
						break;
					case 7:
						flipStr = 'scale(1,-1)';
						break;
					default:
						flipStr = '';
						break;
				}
			}

			if (rotStr || flipStr)
			{
				result = (rotStr + flipStr + ';');
			}
		}
		
		return result;		
	},
	
	_getTransformOrigValue: function()
	{
		// rotate/flip center will be set as SVG frame center relative to main node LT
		var cmToEmu = pres.constants.CM_TO_EMU_FACTOR, 
			svgCenterX = this.svg.frm.l + (this.svg.frm.w / 2), 
			svgCenterY = this.svg.frm.t + (this.svg.frm.h / 2), 
			offsetPercentX = ((svgCenterX - (this.l * cmToEmu)) * 100 / (this.w * cmToEmu)).toFixed(2), 
			offsetPercentY = ((svgCenterY - (this.t * cmToEmu)) * 100 / (this.h * cmToEmu)).toFixed(2);
		
		return (offsetPercentX + '% ' + offsetPercentY + '%;');
	},
	
	_getTransformStyle: function()
	{
		var result = "";
		if(this.svg)
		{
			var value = this._getTransformStyleValue();
			if(value.length > 0)
			{
				var key, oriKey;
				if (dojo.isWebKit)
				{
					key = '-webkit-transform:';
					oriKey = '-webkit-transform-origin:';
				}
				else if (dojo.isIE)
				{
					key = '-ms-transform:';
					oriKey = '-ms-transform-origin:';
				}
				else if (dojo.isMoz)
				{
					key = '-moz-transform:';
					oriKey = '-moz-transform-origin:';
				}
				else
				{
					key = 'transform:';
					oriKey = 'transform-origin:';
				}
				
				result += ('-webkit-transform:' + value);
				result += ('-ms-transform:' + value);
				result += ('-moz-transform:' + value);
				result += ('transform:' + value);
				value = this._getTransformOrigValue();
				result += ('-webkit-transform-origin:' + value);
				result += ('-ms-transform-origin:' + value);
				result += ('-moz-transform-origin:' + value);
				result += ('transform-origin:' + value);
			}
		}
		
		return result;	
	},

	getHTML: function()
	{
		// main node
		var html = this._gartherAttrs(this.getPositionStyle());

		// data node
		html += '<div';
		html += ' id="' + this.dataId + '"';
		html += ' class="contentBoxDataNode" style="position:relative;left:0%;top:0%;height:100%;width:100%;" tabindex="0"';
		if (this.svg)
			html += ' aria-labelledby="' + this.svg.id + '"';
		html += '>';

		// IMG or SVG
		if (this.img)
		{
			html += this.img.getHTML(this.others);
		}
		else if (this.svg)
		{
			html += this.svg.getHTML(this.others);
		}

		// Text content box
		if (this.txtBox)
			html += this.txtBox.getHTML();

		html += '</div></div>'; // data node and main node

		return html;
	},

	attachParent: function()
	{
		if (this.img)
			this.img.parent = this;
		if (this.svg)
		{
			this.svg.parent = this;
			this.svg.attachParent();
		}
		if (this.txtBox)
			this.txtBox.parent = this;
	},

	getTextBoxFinalStyle: function(w, h)
	{
		var positionStyle = this.getTxtBoxPositionStyle(w, h);
		if (this.txtBox)
			var oStyle = this.txtBox.attr("style") || "";
		var value = oStyle + ";" + positionStyle;
		var style = pres.utils.htmlHelper.extractStyle(value);
		value = "";
		for ( var s in style)
		{
			if (value)
				value += ";";
			value += s + ":" + style[s];
		}
		return value;
	},

	getTxtBoxPositionStyle: function(parentW, parentH)
	{
		if (!this.txtBox)
			return '';
		var txtBox = this.txtBox;
		var w = (txtBox.w * 100 / parentW) + "%";
		var l = (txtBox.l * 100 / parentW) + "%";
		var t = (txtBox.t * 100 / parentH) + "%";
		var h = (txtBox.h * 100 / parentH) + "%";
		var str = "position:absolute;top:" + t + ";width:" + w + ";left:" + l + ";height:" + h + ";z-index:" + txtBox.z;
		return str;
	},

	updateShapeFrmLT: function(l, t)
	{
		if (this.svg)
		{
			this.svg.updateShapeFrmLT(l, t);
			dojo.publish("/shape/pos/changed", [this, null]);
		}
	},

	updateShapeSize: function(wrapperCoords, resizeHandlerName)
	{
		if (this.svg)
		{
			var type = this.attr('draw_type');
			var updated = false;
			if (type == 'customShapeType')
			{
				updated = this.svg.updateShapeSize(wrapperCoords, resizeHandlerName);
			}
			else
			{
				// Preset shapes
				var txtArea = {};
				var oldsvgdir = this.svg.dir;
				updated = this.svg.calcPathFromGuide(wrapperCoords, type, txtArea, resizeHandlerName);
				if(oldsvgdir !== this.svg.dir)
				{
					var styles = pres.utils.htmlHelper.extractStyle(this.attrs.style);
					var value = this._getTransformStyleValue();

					if(value.length > 0)
					{
						styles["transform"] = value;
						styles["-webkit-transform"] = value;
						styles["-ms-transform"] = value;
						styles["-moz-transform"] = value;
					}
					else
					{
						delete styles["transform"];
						delete styles["-webkit-transform"];
						delete styles["-ms-transform"];
						delete styles["-moz-transform"];
					}
					
					this.attrs.style = pres.utils.htmlHelper.stringStyle(styles);
				}
				if ((!pres.utils.shapeUtil.isConnectorShape(this)) && updated && this.txtBox && txtArea.data)
				{
					var txtBox = this.txtBox;
					var txtRect = txtArea.data;
					// unit is EMU and related to frame
					// should change it to be related to outer div
					var cmToEMU = pres.constants.CM_TO_EMU_FACTOR;
					txtBox.l = (txtRect.l + this.svg.gap.l) / cmToEMU;
					txtBox.t = (txtRect.t + this.svg.gap.t) / cmToEMU;
					txtBox.w = (txtRect.r - txtRect.l) / cmToEMU;
					txtBox.h = (txtRect.b - txtRect.t) / cmToEMU;
					txtBox.attr("style", this.getTextBoxFinalStyle(this.w, this.h));
				}
			}

			// Update view
			if (updated)
				dojo.publish("/shape/size/changed", [this, null]);
		}
	},
	
	/**
	 *  reset svg.av according to the adjust handler position
	 *  index: the adjust handler index
	 *  x: the handler x position 
	 *  y: the handler y position 
	 */
	setAvByAdjHandler: function(index, x, y)
	{
		var shapeType = this.attr('draw_type');
		var prstShapeDefs = pres.def.prstShapes[shapeType];
		if (!prstShapeDefs)
			return;
		
		var helper = pres.utils.helper;
				
		if(!this.svg.av)
			this.svg.av = {};
		
		var avLst = pres.utils.shapeUtil.invertCalcAvLstFromGuideWithAh(this.svg.frm, this.svg.av, shapeType, index, helper.pxToEmu(x), helper.pxToEmu(y));
		for(var av in avLst)
		{
			this.svg.av[av] = "val " + avLst[av];
		}
	},
	
	updateTransform: function(box)
	{
		//actually it is not a shape, but a graphics or sth else call Element.updateTransform
		if(!this.svg)
		{
			this.inherited(arguments);
			return;
		}
		
		var transform = box.resizeWrapper.style.transform;
		if(transform)
		{
			transform = transform.replace(/ /g, "");
			var result = /scale\(-1,1\)/.exec(transform);
			if(result) //flipX
			{
				var flipXTable = [4, 3, 2, 1, 0, 7, 6, 5];
				this.svg.dir = this.svg.dir ? flipXTable[this.svg.dir] : 3;
				this.svg.frm.rot = this.svg.frm.rot ? (360-this.svg.frm.rot)%360 : 0;
			}
			result = /scale\(1,-1\)/.exec(transform);
			if(result)
			{
				var flipYTable = [0, 7, 6, 5, 4, 3, 2, 1];
				this.svg.dir = this.svg.dir ? flipYTable[this.svg.dir] : 7;
				this.svg.frm.rot = this.svg.frm.rot ? (360-this.svg.frm.rot)%360 : 0;
			}
			result = /rotate\(([^\)]*)deg\)/.exec(transform);
			if(result)
			{
				var r = result[1];
				if (this.svg.dir !== null && this.svg.dir !== undefined)
				{
					switch (this.svg.dir)
					{
						case 3:
						case 4:
						case 7:
							r = parseFloat(r) * -1;
							break;
						default:
							r = parseFloat(r);
							break;
					}
				}
				if(this.svg.frm.rot)
					this.svg.frm.rot = Math.round((this.svg.frm.rot + parseFloat(r))%360); 
				else
					this.svg.frm.rot = Math.round(parseFloat(r));
			}
			
			if(this.svg.frm.rot == 0)
				delete this.svg.frm.rot;
			if(this.svg.dir == 1)
				delete this.svg.dir;
			
			var styles = pres.utils.htmlHelper.extractStyle(this.attrs.style);
			var value = this._getTransformStyleValue();

			if(value.length > 0)
			{
				styles["transform"] = value;
				styles["-webkit-transform"] = value;
				styles["-ms-transform"] = value;
				styles["-moz-transform"] = value;
			}
			else
			{
				delete styles["transform"];
				delete styles["-webkit-transform"];
				delete styles["-ms-transform"];
				delete styles["-moz-transform"];
			}
			
			this.attrs.style = pres.utils.htmlHelper.stringStyle(styles);
			
			var textNode = dojo.query(".draw_text-box", box.domNode)[0];
			if(textNode)
			{
				var textNodeStylestr = dojo.attr(textNode,"style");
				var textNodeStyles = pres.utils.htmlHelper.extractStyle(textNodeStylestr);
				
				if(this.svg.dir == 3 || this.svg.dir == 4 || this.svg.dir == 7)
				{
					textNodeStyles["transform"] = "scaleX(-1)";
					textNodeStyles["-moz-transform"] = "scaleX(-1)";
					textNodeStyles["-ms-transform"] = "scaleX(-1)";
					textNodeStyles["-webkit-transform"] = "scaleX(-1)";
				}
				else
				{
					delete textNodeStyles["transform"];
					delete textNodeStyles["-moz-transform"];
					delete textNodeStyles["-ms-transform"];
					delete textNodeStyles["-webkit-transform"];
				}
				textNodeStylestr = pres.utils.htmlHelper.stringStyle(textNodeStyles);
				dojo.attr(textNode,"style",textNodeStylestr);
				if (this.txtBox)
					this.txtBox.setContent(box.getSubContent());				
			}
						
			dojo.publish("/shape/size/changed", [this, null]);

			box.resizeWrapper.style.removeProperty("-webkit-transform");
			box.resizeWrapper.style.removeProperty("-ms-transform");
			box.resizeWrapper.style.removeProperty("-moz-transform");
			box.resizeWrapper.style.removeProperty("transform");
		}		
	},
	
	getAhHandlersPos: function()
	{
		var shapeType = this.attr('draw_type');
		var prstShapeDefs = pres.def.prstShapes[shapeType];
		if (!prstShapeDefs)
			return null;
		
		var result = [];
		var helper = pres.utils.helper;
		var avLst = dojo.mixin(dojo.clone(prstShapeDefs['avLst']), this.svg.av);
		var ahLst = prstShapeDefs.ahLst;
		if(!ahLst)
			return null;
		
		var gdLst = pres.utils.shapeUtil.calcGdLstValuesFromShapeFrame(this.svg.frm, this.svg.av, shapeType);
		
		var ahXY = ahLst.ahXY;
		if(ahXY)
		{
			if(!Array.isArray(ahXY))
				ahXY = [ahXY];
			for(var i=0; i<ahXY.length; i++)
			{
				var x = gdLst[ahXY[i].pos.x], y = gdLst[ahXY[i].pos.y];
				result.push({x: (x/this.svg.frm.w*100)+"%", y: (y/this.svg.frm.h*100)+"%"});
			}
		}
		
		var ahPol = ahLst.ahPolar;
		if(ahPol)
		{
			if(!Array.isArray(ahPol))
				ahPol = [ahPol];
			for(var i=0; i<ahPol.length; i++)
			{
				var x = gdLst[ahPol[i].pos.x], y = gdLst[ahPol[i].pos.y];
				result.push({x: (x/this.svg.frm.w*100)+"%", y: (y/this.svg.frm.h*100)+"%"});
			}
		}
		
		return result;
	},

	parseDomOthers: function(elemDom)
	{
		var other = {};
		other.tagName = elemDom.nodeName;
		other.attrs = {};
		dojo.forEach(elemDom.attributes, function(attr)
		{
			var name = attr.name;
			other.attrs[name] = attr.value;
		});
		other.content = elemDom.innerHtml;
		return other;
	},

	parseDom: function(elemDom)
	{
		// Get data node ID
		var dataNodes = elemDom.childNodes;
		if (dataNodes.length == 1)
		{
			var dataNode = dataNodes[0];
			this.dataId = dataNode.id;

			// IMG/SVG and text box
			var groupFrames = dataNode.childNodes;
			var size = groupFrames.length;
			var others = {};
			for ( var i = 0; i < size; i++)
			{
				var groupFrame = groupFrames[i];
				var family = pres.model.parser.getFamily(groupFrame);
				if (family.toLowerCase() == "graphic")
				{ // IMG/SVG
					var groupDataNodes = groupFrame.childNodes;
					var childSize = groupDataNodes.length;
					if (childSize > 0)
					{
						for ( var j = 0; j < childSize; j++)
						{
							var groupDataNode = groupDataNodes[j];
							var tagName = groupDataNode.nodeName;
							if (tagName.toLowerCase() == "img")
							{
								this.img = new pres.model.ShapeImg(null, this);
								this.img.parseDom(groupDataNode);
								this.img.divId = groupFrame.id;
								this.img.index = j;
							}
							else if (tagName.toLowerCase() == "svg")
							{
								this.svg = new pres.model.ShapeSvg(null, this);
								this.svg.parseDom(groupDataNode);
								this.svg.divId = groupFrame.id;
								this.svg.index = j;
							}
							else
							{
								// some other thing we do not expect here, like a label for the img.
								var other = this.parseDomOthers(groupDataNode);
								other.divId = groupFrame.id;
								other.index = j;
								if (!this.others)
									this.others = [];
								this.others.push(other);
							}
						}
					}
				}
				else if (family.toLowerCase() == "text")
				{ // text box
					this.txtBox = pres.model.parser.parseElement(this, groupFrame);
				}
			}
		}
	},

	find: function(fillid)
	{
		var fill = this.svg.fill;
		if (fill)
		{
			if (fill.id == fillid)
				return fill;
		}
		var line = this.svg.line;
		if (line)
		{
			if (line.id == fillid)
				return line;
		}
		var arrows = this.svg.arrows;
		for ( var i = 0; i < arrows.length; i++)
		{
			var arrow = arrows[i];
			if (arrow.id == fillid)
				return arrow;
		}
		return null;
	}
});