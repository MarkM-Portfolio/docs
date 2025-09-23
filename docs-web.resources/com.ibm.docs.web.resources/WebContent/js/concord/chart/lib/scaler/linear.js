dojo.provide("concord.chart.lib.scaler.linear");
dojo.require("concord.chart.lib.scaler.common");

(function(){
	var deltaLimit = 20,	// pixels
		dc = concord.chart.lib, dcs = dc.scaler, dcsc = dcs.common,
		findString = dcsc.findString,
		getLabel = dcsc.getNumericLabel;
	
	var calcPrecision = function(number)
	{
		if(!number)
			return 0;
		
		var minPrec = 0;
		var str = number + "";
		var idx = str.indexOf(".");
		if(idx>0)
			minPrec = str.length - idx - 1;
		if(minPrec>8)
			minPrec = 8;
		
		return -minPrec;
	};
	
	var calcTicks = function(min, max, kwArgs, majorTick, minorTick, microTick, span){
		kwArgs = dojo.delegate(kwArgs);
		
		var minPrec = calcPrecision(min);
		var lowerBound = (kwArgs.min && majorTick) ? Math.floor(kwArgs.min / majorTick) * majorTick : 0;
		var upperBound = (kwArgs.max && majorTick) ? Math.ceil(kwArgs.max / majorTick) * majorTick : 0;
	    lowerBound = min ? min : lowerBound;
		upperBound = max ? max : upperBound;
		
		min = lowerBound;
		max = upperBound;
		
		var majorStart = min,
			minorStart = min,
			microStart = min,
			majorCount = Math.round((max - majorStart) / majorTick)	,
			minorCount = Math.round((max - minorStart) / minorTick) ,
			microCount = 0;
		
		//Two many grid line will cause browser crash
		if(majorCount>50)
		{
			majorCount = 50;
			majorTick = Math.round((max - majorStart) / majorCount);
		}
		if(minorCount>100)
		{
			minorCount = 100;
			minorTick = Math.round((max - minorStart) / minorCount);
		}
		var	minorPerMajor  = minorTick ? Math.round(majorTick / minorTick) : 0,
			microPerMinor  = microTick ? Math.round(minorTick / microTick) : 0,
			majorPrecision = majorTick ? calcPrecision(majorTick) : 0,
			minorPrecision = minorTick ? calcPrecision(minorTick) : 0,
			scale = span / (max - min);
		if(!isFinite(scale)){ scale = 1; }
		
		if(majorPrecision>minPrec)
			majorPrecision = minPrec;
		
		return {
			bounds: {
				lower:	lowerBound,
				upper:	upperBound,
				from:	min,
				to:		max,
				scale:	scale,
				span:	span
			},
			major: {
				tick:	majorTick,
				start:	majorStart,
				count:	majorCount,
				prec:	majorPrecision
			},
			minor: {
				tick:	minorTick,
				start:	minorStart,
				count:	minorCount,
				prec:	minorPrecision
			},
			micro: {
				tick:	microTick,
				start:	microStart,
				count:	microCount,
				prec:	0
			},
			minorPerMajor:	minorPerMajor,
			microPerMinor:	microPerMinor,
			scaler:			dcs.linear
		};
	};
	
	dojo.mixin(concord.chart.lib.scaler.linear, {
		buildScaler: function(/*Number*/ min, /*Number*/ max, /*Number*/ span, /*Object*/ kwArgs){
			var h = {fixUpper: "none", fixLower: "none", natural: false};
			if(kwArgs){
				if("fixUpper" in kwArgs){ h.fixUpper = String(kwArgs.fixUpper); }
				if("fixLower" in kwArgs){ h.fixLower = String(kwArgs.fixLower); }
				if("natural"  in kwArgs){ h.natural  = Boolean(kwArgs.natural); }
			}
			
			if(!h.natural)
			{
				if(max>=0 && min>=0)
				{
					if(max==min)
						min = 0;
					max = max + 0.05*(max-min);
					if((max-min)>=(max/6))
						min = 0;
					else
						min = min - 0.05*(max-min);
				}
				else if(max<0 && min<0)
				{
					if(max==min)
						max = 0;
					min = min + 0.05*(min-max);
					if((max-min)>=(min/6))
						max = 0;
					else
						max = min - 0.05*(min-max);
				}
				else
				{
					max = max + 0.05*(max-min);
					min = min + 0.05*(min-max);
				}
			}
			
			// update bounds
			if("min" in kwArgs){ min = kwArgs.min; }
			if("max" in kwArgs){ max = kwArgs.max; }
			if(kwArgs.includeZero){
				if(min > 0){ min = 0; }
				if(max < 0){ max = 0; }
			}
			if(min==0 && max==0)
				max = 1;
			
			h.min = min;
			h.useMin = true;
			h.max = max;
			h.useMax = true;
			
			if("from" in kwArgs){
				min = kwArgs.from;
				h.useMin = false;
			}
			if("to" in kwArgs){
				max = kwArgs.to;
				h.useMax = false;
			}
			
			// check for erroneous condition
			if(max <= min){
				return calcTicks(kwArgs.min, kwArgs.max, h, 0, 0, 0, span);	// Object
			}
			
			var	major = 0, minor = 0, micro = 0, ticks;
			if(kwArgs && ("majorTickStep" in kwArgs))
				major = kwArgs.majorTickStep;
			else
			{
				if(h.natural)
				{
					major =1; 
					var limit = 15;
					if(max>=100)
						limit = 20;
					if(span>limit && span/(max-min)<limit)
					{
						while(span/(max-min)*major<limit)
							major++;
					}
				}
				else
				{
					major = (max - min) / 5;
					var a = Math.floor(Math.log(major)/Math.LN10);
					var b = major*Math.pow(10, -a);
					var pow = Math.pow(10, a);
					if(b<=1.9)
					  major = pow;
					else if(b>1.9 && b<4)
					  major = 2*pow;
					else if(b>=4)
					  major = 5*pow;
				}
			}
			if(kwArgs && ("minorTickStep" in kwArgs))
				minor = kwArgs.minorTickStep;
			else if(!h.natural)
				minor = major / 5;
			
			return calcTicks(kwArgs.min, kwArgs.max, h, major, minor, 0, span);
		},
		
		buildTicks: function(/*Object*/ scaler, /*Object*/ kwArgs){
			var step, next, tick,
				nextMajor = scaler.major.start,
				nextMinor = scaler.minor.start,
				nextMicro = scaler.micro.start;
			if(kwArgs.microTicks && scaler.micro.tick){
				step = scaler.micro.tick, next = nextMicro;
			}else if(kwArgs.minorTicks && scaler.minor.tick){
				step = scaler.minor.tick, next = nextMinor;
			}else if(scaler.major.tick){
				step = scaler.major.tick, next = nextMajor;
			}else{
				// no ticks
				return null;
			}
			// make sure that we have finite bounds
			var revScale = 1 / scaler.bounds.scale;
			if(scaler.bounds.to <= scaler.bounds.from || isNaN(revScale) || !isFinite(revScale) ||
					step <= 0 || isNaN(step) || !isFinite(step)){
				// no ticks
				return null;
			}
			// loop over all ticks
			var majorTicks = [], minorTicks = [], microTicks = [];
			if(scaler.major.tick)
			{
				step = scaler.major.tick;
				while(nextMajor <= scaler.bounds.to + revScale)
				{
					tick = {value: nextMajor};
					if(kwArgs.majorLabels){
						tick.label = getLabel(nextMajor, scaler.major.prec, kwArgs);
					}
					majorTicks.push(tick);
					nextMajor += step;
				}
			}
			if(kwArgs.minorTicks && scaler.minor.tick)
			{
				step = scaler.minor.tick;
				while(nextMinor <= scaler.bounds.to + revScale)
				{
					if(kwArgs.minorTicks)
					{
						tick = {value: nextMinor};
						minorTicks.push(tick);
					}
					nextMinor += step;
				}
			}
			
			return {major: majorTicks, minor: minorTicks, micro: microTicks};	// Object
		},
		getTransformerFromModel: function(/*Object*/ scaler){
			var offset = scaler.bounds.from, scale = scaler.bounds.scale;
			return function(x){ return (x - offset) * scale; };	// Function
		},
		getTransformerFromPlot: function(/*Object*/ scaler){
			var offset = scaler.bounds.from, scale = scaler.bounds.scale;
			return function(x){ return x / scale + offset; };	// Function
		}
	});
})();
