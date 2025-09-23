/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.authentication.util;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class URLMatcher
{
  private static final Logger LOG = Logger.getLogger(URLMatcher.class.getName());

  private Pattern pattern;
  private String parameters;
  private String srcUrl;
  private Map<String, String> srcParameters = new HashMap<String, String>();

  public URLMatcher(String srcUrl, Map<String, String> srcParameters)
  {
    this.srcUrl = srcUrl;
    pattern = Pattern.compile(srcUrl);
    this.srcParameters = srcParameters;
  }
  
  public boolean match(String targetUrl, Map<String, String[]> targetParameters)
  {
    LOG.entering(this.getClass().getName(), "match", new Object[] { "the url " + targetUrl + "?" + targetParameters + " " + srcUrl + "?" + parameters });
    try
    {
      Matcher matcher = pattern.matcher(targetUrl);
      if(matcher.find())
      {
        if(targetParameters != null)
        {
          Iterator<Map.Entry<String, String>> srcIter = srcParameters.entrySet().iterator();
          while(srcIter.hasNext())
          {
            Map.Entry<String, String> srcEntry = srcIter.next();
            String[] values = targetParameters.get(srcEntry.getKey());
            if(values != null && values[0] != null)
            {
              if(!values[0].equals(srcEntry.getValue()))
              {
                return false;
              }
            }
          }
          return true;
        }
      }
    }
    catch(Exception e)
    {
      LOG.log(Level.WARNING, "the url " + targetUrl + "?" + targetParameters + " does not match pattern " + srcUrl + "?" + parameters, e);
    }
    LOG.exiting(this.getClass().getName(), "match", new Object[] { "the url " + targetUrl + "?" + targetParameters + " " + srcUrl + "?" + parameters });
    return false;
  }
}
