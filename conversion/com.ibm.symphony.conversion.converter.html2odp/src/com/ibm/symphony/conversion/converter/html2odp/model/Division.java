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

public class Division
{

  enum POSITION_TYPE {
    RELATIVE, ABSOLUTE;
    public static POSITION_TYPE toEnum(String str)
    {
      try
      {
        return valueOf(str.toUpperCase());
      }
      catch (Exception ex)
      {
        return ABSOLUTE;
      }
    }
  };

  MetricsUnit width;

  MetricsUnit height;

  POSITION_TYPE positionType;

  public Division(String width, String height, String positionType)
  {
    this.width = new MetricsUnit(width);
    this.height = new MetricsUnit(height);
    this.positionType = POSITION_TYPE.toEnum(positionType);
  }

  public Division(String width, String height)
  {
    this.width = new MetricsUnit(width);
    this.height = new MetricsUnit(height);
    this.positionType = POSITION_TYPE.ABSOLUTE;
  }

  public Division()
  {

  }

  public Division(String[] divs)
  {
    width = new MetricsUnit(divs[0]);
    height = new MetricsUnit(divs[0]);
  }

  public POSITION_TYPE getPositionType()
  {
    return positionType;
  }

  public void setPositionType(String position)
  {
    positionType = POSITION_TYPE.toEnum(position);
  }

  public void setWidth(String width)
  {
    this.width = new MetricsUnit(width);
  }

  public void setHeight(String height)
  {
    this.height = new MetricsUnit(height);
  }

  public MetricsUnit getWidth()
  {
    return width;
  }

  public MetricsUnit getHeight()
  {
    return height;
  }

  public void setValue(String metricsValue, String type)
  {
    if ("height".equalsIgnoreCase(type))
    {
      this.height = new MetricsUnit(metricsValue);
    }
    else
    {
      this.width = new MetricsUnit(metricsValue);
    }
  }
}
