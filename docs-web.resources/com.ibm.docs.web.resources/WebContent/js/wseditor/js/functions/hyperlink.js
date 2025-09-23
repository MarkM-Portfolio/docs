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

dojo.provide("websheet.functions.hyperlink");

dojo.declare("websheet.functions.hyperlink", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 2;			
	},
	
	toBooleanStr: function(bvalue){
		if(bvalue)
			return "TRUE";
		else 
			return "FALSE";
	},
	/**
	 * Remove the property from the index with length
	 * @param index
	 * @param len
	 */
	remove: function(index, len, container)
	{
		writer.model.text.Hint.prototype.remove(index,len,container);
		writer.model.Hints.prototype.move(index, len, true);
	},
	
	isHyerlinkTop: function(currentToken){
		if(currentToken.getParent() == null)
			return true;
		return false;
	},
	
	/*int*/calc: function(context) {
		var values = this.args;		
		var text;		
		if(values.length==2){
			if(values[1].getType()==this.tokenType.NONE_TOKEN)
				text=0;
			else
				// input "" is valid, and return "", select range, return 0 if has one cell with same column or row
				text= this.fetchScalaResult(values[1],true);			
		}
		
		var link= this.fetchScalaResult(values[0], true, true);	
		var currentCell = context.currentCell;
		if(this.isHyerlinkTop(context.currentToken))
			currentCell.setTmpLink(link);
		
		//if no second param
		if(values.length==1){
			text=link;
		}	
		return text;
	}
});