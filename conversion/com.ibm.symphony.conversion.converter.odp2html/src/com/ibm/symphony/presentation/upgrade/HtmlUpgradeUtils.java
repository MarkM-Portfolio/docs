/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.symphony.presentation.upgrade;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPMetaFile;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class HtmlUpgradeUtils
{
  private static final int RETRY_SECONDS = 2;

  private static final String DEFAULT_ENCODING = "UTF-8";

  /**
   * @param context
   * @param htmlDoc
   *          html document used to create element
   * @param tagName
   *          type of element to create
   * @param prefix
   *          string to prefix ID
   * @return HTML element based on tag name passed in.
   */
  public static Element createHtmlElementWithoutIndexing(ConversionContext context, Document htmlDoc, String tagName, String prefix)
  {
    Element htmlNode = htmlDoc.createElement(tagName);
    ODPConvertUtil.setAutomaticHtmlConcordId(htmlNode, prefix);
    return (htmlNode);
  }

  /**
   * retrieves the conversionVersion from the conversionVersion.txt
   * 
   * @param parentFolder
   *          directory where conversionVersion.txt is located.
   * @return conversionVersion string or "unknown" if file does not exist (should always exist)
   */
  public static String getConversionVersion(String parentFolder)
  {
    File file = new File(parentFolder, "conversionVersion.txt");
    if (assertExistsFile(file, HtmlUpgradeUtils.RETRY_SECONDS))
    {
      String version = readFile(file.getAbsolutePath());
      return version;
    }
    return ODPCommonUtil.LOG_UNKNOWN;
  }

  /**
   * 
   * @param f
   *          - file to check if exists
   * @param seconds
   *          - will retry for this period of time
   * @return true if file exists, false otherwise
   */
  private static boolean assertExistsFile(File f, int seconds)
  {
    if (f.exists())
      return true;

    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / HtmlUpgradeUtils.RETRY_SECONDS;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(HtmlUpgradeUtils.RETRY_SECONDS);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }

      FileInputStream fis = null;
      boolean exists = true;
      try
      {
        fis = new FileInputStream(f);
      }
      catch (FileNotFoundException e)
      {
        exists = false;
      }
      finally
      {
        ODPMetaFile.closeResource(fis);
      }

      if (exists)
      {
        return true;
      }
    }

    return false;
  }

  /**
   * 
   * @param path
   *          file from which to read
   * @return contents of file in string
   */
  private static String readFile(String path)
  {
    int length = (int) new File(path).length();
    StringBuffer buffer = new StringBuffer(length);
    BufferedReader is = null;
    try
    {
      is = new BufferedReader(new InputStreamReader(new FileInputStream(path), DEFAULT_ENCODING));
      int ch;
      while ((ch = is.read()) > -1)
      {
        buffer.append((char) ch);
      }
    }
    catch (IOException e)
    {
      ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ERROR_OPENING_FILE, path));
      return null;
    }
    finally
    {
      ODPMetaFile.closeResource(is);
    }
    return buffer.toString();
  }
}
