/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.chart.data.DataProvider");
dojo.require("concord.chart.data.DataSequence");

//Must be implemented by the editors
dojo.declare("concord.chart.data.DataProvider", null,{
	_dataSource: null,  //"row"/"column" means get the series data by row/column
	
	constructor: function()
	{
		this._dataSource = "row";
	},
	
	/*List<{role:xx, addr:xxx, pts:[xxx]}>*/createDataSource: function(args,dataInterpreter)
	{
		var dataSeqArray = [];
		//a random array
		dataSeqArray.push({role:"values",pts:[1,2,3,4,5,6,7]});
		dataSeqArray.push({role:"values",pts:[4,2,1,4,8,6,5]});
		dataSeqArray.push({role:"values",pts:[3,5,7,4,8,6,7]});
		
		return dataSeqArray;
	},
	
	/*DataSequence*/createDataSequence: function(params)
	{
		var dataSeq = new concord.chart.data.DataSequence(this);
		if(params && params.pts)
			dataSeq.setData(params.pts);
		if(params && params.role)
			dataSeq.setProperty("role", params.role);
		
		return dataSeq;
	},
	
	setDataSource: function(dataSource)
	{
		this._dataSource = dataSource;
	},
	
	//Copy from CSVHelper
	splitArray: function(str,separator)
	{
		var listOfFields = str.split(separator);
		
		var leadingWhiteSpaceCharacters = new RegExp("^\\s+", 'g');
        var trailingWhiteSpaceCharacters = new RegExp("\\s+$", 'g');
        
		var j = 0;
    	while (j < listOfFields.length) 
    	{
    		var space_field_space = listOfFields[j];
            var field_space = space_field_space.replace(leadingWhiteSpaceCharacters, ''); // trim leading whitespace
            var field = field_space.replace(trailingWhiteSpaceCharacters, ''); // trim trailing whitespace 
            
            var firstChar = field.charAt(0);
            var lastChar = field.charAt(field.length - 1);
            var secondToLastChar = field.charAt(field.length - 2);
            var thirdToLastChar = field.charAt(field.length - 3);
            
            if(field=='""')
            {
            	listOfFields[j] = field;
                j += 1;
            }
            else if ((firstChar == '"') && (lastChar != '"')  || ((lastChar == '"') && (secondToLastChar == '"') && (thirdToLastChar != '"'))) 
            {
            	if (j + 1 === listOfFields.length)
            		return null;
            	
            	var nextField = listOfFields[j + 1];
                listOfFields[j] = field_space + separator + nextField;
                listOfFields.splice(j + 1, 1); // delete element [j+1] from the list
            }
            else 
            {
                listOfFields[j] = field;
                j += 1;
            }
    	}
    	
    	return listOfFields;
	},
	
	isMultiDim: function(str)
	{
		return false;
	},
	
	parseRef: function(str)
	{
		return str;
	},
	
	address4Dlg: function(str)
	{
		return str;
	},
	
	/**
	 * parse the input data.
	 * 
	 * @param data
	 * @param role: val, yVal, xVal, cat, label
	 * @returns 
	 */
	 
	parseData: function(data,role)
	{
		var backData = data;
		if(data[0]=="=")
			backData = data.substring(1);
		
		var newData = dojo.trim(backData);
		//string
		if(newData.length==0)
		{
			if(role=="yVal")
				throw "ERR9";  //A Y-series value is required
			
			if(role=="label")
				return backData.length>0 ? {v: backData} : "";
			
			return "";
		}
		
		var locale = pe.scene.getLocale();
		var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
		var separator = bundle["decimal"]=="," ? ";" : ",";
		
		try
		{
			if(newData[0]=="{" || newData[newData.length-1]=="}" || newData[0]=='"' || newData[newData.length-1]=='"')
				throw "ERR10";
			//parse as reference
			var r = this.parseRef(newData);
			if(r)
			{
				if(role == "cat" || role == "label")
				{
					if(r[0]=='(')
						throw "ERR4";  //Only one range is allowed
				}
				return {ref:r};
			}
		}
		catch(e)
		{
			//Not range address
			if(e=="ERR10")
			{
				//parse as array
				if(role!="label")
				{
					if(newData[0]=="{" && newData[newData.length-1]=="}")
						newData = newData.substring(1, newData.length-1);
					else if(newData[0]=="{" || newData[newData.length-1]=="}")
						throw "ERR1"; //An array must be enclosed by curly braces.
					
					var arr = this.splitArray(newData,separator);
					if(arr==null)
						throw "ERR3"; //The string item must be enclosed by double quotation marks.
					var retArray = [];
					for(var i=0;i<arr.length;i++)
					{
						var t = dojo.trim(arr[i]);
						var v = null;
						var options = {type:"decimal", locale: locale};
				   		var fValue = dojo.number.parse( t, options);
						if(isNaN(fValue))
						{
							//If the item is not a number, it must be in ""
							if(t[0]!='"' || t[t.length-1]!='"')
								throw "ERR3";  //The string item must be enclosed by double quotation marks 
							t = t.substring(1,t.length-1);
							// " is not allowed in the middle of the item
							if(t.indexOf('"')>=0)
								throw "ERR3";  //The string item must be enclosed by double quotation marks
							v = (role == "yVal" || role=="xVal") ? 0 : t;
						}
						else
						    v = fValue;
						retArray[i] = v;
					}
					return {cache:{pts:retArray}};
				}
				else if(role == "label") //used as string
				{
					//Only 255 characters are allowed
					if(backData.length>255)
						backData = backData.substring(0,255);
					return {v:backData};
				}
			}
			else
				throw e;
		}
		
		return null;
	}
});