/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lc3.util;

import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PatternResolver
{

  private static final String SUBSTITUTE = "{org}";

  private static final Map<String, PatternResolver> serviceResolverCache = new ConcurrentHashMap<String, PatternResolver>();

  private String pattern;

  private Pattern patternRE;

  private PatternResolver(String pattern)
  {
    this.pattern = pattern;
    patternRE = convertUrlPatternToRegExp();    
  }

  public String extractSegmentFromUrl(String url)
  {
    String segment = null;

    // convert the pattern to a regexp for extraction. http://{org}.example.com will become http://(.+).example.com

    Matcher matcher = patternRE.matcher(url);

    // if patterns have multiple {org} subs in one, make sure they all are the same value
    Set<String> matches = new LinkedHashSet<String>();

    if (matcher.matches())
    {
      for (int i = 1; i <= matcher.groupCount(); ++i)
      {
        matches.add(matcher.group(i));
      }
    }

    // if all substitutions are the same, the length of the set will be 1. if it's > 1, we're in an invalid state.
    if (matches.size() > 1)
    {
      throw new IllegalArgumentException();
    }
    else if (matches.size() == 1)
    {
      segment = matches.iterator().next();
    }

    return segment;
  }

  public String buildUrlFromSegment(String segment)
  {
    if (segment == null)
      segment = "null";

    int oldIdx = 0;
    int idx = 0;

    StringBuilder url = new StringBuilder(pattern.length() + segment.length());

    while ((idx = pattern.indexOf(SUBSTITUTE, oldIdx)) != -1)
    {
      url.append(pattern.substring(oldIdx, idx)).append(segment);
      oldIdx = idx + SUBSTITUTE.length();
    }

    url.append(pattern.substring(oldIdx));

    return url.toString();
  }

  private Pattern convertUrlPatternToRegExp()
  {
    // first, convert {org} to (.+) for capturing
    String regexp = pattern.replace(SUBSTITUTE, "(.+)");

    // now, make it so that the ports, if there, are ignored
    // to do this, find the first ':' after the scheme but before the path
    int startIdx = 9; // this will skip http:// and https://, which we need to do

    int portIdx = regexp.indexOf(':', startIdx);
    int pathIdx = regexp.indexOf('/', startIdx);

    if (portIdx != -1 && portIdx < pathIdx)
    {
      // if we're here, then we have a port. convert it from an actual port to an optional regexp
      StringBuilder tmp = new StringBuilder(regexp.substring(0, portIdx));
      tmp.append("(?:\\:\\d+)?").append(regexp.substring(pathIdx));

      regexp = tmp.toString();
    }

    regexp = regexp + ".*";

    return Pattern.compile(regexp);
    
  }

  public static void setServicePattern(String serviceName, boolean isSecure, String pattern)
  {
    if (serviceName == null || pattern == null)
    {
      throw new IllegalArgumentException();
    }

    String key = getCacheKey(serviceName, isSecure);

    if (serviceResolverCache.containsKey(key))
    {
      return;
    }

    serviceResolverCache.put(key, new PatternResolver(pattern));
  }

  public static PatternResolver getServicePattern(String serviceName, boolean isSecure)
  {
    if (serviceName == null)
      return null;

    String key = getCacheKey(serviceName, isSecure);
    return serviceResolverCache.get(key);
  }

  private static String getCacheKey(String serviceName, boolean isSecure)
  {
    if (serviceName == null)
      return null;

    StringBuilder builder = new StringBuilder(serviceName.toLowerCase(Locale.ENGLISH));
    builder.append("|").append(String.valueOf(isSecure));

    return builder.toString();
  }
}
