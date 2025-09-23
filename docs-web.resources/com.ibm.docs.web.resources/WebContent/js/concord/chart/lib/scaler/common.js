dojo.provide("concord.chart.lib.scaler.common");

(function(){
	var eq = function(/*Number*/ a, /*Number*/ b){
		// summary: compare two FP numbers for equality
		return Math.abs(a - b) <= 1e-6 * (Math.abs(a) + Math.abs(b));	// Boolean
	};
	
	dojo.mixin(concord.chart.lib.scaler.common, {
		findString: function(/*String*/ val, /*Array*/ text){
			val = val.toLowerCase();
			for(var i = 0; i < text.length; ++i){
				if(val == text[i]){ return true; }
			}
			return false;
		},
		getNumericLabel: function(/*Number*/ number, /*Number*/ precision, /*Object*/ kwArgs){
			var def = "";
			precision = precision < 0 ? -precision : 0;
			if(dojo.number){
				def = (kwArgs.fixed ? dojo.number.format(number, {places : precision, pattern:"#"}) :
					dojo.number.format(number)) || "";
			}else{
				def = kwArgs.fixed ? number.toFixed(precision) : number.toString();
			}
			
			var label = number;
			if(kwArgs.labels)
			{
				// classic binary search
				var getLabel = function()
				{
					var l = kwArgs.labels, lo = 0, hi = l.length;
					while(lo < hi){
						var mid = Math.floor((lo + hi) / 2), val = l[mid].value;
						if(val < number){
							lo = mid + 1;
						}else{
							hi = mid;
						}
					}
					// lets take into account FP errors
					if(lo < l.length && eq(l[lo].value, number)){
						return l[lo].text;
					}
					--lo;
					if(lo >= 0 && lo < l.length && eq(l[lo].value, number)){
						return l[lo].text;
					}
					lo += 2;
					if(lo < l.length && eq(l[lo].value, number)){
						return l[lo].text;
					}
					// otherwise we will produce a number
					return "";
				};
				
				label = getLabel();
				if(typeof label != "number")
					return label;
				def = label;
			}
			
			if(kwArgs.labelFunc){
				var r = kwArgs.labelFunc(def, label, precision);
				if(r!=null){ return r; }
				// else fall through to the regular labels search
			}
			
			return def;
		}
	});
})();
