/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2pdf;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import symphony.org.w3c.tidy.Tidy;

import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.common.util.JTidyUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;

public class DefaultProcessor implements IProcessor
{
  protected Tidy tidy = JTidyUtil.getTidy();
  
  private String backupFileName = "bak";
 
  public Document preProcess(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    //backup the file
    backupFileName  = FileUtil.copyFileToDir(sourceFile, sourceFile.getParentFile(), "bak");
    
    InputStream in = null;
    Document doc = null;
    try
    {
      in = new BufferedInputStream(new FileInputStream(sourceFile));
      doc = tidy.parseDOM(in, (OutputStream) null);
      //PDF reactor can not download img for internet on server
      //so remove all the nodes contains images from internet.
      NodeList imgs = doc.getElementsByTagName("img");
      for (int i = 0; i < imgs.getLength(); i++)
      {
        Element img = (Element) imgs.item(i);
        String src = img.getAttribute("src");
        if (src != null && !src.startsWith("Pictures"))
          img.setAttribute("src", "");
      }
    }
    catch (FileNotFoundException e)
    {
      e.printStackTrace();
    }
    finally 
    {
      if( in != null)
        try
        {
          in.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
    }
    return doc;
    
  }
  
  public void postProcess(File sourceFile, File targetFolder, Map parameters)
  {
    //roll back file, and delete backup file
    File backupFile = new File(backupFileName);
    FileUtil.copyFileToDir(backupFile, sourceFile.getParentFile(), sourceFile.getName());
    FileUtil.deleteFile(backupFile);
  }

  public String getUserStyle(Map parameters)
  {
    return null;
  }

}
