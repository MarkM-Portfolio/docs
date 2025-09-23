/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.model;


public class MetricsUnit
{
  double value;
  
  MESURMENT_TYPE type;

  public static enum MESURMENT_TYPE {
    PERCENTAGE, EM, DECIMAL, PT, PX, CM, UNSUPPORT;
    public String toString()
    {
      String str = super.toString();
      if ("PERCENTAGE".equals(str))
      {
        return "%";
      }
      else if ("DECIMAL".equals(str))
      {
        return "";
      }
      else
        return str.toLowerCase();
    };
    
    public static MESURMENT_TYPE toEnum(String str)
    {
      try
      {
        return valueOf(str.toUpperCase());
      }
      catch (Exception ex)
      {
    	  if("%".equals(str))
    		  return PERCENTAGE;
    	  if(str.length() == 0)
    		  return DECIMAL;
    	  return UNSUPPORT;
      }
    }
  };

  public interface IMetricsRelation
  {
    public boolean relateWithWidth();
  }

  public static enum LOCATION_RANGE_TYPE implements IMetricsRelation {
    width, height;
    public boolean relateWithWidth()
    {
      if (this == width)
      {
        return true;
      }
      else
      {
        return false;
      }
    }
  }

  public static enum LOCATION_POINT_TYPE implements IMetricsRelation {
    left, right, top, bottom;
    public boolean relateWithWidth()
    {
      if (this == left || this == right)
      {
        return true;
      }
      else
      {
        return false;
      }
    }
  }

  public MESURMENT_TYPE getType()
  {
    return type;
  }

  public MetricsUnit(String valueStr)
  {
    if (valueStr != null)
      valueStr = valueStr.trim();
    else
      valueStr = "0.0";
    acceptValue(valueStr);
  }

  public double getRealValue()
  {
    if (type == MESURMENT_TYPE.PERCENTAGE)
    {
      return value / 100;
    }
    return value;
  }

  public String getTypeString()
  {
    return type.toString();
  }

  public String getValueString()
  {
    return value + type.toString();
  }

  private void acceptValue(String valueString)
  {
    String subString = valueString.replaceFirst("(cm|pt|px|em|%)", "");
    
    type = MESURMENT_TYPE.toEnum(valueString.substring(subString.length()));
    value = Double.parseDouble(subString);
  }
}
