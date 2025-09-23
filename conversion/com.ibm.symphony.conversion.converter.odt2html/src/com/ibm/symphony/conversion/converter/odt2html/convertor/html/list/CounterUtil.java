/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html.list;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class CounterUtil
{
  private static String digits[] = {"", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"};
  private static String tens[] = {"", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"};
  private static String hundreds[] = {"", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"};
  private static String thousands[] = {"", "M", "MM", "MMM"};
  
  static Map<String,List<String>> charFormatTable ;
  static Map<String,List<String>> loopedFormatTable ;


  static {
    InputStream input = null;    
    try
    {
      input = CounterUtil.class.getResourceAsStream("sequence.json");
      JSONObject sequence = JSONObject.parse(input);
      
      charFormatTable = (Map<String, List<String>>) sequence.get("charFormatTable");
      loopedFormatTable = (Map<String, List<String>>) sequence.get("loopedFormatTable");
    }
    catch (IOException e)
    {
    }
    finally
    {
      if( input != null )
      {
        try
        {
          input.close();
        }
        catch (IOException e)
        {
        }
      }
    }
  }
  
  public static String getFormatCode(String format)
  {
    if ( format.length() == 1)
      return format;
    
    format = format.replace('.', ',');
    format = format.replace(' ', ',');
    format = format.replaceAll(",", "");
    return format;
  }
  

  public static Map<String, Integer> getCountersMap(ConversionContext context)
  {
    Map<String, Integer> counters = (Map<String, Integer>) context.get("Counters");
    if (counters == null)
    {
      counters = new HashMap<String, Integer>();
      context.put("Counters", counters);
    }
    return counters;
  }
  
  public static Set<String> getUsedCounterSet(ConversionContext context)
  {
    Set<String> counterNames = (Set<String>) context.get("UsedCounterNames");
    if (counterNames == null)
    {
      counterNames = new HashSet<String>();
      context.put("UsedCounterNames", counterNames);
    }
    return counterNames;
  }
  
  public static int getCounterValue(ConversionContext context, String name, int defaultValue)
  {
    Map<String, Integer> counters = getCountersMap(context);
    Integer val = counters.get(name);
    if( val != null)
    {
      return val;
    }
    else 
    {
      counters.put(name, defaultValue);
      return defaultValue;
    }
  }
  
  public static int getCounterValue(ConversionContext context, String name)
  {
    return getCounterValue(context, name, 0);
  }
  
  public static void setCounterValue(ConversionContext context, String name, int value)
  {
    getCountersMap(context).put(name, value);
  }
  
  public static void incrementCounterValue(ConversionContext context, String name, int step)
  {
    int val = getCounterValue(context, name);
    val+= step;
    setCounterValue(context, name, val);
  }
  
  public static void incrementCounterValue(ConversionContext context, String name)
  {
    incrementCounterValue(context, name, 1);
  }
  
   
  public static String getCounterValueFormat(int value, String format)
  {
    if( "I".equals(format) || "i".equals(format) )
      return romanFormat(value, format);
    
    if( value > 0)
    {
      List<String> values = charFormatTable.get(format);
      
      if( values != null)
      {
        StringBuilder result = new StringBuilder();
        int idx = (value + values.size() - 1) % values.size();

        int time = (value - 1) / values.size();
        //result.append(values[ idx ] );
        for( int i=0;i<=time;i++)
          result.append(values.get(idx) );
        
        return result.toString();        
      }
      
      values = loopedFormatTable.get(format);
      if( values != null)
      {
        int index = (value + values.size() - 1) % values.size();
        return values.get(index);
      }
    
    }
    return new Integer(value).toString();
  }
  
  public static String getCounterValueFormat(ConversionContext context, String name, int defaultValue, String format)
  {
    int value = getCounterValue(context, name, defaultValue);
   
    
    return getCounterValueFormat(value, format);
  }
  
  /*
   * If one counter has not been shown, it should be initialized. 
   * If it is shown, call this method will take no effect.
   */
  public static void initCounter(ConversionContext context, String name, int defaultValue)
  {
    Set<String> usedCounterSet = getUsedCounterSet(context);
    if(! usedCounterSet.contains(name) )
    {
      usedCounterSet.add(name);
      setCounterValue(context, name, defaultValue + 1);
    }
  }
  
  //increment and show.
  public static String showCounter(ConversionContext context, String name, String format )
  {
    if( format.length() == 0)
      return "";
    
    getUsedCounterSet(context).add(name);
    incrementCounterValue(context,name,1);
    return getCounterValueFormat(context,name,format);
  }
  public static String getCounterValueFormat(ConversionContext context, String name, String format)
  {
    return getCounterValueFormat(context, name, 1, format);
  }
  

  

  public static String romanFormat(int value, String format)
  {
    if( value >= 4000 || value <=0 )
    {
      return new Integer(value).toString();
    }
    
    StringBuilder result = new StringBuilder();

    result.append( thousands[ value / 1000 ] );
    result.append( hundreds[ (value % 1000) / 100 ] );
    result.append( tens[ (value % 100) / 10 ] );
    result.append( digits[ value % 10 ] );
    if( "I".equals(format) )
    {
       return result.toString();
    }
    else
    {
      return result.toString().toLowerCase();
    }
  }
}
