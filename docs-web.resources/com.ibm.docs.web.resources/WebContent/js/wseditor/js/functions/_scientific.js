dojo.provide("websheet.functions._scientific");
dojo.require("dojo.i18n");
dojo.declare("websheet.functions._scientific",websheet.functions.FormulaBase,{
		/**
		 * this function may parse the sciValue to a long string number;
		 * e.g  1.1e+23 => 110000000000000000000000
		 * @param float
		 * @return string
		 */
		parseScientific : function(sciValue){
			var result = 0;
			if(this.isSci(sciValue)){//to judge if it is a scientific
				var testValue = sciValue.toString();
				var numStr = testValue.split("e");
				var floatValue = parseFloat(numStr[0]);
				var orderValue = parseInt(numStr[1]);
				floatValue = floatValue.toString();
				numStr = floatValue.split(".");
  	    	  	numStr[1] = numStr.length > 1 ? numStr[1]:""; 
  	    	  	numValue = numStr[0] + "" + numStr[1];
  	    	  	if(orderValue >= 0){  //to judge the order of the float number;
  	    		  var zeroNum = orderValue - numStr[1].length;
  	    		  for(var i = 0 ; i < zeroNum ; i++){
  	    			  numValue += "0";
  	    		  }
  	    		  result = numValue;
  	    	  	}
  	    	  	else{
  	    		  var strZeros = "0.";
  	    		  for(var i = 0 ; i > orderValue + 1 ; i--){
  	    			  strZeros += "0";
  	    		  }
  	    		  result = strZeros + numValue; 
  	    	  	}
  	    	  	return result;
			}
			else{
				return sciValue.toString();
			}
		},
		/**
		 * @param  number
		 * @return boolean 
		 * this function may judge if a number is a scientific number
		 */
		isSci : function(testValue){
			testValue = testValue.toString();
			var eIdx = testValue.indexOf("e");
			return eIdx>0;
		},
		/**
		 * @param1 string
		 * @param2 char
		 * @param3 char
		 * @return string
		 * this function may add the group and the decimal for a string number by its local style; 
		 */
		addCommas : function(numValue,commas,point){
			var numArray = numValue.split(".");
			var intStr = numArray[0];
			var decStr = numArray.length > 1 ? numArray[1] : "";
			var result;
			for(var i=intStr.length;i>3;i=i-3){
				var low = intStr.substring(0,i-3);
				var high = intStr.substring(i-3,intStr.length);
				intStr = low + commas + high;
			}//AddCommas
			if(numArray.length > 1){ 
				result = intStr + point + decStr;
			}
			else{
				result = intStr;//to deal with the integer number like 100000
			} 
			return result;
		},
		/**
		 *  @param1 float
		 *  @param2 int
		 *  @return string
		 *  this function could format a float number to its string style
		 *  and fixed by specific "decimals"
		 *  e.g fixFloatToLocalNumber(1.18E-87,100)
		 *      fixFloatToLocalNumber(1.18e+8,-7)
		 *      fixFloatToLocalNumber(1.18,4)...
		 */
		fixFloatToLocalNumber : function(floatValue,decimals){
			var result;
			//ErrorFilter
			if(decimals >= 0){
				result = this.fixPositive(floatValue , decimals);
			}
			else{
				result = this.fixNegative(floatValue , decimals);
			}
			return result;
		},
		/**
		 * @param1 float
		 * @param2 int
		 * @return string
		 * deal with the situation when decimals >= 0
		 */
		fixPositive : function(floatValue , decimals){
			/*after parseFloat,there are three kinds of scenes : 
			  e.g: 1.18e+30,1.18e-30,1.18 
			  marked as : E+F+,E-F+,F+*/
			if(this.isSci(floatValue)){//deal with "E+F+,E-F+"
				var strValue = floatValue.toString();
				var strNum = strValue.split("e");
				var order = parseInt(strNum[1]);
				//to judge "E+F+" or "E-F+" by "order"
				var noPointNum = strNum[0].replace(".","");
				var pointNum = "0." + noPointNum ; 
				//these values can not be written in the logical
				//because there is not only one branch uses it; 
				if(order > 0){
					strValue = this.parseScientific(strValue);
					result = strValue + ".";
					for(var i = 0 ; i < decimals ; i++){
						result += "0";
					}
					return result;
				}
				//deal with the "E+F+"
				else if(order < 0){
					var zeroStr = "0.";
					for(var i = 0 ; i<-order - 2 ; i++){
						zeroStr += "0";
					}
			        //prepared the zeroStr
					//e.g "0.00000" of "0.00000099"
					/*judge three subscenes of "E-F+" by (decimals + order)
					 */
					if(decimals + order <= -2){
						return this.fixedDecimals(0,decimals);
					}//e.g  9.19e-42,40
					else if(decimals + order > -2 && decimals + order < noPointNum.length - 1){
						var pointFloat = parseFloat(pointNum);
						pointFloat = this.fixedDecimals(pointFloat , decimals + order + 1);
						pointFloat = pointFloat.toString();
						result = pointFloat.replace(".","");
						result = zeroStr + result;
						return result;
					}//e.g  9.19e-42,43	
					else{
						var N = decimals + order - (noPointNum.length - 1);
						result = this.parseScientific(strValue);
						for(var i=0; i < N ;i++){
							result += "0";
						}
						return result;
					}//e.g 9.19e-42,44
				}
				//deal with the "E-F+"
			}
			else{
				var result = "";
				if(decimals>20){
					result = this.fixedDecimals(floatValue, 20);
					decimals -= 20;
					for(var i=0 ; i<decimals ;i++){
						result += "0";
					}
				} 
				else{
					result = this.fixedDecimals(floatValue,decimals);
					result = result.toString();
				}
				return result;
			}
			//deal the F+ for different browser kernel
		},
		/**
		 * @param1 float
		 * @param2 int
		 * @return string
		 * deal with the situation when decimals < 0
		 */
		fixNegative : function(floatValue , decimals){
			var strValue = this.parseScientific(floatValue);
			strValue = strValue.split(".");
			strValue = strValue[0];
			var temp = parseFloat(strValue);
			if(temp>=0 && strValue.length + decimals < 0 || temp<0 && strValue.length + decimals <= 0){
				return "0";
			}
			strValue = strValue.substring(0,strValue.length + decimals + 1);
			strValue = parseFloat(strValue);
			strValue /= 10;
			//get the long string number,to fixed it 
			//e.g 100000009999900000
			var tempValue = strValue >= 0 ? strValue : -strValue;
			var fixedValue = Math.round(tempValue,decimals);
			strValue = strValue >= 0 ? fixedValue : -fixedValue;
			//to repair the unexpected round result
			//e.g fixed(-8.5e+40,-40)
			if(strValue == 0){
				return strValue.toString();
			}//e.g fixed(1.1,-1)
			for(var i = 0 ; i < -decimals ; i++){
				strValue = strValue + "0";
			}
			//add the left "0" due to fixed
			return strValue;
		},
		/**
		 * @param1 float
		 * @param2 int
		 * @return string
		 */
		fixedDecimals : function(numValue,decimals){
			var tempValue = numValue >= 0 ? numValue : -numValue;
			var fixedValue = dojo.number.round(tempValue,decimals);
			fixedValue = numValue >= 0 ? fixedValue : -fixedValue;
			//to repair the unexpected round result
			//e.g round(-8.5)= -8; 
			//    round(-8.5)= -9;
			fixedValue = fixedValue.toString();
			var numValue = fixedValue.split(".");
			//add the left "0"
			if(numValue[1]){
				var length = decimals - numValue[1].length;
				for(var i =0 ; i < length ; i++){
					fixedValue += "0";
				}
			}//e.g fixedValue(1.234 , 9)
			else{
				if(decimals!=0){
					fixedValue += ".";
					for(var i =0 ; i < decimals ; i++){
						fixedValue += "0";
					}
				}//e.g fixedValue(1234 , 9)
			}
			return fixedValue;
		}
});