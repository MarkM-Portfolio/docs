package com.ibm.symphony.conversion.service.common.chart;

import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;

import com.ibm.json.java.JSONObject;

public class Style
{
	public static class Text
	{
	    public String linethrough; //strike through
	    public String underline;   //under line
		public boolean italic;
		public double size;
		public String color;
		public boolean bold;
		public String latin;  //font name
		public String asian;
		public String ctl;
		public int changes = 0;
		
		public Text()
		{
			
		}
		
		public Text(Text txPr)//only clone the supported property;
		{
			italic = txPr.italic;
			size = txPr.size;
			color = txPr.color;
			bold = txPr.bold;
			latin = txPr.latin;
		}
		
		public JSONObject toJson()
		{
			JSONObject json = new JSONObject();

			if(linethrough != null && linethrough.length() > 0)
			  json.put("strike", linethrough);
			if(underline != null && underline.length() > 0)
			  json.put("u", underline);
			if(italic)
				json.put("i", 1);
			else
				json.put("i", 0);
			if(size>0)
				json.put("sz", size);
			if(color!=null && color.length()>0)
				json.put("color", color);
			if(bold)
				json.put("b", 1);
			else
				json.put("b", 0);
			if(latin!=null && latin.length()>0)
				json.put("latin", latin);
			if(asian!=null && asian.length()>0)
				json.put("asain", asian);
			if(ctl!=null && ctl.length()>0)
				json.put("ctl", ctl);
			return json;
		}
		
		public void loadFromJson(JSONObject content, JSONObject chartTxPr)
		{
		   Number cha = (Number)content.get("changes");
		   if(cha != null)
			   changes = cha.intValue();
		   
		   Number i = (Number)content.get("i");
		   if(i!=null)
		   {
			   if(i.intValue()==1)
				   italic = true;
		   }
		   else if(chartTxPr != null)
		   {
			   Number ci = (Number)chartTxPr.get("i");
			   if(ci!=null)
			   {
				   if(ci.intValue()==1)
					   italic = true;
				   changes = changes | 16;
			   }
		   }
		   
		   Number sz = (Number)content.get("sz");
		   if(sz!=null)
		     size = sz.doubleValue();
		   else if(chartTxPr != null)
		   {
			   Number csz = (Number)chartTxPr.get("sz");
			   if(csz!=null)
			   {
			     size = csz.doubleValue();
			     changes = changes | 4;
			   }
		   }		   
		   
		   color = (String)content.get("color");
		   if(color == null && chartTxPr != null)
		   {
			   color = (String)chartTxPr.get("color");
			   if(color != null)
				   changes = changes | 2;
		   }
		   
		   Number b = (Number)content.get("b");
		   if(b!=null)
		   {
			   if(b.intValue()==1)
				   bold = true;
		   }
		   else if(chartTxPr != null)
		   {
			   Number cb = (Number)chartTxPr.get("b");
			   if(cb!=null)
			   {
				   if(cb.intValue()==1)
					   bold = true;
				   changes = changes | 8;
			   }
		   }
		   
		   latin = (String)content.get("latin");
		   asian = (String)content.get("asian");
		   ctl = (String)content.get("ctl");
		   
		   if(chartTxPr != null)
		   {
			   if(latin == null)
			   {
				   latin = (String)chartTxPr.get("latin");
				   if(latin != null)
					   changes = changes | 1;
			   }
			   if(asian == null)
			   {
				   asian = (String)chartTxPr.get("asian");
				   if(asian != null)
					   changes = changes | 1;
			   }
			   if(ctl == null)
			   {
				   ctl = (String)chartTxPr.get("ctl");
				   if(ctl != null)
					   changes = changes | 1;
			   }
		   }
		}
	}
	
	public static class Graphic
	{
		public String fill;
		public String fillColor;
		public String strokeColor;
		public String stroke;
		public String stroke_width;
		public int changes = 0;
		
		public JSONObject toJson()
		{
			JSONObject json = new JSONObject();
			if("none".equals(fill))
			  json.put("noFill", 1);
			else if("gradient".equals(fill))
			{
				json.put("gradFill","#FFFFFF");
			}
			else if("bitmap".equals(fill))
			{
				//nothing
			}
			else
			{
			  if(fillColor!=null && fillColor.length()>0)
			    json.put("solidFill", fillColor);
			}
			JSONObject line = new JSONObject();
			if("none".equals(stroke))
			   line.put("noFill", 1);
			
			if(strokeColor!=null && strokeColor.length()>0)
				line.put("solidFill", strokeColor);
			else if(stroke!=null && stroke.length()>0)
				line.put("solidFill", "#000000");
			
			if(stroke_width!=null && stroke_width.length()>0)
			{
			   line.put("w", Length.parseDouble(stroke_width,Unit.PIXEL));
			}
			if(!line.isEmpty())
			  json.put("ln", line);
			return json;
		}
		
		public void loadFromJson(JSONObject content)
		{
		   Number oFill = (Number)content.get("noFill");
		   if(oFill!=null && oFill.intValue()==1)
			   fill = "none";
		   fillColor = (String)content.get("solidFill");
		   if(fillColor != null)
			   fill = "solid";
		   else if(content.containsKey("gradFill"))
			   fill = "gradient";
		   JSONObject ln = (JSONObject)content.get("ln");
		   if(ln!=null)
		   {
			   strokeColor = (String) ln.get("solidFill");
			   Number lFill = (Number)ln.get("noFill");
			   if(lFill!=null && lFill.intValue()==1)
				   stroke = "none";
			   else if(strokeColor!=null)
				   stroke = "solid";
					
				Number w = (Number) ln.get("w");
				if (w != null)
					stroke_width = Utils.convertPXToCM(w.doubleValue());
		   }
		   
		   Number cha = (Number)content.get("changes");
		   if(cha != null)
			   changes = cha.intValue();
		}
	}
	
	public static class Marker
	{
		public String symbolType;
		public JSONObject toJson()
        {
            JSONObject json = new JSONObject();
            if(symbolType!=null && symbolType.length()>0)
              json.put("symbol", symbolType);
            
            return json;
        }
		
		public void loadFromJson(JSONObject content)
		{
		  symbolType = (String)content.get("symbol");
		}
	}
}
