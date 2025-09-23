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

dojo.provide("pres.utils.tableUtil");
dojo.require("pres.utils.helper");
/*
 * This utility provide table operations Including :
 */
pres.utils.tableUtil = {

	attrs: ["table_use-rows-styles", "table_use-banding-rows-styles", "table_use-first-row-styles", "table_use-last-row-styles",
			"table_use-first-column-styles", "table_use-last-column-styles", "table_use-banding-columns-styles",
			"table_use-border-styles"],
	st_plain: [true, false, false, false, false, false, false, false],
	st_blue_style: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_red_tint: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_blue_header: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_dark_gray_header_footer: [true, true, true, true, false, false, false, false], // tableHeaderRow
	st_light_gray_rows: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_dark_gray: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_blue_tint: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_red_header: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_green_header_footer: [true, true, true, true, false, false, false, false],// tableHeaderRow
	st_plain_rows: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_gray_tint: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_green_tint: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_green_header: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_red_header_footer: [true, true, true, true, false, false, false, false],// tableHeaderRow
	st_green_style: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_purple_tint: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_black_header: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_purple_header: [true, true, true, false, false, false, false, false], // tableHeaderRow
	st_light_blue_header_footer: [true, true, true, true, false, false, false, false],// tableHeaderRow
	st_default: [true, true, true, false, false, false, false, false], // tableHeaderRow

	styles: ['st_plain', 'st_blue_style', 'st_red_tint', 'st_blue_header', 'st_dark_gray_header_footer', 'st_light_gray_rows',
			'st_dark_gray', 'st_blue_tint', 'st_red_header', 'st_green_header_footer', 'st_plain_rows', 'st_gray_tint',
			'st_green_tint', 'st_green_header', 'st_red_header_footer', 'st_green_style', 'st_purple_tint', 'st_black_header',
			'st_purple_header', 'st_light_blue_header_footer', 'st_default'],

	borderStyles: ['st_border_plain', 'st_border_top_header', 'st_border_first_column_header', 'st_border_bottom_summary',
			'st_border_last_column_summary'],

	smartTableStyles: ['STStyle1', 'STStyle2', 'STStyle3', 'STStyle4', 'simpleStyle'],

	createPlainTable: function(name, rowNum, colNum)
	{
		if (!name || isNaN(rowNum) || isNaN(colNum))
			return null;

		if (rowNum <= 0 || colNum <= 0)
			return null;

		var hp = pres.utils.helper;
		var table = hp.createEle("table"), colgrp = hp.createEle("colgroup"), tbody = hp.createEle("tbody");

		var rowHeightInPerc = parseFloat(100 / rowNum).toFixed(2);
		var colWidthInPerc = parseFloat(100 / colNum).toFixed(2);
		var attrmap = this[name] || this.st_default;
		for ( var k = 0; k < colNum; k++)
		{
			var col = hp.createEle("col");
			col.style.width = colWidthInPerc + "%";
			colgrp.appendChild(col);
		}

		for ( var i = 0; i < rowNum; i++)
		{
			var row = hp.createEle("tr");
			row.setAttribute("role", "row");
			row.setAttribute("table_default-cell-style-name", "");
			dojo.addClass(row, "table_table-row");
			row.style.height = rowHeightInPerc + "%";

			if (i == 0 && attrmap[2])
				dojo.addClass(row, "tableHeaderRow");
			else if (i > 0 && i % 2 == 0)
				dojo.addClass(row, "alternateRow");
			if (i == rowNum - 1)
				dojo.addClass(row, "lastRow");

			for ( var j = 0; j < colNum; j++)
			{
				var cell = hp.createEle("td");
				cell.setAttribute("role", "gridcell");
				cell.setAttribute("tabindex",'0');
				dojo.addClass(cell, "table_table-cell");
				EditorUtil.setStyle(cell,"background-image","none");
				EditorUtil.setStyle(cell,"background-color","#ffffff");
				EditorUtil.setStyle(cell,"vertical-align","middle");
				(j == 0) && dojo.addClass(cell, "firstColumn");
				(j == colNum - 1) && dojo.addClass(cell, "lastColumn");
				
				this.genDefaultCellContent(cell);
				row.appendChild(cell);
			}
			tbody.appendChild(row);
		}

		table.setAttribute("role", "grid");
		table.setAttribute("cellspacing", 0);
		table.setAttribute("cellpadding", 0);
		table.setAttribute("table_template-name", name);
		table.setAttribute("tabindex", '0');
		dijit.setWaiState(table,'label', 'table'  );

		dojo.forEach(this.attrs, function(attr, index)
		{
			table.setAttribute(attr, attrmap[index] + "");
		});

		dojo.addClass(table, "table_table smartTable ibmdocsTable " + name);

		table.appendChild(colgrp);
		table.appendChild(tbody);

		var drawFrame = this.createDrawFrameForTable(table, rowNum, colNum);
		return drawFrame;
	},

	createDrawFrameForTable: function(table, rowNum, colNum)
	{
		if (!table)
			return null;
		var hp = pres.utils.helper, c = pres.constants, slideEditor = pe.scene.slideEditor;
		var df = hp.createEle("div");

		var tmpDiv = hp.createEle("div");
		tmpDiv.appendChild(table);
		document.body.appendChild(tmpDiv);

		dojo.addClass(df, "draw_frame");
		df.setAttribute("presentation_class", "table");
		df.setAttribute("pfs", "18");
		df.setAttribute("draw_layer", "layout");
		df.setAttribute("text_anchor-type", "paragraph");

		var height = (c.DEFAULT_TABLE_HEIGHT / 4 * rowNum).toFixed(2);
		var width = (c.DEFAULT_TABLE_WIDTH / 4 * colNum).toFixed(2);

		if (height < c.DEFAULT_TABLE_HEIGHT / 2)
			height = c.DEFAULT_TABLE_HEIGHT / 2;

		if (width < c.DEFAULT_TABLE_WIDTH / 2)
			width = c.DEFAULT_TABLE_WIDTH / 2;

		if (height > 75)
			height = 75;
		if (width > 75)
			width = 75;

		df.style.cssText = "position: absolute; top: " + c.DEFAULT_TABLE_TOP + "%; " + "left: " + c.DEFAULT_TABLE_LEFT + "%; "
			+ "height: " + height + "%; " + "width: " + width + "%; ";
		// "visibility: hidden";

		dojo.style(table, {
			'height': "100%",
			'width': "100%"
		});

		df.appendChild(table);
		dojo.destroy(tmpDiv);

		return df;
	},

	applyIDsToTemplate: function(template)
	{
		var strTemp = JSON.stringify(template);
		var hp = pres.utils.helper;
		strTemp = strTemp.replace(new RegExp("{id}", "gi"), function(item)
		{
			return hp.getUUID();
		});

		var json = JSON.parse(strTemp);
		return json;
	},

	genDefaultCellContent: function(element, oldP)
	{
		var hp = pres.utils.helper;
		if (oldP)
		{
			element.appendChild(oldPNode);
		}
		else
		{
			var defaultStr = '<span id=\"' + hp.getUUID() + '\" style="font-size: 1em;">&#8203;</span><br class="hideInIE" />';
			var para = hp.createEle('p');
			para.innerHTML = defaultStr;
			EditorUtil.setStyle(para,"text-align","center");
			element.appendChild(para);
		}
	},

	getFristOrLastPLIFromNode: function(node, getLast)
	{
		if (!node)
			return null;
		var spanList = dojo.query("p,li", node);
		var spanListLen = spanList.length;
		var retSpan = null;
		if (getLast)
		{
			retSpan = (spanListLen > 0) && spanList[spanListLen - 1];
		}
		else
		{
			retSpan = (spanListLen > 0) && spanList[0];
		}
		return retSpan;
	},

	getFristOrLastSpanFromNode: function(node, getLast)
	{
		if (!node)
			return null;

		var spanList = node.getElementsByTagName('span');
		var spanListLen = spanList.length;
		var retSpan = null;
		if (getLast)
		{
			retSpan = (spanListLen > 0) && spanList[spanListLen - 1];
		}
		else
		{
			retSpan = (spanListLen > 0) && spanList[0];
		}
		return retSpan;
	},

	checkBoundaryOfTD: function(node, offset, isEnd)
	{
		var td = EditorUtil.getAscendant(node, 'th') || EditorUtil.getAscendant(node, 'td');
		if (!td)
			return false;
		var navNode = isEnd ? td.lastChild : td.firstChild;
		var cldNum = -1;
		var txt = td.textContent || td.innerText;
		if (txt && (txt.length === 1) && (txt.charCodeAt(0) === 8203))
			return true;

		if (dojo.isChrome || dojo.isSafari)
		{
			var validateNode = function(node)
			{
				// empty text nodes may create by browser, so need to skip them
				while (node)
				{
					if (node.nodeType == 3)
					{
						// text node
						var dataV = EditorUtil.getText(node);
						if (dataV.length === 0)
						{
							node = node.previousSibling;
						}
						else
						{
							break;
						}
					}
					else
					{
						break;
					}
				}
				return node;
			};

			node = validateNode(node);
			navNode = validateNode(navNode);
		}

		while (navNode)
		{
			if (isEnd)
			{
				if (dojo.isChrome || dojo.isSafari)
				{
					navNode = validateNode(navNode);
				}

				if (EditorUtil.is(navNode, "br"))
					navNode = navNode.previousSibling;

				if (node == navNode)
				{
					if (node.nodeType == 3)
					{
						var dataV = EditorUtil.getText(node);
						cldNum = dataV.length;
					}
					else
					{
						cldNum = node.childNodes.length;
					}
					if (offset == cldNum)
						return true;
				}

				navNode = (navNode.nodeType == 1) ? navNode.lastChild : null;
			}
			else
			{
				if (node == navNode)
				{
					if (offset === 0)
						return true;
				}
				navNode = (navNode.nodeType == 1) ? navNode.firstChild : null;
			}
		}
		return false;
	},
	// see the selected table has merge cell or not, table is a DOM table node
	isMergeCell: function(table){
    	if(!table)
			return false;
		var rows = table.rows;
		if(!rows)
			return false;
		for( var i = 0; i < rows.length; i++ )
		{
			var row = rows.item(i);			
			var cells = row.cells;
			if(cells)
				{
					for( var j = 0; j < cells.length; j++ )
					{
						var cell = cells.item(j);
						if( cell.colSpan > 1 || cell.rowSpan > 1 )
							return true;
					}
				}
		}
		return false;
    }
};
