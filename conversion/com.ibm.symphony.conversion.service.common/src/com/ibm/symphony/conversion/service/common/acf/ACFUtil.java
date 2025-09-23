/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.acf;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import com.ibm.trl.acf.api.ActiveContentProcessor;
import com.ibm.trl.acf.api.ActiveContentProcessorException;
import com.ibm.trl.acf.api.ActiveContentProcessorFactory;
import com.ibm.trl.acf.lookup.ActiveContentProcessorFactoryHome;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class ACFUtil
{
  public static int ACF_ATTR_VALID = 0;
  
  public static int ACF_ATTR_INVALID_KEY = 1;
  
  public static int ACF_ATTR_INVALID_VALUE = 2;
  
  private static String DEFAULT_ENCODING = "UTF-8";
  
  private static String HTML = "text/html";
  
  private static final Logger LOG = Logger.getLogger(ACFUtil.class.getName());
  
  private static ActiveContentProcessor processor = null;
  
  private static ActiveContentProcessor getProcessor()
  {
    if (processor == null)
    {
      try
      {
        ActiveContentProcessorFactory factory = ActiveContentProcessorFactoryHome.getActiveContentProcessorFactory();
        InputStream is = (ACFUtil.class).getResourceAsStream("concord-acf-config.xml");
        processor = factory.getActiveContentProcessor(HTML, null, null, is);
        if(is!=null)
        {
          try
          {
            is.close();
          }
          catch (Exception e)
          {
          }
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "fail to initialize ACF", e);
      }
    }
    
    return processor;
  }
  
  /**
   * 
   * @param is  input stream
   * @param os  out put stream
   * @return true means there is suspicious content and has been processed.
   * @throws ActiveContentProcessorException
   * @throws IOException   * 
   */
  public static boolean process(InputStream is, OutputStream os) throws ActiveContentProcessorException, IOException
  {
    return getProcessor().process(is, os, DEFAULT_ENCODING);
  }
  
  public static boolean validate(String fileName)
  {
	  FileInputStream bais = null; 
	  String result = null;
	  try
	    {
	      bais = new FileInputStream(fileName);
	      result = getProcessor().validate(bais, DEFAULT_ENCODING);
	      bais.close();
	    }
	    catch (Exception e)
	    {
	      LOG.log(Level.WARNING, "fail to process active content", e);
	    }
	    
	  return result==null;
	  
  }
  /**
   * 
   * @param content
   * @return return true means there is suspicious content and has been processed
   */
  private static boolean process(String content)
  {
    ByteArrayInputStream bais = null; 
    ByteArrayOutputStream baos = null;
    boolean ret = false;
    try
    {
      bais = new ByteArrayInputStream(content.getBytes(DEFAULT_ENCODING));
      baos = new ByteArrayOutputStream();
      ret = process(bais, baos);
      bais.close();
      baos.close();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "fail to process active content", e);
    }
    
    return ret;
  }
  
  /*
   * criteria see concord-acf-config.xml
   */
  // attribute names which are not allowed  
  private static final String REGEXP_ATTR_NAME_FILTER = "(^(on.+|\\$\\{.+|fscommand.*|seeksegmenttime.*)|.*(\\<|\\>|\\/|\\//).*)";
  private static final Pattern PATTERN_ATTR_NAME_FILTER = Pattern.compile(REGEXP_ATTR_NAME_FILTER);
  // attribute names that need to check value
  private static final String REGEXP_ATTR_NAME_NEEDCHECK = "^(src|href|style|value|background|dynsrc|lowsrc|flashvars|pluginspage|data|action|method|formaction)$";
  private static final Pattern PATTERN_ATTR_NAME_NEEDCHECK = Pattern.compile(REGEXP_ATTR_NAME_NEEDCHECK);
  // attribute value that should not contain
  private static final String REGEXP_ATTR_VALUE_FILTER = "javascript\\:(?!void)|vbscript\\:|livescript\\:|data\\:\\s*?text\\/html";
  private static final Pattern PATTERN_ATTR_VALUE_FILTER = Pattern.compile(REGEXP_ATTR_VALUE_FILTER);
  // encoded value that should not contain
  private static final String REGEXP_ATTR_ENCODED_VALUE_FILTER = ";base64,";
  private static final Pattern PATTERN_ATTR_ENCODED_VALUE_FILTER = Pattern.compile(REGEXP_ATTR_ENCODED_VALUE_FILTER);
  
  private static boolean suspiciousAttrName(String name)
  {
    return PATTERN_ATTR_NAME_FILTER.matcher(name).matches();
  }
/*  
  private static boolean suspiciousAttrValue(String name, String value)
  {
    if (PATTERN_ATTR_NAME_NEEDCHECK.matcher(name).matches())
    {
      return PATTERN_ATTR_VALUE_FILTER.matcher(value).find();
    }
    
    return false;
  }
  
  private static boolean encodedAttrValue(String value)
  {
    return PATTERN_ATTR_ENCODED_VALUE_FILTER.matcher(value).find();
  }
*/
  /**
   * @param name
   * @param value
   * @param ignoreList if name is in ignoreList, escape ACF for the attribute
   * @return
   */
  public static int suspiciousAttribute(String name, String value, List<String> ignoreList)
  {
    if (ignoreList.contains(name))
    {
      return ACF_ATTR_VALID;
    }
    return suspiciousAttribute(name, value);
  }
/*  
  public static void main(String[] args)
  {
	  ACFUtil.suspiciousAttribute("backgroud", "url(\"../images/example.png\")");
  }
*/
  
  /*
   * check if it's a suspicious html element's attribute
   * return: true means suspicious
   */
  public static int suspiciousAttribute(String name, String value)
  {
    String n = name.toLowerCase().trim();
    if (suspiciousAttrName(n))
    {
      LOG.log(Level.WARNING, "Suspicious attribute name found: " + name);
      return ACF_ATTR_INVALID_KEY;
    }

//    String v = value.replaceAll("\"", "'"); // replace " with ' for defect 14632
    String htmlFrag = "<div " + name + "=\"" + value + "\"></div>";

    boolean processed = process(htmlFrag);
    if (!processed)
    {
      return ACF_ATTR_VALID;
    }
    else
    {
      StringBuffer sbf = new StringBuffer("Suspicious attribute found. ");
      sbf.append("Attribute name: ");
      sbf.append(name);
      sbf.append(". Attribute Value: ");
      sbf.append(value);
      sbf.append(" Constructed HTML: \"");
      sbf.append(htmlFrag);
      sbf.append("\". Processed HTML: \"");
      sbf.append(processed);
      sbf.append("\"");
      LOG.log(Level.WARNING, sbf.toString());      
      return ACF_ATTR_INVALID_VALUE;
    }
  }
  
  private static final String REGEXP_FOR_TAG = "<\\s*(?:(?:/([^>]+)>)|(?:!--([\\S|\\s]*?)-->)|(?:([^\\s>]+)\\s*((?:(?:[^\"'>]+)|(?:\"[^\"]*\")|(?:\'[^']*'))*)/?>))";
  private static final String REGEXP_FOR_ATTR = "([\\w\\-:.]+)(?:(?:\\s*=\\s*(?:(?:\"([^\"]*)\")|(?:'([^']*)')|([^\\s>]+)))|(?=\\s|$))";
  private static final String REGEXP_SCRIPTTAG = "<\\s*script.*";
  private static final Pattern PATTERN_FOR_TAG = Pattern.compile(REGEXP_FOR_TAG);
  private static final Pattern PATTERN_FOR_ATTR = Pattern.compile(REGEXP_FOR_ATTR);
  
  /*
   * check if html fragment contains suspicious scripts
   * return: true means suspicious
   */
//  public static boolean suspiciousHtml(String html)
//  {
//    HtmlTagParser parser = new HtmlTagParser(html);
//    try {
//      HtmlTag tag = null;
//      while ((tag = parser.next()) != null)
//      {
//        if ("script".equalsIgnoreCase(tag.getTagName()))
//          return true;
//        
//        List<Attribute> attrs = tag.getAttributes();
//        for (int j = 0; j < attrs.size(); j++)
//        {
//          Attribute attr = attrs.get(j);
//          if (attr.name == null)
//            continue;
//          
//          if (suspiciousAttribute(attr.name, attr.value))
//            return true;
//        }
//      }
//    }
//    catch (Exception e)
//    {
//      
//    }
//    
//    return false;
//  }

//  @Deprecated
//  public static boolean suspiciousHtmlRegex(String html)
//  {
//    html = html.toLowerCase();
//    try {
//      Matcher tagMatcher = PATTERN_FOR_TAG.matcher(html);
//      while (tagMatcher.find())
//      {
//        String tag = tagMatcher.group();
//        // check if it's a script tag
//        if (tag.matches(REGEXP_SCRIPTTAG))
//        {
//          return true;
//        }
//        
//        // check for attributes
//        Matcher attrMatcher = PATTERN_FOR_ATTR.matcher(tag);
//        while (attrMatcher.find())
//        {
//          String attr = attrMatcher.group();
//          String[] pair = attr.split("=", 2);
//          if (pair.length < 2)
//          {
//            continue;
//          }
//          if (suspiciousAttribute(pair[0], pair[1]))
//          {
//            return true;
//          }
//        }
//      }
//    }
//    catch (Exception e)
//    {
//      
//    }
//    
//    return false;
//  }
}

