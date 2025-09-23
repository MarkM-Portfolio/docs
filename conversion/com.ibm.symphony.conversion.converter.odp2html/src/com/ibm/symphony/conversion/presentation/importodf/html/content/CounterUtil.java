/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.content;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;

@SuppressWarnings("unchecked")
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
