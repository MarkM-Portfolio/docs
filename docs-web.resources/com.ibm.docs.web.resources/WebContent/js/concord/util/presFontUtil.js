dojo.provide("concord.util.presFontUtil");
dojo.declare("concord.util.presFontUtil", null, {

/**Set font size when super/sub script
 * @param node: a span ck node
 * @param isMultipler: multiply or divide 0.58
 */
applyVerticalAlignFontSizeToElement: function(node, isMultipler) {
	// Set new font size when removing super/sub script
	var ckNode = PresCKUtil.ChangeToCKNode(node);
	var ptFontSize = PresCKUtil.getAbsoluteValue(ckNode,PresConstants.ABS_STYLES.FONTSIZE);
	if (isMultipler)
		ptFontSize = dojo.number.round(ptFontSize * 0.58, 0);
	else
		ptFontSize = dojo.number.round(ptFontSize / 0.58, 0);
	PresCKUtil.setCustomStyle(ckNode, PresConstants.ABS_STYLES.FONTSIZE, ptFontSize);
	ckNode.setStyle('font-size',parseFloat(ptFontSize) / 18.0 + 'em');
},

//apply's font size to an element
applyFontSizeToElement: function(element, fontSizeInEM, fontSizeInPt){
	PresCKUtil.setCustomStyle(element,PresConstants.ABS_STYLES.FONTSIZE,fontSizeInPt);
	PresCKUtil.updateRelativeValue(element, [PresConstants.ABS_STYLES.FONTSIZE]);
},

//removes font size from element
removeFontSizeFromElement:  function(element){
	if(!element)
		return;
	
	var elm = element;
	if(elm.$)
		elm = elm.$;
	
	 dojo.style(elm, 'fontSize', '1em');
	 dojo.removeAttr(elm,'pfs');

},

//queries all paragraphs in the element and recalculates their respective font sizes in em
updateParagraphFontSize:  function(element, rmIndentChanged){
	if(!element)
		return;

	var updateElms = dojo.query('p', element);
	if (PresCKUtil.checkNodeName(element, 'p')) {
		var self = [element];
		updateElms = self.concat(updateElms);
	}
	for (i = 0; i < updateElms.length; i++) {
		child = updateElms[i];
		var fontSizeInPt = dojo.attr(child, 'pfs');
		// Also fontSizeUpdatedTo can be set to update p font size
		if (!fontSizeInPt) {
			fontSizeInPt = dojo.attr(child, 'fontSizeUpdatedTo');
			if (fontSizeInPt) {
				dojo.removeAttr(child, 'fontSizeUpdatedTo');
				dojo.attr(child, 'pfs', fontSizeInPt);
			}
		}
		if (fontSizeInPt) {
			var fontSizeInEm = PresFontUtil.getCalcEmFromPt(fontSizeInPt, [child]);
			child.style.fontSize = fontSizeInEm;
		}
		if (rmIndentChanged)
			dojo.removeAttr(child, 'indentationChanged');
	}
},

/*
 * For any given font size in pts this function will give you the next font size up. 
 * If the font size passed in matches a pre-defined value, it will get the next pre-defiend 
 * font value. If it doesn't, it will calculate up to the next 11.11% and round it to the 
 * nearest integer. When decreasing, use the reverse function for increase.
 * If the newly calculated fontsize is less than 0 or greater than 200 the
 * original font size is returned. 
 */
getNextFontSize:  function(ftSizeInPt, goUp){
	if(!ftSizeInPt)
		return;
	
	if(ftSizeInPt == 0)
		return 0;
	
	ftSizeInPt = parseFloat(ftSizeInPt);
	
	var fontSizes = window.pe.scene.slideSorter.editor.fontSizeList;
	
	 var newFtSize;
	
	 // if the font size is between 6 and 96 use the drop down to find the next value
	 if(ftSizeInPt >6 && ftSizeInPt <96){
		 var ftIdx = dojo.indexOf(fontSizes,ftSizeInPt);
		 if(ftIdx > -1){
			 //find the next font size in the list of predefined font sizes
			 if(goUp == false){
				 newFtSize = parseFloat(fontSizes[ftIdx-1]);
			 }else{
				 newFtSize = parseFloat(fontSizes[ftIdx+1]);
			 }
			 			 
		 }else{
			 for (var i=1; i<(fontSizes.length); i++){
				 if(ftSizeInPt > fontSizes[i-1] && ftSizeInPt < fontSizes[i]){
					 if(goUp == false){
						 // if the font size show value equals to fontSizes[i-1]
						 // then use the fontSizes[i-2]
						 if ((ftSizeInPt < (fontSizes[i-1]+0.5)) && (i > 1)){
							 newFtSize = parseFloat(fontSizes[i-2]);
						 }else{
							 newFtSize = parseFloat(fontSizes[i-1]);
						 }
					 }else{
						 // if the font size show value equals to fontSizes[i]
						 // then use the fontSizes[i+1]
						 if ((ftSizeInPt >= (fontSizes[i] - 0.5)) && (i < (fontSizes.length - 1))) {
							 newFtSize = parseFloat(fontSizes[i+1]);
						 }else{
							 newFtSize = parseFloat(fontSizes[i]);
						 }
					 }
					 
					 break;
				 }
			 }
		 }
	 }else{ // else the next font size will be 11.11% of the original.
	     var pctInc = 11.11;
		 
        if(goUp == false){
            // When decrease, use a reverse function for increase
            // to keep consistency. Due to round handling
            // , there will be error(about 1)
            newFtSize = ftSizeInPt / (1 + pctInc/100);
        } else {
            newFtSize = (ftSizeInPt + ((ftSizeInPt * pctInc)/100));
        }
		 
        newFtSize = dojo.number.round(newFtSize,0);
	 }
	 
	 //if the new font size is less than 5 and it is the same as the original one adjust it
	 if(newFtSize < 5 && newFtSize == ftSizeInPt){
		 if(goUp == false){
			 newFtSize = newFtSize - 1;
		 }else{
			 newFtSize = newFtSize + 1;
		 }
	 }
	 
	 // we don't want font size below 0 and above 200
	 if(newFtSize < 0 )
		 newFtSize = 0;
	 else if(newFtSize > 200)
		 newFtSize = 200;
	 
	 return newFtSize;
	
},

//CK3621
// reusable function definition
/*
 * Gets the relative font size of the specified 'node'
 * If 'dir' is true, we recursively process the first child of the 'node'.
 * If 'dir' is false, we recursively process the parent of the 'node'
 * (until we reach the 'limit' node).
 */
getRelativeFontSize: function( node, dir, limit ) {
	if ( !node )
		return 1; // assume 1 em
	var relfs = node.getStyle ? node.getStyle( 'font-size' ) : '';
	// this only handles 'em'-based font sizes
	if ( relfs && relfs.indexOf( 'em' ) >= 0 )
		relfs = relfs.substring( 0, relfs.indexOf( 'em' ) ) * 1;
	else
		relfs = 1; // unspecified or unknown format. assume 1 em
	
	if ( node.equals( limit ) )
		return relfs;
	
	var newNode = dir ? ( node.getFirst ? node.getFirst() : null ) : node.getParent();
	if ( dir && newNode && newNode.is && newNode.is( 'span' ) && newNode.getChildCount() == 0 ) {
		var tmp = newNode.getNext();
		newNode.remove();
		newNode = tmp;
	}
	return relfs * PresFontUtil.getRelativeFontSize( newNode, dir, limit );
},

/*
 * Simple utility function to convert string to a Proper case string. So 
 * something like "ibm docs is great" would get converted to "Ibm Docs Is Great".
 */
toProperCase: function(str){
	str = str.replace(/\w\S*/g, function(txt){
		return txt.substring(0,1).toUpperCase() + txt.substring(1).toLowerCase();
	});
	return str;
},


/*
 * Simple utility function to convert font size in a string to a float
 */
_stripPxFromFontSize: function(fontSize){
	fontSize = parseFloat(fontSize);
	return fontSize;
},


/*
 * Simple utility function to convert font size in a string to a float
 */
_stripEmFromFontSize: function(fontSize){
	fontSize = parseFloat(fontSize);
	return fontSize;
},


/*
 * This function figures out what the font value in EM needs to be to get to the desired font size
 * in Pts
 */

_getTargetEmValue: function(compFontSize, targetfontSize){
	return (targetfontSize/compFontSize);
},

/*
 * Based on the font size in pixels for 18pts, the following function will figure out 
 * what the pixel value is for the user selected font size in the CKEditor dropdown. 
*/

_getFontSizeInPxForPtValue: function(dropDownFontSize, FontSizeFor18Pts){
	return ((dropDownFontSize * FontSizeFor18Pts)/18);
},

/*
 * This function will take a node and calculate the existing font size is in pt
 */
getCalcPtFromPx: function(pxValue){
	//get font size for 18pts which will be the basis for our calculations
	var slideEditor = dojo.query('.slideEditor')[0];
	var fontSizeFor18Pts = dojo.style(slideEditor,'fontSize');
	fontSizeFor18Pts = PresFontUtil._stripPxFromFontSize(fontSizeFor18Pts);

	var ptValue =  (pxValue * 18)/fontSizeFor18Pts;
	
	return ptValue;
},

/*
 * This function will return the pt size font for a given node
 * Get self of parent pfs first. If failed, calculate it
 */
getPtFontSize: function(node){
	//Wangzhe>>>>====================
	return PresCKUtil.getAbsoluteValue(node,PresConstants.ABS_STYLES.FONTSIZE);
//	if(!node) return NaN;
//	node = node.$ ? node.$ : node;
//	var finalFontSize = null;
//	// Get self or parent pfs
//	var tempNode = node;
//	while (tempNode != null){
//		finalFontSize = dojo.attr(tempNode,'pfs');
//		if(finalFontSize || PresCKUtil.checkNodeName(tempNode, 'body'))
//			break;
//		tempNode = tempNode.parentNode;
//	}
//	// Todo(lijiany): remove below part when all pfs is ready
//	// Get calculated font size
//	// !finalFontSize mean null, undefined and ''
//	if (!finalFontSize || finalFontSize == 'null' || finalFontSize == 'undefined') {
//		console.log("!!!!!!!!!!!!Absolute presentation font size is not found or is 'null'/'undefined' !!!!!!!!!!!");
//		var compFontSize =  dojo.getComputedStyle(node).fontSize;
//		finalFontSize = PresFontUtil.getCalcPtFromPx(parseFloat(compFontSize));
//		// if the font size is between 10.25 and 10.75, it is likely 10.5. Use this special case
//		// to supprot font size of 10.5
//		if(finalFontSize > 10.25 && finalFontSize < 10.75)
//			finalFontSize = 10.5;
//		else
//			finalFontSize = dojo.number.round(finalFontSize,0);
//	} else
//		finalFontSize *= 1;
//
//	return finalFontSize;
	//<<<<======================================
},

/*
 * This function will return the pt size font for a given node
 */
getPtFontSizeOld: function(node, notCheckFontSizeInPts){
	var compFontSize =  dojo.getComputedStyle(node).fontSize;
	var fontSizeInPt = PresFontUtil.getCalcPtFromPx(parseFloat(compFontSize));
	// Todo(lijiany): remove "notCheckFontSizeInPts" and below block when fontSizeInPts is ready
	//D23669: [Chrome][Safari]Set text font-size to 96, de-select then re-select the text, then the font size change to 95.
	if (node.hasAttribute('pfs') && dojo.isWebKit && !notCheckFontSizeInPts){
		var tmpnewFts = node.getAttribute('pfs');
		if(tmpnewFts.indexOf('em')<0){
			fontSizeInPt = tmpnewFts;
		}
		tmpnewFts = null;
	}
	//14853: [Textbox][Firefox]Font size not reflected or wrong when entering text in textbox
	var nodeAttrFontSizeInPts;
	
	var tempNode = node;
	while (tempNode.parentNode!=null){

		nodeAttrFontSizeInPts = dojo.attr(tempNode,'pfs');
		
		if(nodeAttrFontSizeInPts && nodeAttrFontSizeInPts !=''){
			break;
		}
		
		if (tempNode.nodeName.toLowerCase()=='body'){
			break;
		}
		tempNode = tempNode.parentNode;		
	}	
	
	var finalFontSize;
	// check to see if font size is within the margin of error of +/-1
	if(nodeAttrFontSizeInPts && nodeAttrFontSizeInPts > (fontSizeInPt - 1) && nodeAttrFontSizeInPts < (fontSizeInPt + 1))
		finalFontSize = nodeAttrFontSizeInPts;
	else 
		finalFontSize = fontSizeInPt;
	
	// if the font size is between 10.25 and 10.75, it is likely 10.5. Use this special case
	// to supprot font size of 10.5
	if(finalFontSize > 10.25 && finalFontSize < 10.75)
	{
		return 10.5;
	}
	else
	{
		return dojo.number.round(fontSizeInPt,0);		
	}
},


/*
 * This function will return the font family for the given node
 */
getFontFamily: function(node){
	//debugger;
	var compFontFamily =  (dojo.isIE && dojo.isIE < 9) ? dojo.style(node,'fontFamily') : dojo.getComputedStyle(node).fontFamily;
	compFontFamily = PresFontUtil.cleanQuotes(compFontFamily);
	return compFontFamily;
},

cleanQuotes: function(stringVal){
	if(stringVal!=null){ //clean the pair of quotes in the beginning and end
		if((stringVal.indexOf("'")==0 && stringVal.indexOf("'", stringVal.length - 1) != -1)) {
			stringVal = stringVal.replace(/^'/g, "").replace(/'$/g, "").replace(/','/g,",");
			
		}else if(stringVal.indexOf('"')==0 && stringVal.indexOf('"', stringVal.length - 1) != -1){
			stringVal = stringVal.replace(/^"/g, "").replace(/"$/g, "").replace(/','/g,",");
		}
	}
	return stringVal;
	
},

convertFontsizeToPT: function(fontSize){
	if (!fontSize){
		return;
	}
	if(fontSize.toLowerCase().indexOf('px') != -1){
		var fontSizeInPx = fontSize.toLowerCase().replace('px','');
		fontSize = PresFontUtil.getCalcPtFromPx(fontSizeInPx);
	}else if( fontSize.toLowerCase().indexOf('pt') != -1){
		fontSize = fontSize.toLowerCase().replace('pt','');
	}else if( fontSize.toLowerCase().indexOf('em') != -1){
		fontSize = fontSize.toLowerCase().replace('em','');
		fontSize = parseFloat(fontSize) * 18.0;
	}
	return fontSize;
},

convertFontsizeToEM: function(fontSize){
	if (!fontSize){
		return;
	}
	if( fontSize.toLowerCase().indexOf('em') != -1){
		return fontSize;
	}
	return PresFontUtil.convertFontsizeToPT(fontSize)/18.0 + "em";
},


/*
 * This function will take an array of parent nodes of the current selection, figure out what
 * the existing font size is and then what font size in em needs to be set to get the the 
 * equivalent of the font size selected in the drop down.
 */
getCalcEmFromPt: function(dropDownFontSize, parentNodes, sorterSlideSpec){	
	if (!dropDownFontSize || !parentNodes || parentNodes.length == 0){
		return;
	}
	
	//get font size for 18pts which will be the basis for our calculations
	var fontSizeFor18Pts = null;
	if (sorterSlideSpec)
		fontSizeFor18Pts = sorterSlideSpec;
	else {
		var slideEditor = dojo.query('.slideEditor')[0];
		fontSizeFor18Pts = dojo.style(slideEditor,'fontSize');
		fontSizeFor18Pts = PresFontUtil._stripPxFromFontSize(fontSizeFor18Pts);
	}
	
	
	var fontSizeInEm = [];
	
	for (var i=0; i<parentNodes.length; i++){
		// get the base font size for 18pts from the slide editor
		var compFontSize =  dojo.getComputedStyle(parentNodes[i]).fontSize;
		compFontSize = PresFontUtil._stripPxFromFontSize(compFontSize);
		
		// Calc the font size in px we want to get to 
		var targetfontSize = PresFontUtil._getFontSizeInPxForPtValue(dropDownFontSize, fontSizeFor18Pts);
		
		// calc the font size in em that will get us to the desired equivalent of the pt size passed in to the this function. 
		var calcFontSizeInEm = PresFontUtil._getTargetEmValue(compFontSize, targetfontSize);

		// check and see if the currnet parent node has a font size. If it does, use it as multiplier. 
		var existingFontSize = parentNodes[i].style.fontSize;

		if(existingFontSize){
			existingFontSize = PresFontUtil._stripEmFromFontSize(existingFontSize);
			calcFontSizeInEm = calcFontSizeInEm * existingFontSize;
		}else {
			var currentNode = parentNodes[i].parentNode;
			if (currentNode) { // D26077, currentNode can be null
				// Calculate css font size when there is no inline font size
				// And take it as orig size(the base)
				var parentPxFontSize = dojo.getComputedStyle(currentNode).fontSize;
				parentPxFontSize = PresFontUtil._stripPxFromFontSize(parentPxFontSize);
				existingFontSize = compFontSize / parentPxFontSize;
				calcFontSizeInEm = calcFontSizeInEm * existingFontSize;
			}
		}
		//14853: [Textbox][Firefox]Font size not reflected or wrong when entering text in textbox
		calcFontSizeInEm = dojo.number.round(calcFontSizeInEm,2);
		if(calcFontSizeInEm == 0){
			calcFontSizeInEm = 0.01;
		}
		
		fontSizeInEm.push(calcFontSizeInEm + 'em');
	}
	
	return fontSizeInEm;
}
});
(function(){
    PresFontUtil = new concord.util.presFontUtil();
})();