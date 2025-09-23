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

dojo.provide("pres.utils.helper");
dojo.require("concord.util.browser");

pres.utils.helper = {

	isMobileBrowser: function()
	{
		return concord.util.browser.isMobileBrowser() && !this.isMobile;
	},

	isArraySame: function(a, b)
	{
		if (a.length != b.length)
			return false;
		for ( var i = 0; i < a.length; i++)
		{
			if (a[i] != b[i])
				return false;
		}
		return true;
	},

	injectRdomIdsForElement: function(element)
	{
		if (element != null)
		{
			var elementName;
			if (element.tagName != null)
			{
				elementName = (element.tagName).toLowerCase();
			}
			else if (element.getName() != null)
			{
				elementName = (element.getName()).toLowerCase();
			}
			if (elementName == "br" && !dojo.hasClass(element, "hideInIE") && !dojo.hasClass(element, "text_line-break") && element.parentNode != null)
			{
				element.parentNode.removeChild(element);
			}
			// alert("elemntName:"+elementName);

			// do a setTimeout when calling MSGUTIL.getUUID()
			// to work around the issue of having the same UUID for consecutive elements
			// somehow there's a timing issue that creates same element id twice
			var idValue = this.getUUID();
			element.setAttribute("id", idValue);
			return idValue;
		}
	},

	getUUID: function(prefix,length)
	{
		if(!length)
			length = 12;
		if (!this.mainId)
		{
			this.mainId = "body_id_";
		}
		var seedA = Math.random().toString(16);
		var seedB = Math.random().toString(16);
		var uuid = seedA + seedB;
		uuid = uuid.replace(/0\./g, "");

		if (prefix && prefix != '')
			return prefix + uuid.substring(0, length);
		else
			return this.mainId + uuid.substring(0, length);
	},

	createEle: function(name)
	{
		var tmp = document.createElement(name);
		tmp.setAttribute("id", this.getUUID());
		return tmp;
	},

	setIDToCell: function(cell, cascade)
	{
		var map = {};
		if (!cell)
			return map;

		cell.id = this.getUUID('td_id_');
		var obj;
		if (cascade)
		{
			var htmlStr = cell.content;
			var htmlNode = document.createElement('div');
			htmlNode.innerHTML = htmlStr;
			map = pres.utils.helper.setIDToNode(htmlNode, true);
			cell.content = htmlNode.innerHTML;
		}
		return map;
	},

	setIDToRow: function(row, cascade)
	{
		var map = {};
		if (!row)
			return map;

		var ids = [];
		row.id = this.getUUID('tr_id_');
		if (cascade)
		{
			var newCells = [];
			dojo.forEach(row.cells, dojo.hitch(this, function(cell)
			{
				var cellMap = this.setIDToCell(cell, cascade);
				if (cellMap)
					dojo.mixin(map, cellMap);
			}));
		}
		return map;
	},

	setIDToTable: function(table, cascade)
	{
		var map = {};
		table.id = this.getUUID('table_id_');
		if (cascade)
		{
			dojo.forEach(table.rows, dojo.hitch(this, function(row)
			{
				var rowMap = this.setIDToRow(row, cascade);
				if (rowMap)
					dojo.mixin(map, rowMap);
			}));
		}
		table.updateTableMap();
		return map;
	},

	setIDToShapeImg: function(shapeImg)
	{
		shapeImg.divId = this.getUUID();
		shapeImg.id = this.getUUID('SHAPE_id_');
	},

	setIDToShapeSvg: function(shapeSvg, cascade)
	{
		shapeSvg.divId = this.getUUID();
		shapeSvg.id = this.getUUID();

		if (cascade)
		{
			if (shapeSvg.prop)
			{
				// Clip path(id and clip-rule)
				if (shapeSvg.prop.cp)
					shapeSvg.prop.cp.id = this.getUUID('svg_clippath_fill_id_');
				// Gradient fills
				var grads = shapeSvg.prop.grads;
				var lineGradId = null, fillGradId = null;
				if (grads)
				{
					var len = grads.length;
					for ( var i = 0; i < len; i++)
					{
						grads[i].id = this.getUUID('svg_grd_id_');
						var target = grads[i].attr('gradtarget');
						if (target == 'stroke')
							lineGradId = grads[i].id;
						else if (target == 'fill')
							fillGradId = grads[i].id;
					}
				}
				// Image fill
				if (shapeSvg.prop.ptn)
					shapeSvg.prop.ptn.id = this.getUUID('svg_pattern_id_');
			}

			// Fill, line and arrow
			// Fill
			if (shapeSvg.fill)
			{
				shapeSvg.fill.id = this.getUUID('svg_fill_id_');
				var clipPath = shapeSvg.fill.attr('clip-path');
				// For new created shape, clipPath is null and also need be set
				if ((!clipPath || (clipPath && (clipPath.indexOf('url(#') == 0))) && shapeSvg.prop && shapeSvg.prop.cp && shapeSvg.prop.cp.id)
				{
					shapeSvg.fill.attr('clip-path', 'url(#' + shapeSvg.prop.cp.id + ')');
				}
				var fill = shapeSvg.fill.attr('fill');
				if (fill && (fill.indexOf('url(#') == 0))
				{
					if (fillGradId)
						shapeSvg.fill.attr('fill', 'url(#' + fillGradId + ')');
					else if (shapeSvg.prop && shapeSvg.prop.ptn && shapeSvg.prop.ptn.id)
						shapeSvg.fill.attr('fill', 'url(#' + shapeSvg.prop.ptn.id + ')');
				}
			}
			// line
			shapeSvg.line.id = this.getUUID('svg_stroke_id_');
			var stroke = shapeSvg.line.attr('stroke');
			if (stroke && (stroke.indexOf('url(#') == 0) && lineGradId)
			{
				shapeSvg.line.attr('stroke', 'url(#' + lineGradId + ')');
			}
			// Arrow
			if (shapeSvg.arrows)
			{
				var arrows = shapeSvg.arrows;
				len = arrows.length;
				for ( var i = 0; i < len; i++)
				{
					if (arrows[i].type == 'head')
						arrows[i].id = this.getUUID('svg_head_end_id_');
					else if (arrows[i].type == 'tail')
						arrows[i].id = this.getUUID('svg_tail_end_id_');

					var arrowStroke = arrows[i].attr('stroke');
					if (arrowStroke && (arrowStroke.indexOf('url(#') == 0) && lineGradId)
					{
						arrows[i].attr('stroke', 'url(#' + lineGradId + ')');
					}

					var arrowFill = arrows[i].attr('fill');
					if (arrowFill && (arrowFill.indexOf('url(#') == 0) && lineGradId)
					{
						arrows[i].attr('fill', 'url(#' + lineGradId + ')');
					}
				}
			}
		}
	},

	setIDToShapeOthers: function(shapeOthers, cascade)
	{
		var map = {};
		len = shapeOthers.length;
		for ( var i = 0; i < len; i++)
		{
			shapeOthers[i].divId = this.getUUID();
			// Set content Ids
			if (shapeOthers[i].content)
			{
				var htmlStr = shapeOthers[i].content;
				var htmlNode = document.createElement('div');
				htmlNode.innerHTML = htmlStr;
				var idMap = pres.utils.helper.setIDToNode(htmlNode, true);
				if (idMap)
					dojo.mixin(map, idMap);
				shapeOthers[i].content = htmlNode.innerHTML;
			}
		}
		return map;
	},

	setIDToShape: function(shape, cascade)
	{
		var map = {};
		shape.id = this.getUUID('cust_shape_id_');
		shape.dataId = this.getUUID();

		if (cascade)
		{
			if (shape.txtBox)
			{
				var htmlStr = shape.txtBox.content;
				// currently, we support html content,
				// it will be different if we support total json model
				var htmlNode = document.createElement('div');
				htmlNode.innerHTML = htmlStr;
				var idMap = pres.utils.helper.setIDToNode(htmlNode, true);
				if (idMap)
					dojo.mixin(map, idMap);
				shape.txtBox.content = htmlNode.innerHTML;
				shape.txtBox.id = this.getUUID();
			}

			if (shape.img)
			{
				this.setIDToShapeImg(shape.img);
			}
			else if (shape.svg)
			{
				this.setIDToShapeSvg(shape.svg, cascade);
			}

			if (shape.others)
			{
				var othersMap = this.setIDToShapeOthers(shape.others, cascade);
				if (othersMap)
					dojo.mixin(map, othersMap);
			}
		}
		return map;
	},

	setIDToModel: function(model, cascade)
	{
		if (!model)
			return false;

		var elements = [];
		if (model instanceof pres.model.Slide)
		{
			model.id = this.getUUID('slide_id_');
			model.wrapperId = this.getUUID('slideWrapper_id_');
			dojo.forEach(model.elements, function(ele)
			{
				elements.push([ele, cascade]);
			});
		}
		else if (model instanceof pres.model.Element)
		{
			elements.push([model, true]);
		}

		dojo.forEach(elements, function(elementItem)
		{
			var ids = [];
			var element = elementItem[0];
			if (elementItem[1])
				element.id = pres.utils.helper.getUUID();

			if (cascade)
			{
				var idMap;
				if (element.family == 'table' && element.table)
				{
					idMap = pres.utils.helper.setIDToTable(element.table, cascade);
				}
				else if (element.family == 'group')
				{
					idMap = pres.utils.helper.setIDToShape(element, cascade);
				}
				else
				{
					var htmlStr = element.content;
					// currently, we support html content,
					// it will be different if we support total json model
					var htmlNode = document.createElement('div');
					htmlNode.innerHTML = htmlStr;
					idMap = pres.utils.helper.setIDToNode(htmlNode, true);
					element.content = htmlNode.innerHTML;
				}
			}
		});
	},

	setIDToNode: function(root, cascade, withoutRoot)
	{
		var idMap = {};
		if (!withoutRoot)
		{
			var uuID = this.getUUID();
			var oId = root.id;
			root.id = uuID;
			if (oId)
				idMap[oId] = uuId;
		}
		if (cascade)
		{
			dojo.query('div,p,li,span,a,ol,ul,img,label', root).forEach(function(node)
			{
				var uuID = this.getUUID();
				var oId = node.id;
				node.id = uuID;
				if (oId)
					idMap[oId] = uuID;
			}, this);
		}

		return idMap;
	},

	/**
	 * This function returns the equivalent % given a px number
	 */
	pxToPercent: function(px, box, useWidth)
	{
		var pxValue = parseFloat(px);
		var value = (!useWidth) ? 768 : 1024;
		try{
			var parent = box ? box : (pe.scene.slideEditor.slideNode ? pe.scene.slideEditor.slideNode : pe.scene.slideSorter.getCurrentThumb().content); // box.domNode.parentNode;
			if(parent)
			  value = (!useWidth) ? parent.offsetHeight : parent.offsetWidth;	
		} catch (e){}
		var result = (pxValue * 100) / value;
		return result;
	},
	
	cm2pxReal: function(cm)
	{
		if (!cm || isNaN(cm))
			return 0;
		if(!this.cm2pxRatio)
		{
			var div = dojo.create("div", {style:{
				"position": "absolute",
				"top": "-1000cm",
				"height": "1000cm"
			}}, dojo.body());
			
			var px = div.offsetHeight;
			this.cm2pxRatio = px / 1000;
			
			dojo.destroy(div);
		}
		return cm * this.cm2pxRatio;
	},

	cm2px: function(cm)
	{
		if (!cm || isNaN(cm))
			return 0;

		var slideEditor = pe.scene.slideEditor;
		var scaleR = slideEditor.scaleRatio;
		return parseFloat(cm) * scaleR;
	},
	
	emuToPx: function(emu)
	{
		return this.cm2px(emu / pres.constants.CM_TO_EMU_FACTOR);
	},

	px2cm: function(pxValue)
	{
		if (!pxValue || isNaN(pxValue))
			return 0;

		var slideEditor = pe.scene.slideEditor;
		var scaleR = slideEditor.scaleRatio;
		var cmValue = parseFloat(pxValue) / scaleR;

		return cmValue;
	},
	
	pxToEmu: function(px)
	{
		return this.px2cm(px) * pres.constants.CM_TO_EMU_FACTOR;
	},

	getColWidthsFromDOM: function(tableNode)
	{
		if (!tableNode || tableNode.nodeName.toUpperCase() != "TABLE")
			return 0;

		var colgrp = tableNode.firstChild;
		if (colgrp.nodeName.toUpperCase() != "COLGROUP")
			return 0;

		var cols = colgrp.childNodes, row = tableNode.rows[0];
		var len = cols.length;
		// fake a tr to get a accurate col width
		var tr = document.createElement("tr");
		for ( var i = 0; i < len; i++)
		{
			var td = document.createElement("td");
			tr.appendChild(td);
		}
		row.parentNode.insertBefore(tr, row);

		var tableW = dojo.style(tableNode, "width");
		var ret = [];
		for ( var i = 0; i < len; i++)
		{
			var pos = dojo.marginBox(tr.cells[i]);
			ret.push(pos.w);
		}
		tr.parentNode.removeChild(tr);
		return ret;
	}

}