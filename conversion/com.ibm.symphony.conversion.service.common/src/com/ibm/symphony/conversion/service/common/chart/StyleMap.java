package com.ibm.symphony.conversion.service.common.chart;

public class StyleMap
{

  private String op;
  private String value;
  private String mapStyle;
  
  public StyleMap (String op, String value, String mapStyle){
    this.op = op;
    this.value = value;
    this.mapStyle = mapStyle;
  }
  
  public String getOperator(){
    return this.op;
  }
  
  public String getValue(){
    return this.value;
  }
  
  public String getMapStyle(){
    return this.mapStyle;
  }

}
