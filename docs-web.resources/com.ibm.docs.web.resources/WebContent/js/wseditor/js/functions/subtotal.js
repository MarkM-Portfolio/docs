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

/**
subtotal
 Summary: Evaluates a function on a range.
 Syntax: SUBTOTAL( Integer function ; NumberSequence sequence )
 Returns: Number
 Constraints: None
 Semantics: Computes a given function on a number sequence. Function is denoted by the first parameter: The difference from the standard functions is that all members of the sequence which include a call to SUBTOTAL are ignored. Values for function are as follows: 
 * 1 = AVERAGE, 2 = COUNT, 3 = COUNTA, 4 = MAX, 5 = MIN, 6 = PRODUCT, 7 = STDEV, 8 = STDEVP, 9 = SUM, 10 = VAR, 11 = VARP
 */
dojo.provide("websheet.functions.subtotal");
dojo.require("websheet.functions.FormulaBase");
dojo.require("websheet.functions.Formulas");

dojo.declare("websheet.functions.subtotal",websheet.functions.FormulaBase,{
	constructor:function(){
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 33;
		this.inherited(arguments);
	},
	/*number*/calc:function(context){
		var values = this.args;
		var num=values[0];
		var args=[];
		var type=num.getType();
		if(type==this.tokenType.NONE_TOKEN)
			throw websheet.Constant.ERRORCODE["519"];
		num=this.fetchScalaResult(num);
		num=this.getValue(num,type,this.LOCALE_NUM | this.NOT_SUPPORT_ARRAY);
		//if (this.isNum(num)) //"-.232","2342."
		num=parseInt(num); // not parseFloat
		
		 /**
		  * For the function_num constants from 1 to 11, the SUBTOTAL function includes the values of rows hidden by the Hide Rows command.
		  * For the function_Num constants from 101 to 111, the SUBTOTAL function ignores values of rows hidden by the Hide Rows command. 
		  * 
		  */
		if(num>100){
			if(num>111)
				throw websheet.Constant.ERRORCODE["519"];
			// only 101-111 formuls care about the show&hide event to re-calculate.
			// need to get Rows meta when refer to crossing sheet refs which are hidden.
			context.refType = websheet.Constant.RefType.CAREFILTER | websheet.Constant.RefType.CARESHOWHIDE;
			num -= 100;
		}else{
			if(num<1||num>11)
				throw websheet.Constant.ERRORCODE["519"];
			context.refType = websheet.Constant.RefType.CAREFILTER;
		}
		context.filterCell = this.filterCell;
		
		/*
		 *  ms 2007 also allows 101 - 111 function numbers and only allows the range type of arguments
		 *  but symphony can allow range type and fixed value
		 */
		for(var i=1,v;v = values[i]; i++){
			var type = v.getType();
			if(type == this.tokenType.NONE_TOKEN)
				throw websheet.Constant.ERRORCODE["519"];
			//TODO for case: =subtotal(1,(a1,a2)),=subtotal(1,(a1 a2)) won't throw error
			var refTokens = v.getReferenceToken();
			if(!refTokens || refTokens.length == 0){
				this._throwError(v.getError());//if has error throw it directly
				throw websheet.Constant.ERRORCODE["519"];
			}
			
			for(var j = 0; j < refTokens.length; j++){
				var refToken = refTokens[j];
				refToken.setProp(context.refType);
			}
			
			args = args.concat(refTokens);
		}
		
		var fname;
		switch (num){
			case 1:fname="average";break;
			case 2:fname="count";break;
			case 3:fname="counta";break;
			case 4:fname="max";break;
			case 5:fname="min";break;
			case 6:fname="product";break;
			case 7:fname="stdev";break;
			case 8:fname="stdevp";break;
			case 9:fname="sum";break;
			case 10:fname="var";break;
			case 11:fname="varp";break;
		}
		var func = websheet.functions.Formulas.getFunc(fname, context);
		return func(args);
	},
	
	filterCell:function(cell){
		if(cell && cell.isFormula()) {
			var rawValue = cell.getValue();
			if(rawValue.toUpperCase().indexOf("SUBTOTAL") != -1) {
				if(websheet.parse.FormulaParseHelper.containFunction("SUBTOTAL", cell.getCellToken()))
					return true;
			}
		}
		return false;
	}
	
	
	/**
	 * create new refs for subtotal to be notify
	 * load sheet model for getting the row meta infos.
	 * @param args
	 * @param type
	 */
//	_resetRef:function(args,currentCell,type){
//		var loadedSheets = {};
//		for(var i=0,token; token = args[i]; i++){
//			var cv = this.analyzeToken(token),refs = [];
//			var bOpt = false;
//			if(token._name === "~" || token._name === "!") {
//				refs = cv; // cv is the refs array.
//				/**
//				 *  if there's an intersection operation in subtotal, need to let cell to re-calcuation alway
//				 *  for hidden/show/sort action because ReferenceList check whether it's real change.
//				 */
//				currentCell.setErrProp(websheet.Constant.CellErrProp.UPDATE_ALWAYS);
//				bOpt = true;
//			}else{
//				refs.push(cv);
//				token.setProp(type);
//			}
//
//			for(var j = 0,ref; ref=refs[j];j++){
//				// for operator ~ and !, need to create new ref
//				if(bOpt){
//					var id = ref.getId();
//					var refToken = currentCell.getArea(id);
//					if(refToken && refToken[0]){
//						var parent = refToken[0].getParent();
//						var newRefToken = currentCell.setRefType(refToken[0], type);
//						var newRef = newRefToken.getValue(); // original reference need to be updated by new reference for next calc.
//						refs[j] = newRef;
//						// also need to update all parent Bracket tokenlist's calculateValue 
//						// because parseHelper._calc will just only get the Bracket tokenlist's calculateValue to calc.
//						while(parent && parent.getType() == this.tokenType.BRACKET_TOKEN){
//							parent.setValue(newRef);
//							parent = parent.getParent();
//						}
//					}
//				}
//			}
//		}
//	}
});