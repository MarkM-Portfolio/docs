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

dojo.provide("pres.utils.shapeUtil");
dojo.require("pres.utils.helper");
dojo.require("pres.def.prstShapes");
/*
 * This utility provide shape operations Including :
 */
pres.utils.shapeUtil = {
	connectorShapeTypes: {
		'line': 1,
		'straightConnector1': 1,
		'bentConnector2': 1,
		'bentConnector3': 1,
		'bentConnector4': 1,
		'bentConnector5': 1,
		'curvedConnector2': 1,
		'curvedConnector3': 1,
		'curvedConnector4': 1,
		'curvedConnector5': 1
	},
	
	initNoFillShapeTypes: ["arc", "leftBrace", "rightBrace", "leftBracket", "rightBracket", "bracePair", "bracketPair"],
	/**
	 * When zooming slide editor or thumbnails, a scale will be added for shapes because absolute points are used
	 * 
	 * @param slide:
	 *            The slide which the shape belongs to
	 * @param slidePx:
	 *            The height of slide. PX unit
	 * @param isThumbnail:
	 *            Sorter or editor
	 * @param shape:
	 *            If it is null, scale all shapes in "slide". Or scale the shape
	 */
	scaleShapeForZoom: function(slide, slidePx, isThumbnail, shape)
	{
		if (!slide)
			return;
		var flaGroups = null;
		// g with attribute "transform" and its value contains "scale(1.3333)"
		var key = 'g[transform~="scale(1.3333)"]';
		if (shape)
			flaGroups = dojo.query(key, shape);
		else
			flaGroups = dojo.query(key, slide);
		var len = flaGroups.length;
		if (len == 0)
			return;

		var pageHeight = pe.scene.doc.slides[0].h;
		var px = null;
		if (slidePx)
			px = slidePx;
		else
		{
			var height = dojo.style(slide, 'height');
			if (dojo.isWebKit && isThumbnail)
				px = height / 10;
			else
				px = height;
		}
		// cm to pixel
		var cmFromPx = (px * 2.54 / 96);
		var scale = cmFromPx / pageHeight;
		//TODO should use exact value here
		//scale = Math.floor(scale*100)/100;

		for ( var i = 0; i < len; i++)
		{
			var flaGrp = flaGroups[i];
			var transform = dojo.attr(flaGrp, 'transform');
			// background object will use old html
			// and no need to update scale
			var idx = transform.indexOf('scale(1.3333) translate');
			if (idx >= 0)
			{
				transform = transform.substr(idx);
				if (transform)
				{
					// Should be scale first
					if (dojo.isWebKit && isThumbnail)
						dojo.attr(flaGrp, 'transform', 'scale(10) scale(' + scale + ') ' + transform);
					else
						dojo.attr(flaGrp, 'transform', 'scale(' + scale + ') ' + transform);
				}
			}
		}
	},
     /**
      * Set predefined guide list value.
      * @param {Object} gdLst - guide list
      * @parm{Object} frm - frame
      */
  _setPredefinedGdValues: function(gdLst, frm) {
     if (!gdLst || !frm)
         return;
     var l = 0, t = 0, w = frm.w, h = frm.h;     
     
     //3/4 of a Circle ('3cd4') - Constant value of "16200000.0"
     //The units here are in 60,000ths of a degree. This is equivalent to 270 degrees
     // (3/4)*360 * 60000 = 16200000, cd means circle degree
     gdLst['3cd4'] = 16200000;
     //135 degrees
     gdLst['3cd8'] = 8100000;
     //225 degrees
     gdLst['5cd8'] = 13500000;
     gdLst['7cd8'] = 18900000;
     gdLst['b'] = h;
     // 1/2 of Circle, 180 degrees
     gdLst['cd2'] = 10800000;
     gdLst['cd4'] = 5400000;
     gdLst['cd8'] = 2700000;
     //shape height
     //This is the variable height of the shape defined in the shape properties. This value is received from the shape
     //transform listed within the <spPr> element.
     gdLst['h'] = h;
     //Horizontal Center ('hc') - Calculated value of "*/ w 1.0 2.0"
     gdLst['hc'] = w/2;
     //1/2 of Shape Height ('hd2') - Calculated value of "*/ h 1.0 2.0"
     //This is 1/2 the shape height.
     gdLst['hd2'] = h/2;
     gdLst['hd4'] = h/4;
     gdLst['hd5'] = h/5;
     gdLst['hd6'] = h/6;
     gdLst['hd8'] = h/8;
     //Shape Left Edge ('l') - Constant value of "0"
     //This is the left edge of the shape and the left edge of the shape is considered the horizontal 0 point.
     gdLst['l'] = l;
     //Longest Side of Shape ('ls') - Calculated value of "max w h"
     //This is the longest side of the shape. This value is either the width or the height depending on which is greater.
     gdLst['ls'] = w>h?w:h;
     //Shape Right Edge ('r') - Constant value of "w"
     //This is the right edge of the shape and since the left edge of the shape is considered the 0 point, the right edge is thus the shape width.
     gdLst['r'] = w;
     //Shortest Side of Shape ('ss') - Calculated value of "min w h"
     //This is the shortest side of the shape. This value is either the width or the height depending on which is smaller.
     gdLst['ss'] = w>h?h:w;
     //1/2 Shortest Side of Shape ('ssd2') - Calculated value of "*/ ss 1.0 2.0"
     gdLst['ssd2'] = gdLst['ss']/2;
     gdLst['ssd4'] = gdLst['ss']/4;
     gdLst['ssd6'] = gdLst['ss']/6;
     gdLst['ssd8'] = gdLst['ss']/8;
     //Shape Top Edge ('t') - Constant value of "0"
     //This is the top edge of the shape and the top edge of the shape is considered the vertical 0 point.
     gdLst['t'] = t;
     //Vertical Center of Shape ('vc') - Calculated value of "*/ h 1.0 2.0"
     //This is the vertical center of the shape which is just the height divided by 2.
     gdLst['vc'] = h/2;
     //Shape Width ('w') This is the variable width of the shape defined in the shape properties. This value is received from the shape 
     //transform listed within the <spPr> element.
     gdLst['w'] = w;
     //1/2 of Shape Width ('wd2') - Calculated value of "*/ w 1.0 2.0" This is 1/2 the shape width.
     gdLst['wd2'] = w/2;
     gdLst['wd4'] = w/4;
     gdLst['wd5'] = w/5;
     gdLst['wd6'] = w/6;
     gdLst['wd8'] = w/8;
     gdLst['wd10'] = w/10;
     
     //Values not in predefined guide, but used
     gdLst['hd3'] = h/3;
     gdLst['ssd16'] = gdLst['ss']/16;
     gdLst['ssd32'] = gdLst['ss']/32;
     gdLst['wd32'] = w/32;
     gdLst['wd3'] = w/3;
     gdLst['wd12'] = w/12;
   },
	
	calcGdLstValuesFromShapeFrame: function(frm, customAv, type)
	{	
		// read prstShapes json object
		var prstShapeDefs = pres.def.prstShapes[type];
		if (!prstShapeDefs)
			return null;

		var gdLst = prstShapeDefs['gdLst'] ? dojo.clone(prstShapeDefs['gdLst']) : {};
		this._setPredefinedGdValues(gdLst, frm); // Supplement for gdLst

		var avLst = prstShapeDefs['avLst'] ? dojo.clone(prstShapeDefs['avLst']) : {};
		dojo.mixin(avLst, customAv);
		
		return this._calcGdLstValuesFromGuide(avLst, gdLst);
	},
	
	_calcGdLstValuesFromGuide: function(avLst, gdLst)
	{
		for(var name in avLst)
		{
			if(isNaN(avLst[name]))
				avLst[name] = parseFloat(avLst[name].split(' ')[1]);
		}
		
		var resolvedCount = NaN;
		while(resolvedCount != 0)
		{
			resolvedCount = 0;
			for(var gd in gdLst)
			{
				if((typeof gdLst[gd]) != 'number')
				{
					var r = this._calcFormula(gdLst[gd], avLst, gdLst);
					if(r !== gdLst[gd])
					{
						gdLst[gd] = r;
						resolvedCount++;
					}
				}
			}
		}
		
		return gdLst;
	},
	
	/**
	 * Return the formula result
	 * 
	 * If the formula can not be calculate yet, or/and it is invalidate, simply return the formula  
	 */
	_calcFormula: function(gdFormula, avLst, gdLst)
	{
		if (!gdFormula || gdFormula.length == 0)
			return gdFormula;
		
		if(!isNaN(Number(gdFormula)))
			return Number(gdFormula);

		// op arg1 arg2 arg3
		var opArgs = gdFormula.split(' ');
		if (!opArgs || opArgs.length <= 1)
			return gdFormula;

		var argNum = 0;
		// There are some incorrect formulas such as "+- xH 0 dxB 0"
		// Here at most there are 4 item. 
		for ( var i = 1, len = opArgs.length > 4 ? 4 : opArgs.length; i < len; i++)
		{
			//TODO: is the 'if' necessary?
			if (opArgs[i].length > 0)
			{
				var f = Number(opArgs[i]);
				if(isNaN(f))
					f = gdLst[opArgs[i]];
				if(isNaN(f))
					f = avLst[opArgs[i]];
				if(isNaN(f))
				{
					return gdFormula;
				}
				
				opArgs[i] = f;
				argNum++;
			}
		}

		var op = opArgs[0];
		// calculate by operator
		if (op == "val")
		{
			if (argNum != 1)
				return gdFormula;
			return opArgs[1];
		}

		if (op == "+-")
		{
			if (argNum != 3)
				return gdFormula;

			return (opArgs[1] + opArgs[2]) - opArgs[3];
		}

		if (op == "+/")
		{
			if (argNum != 3)
				return gdFormula;

			return (opArgs[1] + opArgs[2]) / opArgs[3];
		}

		if (op == "*/")
		{
			if (argNum != 3)
				return gdFormula;

			return (opArgs[1] * opArgs[2]) / opArgs[3];
		}

		if (op == "?:")
		{
			if (argNum != 3)
				return gdFormula;

			if (opArgs[1] > 0)
			{
				return opArgs[2];
			}
			else
			{
				return opArgs[3];
			}
		}

		if (op == "abs")
		{
			if (argNum != 1)
				return gdFormula;

			if (opArgs[1] < 0)
			{
				return -(opArgs[1]);
			}
			else
			{
				return opArgs[1];
			}
		}

		if (op == "sqrt")
		{
			if (argNum != 1)
				return gdFormula;

			return Math.sqrt(opArgs[1]);
		}

		if (op == "max")
		{
			if (argNum != 2)
				return gdFormula;

			if (opArgs[1] > opArgs[2])
				return opArgs[1];
			else
				return opArgs[2];
		}

		if (op == "min")
		{
			if (argNum != 2)
				return gdFormula;

			if (opArgs[1] < opArgs[2])
				return opArgs[1];
			else
				return opArgs[2];
		}

		if (op == "mod")
		{
			if (argNum != 3)
				return gdFormula;

			return Math.sqrt((opArgs[1] * opArgs[1]) + (opArgs[2] * opArgs[2]) + (opArgs[3] * opArgs[3]));
		}

		if (op == "pin")
		{
			if (argNum != 3)
				return gdFormula;

			if (opArgs[2] < opArgs[1])
				return opArgs[1];
			else if (opArgs[2] > opArgs[3])
				return opArgs[3];
			else
				return opArgs[2];
		}

		if (op == "sin")
		{
			if (argNum != 2)
				return gdFormula;

			opArgs[2] = (opArgs[2] * Math.PI) / (60000 * 180);
			return opArgs[1] * Math.sin(opArgs[2]);
		}

		if (op == "cos")
		{
			if (argNum != 2)
				return gdFormula;

			opArgs[2] = (opArgs[2] * Math.PI) / (60000 * 180);
			return opArgs[1] * Math.cos(opArgs[2]);
		}

		if (op == "tan")
		{
			if (argNum != 2)
				return gdFormula;

			opArgs[2] = (opArgs[2] * Math.PI) / (60000 * 180);
			return opArgs[1] * Math.tan(opArgs[2]);
		}

		if (op == "at2")
		{
			if (argNum != 2)
				return gdFormula;

			return (Math.atan2(opArgs[2], opArgs[1]) * 60000 * 180) / (Math.PI);
		}

		if (op == "sat2")
		{
			if (argNum != 3)
				return gdFormula;

			return opArgs[1] * Math.sin(Math.atan2(opArgs[3], opArgs[2]));
		}

		if (op == "cat2")
		{
			if (argNum != 3)
				return gdFormula;

			return opArgs[1] * Math.cos(Math.atan2(opArgs[3], opArgs[2]));
		}

		return gdFormula;
	},
	
	invertCalcAvLstFromGuideWithAh: function(frm, customAv, type, ahIndex, posX, posY)
	{
		var prstShapeDefs = pres.def.prstShapes[type];
		if (!prstShapeDefs)
			return;

		var gdLst = prstShapeDefs['gdLst'] ? dojo.clone(prstShapeDefs['gdLst']) : {};
		this._setPredefinedGdValues(gdLst, frm);

		var avLst = prstShapeDefs['avLst'] ? dojo.clone(prstShapeDefs['avLst']) : {};
		dojo.mixin(avLst, customAv);
		
		ah = this.getAhByIndex(type, ahIndex);
		
		delete avLst[ah.gdRefX];
		delete avLst[ah.gdRefY];
		delete avLst[ah.gdRefAng];
		delete avLst[ah.gdRefR];

		var avResultLst = this._invertCalcGdLstFromGuide(frm, posX, posY, ah, avLst, gdLst);		
		return avResultLst;
	},
	
	_invertCalcGdLstFromGuide: function(frm, posX, posY, ah, avLst, gdLst)
	{
		var avResultLst = {};
		//ahPolar
		if(ah.gdRefAng)
		{
			var centX = frm.w/2, centY = frm.h/2;
			var value = (Math.atan2(posY-centY, posX-centX)*180/Math.PI - (frm.rot?frm.rot:0));
			value = (value+720)%360*60000;
			var max = ('maxAng' in ah) ? ah.maxAng : Infinity;
			var min = ('minAng' in ah) ? ah.minAng : -Infinity;
			if(value > max)
				value = max;
			if(value < min)
				value = min;				
			avResultLst[ah.gdRefAng] = value;
			
			if(!ah.gdRefR)
				return avResultLst;
		}
		
		//ahXY
		this._calcGdLstValuesFromGuide(avLst, gdLst);
		var r = this._invertCalcFormula(gdLst[ah.pos.x], posX, avLst, gdLst);
		while(r != gdLst[ah.pos.x])
		{
			key = r.key, value = r.value;
			if(key == ah.gdRefX)
			{
				var max = ('maxX' in ah) ? ah.maxX : Infinity;
				max = isNaN(max) ? gdLst[max] : Number(max);
				var min = ('minX' in ah) ? ah.minX : -Infinity;
				min = isNaN(min) ? gdLst[min] : Number(min);
				if(value > max)
					value = max;
				if(value < min)
					value = min;
				avResultLst[key] = value;
				break;
			}
			else if(key == ah.gdRefY)
			{
				var max = ('maxY' in ah) ? ah.maxY : Infinity;
				max = isNaN(max) ? gdLst[max] : Number(max);
				var min = ('minY' in ah) ? ah.minY : -Infinity;
				min = isNaN(min) ? gdLst[min] : Number(min);
				if(value > max)
					value = max;
				if(value < min)
					value = min;
				avResultLst[key] = value;
				break;
			}
			else if(key == ah.gdRefR)
			{
				var max = ('maxR' in ah) ? ah.maxR : Infinity;
				max = isNaN(max) ? gdLst[max] : Number(max);
				var min = ('minR' in ah) ? ah.minR : -Infinity;
				min = isNaN(min) ? gdLst[min] : Number(min);
				if(value > max)
					value = max;
				if(value < min)
					value = min;
				avResultLst[key] = value;
				break;
			}
			r = this._invertCalcFormula(gdLst[r.key], r.value, avLst, gdLst);
		}
		r = this._invertCalcFormula(gdLst[ah.pos.y], posY, avLst, gdLst);
		while(r != gdLst[ah.pos.y])
		{
			key = r.key, value = r.value;
			if(key == ah.gdRefX)
			{
				var max = ('maxX' in ah) ? ah.maxX : Infinity;
				max = isNaN(max) ? gdLst[max] : Number(max);
				var min = ('minX' in ah) ? ah.minX : -Infinity;
				min = isNaN(min) ? gdLst[min] : Number(min);
				if(value > max)
					value = max;
				if(value < min)
					value = min;
				avResultLst[key] = value;
				break;
			}
			else if(key == ah.gdRefY)
			{
				var max = ('maxY' in ah) ? ah.maxY : Infinity;
				max = isNaN(max) ? gdLst[max] : Number(max);
				var min = ('minY' in ah) ? ah.minY : -Infinity;
				min = isNaN(min) ? gdLst[min] : Number(min);
				if(value > max)
					value = max;
				if(value < min)
					value = min;
				avResultLst[key] = value;
				break;
			}
			else if(key == ah.gdRefR)
			{
				var max = ('maxR' in ah) ? ah.maxR : Infinity;
				max = isNaN(max) ? gdLst[max] : Number(max);
				var min = ('minR' in ah) ? ah.minR : -Infinity;
				min = isNaN(min) ? gdLst[min] : Number(min);
				if(value > max)
					value = max;
				if(value < min)
					value = min;
				avResultLst[key] = value;
				break;
			}
			r = this._invertCalcFormula(gdLst[r.key], r.value, avLst, gdLst);
		}
		
		return avResultLst;
	},
	
	_invertCalcFormula: function(gdFormula, value, avLst, gdLst)
	{
		if(!isNaN(gdFormula))
			return Number(gdFormula);
		
		var opArgs = gdFormula.split(' ');
		var pos = 0, resultName = "", result = {};
		for(var i=1, len = opArgs.length > 4 ? 4 : opArgs.length; i<len; i++)
		{
			var f = Number(opArgs[i]);
			if(isNaN(f))
				f = gdLst[opArgs[i]];
			if(isNaN(f))
				f = avLst[opArgs[i]];
			if(isNaN(f))
			{
				resultName = opArgs[i];
				if(pos > 0)
					return gdFormula;
				pos = i;
			}
			else
			{
				opArgs[i] = f;
			}
		}
		
		if(pos === 0)
			return undefined;
		
		result.key = resultName;
		
		switch(opArgs[0])
		{
		case "*/":
			if(pos == 1)
				result.value = value * opArgs[3] / opArgs[2];
			if(pos == 2)
				result.value = value * opArgs[3] / opArgs[1];
			if(pos == 3)
				result.value = opArgs[1] * opArgs[2] / value;
			break;
		case "+-":
			if(pos == 1)
				result.value = value + opArgs[3] - opArgs[2];
			if(pos == 2)
				result.value = value + opArgs[3] - opArgs[1];
			if(pos == 3)
				result.value = opArgs[1] + opArgs[2] - value;
			break;
		case "+/":
			if(pos == 1)
				result.value = value * opArgs[3] - opArgs[2];
			if(pos == 2)
				result.value = value * opArgs[3] - opArgs[1];
			if(pos == 3)
				result.value = (opArgs[1] + opArgs[2]) / value;
			break;
		case "pin":
			if(pos == 2)
				result.value = value;
			break;
		case "cos":
			if(pos==1)
				result.value = value/Math.cos(opArgs[2]*Math.PI/180/60000);
			break;
		}
		
		return result;
	},
	
	/**
	 * Return the ah definiation by index
	 * It will first index ahXY list and then ahPolar list
	 */
	getAhByIndex: function(type, index)
	{
		var prstShapeDefs = pres.def.prstShapes[type];
		if(!prstShapeDefs)
			return;
		var ahLst = prstShapeDefs.ahLst;
		var ahAry;
		
		if(ahLst.ahXY)
		{
			if(Array.isArray(ahLst.ahXY))
				ahAry = ahLst.ahXY;
			else
				ahAry = [ahLst.ahXY];
			
			if(index < ahAry.length)
				return ahAry[index];
			else
				index = index - ahAry.length;
		}
		
		if(ahLst.ahPolar)
		{
			if(Array.isArray(ahLst.ahPolar))
				ahAry = ahLst.ahPolar;
			else
				ahAry = [ahLst.ahPolar];
			
			if(index <= ahAry.length)
				return ahAry[index];
		}
		
		return;
	},
	
	_getValueForPathParams: function(pathElem, gdLst)
	{
		var params = pathElem.params;
		for(var p in params)
		{
			if(Array.isArray(params[p]))
			{
				for(var i=0; i<params[p].length; i++)
					for(var pp in params[p][i])
					{
						var t = Number(params[p][i][pp]);
						if(!isNaN(t))
							params[p][i][pp] = t;
						else if(isNaN(gdLst[params[p][i][pp]]))
							return false;
						else 
							params[p][i][pp] = gdLst[params[p][i][pp]];
					}
			}
			else
			{
				var t = Number(params[p]);
				if(!isNaN(t))
					params[p] = t;
				else if(isNaN(gdLst[params[p]]))
					return false;
				else 
					params[p] = gdLst[params[p]];
			}
		}
		
		return true;
	},

	_addToKeyPathForArc: function(degreeVector, keyDegree)
	{
		// check
		if (degreeVector.length < 2)
		{
			degreeVector.push(keyDegree);
			return false;
		}

		// adjust key
		while (keyDegree > 360)
			keyDegree -= 360;
		while (keyDegree < 0)
			keyDegree += 360;

		// get range
		var aDegree = degreeVector[0];
		var bDegree = degreeVector[1];
		if (aDegree > bDegree)
		{
			var temp = aDegree;
			aDegree = bDegree;
			bDegree = temp;
		}

		// check
		if ((aDegree < keyDegree) && (keyDegree < bDegree))
		{
			degreeVector.push(keyDegree);
			return true;
		}

		keyDegree += 360;
		if ((aDegree < keyDegree) && (keyDegree < bDegree))
		{
			degreeVector.push(keyDegree);
			return true;
		}

		keyDegree -= 720;
		if ((aDegree < keyDegree) && (keyDegree < bDegree))
		{
			degreeVector.push(keyDegree);
			return true;
		}

		return false;
	},

	_getValueForArc: function(pathElem, prevPathElem, pathW, pathH, pathFrame, gdLst)
	{
		if (!pathElem)
			return false;

		pathElem.status = 0;
		
		this._getValueForPathParams(pathElem, gdLst);
		var params = pathElem.params;

		// Calculate SVG params based on OOXML 4 params
		var noWRFlag = false;
		if (!params.wR)
		{
			noWRFlag = true;
			params.wR = params.hR;
		}
		var noHRFlag = false;
		if (!params.hR)
		{
			noHRFlag = true;
			params.hR = params.wR;
		}

		var DEGREEARC = 60000 * 180;
		var stArc = (params.stAng * Math.PI) / DEGREEARC;
		var swArc = (params.swAng * Math.PI) / DEGREEARC;

		// special case, when the sw angle is 360, split into two 180
		var is360degree = false;
		if (params.swAng == (DEGREEARC * 2))
			is360degree = true;
		else if (params.swAng == (-DEGREEARC * 2))
			is360degree = true;
		if (is360degree)
			swArc = swArc / 2;

		var se_arc = stArc + swArc;
		var large_arc = (swArc <= Math.PI && swArc >= (-1 * Math.PI)) ? 0 : 1;
		var sweep_flag = (swArc > 0) ? 1 : 0;

		// work out actual paramete equation angle from current angle
		var sin = Math.sin, cos = Math.cos, atan2 = Math.atan2;
		var phi1 = atan2(params.wR * sin(stArc), params.hR * cos(stArc));
		if (phi1 < 0)
			phi1 += 2 * Math.PI;
		var phi2 = atan2(params.wR * sin(se_arc), params.hR * cos(se_arc));
		if (phi2 < 0)
			phi2 += 2 * Math.PI;
		if (phi2 < phi1)
			phi2 += 2 * Math.PI;

		params.dataPhi1 = phi1;
		params.dataPhi2 = phi2;

		// Calculate the coordinates in the coordination system with central as (0,0)
		var x1 = params.wR * cos(phi1);
		var y1 = params.hR * sin(phi1);
		var x2 = params.wR * cos(phi2);
		var y2 = params.hR * sin(phi2);

		// Calculate the diff value
		// This value is enough because "a" other "A" will be used
		var dx = x2 - x1;
		var dy = y2 - y1;

		if (noWRFlag)
		{
			dx = 0;
			params.wR = 0;
		}
		if (noHRFlag)
		{
			dy = 0;
			params.hR = 0;
		}

		// save result in SVG
		params.svgWR = params.wR;
		params.svgHR = params.hR;
		params.svgXRot = 0;
		params.svgLarge = large_arc;
		params.svgSweep = sweep_flag;
		params.svgDestX = dx;
		params.svgDestY = dy;
		params.svgFull = is360degree;

		// For arrow path
		if (prevPathElem)
		{
			var op = prevPathElem.op;
			var prevPoint = {};
			if (op == 'moveTo' || op == 'lnTo' || op == 'quadBezTo' || op == 'cubicBezTo')
			{
				var points = prevPathElem.params.pt;
				if (points)
				{
					var len = points.length;
					params.svgAbsStartX = points[len - 1].x;
					params.svgAbsStartY = points[len - 1].y;
				}
				else
				{
					return false;
				}
			}
			else if (op == 'arcTo')
			{
				var prevParams = prevPathElem.params;
				params.svgAbsStartX = prevParams.svgAbsDestX;
				params.svgAbsStartY = prevParams.svgAbsDestY;
			}
			else
			{
				params.svgAbsStartX = 0;
				params.svgAbsStartY = 0;
			}
			params.svgAbsDestX = params.svgDestX + params.svgAbsStartX;
			params.svgAbsDestY = params.svgDestY + params.svgAbsStartY;
		}

		// For some flow charts, fixed value will be defined for its points
		// And a path w and h will be defined in "path" node
		// It will be like custom shape and points will be scaled
		var hFactor = null, vFactor = null;
		if (pathW)
		{
			hFactor = (pathW / gdLst.w);
			params.svgWR /= hFactor;
			params.svgDestX /= hFactor;
			params.svgAbsDestX = params.svgAbsStartX + params.svgDestX;
		}
		if (pathH)
		{
			vFactor = (pathH / gdLst.h);
			params.svgHR /= vFactor;
			params.svgDestY /= vFactor;
			params.svgAbsDestY = params.svgAbsStartY + params.svgDestY;
		}

		// extend path frame
		if (noWRFlag || noHRFlag)
		{
			this._extendFrameByPoint(pathFrame, params.svgAbsDestX, params.svgAbsDestY);
		}
		else
		{
			var dx = 0;
			var dy = 0;
			var DEGREE = 60000;
			var stDegree = params.stAng / DEGREE;
			while (stDegree >= 360)
				stDegree -= 360;
			while (stDegree < 0)
				stDegree += 360;

			var seDegree = stDegree + (params.swAng / DEGREE);
			if (params.svgFull)
				seDegree = stDegree + 360;
			var bclockwise = (params.swAng >= 0) ? true : false;
			if (!bclockwise)
			{
				while (seDegree >= stDegree)
					seDegree -= 360;
			}

			var degreeVector = [];
			degreeVector.push(stDegree);
			degreeVector.push(seDegree);

			// for 0/90/180/270
			this._addToKeyPathForArc(degreeVector, 0);
			this._addToKeyPathForArc(degreeVector, 90);
			this._addToKeyPathForArc(degreeVector, 180);
			this._addToKeyPathForArc(degreeVector, 270);

			// for insert points
			{
				var sw = seDegree - stDegree;
				var n = Math.floor((Math.abs(sw) / 5));
				if (n == 0)
					n = 1;
				var delta = sw / n;
				for ( var i = 1; i < n; ++i)
				{
					this._addToKeyPathForArc(degreeVector, stDegree + delta * i);
				}
			}

			if (bclockwise)
				degreeVector.sort(function(a, b)
				{
					return a - b;
				});
			else
				degreeVector.sort(function(a, b)
				{
					return b - a;
				});

			var xPre = 0;
			var yPre = 0;
			var xCur = 0;
			var yCur = 0;
			var keyArc = 0;
			var keyPhi = 0;

			// debugger;
			for ( var i = 0, len = degreeVector.length; i < len; ++i)
			{
				keyArc = degreeVector[i] / 180.0 * Math.PI;
				keyPhi = Math.atan2(params.wR * Math.sin(keyArc), params.hR * Math.cos(keyArc));

				if (i == 0)
				{
					xPre = params.wR * Math.cos(keyPhi);
					yPre = params.hR * Math.sin(keyPhi);
					continue;
				}

				xCur = params.wR * Math.cos(keyPhi);
				yCur = params.hR * Math.sin(keyPhi);

				// set key point
				this._extendFrameByPoint(pathFrame, (xCur - xPre) / (hFactor ? hFactor : 1), (yCur - yPre) / (vFactor ? vFactor : 1), true);

				// go for next
				xPre = xCur;
				yPre = yCur;
			}
		}

		pathElem.status = 1;

		return true;
	},

	_extendFrameByPoint: function(pathFrame, x, y, relative)
	{
		// The first point
		if (pathFrame.status == undefined)
		{
			pathFrame.status = 0; // setting

			pathFrame.pointX = x;
			pathFrame.pointY = y;
			pathFrame.frameLeft = x;
			pathFrame.frameRight = x;
			pathFrame.frameTop = y;
			pathFrame.frameBottom = y;

			var svgPt = {
				x: pathFrame.pointX,
				y: pathFrame.pointY
			};
			pathFrame.keyPtList = [];
			pathFrame.keyPtList.push(svgPt);
			return;
		}

		// Following point
		if (!relative)
		{
			pathFrame.pointX = x;
			pathFrame.pointY = y;
		}
		else
		{
			pathFrame.pointX += x;
			pathFrame.pointY += y;
		}
		var svgPt = {
			x: pathFrame.pointX,
			y: pathFrame.pointY
		};
		pathFrame.keyPtList.push(svgPt);

		// extend frame
		if (pathFrame.pointX < pathFrame.frameLeft)
			pathFrame.frameLeft = pathFrame.pointX;
		if (pathFrame.pointX > pathFrame.frameRight)
			pathFrame.frameRight = pathFrame.pointX;
		if (pathFrame.pointY < pathFrame.frameTop)
			pathFrame.frameTop = pathFrame.pointY;
		if (pathFrame.pointY > pathFrame.frameBottom)
			pathFrame.frameBottom = pathFrame.pointY;
	},

	_getValueForMoveLine: function(pathElem, pathW, pathH, pathFrame, gdLst)
	{
		pathElem.status = 0;

		if (!this._getValueForPathParams(pathElem, gdLst))
			return false;

		// For some flow charts, fixed value will be defined for its points
		// And a path w and h will be defined in "path" node
		// It will be like custom shape and points will be scaled
		var hFactor = null, vFactor = null;
		if (pathW)
			hFactor = (pathW / gdLst.w);
		if (pathH)
			vFactor = (pathH / gdLst.h);
		var points = pathElem.params.pt;
		for ( var i = 0, len = points.length; i < len; i++)
		{
			if (hFactor)
				points[i].x /= hFactor;
			if (vFactor)
				points[i].y /= vFactor;

			this._extendFrameByPoint(pathFrame, points[i].x, points[i].y);
		}

		pathElem.status = 1;

		return true;
	},

	_addToKeyPathForBez: function(tVector, keyT)
	{
		// check
		if (keyT > 1)
			return false;
		if (keyT < 0)
			return false;

		// query
		for ( var i = 0, len = tVector.length; i < len; ++i)
		{
			if (tVector[i] == keyT)
				return true;
		}

		// insert
		tVector.push(keyT);
		return true;
	},

	_getValueForQuadBez: function(pathElem, pathW, pathH, pathFrame, gdLst)
	{
		pathElem.status = 0;

		if (!this._getValueForPathParams(pathElem, gdLst))
			return false;

		// For some flow charts, fixed value will be defined for its points
		// And a path w and h will be defined in "path" node
		// It will be like custom shape and points will be scaled
		var hFactor = null, vFactor = null;
		if (pathW)
			hFactor = (pathW / gdLst.w);
		if (pathH)
			vFactor = (pathH / gdLst.h);

		var points = pathElem.params.pt;
		if (hFactor || vFactor)
		{
			for ( var i = 0, len = points.length; i < len; i++)
			{
				if (hFactor)
					points[i].x /= hFactor;
				if (vFactor)
					points[i].x /= vFactor;
			}
		}

		// Extend path frame
		var x0 = 0;
		var y0 = 0;
		if (pathFrame.status == 0)
		{
			x0 = pathFrame.pointX;
			y0 = pathFrame.pointY;
		}

		var x1 = points[0].x;
		var y1 = points[0].y;
		var x2 = points[1].x;
		var y2 = points[1].y;
    //this is conduct from the formula  B(t)=(1 - t)^2 P0 + 2 t (1 - t) P1 + t^2 P2 
    //B(tx) = (x0 - 2 * x1 + x2) * t^2 + 2(x1-x0)t + x0
		var ax = x0 - 2 * x1 + x2;
		var bx = 2 * (x1 - x0);
		var cx = x0;
		var ay = y0 - 2 * y1 + y2;
		var by = 2 * (y1 - y0);
		var cy = y0;

		var tVect = [];
		this._addToKeyPathForBez(tVect, 0);
		this._addToKeyPathForBez(tVect, 1);

		// key point for max/min
    // based on B(tx) = (x0 - 2 * x1 + x2) * t^2 + 2(x1-x0)t + x0, it can treat as y=ax²+bx+c, it can be transform to compute x's value when y
    //has max or min valueas, when x = -b/2a, y has max or min value
		if (ay != 0)
		{
			var tm = -by / (2 * ay);
			this._addToKeyPathForBez(tVect, tm);
		}

		// key point for 90 degree
		if (ax != 0)
		{
			var tt = -bx / (2 * ax);
			this._addToKeyPathForBez(tVect, tt);
		}

		// sort
		tVect.sort(function(a, b)
		{
			return a - b;
		});

		// set key point
		for ( var i = 0, len = tVect.length; i < len; ++i)
		{
			var t = tVect[i];
			var tt = t * t;

			var x = ax * tt + bx * t + cx;
			var y = ay * tt + by * t + cy;
			this._extendFrameByPoint(pathFrame, x, y);
		}

		pathElem.status = 1;
		return true;
	},

	_getValueForCubicBez: function(pathElem, pathW, pathH, pathFrame, gdLst)
	{
		pathElem.status = 0;

		if (!this._getValueForPathParams(pathElem, gdLst))
			return false;

		// For some flow charts, fixed value will be defined for its points
		// And a path w and h will be defined in "path" node
		// It will be like custom shape and points will be scaled
		var hFactor = null, vFactor = null;
		if (pathW)
			hFactor = (pathW / gdLst.w);
		if (pathH)
			vFactor = (pathH / gdLst.h);
		var points = pathElem.params.pt;
		if (hFactor || vFactor)
		{
			for ( var i = 0, len = points.length; i < len; i++)
			{
				if (hFactor)
					points[i].x /= hFactor;
				if (vFactor)
					points[i].y/= vFactor;
			}
		}

		// extend path frame
		var x0 = 0;
		var y0 = 0;
		if (pathFrame.status == 0)
		{
			x0 = pathFrame.pointX;
			y0 = pathFrame.pointY;
		}

		var x1 = points[0].x;
		var y1 = points[0].y;
		var x2 = points[1].x;
		var y2 = points[1].y;
		var x3 = points[2].x;
		var y3 = points[2].y;
    //this is conduct from the formula  B(t)=(1 - t)^3 P0 +3p1t(1-t)^2+3p2t^2(1-t)+p3t^3 
    //B(tx) = (-x0 + 3 * x1 - 3 * x2 + x3) * t^3 + (3 * x0 - 6 * x1 + 3 * x2)t^2 + ( -3 * x0 + 3 * x1) *t + x0
		var ax = -x0 + 3 * x1 - 3 * x2 + x3;
		var bx = 3 * x0 - 6 * x1 + 3 * x2;
		var cx = -3 * x0 + 3 * x1;
		var dx = x0;
		var ay = -y0 + 3 * y1 - 3 * y2 + y3;
		var by = 3 * y0 - 6 * y1 + 3 * y2;
		var cy = -3 * y0 + 3 * y1;
		var dy = y0;

		var tVect = [];
		this._addToKeyPathForBez(tVect, 0);
		this._addToKeyPathForBez(tVect, 1);

		// key point for max/min
		if (ay == 0)
		{
			if (by != 0)
			{
				var tm1 = -cy / (2 * by);
				this._addToKeyPathForBez(tVect, tm1);
			}
		}
		else
		{
      //use derivative method to compute max/min value
      //for f(x) = ax^3+bx^2+cx+d, after derivative, it is f'(x) = 3ax^2 + 2bx + c, when f'(x) = 0, it is max/min value
      //delta = b^2-3ac
			var delta1 = by * by - 3 * ay * cy;
			if (delta1 >= 0)
			{
				var delta2 = Math.sqrt(delta1) / (3 * Math.abs(ay));
				var delta3 = -by / (3 * ay);
				var tm2 = delta3 + delta2;
				var tm3 = delta3 - delta2;
				this._addToKeyPathForBez(tVect, tm2);
				this._addToKeyPathForBez(tVect, tm3);
			}
		}

		// key point for 90 degree
		if (ax == 0)
		{
			if (bx != 0)
			{
				var tt1 = -cx / (2 * bx);
				this._addToKeyPathForBez(tVect, tt1);
			}
		}
		else
		{
			var delta1 = bx * bx - 3 * ax * cx;
			if (delta1 >= 0)
			{
				var delta2 = Math.sqrt(delta1) / (3 * Math.abs(ax));
				var delta3 = -bx / (3 * ax);
				var tt2 = delta3 + delta2;
				var tt3 = delta3 - delta2;
				this._addToKeyPathForBez(tVect, tt2);
				this._addToKeyPathForBez(tVect, tt3);
			}
		}

		// sort
		tVect.sort(function(a, b)
		{
			return a - b;
		});

		// set key point
		for ( var i = 0, len = tVect.length; i < len; ++i)
		{
			var t = tVect[i];
			var tt = t * t;
			var ttt = tt * t;

			var x = ax * ttt + bx * tt + cx * t + dx;
			var y = ay * ttt + by * tt + cy * t + dy;
			this._extendFrameByPoint(pathFrame, x, y);
		}

		pathElem.status = 1;
		return true;
	},

	_getPathStrForPoints: function(pathElem, pathW, pathH)
	{
		var points = pathElem.params.pt;
		var op = pathElem.op;
		var str = null;
		if (points)
		{
			var FACTOR = pres.constants.PT_TO_EMU_FACTOR;

			if (op == 'moveTo')
			{
				str = 'M ' + (points[0].x / FACTOR).toFixed(2) + ' ' + (points[0].y / FACTOR).toFixed(2) + ' ';
			}
			else if (op == 'lnTo')
			{
				str = 'L ' + (points[0].x / FACTOR).toFixed(2) + ' ' + (points[0].y / FACTOR).toFixed(2) + ' ';
			}
			else if (op == 'quadBezTo')
			{
				str = 'Q ' + (points[0].x / FACTOR).toFixed(2) + ' ' + (points[0].y / FACTOR).toFixed(2) + ' ' + (points[1].x / FACTOR).toFixed(2) + ' ' + (points[1].y / FACTOR).toFixed(2) + ' ';
			}
			else if (op == 'cubicBezTo')
			{
				str = 'C ' + (points[0].x / FACTOR).toFixed(2) + ' ' + (points[0].y / FACTOR).toFixed(2) + ' ' + (points[1].x / FACTOR).toFixed(2) + ' ' + (points[1].y / FACTOR).toFixed(2) + ' ' + (points[2].x / FACTOR).toFixed(2) + ' ' + (points[2].y / FACTOR).toFixed(2) + ' ';
			}

			return str;
		}
		return null;
	},

	_getPathStrForArc: function(pathElem, pathW, pathH)
	{
		var params = pathElem.params;
		var op = pathElem.op;
		var str = null;
		if (params)
		{
			var FACTOR = pres.constants.PT_TO_EMU_FACTOR;

			str = 'a ' + (params.svgWR / FACTOR).toFixed(2) + ' ' + (params.svgHR / FACTOR).toFixed(2) + ' ' + params.svgXRot.toFixed(2) + ' ' + params.svgLarge + ' ' + params.svgSweep + ' ' + (params.svgDestX / FACTOR).toFixed(2) + ' ' + (params.svgDestY / FACTOR).toFixed(2) + ' ';
			if (params.svgFull)
			{
				str += 'a ' + (params.svgWR / FACTOR).toFixed(2) + ' ' + (params.svgHR / FACTOR).toFixed(2) + ' ' + params.svgXRot.toFixed(2) + ' ' + params.svgLarge + ' ' + params.svgSweep + ' ' + (-params.svgDestX / FACTOR).toFixed(2) + ' ' + (-params.svgDestY / FACTOR).toFixed(2) + ' ';
			}

			return str;
		}
		return null;
	},

	calcPathFromGuide: function(frm, customAv, type)
	{
		// read prstShapes json object
		var prstShapeDefs = pres.def.prstShapes[type];
		if (!prstShapeDefs)
			return null;
		
		var gdLst = this.calcGdLstValuesFromShapeFrame(frm, customAv, type);
		var rect = prstShapeDefs['rect'] ? dojo.clone(prstShapeDefs['rect']) : null;
		if (rect)
		{
			var txtRect = {};		
			txtRect.l = gdLst[rect.l];
			txtRect.t = gdLst[rect.t];
			txtRect.r = gdLst[rect.r];
			txtRect.b = gdLst[rect.b];
		}

		// path list is always there, no need to judge
		var pathLst = dojo.clone(prstShapeDefs['pathLst']);

		// path calculation
		pathLst = pathLst.path;
		var pathStr = '', cpaths = [];
		var index = 0;
		// If only has one path, pathLst will an object other an array
		// So length will not be existed
		for ( var i = 0, len = pathLst.length ? pathLst.length : 1; i < len; i++)
		{
			var path = pathLst.length ? pathLst[i] : pathLst;
			var pathElems = path.cmd;
			path.status = 0; // setting
			path.frame = {}; // Will be set per every shape element
			var cpathStr = '';
			for ( var j = 0, count = pathElems.length; j < count; j++)
			{
				var pathElem = pathElems[j];
				var op = pathElem.op;
				var str = null;
				if (op == 'moveTo' || op == 'lnTo')
				{
					if (!this._getValueForMoveLine(pathElem, path.w, path.h, path.frame, gdLst))
						break;
					str = this._getPathStrForPoints(pathElem, path.w, path.h);
				}
				else if (op == 'quadBezTo')
				{
					if (!this._getValueForQuadBez(pathElem, path.w, path.h, path.frame, gdLst))
						break;
					str = this._getPathStrForPoints(pathElem, path.w, path.h);
				}
				else if (op == 'cubicBezTo')
				{
					if (!this._getValueForCubicBez(pathElem, path.w, path.h, path.frame, gdLst))
						break;
					str = this._getPathStrForPoints(pathElem, path.w, path.h);
				}
				else if (op == 'arcTo')
				{
					if (!this._getValueForArc(pathElem, pathElems[j - 1], path.w, path.h, path.frame, gdLst))
						break;
					str = this._getPathStrForArc(pathElem, path.w, path.h);
				}
				else if (op == 'close')
				{
					str = 'Z ';
				}

				if (str)
				{
					if (!(path.fill == 'none' || path.fill == 'false'))
						cpathStr += str;
					if (!(path.stroke == 'none' || path.stroke == 'false'))
						pathStr += str;
				}
			}
			if (cpathStr.length > 0)
				cpaths[index++] = dojo.trim(cpathStr);

			if (path.frame.status == 0)
				path.frame.status = 1;
			path.status = 1;
		}

		var pathObj = {};

		if (txtRect)
			pathObj.txtRect = txtRect;

		pathStr = dojo.trim(pathStr);
		if (pathStr.length > 0)
			pathObj.path = pathStr;

		if (cpaths.length > 0)
		{
			pathObj.cpath = cpaths;
		}

		// Will be used when calculate arrow path
		pathObj.pathLst = pathLst;

		return pathObj;
	},
  /**
   * Get path list based on shape type and shape size information. 
   * @param {Object} frm - shape size and position, it's format is {l, t, w, h}
   * @param {String} shapeType - shape type, it's value is got from ooxml, value is like 'straightConnector1'
   * @return {Object} path list which have value
   */
  getPathList: function(frm, customAv, shapeType) {
    var prstShapeDef = this._getPrstShapeDef(shapeType);
    // path list is always there, no need to judge
    var pathLst = dojo.clone(prstShapeDef['pathLst']);
    pathLst = pathLst.path;
    var gdLst = this.calcGdLstValuesFromShapeFrame(frm, customAv, shapeType);
    //calculate value for path list
    this._calcValueForPathList(pathLst, gdLst);
    return pathLst;
  },
  
  /**
   * Create line shape model.
   * @param {Slide} slide - model of slide which create shape on it
   * @param {Object} params - data of create shape, it's format exmaple  
   * {type: 'arrow', pos: {l: 20, t: 30, w: 300, h: 20},it's unit is px, sePos:  {startX:0, startY:0, endX:0, endY:0}}
   * @return {ShapeElement} the created shape element
   */
  createConnectorShapeModel: function(slide, params) {
    if (!params || !params.type || !params.sePos || !params.pos){
      return null;
    }
    //unit is px
    var lineWidth = 1;
   //create a shape element model
    var shapeElem = this._createLineShapeElementModel(slide, params.pos, params.sePos, lineWidth);
    if (shapeElem) {
      var svg = shapeElem.svg;
      var type = params.type;
      var shapeType = pres.constants.SHAPE_TYPES[type];
      
      var pathLst = this.getPathList(svg.frm, null, shapeType);
      var constants = pres.constants;
      var body = svg.setViewBox(pathLst);
      var viewbox = body.shapeBody;
      if (type != 'line') {
        //arrow line or double arrow line
        //create arrow data
        var headArrowType = null;
        var tailArrowType = constants.ARROW_TYPES.arrow;
        var headOrTail = constants.ARROW_LINE_TYPES.tail;
        if (type == 'doublearrow') {
           headArrowType = constants.ARROW_TYPES.arrow;
           headOrTail = constants.ARROW_LINE_TYPES.headTail;
        }
        var ptToEMU = constants.PT_TO_EMU_FACTOR;
        var lineWidthInEMU = lineWidth * ptToEMU;
        this._setArrowDataForLine(pathLst, svg, headOrTail, lineWidthInEMU, viewbox, headArrowType, tailArrowType);
      } 
      
      var pathObj =  this.generateSvgPathForShape(pathLst);
      if (pathObj && pathObj.path) {
        svg.path = pathObj.path;
      }
      if (pathObj && pathObj.cpath) {
        svg.cpath = pathObj.cpath;
        // set an empty cp. Id will be set later
        svg.prop = {
          cp: {}
        };
      }
      // updated svg gap
      // Till now, view box position is related to svg frame
      // so make it to be related to slide editor
      this._setShapeSvgViewBoxPositionToSlide(viewbox, svg.frm);
      
      //when stroke-width value is bigger than 1, line width take some space
      //the display frame will be bigger than the drag frame on the screen, so it has a gap
      //update svg.gap
      this._updateGapBetweenViewBoxAndFrm(svg, viewbox);
      // update shape element position based on svg.gap
      this._updateShapeElementSize(shapeElem, svg.gap);
      //update shape element attributes, include position information
      this._setShapeElementAttrs(shapeElem, shapeType);
      //set shape display title
      this._setShapeDispalyTitle(svg, params.type);
      // Finally set Ids for shape
      pres.utils.helper.setIDToShape(shapeElem, true);
    }
    return shapeElem;
  },
  /**
   * set arrow data for a arrow line shape
   * @param {Object} pathLst - arrow line shape path objects
   * this value will be changed if the line width is not 1px
   * @param {ShapeSvg} svg - arrow line shape svg need set arrow data
   * this value will be changed with set arrow data
   * @param {String} headOrTail - arrow line shape has head or tail, or has both head and tail,
   * it's value can be a value of pres.constant.ARROW_LINE_TYPES 
   * @param {Object} viewbox - shape svg viewbox position object
   * @param {Number} lineWidthInEMU - line width value in EMU unit
   * @param {String} tailArrowType - tail arrow type if the arrow line shape has tail
   * @param {String} headArrowType - head arrow type if the arrow line shape has head
   */
  _setArrowDataForLine: function(pathLst, svg, headOrTail, lineWidthInEMU, viewbox, headArrowType, tailArrowType) {
    //arrow line or double arrow line
    var arrows = svg.arrows = [];
    var constants = pres.constants;
    var isNeedUpdatePath = false;
    var headArrowLength = 0;
    var tailArrowLength = 0;
    if (lineWidthInEMU > constants.PT_TO_EMU_FACTOR) {
      isNeedUpdatePath = true;
      if (headOrTail && (headOrTail == constants.ARROW_LINE_TYPES.headTail || headOrTail == constants.ARROW_LINE_TYPES.tail)) {
        tailArrowLength = this._getArrowEndToLineEndDistance(lineWidthInEMU, tailArrowType);
      }
      if (headOrTail && (headOrTail == constants.ARROW_LINE_TYPES.headTail || headOrTail == constants.ARROW_LINE_TYPES.head)) {
        headArrowLength = this._getArrowEndToLineEndDistance(lineWidthInEMU, headArrowType);
      }
      tailArrowLength = this._getArrowEndToLineEndDistance(lineWidthInEMU, tailArrowType);
      if (headArrowType) {
        headArrowLength = this._getArrowEndToLineEndDistance(lineWidthInEMU, headArrowType);
      }
    }
    var headTailBasePoint = this.calcHeadTailAndUpdatePathLst(pathLst, headOrTail, isNeedUpdatePath, headArrowLength, tailArrowLength);
    
    //arrow svg
    if (tailArrowType && tailArrowType != constants.ARROW_TYPES.none) {
      var arrowTail = new pres.model.ShapeArrow();
      arrows.push(arrowTail);
      arrowTail.parent = svg;
      //arrow svg path
      this._setShapeArrowData(arrowTail, constants.ARROW_LINE_TYPES.tail, tailArrowType, headTailBasePoint, viewbox, lineWidthInEMU);
    }
    if (headArrowType && headArrowType !=  constants.ARROW_TYPES.none) {
      var arrowHead = new pres.model.ShapeArrow();
      arrows.push(arrowHead);
      arrowHead.parent = svg;
      this._setShapeArrowData(arrowHead, constants.ARROW_LINE_TYPES.head, headArrowType, headTailBasePoint, viewbox, lineWidthInEMU);
    }
  },
  /**
   * Set data to ShapeArrow, it including arrow type, arrow attributes and svg path of the arrow 
   * @param {ShapeArrow} arrow - ShapeArrow model need to set data
   * @param {String} type - arrow type, it can be 'tail' or 'head'
   * @param {String} arrowKind - arrow kind, it can be triangle, arrow, stealth, diamond, oval,
   * @param {Number} lineWidth - line width, it's unit is EMU (value of stroke-width)
   */
  _setShapeArrowData: function(arrow, type, arrowKind, headTailBasePoint, viewbox, lineWidthInEMU)
  {
    if (!arrow || !type || !headTailBasePoint) {
      return;
    }
    var strokeWidth = lineWidthInEMU / pres.constants.PT_TO_EMU_FACTOR;
    var fillValue = "none";
    if (arrowKind == pres.constants.ARROW_TYPES.arrow) {
      fillValue = "none";
    } else {
      fillValue = '#3a5f8b';
      strokeWidth = 1;
    }
    
    arrow.type = type;
    arrow.attrs = {
      stroke: '#3a5f8b',
      fill: fillValue,
      'stroke-width': strokeWidth,
      'stroke-dasharray': 'none',
      'stroke-linecap': 'round',
       kind: arrowKind
    };
    //px to emu, 1px = 0.75pt
    var path = pres.utils.shapeUtil.calcArrowPathFromGuide(headTailBasePoint, false, lineWidthInEMU, type, arrowKind, viewbox);
    if (path)
      arrow.path = path;
  },
  /**
   * Set shape display title
   * @param {ShapeSvg} svg - shape svg need set title
   * @param {String} type - shape predefined type, it's in pres.constants.SHAPE_TYPES, it can be 'line', 'arrow' etc
   */
  _setShapeDispalyTitle: function(svg, type) {
    // Title
    var shapeStrs = dojo.i18n.getLocalization("concord.widgets", "shapeGallery");
    var dispType = shapeStrs[type];
    if (dispType) {
      svg.title = dispType;
    }
  }, 
  /**
   * Origially viewbox position is related to svg frame, set it's position
   * related to slide editor
   * @param {Object} viewbox - shape svg viewbox position object
   * @param {Object} frm - frame position related to slide editor
   */
  _setShapeSvgViewBoxPositionToSlide: function(viewbox, frm) {
    // view box position is related to svg frame
    // so make it to be related to slide editor
    viewbox.frameLeft += frm.l;
    viewbox.frameTop += frm.t;
    viewbox.frameRight += frm.l;
    viewbox.frameBottom += frm.t;
  },
  /**
   * Update gap between viewbox to display the full svg and the dragged frame size on screen
   * @param {ShapeSvg} svg - shape svg need update gap
   * @param {Object} viewbox - shape svg viewbox position object
   */
  _updateGapBetweenViewBoxAndFrm: function(svg, viewbox) {
    //when stroke-width value is bigger than 1, line width take some space
    //the display frame will be bigger than the drag frame on the screen, so it has a gap
    //svg.frm is the dragged size on screen
    svg.gap = {
      l: svg.frm.l - viewbox.frameLeft,
      t: svg.frm.t - viewbox.frameTop,
      r: viewbox.frameRight - (svg.frm.l + svg.frm.w),
      b: viewbox.frameBottom - (svg.frm.t + svg.frm.h)
    };
  },
  /**
   * Update shape element size based on gap between viewbox and dragged frame 
   * @param {ShapeElement} shapeElem - shape element need to update size
   * @param {Object} gap - gap size beteen viewbox and shape element
   */
  _updateShapeElementSize: function(shapeElem, gap) {
    var cmToEMU = pres.constants.CM_TO_EMU_FACTOR;
    // Shape element position
    shapeElem.l -=  (gap.l / cmToEMU);
    shapeElem.t -= (gap.t / cmToEMU);
    shapeElem.w += ((gap.r + gap.l) / cmToEMU);
    shapeElem.h += ((gap.t + gap.b) / cmToEMU);
    shapeElem.z = 0;
  },
  /**
   * Set shape element attributes
   * @param {ShapeElement} shapeElem - shape element need to set attributes
   * @param {String} shapeType - shape type defined ooxml, it's value like 'straightConnector1'
   */
  _setShapeElementAttrs: function(shapeElem, shapeType) {
    //position style should set after position information is got
    shapeElem.attrs = {
      draw_type: shapeType,
      style: shapeElem.getPositionStyle(),
      'class': 'draw_frame draw_custom-shape boxContainer shape_svg newbox bc',
      presentation_class: 'group',
      draw_layer: 'layout',
      ungroupable: 'no',
      contentboxtype: 'drawing',
      'text_anchor-type': 'paragraph'
    };
  },
  
  /**
   * Create line shape model use given data, it creates a ShapeElement, a ShapeSvg and a ShapeLine
   * @param {Slide} slide - model of slide which create shape on it
   * @param {Object} pos - it is shape create size and position object, format is {l:0 t:0, w:0, h: 0}
   * @param {Object} sePos - it is shape screen position, format is {startX:0, startY:0, endX:0, endY:0}
   */
  _createLineShapeElementModel: function(slide, pos, sePos, lineWidth) {
    
    if (!slide || !pos) {
      return null;
    }
    var helper = pres.utils.helper;
    var c = pres.constants;
    //Shape element
    var shapeElem = new pres.model.ShapeElement();
    // position will be set after svg position
    shapeElem.parent = slide;
    shapeElem.isNotes = false;
    shapeElem.family = 'group';

    // Calculate path and set into model
    // SVG shape
    var svg = shapeElem.svg = new pres.model.ShapeSvg();
    svg.parent = shapeElem;
    svg.shapeVersion = "1.6";
    // gap
    svg.gap = {
      l: c.SHAPE_DEFAULT_GAP,
      t: c.SHAPE_DEFAULT_GAP,
      r: c.SHAPE_DEFAULT_GAP,
      b: c.SHAPE_DEFAULT_GAP
    };
    // frame
    var cmToEMU = c.CM_TO_EMU_FACTOR;
    var cmL = helper.px2cm(pos.l);
    var cmT = helper.px2cm(pos.t);
    if (pos.w == 0 && pos.h == 0) {
      cmW = c.DEFAULT_SHAPE_WIDTH;
      cmH = c.DEFAULT_SHAPE_HEIGHT;
    } else {
      cmW = helper.px2cm(pos.w);
      cmH = helper.px2cm(pos.h);
    }
    
    shapeElem.l = cmL;
    shapeElem.t = cmT;
    shapeElem.w = cmW;
    shapeElem.h = cmH;
    
    svg.frm = {
      l: cmL * cmToEMU,
      t: cmT * cmToEMU,
      w: cmW * cmToEMU,
      h: cmH * cmToEMU
    };
    // Add connector direction for flip when get html
    svg.dir = this._getConnectorDir(sePos);
    // fill-line-arrow
    var line = svg.line = new pres.model.ShapeLine();
    line.parent = svg;
    //stroke-width, if line width is not provide, set it to 1
    var strokeWidth = lineWidth ? lineWidth : 1;
    line.attrs = {
      stroke: '#3a5f8b',
      fill: 'none',
      'data-stroke-chg': '1',
      'stroke-width': strokeWidth ,
      'stroke-dasharray': 'none',
      'stroke-linecap': 'butt',
      'stroke-linejoin': 'miter'
    };
   
    return shapeElem;
  },
  /**
   * caculate path string for a svg shape
   * @param {Object} pathLst - path list got from guide
   * @return {Object} return path object contain path string and a array cotain every path string, it's format is {path: 'pathString', cpath: ['path1String', 'path2String' ...]}
   */
  generateSvgPathForShape: function(pathLst) {
    //path object information 
    var pathObj = {};
    var pathStr = '';
    var cpaths = [];
    var pathLstArray = pathLst;
    if (!pathLstArray.length) {
      pathLstArray = [pathLst];
    }
    var pathLstLen = pathLstArray.length;
    //generate path string for path list
    for (var i = 0; i < pathLstLen; i++) {
      var path = pathLstArray[i];
      var str = '';
      if (!(path.stroke == 'none' || path.stroke == 'false') 
          || !(path.fill == 'none' || path.fill == 'false')) {
        str = this._generatePathString(path);
        if (!(path.fill == 'none' || path.fill == 'false')) {
          cpaths.push(dojo.trim(str));
        }
        if (!(path.stroke == 'none' || path.stroke == 'false')) {
          //only when stroke has set need show this path
          pathStr += str;
        }
      }
    }
    pathStr = dojo.trim(pathStr);
    if (pathStr.length > 0) {
      pathObj.path = pathStr;
    }
    if (cpaths.length > 0) {
      pathObj.cpath = cpaths;
    }
    return pathObj;
  },
  /**
   * Need adjust arrow line start or end for following  arrow type : 'triangle', 'stealth' and 'arrow'
   * @param {String} arrowType - it's a value of arrow type, one of value: pres.constants.ARROW_TYPES
   * @return if arrow type is one of 'triangle', 'stealth' and 'arrow' return true, otherwise return false
   */
  _isNeedAdjustArrowLineStartEnd: function(arrowType) {
    var constants = pres.constants;
    if (arrowType && (
        arrowType == constants.ARROW_TYPES.triangle || 
        arrowType == constants.ARROW_TYPES.stealth || 
        arrowType == constants.ARROW_TYPES.arrow)) {
      return true;
    } else {
      return false;
    }
  },
  
   /**
    * Get preset shape define by shape type.
    * @param {String} type - shape type, it's value defined in pres.constants.SHAPE_TYPES,
    * for example the value of pres.constants.SHAPE_TYPES['arrow'], pres.constants.SHAPE_TYPES['line'] etc
    */
  _getPrstShapeDef: function(shapeType) {
    var prstShapeDef = pres.def.prstShapes[shapeType];
    if (prstShapeDef){
      return prstShapeDef;
    } else {
      return null;
    }
  },
  /**
   * set text rectange frame.
   * @param {Object} textRect - text rectange frame need to set l, t, r, b,
   * this value will be changed after this called this method
   * @param {Object} rect - rectange frame data get from predefined guide list
   * @param {Object} gdLst - guide list 
   */
  _setTextRect: function(prstShapeDef, gdLst) {
    var rect = prstShapeDef['rect'] ? dojo.clone(prstShapeDef['rect']) : null;
    var txtRect = null;
    if (rect) {
      txtRect = {};
      //left
      txtRect.l = gdLst[rect.l];
      //top
      txtRect.t = gdLst[rect.t];
      //right
      txtRect.r = gdLst[rect.r];
      //bottom
      txtRect.b = gdLst[rect.b];
    }
    return txtRect;
  
  },
  /**
   * Get value for path elements from guide list.
   * @param {Object} path - path elments
   * @param {Object} gdLst - guide list of the path
   */
  _calcValueForPathList: function(pathLst, gdLst) {
    // If only has one path, pathLst will an object other an array
    // So length will not be existed
    var len = pathLst.length ? pathLst.length : 1;
    for ( var i = 0; i < len; i++) {
      var path = pathLst.length ? pathLst[i] : pathLst;
      if (path) {
        //will be set per every shape element
        path.frame = {}; 
        path.status = 0;
        //caculate path value
        var pathElems = path.cmd;
        var count = pathElems.length;
        for ( var j = 0; j < count; j++) {
          var pathElem = pathElems[j];
          var op = pathElem.op;
          if (op == 'moveTo' || op == 'lnTo') {
            this._getValueForMoveLine(pathElem, path.w, path.h, path.frame, gdLst);
          } else if (op == 'quadBezTo') {
            this._getValueForQuadBez(pathElem, path.w, path.h, path.frame, gdLst);
          } else if (op == 'cubicBezTo') {
            this._getValueForCubicBez(pathElem, path.w, path.h, path.frame, gdLst);
          } else if (op == 'arcTo') {
            this._getValueForArc(pathElem, pathElems[j - 1], path.w, path.h, path.frame, gdLst);
          } else if (op == 'close') {
            pathElem.status = 1;
          }
        }
        if (path.frame.status == 0) {//path.frame.status is initiate in method _extendFrameByPoint
          path.frame.status = 1;
        }
        path.status = 1;
      }
    }
  },
  /**
   * Generate path string.
   * @param {Object} path - path object need to generate path string, 
   * @return {String} generated path string
   */
  _generatePathString: function(path) {
    var pathStr = '';
    if (!path) {
      return pathStr;
    }
    //path elements which have been computed point data
    var pathElems = path.cmd;
    var pathCount = pathElems.length;
    for (var elementIndex = 0; elementIndex < pathCount; elementIndex++) {
      var pathElem = pathElems[elementIndex];
      var op = pathElem.op;
      var str = null;
      if (!pathElem.status) {
        //path element does not have calculated value
        break;
      }
      if (op == 'arcTo') {
        str = this._getPathStrForArc(pathElem, path.w, path.h);
      } else if (op == 'close') {
        str = 'Z ';
      } else {
        str = this._getPathStrForPoints(pathElem, path.w, path.h);
      }
      if (str) {
        pathStr += str;
      }
    }
    return pathStr;
  },
  /**
   * Get a point coordinate on a given line reduce a distance from start point  
   * @param {Object} start - start point of line (x, y)
   * @param {Object} end - end point of line (x, y)
   * @param {Number} distance - distance value from start
   * @return {Object} point on line reduce give distance from start point 
   */
  _getPointOnLineReduceDistance: function(start, end, distance) {
    if (!start || !end) {
      return null;
    }
    var dx = end.x - start.x;
    var dy = end.y - start.y;
    var dr = Math.sqrt(dx * dx + dy * dy);
    if (dr == 0) {
      return start;
    }
    var cosA = dx / dr;
    var sinA = dy / dr;
    var newStart = {};
    newStart.x = start.x + distance * cosA;
    newStart.y = start.y + distance * sinA;
    return newStart;
  },
  /**
   * Get point coordinate on a given line with a given distance from distance point which 
   * is close to start or end
   * @param {Object} start - start point of line (x, y)
   * @param {Object} end - end point of line (x, y)
   * @param {Number} distance - distance value from distance point
   * @param {Boolean} isStart - true, close point is start point, false close point is end point
   * @return {Point} return a point on line with distance from distancePoint point 
   */
  _getAdjustPointOnLineForStartOrEnd: function(lineObject, distancePoint, distance, isStart) {
    var point = null;
    var candidatePoints = this._getPointOnLineWithPointDistance(lineObject, distancePoint, distance);
    if (candidatePoints) {
      point = this._getPointClosetToStartOrEnd(candidatePoints, lineObject, isStart);
    }
    if (!point) {
      if (isStart) {
        point = {x: lineObject.start.x, y:  lineObject.start.y};
      } else {
        point = {x: lineObject.end.x, y:  lineObject.end.y};
      }
    }
    return point;
    
  }, 
  /**
   * Get points coordinate on a given line with a given distance from start point  
   * @param {Object} start - start point of line (x, y)
   * @param {Object} end - end point of line (x, y)
   * @param {Number} distance - distance value from distance point
   * @return {Array<Point>} return a points array on line with distance from distancePoint point 
   */
  _getPointOnLineWithPointDistance: function(lineObject, distancePoint, distance) {
    var lineStart = lineObject.start;
    var lineEnd = lineObject.end;
    var x1 = lineStart.x;
    var y1 = lineStart.y;
    var x2 = lineEnd.x;
    var y2 = lineEnd.y;
    var x0 = distancePoint.x;
    var y0 = distancePoint.y;
    var points = null;
    var delta;
    //use a circle formula and line formula, get the root value, 
    //thus can get the intersection points
    if (x1.toFixed(2) != x2.toFixed(2)) {
      var k = (y2 - y1) / (x2 - x1);
      var a = 1 + k * k;
      var t = (y1 - k * x1 - y0);
      var b = -2 * x0 + 2 * k * t;
      var c = x0 * x0 + t * t - distance * distance;
      //ax^2 + bx + c = 0;
      delta = b * b - 4 * a * c;
      
      if (delta >=0) {
        points = [];
        var step = Math.sqrt(delta) / (2 * a);
        var baseX = - b / (2 * a);
        var xCandidate1 = baseX + step;
        var xCandidate2 = baseX - step;
        var yCandidate1 = k * (xCandidate1 - x1) + y1;
        var yCandidate2 = k * (xCandidate2 - x1) + y1;
        points.push({x: xCandidate1, y: yCandidate1});
        points.push({x: xCandidate2, y: yCandidate2});
      }
    } else {
      delta = distance * distance - (x1 - x0) * (x1 - x0);
      if (delta >= 0) {
        points = [];
        var base = Math.sqrt(delta);
        var yCandidate1 = y0 + base;
        var yCandidate2 = y0 - base;
        points.push({x: x1, y: yCandidate1});
        points.push({x: x1, y: yCandidate2});
      }
    }
    return points;
  },
  /**
   * Check whether a given point belong to line 
   * @param {Point} point - a given point
   * @param {Object} lineObject - line segment object, it's format is {start: start, end: end}
   * @return {Boolean} true if point belong to the given line segment, false if point not belog to
   * the given line segment
   */
  _isBelongToLineSegment: function(point, lineObject) {
    var start = lineObject.start;
    var end = lineObject.end;
    var x1 = start.x;
    var x2 = end.x;
    var y1 = start.y;
    var y2 = end.y;
    var xCandidate1 = point.x;
    var yCandidate1 = point.y;
    if (this._isBelongToRange(xCandidate1, x1, x2) 
        && this._isBelongToRange(yCandidate1, y1, y2)) {
      return true;
    } else {
      return false;
    }
  },
  /**
   * Check is given number belong to a given range[x1, x2]
   * @param {Number} x - given number to check is belong to given range
   * @param {Number} x1 - given range value
   * @param {Number} x2 - given range value
   * @return {Boolean} true if given number belong to the given range, else return false
   */
  _isBelongToRange: function(x, x1, x2){
    var isBelong = false;
    x1 = parseFloat(x1.toFixed(2));
    x2 = parseFloat(x2.toFixed(2));
    var smaller = Math.min(x1, x2);
    var bigger = Math.max(x1, x2);
    x = parseFloat(x.toFixed(2));
    if (x >= smaller && x <= bigger) {
      isBelong = true;
    }
    return isBelong;
  },
  /**
   * Get a point close to line segment start or end from given 2 candidates points.
   * @param {Array<Point>} points - candidate points on line
   * @param {Object} lineObject - line segment object, it's format is {start: start, end: end}
   * @param {Boolean} isStart - flag of get close to start or end point, 
   * true  close point is line segment start point
   * false close point is line segment end point
   * @return {Point} the point close to start or end point
   */
  _getPointClosetToStartOrEnd: function(points, lineObject, isStart) {
    var point = null;
    //whether point0 is belong to line segment
    var isPoint0BelongToLine = this._isBelongToLineSegment(points[0], lineObject);
    var isPoint1BelongToLine = this._isBelongToLineSegment(points[1], lineObject);
    var closePoint;
    if (isStart) {
      closePoint = lineObject.start;
    } else {
      closePoint = lineObject.end;
    }
    if (isPoint0BelongToLine && !isPoint1BelongToLine){
      point = points[0];
    } else if (!isPoint0BelongToLine && isPoint1BelongToLine) {
      point = points[1];
    } else {
      //both two points is belong to line or neigther is on the line
      //if is start, get the point which close to start, else get the start close to end
      if (lineObject.start.x.toFixed(2) == lineObject.end.x.toFixed(2)) {
        //line segment has same x, need compare with y
        var deltaY1 = Math.abs(points[0].y - closePoint.y);
        var deltaY2 = Math.abs(points[1].y - closePoint.y);
        if (deltaY1 < deltaY2) {
          point = points[0];
        } else {
          point = points[1];
        }
      } else {
        //segment has diffent x, compare delta x
        var deltaX1 = Math.abs(points[0].x - closePoint.x);
        var deltaX2 = Math.abs(points[1].x - closePoint.x);
        if (deltaX1 < deltaX2) {
          point = points[0];
        } else {
          point = points[1];
        }
      }
    
    }
    return point;
  },
  
  
  /**
   * Get the distance from arrow angle end to line end distance. It's only for arrow kind 
   * 'arrow', 'triange' and 'stealth'
   * @param {Number} lineWidthInEMU - width of line, the unit is EMU
   * @param {String} arrowKind - arrow kind value, it can be, 'arrow', 'triange' and 'stealth'
   * @return {Number} distance value from arrow angle to line end, unit is EMU
   */
  _getArrowEndToLineEndDistance: function(lineWidthInEMU, arrowKind) {
    var distance = 0;
    var constants = pres.constants;
    if (arrowKind == constants.ARROW_TYPES.arrow) {
      //for arrow
      //the angle is 60 degree, line end to angle point distance is  (sqrt(3)/2)*lineWidth + 2*lineWidth, it's is 1*lineWidth
      //when line set cap to round and sequare, it will extend the line length, so it need to adjust the arrow length to make
      //sure arrow not overlap by line, so adjust the arrow length from lineWidth to 1.5 * lineWidth 
      distance = 1.5 * lineWidthInEMU;
    } else if (arrowKind == constants.ARROW_TYPES.triangle) {
      //for triangle, the arrow angle is 26.6 * 2 degree
      var degree = 26.6;
      var arc = degree * Math.PI / 180;
      var triangeLineWidth = 3.5 * lineWidthInEMU;
      distance = triangeLineWidth * Math.cos(arc);
    } else if (arrowKind == constants.ARROW_TYPES.stealth) {
      //for steal, the arrow angle is 26.6 * 2 degree
      var degree = 26.6;
      var triangeLineWidth = 3.5 * lineWidthInEMU;
      var height = this._getTriangleHeightLength(triangeLineWidth, degree);
      distance = height * 0.69;
    } else if (arrowKind == constants.ARROW_TYPES.diamond) {
      distance = lineWidthInEMU;
    }
    return distance;
  },
  /**
   * Get a height value for a triangle shape which has same length of two line and know half angle of 
   * these two lines
   * @param {Number} - length value of the triangle line
   * @param {Number} - half angle value of the triangle angle
   * @return{Number} height value of the triangle 
   */
  _getTriangleHeightLength: function(triangeLine, halfAngleDegree) {
    var arc = halfAngleDegree * Math.PI / 180;
    return triangeLine * Math.cos(arc);
  },
  
  
	getUnionBody: function(shapeBody, newBody)
	{
		if (!shapeBody || !newBody)
			return;
		// l, t, r, b
		// Keep min l and t, max t and b
		if (newBody.frameLeft < shapeBody.frameLeft)
			shapeBody.frameLeft = newBody.frameLeft;
		if (newBody.frameTop < shapeBody.frameTop)
			shapeBody.frameTop = newBody.frameTop;

		if (newBody.frameRight > shapeBody.frameRight)
			shapeBody.frameRight = newBody.frameRight;
		if (newBody.frameBottom > shapeBody.frameBottom)
			shapeBody.frameBottom = newBody.frameBottom;
	},

	_getTriadArrayForLineCorner: function(pt, element1, element2, element3)
	{
		// check
		if (pt == null || element1 == null || element2 == null || element3 == null)
			return false;

		// get the first point
		switch (element1.op)
		{
			case 'moveTo':
			case 'lnTo':
				pt[0].x = element1.params.pt[0].x;
				pt[0].y = element1.params.pt[0].y;
				break;
			case 'arcTo':
				pt[0].x = element1.params.svgAbsDestX;
				pt[0].y = element1.params.svgAbsDestY;
				break;
			case 'quadBezTo':
				pt[0].x = element1.params.pt[1].x;
				pt[0].y = element1.params.pt[1].y;
				break;
			case 'cubicBezTo':
				pt[0].x = element1.params.pt[2].x;
				pt[0].y = element1.params.pt[2].y;
				break;
			case 'close':
			default:
				return false;
		}

		// get the second point
		if (!((element2.op) == 'lnTo' || (element2.op) == 'moveTo'))
			return false;
		pt[1].x = element2.params.pt[0].x;
		pt[1].y = element2.params.pt[0].y;

		// get the third point
		switch (element3.op)
		{
			case 'moveTo':
			case 'lnTo':
				pt[2].x = element3.params.pt[0].x;
				pt[2].y = element3.params.pt[0].y;
				break;
			case 'close':
			case 'arcTo':
			case 'quadBezTo':
			case 'cubicBezTo':
			default:
				return false;
		}
		return true;
	},

	_getIntersectionPoint: function(p1, k1, f1, p2, k2, f2, pt)
	{
		// no intersection for parallels
		if (!f1 && !f2)
			return false;

		if (f1 && f2 && (k1 == k2))
			return false;

		// no slope for line1
		if (!f1)
		{
			pt.x = p1.x;
			pt.y = k2 * (p1.x - p2.x) + p2.y;
			return true;
		}

		// no slope for line2
		if (!f2)
		{
			pt.x = p2.x;
			pt.y = k1 * (p2.x - p1.x) + p1.y;
			return true;
		}

		// calc
		var d1 = k1 * p1.x - p1.y;
		var d2 = k2 * p2.x - p2.y;
		var d3 = k1 - k2;
		pt.x = (d1 - d2) / d3;
		pt.y = (k2 * d1 - k1 * d2) / d3;
		return true;
	},

	/**
	 * Get intersection point with given 3 points and line width. For example give 3 points, p1, p2, p3,
	 * it represent line p1p2, and line p2p3, p2 is the intersection point of line p1p2 and p2p3, to get intersection with line width
	 * means, get outer paralle line with distance lineWidth/2 with p1p2, and outer paralle line with distance with lineWidth/2 with p2p3,
	 * these two outer paralle line intersection point is the point this method get.
	 * @param {Object} p1 - start point of line p1p2
	 * @param {Object} p2 - end point of line p1p2, start point of p2p3
	 * @param {Object} p3 - end point of line p2p3
	 * @param {Number} lineWidth - value of line width
	 * @return {Object} intersection point 
	 */
	_getIntersectionsWithLineWidth: function(p1, p2, p3, lineWidth)
    {
       //check is 3 different points 
	     if (this._isSampePoint(p1, p2) || this._isSampePoint(p2, p3) 
            || this._isSampePoint(p1, p3)) {
          return null;
        }
	      // to calc out intersections for p1p2 p2p3 with line width
        // calc slope
        var bSlope1 = false;
        var k1 = 0;
        var deltaX1 = p1.x - p2.x;
        if (Math.abs(deltaX1) > 0.5) {
            k1 = (p1.y - p2.y) / deltaX1;
            bSlope1 = true;
        }
        var bSlope2 = false;
        var k2 = 1.0 - k1; // init with difference to k1
        var deltaX2 = p2.x - p3.x;
        if (Math.abs(deltaX2) > 0.5) {
            k2 = (p2.y - p3.y) / deltaX2;
            bSlope2 = true;
        }
        // no intersections for parallels
        if (!bSlope1 && !bSlope2) {
          return null;
        }

        // consider the data precision
        if (bSlope1 && bSlope2 && (Math.abs(k1 - k2) < 0.01)) {
          return null;
        }

        var distance = lineWidth / 2.0;
        //point on outer paralle line with line p1p2 which distance value is 'distance', and 
        //outer paralle line means point3 to paralle line distance is the bigger one
        var outerPointP1P2 = this._getPointOnOuterParalleLine(p1, p2, distance, p3);
        var outerPointP2P3 = this._getPointOnOuterParalleLine(p2, p3, distance, p1);
        // calculation
        var pt = {};

        if (this._getIntersectionPoint(outerPointP1P2, k1, bSlope1, outerPointP2P3, k2, bSlope2, pt)) {
            return pt;
        } else {
          return null;
        }
    },
    /**
     * Check whether two points are same points
     * @param {Object} point1 - coordinate point, format is (x: value, y: value)
     * @param {Object} point2 - coordinate point, format is (x: value, y: value)
     * @return {Boolean} true if two points have same coordinate or both are null; otherwise return false
     */
    _isSampePoint: function(point1, point2) {
      if (point1 && point2) {
        return (point1.x == point2.x) && (point1.y == point2.y);
      } else {
        return !!point1 == !!point2;
      }
    },
	/**
   * Given two points can represnt a line, there are two paralle lines has same distance with the given line.
   * Give the third point called distancePoint, it's distance with the two paralle lines, the bigger distance with the 
   * paralle line we call it is the outer line with the given line. This method is to compute a point on the outer paralle
   * with the give line.
   *
   * @param {Object} startPoint - start point on the given line, it's format is (x, y)e
   * @param {Object} endPoint - end point on the given line, it's format is (x, y)
   * @param {Object} distancePoint - point used to compute distance with outer line of the given line, it's format is (x, y)
   * @param {Number} distance - distance with given line(lineStartPoint, lineEndPoint) 
   * @return {Object} point on outer line with the given distance
   */
  _getPointOnOuterParalleLine: function(lineStartPoint, lineEndPoint, paralleDistance, distancePoint) {
    //there are two parallel lines has same distance with given line
    //Method to get two paralle lines with a distance is that, make lineStartPoint as rotated point, distance as
    //radius, and roated 90 degree with clockwise and anticlockwise, then can get these two points on paralle lines
    var rotated90Pt = this._getRotatedPoint(lineStartPoint, lineEndPoint, 90, paralleDistance);
    var rotatedNegtive90Pt = this._getRotatedPoint(lineStartPoint, lineEndPoint, -90, paralleDistance);
    var deltaX = lineEndPoint.x - lineStartPoint.x;
    var delatY = lineEndPoint.y - lineStartPoint.y;
    var slope;
    if (deltaX == 0) {//line is paralle with y axis
      slope = null;
    } else {
      slope = delatY / deltaX;
    }
    var rotated90PtToLineDistance = this._getDistanceFromPointToLine(slope, rotated90Pt, distancePoint);
    var rotatedNegtive90PtToLineDistance = this._getDistanceFromPointToLine(slope, rotatedNegtive90Pt,  distancePoint);
    //distance value of distancePoint to paralle lines, distance is bigger to outer paralle line. 
    if (rotated90PtToLineDistance > rotatedNegtive90PtToLineDistance) {
      return rotated90Pt;
    } else {
      return rotatedNegtive90Pt;
    }
  },
  /**
   * Compute distance from one ginven point to a given line.
   * The line represent by a slope and a line point(x0, y0), the line is: y = slope * x + y0 - slope * x0
   * The distance formlua to compute one point(x0, y0) to line (Ax + By + C = 0) is
   * |Ax0 + By0 + C|/ sqrt(A*A + B*B)
   * So For the line: y = slope * x + y0 - slope * x0, A = slope, B = -1, C = y0 - slope*x0
   * 
   * When line is paralle with y-axis, slope is biggest value, the distance value is delaX. We use null 
   * represent this condition
   * @param {Number} slope - slope value of a Straight line, when line paralle with y-axis, use null
   * @param {Object} linePoint - the point on the given line, it's format is (x, y)
   * @param {Object} point - the point to compute distance with the given line, it's format is (x, y)
   * @return {Number} distance value of point to line
   */
  _getDistanceFromPointToLine: function(slope, linePoint, point) {
    if (slope) {
      //value of sqrt(A*A + B*B)
      var denominator = Math.sqrt(slope * slope + 1);
      //value of |Ax0 + By0 + C|
      var numerator = Math.abs(slope * point.x - point.y + linePoint.y - slope * linePoint.x);
      return numerator / denominator ;
    } else {//slope is not exist, it's paralle with y-axis
      return Math.abs(point.x - linePoint.x);
    }
  },
  /**
   * Get extend part of view box by line width based on drawing path.
   * For example, a triangle shape has 4 cmds [moveTo(p0), lnTo(p1), lnTo(p2), close], loop this cmds array
   * compute extend part by angle separately, such as angles p0p1p2, p1p2p0 and p2p0p1,  
   * @param {Object} dmlPath - drawing path
   * @param {Number} outlineWidth - border width
   * @return{Object} return the extend view box, it's format is {frameLeft: value, frameTop: value, frameBottom: value, frameRight: value}
   */
	getExtPartByLineWidthInPath: function(dmlPath, outlineWidth) {
  // check line width, if line width is 0, need not extend viewbox
    if (outlineWidth == 0 || isNaN(outlineWidth))
     return null;
    var startElement = null;
    var preElement = null;
    var nextElement = null;
    // loop
    var pathElements = dmlPath.cmd;
    var nextElmentIndex = -1;
    var extPart = {};
    for (var i = 0, len = pathElements.length; i < len; ++i) {
      var curElement = pathElements[i];
      nextElmentIndex = i + 1;
      if (!curElement) {
        startElement = null;
        preElement = null;
        nextElement = null;
        continue;
      }
      if (startElement == null) {
        // save as start point
        startElement = curElement;
      }
      var currentOp = curElement.op;
      if (currentOp == 'close') {
        //for close element, make start element as the current processed element(angle intersection point)
        curElement = startElement;
        //it's nextElment index is 1
        nextElmentIndex = 1;
        currentOp = curElement.op;
        startElement = null;
      }
      if (((currentOp == 'lnTo') || (currentOp == 'moveTo'))&& (preElement != null)) {
        // get the next element
        if (nextElmentIndex < len) {
          nextElement = pathElements[nextElmentIndex];
          if (nextElement != null) {
            var keyPt = [{}, {}, {}];
            var hasKeyPt = false;
            if (nextElement.op == 'lnTo') {
              hasKeyPt = this._getTriadArrayForLineCorner(keyPt, preElement, curElement, nextElement);
            } else if (nextElement.op == 'close') {
              hasKeyPt = this._getTriadArrayForLineCorner(keyPt, preElement, curElement, startElement);
            }
            if (hasKeyPt) {
              //for given 3 points, get intersection points p0p1, p1p2 with line width
              var extendPointKeyPt1 = this._getIntersectionsWithLineWidth(keyPt[0], keyPt[1], keyPt[2], outlineWidth);
              //update view box bounday
              this._updateExtendViewBoxBoundary(extPart, extendPointKeyPt1);
            }
          }
        }
      }
      preElement = curElement;
    } // end for
    return extPart;

 },
  /**
   * Extend the exist viewbox boundary via the given candidate point. 
   * @param {Object} viewboxBoundary - exist boudary, it will be update based on candidatePoint. Need pass an empty object {} for
   * first time call this method. it's format is {frameLeft: value, frameTop: value, frameBottom: value, frameRight: value}
   * @param {Object} candidatePoint - candidate point to extend viewbox boundary
   * @return {Object} the extend viewbox boundary
   */
  _updateExtendViewBoxBoundary: function(viewboxBoundary, candidatePoint){
    if (!candidatePoint || !viewboxBoundary) {
      //when candidatePoint is null, need not extend, return directly.
      //viewboxBoundary must be an non-empty object. first time need pass an empty object {} 
      return;
    }
    if (viewboxBoundary.frameLeft == undefined) {
      //viewbox boundary is not set up yet, make the candidate point as the viewbox boundary
      viewboxBoundary.frameLeft = candidatePoint.x;
      viewboxBoundary.frameTop = candidatePoint.y;
      viewboxBoundary.frameRight = candidatePoint.x;
      viewboxBoundary.frameBottom = candidatePoint.y;
    } else {
      //viewbox boundary is already exist, need verify whether need to extend with this candidate point
      if (candidatePoint.x < viewboxBoundary.frameLeft) {
        viewboxBoundary.frameLeft = candidatePoint.x;
      }
      if (candidatePoint.x > viewboxBoundary.frameRight){
        viewboxBoundary.frameRight = candidatePoint.x;
      }
      if (candidatePoint.y < viewboxBoundary.frameTop) {
        viewboxBoundary.frameTop = candidatePoint.y;
      }
      if (candidatePoint.y > viewboxBoundary.frameBottom) {
        viewboxBoundary.frameBottom = candidatePoint.y;
      }
    }
  },
  /**
   * Calculate arrow line head or tail base point, and update path list 
   * for the arrow line
   *  head1 <---- head2 
   *  tail1 ----> tail2
   * @param {Object} pathLst - line svg path list object
   * @param {String} headOrTail - head line or tail line or line has both head, tail, it can be 'head' 'tail' or headTail
   */
  calcHeadTailAndUpdatePathLst: function(pathLst, headOrTail, isNeedUpdateHeadPath, isNeedUpdateTailpath, headLength, tailLength) {
    if (!pathLst) {
     return null;
    }
    var gotHeadBasePts = false;
    var headTailBasePoint = {};
    for ( var i = 0, len = pathLst.length ? pathLst.length : 1; i < len; i++) {
      var path = pathLst.length ? pathLst[i] : pathLst;
      if (path.status != 1) {
        continue;
      }
      if ((path.stroke == "none") || (path.stroke == "false")) {
       continue;
      }
      var isNeedCalcHeadTailBase = false;
      if (headOrTail) {
        //check is need calc head tail for the path, if path is close need not calculate the path
        isNeedCalcHeadTailBase = this._isNeedCalcHeadTailBase(path);
      }
      // get original points for head
      if (!gotHeadBasePts && isNeedCalcHeadTailBase && (headOrTail == 'headTail' || headOrTail == 'head')) {
        if (isNeedCalcHeadTailBase) {
          headTailBasePoint.headBasePoint = this._calcHeadBaseAndUpdatePathLst(path, isNeedUpdateHeadPath, headLength);
          if (headTailBasePoint.headBasePoint) {
            gotHeadBasePts = true;
          }
        }
      }
      if (isNeedCalcHeadTailBase && (headOrTail == 'headTail' || headOrTail == 'tail')) {
        headTailBasePoint.tailBasePoint = this._calcTailBaseAndUpdatePathLst(path, isNeedUpdateTailpath, tailLength);
        if (!headTailBasePoint.tailBasePoint && headTailBasePoint.headBasePoint) {//that means head and tail overlap
          headTailBasePoint.tailBasePoint = {};
          headTailBasePoint.tailBasePoint.tail2 = {x: headTailBasePoint.headBasePoint.head2.x,  y:headTailBasePoint.headBasePoint.head2.y};
          headTailBasePoint.tailBasePoint.tail1 = {x: headTailBasePoint.headBasePoint.head1.x,  y:headTailBasePoint.headBasePoint.head1.y};
        }
      
      }
    }
    return headTailBasePoint;
  },
  /**
   * Check is need update line path for an arrow kind.
   * Only when line width > 1px and arrow type is not circle need update path list
   * @param {Number} lineWidthInEMU - line width in EMU unit
   * @param {String} arrowKind - arrow kind, it can be a value of pres.constants.ARROW_TYPES
   * @return {Boolean}, true when need update line path, false need not updat path list
   */
  isNeedUpdateLinePathList: function(lineWidthInEMU, arrowKind) {
    var isNeedUpdate = false;
    var constants = pres.constants;
    if (lineWidthInEMU > constants.PT_TO_EMU_FACTOR) {
      switch (arrowKind) {
        case constants.ARROW_TYPES.arrow:
        case constants.ARROW_TYPES.triangle:
        case constants.ARROW_TYPES.stealth:
        case constants.ARROW_TYPES.diamond:
        isNeedUpdate = true;
        break;
      } 
    }
    return isNeedUpdate;
  },
  /**
   * Calculate arrow line shape head arrow base point and upate the path list
   * to display the arrow. For An arrow, it needs two point to display,
   *  For example , this arrow <---- it's need two point, the left point head1, and the right head2
   *   head1 <---- head2
   * @param {Object} path - path objects for the line shape
   * @param {Number} headArrowLength - distance from head1 to head2   
   * @return{Object} return the head arrow base point it's format is {head1: point, head2: point}
   *
   */
  _calcHeadBaseAndUpdatePathLst: function(path, isNeedUpdatePath, headArrowLength) {
    var headBasePoint = {};
    //check is need caculate head arrow base point
    var pathElems = path.cmd;
    var firstElementIndex = 0;
    var firstPathElment = pathElems[firstElementIndex];
    var points = firstPathElment.params.pt;
    headBasePoint.head1 = {
     x: points[0].x,
     y: points[0].y
    };
    this._calcHead2BaseAndUpdatePathLst(pathElems, 1, headBasePoint, isNeedUpdatePath, headArrowLength);
  
    return headBasePoint;
  },
 
  /**
   * Check is need calculate head or tail arrow base point for a 
   * line path.
   * @param {Object} path - path object of line path
   * @return {Boolean} return true if need calculate head arrow base point
   *                  return fasle if need not calculate head arrow base point 
   */
  _isNeedCalcHeadTailBase: function(path) {
    var isNeedCalc = true;
    var pathElems = path.cmd;
    var iLen = pathElems.length;
    if (iLen == 0 || iLen < 2) {
      //path elements is 0 or only has 1 path element, need not cacluate head arrow base point 
      isNeedCalc = false;
    } else {
      var fisrtPathElem = pathElems[0];
      var op = fisrtPathElem.op;
      if (op == 'moveTo') {
        for (var i = 1; i < iLen; i++) {
          var pathElem = pathElems[i];
          // ignore path with "close" for head/tail end
          //for arc path, if svgFull, it's a close arc
          var isClosePath = pathElem.params && pathElem.params.svgFull;
          if (pathElem.op == "close" || isClosePath) {
            isNeedCalc = false;
            break;
          }
        }
      } else {
        //if the first element is not moveTo element, need not calculate
        isNeedCalc = false;
      }
    }
    return isNeedCalc;
  },
  /**
   * Calculate the second head arrow base point and update path list for to display the arrow
   * @param {Array<Object>} pathElements - path elements of line shape, path elements will be updated
   * to dispaly the arrow line shape
   * @param {Number} index - next element index
   * @param {Object} basePoint - head base point object, it has head1 data, after called this 
   * method, basePoint will be update with head2 data
   * @param {Number} arrowDistance - distance from head1 to head2
   */
  _calcHead2BaseAndUpdatePathLst: function(pathElements, index, basePoint, isNeedUpdatePath, arrowDistance) {
    if (index >= pathElements.length) {
      return basePoint;
     }
    var pathElem = pathElements[index];
    var op = pathElem.op;
    if (op == 'lnTo') {
      var points = pathElem.params.pt;
      if (basePoint.head1.x == points[0].x && basePoint.head1.y == points[0].y) {
        //remove the useless element.
        pathElements.splice(index, 1);
        this._calcHead2BaseAndUpdatePathLst(pathElements, index, basePoint);
      } else {
        var lnToPathObj = this._constructLnToObject(pathElements, index);
        var distance = this._getPoint2PointDistance(basePoint.head1, lnToPathObj.end);
        if (isNeedUpdatePath) {
          //line width is bigger than 1px, need update path to display arrow
          //update the previous point to display the arrow
          if (distance < arrowDistance) {//this lnTo path is too small to display the arrow, need use next path to display the arrow
            //need update the previous element's end point
            var previousElement = pathElements[index - 1];
            var prePoints = previousElement.params.pt;
            prePoints[0].x = lnToPathObj.end.x;
            prePoints[0].y = lnToPathObj.end.y;
            //previous element must be moveTo
            pathElements.splice(index, 1);
            if (pathElements.length == 1) {
              basePoint.head2 = {};
              basePoint.head2.x = lnToPathObj.end.x;
              basePoint.head2.y = lnToPathObj.end.y;
            } else {
              prePoints[0].x = lnToPathObj.end.x;
              prePoints[0].y = lnToPathObj.end.y;
              this._calcHead2BaseAndUpdatePathLst(pathElements, index, basePoint, isNeedUpdatePath, arrowDistance);
            }
           
          } else {
            basePoint.head2 = {};
            var point = this._getAdjustPointOnLineForStartOrEnd(lnToPathObj, basePoint.head1, 0.9*arrowDistance, true);
            basePoint.head2.x = point.x;
            basePoint.head2.y = point.y;
            //update move to, for head arrow, first element must be move to
            var previousElement = pathElements[index - 1];
            var prePoints = previousElement.params.pt;
            prePoints[0].x = point.x;
            prePoints[0].y =  point.y;
          }
        } else {
          basePoint.head2 = {};
          basePoint.head2.x = points[0].x;
          basePoint.head2.y = points[0].y;
        }
      }
     } else if (op == 'quadBezTo' || op == 'cubicBezTo') {
       //smile shape has quadBezTo path
       if (op == 'quadBezTo') {
         //for quadBez path, convert it to cubic path
         var prePathElem = pathElements[index - 1];
         this._convertquadBezToCubicBez(pathElem, prePathElem);
       }
      this._calcHeadArrowSecondBaseForCubic(pathElements, index, basePoint, isNeedUpdatePath, arrowDistance);
     } else if (op == 'arcTo') {//Arc shape, not arc line
       basePoint.head2 = this._calcHead2BaseForArc(pathElem, arrowDistance, isNeedUpdatePath);
       //update arc path object after path element update
       var arcPathObj = this._constructArcObject(pathElem);
       if ((arcPathObj.end.x.toFixed(2) == arcPathObj.start.x.toFixed(2))
           && (arcPathObj.end.y.toFixed(2) == arcPathObj.start.y.toFixed(2))) {
         var distance = this._getPoint2PointDistance(basePoint.head1, arcPathObj.end);
         if (distance < arrowDistance) {
           //need update the previous element's end point
           //previous element must be moveTo
           var previousElement = pathElements[index - 1];
           var prePoints = previousElement.params.pt;
           prePoints[0].x = arcPathObj.end.x;
           prePoints[0].y = arcPathObj.end.y;
           pathElements.splice(index, 1);
           if (pathElements.length > 1) {
             basePoint.head2 = null;
             this._calcHead2BaseAndUpdatePathLst(pathElements, index, basePoint, isNeedUpdatePath, arrowDistance);
           } 
         }
       } else {
         //update path elments
         var previousElement = pathElements[index - 1];
         var prePoints = previousElement.params.pt;
         prePoints[0].x =  basePoint.head2.x;
         prePoints[0].y =   basePoint.head2.y;
       }
    }
  },
  /**
   * Convert quadratic bezier to a cubic bezier
   * @param {Object} pathElem - quadratic bezier element
   * @param {Object} prePathElem - previous path element, it's end point is quarratic start point
   * @return {Object}
   */
  _convertquadBezToCubicBez: function(pathElem, prePathElem) {
    var quadBezStart = this._getPathEndPoint(prePathElem);
    var points = pathElem.params.pt;
    var quadBezControl = points[0];
    var quadBezEnd = points[1];
    var cubicControl1 = {};
    //quadratic start and end can be cubic stat and end
    //cubic bezier first control point can be got by quadratic start and quadractic control
    //cubic control 1 = start + (2/3) * (contrl - start) 
    cubicControl1.x = quadBezStart.x + (2 * (quadBezControl.x - quadBezStart.x) / 3);
    cubicControl1.y = quadBezStart.y + (2 * (quadBezControl.y - quadBezStart.y) / 3);
    var cubicControl2 = {};
    //cubic bezier second control point can be got by quadratic end and quadractic control
    //cubic control 2 = end + (2/3) * (contrl - end) 
    cubicControl2.x = quadBezEnd.x + (2 * (quadBezControl.x - quadBezEnd.x) / 3);
    cubicControl2.y = quadBezEnd.y + (2 * (quadBezControl.y - quadBezEnd.y) / 3);
    points.shift();
    points.unshift(cubicControl2);
    points.unshift(cubicControl1);
    pathElem.op = "cubicBezTo";
  },
  
  /**
   * Get a path element end point
   * @param {Object} pathElem - path element, it can ebe any path element, such as move, lnTo etc
   * @return {Point} return path end point
   */
  _getPathEndPoint: function(pathElem) {
    var point = null;
    if (pathElem) {
      point = {};
      var op = pathElem.op;
      if (op == 'moveTo' || op == 'lnTo' || op == 'quadBezTo' || op == 'cubicBezTo') {
        var points = pathElem.params.pt;
        if (points) {
          var len = points.length;
          point.x = points[len - 1].x;
          point.y = points[len - 1].y;
        }
      } else if (op == 'arcTo'){
        var params = pathElem.params;
        point.x= params.svgAbsDestX;
        point.y = params.svgAbsDestY;
      } else {
        point.x = point.y = 0;
      }
    }
    return point;
  },
  
 /**
  * Calculate head arrow second base point for cubic bezier line
  * @param {Array<Object>} pathElements - path elements of line shape, path elements will be updated
  * to dispaly the arrow line shape
  * @param {Number} index - next element index
  * @param {Object} basePoint - head base point object, it has head1 data, after called this 
  * method, basePoint will be update with head2 data
  * @param {Number} arrowDistance - distance from head1 to head2
  */
  _calcHeadArrowSecondBaseForCubic: function(pathElements, index, basePoint, isNeedUpdatePath, arrowDistance) {
    if (isNeedUpdatePath) {
      //constuct cubic bezier objects based on path elements as format {start, ctrl1, ctrl2, end}
      var cubics = this._constructCubicBezierObjs(pathElements, index, false);
      var cubicsLength = cubics.length;
      var cubicEndPoint = {
         x: cubics[cubicsLength - 1].end.x, 
         y: cubics[cubicsLength - 1].end.y
        };
      //adjust cubic bezier line after reduce arrow line distance, the 0.9 is intend for
      // there is a samll over lap with arrow and line to display line smooothly
      var newEndPoint = this._adjustCubicsToNewStart(cubics, arrowDistance*0.9);
      //remove the old cubic path elment
      pathElements.splice(index, cubicsLength);
      var cubicsLength = cubics.length;
      if (cubics && cubicsLength) {
        var insertIndex = index;
        for (var cubicfirstElementIndex = 0; cubicfirstElementIndex <  cubicsLength; cubicfirstElementIndex++) {
          var ele = this._constructCubicBeizerPathElement(cubics[cubicfirstElementIndex]);
          pathElements.splice(insertIndex, 0, ele);
          insertIndex++;
        }
        basePoint.head2 = {
           x: newEndPoint.x,
           y: newEndPoint.y 
        };
        //need update previous M or lnTo pathElment, 
        var previousElement = pathElements[index - 1];
        if (previousElement.op == 'moveTo' || previousElement.op == 'lnTo') {
         var points = previousElement.params.pt;
         points[0].x = newEndPoint.x;
         points[0].y = newEndPoint.y;
        }
        //create a new path element to connect the adjusted cubic bezier line
        var lineElemnt = this._constructLineElement("lnTo",  cubics[0].start);
        pathElements.splice(index, 0, lineElemnt);
      } else {// that means the cubic is a line, or the cubic length is too small
        basePoint.head2 = cubicEndPoint;
      }
    } else {
      var cubicElement = pathElements[index];
      var points = cubicElement.params.pt;
      //use first control point as head2 point
      basePoint.head2 = {
          x: points[0].x,
          y: points[0].y 
       };
      
    }
  },
 /**
  * Construct cubic bezier objects from start cubic bizer path element until next element is not
  * cubic bezier element
  * @param {Array<Object>} pathElements - array of path elements of the cubic bezier shape
  * @param {Number} startIndex - cubic beizer path element start index
  * @param {Boolean} isFromTailToHead - is construct cubic from tail to head
  * @return{Array<Object{start, ctrl1, ctrl2, end}>} reutrn an array contain the cubics objects with
  * format {start, ctrl1, ctrl2, end}
  */
  _constructCubicBezierObjs: function(pathElements, startIndex, isFromTailToHead) {
    var pathElem = pathElements[startIndex];
    var currentIndex = startIndex;
    var cubics = [];
    var pathCount = pathElements.length;
    while(pathElem && pathElem.op == 'cubicBezTo') {
      //until next element is not cubic bezier element
      var cubic = this._constructCubicBeizerObject(pathElements, currentIndex);
      if (isFromTailToHead) {
        cubics.unshift(cubic);
        currentIndex--;
      } else {
        cubics.push(cubic);
        currentIndex++;
      }
      
      if (currentIndex < pathCount && currentIndex >= 0) {
        pathElem = pathElements[currentIndex];
      } else {
        pathElem = null;
     }
    }
    return cubics;
  },
  /**
   * Construct cubic beizer object from path element as format {start: start, ctrl1: control1, ctrl2: control2, end: end}
   * @param {Array<Object>} pathElements - path elements array of a shape
   * @param {Number} index - index of cubic beizer element need to construct as cubic beizer object
   * @return {Object} cubic bezier object with start, ctrl1, ctrl2, and end proerties
   */
  _constructCubicBeizerObject: function(pathElements, index) {
    if (!pathElements || !pathElements.length) {
      return null;
    }
    var pathLength = pathElements.length;
    var cubicBeizer = null;
    if (index <= (pathLength - 1)) {
      var currentElement = pathElements[index];
      if (currentElement.op == 'cubicBezTo') {
        var preIndex = index - 1;
        if (preIndex >= 0) {
          var preElement = pathElements[preIndex];
          var start = null;
          if (preElement.op == 'cubicBezTo') {
            start = preElement.params.pt[2];
          } else {//it must be lnTo or M
            start = preElement.params.pt[0];
          }
          var points = currentElement.params.pt;
          cubicBeizer = this._constuctCubicBeizer(start, points[0], points[1], points[2]);
        }
      }
    }
    return cubicBeizer;
  },
  /**
   * Construct lnTo path object with start point and end point
   * *@param {Array<Object>} pathElements - path elements array of a shape
   * @param {Number} index - index of lnTo path elment to construct path object
   * @return {Object} lnTo object with start, end
   */
  _constructLnToObject: function(pathElements, index) {
    if (!pathElements || !pathElements.length) {
      return null;
    }
    var pathLength = pathElements.length;
    if (index > pathLength - 1 || index < 0) {
      return null;
    }
    var pathElement = pathElements[index];
    if (pathElement.op != 'lnTo') {
      return null;
    }
    var preIndex = index - 1;
    var prevPathElem = null;
    if (preIndex >= 0) {
      prevPathElem = pathElements[preIndex];
    }
    var pathObject = {};
    pathObject.end = {};
    pathObject.end.x = pathElement.params.pt[0].x;
    pathObject.end.y = pathElement.params.pt[0].y;
    if (prevPathElem) {
      var op = prevPathElem.op;
      if (op == 'moveTo' || op == 'lnTo' || op == 'quadBezTo' || op == 'cubicBezTo') {
        var points = prevPathElem.params.pt;
        var len = points.length;
        pathObject.start = {};
        pathObject.start.x = points[len - 1].x;
        pathObject.start.y = points[len - 1].y;
      } else if (op == 'arcTo') {
        var prevParams = prevPathElem.params;
        pathObject.start = {x: prevParams.svgAbsDestX, y: prevParams.svgAbsDestY};
      }
    } else {
      pathObject.start = pathObject.end;
    }
    return pathObject;
  },
  /**
   * Construct  cubic bezier path elment
   * @param {Object} cubic - cubic bezier object
   * @return{Object} path element of a cubic bezier 
   */
  _constructCubicBeizerPathElement: function(cubic) {
    var element = {};
    element.op = 'cubicBezTo';
    element.params = {};
    var points = [];
    points.push({x: cubic.ctrl1.x, y:cubic.ctrl1.y});
    points.push({x: cubic.ctrl2.x, y:cubic.ctrl2.y});
    points.push({x: cubic.end.x, y:cubic.end.y});
    element.params.pt = points;
    element.status = 1;
    return element;
  },
  /**
   * Construct line elment
   * @param {String} op - operation string, it could be 'moveTo' or 'lnTo' 
   * @param {Point} point - point of lnTo or moveTo path element 
   * @return{Object} path element of a lnTo or moveTo
   */
  _constructLineElement: function(op, point) {
    var element = {};
    element.op = op;
    element.params = {};
    var points = [];
    points.push({x: point.x, y: point.y});
    element.params.pt = points;
    element.status = 1;
    return element;
  },
  /**
   * Adjust cubics elements a new end point, the distance with the new end point and original end point meet the 
   * given redced distance value
   * @param {Array<Object>} cubics - array of cubic elements which need adjust,
   * cubic element is construct by method _constuctCubicBeizer
   * After called this method, this array will be changed with adjusted cubics bezier elements
   * @param {Number} reducedDistance - distance value need reduced
   * @return {Point} the new end point to connect the changed cubic beizers
   * After called this method, this array will be changed with adjusted cubics bezier elements
   * 
   */
  _adjustCubicsToNewStart: function(cubics, reducedDistance) {
    if (!cubics || !cubics.length) {
      return null;
    }
    var cubicsCount = cubics.length;
    var originalStartPoint = cubics[0].start;
    var oneUnit = pres.constants.PT_TO_EMU_FACTOR;
    var cubic = null;
    var isNeedSplit = true;
    var newEndPoint = null;
    while (isNeedSplit) {
      cubicsCount = cubics.length;
      if (cubicsCount) {
       cubic = cubics[0];
       //get large distance of two control points two line start and end points
       var ctrlPoint2StartEndDistance = this._getLargeDistanceFromPoints2Line(cubic.start, cubic.end, cubic.ctrl1, cubic.ctrl2);
       if (oneUnit > ctrlPoint2StartEndDistance ) {//that means the cubic bezier is a bezier line
         cubics.shift();
         //get the point on beizer, which meet the distance between originalEndPoint is the reducedDistance
         //this end point is not cubic bezier end point, in order to match the original cubic beizer, need use a 
         //short strait line to connect the last cubic to meet reduced distance value
         newEndPoint = this._getPointOnBeizerLineByDistance(cubic.start, cubic.end, originalStartPoint, reducedDistance); 
         if (newEndPoint) {
           isNeedSplit = false;
         }
        } else {
           var newCubics = this.getNewCubicBezierPoints(cubic.start, cubic.ctrl1, cubic.ctrl2, cubic.end);
           cubics.unshift(newCubics[0]);
           var newCtrlEndCubic = newCubics[1];
           cubic.start = newCtrlEndCubic.start;
           cubic.ctrl1 = newCtrlEndCubic.ctrl1;
           cubic.ctrl2 = newCtrlEndCubic.ctrl2;
           cubic.end = newCtrlEndCubic.end;
       }
      } else {
       isNeedSplit = false;
      }
    }
    return newEndPoint;
  },
  /**
   * Get large distance value from given two points to a line
   * @param {Point} linePoint1 - first point on a given line
   * @param {Point} linePoint2 - second point on a given line
   * @param {Point} point1 - point to compute distance between given line
   * @param {Point} point2 - point to compute distance between given line
   * @return{Number} large distance of given two points to given line
   * 
   */
  _getLargeDistanceFromPoints2Line: function(linePoint1, linePoint2, point1, point2) {
    var maxDistance;
    if (linePoint1.x.toFixed(2) == linePoint2.x.toFixed(2) && linePoint1.y.toFixed(2) == linePoint2.y.toFixed(2)) {
      //linePoint1 and linePoint2 is same value
      var maxValueSquare = Math.max(this._getPoint2PointDistanceSquare(linePoint1, point1),
          this._getPoint2PointDistanceSquare(linePoint1, point2));
      maxDistance =Math.sqrt(maxValueSquare);
    } else {
      var slope = this._getSlope(linePoint1, linePoint2);
      var distance1 = this._getDistanceFromPointToLine(slope, linePoint1, point1);
      var distance2 = this._getDistanceFromPointToLine(slope, linePoint1, point2);
      maxDistance = Math.max(distance1, distance2);
    }
    return  maxDistance;
  },
  /**
   * Get slope of two points
   * @param {Point} point1 - point1 to compute slope
   * @param {Point} point2 - point2 to compute slope
   * @return{Number} slope value, if line is vertical return null 
   */
  _getSlope: function(point1, point2) {
    if (!point1 || !point2) {
      return null;
    }
    var slope;
    if (point1.x.toFixed(2) == point1.x.toFixed(2)) {
      slope = null;
    } else {
      slope = (point2.y - point1.y) / (point2.x - point1.x);
    }
    return slope;
  },
  /**
   * distance square of point1 to point2
   * @param {Point} point1 - point1 to compute distance
   * @param {Point} point2 - point2 to compute distance
   * @return{Number} distance square of two points
   */
  _getPoint2PointDistanceSquare: function (point1, point2) {
    var deltaX = point1.x - point2.x;
    var deltaY = point1.y - point2.y;
    return deltaX * deltaX + deltaY * deltaY;
   },
   /**
    * distance  point1 to point2
    * @param {Point} point1 - point1 to compute distance
    * @param {Point} point2 - point2 to compute distance
    * @return{Number} distance value of two points
    */
   _getPoint2PointDistance: function (point1, point2) {
     var distanceSquare = this._getPoint2PointDistanceSquare(point1, point2);
     return Math.sqrt(distanceSquare);
    },
   /**
    * Find a point on bezier line, the distance between the point on bezier line to the distancePoint 
    * is the value of distance
    *  @param {Point} start - start point of bezier line
    *  @param {Point} end - end point of bezier line
    *  @param {Point} distancePoint - a point need to cacluate distance with point on bezier line
    *  @param {Number} distance - distance value from the distance to a point on bezier line
    *  @return {Point} return the point on bezier line, it can meet the condition 
    *  distance between the point and distancePoint is the given distance value, if can't find the point, return null
    */
   _getPointOnBeizerLineByDistance: function(start, end, distancePoint, distance) {
     var pointOnBeizer = null;
     // A bezier strait line, can be repreasent as 
     // B(t) = P0 + (P1-P0)t, t is a value[0,1], Point P0 is (x0, y0), Point P1 is (x1, y1)
     // Get the point P (x, y) on line P0P1,  the distance of point P to point distancePoint (x2, y2) is the value : distance 
     // Based on distance between two points formula can get a equation (y2- (y0 + (y1-y0)*t))^2 + (x2- (x0 + (x1-x0)*t))^2 = reducedDistance^2, it can be transformed to find root of below equation
     // (deltaX * deltaX + deltaY * deltaY) * t * t + 2 * t ((y2-y0) * deltaY + (x2-x0)*deltaX) + (y2-y0) * (y2-y0) + (x2-x0) * (x2-x0) - distance * distance = 0
     // Thus can use root equation of ax2 + bx + c = 0
     
     //a = (deltaX * deltaX + deltaY * deltaY)
     var a = this._getPoint2PointDistanceSquare(start, end);
     //b = 2 * ((y2-y0) * deltaY + (x2-x0)*deltaX)
     var b = 2 * ((end.x - start.x) * (start.x - distancePoint.x) + (end.y - start.y) * (start.y - distancePoint.y));
     //c = (y2-y0) * (y2-y0) + (x2-x0) * (x2-x0) - distance * distance
     var delta = b * b - 4 * a 
     * (distancePoint.x * distancePoint.x 
         + distancePoint.y * distancePoint.y 
         + start.x * start.x + start.y * start.y 
         - 2 * (distancePoint.x * start.x + distancePoint.y * start.y)
         - distance * distance);
     var q =  Math.sqrt(delta);
     
     var t1 = -(b + q) / (2 * a);
     var t2 = -(b - q) / (2 * a);
     
     if ((t1 >=0 && t1 <=1) || (t2 >=0 && t2 <=1)) {
       if (!(t1 >=0 && t1 <=1)) {
         t1 = t2;
       }
       pointOnBeizer = {};
       // based on formula B(t) = P0 + (P1-P0)t, get the x, y value on bezier line
       pointOnBeizer.x = start.x + (end.x - start.x) * t1;
       pointOnBeizer.y = start.y + (end.y - start.y) * t1;
     }
     return pointOnBeizer;
   },
  /**
   * Split one cubic bezier line to two cubic bezier line by middle points.
   * After split, the new two cubic bezier lines have same path
   * @param {Point} startPoint - start point of cubic bezier line
   * @param {Point} ctrlPoint1 - control point1 of cubic bezier line
   * @param {Point} ctrlPoint2 - control point2 of cubic bezier line
   * @param {Point} endPoint - end point of cubic bezier line
   * @param {Array<Object>} splited two new cubic bezier line
   */
  getNewCubicBezierPoints: function(startPoint, ctrlPoint1, ctrlPoint2, endPoint) {
    //middle point of two control points
    var midCtrlPoint = this._getMiddlePoint(ctrlPoint1, ctrlPoint2);
    //middle point of start point and first control point, it is the first new control point
    //of split cubic beizer1 
    var newCubic1Ctrl1 = this._getMiddlePoint(startPoint, ctrlPoint1);
    //middle point of end point and second control point, it is the second control point 
    //of split cubic bezier2
    var newCubic2Ctrl2 = this._getMiddlePoint(endPoint, ctrlPoint2);
    //middle point of first control point of new cubic bezier1 and middle of original two control point
    //it is the second control point of new cubic bezier1
    var newCubic1Ctrl2 = this._getMiddlePoint(newCubic1Ctrl1, midCtrlPoint);
    //middle point of second control point of new cubic bezier2 and middle of original two control point
    //it is the first control point of new cubic bezier2
    var newCubic2Ctrl1 = this._getMiddlePoint(newCubic2Ctrl2, midCtrlPoint);
    //middle point of second control point of new cubic bezier1 and first control point of new cubic bezier2
    //it is the end of the first new cubic and sart of second new cubic
    var newCubic1EndCub2Start = this._getMiddlePoint(newCubic1Ctrl2, newCubic2Ctrl1);
    
    var cubic1 = this._constuctCubicBeizer(startPoint, newCubic1Ctrl1, newCubic1Ctrl2, newCubic1EndCub2Start);
    var cubic2 = this._constuctCubicBeizer(newCubic1EndCub2Start, newCubic2Ctrl1, newCubic2Ctrl2, endPoint);
    return [cubic1, cubic2];
  },
  /**
   * Get middle point of given two point
   * @param {Point} point1 - control point1 of cubic bezier line
   * @param {Point} point2 - control point2 of cubic bezier line
   * @return{Point} middle point of given two points
   */
  _getMiddlePoint: function(point1, point2) {
    var midX = (point1.x + point2.x) / 2;
    var midY = (point1.y + point2.y) / 2;
    return {x: midX, y: midY};
  },
  /**
   * Construct a cubic bezier object use start point, two control points and end point
   * @param {Point} startPoint - start point of cubic bezier line
   * @param {Point} ctrlPoint1 - control point1 of cubic bezier line
   * @param {Point} ctrlPoint2 - control point2 of cubic bezier line
   * @param {Point} endPoint - end point of cubic bezier line
   * @return{Ojbect} cubic bezier object with format {start: point, ctrl1: point, ctrl2: point, end: point}
   */
  _constuctCubicBeizer: function(startPoint, controlPoint1, controlPoint2, endPoint) {
    return {start: startPoint, ctrl1: controlPoint1, ctrl2: controlPoint2, end: endPoint};
  },

   /**
    * Adjust cubics elements a new end point, the distance with the new end point and original end point meet the 
    * given redced distance value
    * @param {Array<Object>} cubics - array of cubic elements which need adjust, cubic element is construct by method _constuctCubicBeizer
    * After called this method, this array will be changed
    * @param {Number} reducedDistance - distance value need reduced
    * @return {Point} the new end point to connect the changed cubic beizers
    */
  _adjustCubicsToNewEnd: function(cubics, reducedDistance) {
    if (!cubics || !cubics.length) {
      return null;
    }
    var cubicsCount = cubics.length;
    var originalEndPoint = cubics[cubicsCount - 1].end;
    var oneUnit = 12700;
    var cubic = null;
    var isNeedSplit = true;
    var newEndPoint = null;
    while (isNeedSplit) {
       cubicsCount = cubics.length;
      if (cubicsCount) {
        cubic = cubics[cubicsCount -1];
        var ctrlPoint2StartEndDistance = this._getLargeDistanceFromPoints2Line(cubic.start, cubic.end, cubic.ctrl1, cubic.ctrl2);
        if (oneUnit > ctrlPoint2StartEndDistance ) {//that means the cubic bezier is a bezier line
          cubics.pop();
          //get the point on beizer, which meet the distance between originalEndPoint is the reducedDistance
          //this end point is not cubic bezier end point, in order to match the original cubic beizer, need use a 
          //short strait line to connect the last cubic to meet reduced distance value
          newEndPoint = this._getPointOnBeizerLineByDistance(cubic.start, cubic.end, originalEndPoint, reducedDistance); 
          if (newEndPoint) {
            isNeedSplit = false;
          }
        } else {
            var newCubics = this.getNewCubicBezierPoints(cubic.start, cubic.ctrl1, cubic.ctrl2, cubic.end);
            cubics.push(newCubics[1]);
            var newCtrlEndCubic = newCubics[0];
            cubic.start = newCtrlEndCubic.start;
            cubic.ctrl1 = newCtrlEndCubic.ctrl1;
            cubic.ctrl2 = newCtrlEndCubic.ctrl2;
            cubic.end = newCtrlEndCubic.end;
        }
      } else {
        isNeedSplit = false;
      }
    }
    return newEndPoint;
  },
  
  /**
   * Calculate arrow line shape tail arrow base point and upate the path list
   * to display the arrow. For An arrow, it needs two point to display,
   * For example , this arrow tail1 ----> tail2 it's need two point, the left point tail1, and the right tail2
   * @param {Object} path - path objects for the line shape
   * @param {Number} arrowDistance - distance from tail1 to tail2   
   * @return{Object} return the head arrow base point it's format is {tail1: point, tail2: point}
   */
  _calcTailBaseAndUpdatePathLst: function(path, isNeedUpdatePath, arrowDistance) {
    var tailBasePoint = {};
    // check for path element
    var pathElems = path.cmd;
    var iLen = pathElems.length;
    // the last path element index
    var lastElementIndex = iLen - 1;
    var lastPathElem = pathElems[lastElementIndex];
    var op = lastPathElem.op;
    if (op == 'arcTo') {
      tailBasePoint.tail2 = {
          x: lastPathElem.params.svgAbsDestX,
          y: lastPathElem.params.svgAbsDestY
          };
    } else {
      var points = lastPathElem.params.pt;
      var pointsCount = points.length;
      var lastPointIndex = pointsCount - 1;
      tailBasePoint.tail2 = {
        x: points[lastPointIndex].x,
        y: points[lastPointIndex].y
      };
    }
    this._calcTail1BaseAndUpdatePathLst(pathElems, lastElementIndex, tailBasePoint, isNeedUpdatePath, arrowDistance);
  
    return tailBasePoint;
  },
   
  /**
   * Calculate the second head arrow base point and update path list for to display the arrow
   * @param {Array<Object>} pathElements - path elements of line shape, path elements will be updated
   * to dispaly the arrow line shape
   * @param {Number} index - next element index
   * @param {Object} basePoint - head base point object, it has head1 data, after called this 
   * method, basePoint will be update with head2 data
   * @param {Number} arrowDistance - distance from head1 to head2
   */
  _calcTail1BaseAndUpdatePathLst: function(pathElements, index, basePoint, isNeedUpdatePath, arrowDistance) {
    if (index >= pathElements.length) {
      return basePoint;
     }
    var pathElem = pathElements[index];
    var op = pathElem.op;
    if (op == 'lnTo' || op == 'moveTo' ) {
      var points = pathElem.params.pt;
      var lnToPathObj = this._constructLnToObject(pathElements, index);
      if (isNeedUpdatePath && arrowDistance > 0) {//lineWidth is bigger than 1 px, need adjust end point
        //get path element start
        if (pathElem.op == 'lnTo') {
          //need adjust arrow point
          var distance = this._getPoint2PointDistance(basePoint.tail2, lnToPathObj.start);
          if (distance < arrowDistance) {//this lnTo path is too small to display the arrow, need use next path to display the arrow
        
            //previous element must be moveTo
            if (pathElements.length == 2) {
              basePoint.tail1 = {};
              basePoint.tail1.x = lnToPathObj.start.x;
              basePoint.tail1.y = lnToPathObj.start.y;
              pathElements.splice(index, 1);
            } else {
              pathElements.splice(index, 1);
              this._calcTail1BaseAndUpdatePathLst(pathElements, index - 1, basePoint, isNeedUpdatePath, arrowDistance);
            }
          } else {
            basePoint.tail1 = {};
            var point = this._getAdjustPointOnLineForStartOrEnd(lnToPathObj, basePoint.tail2, 0.9*arrowDistance, false);
            basePoint.tail1.x = point.x;
            basePoint.tail1.y = point.y;
            points[0].x = point.x;
            points[0].y = point.y;
          }
        }
      } else {
        basePoint.tail1 = {};
        basePoint.tail1.x = lnToPathObj.start.x;
        basePoint.tail1.y = lnToPathObj.start.y;
      }
     } else if (op == 'quadBezTo' || op == 'cubicBezTo') {
       if (op == 'quadBezTo') {
         //smile shape has quadBezTo path, convert it ot cubic bezier
         var prePathElem = pathElements[index - 1];
         this._convertquadBezToCubicBez(pathElem, prePathElem);
       }
       this._calcTailFirstBaseForCubic(pathElements, index, basePoint, isNeedUpdatePath, arrowDistance);
     } else if (op == 'arcTo') {
       basePoint.tail1 = this._calcTail1BaseForArc(pathElem, arrowDistance, isNeedUpdatePath);
       var arcPathObj = this._constructArcObject(pathElem);
       if ((arcPathObj.end.x.toFixed(2) == arcPathObj.start.x.toFixed(2))
           && (arcPathObj.end.y.toFixed(2) == arcPathObj.start.y.toFixed(2))) {
         pathElements.splice(index, 1);
         if (index - 1 > 0) {
           basePoint.tail1 = null;
           this._calcTail1BaseAndUpdatePathLst(pathElements, index - 1, basePoint, isNeedUpdatePath, arrowDistance);
         }
       }
     }
  },
  /**
   * Calculate tail arrow first base point for cubic bezier line and update path list
   * tail1---->tail2
   * @param {Array<Object>} pathElements - path elements of line shape, path elements will be updated
   * to dispaly the arrow line shape
   * @param {Number} index - last cubic element index
   * @param {Object} basePoint - head base point object, it has head1 data, after called this 
   * method, basePoint will be update with head2 data
   * @param {Number} arrowDistance - distance from head1 to head2
   */
  _calcTailFirstBaseForCubic: function(pathElements, index, basePoint, isNeedUpdatePath, arrowDistance) {
    if (isNeedUpdatePath && arrowDistance > 0) {
      var cubics = this._constructCubicBezierObjs(pathElements, index, true);
      var cubcisCount = cubics.length;
      var newEndPoint = this._adjustCubicsToNewEnd(cubics, arrowDistance*0.9);
      pathElements.splice(index - cubcisCount + 1, cubcisCount);
      var newCubicsLength = cubics.length;
      if (newCubicsLength && newCubicsLength) {
        for (var cubicIndex = 0; cubicIndex < newCubicsLength; cubicIndex++) {
          var ele = this._constructCubicBeizerPathElement(cubics[cubicIndex]);
          pathElements.push(ele);
        }
        basePoint.tail1 = {
            x: newEndPoint.x,
            y: newEndPoint.y 
          };
        var newLnToElement = this._constructLineElement('lnTo', newEndPoint);
        pathElements.push(newLnToElement);
      } else {// that means the cubic is a line, or the cubic length is too small
        var newIndex = pathElements.length - 1;
        basePoint.tail1 = {
            x: pathElements[newIndex].params.pt[0].x,
            y: pathElements[newIndex].params.pt[0].y 
          };
      }
    } else {
      var lastCubicPathElement = pathElements[index];
      var points = lastCubicPathElement.params.pt;
      //use the second control point as tail1
      basePoint.tail1 = {
          x: points[1].x,
          y: points[1].y 
        };
    }
   
  },
  /**
   * Get the Eccentric Angle with given angle with given point and x-axi for ellipse.
   * @param {Number} angle - angle value, it's unit is same with PI 
   * @param {Number} widthRadius - width radius of ellipse
   * @param {Number} heightRadius - height radius of ellipse
   * @return{Number} eccentric angle
   */
  _getEccentricAngle: function(angle, widthRadius, heightRadius) {
    if (widthRadius == 0) {
      widthRadius = heightRadius;
    }
    if (heightRadius == 0) {
       heightRadius = widthRadius;
    }
    //when one radius is 0, the eccentic angle is equal with angle
    var phi = Math.atan2(widthRadius * Math.sin(angle), heightRadius * Math.cos(angle));
    if (phi < 0) {
      phi += 2 * Math.PI;
    }
    return phi;
  },
  /**
   * Get relative point value on ellipse by given Eccentric Angle phi.
   * This point value is reatlive value to ellipse centeral is (0, 0) 
   * @param {Number} phi - angle value, it's unit is same with PI 
   * @param {Number} widthRadius - width radius of ellipse
   * @param {Number} heightRadius - height radius of ellipse
   * @return{Point} point on ellipse
   */
  _getRelativePointOnEllipse: function(phi, widthRadius, heightRadius) {
    var x = widthRadius * Math.cos(phi);
    var y = heightRadius * Math.sin(phi);
    return {x: x, y: y};
  },
  /**
   * Get absloute point value on ellipse by given Eccentric Angle phi
   * the point value is the absloute value to the screen 
   * @param {Number} arcAngle - angle value, it's unit is same with PI, it's angle of point with x-axis
   * @param {Object} pathElem - arc path element
   * @return{Point} point on ellipse
   */
  _getPointOnEllipse: function(arcAngle, arcObject) {
    //ellipse height radius
    var heightRadius = arcObject.hR;
   //ellipse width radius
    var widthRadius = arcObject.wR;
    //the eccentric angle of start angle 
    
    var phi1 = arcObject.startPhi;
    var relativeStartPoint = arcObject.relativeStartPoint;
    var x1 = relativeStartPoint.x;
    var y1 = relativeStartPoint.y;
    var phi2 =  this._getEccentricAngle(arcAngle, widthRadius, heightRadius);
    if (phi2 < phi1) {
      phi2 += 2 * Math.PI;
    }
    var relativeEndPoint = this._getRelativePointOnEllipse(phi2, widthRadius, heightRadius);
    var x2 = relativeEndPoint.x;
    var y2 = relativeEndPoint.y;
    
    var dx = x2 - x1;
    var dy = y2 - y1;
    //point on screen coordinate
    var x = dx + arcObject.start.x;
    var y = dy + arcObject.start.y;
    return {x: x, y:y};
  },
  _getCenterPointOfEllipse: function(arcObject) {
    var point1 = this._getPointOnEllipse(0, arcObject);
    var point2 = this._getPointOnEllipse(Math.PI, arcObject);
    var x = (point1.x + point2.x) / 2;
    var y = (point1.y + point2.y) / 2;
    return {x: x, y: y};
  },
  /**
   * Caculate head arrow head2 base point for arc
   * Example: head1<---head2
   * @param {Object} pathElem - arc path element object
   * @param {Number} arrowLength - arrow length
   * @return{Point} head arrow head2 base point
   * path element is updated use the head2 point
   */
  _calcHead2BaseForArc: function(pathElem, arrowLength, isNeedUpdatePath) {
    var head2Point;
    if (isNeedUpdatePath) {
      head2Point = this._adjustArcStartOrEndForArrow(pathElem, arrowLength, true);
    } else {
      //need not update path for 1px width arc
      head2Point = this._getHead2BasePointFor1UnitWidthArc(pathElem);
    }
    return head2Point;
  },

  /**
   * Get head2 base point for 1px width arc arrow. It's need not adjust 
   * arc start. Use 1 degree swing from start point as the head2 base point
   * @param {Object} pathElem - arc path element object
   */
  _getHead2BasePointFor1UnitWidthArc: function(pathElem) {
    var params = pathElem.params;
    //ellipse height radius
    var heightRadius = params.hR;
   //ellipse width radius
    var widthRadius = params.wR;
    var DEGREEARC = 60000 * 180;
    //start angle value of the arc in PI value. 
    var stArc = (params.stAng * Math.PI) / DEGREEARC;
    //the eccentric angle of start angle 
    var phi1 =  params.dataPhi1;
    var oneDegreeArc = Math.PI / 180;
    //need not adjust arc start point, line width is 1px
    var relativeStartPoint = this._getRelativePointOnEllipse(phi1, widthRadius, heightRadius );
    var x1 = relativeStartPoint.x;
    var y1 = relativeStartPoint.y;
    var endArc;
    if (params.sweep) {
      if (stArc > 0) {
        endArc = stArc + oneDegreeArc;
      } else {
        endArc = stArc - oneDegreeArc;
      }
    } else {
      if (stArc > 0) {
        endArc = stArc - oneDegreeArc;
      } else {
        endArc = stArc + oneDegreeArc;
      }
    }
    //end angle of head2 point
   
    var phi2 = this._getEccentricAngle(endArc, widthRadius, heightRadius);
    if (phi2 < phi1) {
      phi2 += 2 * Math.PI;
    }
    var relativeHead2Point = this._getRelativePointOnEllipse(phi2, widthRadius, heightRadius);
    var x2 = relativeHead2Point.x;
    var y2 = relativeHead2Point.y;
    //the delat avlue of head2 point and start point
    var dx = x2 - x1;
    var dy = y2 - y1;
    var x = dx + params.svgAbsStartX;
    var y = dy + params.svgAbsStartY;
    return {x: x, y:y};
  
  },
  /**
   * Compute ellipse circumference length
   * @param {Number} widthRadius - width radius of ellipse
   * @param {Number} heightRadius - height radius of ellipse
   * @return{Number} ellipse around length
   */
  _getEllipseCircumferenceLength: function(widthRadius, heightRadius) {
    if (widthRadius == 0 || heightRadius == 0) {
      //ellipse is a line, the length is 2 * raidus
      var radius = Math.max(widthRadius, heightRadius);
      return 2 * radius;
    } else {
      //use the formula L = 2* PI * b+4*(a-b)
      var maxRadius = heightRadius;
      var smallRadius = widthRadius;
      if (maxRadius < smallRadius) {
        maxRadius = smallRadius;
        smallRadius = heightRadius;
      }
      return (2 * Math.PI * smallRadius) + 4 * (maxRadius - smallRadius);
    }
  
  },
  
  /**
   * Caculate head arrow tail1 base point for arc
   * Example: tail2<---tail1
   * @param {Object} pathElem - arc path element object
   * @param {Number} arrowLength - arrow length
   * @param {Boolean}isNeedUpdatePath - whether need update path, when line width
   * is 1px, need not update, when line width is bigger than 1px, need update path 
   * @return{Point} tail arrow tail1 base point
   * path element is updated use the tail1 point
   */
  _calcTail1BaseForArc: function(pathElem, arrowLength, isNeedUpdatePath) {
    var tail1Point;
    if (isNeedUpdatePath) {
      tail1Point = this._adjustArcStartOrEndForArrow(pathElem, arrowLength, false);
    } else {
      //need not update path for 1px width arc
      tail1Point = this._getTail1BasePointFor1UnitWidthArc(pathElem);
    }
    return tail1Point;
  },
  
  /**
   * Adjust arc end point to display arrow
   * @param {Object} pathElem - arc path element object
   * @param {Number} arrowLength - arrow length
   * @param {Boolean} isAdjustStart - is adjust start or end flag,
   *  true: adjust start point
   *  false: adjust end point
   * @return{Point} adjusted arc new end or start point
   * pathElem will be update use the new end adjust point
   */
  _adjustArcStartOrEndForArrow: function(pathElem, arrowLength, isAdjustStart) {
    
    var arcObject = this._constructArcObject(pathElem);
    //start angle value of the arc in PI value. 
    var swingArc = arcObject.swingArc;
    var baseArc = arcObject.endArc;
    var distancePoint = arcObject.end;
    if (isAdjustStart) {
      baseArc = arcObject.startArc;
      distancePoint = arcObject.start;
    }

    var ratio = 0;
    var count = 0;
    var preRatio = ratio;
    //max loop time to avoid many times loop
    var maxLoop = 50;
    var adjustedEndPoint = null;
    var start2EndDistance = Math.sqrt(this._getPoint2PointDistanceSquare(arcObject.start, arcObject.end));
    var maxKeyPointData = this._getLargestDistanceKeyPointsOnArc(distancePoint, arcObject);
    var maxKeyPointDistance = maxKeyPointData.distance;
    var swingDegree = this._getEstimatedSwingDegreeForArrow(arcObject, arrowLength, isAdjustStart);
    while(count < maxLoop && (ratio > 0.9 || ratio < 0.8)) {
      //get a estimated head2 base point, the distance value between head1 and head2 
      //is between [0.8*arrowLength, 0.9*arrowLength]
      if (preRatio != 0
          && ((preRatio < 0.8 && ratio > 0.9) 
          || (preRatio > 0.9 && ratio < 0.8))) {
        // that means preSwign should add a small detla
        //the value should be between preSwing and swingDegree
        swingDegree = this._getSwingBeteenGivenSwings(preSwing, swingDegree, arcObject, arrowLength, isAdjustStart);
        var adjustedArc = this._getNewArc(baseArc, swingDegree, isAdjustStart, arcObject.sweep);;
        adjustedEndPoint = this._getPointOnEllipse(adjustedArc, arcObject);
        break;
      } else {
        var newSwing;
        if (ratio == 0) {
          newSwing = swingDegree;
        } else {
          newSwing = swingDegree * 0.9 / ratio;
        }
        preSwing = swingDegree;
        swingDegree = newSwing;
      }
      if (Math.abs(swingDegree) >= Math.abs(swingArc)) {//it should be dynamic change the swing when bigger swing arc
        if ((maxKeyPointDistance > 0 && maxKeyPointDistance > arrowLength) ||
            start2EndDistance > arrowLength) {
          swingDegree = preSwing + (Math.abs(swingArc) - preSwing) / 2;
        } else {
          swingDegree = swingArc;
          //arc is too small, only display arrow
          if (isAdjustStart) {
            adjustedEndPoint = arcObject.end;
          } else {
            adjustedEndPoint = arcObject.start;
          }
          break;
        }
      }
      var adjustedArc =  this._getNewArc(baseArc, swingDegree, isAdjustStart, arcObject.sweep);
     
      adjustedEndPoint = this._getPointOnEllipse(adjustedArc, arcObject);
      var distance = Math.sqrt(this._getPoint2PointDistanceSquare(adjustedEndPoint, distancePoint));
      preRatio = ratio;
      ratio = distance / arrowLength;
      count++;
    }
    //update the arc use new start point
    this._updateArcPathElmentWithAdjustStartOrEnd(pathElem, swingDegree, adjustedEndPoint, isAdjustStart);
    return adjustedEndPoint;
  },
  
  /**
   * Get a estimated swing degree based on given arrow length 
   * @param {Object} arcObject - an arc object
   * @param {Boolean} isArcStart - true get swing from arc start, false get swing from arc end
   * @param {Number} arrowLength - arrow length value
   * @return {Number} estimated swing degree with arrow length
   */
  _getEstimatedSwingDegreeForArrow: function(arcObject, arrowLength, isArcStart) {
    //ellipse height radius
    var heightRadius = arcObject.hR;
   //ellipse width radius
    var widthRadius = arcObject.wR;
    //circle around lenth of arc place ellipse 
    var arcEllipseLength = this._getEllipseCircumferenceLength(widthRadius, heightRadius);
    //the initial value of swing degree to cacluate head2 base point
    //use the ratio of arrow length to ellipse around length
    var swingDegree = 2 * Math.PI * (arrowLength / arcEllipseLength);
    if (heightRadius == 0 || widthRadius == 0) {
      //arc is a line, when swing degere is PI, the ellipse length is 2 * radius, so need use PI, not 2*PI
      swingDegree = Math.PI * (arrowLength / arcEllipseLength);
    }
    var distancePoint = arcObject.end;
    if (isArcStart) {
      baseArc = arcObject.start;
    }
    var maxKeyPointData = this._getLargestDistanceKeyPointsOnArc(distancePoint, arcObject);
    var maxKeyPointDistance = maxKeyPointData.distance;
    var swingArc = arcObject.swingArc;
    if (Math.abs(swingDegree) >= Math.abs(swingArc)) {
      var start2EndDistance = Math.sqrt(this._getPoint2PointDistanceSquare(arcObject.start, arcObject.end));
      if (start2EndDistance > arrowLength) {
        swingDegree = Math.abs(swingArc) / 5;
      } else {
        //need check if 0, 90, 180, 270 is on the arc, need check distance with these point
        if (maxKeyPointDistance > 0 && maxKeyPointDistance > arrowLength) {
          var arc = maxKeyPointData.arc;
          var baseArc = arcObject.endArc;
          if (isArcStart) {
            baseArc = arcObject.startArc;
          }
          swingDegree = Math.abs(arc - baseArc) * (arrowLength / maxKeyPointDistance);
        } else {
          swingDegree =  Math.abs(swingArc);
        }
      }
    }
    return swingDegree;
  },
  /**
   * Get the largest key poinst distance from distance point to an point an arc.
   * Check whether 0, PI/2, PI, PI*3/2, is on arc, and get largest value with these point
   * @param {Point} distancePoint - distance point to compute distance with key point on arc
   * @param {Object} arcObject - an arc object
   * @return {Object} return the lagest distance value and coresponding arc.
   * It's format is {distance: value, arc: value}
   */
  _getLargestDistanceKeyPointsOnArc: function(distancePoint, arcObject) {
    //check whether 0, PI/2, PI, PI*3/2, is on arc, and get larget value with these point
    var arc = null;
    var maxDistance = 0;
    var startArc = arcObject.startArc;
    var endArc = arcObject.endArc;
    var keyArcs = [0, Math.PI / 2, Math.PI, Math.PI * 3/ 2];
    var keyArcsCount = keyArcs.length;
    for (var arcIndex = 0; arcIndex < keyArcsCount; arcIndex++) {
      var currentArc = keyArcs[arcIndex];
      if (this._isAngleBelongToArc(currentArc, startArc, endArc, arcObject.sweep)) {
        var point = this._getPointOnEllipse(currentArc, arcObject);
        var distance = this._getPoint2PointDistance(distancePoint, point);
        if (distance > maxDistance) {
          maxDistance = distance;
          arc = currentArc;
        }
      }
    }
    return {distance: maxDistance, arc: arc};
  },
  /**
   * Check whether an angle is belong to a given arc
   * @param {Number} angle - angle value, it's unit is in PI.
   * @param {Number} arcStart - arc start angle value, it's unit is in PI.
   * @param {Number} arcEnd - arc end angle value, it's unit is in PI.
   * @param {Boolean} isClockWise - is the arc is clockwise or anticlockwise, true represent clockwise, false anticlockwise
   * @return {Boolean} is the angle is on the arc, return true, otherwise return false
   */
  _isAngleBelongToArc: function(angle, arcStart, arcEnd, isClockWise) {
    angle = this._convertAngleToValueInZearoAnd2PI(angle);
    angle = parseFloat(angle.toFixed(2));
    arcStart = this._convertAngleToValueInZearoAnd2PI(arcStart);
    arcStart = parseFloat(arcStart.toFixed(2));
    arcEnd = this._convertAngleToValueInZearoAnd2PI(arcEnd);
    arcEnd = parseFloat(arcEnd.toFixed(2));
    if (isClockWise) {
      while (arcEnd < arcStart) {
        //For clockwise arc, acr end must be bigger than start angle
        arcEnd = arcEnd + 2 * Math.PI;
      }
      if (angle < arcStart) {
        angle = angle + 2 * Math.PI;
      }
    } else {//arc start should bigger than arc end
      while (arcStart < arcEnd) {
        arcStart = arcStart + 2 * Math.PI;
      }
      if (angle < arcEnd) {
        angle = angle + 2 * Math.PI;
      }
    }
    return this._isBelongToRange(angle, arcStart, arcEnd);
  },
  /**
   * Convert a angle to range [0, 2*PI)
   * @param {Number} angle - angle value, it's unit is in PI.
   * @return {Number} return the angle value which is to the range [0, 2*PI) 
   * Example: for angle -PI/2, will return 3PI/2, 
   *          for anngle 3PI, will return PI
   */
  _convertAngleToValueInZearoAnd2PI: function(angle) {
    if (angle > 0) {
      while (angle >= 2 * Math.PI) {
        angle = angle - 2 * Math.PI;
      }
    } else {
      while (angle < 0) {
        angle = angle + 2 * Math.PI;
      }
    }
    return angle;
  },
  /**
   * Construst arc path element to a object with kinds of arc information
   * @param {Object} pathElem - arc path element object
   * @return{Object} arc path object with kinds of svg data 
   */
  _constructArcObject: function(pathElem) {
    var arcObject = {};
    var params = pathElem.params;
    var DEGREEARC = 60000 * 180;
    //start angle value of the arc in PI value. 
    arcObject.startArc = (params.stAng * Math.PI) / DEGREEARC;
    arcObject.swingArc = (params.swAng * Math.PI) / DEGREEARC;
    arcObject.endArc = arcObject.startArc + arcObject.swingArc;
    //should use svgWR, not wR, svgWR is the value after scale with factor
    arcObject.wR = params.svgWR;
    arcObject.hR = params.svgHR;
    arcObject.xRot = params.svgXRot;
    //arc is large part flag
    arcObject.large = params.svgLarge;
    arcObject.sweep = params.svgSweep;
    arcObject.relativDestX = params.svgDestX;
    arcObject.relativDestY = params.svgDestY;
    arcObject.full = params.svgFull;
    //eccentric angle of start point
    arcObject.startPhi = params.dataPhi1;
    arcObject.endPhi = params.dataPhi2;
    arcObject.relativeStartPoint = this._getRelativePointOnEllipse(arcObject.startPhi, arcObject.wR, arcObject.hR);
    arcObject.relativeEndPoint = this._getRelativePointOnEllipse(arcObject.endPhi, arcObject.wR, arcObject.hR);
    //start point absolute data on screen
    arcObject.start = {x: params.svgAbsStartX, y: params.svgAbsStartY};
    arcObject.end = {x: params.svgAbsDestX, y: params.svgAbsDestY};
    return arcObject;
  },
  /**
   * Get a suitable swing value to achieve  use the swing degree get a adjusted point, the distance with 
   * the start or end point ratio is not bigger than 0.9
   * there must be a swing between previous swing and current swing value make the distance ratio is belong to [0.8, 0.9]
   * @param {Number}preSwing - previous swing degree which make the corresponding point to arc start or end point distance ratio with arrow length
   * is smaller than 0.8 or bigger than 0.9
   * @param {Number}currentSwing - current swing degree which make the corresponding point to arc start or end point distance ratio with arrow length
   * bigger than 0.9 or smaller than 0.8
   * @param {Object} arcObject - path corresponding object, it's created by _constructArcObject
   * @return{Number} swing degree which make corresponding point to start or end point distance ratio is smaller than 0.9 
   */
  _getSwingBeteenGivenSwings: function(preSwing, currentSwing, arcObject, arrowLength, isAdjustStart) {
    var deltaSwing = Math.abs(preSwing - currentSwing);
    var baseSwing = preSwing;
    var swingDegree = currentSwing;
    if (preSwing < currentSwing) {
      //use the small value as base swing
      baseSwing = currentSwing;
      swingDegree = preSwing;
    } 
    var splitCount = Math.floor(deltaSwing * 180 / Math.PI);
    if (splitCount < 10) {// at least split 10 steps
      splitCount = 10;
    }
    var changeStep = deltaSwing / splitCount;
    var distancePoint = null;
    var baseArc = null;
    if (isAdjustStart) {//need adjust start point
      baseArc = arcObject.startArc;
      distancePoint = arcObject.start;
    } else {//needAdustEndPoint
      baseArc = arcObject.endArc;
      distancePoint = arcObject.end;
    }
    var ratio;
    
    for (var triedCount = 1; triedCount <= splitCount; triedCount++) {
      swingDegree = baseSwing - changeStep * triedCount;
      var newArc = this._getNewArc(baseArc, swingDegree, isAdjustStart, arcObject.sweep);
      var newPoint = this._getPointOnEllipse(newArc, arcObject);
      var distance = Math.sqrt(this._getPoint2PointDistanceSquare(newPoint, distancePoint));
      ratio = distance / arrowLength;
      if (ratio < 0.9) {
        break;
      }
    }
    return swingDegree;
  },
  /**
   * Get new arc angle from a base arc angle with a swing angle.
   * @param {Number} baseArc - arc base angle as the base point to increase or decrease a swing angle, Unit is same with PI
   * @param {Number} swingArc - swing angle, changed value from base arc angle Unit is same with PI
   * @param {Boolean} isStart - is the base point is arc start or end, true the base is arc start, false, base is arc end
   * @param {Boolean} isClockwise - arc is clockwise or not. true arc is clockwise, false is anti-clockwise
   */
  _getNewArc: function(baseArc, swingArc, isStart, isClockwise) {
    if (!isClockwise) {//anticlockwise
      swingArc = - swingArc;
    }
    var newArc;
    if (isStart) {
      newArc = baseArc + swingArc;
    } else {
      newArc = baseArc - swingArc;
    }
    return newArc;
  },
  
  /**
   * Get tail1 base point for 1px width arc arrow. It's need not adjust 
   * arc end. Use 1 degree swing from end point as the tail1 base point
   * 
   */
  _getTail1BasePointFor1UnitWidthArc: function(pathElem) {
    var params = pathElem.params;
    //ellipse height radius
    var heightRadius = params.hR;
   //ellipse width radius
    var widthRadius = params.wR;
    var DEGREEARC = 60000 * 180;
    //start angle value of the arc in PI value. 
    var stArc = (params.stAng * Math.PI) / DEGREEARC;
    var endArc = stArc + (params.swAng * Math.PI) / DEGREEARC;
    //the eccentric angle of start angle 
    var phi1 =  params.dataPhi1;
    var oneDegreeArc = Math.PI / 180;
    //need not adjust arc start point, line width is 1px
    var relativeStartPoint = this._getRelativePointOnEllipse(phi1, widthRadius, heightRadius);
    var x1 = relativeStartPoint.x;
    var y1 = relativeStartPoint.y;
    //end angle of tail point
    var newEndArc = 0;
    if (params.sweep) {
      if (endArc > 0) {
        newEndArc = endArc - oneDegreeArc;
      } else {
        newEndArc = endArc + oneDegreeArc;
      }
    } else {
      if (endArc > 0) {
        newEndArc = endArc + oneDegreeArc;
      } else {
        newEndArc = endArc - oneDegreeArc;
      }
    }
    var phi2 = this._getEccentricAngle(newEndArc, widthRadius, heightRadius);
    if (phi2 < phi1) {
      phi2 += 2 * Math.PI;
    }
    var relativeHead2Point = this._getRelativePointOnEllipse(phi2, widthRadius, heightRadius);
    var x2 = relativeHead2Point.x;
    var y2 = relativeHead2Point.y;
    //the delat avlue of head2 point and start point
    var dx = x2 - x1;
    var dy = y2 - y1;
    var x = dx + params.svgAbsStartX;
    var y = dy + params.svgAbsStartY;
    return {x: x, y:y};
  
  },
  
  /**
   * Update arc path element with adjust start or end point and swing degree
   * LargeArc flag and arc destination relative point will be update 
   * @param {Object} pathElem - arc path element object
   * @param {Number} swingDegree - swing degree to adjust arc new start, it's unit is PI, it the angle 
   * between the start point with adjusted point or end point with adjusted point
   * @param {Point} adjustedPoint - adjusted point of arc
   * @param {Boolean} isAdjustStart - whether adjusted point is start point, 
   * true - adjusted point is start point
   * false - adjusted point is end point
   *
   */
  _updateArcPathElmentWithAdjustStartOrEnd: function(pathElem, swingDegree, adjustedPoint, isAdjustStart) {
    var DEGREEARC = 60000 * 180;
    var params = pathElem.params;
    var swArc = (params.swAng * Math.PI) / DEGREEARC;
    if (swArc > 0) {
      swArc = swArc - swingDegree;
    } else {
      swArc = swArc + swingDegree;
    }
    params.swAng = (swArc * DEGREEARC) / Math.PI;
    if (isAdjustStart) {//Adjust start point, need adjust start angle
      if (swArc > 0) {//clockwisze
        params.stAng = params.stAng + (swingDegree * DEGREEARC) / Math.PI;
      } else {
        params.stAng = params.stAng - (swingDegree * DEGREEARC) / Math.PI;
      }
      var startArc = (params.stAng *  Math.PI) / DEGREEARC;
      params.dataPhi1 = this._getEccentricAngle(startArc, params.wR, params.hR);
      //update deltaX and deltaY
      params.svgDestX = pathElem.params.svgAbsDestX -  adjustedPoint.x;
      params.svgDestY = pathElem.params.svgAbsDestY -  adjustedPoint.y;
      
      params.svgAbsStartX = adjustedPoint.x;
      params.svgAbsStartY = adjustedPoint.y;
    } else {//update arc end with adjusted point
      var startArc = (params.stAng *  Math.PI) / DEGREEARC;
      var endArc = startArc + swArc;
      params.dataPhi2 = this._getEccentricAngle(endArc, params.wR, params.hR);
      //update deltaX and deltaY, it's relateive data
      params.svgDestX = adjustedPoint.x - pathElem.params.svgAbsStartX;
      params.svgDestY = adjustedPoint.y - pathElem.params.svgAbsStartY;
      
      params.svgAbsDestX = adjustedPoint.x;
      params.svgAbsDestY = adjustedPoint.y;
    }
    
    params.svgSweep = swArc > 0 ? 1 : 0;
    var isLargeArc = (swArc <= Math.PI && swArc >= (-1 * Math.PI)) ? 0 : 1;
    params.svgLarge = isLargeArc;
  },
	isRotatedShape: function(rot)
	{
		return rot && rot != 0;
	},
	
	isFlipShape: function(dir)
	{
		return dir && dir != 0 && dir != 1 && dir != 2;
	},
	
	getRealPosition: function(fixPointPos, qudrant)
	{
		var real;
		switch(qudrant)
		{
			case 1:
				real = fixPointPos;
				break;
			case 2:
				switch(fixPointPos)
				{
					case 1:
						real = 2;
						break;
					case 2:
						real = 1;
						break;
					case 3:
						real = 4;
						break;
					case 4:
						real = 3;
						break;
					default:
						break;
				}
				break;
			case 3:
				switch(fixPointPos)
				{
					case 1:
						real = 3;
						break;
					case 2:
						real = 4;
						break;
					case 3:
						real = 1;
						break;
					case 4:
						real = 2;
						break;
					default:
						break;
				}
				break;
			case 4:
				switch(fixPointPos)
				{
					case 1:
						real = 4;
						break;
					case 2:
						real = 3;
						break;
					case 3:
						real = 2;
						break;
					case 4:
						real = 1;
						break;
					default:
						break;
				}
				break;
			default:
				break;
		}
		return real;
	},

	getFlipPt: function(center, point, dir)
	{
		var pt = {};
		switch (dir)
		{
			case 0:
			case 1:
			case 2:
				pt = point;
				break;
			case 3:
			case 4:
				pt.x = 2 * center.x - point.x;
				pt.y = point.y;
				break;
			case 5:
				pt.x = 2 * center.x - point.x;
				pt.y = 2 * center.y - point.y;
				break;
			case 6:
			case 7:
				pt.x = point.x;
				pt.y = 2 * center.y - point.y;
				break;
			default:
				break;
		}
		return pt;
	},
	
	_getRotatedPt: function(start, end, rot)
	{
		if (rot == 0)
		{
			return end;
		}

		// move to center
		var dx = end.x - start.x;
		var dy = end.y - start.y;

		// cos(a+b), sin(a+b)
		var arc = rot * Math.PI / 180.0;
		var dx1 = dx * Math.cos(arc) - dy * Math.sin(arc);
		var dy1 = dx * Math.sin(arc) + dy * Math.cos(arc);

		// ret
		var pt = {};
		pt.x = start.x + dx1;
		pt.y = start.y + dy1;

		return pt;
	},

	_getRotatedPoint: function(start, end, rot, radius)
	{
		if (radius == 0)
		{
			return start;
		}

		var dx = end.x - start.x;
		var dy = end.y - start.y;
		var dr = Math.sqrt(dx * dx + dy * dy);
		if (dr == 0)
		{
			return start;
		}

		var cosA = dx / dr;
		var sinA = dy / dr;

		var newEnd = {};
		newEnd.x = start.x + radius * cosA;
		newEnd.y = start.y + radius * sinA;

		return this._getRotatedPt(start, newEnd, rot);
	},

	_getBodyForPoints: function(points, num)
	{
		var body = {};
		if ((!points) || (num <= 0))
		{
			body.frameLeft = 0;
			body.frameTop = 0;
			body.frameRight = 0;
			body.frameBottom = 0;
			return body;
		}

		// save max_x in width_, max_y in height
		body.frameLeft = points[0].x;
		body.frameTop = points[0].y;
		body.frameRight = points[0].x;
		body.frameBottom = points[0].y;

		for ( var i = 1; i < num; ++i)
		{
			if (points[i].x < body.frameLeft)
				body.frameLeft = points[i].x;
			if (points[i].x > body.frameRight)
				body.frameRight = points[i].x;
			if (points[i].y < body.frameTop)
				body.frameTop = points[i].y;
			if (points[i].y > body.frameBottom)
				body.frameBottom = points[i].y;
		} // end for

		return body;
	},
   /**
    * start ---> end
    */
	_generateLineEnd: function(start, end, hasLargeCap, lineWidth, arrowKind, viewBox)
	{
		if (!start || !end)
			return null;
		// check
		if ((start.x == end.x) && (start.y == end.y))
			return null;

		// triangle, arrow, stealth, diamond, oval, none
		if (lineWidth == 0 || !arrowKind || arrowKind == 'none')
			return null;

		// init
		var radius = lineWidth;
		var degree = 0;
		var lwMin = pres.constants.PT_TO_EMU_FACTOR * 2; // 2pt
		var ratio = 1 / pres.constants.PT_TO_EMU_FACTOR;

		// triangle, arrow, stealth, diamond, oval, none
		if (arrowKind == 'triangle')
		{
			var lw = (lineWidth > lwMin) ? lineWidth : lwMin;
			radius = lw * 3.5;
			degree = 26.6;

			// generate key points
			var pt0 = this._getRotatedPoint(end, start, degree, radius);
			var pt1 = end;
			var pt2 = this._getRotatedPoint(end, start, -degree, radius);

			// extend view box
			if (viewBox)
				this.getUnionBody(viewBox, this._getBodyForPoints([pt0, pt1, pt2], 3));

			return 'M ' + (pt0.x * ratio).toFixed(2) + ' ' + (pt0.y * ratio).toFixed(2) + ' L ' + (pt1.x * ratio).toFixed(2) + ' ' + (pt1.y * ratio).toFixed(2) + ' L ' + (pt2.x * ratio).toFixed(2) + ' ' + (pt2.y * ratio).toFixed(2) + ' Z ';
		}
		else if (arrowKind == 'arrow')
		{
			var lw = (lineWidth > lwMin) ? lineWidth : lwMin;
			radius = lw * 3.5;
			degree = 30;

			// adjust end point
			var arc = degree * Math.PI / 180;
	     //due to stroke-width set for this arrow, in order to dispaly this arrow with the resize handler size,
      //need adjust arrow end point use line width, it's need to reduce the length: (lineWidth/2)/ sin(arc) 
      //reduce end point with lineWidth distance
      var endNew = this._getRotatedPoint(end, start, 360, lineWidth);
      // generate points for line
      var rotaedStart;
      var rotatedEnd;
      if (this._isBelongToLineSegment(endNew, {start: start, end: end})) {
        rotaedStart = endNew;
        rotatedEnd = start;
      } else {
        //that means, the distance of (end, start) is smaller than lineWidth 
        rotaedStart = start;
        rotatedEnd = endNew;
      }
      var pt0 = this._getRotatedPoint(rotaedStart, rotatedEnd, degree, radius);
      var pt1 = endNew;
      var pt2 = this._getRotatedPoint(rotaedStart, rotatedEnd, -degree, radius);

			// extend view box
			if (viewBox)
			{
				var radius1 = lineWidth * 0.5;
				var radius2 = radius1 / Math.sin(arc);
				var radius3 = radius1 * Math.sqrt(2);
				var keyPts = [];
				keyPts[0] = this._getRotatedPoint(pt1, start, 180, radius2);
				keyPts[1] = this._getRotatedPoint(pt0, pt1, 90, radius1);
				keyPts[2] = this._getRotatedPoint(pt0, pt1, 135, radius3);
				keyPts[3] = this._getRotatedPoint(pt0, pt1, 225, radius3);
				keyPts[4] = this._getRotatedPoint(pt0, pt1, 270, radius1);

				keyPts[5] = this._getRotatedPoint(pt2, pt1, 90, radius1);
				keyPts[6] = this._getRotatedPoint(pt2, pt1, 135, radius3);
				keyPts[7] = this._getRotatedPoint(pt2, pt1, 225, radius3);
				keyPts[8] = this._getRotatedPoint(pt2, pt1, 270, radius1);
				this.getUnionBody(viewBox, this._getBodyForPoints(keyPts, keyPts.length));
			}

			// generate path
			return 'M ' + (pt0.x * ratio).toFixed(2) + ' ' + (pt0.y * ratio).toFixed(2) + ' L ' + (pt1.x * ratio).toFixed(2) + ' ' + (pt1.y * ratio).toFixed(2) + ' L ' + (pt2.x * ratio).toFixed(2) + ' ' + (pt2.y * ratio).toFixed(2) + ' ';
		}
		else if (arrowKind == 'stealth')
		{
			var lw = (lineWidth > lwMin) ? lineWidth : lwMin;
			radius = lw * 3.5;
			var radius1 = lw * 2.0;
			degree = 26.6;

      // generate key points
      var pt0 = this._getRotatedPoint(end, start, degree, radius);
      var pt1 = end;
      var pt2 = this._getRotatedPoint(end, start, -degree, radius);
      var pt3 = this._getRotatedPoint(end, start, 360, radius1);
			// extend view box
			if (viewBox)
				this.getUnionBody(viewBox, this._getBodyForPoints([pt0, pt1, pt2, pt3], 4));

			// generate pth
			return 'M ' + (pt0.x * ratio).toFixed(2) + ' ' + (pt0.y * ratio).toFixed(2) + ' L ' + (pt1.x * ratio).toFixed(2) + ' ' + (pt1.y * ratio).toFixed(2) + ' L ' + (pt2.x * ratio).toFixed(2) + ' ' + (pt2.y * ratio).toFixed(2) + ' L ' + (pt3.x * ratio).toFixed(2) + ' ' + (pt3.y * ratio).toFixed(2) + ' Z ';
		}
		else if (arrowKind == 'diamond')
		{
			var lw = (lineWidth > lwMin) ? lineWidth : lwMin;
			radius = lw * 1.5;
			degree = 90;

			var pt0 = this._getRotatedPoint(end, start, 90, radius);
			var pt1 = this._getRotatedPoint(end, start, 180, radius);
			var pt2 = this._getRotatedPoint(end, start, 270, radius);
			var pt3 = this._getRotatedPoint(end, start, 360, radius);

			// extend view box
			if (viewBox)
				this.getUnionBody(viewBox, this._getBodyForPoints([pt0, pt1, pt2, pt3], 4));

			return 'M ' + (pt0.x * ratio).toFixed(2) + ' ' + (pt0.y * ratio).toFixed(2) + ' L ' + (pt1.x * ratio).toFixed(2) + ' ' + (pt1.y * ratio).toFixed(2) + ' L ' + (pt2.x * ratio).toFixed(2) + ' ' + (pt2.y * ratio).toFixed(2) + ' L ' + (pt3.x * ratio).toFixed(2) + ' ' + (pt3.y * ratio).toFixed(2) + ' Z ';
		}
		else if (arrowKind == 'oval')
		{
			var lw = (lineWidth > lwMin) ? lineWidth : lwMin;
			radius = lw * 2.0;
			var radius1 = radius / Math.sqrt(2.0);
			degree = 45;

			// extend view box
			if (viewBox)
			{
				var keyPts = [];
				keyPts[0] = this._getRotatedPoint(end, start, 45, radius);
				keyPts[1] = this._getRotatedPoint(end, start, 135, radius);
				keyPts[2] = this._getRotatedPoint(end, start, 225, radius);
				keyPts[3] = this._getRotatedPoint(end, start, 315, radius);
				this.getUnionBody(viewBox, this._getBodyForPoints(keyPts, keyPts.length));
			}

			var path = {};
			path.cx = (end.x * ratio).toFixed(2);
			path.cy = (end.y * ratio).toFixed(2);
			path.r = (radius1 * ratio).toFixed(2);
			return path;
		}
		else
			return null;
	},

	extendViewBoxForLineCap: function(lineWidth, p1, p2, viewBox)
	{
		if (p1 && p2)
		{
			var lw2 = lineWidth * 0.5;
			var lwr = lw2 * Math.sqrt(2.0);

			var capPt = [];
			capPt[0] = this._getRotatedPoint(p1, p2, 90, lw2);
			capPt[1] = this._getRotatedPoint(p1, p2, 135, lwr);
			capPt[2] = this._getRotatedPoint(p1, p2, 225, lwr);
			capPt[3] = this._getRotatedPoint(p1, p2, 270, lw2);

			// extend viewBox
			this.getUnionBody(viewBox, this._getBodyForPoints(capPt, 4));
		}
	},

	calcArrowPathFromGuide: function(headTailBasePoint, hasLargeCap, lineWidth, arrowType, arrowKind, viewBox)
	{
		if (!(headTailBasePoint && (headTailBasePoint.tailBasePoint || headTailBasePoint.headBasePoint)))
			return null;

		var path = null;
		if (arrowType == 'head' && headTailBasePoint.headBasePoint)
		{
		  // head1 <---- head2
			path = this._generateLineEnd(headTailBasePoint.headBasePoint.head2, headTailBasePoint.headBasePoint.head1, hasLargeCap, lineWidth, arrowKind, viewBox);
		}
		else if (arrowType == 'tail' && headTailBasePoint.tailBasePoint)
		{
		  // tail1 ----> tail2
			path = this._generateLineEnd(headTailBasePoint.tailBasePoint.tail1, headTailBasePoint.tailBasePoint.tail2, hasLargeCap, lineWidth, arrowKind, viewBox);
		}

		return path;
	},

	scaleCustomPath: function(path, xRatio, yRatio)
	{
		if (xRatio == 1 && yRatio == 1)
			return path;
		var pathElems = path.split(' ');
		var len = pathElems.length;
		var updatedPath = '';
		for ( var i = 0; i < len; ++i)
		{
			if (pathElems[i] == 'M')
			{
				updatedPath += pathElems[i] + ' ';
				updatedPath += (pathElems[++i] * xRatio).toFixed(2) + ' ';
				updatedPath += (pathElems[++i] * yRatio).toFixed(2) + ' ';
			}
			else if (pathElems[i] == 'L')
			{
				updatedPath += pathElems[i] + ' ';
				updatedPath += (pathElems[++i] * xRatio).toFixed(2) + ' ';
				updatedPath += (pathElems[++i] * yRatio).toFixed(2) + ' ';
			}
			else if (pathElems[i] == 'Q')
			{
				updatedPath += pathElems[i] + ' ';
				updatedPath += (pathElems[++i] * xRatio).toFixed(2) + ' ';
				updatedPath += (pathElems[++i] * yRatio).toFixed(2) + ' ';
				updatedPath += (pathElems[++i] * xRatio).toFixed(2) + ' ';
				updatedPath += (pathElems[++i] * yRatio).toFixed(2) + ' ';
			}
			else if (pathElems[i] == 'C')
			{
				updatedPath += pathElems[i] + ' ';
				updatedPath += (pathElems[++i] * xRatio).toFixed(2) + ' ';
				updatedPath += (pathElems[++i] * yRatio).toFixed(2) + ' ';
				updatedPath += (pathElems[++i] * xRatio).toFixed(2) + ' ';
				updatedPath += (pathElems[++i] * yRatio).toFixed(2) + ' ';
				updatedPath += (pathElems[++i] * xRatio).toFixed(2) + ' ';
				updatedPath += (pathElems[++i] * yRatio).toFixed(2) + ' ';
			}
			else if (pathElems[i] == 'a')
			{
				// arcto will use lower case "a" to be relative to before point
				updatedPath += pathElems[i] + ' ';
				updatedPath += (pathElems[++i] * xRatio).toFixed(2) + ' '; // ellipse x radius
				updatedPath += (pathElems[++i] * yRatio).toFixed(2) + ' '; // ellipse y radius
				// i += 3;
				updatedPath += pathElems[++i] + ' ';
				updatedPath += pathElems[++i] + ' ';
				updatedPath += pathElems[++i] + ' ';
				updatedPath += (pathElems[++i] * xRatio).toFixed(2) + ' '; // dest x
				updatedPath += (pathElems[++i] * yRatio).toFixed(2) + ' '; // dest y
			}
			else if (pathElems[i] == 'Z')
			{
				updatedPath += pathElems[i] + ' ';
			}
			else
			{

			}
		}
		return dojo.trim(updatedPath);
	},

	updateViewLinePath: function(element, eleDom)
	{
		if (element && element.svg && element.svg.path && element.svg.line && eleDom)
		{
			var lineModel = element.svg.line;
			var gap = element.svg.gap;
			var lineNodes = dojo.query('[id="' + lineModel.id + '"]', eleDom);
			if (lineNodes && lineNodes.length == 1)
			{
				dojo.attr(lineNodes[0], 'd', element.svg.path);

				// Together update view gap
				var flaGrp = lineNodes[0].parentNode.parentNode;
				if (flaGrp)
				{
					var transform = dojo.attr(flaGrp, 'transform');
					var factor = pres.constants.PT_TO_EMU_FACTOR;
					var newTranslate = 'scale(1.3333) translate(' + (gap.l / factor).toFixed(2) + ',' + (gap.t / factor).toFixed(2) + ')';
					transform = transform.replace(/scale\(1\.3333\) translate\([- ,\d\.]*\)/g, newTranslate);
					dojo.attr(flaGrp, 'transform', transform);
				}
			}
		}
	},

	updateViewFillPath: function(element, eleDom, fromThumbnail)
	{
		if (element && element.svg && element.svg.cpath && element.svg.fill && element.svg.prop && element.svg.prop.cp && eleDom)
		{
			var fillModel = element.svg.fill;
			var rectOrCircleNodes = dojo.query('[id="' + fillModel.id + '"]', eleDom);
			if (rectOrCircleNodes && rectOrCircleNodes.length == 1)
			{
				var rectOrCircleNode = rectOrCircleNodes[0];
				// Update clip path node and its id
				// Get clip path node
				var clipPathId = element.svg.prop.cp.id;

				// There are some id fixed for shape in thumbnail/slide editor
				// So here search ones with clipPathId started
				var clipPath = null;
				var clipPaths = dojo.query('[id^="' + clipPathId + '"]', eleDom);
				if (clipPaths && clipPaths.length == 1)
				{
					clipPath = clipPaths[0];
				}
				if (clipPath)
				{
					var updatedId = null;
					if (clipPath.id.indexOf('_upd') >= 0)
						updatedId = clipPath.id.replace('_upd', '');
					else
						updatedId = clipPath.id + '_upd';

					// Update clip path Id and path
					dojo.attr(clipPath, 'id', updatedId);
					var cpaths = element.svg.cpath;
					// Fix chrome 38 issue
					// all cpaths has been connected together and set into a path
					var cpathStr = '';
					for ( var i = 0, len = cpaths.length; i < len; i++)
					{
						cpathStr += (cpaths[i].trim()) + ' ';
					}
					if (cpathStr)
						dojo.attr(clipPath.childNodes[0], 'd', cpathStr);
					// reset it for rectOrCircleNode
					dojo.attr(rectOrCircleNode, 'clip-path', 'url(#' + updatedId + ')');
				}
			}
		}
	},

	updateViewHeadArrowPath: function(element, eleDom, type)
	{
		if (element && element.svg && element.svg.arrows && eleDom && type)
		{
			var arrows = element.svg.arrows;
			for ( var i = 0, len = arrows.length; i < len; i++)
			{
				if (arrows[i].type == type)
				{
					var pathNodes = dojo.query('[id="' + arrows[i].id + '"]', eleDom);
					if (pathNodes && pathNodes.length == 1)
					{
						if (arrows[i].path)
							dojo.attr(pathNodes[0], 'd', arrows[i].path);
						else if (arrows[i].circle)
						{
							dojo.attr(pathNodes[0], 'cx', arrows[i].attr('cx'));
							dojo.attr(pathNodes[0], 'cy', arrows[i].attr('cy'));
							dojo.attr(pathNodes[0], 'r', arrows[i].attr('r'));
						}
					}
					break;
				}
			}
		}

	},

	updateViewRect: function(element, eleDom)
	{
		if (element && element.svg && element.svg.fill && element.svg.fill.type == 'rect' && eleDom)
		{
			var fillModel = element.svg.fill;
			var ptnModel = element.svg.prop && element.svg.prop.ptn;
			var fillNodes = dojo.query('[id="' + fillModel.id + '"]', eleDom);
			if (fillNodes && fillNodes.length == 1)
			{
				dojo.attr(fillNodes[0], 'width', fillModel.attr('width'));
				dojo.attr(fillNodes[0], 'height', fillModel.attr('height'));
				dojo.attr(fillNodes[0], 'x', fillModel.attr('x'));
				dojo.attr(fillNodes[0], 'y', fillModel.attr('y'));

				var fillRefId = dojo.attr(fillNodes[0], 'fill');
				if (fillRefId.indexOf('url#('))
				{
					fillRefId = fillRefId.replace('url(#', '');
					fillRefId = fillRefId.replace(')', '');
					var fillDef = dojo.query('[id="' + fillRefId + '"]', eleDom);
					if (fillDef && fillDef.length == 1)
					{
						if (fillDef[0].nodeName.toLowerCase() == 'pattern' && ptnModel)
						{
							// image fill
							dojo.attr(fillDef[0], 'width', ptnModel.attr('width'));
							dojo.attr(fillDef[0], 'height', ptnModel.attr('height'));
							dojo.attr(fillDef[0], 'x', ptnModel.attr('x'));
							dojo.attr(fillDef[0], 'y', ptnModel.attr('y'));

							dojo.attr(fillDef[0].firstChild, 'width', ptnModel.attr('width'));
							dojo.attr(fillDef[0].firstChild, 'height', ptnModel.attr('height'));
						}
					}
				}
			}
		}

	},

	updateViewCircle: function(element, eleDom)
	{
		if (element && element.svg && element.svg.fill && element.svg.fill.type == 'circle' && eleDom)
		{
			var fillModel = element.svg.fill;
			var fillNodes = dojo.query('[id="' + fillModel.id + '"]', eleDom);
			if (fillNodes && fillNodes.length == 1)
			{
				// update center
				var cx = fillModel.attr('cx'), cy = fillModel.attr('cy'), r = fillModel.attr('r');
				dojo.attr(fillNodes[0], 'cx', cx);
				dojo.attr(fillNodes[0], 'cy', cy);
				// update radius
				dojo.attr(fillNodes[0], 'r', r);
			}
		}
	},

	updateTextRect: function(element, eleDom)
	{
		if (element && element.txtBox && eleDom)
		{
			var txtBoxDiv = dojo.query('[id="' + element.txtBox.id + '"]', eleDom);
			if (txtBoxDiv && txtBoxDiv.length == 1)
			{
				dojo.attr(txtBoxDiv[0], 'style', element.txtBox.attr('style'));
			}
		}
	},

	updateRotateFlip: function(element, eleDom)
	{
		if (element && element.svg)
		{
			var svg = element.svg;
			// Handle rotation info
			var rotStr = '';
			if (svg.frm.rot !== null && svg.frm.rot !== undefined)
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
					case 0:
					case 1:
					case 2:
						flipStr = 'scale(1,1)';
						break;
					default:
						break;
				}
			}

			if (rotStr || flipStr)
			{
				var transformStr = (rotStr + ' ' + flipStr);
				dojo.style(eleDom, 'transform', transformStr);
				dojo.style(eleDom, '-webkit-transform', transformStr);
				dojo.style(eleDom, '-ms-transform', transformStr);
				dojo.style(eleDom, '-moz-transform', transformStr);
				
				// rotate/flip center will be set as SVG frame center relative to main node LT
				var cmToEmu = pres.constants.CM_TO_EMU_FACTOR, svgCenterX = svg.frm.l + (svg.frm.w / 2), svgCenterY = svg.frm.t + (svg.frm.h / 2), offsetPercentX = ((svgCenterX - (element.l * cmToEmu)) * 100 / (element.w * cmToEmu)).toFixed(2), offsetPercentY = ((svgCenterY - (element.t * cmToEmu)) * 100 / (element.h * cmToEmu)).toFixed(2);
				var transformOrigStr = (offsetPercentX + '% ' + offsetPercentY + '%');
				dojo.style(eleDom, 'transform-origin', transformOrigStr);
				dojo.style(eleDom, '-webkit-transform-origin', transformOrigStr);
				dojo.style(eleDom, '-ms-transform-origin', transformOrigStr);
				dojo.style(eleDom, '-moz-transform-origin', transformOrigStr);
			}
			else
			{
				var style = dojo.attr(eleDom, 'style');
				style = pres.utils.htmlHelper.extractStyle(style);
				delete style['transform'];
				delete style['-webkit-transform'];
				delete style['-ms-transform'];
				delete style['-moz-transform'];
				dojo.attr(eleDom, 'style', pres.utils.htmlHelper.stringStyle(style));
			}
			
			if (pres.utils.shapeUtil.isConnectorShape(element) && flipStr)
			{
				// update handler class due to flip change
				var startClass, endClass;
				switch (svg.dir)
				{
					case 0:
					case 4:
						startClass = 'resize-handler-w';
						endClass = 'resize-handler-e';
						break;
					case 1:
					case 3:
					case 5:
					case 7:
						startClass = 'resize-handler-nw';
						endClass = 'resize-handler-se';
						break;
					case 2:
					case 6:
						startClass = 'resize-handler-n';
						endClass = 'resize-handler-s';
						break;
					default:
						break;
				}

				var wrapperNode = dojo.query('.resize-wrapper', eleDom)[0];
				if (wrapperNode)
				{
					dojo.forEach(wrapperNode.childNodes, function(node)
					{
						if (dojo.hasClass(node, 'start'))
						{
							dojo.removeAttr(node, 'class');
							dojo.addClass(node, 'start resize-handler ' + startClass);
						}
						else if (dojo.hasClass(node, 'end'))
						{
							dojo.removeAttr(node, 'class');
							dojo.addClass(node, 'end resize-handler ' + endClass);
						}
					});
				}
			}
		}
	},

	updateWrapperPos: function(element, elemDom)
	{
		var wrapperNode = dojo.query('.resize-wrapper', elemDom)[0];
		if (element && element.svg && wrapperNode)
		{
			var cmToEmu = pres.constants.CM_TO_EMU_FACTOR;
			var mainL = element.l * cmToEmu, mainT = element.t * cmToEmu, mainW = element.w * cmToEmu, mainH = element.h * cmToEmu, wrapperL = element.svg.frm.l, wrapperT = element.svg.frm.t, wrapperW = element.svg.frm.w, wrapperH = element.svg.frm.h;

			var styles = {
				left: ((wrapperL - mainL) * 100 / mainW) + '%',
				top: ((wrapperT - mainT) * 100 / mainH) + '%',
				width: (wrapperW * 100 / mainW) + '%',
				height: (wrapperH * 100 / mainH) + '%'
			};

			dojo.style(wrapperNode, styles);
		}
	},
	
	updateModelPos: function(element, elemDom)
	{
		if (element && element.svg)
		{
			var svg = element.svg, l = svg.frm.l, t = svg.frm.t, w = svg.frm.w, h = svg.frm.h, gapL = svg.gap.l, gapT = svg.gap.t, gapR = svg.gap.r, gapB = svg.gap.b, dspL = l - gapL, dspT = t - gapT, dspW = w + gapL + gapR, dspH = h + gapT + gapB;
			var  modelPos = "dsp_x:" + dspL + ";dsp_y:" + dspT + ";dsp_width:" + dspW + ";dsp_height:" + dspH + ";frm_x:" + l + ";frm_y:" + t + ";frm_width:" + w + ";frm_height:" + h + ";";
			if (svg.frm.rot !== null && svg.frm.rot !== undefined)
			{
				modelPos += ("rot_degree:" + svg.frm.rot + ";");
			}
			if (svg.dir !== null && svg.dir !== undefined)
			{
				modelPos += ("dir:" + svg.dir + ";");
			}
			if(svg.av)
			{
				for(var av in svg.av)
					modelPos += (av + ":" + svg.av[av] + ";");
			}

			var svgNode = dojo.query('svg', elemDom)[0];
			if (svgNode)
				dojo.attr(svgNode, 'preserve0', modelPos);
		}
	},
	
	updateViewFill: function(element, eleDom, fromThumbnail, bgOrbd)
	{
		var e = element;
		if (bgOrbd == 'bg')
		{
			var fillModel = e.svg.fill;
			var id = fillModel.id;
			var color = fillModel.attrs['fill'];
			var fillNode = dojo.query('[id="' + id + '"]', eleDom)[0];
			dojo.attr(fillNode, 'fill', color);
		}
		else if (bgOrbd == 'bd')
		{
			var lineModel = e.svg.line;
			if (lineModel)
			{
				var id = lineModel.id;
				var color = lineModel.attrs['stroke'];
				var fillNode = dojo.query('[id="' + id + '"]', eleDom)[0];
				dojo.attr(fillNode, 'stroke', color);
			}
			var arrows = e.svg.arrows;
			dojo.forEach(arrows, dojo.hitch(this, function(arrowModel)
			{
				var id = arrowModel.id;
				var flag = pres.utils.shapeUtil.checkArrowColorChange(arrowModel);
				if (flag == true)
				{
					var color = arrowModel.attrs['fill'];
					var fillNode = dojo.query('[id="' + id + '"]', eleDom)[0];
					dojo.attr(fillNode, 'fill', color);
				}
				else if (flag == false)
				{
					var color = arrowModel.attrs['stroke'];
					var fillNode = dojo.query('[id="' + id + '"]', eleDom)[0];
					dojo.attr(fillNode, 'stroke', color);
				}
			}));
		}
		else if (bgOrbd == 'op')
		{
			var fillModel = e.svg.fill;
			var id = fillModel.id;
			var opacity = fillModel.attrs['fill-opacity'];
			var fillNode = dojo.query('[id="' + id + '"]', eleDom)[0];
			dojo.attr(fillNode, 'fill-opacity', opacity);
		}
	},

	updateLineTypeView: function(element, eleDom, fromThumbnail, lineStyleName)
	{
		var lineModel = element.svg.line;
		if(lineStyleName != "arrow")
		{
			if (lineModel)
			{
				var id = lineModel.id;
				var lineStyleValue = lineModel.attrs['stroke-' + lineStyleName];
				var fillNode = dojo.query('[id="' + id + '"]', eleDom)[0];
				dojo.attr(fillNode, 'stroke-' + lineStyleName, lineStyleValue);
				if(lineStyleName == 'width')
				{
					var formatValueDash = lineModel.attrs['stroke-dasharray'];
					dojo.attr(fillNode, 'stroke-dasharray', formatValueDash);
				}
				else if(lineStyleName == 'dasharray')
					dojo.attr(fillNode, 'stroke-linecap', lineModel.attrs['stroke-linecap']);
			}
			var arrows = element.svg.arrows;
			if(arrows && lineStyleName == 'width')
			{
				dojo.forEach(arrows, dojo.hitch(this, function(arrowModel)
				{
					id = arrowModel.id;		
					lineStyleValue = arrowModel.attrs['stroke-' + lineStyleName];
					//formatValueDash = arrowModel.attrs['stroke-dasharray'];
					fillNode = dojo.query('[id="' + id + '"]', eleDom)[0];
					//update dashArray
					dojo.attr(fillNode, 'stroke-' + lineStyleName, lineStyleValue);
					dojo.attr(fillNode,'fill',arrowModel.attrs['fill']);
				}));
			}
		}
		else
		{
			var parentNode = dojo.query('[id="'+ element.svg.divId +'"]', eleDom)[0];
			var fillLineNode = dojo.query("[groupfor=fill-line-arrow]", element.svg.id)[0];
			var transformMatric = dojo.attr(fillLineNode, "transform");
			parentNode.outerHTML = element.svg.getHTML();
			var fillLineNodeNew = dojo.query("[groupfor=fill-line-arrow]", element.svg.id)[0];
			dojo.attr(fillLineNodeNew, "transform", transformMatric);
		}
	},
	/**
	 * Check to change arrow stroke or fill
	 * 
	 * @param node
	 * @returns true fill false stroke
	 */
	checkArrowColorChange: function(arrow)
	{
		if (!arrow)
			return null;
		// Per conversion logic
		// TRIANGLE, DIAMONG and STEALTH will be set as "stroke:none;fill:realColor;stroke-linejoin:miter"
		// OVAL will be set as "stroke:none;fill:realColor;" without stroke-linejoin and stroke-linecap
		// ARROW will be set as "stroke:realColor;fill:none;stroke-linecap:round"
		// So per above, change arrow stroke or fill when change border color
		var join = arrow.attrs['stroke-linejoin'];
		var cap = arrow.attrs['stroke-linecap'];
		if (join || (!join && !cap))
			return true; // change fill
		else if (cap)
			return false; // change stroke
		else
			return null;
	},

	//ele:element to change, key : stroke, oldAttr and newAttr : preserve info for "a" msg's undo and redo
	setOpacity: function(ele, opacityValue, key, oldAttrObj, newAttrObj)
	{
		if (!ele || !key ||isNaN(parseFloat(opacityValue)) ||!oldAttrObj || !newAttrObj)
			return;

		var oldOpacity = null;		
		var oldChanged = null;
		oldOpacity = ele.attrs[key + '-opacity'];
		oldChanged = ele.attrs['data-' + key + '-chg'];
		ele.attrs[key + '-opacity'] = opacityValue;
		var oldOpacityDouble = parseFloat(oldOpacity);
		if (!isNaN(oldOpacityDouble) && oldOpacityDouble >= 0 && oldOpacityDouble < 1)
		{
			oldAttrObj[key + '-opacity'] = oldOpacity;
			newAttrObj[key + '-opacity'] = opacityValue;
		}
		else
		{
			oldAttrObj[key + '-opacity'] = 1;
			newAttrObj[key + '-opacity'] = opacityValue;
		}
		
		//prevent addpending function drop 'data-fill-chg' when merging message.
		ele.attrs['data-' + key + '-chg'] = '1';
		newAttrObj['data-' + key + '-chg'] = '1';
		
		if (!oldChanged)
		{
			oldAttrObj['data-' + key + '-chg'] = '';
		}
	},

	//Flat cap, there is no blankSpace, just get dashArray in proportion.
	calcDashWithFlatCap: function(dashTempOld, lineWidth, widthTemp)
	{
		var dashTemp = dashTempOld.split(',');
		for(var i = 0; i < dashTemp.length; i++)
		{
			dashTemp[i] = dashTemp[i] / widthTemp;
		}
		for(var i = 0; i < dashTemp.length; i++)
		{
			if(i == 0)
				dashArray = dashTemp[i] * lineWidth;
			else
				dashArray = dashArray + ',' + (dashTemp[i] * lineWidth);
		}
		return dashArray;
	},
	
	// For round or square cap, there is blankSpace. 
	// eg: sysDot="0, 2" , linewidth = 3. In order to get right view, 0 is always set to 1.
	// Real dashArray = "1, 6"
	calcDashWithRoundCap: function(dashTempOld, lineWidth, widthTemp)
	{
		var dashArray = ""; 
		//dashTempOld is get from element.attrs["dashArray-name"] || element.attrs["stroke-dasharray"]
		//When dashTempOld is dasharray's name, like sysDot, dot and so on, recaculate from basic dasharray.	
		if(dashTempOld && !/,/.test(dashTempOld))
		{
			switch(dashTempOld)
			{
				case 'lgDashDotDot'://7 4 0 4 0 4
					dashArray = line7 +',' + line4 + ',' + lineBlank + ','+ line4 + ',' + lineBlank + ',' + line4; 
					break;
				case 'lgDashDot':
					dashArray = line7 +',' + line4 + ',' + lineBlank + ',' + line4; 
					break;
				case 'dashDot':
					dashArray = line3 +',' + line4 + ',' + lineBlank + ',' + line4;
					break;
				case 'sysDot':
					dashArray = lineBlank + ',' + line2;
					break;
				case 'sysDash':
					dashArray = line2 + ',' + line2;
					break;
				case 'dash':
					dashArray = line3 + ',' + line4;
					break;
				case 'lgDash':
					dashArray = line7 + ',' + line4;
					break;
			}
		}
		else
		{
			//When dashTempOld is real dasharray, like '3,4'. Use flag = 4/3.
			var dashTemp = dashTempOld.split(',');
			var flag = dashTemp[1]/dashTemp[0];
			var line7 = 7 * lineWidth;
			var line4 = 4 * lineWidth;
			var line2 = 2 * lineWidth;
			var line3 = 3 * lineWidth;
			var lineBlank = 1;
			switch(dashTemp.length)
			{
				case 6:
					dashArray = line7 +',' + line4 + ',' + lineBlank + ','+ line4 + ',' + lineBlank + ',' + line4; 
					break;
				case 4:
					if(flag > 1)
					{
						dashArray = line7 +',' + line4 + ',' + lineBlank + ',' + line4; 
					}
					else
					{
						dashArray = line3 +',' + line4 + ',' + lineBlank + ',' + line4;
					}							
					break;
				case 2 : 
					if(flag == widthTemp * 2)
						dashArray = lineBlank + ',' + line2;//Errors for linewidth = 2/3 , 0.5 , 2/7, derectly recognize dashtype as sysDot
					else if(flag == 1)
						dashArray = line2 + ',' + line2;
					else if(flag > 1)
						dashArray = line3 + ',' + line4;
					else if(flag < 1)
						dashArray = line7 + ',' + line4;
					break;
			}
		}
		return dashArray;
	},

	//ele: element to change. lineStyleValue : type_value, eg, width_20, linejoin_butt , linecap_round,dashArray_1,1
	//stroke, lineStyleValue, oldAttrObj, newAttrObj, lineStyleName
	setLineType: function(ele, lineStyleValue, oldAttrObj, newAttrObj, lineStyleName)
	{
		if (!ele || !lineStyleValue || !lineStyleName)
			return;
		var key = 'stroke';
		oldAttrObj['data-line-chg'] = ele.attrs['data-line-chg'];
		var oldValue = ele.attrs[key + '-' + lineStyleName];
		var oldLineCap = ele.attrs[key + '-linecap'];
		if(lineStyleName == 'dasharray')
		{
			var widthTemp = ele.attrs[key + '-width'];
			//calc dashArray with width and dashArray base 8, 3, 1, 3, 1, 3
			//When set round dot(1,1), also  change linecap to round, different from MS office.
			oldAttrObj['dasharray-name'] = ele.attrs['dasharray-name'];
			ele.attrs['dasharray-name'] = newAttrObj['dasharray-name'] = pres.constants.LINE_DASH_TYPE[pres.constants.LINE_DASH_TYPE_VALUE.indexOf(lineStyleValue)];			 
			if(lineStyleValue == "1, 1" )
			{
				if(oldLineCap != pres.constants.LINE_CAP_ROUND)
				{
					newAttrObj['stroke-linecap'] =pres.constants.LINE_CAP_ROUND;
					ele.attrs['stroke-linecap'] = pres.constants.LINE_CAP_ROUND;
					pe.scene.hub.commandsModel.getModel(pres.constants.CMD_LINE_CAP).value = pres.constants.LINE_CAP_ROUND;
					oldAttrObj['stroke-linecap'] = oldLineCap;
				}
			}
			else if(ele.attrs['stroke-linecap'] != pres.constants.LINE_CAP_FLAT)
			{
				pe.scene.hub.commandsModel.getModel(pres.constants.CMD_LINE_CAP).value = pres.constants.LINE_CAP_FLAT;
				ele.attrs['stroke-linecap'] = pres.constants.LINE_CAP_FLAT;
				oldAttrObj['stroke-linecap'] = oldLineCap;
				newAttrObj['stroke-linecap'] = pres.constants.LINE_CAP_FLAT;
			}

			if(ele.attrs['stroke-linecap'] == pres.constants.LINE_CAP_ROUND)
			{
				lineStyleValue = "0, 2";
			}
				
			if(/,/.test(lineStyleValue))
			{
				var dashArray = lineStyleValue.split(",");
				lineStyleValue = '';
				for(var i = 0; i < dashArray.length; i ++)
				{
					if(i == 0)
					{
						if(dashArray[i] == 0)
							lineStyleValue = 1;
						else
							lineStyleValue = widthTemp * dashArray[i];
					}
					else
					{
						if(dashArray[i] == 0)
							lineStyleValue = lineStyleValue + ',' + 1;
						else	
							lineStyleValue = lineStyleValue + ',' + (widthTemp * dashArray[i]);
					}
				}			
				ele.attrs['stroke-' + lineStyleName] = lineStyleValue;
			}
			else
			{
				ele.attrs['stroke-' + lineStyleName] = "none";
			}	
			if (oldValue != null && oldValue != undefined)
			{
				oldAttrObj[key + '-' + lineStyleName] = oldValue;
				newAttrObj[key + '-' + lineStyleName] = lineStyleValue;
			}
			else
			{
				//use default value for dashArray
				oldAttrObj[key + '-' + lineStyleName] = "none";
				newAttrObj[key + '-' + lineStyleName] = lineStyleValue;
			}
		}
		else if(lineStyleName == 'width')
		{
			//update width and dashArray  old dashArray / old lineWidth
			var widthTemp = ele.attrs['stroke-width'];
			var dashTempOld = ele.attrs['dasharray_name'] || ele.attrs['stroke-dasharray'];
			if(dashTempOld && dashTempOld != 'none')
			{
				if(oldLineCap == pres.constants.LINE_CAP_FLAT)
				{
					ele.attrs[key + '-dasharray'] = this.calcDashWithFlatCap(dashTempOld, lineStyleValue, widthTemp);
				}
				else
				{
					ele.attrs[key + '-dasharray'] = this.calcDashWithRoundCap(dashTempOld, lineStyleValue, widthTemp);
				}
			}//end if 
			ele.attrs[key + '-' + lineStyleName] = lineStyleValue;
		}//end if 
		else
		{
			ele.attrs[key + '-'+lineStyleName] = lineStyleValue;
			newAttrObj[key + '-' + lineStyleName] = lineStyleValue;
			if (oldformatDouble != null && oldformatDouble != undefined)
			{
				oldAttrObj[key + '-'+lineStyleName] = oldformatDouble;
			}
			else
			{
				//should use default value for linejoin and linecap. like miter and flat
				switch(lineStyleName)
				{
					case 'linejoin':
						oldAttrObj[key + '-' + lineStyleName] = 'miter';
						break;
					case 'linecap':
						oldAttrObj[key + '-'+ lineStyleName] = 'butt';
						break;
					default:
						oldAttrObj[key + '-'+ lineStyleName] = 1;
						break;
				}
			}
		}
		if(ele.type != "tail" && ele.type != "head")
		{
			ele.attrs['data-line-chg'] = '1';
			newAttrObj['data-line-chg'] = '1';		
		}
	},
	
	// svg parent , arrowEle: obj to change, triangle and so on. arrowPosition: tail or head
	// return value means if need update.
	addOrDelEndpoint : function(svg, arrowEle, arrowKind, arrowPosition, drawType)
	{
		if(!svg || !arrowPosition ||!arrowKind)
			return;		
	
		var linemodel = svg.line;
		//arrow is null , need to add arrow to svg element.
		if(arrowEle && arrowKind != arrowEle.attrs["kind"])//arrow exits just change arrow 
		{
			if(arrowKind == "none")
			{
				var arrowsArray = svg.arrows;
				if( svg.arrows.indexOf(arrowEle) < svg.arrows.length-1)
					svg.arrows.reverse();
				var nodeToDel = arrowsArray[arrowsArray.length - 1].id;
				arrowsArray.pop();
			}
			else
			{
				this.setEndpointType(arrowEle , arrowKind, svg);
			}
			linemodel.attrs['data-line-chg'] = '1';
			return true;
		}
		else if(!arrowEle )
		{
			if(arrowKind != "none")
			{
				var arrows = svg.arrows? svg.arrows:(svg.arrows = []);
				var arrow = new pres.model.ShapeArrow();
				arrow.id =   pres.utils.helper.getUUID('svg_' + arrowPosition + '_end_id_');
				arrows.push(arrow);
				arrow.parent = svg;

				//arrowKind
				var lineWidth = svg.line.attr('stroke-width');
				var lineWidthInEMU = parseFloat(lineWidth) * pres.constants.PT_TO_EMU_FACTOR;
				var tailArrowLength = 0;
				var headArrowLength = 0;
				var length = this._getArrowEndToLineEndDistance(lineWidthInEMU, arrowKind);
				var isNeedUpdateHeadPath = false;
				var isNeedUpdateTailPath = false;
				if (arrowPosition == 'head') {
				  headArrowLength = length;
				  isNeedUpdateHeadPath = this.isNeedUpdateLinePathList(lineWidthInEMU, arrowKind);
				} else {
				  tailArrowLength = length;
				  isNeedUpdateTailPath = this.isNeedUpdateLinePathList(lineWidthInEMU, arrowKind);
				}
			  var pathLst =  this.getPathList(svg.frm, svg.av, drawType);
		   
				var headTailBasePoint = this.calcHeadTailAndUpdatePathLst(pathLst, arrowPosition, isNeedUpdateHeadPath, isNeedUpdateTailPath, headArrowLength, tailArrowLength);
				svg.path = pathLst;
				this._createShapeArrowModel(arrow, arrowPosition, headTailBasePoint, arrowKind);
				this.setEndpointType(arrow , arrowKind, svg);
				linemodel.attrs['data-line-chg'] = '1';
				return true ;
			}
			else
				return false;
		}
	},

	shapeCalcWithNewAttr: function(box, resizeHandlerName)
	{
		var element = box.element;
		if (element && element.family == 'group' && element.svg)
		{
			var wrapperCoords = dojo.coords(dojo.query('.resize-wrapper', box.domNode)[0]);
      if (element.attr("draw_type") != "customShapeType") {
         element.updateShapeSize(wrapperCoords);
       }
			if (pres.utils.shapeUtil.isConnectorShape(element))
			{
				box.coords = dojo.coords(box.domNode);
				box.sePoint = null;
			}
			else
			{ // normal shape
				box.wrapperCoords = dojo.coords(dojo.query('.resize-wrapper', box.domNode)[0]);
				
				//Some shapes' AdjustHandlerPos will change after resize 
				box.updateAdjustHandlerPos();
			}
		}
	},

	setEndpointType : function(strokeEle, lineStyleValue, svgObj)
	{
		if (!strokeEle || !lineStyleValue || !svgObj)
			return;		
		// Per conversion logic
		// TRIANGLE, DIAMONG and STEALTH will be set as "stroke:none;fill:realColor;stroke-linejoin:miter"
		// OVAL will be set as "stroke:none;fill:realColor;" without stroke-linejoin and stroke-linecap
		// ARROW will be set as "stroke:realColor;fill:none;stroke-linecap:round"
		// So per above, change arrow stroke or fill when change border color
		switch(lineStyleValue)
		{
			case 'triangle':
			case 'diamond':	
			case 'stealth':		
				strokeEle.attrs['kind'] = lineStyleValue;
				strokeEle.attrs['fill'] = svgObj.line.attrs['stroke'];
				strokeEle.path = strokeEle.path || 'need update';
				strokeEle.attrs['stroke-linejoin'] = 'miter';
				strokeEle.attrs['stroke'] = 'none';
//				strokeEle.attrs['data-arrow-chg'] = 1;
				delete strokeEle.attrs['stroke-linecap'];
				delete strokeEle.attrs['stroke-width'];
				delete strokeEle.attrs['cx'];
				delete strokeEle.attrs['cy'];
				delete strokeEle.circle;
				break;
			case 'oval':
				strokeEle.attrs['fill'] = svgObj.line.attrs['stroke'];
				strokeEle.attrs['kind'] = 'oval';
				strokeEle.circle = 1;
				strokeEle.attrs['stroke'] = 'none';
//				strokeEle.attrs['data-arrow-chg'] = 1;
				delete strokeEle.attrs['stroke-linecap'];
				delete strokeEle.attrs['stroke-linejoin'];
				delete strokeEle.attrs['stroke-width'];
				delete strokeEle.path;
				break;
			case 'arrow':
				strokeEle.attrs['kind'] = 'arrow';
				strokeEle.attrs['stroke-width'] = svgObj.line.attrs['stroke-width'];
				strokeEle.attrs['fill'] = 'none';
				strokeEle.attrs['stroke'] = svgObj.line.attrs['stroke'];
				strokeEle.path = strokeEle.path || 'need update';
				strokeEle.attrs['stroke-linecap']= 'round';
//				strokeEle.attrs['data-arrow-chg'] = 1;
				delete strokeEle.attrs['cx'];
				delete strokeEle.attrs['cy'];
				delete strokeEle.attrs['stroke-linejoin'];
				delete strokeEle.circle;
				break;
			case 'none':
				delete strokeEle;
				break;
		}
	},
	/**
	 * Set shape fill or line color
	 * 
	 * @param node:
	 *            the node conataining color attr
	 * @param color:
	 *            the color to be set
	 * @param key:
	 *            fill or stroke
	 * @param oldAttrObj
	 * @param newAttrObj
	 */
	setGroupLineFillColor: function(ele, color, key, oldAttrObj, newAttrObj)
	{
		if (!ele || !color || !key || !oldAttrObj || !newAttrObj)
			return;
		// If the value suffixed with "_upd", remove it
		// Or server will apply it to the ref place
		// But actually defs id is still not with the suffix
		// It is a temporary tag only for slide editor object
		// when client apply the message in coediting, refresh will called
		var oldColor = null, oldChanged = null;
		oldColor = ele.attrs[key];
		oldColor = oldColor.replace('_upd', '');
		oldOpacity = ele.attrs[key + '-opacity'];
		oldChanged = ele.attrs['data-' + key + '-chg'];

		// Local Model change
		ele.attrs[key] = color;
		// Add an attr to indicate line is change by editor
		// CL will convert pattern line as #FFFFFF
		// So we can simply convert color into solid line in CL
		// to preserve pattern line. So need a flag
		// Use html5 prefix "data-" to avoid browser filter it
		if (!oldChanged)
			ele.attrs['data-' + key + '-chg'] = '1';

		oldAttrObj[key] = oldColor;
		newAttrObj[key] = color;
		if (!oldChanged)
		{
			oldAttrObj['data-' + key + '-chg'] = '';
			newAttrObj['data-' + key + '-chg'] = '1';
		}
	},
	updateViewSize: function(element, eleDom, fromThumbnail)
	{
		this.updateViewLinePath(element, eleDom);
		this.updateViewFillPath(element, eleDom, fromThumbnail);
		this.updateViewHeadArrowPath(element, eleDom, 'head');
		this.updateViewHeadArrowPath(element, eleDom, 'tail');
		this.updateViewRect(element, eleDom);
		this.updateViewCircle(element, eleDom);
		this.updateTextRect(element, eleDom);
		this.updateWrapperPos(element, eleDom);
		this.updateRotateFlip(element, eleDom);
		this.updateModelPos(element, eleDom);
	},

	isConnectorShape: function(shapeElem)
	{
		if (!shapeElem)
			return false;
		return this.connectorShapeTypes[shapeElem.attr('draw_type')] == 1;
	},

	isNormalShape: function(shapeElem)
	{
		if (!shapeElem)
			return false;
		var drawType = shapeElem.attr('draw_type');
		return (drawType !== null && drawType !== undefined) && this.connectorShapeTypes[drawType] !== 1;
	},

	isShape: function(shapeElem)
	{
		if (!shapeElem)
			return false;
		var drawType = shapeElem.attr('draw_type');
		return (drawType !== null && drawType !== undefined);
	},

	isConnectorShapeUI: function(shapeTypeUI)
	{
		if (!shapeTypeUI)
			return false;
		return this.connectorShapeTypes[pres.constants.SHAPE_TYPES[shapeTypeUI]] == 1;
	},
	
	//add arrowKind parameter, use this function to create new arrow model after change endpoints.
	_createShapeArrowModel: function(arrow, type, headTailBasePoint, arrowKind)
	{
		if (!arrow || !type || !headTailBasePoint)
			return;
		// default linecap in office is round .
		arrow.type = type;
		arrow.attrs = {
			stroke: '#3a5f8b',
			fill: 'none',
			'stroke-width': '1',
			'stroke-dasharray': 'none',
			'stroke-linecap': 'round',
			kind: 'arrow'
		};
		arrowKind && (arrow.attrs['kind'] = arrowKind);
		var path = pres.utils.shapeUtil.calcArrowPathFromGuide(headTailBasePoint, false, pres.constants.PT_TO_EMU_FACTOR, type, arrow.attrs['kind']);
		if (path)
			arrow.path = path;
	},

	createShapeModel: function(slide, params)
	{
		if (!params || !params.type || !params.pos)
			return null;

		// Construct model
		var helper = pres.utils.helper;
		var c = pres.constants;

		// Shape element
		var shapeElem = new pres.model.ShapeElement();
		shapeElem.parent = slide;
		shapeElem.isNotes = false;
		shapeElem.family = 'group';
		var shapeType = c.SHAPE_TYPES[params.type];

		// Calculate path and set into model
		// SVG shape
		var svg = shapeElem.svg = new pres.model.ShapeSvg();
		svg.parent = shapeElem;
		svg.shapeVersion = "1.6";

		// frame
		var cmToEMU = c.CM_TO_EMU_FACTOR;
		var cmL = helper.px2cm(params.pos.l);
		var cmT = helper.px2cm(params.pos.t);
		var cmH = params.pos.h ? helper.px2cm(params.pos.h) : c.DEFAULT_SHAPE_HEIGHT;	
		var cmW = params.pos.w ? helper.px2cm(params.pos.w) : (c.SHAPE_DEFAULT_RATIO[params.type] || 1)*cmH;
		svg.frm = {
			l: cmL * cmToEMU,
			t: cmT * cmToEMU,
			w: cmW * cmToEMU,
			h: cmH * cmToEMU
		};

		// path
		var pathObj = this.calcPathFromGuide(svg.frm, null, shapeType);
		if (pathObj && pathObj.path)
			svg.path = pathObj.path;
		if (pathObj && pathObj.cpath)
		{
			svg.cpath = pathObj.cpath;
			// set an empty cp. Id will be set later
			svg.prop = {
				cp: {}
			};
		}

		// fill-line-arrow
		var line = svg.line = new pres.model.ShapeLine();
		line.parent = svg;
		var miterLimitValue = this._getStrokeMiterLimitValue();
		line.attrs = {
			stroke: '#3a5f8b',
			fill: 'none',
			'data-stroke-chg': '1',
			'stroke-width': '1',
			'stroke-dasharray': 'none',
			'stroke-linecap': 'butt',
			'stroke-linejoin': 'miter',
			'stroke-miterlimit': miterLimitValue
		};

		// view box calcualtion for new created shape
		var body = svg.setViewBox(pathObj && pathObj.pathLst),
			viewBox = body.shapeBody, pathBody = body.pathBody;
		var fill = svg.fill = new pres.model.ShapeFill();
		fill.parent = svg;
		fill.type = 'rect';
		var fillColor = (this.initNoFillShapeTypes.indexOf(shapeType) == -1) ? '#4F81BD' : 'none';
		var emuToPt = c.PT_TO_EMU_FACTOR;
		fill.attrs = {
			stroke: 'none',
			fill: fillColor,
			'data-fill-chg': '1',
			x: (pathBody.frameLeft / emuToPt).toFixed(2),
			y: (pathBody.frameTop / emuToPt).toFixed(2),
			width: ((pathBody.frameRight - pathBody.frameLeft) / emuToPt).toFixed(2),
			height: ((pathBody.frameBottom - pathBody.frameTop) / emuToPt).toFixed(2)
		};

		// updated svg gap
		// Till now, view box position is related to svg frame
		// so make it to be related to slide editor
		viewBox.frameLeft += svg.frm.l;
		viewBox.frameTop += svg.frm.t;
		viewBox.frameRight += svg.frm.l;
		viewBox.frameBottom += svg.frm.t;
		svg.gap = {
			l: svg.frm.l - viewBox.frameLeft,
			t: svg.frm.t - viewBox.frameTop,
			r: viewBox.frameRight - (svg.frm.l + svg.frm.w),
			b: viewBox.frameBottom - (svg.frm.t + svg.frm.h)
		};

		// Shape element position
		shapeElem.l = cmL - (svg.gap.l / cmToEMU);
		shapeElem.t = cmT - (svg.gap.t / cmToEMU);
		shapeElem.w = cmW + ((svg.gap.r + svg.gap.l) / cmToEMU);
		shapeElem.h = cmH + ((svg.gap.t + svg.gap.b) / cmToEMU);
		shapeElem.z = 0;
		shapeElem.attrs = {
			draw_type: shapeType,
			style: shapeElem.getPositionStyle(),
			'class': 'draw_frame draw_custom-shape boxContainer shape_svg newbox bc',
			presentation_class: 'group',
			draw_layer: 'layout',
			ungroupable: 'no',
			contentboxtype: 'drawing',
			'text_anchor-type': 'paragraph'
		};

		// text box
		// set position info
		if (pathObj && pathObj.txtRect)
		{
			var txtBox = shapeElem.txtBox = new pres.model.Element();
			var textRect = pathObj.txtRect;
			// unit is EMU and related to frame
			// should change it to be related to outer div
			txtBox.l = (textRect.l + svg.gap.l) / cmToEMU;
			txtBox.t = (textRect.t + svg.gap.t) / cmToEMU;
			txtBox.w = (textRect.r - textRect.l) / cmToEMU;
			txtBox.h = (textRect.b - textRect.t) / cmToEMU;
			// set other properties
			// zIndex need be set bigger than 0(the default wrapper z index)
			// If no, when edit mode, wrapper will overlap text area
			// when clicking on text area, edit mode will be exited
			txtBox.z = 1;
			txtBox.parent = shapeElem;
			txtBox.isNotes = false;
			txtBox.family = 'outline';
			txtBox.attrs = {
				presentation_class: 'outline',
				presentation_placeholder: 'true',
				'text_anchor-type': 'paragraph',
				draw_layer: 'layout',
				style: txtBox.getPositionStyle(),
				'class': 'g_draw_frame boxContainer'
			};
			txtBox.id = pres.utils.helper.getUUID();
			var textContent = '<div role="textbox" style="position:relative;top:0%;left:0%;width:100%;height:100%;" class="draw_text-box contentBoxDataNode" tabindex="0"><div style="display:table; height:100%; width:100%; table-layout:fixed;"><div class="draw_shape_classes" style="display:table-cell;width:100%;height:100%;vertical-align:middle;word-wrap:break-word;"><p style="text-align:center;margin-top:0%;margin-bottom:0%;margin-left:0%;" class="text_p"><span style="%DEFAULTSTYLE% color:#FFFFFF">&#8203</span></p></div></div></div>';
			txtBox.content = textContent.replace("%DEFAULTSTYLE%", pe.scene.doc.defaultTextStyle);
		}

		// Title
		var shapeStrs = dojo.i18n.getLocalization("concord.widgets", "shapeGallery");
		var dispType = shapeStrs[params.type];
		if (dispType)
			svg.title = dispType;

		// Finally set Ids for shape
		helper.setIDToShape(shapeElem, true);

		return shapeElem;
	},
	/**
	 * Get stroke-miterlimit value. When the limit is exceeded, the join is converted from a miter to a bevel.
	 * The ratio of miter length (distance between the outer tip and the inner corner of the miter) to stroke-width is directly related to 
	 * the angle (theta) between the segments in user space by the formula:
	 *  miterLength / stroke-width = 1 / sin ( theta / 2 )
	 *  For example, a miter limit of 1.414 converts miters to bevels for theta less than 90 degrees, a limit of 4.0 converts them for theta less than approximately 29 degrees, 
	 *  and a limit of 10.0 converts them for theta less than approximately 11.5 degrees.
	 *  
	 *  We want show smallest angle is 2 degree, then we set stroke-miterlimit to 1/sin(2/2 degree) = 60
	 *  If we want to dynamiclly set this value, it can use above formula to compute.
	 */
 _getStrokeMiterLimitValue: function() {
   return 60;
 },
	_getConnectorDir: function(pos)
	{
		// Get line dir from position
		// +x axis, 1st quadrant, +Y axis, 2nd quadrant
		// -x axis, 3rd quadrant, -Y axis, 4th quadrant
		// Origin point
		if (pos.endX > pos.startX && pos.endY == pos.startY)
		{
			return 0;
		}
		else if (pos.endX > pos.startX && pos.endY > pos.startY)
		{
			return 1;
		}
		else if (pos.endX == pos.startX && pos.endY > pos.startY)
		{
			return 2;
		}
		else if (pos.endX < pos.startX && pos.endY > pos.startY)
		{
			return 3;
		}
		else if (pos.endX < pos.startX && pos.endY == pos.startY)
		{
			return 4;
		}
		else if (pos.endX < pos.startX && pos.endY < pos.startY)
		{
			return 5;
		}
		else if (pos.endX == pos.startX && pos.endY < pos.startY)
		{
			return 6;
		}
		else if (pos.endX > pos.startX && pos.endY < pos.startY)
		{
			return 7;
		}
		else
		{
			return 1; // orig point, take it as 1
		}
	},

	fixShapeIds: function(shape)
	{
		if (!shape)
			return;
		var svgNode = dojo.query('svg', shape)[0];
		if (!svgNode)
			return;

		// check num
		var num = svgNode.childNodes.length;
		if (num < 2)
			return;

		// get node for <defs> group
		var defGroupNode = svgNode.childNodes[0];
		if (defGroupNode.tagName != "g")
			return;
		if (dojo.attr(defGroupNode, "groupfor") != "defs")
			return;

		// shape fix
		var prefix = pres.constants.SHAPE_ID_FIX_PREFIX;
		var suffix = pres.constants.SHAPE_ID_FIX_SUFFIX;
		var finalFix = pres.utils.helper.getUUID(prefix) + suffix;
		for ( var i = 0; i < defGroupNode.childNodes.length; ++i)
		{
			var defNode = defGroupNode.childNodes[i];
			if (defNode.childNodes.length != 1)
				continue;

			var subDef = defNode.childNodes[0];
			if (subDef.id)
			{
				var oldFix = null;
				var preIdx = subDef.id.indexOf(prefix);
				if (preIdx >= 0)
				{
					var sufIdx = subDef.id.indexOf(suffix);
					if (sufIdx >= 0)
					{
						oldFix = subDef.id.substring(preIdx, sufIdx + suffix.length);
					}
				}
				if (oldFix)
					subDef.id = subDef.id.replace(oldFix, finalFix);
				else
					subDef.id = subDef.id + finalFix;
			}
		} // end for

		// get node for <group>
		var grpNode = svgNode.childNodes[1];
		if (dojo.attr(grpNode, "groupfor") != "fill-line-arrow")
			return;

		for ( var j = 0; j < grpNode.childNodes.length; ++j)
		{
			var subGrp = grpNode.childNodes[j];
			var subGrpFor = dojo.attr(subGrp, "groupfor");

			if (subGrpFor == "fill")
			{
				// clipPath, fill
				for ( var i = 0; i < subGrp.childNodes.length; ++i)
				{
					var subNode = subGrp.childNodes[i];

					// clipPath
					var curClipPath = dojo.attr(subNode, "clip-path");
					if (curClipPath && (curClipPath.indexOf("url(#") == 0))
					{
						var newValue = this._addUpdForIdRef(curClipPath, finalFix);
						dojo.attr(subNode, "clip-path", newValue);
					}

					// fill
					var curFill = dojo.attr(subNode, "fill");
					if (curFill && (curFill.indexOf("url(#") == 0))
					{
						var newValue = this._addUpdForIdRef(curFill, finalFix);
						dojo.attr(subNode, "fill", newValue);
					}
				} // end for

			}
			else if ((subGrpFor == "line") || (subGrpFor == "arrow"))
			{
				// stroke, fill
				for ( var i = 0; i < subGrp.childNodes.length; ++i)
				{
					var subNode = subGrp.childNodes[i];

					// fill for some types of arrow
					var curFill = dojo.attr(subNode, "fill");
					if (curFill && (curFill.indexOf("url(#") == 0))
					{
						var newValue = this._addUpdForIdRef(curFill, finalFix);
						dojo.attr(subNode, "fill", newValue);
					}

					// stroke
					var curStroke = dojo.attr(subNode, "stroke");
					if (curStroke && (curStroke.indexOf("url(#") == 0))
					{
						var newValue = this._addUpdForIdRef(curStroke, finalFix);
						dojo.attr(subNode, "stroke", newValue);
					}
				} // end for
			}
		}
	},
	
	_addUpdForIdRef: function(value, finalFix)
	{
		var result = null;
		var start = value.indexOf('url(#');
		var end = value.indexOf(')');
		if (start >= 0 && end > 0)
		{
			value = value.slice(start + 5, end);
			var prefix = pres.constants.SHAPE_ID_FIX_PREFIX;
			var suffix = pres.constants.SHAPE_ID_FIX_SUFFIX;
			
			var oldFix = null;
			var preIdx = value.indexOf(prefix);
			if (preIdx >= 0)
			{
				var sufIdx = value.indexOf(suffix);
				if (sufIdx >= 0)
				{
					oldFix = value.substring(preIdx, sufIdx + suffix.length);
				}
			}
			if (oldFix)
				value = value.replace(oldFix, finalFix);
			else
				value = value + finalFix;
			
			result = "url(#" + value + ")";
		}
		else
		{
			result = value;
		}
		return result;
	},
	
	fixDomShapeIds: function(dom)
	{
		if (dojo.isIE || !dom || dojo.isEdge)
			return;

		var shapes = dojo.query('div[presentation_class="group"]', dom);
		for ( var i = 0, count = shapes.length; i < count; i++)
		{
			var drawType = dojo.attr(shapes[i], 'draw_type');
			if (drawType !== null && drawType !== undefined)
				this.fixShapeIds(shapes[i]);
		}
	},
	
	parseTransformStyle: function(tranStyle)
	{
		var ret = {rot:0, scaleX:1, scaleY:1};
		if(!tranStyle)
			return ret;
		
		tranStyle = tranStyle.replace(/ /g, "");
		
		var degResult = /rotate\((-?[\d\.]+)deg\)/.exec(tranStyle);
		if(degResult)
		{
			ret.rot = parseFloat(degResult[1]);
			ret.rot = (ret.rot%360+360)%360;
		}
		
		if(tranStyle.indexOf("scaleX(-1)") >= 0)
			ret.scaleX = -1;
		if(tranStyle.indexOf("scaleY(-1)") >= 0)
			ret.scaleY = -1;
			
		var scaleResult1 = /scale\((-?1),(-?1)\)/.exec(tranStyle);
		if(scaleResult1)
		{
			ret.scaleX = parseInt(scaleResult1[1]);
			ret.scaleY = parseInt(scaleResult1[2]);				
		}
		else 
		{
			var scaleResult2 = /scale\((-?1)\)/.exec(tranStyle);
			if(scaleResult2)
			{
				ret.scaleX = parseInt(scaleResult2[1]);
				ret.scaleY = parseInt(scaleResult2[1]);
			}
		}
		
		return ret;
	},
	
	getTransformStyle: function(trans)
	{
		var rot = (trans.rot%360+360)%360;
		var newTrans = rot ? "rotate(" + (rot) + "deg)" : "";
		if (trans.scaleX !== 0 || trans.scaleY !== 0)
			newTrans += "scale(" + trans.scaleX + "," + trans.scaleY + ")";
		
		return newTrans;
	}
};
