dojo.provide("pres.utils.lineWidthUtil");
dojo.require("pres.constants");

pres.utils.lineWidthUtil = {

	getFirst: function(limited)
	{
		var arr = limited ? pres.constants.LINE_WIDTH_ITEMS : pres.constants.LINE_WIDTH_ITEMS_EXTEND;
		return arr[0];
	},
	
	getLast: function(limited)
	{
		var arr = limited ? pres.constants.LINE_WIDTH_ITEMS : pres.constants.LINE_WIDTH_MAXITEM;
		return arr[arr.length - 1];
	},
		
	getPrev: function(current, limited)
	{
		var arr = pres.constants.LINE_WIDTH_ITEMS_EXTEND;
		var flag = arr.indexOf(parseFloat(current));
		if(limited)
		{		
			if(current % 1 == 0 && current <= 6 )
				return current > 1 ? (current - 1) : 0.75;
			else if(current > 6)
			{
				return 6;
			}
			else if(current > 1 && current % 1 != 0)
				return arr[Math.floor(current)];
			else if(flag >0)
				return arr[flag -1];
			else if(flag <= 0)
				return  flag == 0 ? 6 : arr[Math.floor(current/0.25) - 1];
		}
		else
		{
			if(current % 1 == 0 && current <= 100 )
				return current > 1 ? (current - 1) : 0.75;
			else if(current > 100)
				return 100;
			else if(current > 1 && current % 1 != 0)
				return Math.floor(current);
			else if(flag >0)
				return arr[flag -1];
			else if(flag <= 0)
				return  flag == 0 ? 6 : arr[Math.floor(current/0.25) - 1];
		}
	},

	getNext: function(current, limited )
	{
		var arr = pres.constants.LINE_WIDTH_ITEMS_EXTEND;

		if(current < 1 && current >= 0.25)
			return arr[Math.floor(current/0.25)];
		else if(current < 0.25 )
		{
			return arr[0];
		}
		else if(current < 6)
		{
			var temp = Math.floor(current)+1;
			return temp;
		}
		else if(current >= 6 && limited )
		{
			return arr[0];
		}
		else if(current >=6 && current< 100 )
		{
			return Math.floor(current)+1;
		}
		else if(current>= 100)
		{
			return arr[0];
		}
	},

	getNextValue: function(current, limited, isIncrease)
	{
		if(isIncrease)
			return this.getNext(current, limited);
		else
			return this.getPrev(current, limited);
	},

	getNextTypeValue: function(isDash, cur_value)
	{
		var arr = isDash ? pres.constants.LINE_DASH_TYPE_VALUE: pres.constants.LINE_ENDPOINT_TYPE;
		var cur_index = arr.indexOf(cur_value);
		if(!isDash)
		{
			if(cur_index == arr.length - 1 ||cur_index < 0)
				return arr[0];
			else if(cur_index < arr.length - 1 && cur_index >= 0)
				return arr[cur_index + 1];
			 else
			 	return arr[0];
		}
		else
		{
			var result = [];
			var value_array = pres.constants.LINE_DASH_TYPE;
			if(cur_index == arr.length - 1 || cur_index < 0)
			{
				result.push(arr[0]);
				result.push(value_array[0]);
			}
			else if(cur_index < arr.length - 1 && cur_index >= 0)
			{
				result.push(arr[cur_index + 1]);
				result.push(value_array[cur_index + 1]);
			}
			return result;
		}
	},

	getPreTypeValue: function(isDash, cur_value)
	{
		var arr = isDash ? pres.constants.LINE_DASH_TYPE_VALUE: pres.constants.LINE_ENDPOINT_TYPE;
		var cur_index = arr.indexOf(cur_value);
		if(!isDash)
		{
			if(cur_index <= 0)
				return arr[arr.length - 1];
			else if(cur_index <= arr.length - 1 && cur_index > 0)
				return arr[cur_index - 1];
			 else
			 	return arr[0];
		}
		else
		{
			var result = [];
			var value_array = pres.constants.LINE_DASH_TYPE;
			if(cur_index <= 0 )
			{
				result.push(arr[arr.length - 1]);
				result.push(value_array[value_array.length - 1]);
			}
			else if(cur_index <= arr.length - 1 && cur_index > 0)
			{
				result.push(arr[cur_index - 1]);
				result.push(value_array[cur_index - 1]);
			}
			return result;
		}
	},

	getDashValueFromType: function(typeValue)
	{
		var dashArray = pres.constants.LINE_DASH_TYPE;
		var dashValue = pres.constants.LINE_DASH_TYPE_VALUE;
		return dashValue[dashArray.indexOf(typeValue)];
	},

	getTypeValueFromDash: function(dashTypeValue)
	{
		var dashArray = pres.constants.LINE_DASH_TYPE;
		var dashValue = pres.constants.LINE_DASH_TYPE_VALUE;
		var dashIndex = dashValue.indexOf(dashTypeValue);
		if(dashIndex <0)
			return dashTypeValue;
		else
			return dashArray[dashIndex];
	}
};