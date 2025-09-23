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

dojo.provide("pres.model.ShapeSvg");

dojo.require("pres.model.ShapeProp");
dojo.require("pres.model.ShapeLine");
dojo.require("pres.model.ShapeFill");
dojo.require("pres.model.ShapeArrow");
dojo.require("pres.model.Attrable");
dojo.require("pres.model.Htmlable");
dojo.require("pres.utils.helper");

dojo.declare("pres.model.ShapeSvg", [pres.model.Attrable, pres.model.Htmlable], {

	constructor: function(json, parent)
	{
		if (parent)
			this.parent = parent;
		if (json)
		{
			// DIV and SVG node id
			this.divId = json.divId;
			this.id = json.id;
			this.shapeVersion = json.shapeVersion ? json.shapeVersion : "1.5";

			// Frame position is relative to slide editor
			this.frm = {};
			this.frm.l = json.frm.l;
			this.frm.t = json.frm.t;
			this.frm.w = json.frm.w;
			this.frm.h = json.frm.h;
			if (json.frm.rot)
				this.frm.rot = json.frm.rot;

			// Path. An shape only contain one path
			this.path = json.path;
			// Path. An shape contain a cpath array
			if (json.cpath)
				this.cpath = json.cpath;

			// Gap between frame and display box
			// in left, top, right and bottom
			this.gap = {};
			this.gap.l = json.gap.l;
			this.gap.t = json.gap.t;
			this.gap.r = json.gap.r;
			this.gap.b = json.gap.b;

			if (json.dir !== null && json.dir !== undefined)
				this.dir = json.dir;

			if (json.av)
				this.av = json.av;

			// Defs
			if (json.prop)
			{
				// Clip path(id and clip-rule)
				this.prop = {};
				if (json.prop.cp)
					this.prop.cp = json.prop.cp;
				// Gradient fills
				var grads = json.prop.grads;
				if (grads)
				{
					var len = grads.length;
					this.prop.grads = [];
					for ( var i = 0; i < len; i++)
					{
						var prop = new pres.model.ShapeProp(grads[i], this);
						this.prop.grads.push(prop);
					}
				}
				// Image fill
				if (json.prop.ptn)
					this.prop.ptn = new pres.model.ShapeProp(json.prop.ptn, this);
			}

			// Fill, line and arrow
			// Fill
			if (json.fill)
				this.fill = new pres.model.ShapeFill(json.fill, this);
			// line
			this.line = new pres.model.ShapeLine(json.line, this);
			// Arrow
			if (json.arrows)
			{
				len = json.arrows.length;
				this.arrows = [];
				for ( var i = 0; i < len; i++)
				{
					var arrow = new pres.model.ShapeArrow(json.arrows[i], this);
					this.arrows.push(arrow);
				}
			}

			// Title
			if (json.title)
				this.title = json.title;
		}
	},

	attachParent: function()
	{
		var me = this;
		if (this.fill)
			this.fill.parent = this;
		if (this.line)
			this.line.parent = this;
		if (this.prop)
		{
			if (this.prop.grads)
				dojo.forEach(this.prop.grads, function(item)
				{
					item.parent = me;
				})
			if (this.prop.ptn)
				this.prop.ptn.parent = this;
		}
		if (this.arrows)
			dojo.forEach(this.arrows, function(item)
			{
				item.parent = me;
			})
	},

	isValid: function()
	{
		return this.divId && this.id && this.frm && this.path && this.line;
	},

	clone: function()
	{
		var svg = new pres.model.ShapeSvg();

		svg.divId = this.divId;
		svg.id = this.id;

		// Frame position is relative to slide editor
		svg.frm = dojo.clone(this.frm);

		// Path. An shape only contain one path
		svg.path = this.path;
		// Path. An shape contain a cpath array
		if (this.cpath)
			svg.cpath = dojo.clone(this.cpath);

		// Gap between frame and display box
		svg.gap = dojo.clone(this.gap);

		if (this.dir !== null && this.dir !== undefined)
			svg.dir = this.dir;

		if (this.av)
			svg.av = dojo.clone(this.av);

		// Defs
		if (this.prop)
		{
			svg.prop = {};
			// Clip path id
			if (this.prop.cp)
				svg.prop.cp = dojo.clone(this.prop.cp);
			// Gradient
			if (this.prop.grads)
			{
				svg.prop.grads = [];
				dojo.forEach(this.prop.grads, function(g)
				{
					svg.prop.grads.push(g.clone());
				});
			}
			// Image fill
			if (this.prop.ptn)
				svg.prop.ptn = this.prop.ptn.clone();
		}

		// Fill, line and arrow
		// Fill
		if (this.fill)
			svg.fill = this.fill.clone();
		// line
		svg.line = this.line.clone();
		// Arrows
		if (this.arrows)
		{
			svg.arrows = [];
			dojo.forEach(this.arrows, function(a)
			{
				svg.arrows.push(a.clone());
			});
		}

		// Title
		if (this.title)
			svg.title = this.title;

		return svg;
	},

	toJson: function()
	{
		var result = {};

		result.divId = this.divId;
		result.id = this.id;
		result.shapeVersion = this.shapeVersion;

		// Frame position is relative to slide editor
		result.frm = dojo.clone(this.frm);

		// Path. An shape only contain one path
		result.path = this.path;
		// Path. An shape contain a cpath array
		if (this.cpath)
			result.cpath = dojo.clone(this.cpath);

		// Gap between frame and display box
		result.gap = dojo.clone(this.gap);

		if (this.dir !== null && this.dir !== undefined)
			result.dir = this.dir;

		if (this.av)
			result.av = dojo.clone(this.av);

		// Defs
		if (this.prop)
		{
			result.prop = {};
			// Clip path id
			if (this.prop.cp)
				result.prop.cp = dojo.clone(this.prop.cp);
			// Gradients
			if (this.prop.grads)
			{
				result.prop.grads = [];
				dojo.forEach(this.prop.grads, function(g)
				{
					result.prop.grads.push(g.toJson());
				});
			}
			// Image fill
			if (this.prop.ptn)
				result.prop.ptn = this.prop.ptn.toJson();
		}

		// Fill, line and arrow
		// Fill
		if (this.fill)
			result.fill = this.fill.toJson();
		// line
		result.line = this.line.toJson();
		// Arrows
		if (this.arrows)
		{
			result.arrows = [];
			dojo.forEach(this.arrows, function(a)
			{
				result.arrows.push(a.toJson());
			});
		}

		// Title
		if (this.title)
			result.title = this.title;

		return result;
	},

	getHTML: function(others)
	{
		// DIV node
		var html = '<div';
		html += ' id="' + this.divId + '"';
		html += ' class="g_draw_frame" style="position:absolute;left:0%;top:0%;width:100%;height:100%;" draw_layer="layout" presentation_class="graphic" shape_node="svg.on.shape" text_anchor-type="paragraph" tabindex="0"';
		html += '>';

		// SVG node
		html += '<svg';
		html += ' id="' + this.id + '"';
		html += ' contentScriptType="text/ecmascript" style="position:relative;width:100%;height:100%" xmlns:xlink="http://www.w3.org/1999/xlink" draw_layer="layout" xmlns="http://www.w3.org/2000/svg" version="1.1" preserveAspectRatio="none" contentStyleType="text/css"';
		html += ' shape-version="'+ this.shapeVersion + '"';

		// Except for meeting applying layout logic, below "preserve0" part is unnecessary
		var l = this.frm.l, t = this.frm.t, w = this.frm.w, h = this.frm.h, gapL = this.gap.l, gapT = this.gap.t, gapR = this.gap.r, gapB = this.gap.b, dspL = l - gapL, dspT = t - gapT, dspW = w + gapL + gapR, dspH = h + gapT + gapB;
		html += " preserve0=\"" + "dsp_x:" + dspL + ";dsp_y:" + dspT + ";dsp_width:" + dspW + ";dsp_height:" + dspH + ";frm_x:" + l + ";frm_y:" + t + ";frm_width:" + w + ";frm_height:" + h + ";";
		if (this.frm.rot !== null && this.frm.rot !== undefined)
		{
			html += ("rot_degree:" + this.frm.rot + ";");
		}
		if (this.dir !== null && this.dir !== undefined)
		{
			html += ("dir:" + this.dir + ";");
		}
		if (this.av)
		{
			for ( var key in this.av)
			{
				html += (key + ":" + this.av[key] + ";");
			}
		}

		html += '">';

		// defs
		if (this.prop)
		{
			html += '<g groupfor="defs">';
			// clip path
			if (this.prop.cp && this.cpath)
			{
				html += '<defs><clipPath';
				html += ' id="' + this.prop.cp.id + '"';
				if (this.prop.cp.clipRule)
					html += ' clip-rule="' + this.prop.cp.clipRule + '"';
				html += '>';

				// Fix chrome 38 issue
				// all cpaths should be connected together and set into a path
				html += '<path d="';
				for ( var i = 0, len = this.cpath.length; i < len; i++)
				{
					html += (this.cpath[i].trim()) + ' ';
				}
				html += '"></path></clipPath></defs>';
			}
			// Gradient
			if (this.prop.grads)
			{
				dojo.forEach(this.prop.grads, function(g)
				{
					html += '<defs>';
					html += g.getHTML();
					html += '</defs>';
				});
			}
			// Image fill
			if (this.prop.ptn)
			{
				html += '<defs>';
				html += this.prop.ptn.getHTML();
				html += '</defs>';
			}
			html += '</g>';
		}

		// fill-line-arrow
		// scale and translate
		var factor = pres.constants.PT_TO_EMU_FACTOR;
		//added class="shape-visible-events", so that only the visible svg can recevie mouse event
		html += '<g groupfor="fill-line-arrow" class="shape-visible-events" transform="scale(1.3333) translate(' + (this.gap.l / factor).toFixed(2) + ',' + (this.gap.t / factor).toFixed(2) + ') ';
		html += '">';
		// fill
		if (this.fill)
		{
			html += '<g groupfor="fill">';
			html += this.fill.getHTML();
			html += '</g>';
		}
		// line
		html += '<g groupfor="line">';
		html += this.line.getHTML();
		html += '</g>';
		// arrow
		if (this.arrows)
		{
			html += '<g groupfor="arrow">';
			dojo.forEach(this.arrows, function(a)
			{
				html += a.getHTML();
			});
			html += '</g>';
		}
		html += '</g>';

		// title <title>shape</title>
		if (this.title)
		{
			html += '<title>';
			html += this.title;
			html += '</title>';
		}

		html += '</svg>';

		if (others)
		{
			dojo.forEach(others, function(ot)
			{

				var tagName = ot.tagName;

				var str = tagName ? ("<" + tagName) : "<div";
				var map = ot.attrs;
				for ( var x in map)
				{
					var span = " " + x + "=\"" + map[x] + "\"";
					str += span;
				}
				str += ">";
				str += ot.content || "";

				str += tagName ? ("</" + tagName) : "</div";
				str += ">";

				html += str;
			});
		}

		html += '</div>';

		return html;
	},

	updateShapeFrmLT: function(l, t)
	{
		// cm to emu 1cm = 360000 EMU
		var factor = pres.constants.CM_TO_EMU_FACTOR;
		this.frm.l = l * factor + this.gap.l;
		this.frm.t = t * factor + this.gap.t;
	},

	getModelPos: function()
	{
		var l = this.frm.l, t = this.frm.t, w = this.frm.w, h = this.frm.h, gapL = this.gap.l, gapT = this.gap.t, gapR = this.gap.r, gapB = this.gap.b, dspL = l - gapL, dspT = t - gapT, dspW = w + gapL + gapR, dspH = h + gapT + gapB;
		var preserve0 = "dsp_x:" + dspL + ";dsp_y:" + dspT + ";dsp_width:" + dspW + ";dsp_height:" + dspH + ";frm_x:" + l + ";frm_y:" + t + ";frm_width:" + w + ";frm_height:" + h + ";";
		if (this.frm.rot !== null && this.frm.rot !== undefined)
		{
			preserve0 += ("rot_degree:" + this.frm.rot + ";");
		}
		if (this.dir !== null && this.dir !== undefined)
		{
			preserve0 += ("dir:" + this.dir + ";");
		}
		if (this.av !== null && this.av !== undefined)
		{
			for(var av in this.av)
				preserve0 += (av + ":" + this.av[av] + ";");
		}
		return {
			preserve0: preserve0
		};
	},

	// This function should be used before model info is updated
	getLTByFlipRot: function(resizeHandlerName, emuFrmW, emuFrmH, newDir)
	{
		resizeHandlerName = resizeHandlerName.toLowerCase();
		// Consider rotation and calculate a correct frame coordinates in non-rotated sys
		// for old fixed frame points
		// 1. Get fixed point and frame center per resizeHandlerName
		var fixPoint = {};
		var fixPointPos;
		var shapeUtil = pres.utils.shapeUtil;
		switch (resizeHandlerName)
		{
			case "large":
			case "small":
				fixPoint.x = this.frm.w/2 + this.frm.l;
				fixPoint.y = this.frm.h/2 + this.frm.t;
				fixPointPos = 9; 
				break;
			case "tl":
			case "tm":
			case "ml":
				// rb point is not changed
				fixPoint.x = this.frm.l + this.frm.w;
				fixPoint.y = this.frm.t + this.frm.h;
				fixPointPos = 3;
				break;
			case "tr":
				// lb point is not changed
				fixPoint.x = this.frm.l;
				fixPoint.y = this.frm.t + this.frm.h;
				fixPointPos = 4;
				break;
			case "mr":
			case "br":
			case "bm":
				// lt point is not changed
				fixPoint.x = this.frm.l;
				fixPoint.y = this.frm.t;
				fixPointPos = 1;
				break;
			case "bl":
				// rt point is not cemuL
				fixPoint.x = this.frm.l + this.frm.w;
				fixPoint.y = this.frm.t;
				fixPointPos = 2;
				break;
			case "start":
				fixPoint.x = this.frm.l + this.frm.w;
				fixPoint.y = this.frm.t + this.frm.h;
				fixPointPos = 3;
				break;
			case "end":
				fixPoint.x = this.frm.l;
				fixPoint.y = this.frm.t;
				fixPointPos = 1;
				break;
			default:
				break;
		}
		// Get center
		var center = {
			x: this.frm.l + this.frm.w / 2,
			y: this.frm.t + this.frm.h / 2
		};

		// 2. Get rotated/flip fixed point
		// Get flip fixed point
		if (shapeUtil.isFlipShape(this.dir))
			fixPoint = shapeUtil.getFlipPt(center, fixPoint, this.dir);
		// Get rotated fixed point
		if (shapeUtil.isRotatedShape(this.frm.rot))
			fixPoint = shapeUtil._getRotatedPt(center, fixPoint, this.frm.rot);

		// 3. Get new non-rotated center with changed w and h in flip frame
		var latestDir = (newDir != undefined && newDir != null) ? newDir : this.dir;
		var newfixPointPos = fixPointPos;
		if (shapeUtil.isFlipShape(latestDir))
		{
			switch (latestDir)
			{
				case 0:
				case 1:
				case 2:
					newfixPointPos = shapeUtil.getRealPosition(fixPointPos, 1);
					break;
				case 3:
				case 4:
					newfixPointPos = shapeUtil.getRealPosition(fixPointPos, 2);
					break;
				case 5:
					newfixPointPos = shapeUtil.getRealPosition(fixPointPos, 3);
					break;
				case 6:
				case 7:
					newfixPointPos = shapeUtil.getRealPosition(fixPointPos, 4);
					break;
				default:
					break;
			}
		}
		switch (newfixPointPos)
		{
			case 1:
				center.x = fixPoint.x + emuFrmW / 2;
				center.y = fixPoint.y + emuFrmH / 2;
				break;
			case 2:
				center.x = fixPoint.x - emuFrmW / 2;
				center.y = fixPoint.y + emuFrmH / 2;
				break;
			case 3:
				center.x = fixPoint.x - emuFrmW / 2;
				center.y = fixPoint.y - emuFrmH / 2;
				break;
			case 4:
				center.x = fixPoint.x + emuFrmW / 2;
				center.y = fixPoint.y - emuFrmH / 2;
				break;
			default:
				break;
		}
		// Get new center per fixed point rotated by rot
		if (shapeUtil.isRotatedShape(this.frm.rot))
			center = shapeUtil._getRotatedPt(fixPoint, center, this.frm.rot);

		// 4. Get non-rotated/flip real fix point
		// get new non-rotated fixed point with new center with minus rot
		if (shapeUtil.isRotatedShape(this.frm.rot))
			fixPoint = shapeUtil._getRotatedPt(center, fixPoint, -this.frm.rot);
		// get new non-flip fixed point with new center with dir
		if (shapeUtil.isFlipShape(latestDir))
			fixPoint = shapeUtil.getFlipPt(center, fixPoint, latestDir);

		// 5. Get l and t per the fixed point
		var ltPoint = {};
		switch (fixPointPos)
		{
			case 3:
				// rb point is not changed
				ltPoint.x = fixPoint.x - emuFrmW;
				ltPoint.y = fixPoint.y - emuFrmH;
				break;
			case 4:
				// lb point is not changed
				ltPoint.x = fixPoint.x;
				ltPoint.y = fixPoint.y - emuFrmH;
				break;
			case 1:
				// lt point is not changed
				ltPoint.x = fixPoint.x;
				ltPoint.y = fixPoint.y;
				break;
			case 2:
				// rt point is not change
				ltPoint.x = fixPoint.x - emuFrmW;
				ltPoint.y = fixPoint.y;
				break;
			case 9:
				//center point is not change
				ltPoint.x = fixPoint.x - emuFrmW/2;
				ltPoint.y = fixPoint.y - emuFrmH/2;
			default:
				break;
		}

		return ltPoint;
	},

	calcPathFromGuide: function(wrapperCoords, type, textArea, resizeHandlerName)
	{
		var helper = pres.utils.helper;
		var emuFrmW = helper.pxToEmu(wrapperCoords.w), emuFrmH = helper.pxToEmu(wrapperCoords.h);
		// Calculate X/Y ratio
		var xRatio = emuFrmW / this.frm.w;
		var yRatio = emuFrmH / this.frm.h;

		//if no resizeHandlerName, then force re-calc path 
		if (!resizeHandlerName || (xRatio != 1 || yRatio != 1))
		{
			if(resizeHandlerName)
			{
				// Get Frame position
				// Calc l and t referred to slide editor based on the fixed point
				// Old frame position and rotation/flip info will be based on. wrapper coords will not be used.
				// Connector shape old and new dir will be taken care of.
				// Only connector shape dir will be changed when resize
				// Rotation will not be changed for all shapes
				var ltPoint = this.getLTByFlipRot(resizeHandlerName, emuFrmW, emuFrmH, this.tmpDir);
				emuFrmL = ltPoint.x;
				emuFrmT = ltPoint.y;
				// Update svg frame
				this.frm.l = emuFrmL;
				this.frm.t = emuFrmT;
				this.frm.w = emuFrmW;
				this.frm.h = emuFrmH;
			}

			var factor = pres.constants.PT_TO_EMU_FACTOR;

			// Update connector shape dir
			if (this.tmpDir != null && this.tmpDir != undefined)
			{
				this.dir = this.tmpDir;
				this.tmpDir = null;
			}
			var lineWidth = this.line.attr('stroke-width') * pres.constants.PT_TO_EMU_FACTOR;
			// Update path and clip path
			// Scale all points in path
			// TODO: Conversion need add customized adjust value to preserve0
			// And Editor need add them into model: this.av
			var updatedPathObj;
			var headTailBasePoint = null, hasHeadEnd = false, hasTailEnd = false;
			if (this.arrows && this.arrows.length) {
			  var pathLst = pres.utils.shapeUtil.getPathList(this.frm, this.av, type);
			  var headArrowKind = '';
			  var tailArrowKind = '';
			  var tailArrowLength = 0;
			  var headArrowLength = 0;
			  var constants = pres.constants;
			  if (this.arrows.length == 1) {
			    if (this.arrows[0].type == constants.ARROW_LINE_TYPES.head) {
	           headArrowKind = this.arrows[0].attr('kind');
	        } else {
	          tailArrowKind = this.arrows[0].attr('kind');
	        }
			  } else {
			    if (this.arrows[0].type == constants.ARROW_LINE_TYPES.head) {
            headArrowKind = this.arrows[0].attr('kind');
         } else {
           tailArrowKind = this.arrows[0].attr('kind');
         }
			   if (this.arrows[1].type == constants.ARROW_LINE_TYPES.head) {
            headArrowKind = this.arrows[1].attr('kind');
         } else {
           tailArrowKind = this.arrows[1].attr('kind');
         }
			  }
			  if (headArrowKind) {
			    headArrowLength = pres.utils.shapeUtil._getArrowEndToLineEndDistance(lineWidth, headArrowKind);
			  }
			  if (tailArrowKind) {
			    tailArrowLength = pres.utils.shapeUtil._getArrowEndToLineEndDistance(lineWidth, tailArrowKind);
			  }
			  var headOrTail = constants.ARROW_LINE_TYPES.headTail;
			  if (!(headArrowKind && tailArrowKind)) {// not doubleArrow
			    if (headArrowKind) {
            headOrTail = constants.ARROW_LINE_TYPES.head;
          } else {
            headOrTail = constants.ARROW_LINE_TYPES.tail;
          }
			  } 
			 
			  var isNeedUpdateHead = false;
			  var isNeedUpdateTail = false;
			  if (type != 'cloud') {//for cloud shape, only import 1 arrow, it's not correct, not process it now
			    isNeedUpdateHead = pres.utils.shapeUtil.isNeedUpdateLinePathList(lineWidth, headArrowKind);
	        isNeedUpdateTail = pres.utils.shapeUtil.isNeedUpdateLinePathList(lineWidth, tailArrowKind);
        }
			  headTailBasePoint = pres.utils.shapeUtil.calcHeadTailAndUpdatePathLst(pathLst, headOrTail, isNeedUpdateHead, isNeedUpdateTail, headArrowLength, tailArrowLength);
			  updatedPathObj = pres.utils.shapeUtil.generateSvgPathForShape(pathLst);
			  updatedPathObj.pathLst = pathLst;
			} else {
			  updatedPathObj = pres.utils.shapeUtil.calcPathFromGuide(this.frm, this.av, type);
			  
			}
			if (updatedPathObj)
			{
				if (updatedPathObj.path)
					this.path = updatedPathObj.path;
				if (updatedPathObj.cpath)
					this.cpath = updatedPathObj.cpath;
				if (updatedPathObj.txtRect)
					textArea.data = updatedPathObj.txtRect;
			}

			// Obtain display box
			var body = this.setViewBox(updatedPathObj && updatedPathObj.pathLst);
			viewBox = body.shapeBody, pathBody = body.pathBody;

			// Update fill rect/circle width and height
			if (this.fill)
			{
				var realFrmWidth = pathBody.frameRight - pathBody.frameLeft;
				var realFrmHeight = pathBody.frameBottom - pathBody.frameTop;
				if (this.fill.type == 'rect')
				{
					realFrmWidth = (realFrmWidth / factor).toFixed(2);
					realFrmHeight = (realFrmHeight / factor).toFixed(2);
					this.fill.attr('width', realFrmWidth);
					this.fill.attr('height', realFrmHeight);

					var realFrmLeft = ((pathBody.frameLeft) / factor).toFixed(2);
					var realFrmTop = ((pathBody.frameTop) / factor).toFixed(2);
					this.fill.attr('x', realFrmLeft);
					this.fill.attr('y', realFrmTop);

					var fillRefId = this.fill.attr('fill');
					if (fillRefId.indexOf('url#('))
					{
						fillRefId = fillRefId.replace('url(#', '');
						fillRefId = fillRefId.replace(')', '');
						// image fill
						if (this.prop && this.prop.ptn && this.prop.ptn.id == fillRefId)
						{
							this.prop.ptn.attr('width', realFrmWidth);
							this.prop.ptn.attr('height', realFrmHeight);
							// x and y should be set into patter node
							// to be relative to shape frame
							this.prop.ptn.attr('x', realFrmLeft);
							this.prop.ptn.attr('y', realFrmTop);

							var divNode = document.createElement('div');
							divNode.innerHTML = this.prop.ptn.content;
							dojo.attr(divNode.firstChild, 'width', realFrmWidth);
							dojo.attr(divNode.firstChild, 'height', realFrmHeight);
							this.prop.ptn.content = divNode.innerHTML.replace('<img', '<image');
						}
					}
				}
				else if (this.fill.type == 'circle')
				{
					var centerXByPercent = this.fill.attr('radialfillx');
					var centerYByPercent = this.fill.attr('radialfilly');
					if (centerXByPercent && centerYByPercent)
					{
						var cx = pathBody.frameLeft + realFrmWidth * centerXByPercent, cy = pathBody.frameTop + realFrmHeight * centerYByPercent;
						var r = 0, pts = [{
							x: pathBody.frameLeft,
							y: pathBody.frameTop
						}, {
							x: pathBody.frameLeft,
							y: pathBody.frameBottom
						}, {
							x: pathBody.frameRight,
							y: pathBody.frameBottom
						}, {
							x: pathBody.frameRight,
							y: pathBody.frameTop
						}];
						for ( var i = 0; i < 4; ++i)
						{
							// calc
							var dx = cx - pts[i].x;
							var dy = cy - pts[i].y;
							var temp = Math.sqrt(dx * dx + dy * dy);

							// compare
							if (i == 0)
								r = temp;
							else if (temp > r)
								r = temp;
						}

						cx = (cx / factor).toFixed(2);
						cy = (cy / factor).toFixed(2);
						r = (r / factor).toFixed(2);
						this.fill.attr('cx', cx);
						this.fill.attr('cy', cy);
						// Update radius
						this.fill.attr('r', r);
					}
				}
			}

			// Update arrow path
			var lineCap = this.line.attr('stroke-linecap');
			
			// square or round
			var hasLargeCap = false;
			if (lineCap == 'square' || lineCap == 'round')
				hasLargeCap = true;

			var shapeUtil = pres.utils.shapeUtil;
			if (this.arrows)
			{
				dojo.forEach(this.arrows, function(a)
				{
					if (a.type == 'head')
						hasHeadEnd = true;
					else if (a.type == 'tail')
						hasTailEnd = true;
					a.calcPathFromGuide(headTailBasePoint, hasLargeCap, lineWidth, viewBox);
				});
			}

			if (hasLargeCap)
			{
				if (!headTailBasePoint) {
				  headTailBasePoint = pres.utils.shapeUtil.calcHeadTailAndUpdatePathLst(updatedPathObj.pathLst, "headTail", false, false, 0, 0);
				}

				// Extent view box due to large cap when no head end
				if (!hasHeadEnd && headTailBasePoint.headBasePoint)
				{
					var hbp = headTailBasePoint.headBasePoint;
					shapeUtil.extendViewBoxForLineCap(lineWidth, hbp.head1, hbp.head2, viewBox);
				}

				// Extent view box due to large cap when no tail end
				if (!hasTailEnd && headTailBasePoint.tailBasePoint)
				{
					var hbt = headTailBasePoint.tailBasePoint;
					shapeUtil.extendViewBoxForLineCap(lineWidth, hbt.tail2, hbt.tail1, viewBox);
				}
			}

			// keep the gap
			var forceGap = 4 * pres.constants.PT_TO_EMU_FACTOR; // Make a forced gap
			viewBox.frameLeft -= forceGap;
			viewBox.frameTop -= forceGap;
			viewBox.frameRight += forceGap;
			viewBox.frameBottom += forceGap;

			// Till now, view box position is related to svg frame
			// so make it to be related to slide editor
			viewBox.frameLeft += this.frm.l;
			viewBox.frameTop += this.frm.t;
			viewBox.frameRight += this.frm.l;
			viewBox.frameBottom += this.frm.t;

			// update gap model
			this.gap.l = this.frm.l - viewBox.frameLeft;
			this.gap.t = this.frm.t - viewBox.frameTop;
			this.gap.r = viewBox.frameRight - (this.frm.l + this.frm.w);
			this.gap.b = viewBox.frameBottom - (this.frm.t + this.frm.h);

			// Calc main node new LTWH to contain the resized shape
			this.updateParentNodePos(viewBox);

			return true;
		}
		return false;
	},

	setViewBox: function(pathLst)
	{
		if (pathLst)
		{
			var shapeUtil = pres.utils.shapeUtil;
			var hasShapeBody = false, hasExtBody = false;
			var ptToEMU = pres.constants.PT_TO_EMU_FACTOR;
			var pxToEMU = pres.constants.PT_TO_EMU_FACTOR;
			// l, t, r, b are saved in
			for ( var i = 0, len = pathLst.length ? pathLst.length : 1; i < len; ++i)
			{
				var dmlPath = pathLst.length ? pathLst[i] : pathLst;

				// check path_frame
				if (dmlPath.frame.status != 1)
					continue;

				// put path_body into path_frame
				if (!hasShapeBody)
				{
					var shapeBody = dojo.clone(dmlPath.frame);
					hasShapeBody = true;
				}
				else
				{
					shapeUtil.getUnionBody(shapeBody, dmlPath.frame);
				}

				// check for extended part by large line width
				var outlineWidth = this.line.attr('stroke-width') * ptToEMU;
				if (((!isNaN(outlineWidth)) && outlineWidth > ptToEMU) && (this.line.attr('stroke-linejoin') == 'miter') && (this.line.attr('stroke') != 'none'))
				{
					var extPart = shapeUtil.getExtPartByLineWidthInPath(dmlPath, outlineWidth);
					if (extPart && extPart.frameLeft != undefined)
					{
						if (!hasExtBody)
						{
							var extBody = extPart;
							hasExtBody = true;
						}
						else
						{
							shapeUtil.getUnionBody(extBody, extPart);
						}
					}
				} // end if

			} // end for
		} // end if

		var pathBody = dojo.clone(shapeBody);

		// consider the stroke-width
		if (!isNaN(outlineWidth))
		{
			var gapImportedByOutline = outlineWidth / 2;
			shapeBody.frameLeft -= gapImportedByOutline;
			shapeBody.frameTop -= gapImportedByOutline;
			shapeBody.frameRight += gapImportedByOutline;
			shapeBody.frameBottom += gapImportedByOutline;
		}

		// consider extended body
		if (hasExtBody)
			shapeUtil.getUnionBody(shapeBody, extBody);

		return {
			pathBody: pathBody,
			shapeBody: shapeBody
		};
	},

	updateParentNodePos: function(viewBox)
	{
		var coords = {};
		var cmToEmu = pres.constants.CM_TO_EMU_FACTOR;
		// Calc shape element pos
		if (viewBox)
		{
			coords.l = (viewBox.frameLeft) / cmToEmu;
			coords.t = (viewBox.frameTop) / cmToEmu;
			coords.w = (viewBox.frameRight - viewBox.frameLeft) / cmToEmu;
			coords.h = (viewBox.frameBottom - viewBox.frameTop) / cmToEmu;
		}
		else
		{
			// still keep this for custom shape
			coords.l = (this.frm.l - this.gap.l) / cmToEmu;
			coords.t = (this.frm.t - this.gap.t) / cmToEmu;
			coords.w = (this.frm.w + this.gap.l + this.gap.r) / cmToEmu;
			coords.h = (this.frm.h + this.gap.t + this.gap.b) / cmToEmu;
		}

		coords.z = this.parent.z;

		// update shape element model
		this.parent.updatePosAttr(coords.w, coords.h, coords.t, coords.l, coords.z, null);
	},

	updateShapeSize: function(wrapperCoords, resizeHandlerName)
	{
		// Get Frame position
		var helper = pres.utils.helper;
		var emuFrmW = helper.pxToEmu(wrapperCoords.w), emuFrmH = helper.pxToEmu(wrapperCoords.h);
		// Calculate X/Y ratio
		var xRatio = emuFrmW / this.frm.w;
		var yRatio = emuFrmH / this.frm.h;

		if (xRatio != 1 || yRatio != 1)
		{
			// Calc l and t referred to slide editor
			var ltPoint = this.getLTByFlipRot(resizeHandlerName, emuFrmW, emuFrmH);
			emuFrmL = ltPoint.x;
			emuFrmT = ltPoint.y;

			// Update svg frame
			this.frm.l = emuFrmL;
			this.frm.t = emuFrmT;
			this.frm.w = emuFrmW;
			this.frm.h = emuFrmH;

			// Update path and clip path
			// Scale all points in path
			var updatedPath = pres.utils.shapeUtil.scaleCustomPath(this.path, xRatio, yRatio);
			if (this.cpath && this.cpath.length > 0)
			{
				for ( var i = 0, len = this.cpath.length; i < len; i++)
				{
					if (this.cpath[i] == this.path)
						this.cpath[i] = updatedPath;
					else
						this.cpath[i] = pres.utils.shapeUtil.scaleCustomPath(this.cpath[i], xRatio, yRatio);
				}
			}
			this.path = updatedPath;

			// Update fill rect/circle width and height
			if (this.fill)
			{
				var factor = pres.constants.PT_TO_EMU_FACTOR;
				var realFrmWidth = this.frm.w;
				var realFrmHeight = this.frm.h;
				if (this.fill.type == 'rect')
				{
					realFrmWidth = (realFrmWidth / factor).toFixed(2);
					realFrmHeight = (realFrmHeight / factor).toFixed(2);
					this.fill.attr('width', realFrmWidth);
					this.fill.attr('height', realFrmHeight);

					var fillRefId = this.fill.attr('fill');
					if (fillRefId.indexOf('url#('))
					{
						fillRefId = fillRefId.replace('url(#', '');
						fillRefId = fillRefId.replace(')', '');
						// image fill
						if (this.prop && this.prop.ptn && this.prop.ptn.id == fillRefId)
						{
							this.prop.ptn.attr('width', realFrmWidth);
							this.prop.ptn.attr('height', realFrmHeight);

							var divNode = document.createElement('div');
							divNode.innerHTML = this.prop.ptn.content;
							dojo.attr(divNode.firstChild, 'width', realFrmWidth);
							dojo.attr(divNode.firstChild, 'height', realFrmHeight);
							this.prop.ptn.content = divNode.innerHTML.replace('<img', '<image');
						}
					}
				}
				else if (this.fill.type == 'circle')
				{
					var centerXByPercent = this.fill.attr('radialfillx');
					var centerYByPercent = this.fill.attr('radialfilly');
					if (centerXByPercent && centerYByPercent)
					{
						var cx = realFrmWidth * centerXByPercent, cy = realFrmHeight * centerYByPercent;
						var r = 0, pts = [{
							x: 0,
							y: 0
						}, {
							x: 0,
							y: realFrmHeight
						}, {
							x: realFrmWidth,
							y: realFrmHeight
						}, {
							x: realFrmWidth,
							y: 0
						}];
						for ( var i = 0; i < 4; ++i)
						{
							// calc
							var dx = cx - pts[i].x;
							var dy = cy - pts[i].y;
							var temp = Math.sqrt(dx * dx + dy * dy);

							// compare
							if (i == 0)
								r = temp;
							else if (temp > r)
								r = temp;
						}

						cx = (cx / factor).toFixed(2);
						cy = (cy / factor).toFixed(2);
						r = (r / factor).toFixed(2);
						this.fill.attr('cx', cx);
						this.fill.attr('cy', cy);
						// Update radius
						this.fill.attr('r', r);
					}
				}
			}

			// Update arrow path
			if (this.arrows)
			{
				dojo.forEach(this.arrows, function(a)
				{
					a.updateShapePath(xRatio, yRatio);
				});
			}

			// Calc main node new LTWH to contain the resized shape
			this.updateParentNodePos();

			// update text box model
			var parent = this.parent;
			var txtBox = parent.txtBox;
			if (txtBox)
			{
				txtBox.l *= xRatio;
				txtBox.t *= yRatio;
				txtBox.w *= xRatio;
				txtBox.h *= yRatio;
				txtBox.attr("style", parent.getTextBoxFinalStyle(parent.w, parent.h));
			}
			return true;
		}
		return false;
	},

	parseDom: function(elemDom)
	{
		this.id = elemDom.id;
		this.shapeVersion = dojo.attr(elemDom, "shape-version");

		// Frame
		var frm = {};
		this.frm = frm;
		// custom adjust values
		var av = {};
		var preserves = dojo.attr(elemDom, "preserve0").trim().split(";");
		var dspL = 0, dspT = 0, dspW = 0, dspH = 0;
		var dir = -1;
		for ( var i = 0; i < preserves.length; i++)
		{
			var kvPair = preserves[i];
			var kv = kvPair.split(":");
			if (kv.length == 2)
			{
				var k = kv[0].trim().toLowerCase();
				if (k == "frm_x")
				{
					frm.l = parseFloat(kv[1].trim());
				}
				else if (k == "frm_y")
				{
					frm.t = parseFloat(kv[1].trim());
				}
				else if (k == "frm_width")
				{
					frm.w = parseFloat(kv[1].trim());
				}
				else if (k == "frm_height")
				{
					frm.h = parseFloat(kv[1].trim());
				}
				else if (k == "dsp_x")
				{
					dspL = parseFloat(kv[1].trim());
				}
				else if (k == "dsp_y")
				{
					dspT = parseFloat(kv[1].trim());
				}
				else if (k == "dsp_width")
				{
					dspW = parseFloat(kv[1].trim());
				}
				else if (k == "dsp_height")
				{
					dspH = parseFloat(kv[1].trim());
				}
				else if (k == "rot_degree")
				{
					frm.rot = parseFloat(kv[1].trim());
				}
				else if (k == "dir")
				{
					dir = parseInt(kv[1].trim());
				}
				else //for adj
				{
					var type = this.parent.attr('draw_type');
					var def = pres.def.prstShapes[type];
					if(def && def.avLst)
					{
						for(var t in def.avLst)
						{
							if(k === t)
							{
								av[k] = kv[1].trim();
								break;
							}
						}
					}
				}
			}
		}

		// Gap
		var gap = {
			"l": frm.l - dspL,
			"t": frm.t - dspT,
			"r": (dspL + dspW) - (frm.l + frm.w),
			"b": (dspT + dspH) - (frm.t + frm.h)
		};
		this.gap = gap;

		if (dir != -1)
			this.dir = dir;

		// Custom adjust values
		if (Object.keys(av).length > 0)
			this.av = av;

		// defs
		if(dojo.isSafari < 6)
		{
			var clipPath = dojo.filter(elemDom.getElementsByTagName("*"), function(node)
			{
				return node.tagName == "clipPath";
			});
		}
		else
			var clipPath = elemDom.getElementsByTagName("clipPath");
		var clipPathSize = clipPath.length;
		var gradients = dojo.query("[gradtarget]", elemDom);
		var gradientsSize = gradients.length;
		var pattern = dojo.query("[imgtarget]", elemDom);
		var patternSize = pattern.length;

		if (clipPathSize == 1 || gradientsSize >= 1 || patternSize == 1)
		{
			var prop = {};
			this.prop = prop;

			// clip path id
			if (clipPathSize == 1)
			{
				var clipPathElem = clipPath[0];

				var cp = {};
				cp.id = dojo.attr(clipPathElem, "id");
				if (dojo.hasAttr(clipPathElem, "clip-rule"))
					cp.clipRule = dojo.attr(clipPathElem, "clip-rule");
				prop.cp = cp;

				// the path for fill. for some shapes(borderCallout3),
				// it is not the same as line path(path var)
				// so when it exists, need contain it in model
				// and for some shapes there are several paths
				// so need a vector to contain it
				var pathChildren = clipPathElem.childNodes;
				var len = pathChildren.length;
				if (len > 0)
				{
					var cpaths = [];
					for ( var i = 0; i < len; i++)
					{
						var pathElem = pathChildren[i];
						var cpath = dojo.attr(pathElem, "d");
						if (cpath)
							cpaths.push(cpath);
					}
					this.cpath = cpaths;
				}
			}
			// Gradient
			if (gradientsSize >= 1)
			{
				var grads = [];
				prop.grads = grads;
				for ( var i = 0; i < gradientsSize; i++)
				{
					var gradient = gradients[i];
					var grad = new pres.model.ShapeProp(null, this);
					grad.parseDom(gradient);
					grads.push(grad);
				}
			}
			// pattern
			if (patternSize == 1)
			{
				var ptn = new pres.model.ShapeProp(null, this);
				ptn.parseDom(pattern[0]);
				prop.ptn = ptn;
			}
		}

		// Fill-line-arrow
		var flas = dojo.query("[groupfor=fill-line-arrow]", elemDom);
		if (flas.length == 1)
		{
			var fla = flas[0];

			var children = fla.childNodes;
			for ( var i = 0, len = children.length; i < len; i++)
			{
				var grp = children[i];
				var grpFor = dojo.attr(grp, "groupfor");
				if (grpFor.toLowerCase() == "fill")
				{ // fill
					if (grp.childNodes.length == 1)
					{
						var jsonFill = new pres.model.ShapeFill(null, this);
						jsonFill.parseDom(grp.childNodes[0]);
						this.fill = jsonFill;
					}
				}
				else if (grpFor.toLowerCase() == "line")
				{ // line
					if (grp.childNodes.length == 1)
					{
						var line = grp.childNodes[0];
						var path = dojo.attr(line, "d"); // path
						this.path = path;

						var jsonLine = new pres.model.ShapeLine(null, this);
						jsonLine.parseDom(line);
						this.line = jsonLine;
					}
				}
				else if (grpFor.toLowerCase() == "arrow")
				{ // arrow
					var arrows = [];
					var arrowChildren = grp.childNodes;
					var size = arrowChildren.length;
					if (size >= 1)
					{
						this.arrows = arrows;
						for ( var j = 0; j < size; j++)
						{
							var arrow = arrowChildren[j];
							var jsonArrow = new pres.model.ShapeArrow(null, this);
							jsonArrow.parseDom(arrow);
							arrows.push(jsonArrow);
						}
					}
				}
			}
		}

		// title
		var titles = elemDom.getElementsByTagName("title");
		if (titles.length == 1)
		{
			this.title = titles[0].innerHTML;
		}
	}

});