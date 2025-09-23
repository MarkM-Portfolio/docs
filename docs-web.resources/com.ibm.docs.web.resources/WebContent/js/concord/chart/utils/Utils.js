/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.chart.utils.Utils");

concord.chart.utils.Utils = new function()
{
	this.mergeSpPr = function(dest, src)
	{
		if(!dest || !src)
			return;
		
		if("solidFill" in src)
		{
			dest["solidFill"] = src["solidFill"];
			delete dest["noFill"];
			delete dest["gradFill"];
		}
		if("gradFill" in src)
		{
			dest["gradFill"] = src["gradFill"];
			delete dest["noFill"];
			delete dest["solidFill"];
		}
		if(src["noFill"]==1)
		{
			dest["noFill"] = 1;
			delete dest["solidFill"];
			delete dest["gradFill"];
		}
		if("ln" in src)
		{
			var ln = src.ln;
			if(!dest.ln)
				dest.ln = ln;
			else
			{
				if(ln==null)
				{
					dest.ln = null;
				}
				else
				{
					if("w" in ln)
					{
						dest.ln["w"] = ln["w"];
						if(dest.ln["noFill"] == 1)
						{
							delete dest.ln["noFill"];
							delete dest.ln["solidFill"];
							delete dest.ln["gradFill"];
						}
					}
					if("solidFill" in ln)
					{
						dest.ln["solidFill"] = ln["solidFill"];
						delete dest.ln["noFill"];
						delete dest.ln["gradFill"];
					}
					if("gradFill" in ln)
					{
						dest.ln["gradFill"] = ln["gradFill"];
						delete dest.ln["noFill"];
						delete dest.ln["solidFill"];
					}
					if(ln["noFill"]==1)
					{
						dest.ln["noFill"] = 1;
						delete dest.ln["solidFill"];
						delete dest.ln["gradFill"];
					}
				}
			}
		}
	};
	
	this.reverseSpPr = function(refer, src)
	{
		if(refer==null)
			return dojo.clone(src);
		
		var reverse = {};
		if("noFill" in refer)
		{
			var noFill = src.noFill;
			reverse.noFill = noFill == null ? 0 : noFill;
			//If noFill change from 1 to 0, need recover the origin solid fill
			if(!noFill && src.solidFill)
				reverse.solidFill = src.solidFill;
			if(!noFill && src.gradFill)
				reverse.gradFill = src.gradFill;
		}
		if("solidFill" in refer)
		{
			reverse.solidFill = src.solidFill || null;
			if(!reverse.noFill && src.noFill)
				reverse.noFill = 1;

			if(src.gradFill)
				reverse.gradFill = src.gradFill;
		}
		if("ln" in refer)
		{
			if(refer.ln==null)
				reverse.ln = dojo.clone(src.ln) || null;
			else
			{
				if(src.ln==null)
					reverse.ln = null;
				else
				{
					reverse.ln = {};
					if("noFill" in refer.ln)
					{
						var noFill = src.ln.noFill;
						reverse.ln.noFill = noFill==null? 0:noFill;
						
						if(!noFill)
						{
							reverse.ln.solidFill = src.ln.solidFill || null;
							if(src.ln.gradFill)
								reverse.ln.gradFill = src.ln.gradFill;
							if(src.ln.w)
								reverse.ln.w = src.ln.w;
						}
					}
					if("solidFill" in refer.ln)
					{
						reverse.ln.solidFill = src.ln.solidFill || null;
						if(!reverse.ln.noFill && src.ln.noFill == 1)						
							reverse.ln.noFill = 1;
					
						if(src.ln.gradFill)
							reverse.ln.gradFill = src.ln.gradFill;
					}
					if("w" in refer.ln)
					{
						var w = src.ln.w;
						reverse.ln.w = w==null ? 0:w;
						if(!reverse.ln.noFill && src.ln.noFill == 1)						
							reverse.ln.noFill = 1;
					}
				}
			}
		}
		return reverse;
	};
	
	this.reverseTxPr = function(refer, src)
	{
		if(refer==null)
			return dojo.clone(src);
		
		var reverse = {};
		for(var key in refer)
		{
			reverse[key] = src[key] || null;
			
			if(key=="latin")
			{
				if("asian" in src)
					reverse["asian"] = src["asian"];
				if("ctl" in src)
					reverse["ctl"] = src["ctl"];
			}
		}
		return reverse;
	};
	
	this.getFill = function(spPr)
	{
		if(spPr.solidFill)
			return spPr.solidFill;
		else if(spPr.gradFill)
		{
			var idx = spPr.gradFill.indexOf("#");
			if(idx>0)
				return spPr.gradFill.substring(idx,idx+7);
		}
		return null;
	};
	
	this.escapeHTMLTag = function(s)
	{
		if(typeof s != "string")
			return s;
		return s.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;").replace(/'/gm, "&#39;");
	};
};