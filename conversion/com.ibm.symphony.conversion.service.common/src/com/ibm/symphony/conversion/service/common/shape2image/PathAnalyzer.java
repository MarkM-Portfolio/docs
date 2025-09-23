/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.shape2image;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;

import org.apache.commons.lang.StringUtils;

import java.util.logging.Level;
import java.util.logging.Logger;

public class PathAnalyzer
{
  private static final String CLASS = PathAnalyzer.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  private FormulaParser parser;

  private ODFPathIntepreter intepreter;

  public PathAnalyzer(FormulaParser parser)
  {
    this.parser = parser;
    intepreter = new ODFPathIntepreter();
  }

  public String preprocess(String path)
  {
    StringTokenizer tokens = new StringTokenizer(path);
    StringBuilder buf = new StringBuilder(128);
    while (tokens.hasMoreTokens())
    {
      String token = tokens.nextToken();
      if (token.startsWith("?"))
      {
        buf.append((int) parser.getResult(token.substring(1))).append(' ');
      }
      else if (token.startsWith("$"))
      {
        buf.append((int) parser.getResult(token)).append(' ');
      }
      else
      {
        buf.append(token).append(' ');
      }
    }
    if (LOG.isLoggable(Level.FINE))
    {
      LOG.fine("ODF PATH = " + buf.toString().trim()); // NON NLS
    }
    return buf.toString().trim();
  }

  public List<String> scan(String path)
  {
    List<String> commands = new ArrayList<String>();
    StringBuilder parameters = null;
    StringTokenizer tokens = new StringTokenizer(path);
    do
    {
      String token = tokens.nextToken();
      if (token.length() == 1 && StringUtils.isAlpha(token))
      {
        if (parameters != null)
          commands.add(parameters.toString().trim());
        parameters = new StringBuilder(16);
        parameters.append(token);
      }
      else
      {
        parameters.append(token);
      }
      parameters.append(' ');
      if (!tokens.hasMoreTokens())
        commands.add(parameters.toString().trim());
    }
    while (tokens.hasMoreTokens());
    return commands;
  }

  public Map<String, String> parse(String path)
  {
    if (path == null)
    {
      LOG.warning("The path information is missing");
      return null;
    }
    String cpath = preprocess(path);
    if (cpath == null)
      return null;
    List<String> commands = scan(cpath);
    return intepreter.parse(commands);
  }

  public String postprocess(String path)
  {
    StringTokenizer tokens = new StringTokenizer(path);
    StringBuilder buf = new StringBuilder(128);
    while (tokens.hasMoreTokens())
    {
      String token = tokens.nextToken();
      if (token.startsWith("?"))
      {
        buf.append((int) parser.getResult(token.substring(1))).append(' ');
      }
      else if (token.startsWith("$"))
      {
        buf.append((int) parser.getResult(token)).append(' ');
      }
      else
      {
        buf.append(token).append(' ');
      }
    }
    if (LOG.isLoggable(Level.FINE))
    {

      LOG.fine("ODF PATH=" + buf.toString().trim()); // NON NLS
    }
    return buf.toString().trim();
  }

  public double getMaxXCoordinate()
  {
    return intepreter.getMax_x();
  }

  public double getMaxYCoordinate()
  {
    return intepreter.getMax_y();
  }

  public double getMinXCoordinate()
  {
    return intepreter.getMin_x();
  }

  public double getMinYCoordinate()
  {
    return intepreter.getMin_y();
  }

  public void setOriginalViewBox(String viewbox)
  {
    intepreter.setViewBox(viewbox);
  }
}
