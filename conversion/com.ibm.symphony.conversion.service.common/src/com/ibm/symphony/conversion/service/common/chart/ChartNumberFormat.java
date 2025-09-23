package com.ibm.symphony.conversion.service.common.chart;

import com.ibm.json.java.JSONObject;

public class ChartNumberFormat
{
  private String category;

  private String code;

  private String currency;

  private String fmFontColor;

  public ChartNumberFormat(String category, String code, String currency, String fmFontColor)
  {
    this.category = category != null ? category : "";
    this.code = code;
    this.currency = currency != null ? currency : "";
    this.fmFontColor = fmFontColor != null ? fmFontColor : "";
  }

  public ChartNumberFormat(JSONObject formatJson)
  {
	 category = (String)formatJson.get("cat");
	 if(category == null)
		 category = "";
	 code = (String)formatJson.get("code");
	 if(code == null)
		 code = "";
	 currency = (String)formatJson.get("cur");
	 if(currency == null)
		 currency = "";
	 fmFontColor = (String)formatJson.get("clr");
	 if(fmFontColor == null)
		 fmFontColor = "";
  }
  
  public String toString()
  {
    StringBuffer buf = new StringBuffer();
    if(Utils.hasValue(this.code))
      buf.append(this.code);
    if(Utils.hasValue(this.fmFontColor))
	  buf.append(this.fmFontColor);
    if(Utils.hasValue(this.category))
      buf.append(this.category);
    if(Utils.hasValue(this.currency))
      buf.append(this.currency);
    return buf.toString();
  }
  
  public String getCategory()
  {
    return this.category;
  }

  public String getCode()
  {
    return this.code;
  }

  public String getCurrency()
  {
    return this.currency;
  }

  public String getFmFontColor()
  {
    return fmFontColor;
  }
  
  public void setCategory(String category)
  {
    this.category = category;
  }

  public void setCode(String code)
  {
    this.code = code;
  }

  public void setCurrency(String currency)
  {
    this.currency = currency;
  }

  public void setFmFontColor(String fmFontColor)
  {
    this.fmFontColor = fmFontColor;
  }

  public JSONObject toJson()
  {
    JSONObject numFmt = new JSONObject();
    if ((null != this.code) && (this.code.length() > 0))
      numFmt.put("code", this.code);
    
    if ((null != this.category) && (this.category.length() > 0))
      numFmt.put("cat", this.category);
    
    if ((null != this.currency) && (this.currency.length() > 0))
      numFmt.put("cur", this.currency);
    
    if ((null != this.fmFontColor) && (this.fmFontColor.length() > 0))
      numFmt.put("clr", this.fmFontColor);
    
    return numFmt;
  }
}
