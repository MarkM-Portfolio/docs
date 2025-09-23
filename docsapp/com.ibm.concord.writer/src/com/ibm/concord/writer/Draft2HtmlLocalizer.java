/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.writer;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.StringReader;
import java.util.logging.Level;
import java.util.logging.Logger;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.concord.document.common.util.XHTMLTransformer;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.docs.common.io.FileUtil;

public class Draft2HtmlLocalizer
{
  private static final Logger LOG = Logger.getLogger(Draft2HtmlLocalizer.class.getName());

  public static void localizePublishedContent(File contentFile, String content)
  {
    String parentFolder = contentFile.getParent();
    copyCSS(parentFolder);
    content = removeTaskandComments(content, contentFile);
    writeFile(parentFolder, content);
  }

  private static void writeFile(String converting, String content)
  {
    FileOutputStream fos = null;
    BufferedWriter writer = null;
    try
    {
      fos = new FileOutputStream(new File(converting + File.separator + "content.html"));
      writer = new BufferedWriter(new OutputStreamWriter(fos, "UTF8"));
      writer.write(content);
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.WARNING, "file not found", e);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "io error when writing content", e);
    }
    finally
    {
      if (writer != null)
      {
        try
        {
          if (writer != null)
          {
            writer.close();
          }
          if (fos != null)
          {
            fos.close();
          }
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "io error when closing stream", e);
        }
      }
    }
  }

  private static void copyCSS(String folder)
  {
    String rootPath = ConcordUtil.getRootPath();
    
    String cssPath = rootPath + File.separator + "js" + File.separator + "document" + File.separator + "ckeditor";
    String contentStyles = cssPath + File.separator + "contents.css";
    FileUtil.copyFileToDir(new File(contentStyles), new File(folder), "contents.css");

    // cssPath += File.separator + "_source" + File.separator + "plugins" + File.separator + "concordtemplates" +
    // File.separator + "templates" + File.separator + "css";
    cssPath = rootPath + File.separator + "js" + File.separator + "document" + File.separator + "ckplugins" + File.separator + "concordtemplates"
        + File.separator + "templates" + File.separator + "css";
    String concordStyles = cssPath + File.separator + "concordstyles.css";
    String templateCSS = cssPath + File.separator + "print.css";
    FileUtil.copyFileToDir(new File(concordStyles), new File(folder), "concordstyles.css");
    FileUtil.copyFileToDir(new File(templateCSS), new File(folder), "print.css");
//    String TableStyleCSS = rootPath + File.separator + "js" + File.separator + "document" + File.separator + "ckplugins" + File.separator +
//    "smarttables"+File.separator+"css"+File.separator+"smartTables.css";
//    FileUtil.copyFileToDir(new File(TableStyleCSS), new File(folder), "smartTables.css");
    // also copy images
    File targetImagePath = new File(folder, "images");
    targetImagePath.mkdirs();
    String sourceImagePath = cssPath + File.separator + "images";
    
    FileUtil.nfs_copyDirToDir(new File(sourceImagePath), targetImagePath, FileUtil.NFS_RETRY_SECONDS);
  }

  private static String addCSS(String content, File contentFile)
  {
    try
    {
      BufferedReader sReader = new BufferedReader(new StringReader(content));
      BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(contentFile), "UTF8"));
      Tidy tidy = createTidy();
      Document document = tidy.parseDOM(sReader, writer);
      updateHeader(document);
      sReader.close();
      writer.close();
      ByteArrayOutputStream bos = new ByteArrayOutputStream();
      tidy.pprint(document, bos);
      String fileContent = bos.toString("UTF8");
      bos.close();
      return fileContent;
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "io error when writing content", e);
      return null;
    }

  }
  
  private static String removeTaskandComments(String content, File contentFile)
  {
    try
    {
      BufferedReader sReader = new BufferedReader(new StringReader(content));
      BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(contentFile), "UTF8"));
      Tidy tidy = createTidy();
      Document document = tidy.parseDOM(sReader, writer);
      updateHeader(document);   
      XHTMLTransformer.filterElement(document.getDocumentElement(), false, true, true);
      sReader.close();
      writer.close();
      ByteArrayOutputStream bos = new ByteArrayOutputStream();
      tidy.pprint(document, bos);
      String fileContent = bos.toString("UTF8");
      bos.close();
      return fileContent;
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "io error when writing content", e);
      return null;
    }
  }

  private static Tidy createTidy()
  {
    Tidy tidy = new Tidy();
    tidy.setXHTML(true);
    tidy.setDocType("omit");
    tidy.setXmlOut(true);
    tidy.setXmlPIs(false);
    tidy.setInputEncoding("UTF8");
    tidy.setOutputEncoding("UTF8");
    tidy.setTidyMark(false);
    tidy.setLiteralAttribs(false);
    tidy.setRawOut(false);
    tidy.setEmacs(false);
    tidy.setQuiet(true);
    tidy.setShowErrors(0);
    tidy.setShowWarnings(false);
    tidy.setForceOutput(true);
    tidy.setMakeClean(false);
    tidy.setXmlTags(false);
    tidy.setSpaces(0);
    tidy.setWraplen(0);
    tidy.setWrapAttVals(false);
    tidy.setWrapSection(false);
    tidy.setQuoteNbsp(true);
    tidy.setNumEntities(true);
    tidy.setTrimEmptyElements(false);
    tidy.setTrimSpaces(false);
    tidy.setIgnoreCDATA(true);
    return tidy;
  }

  private static void updateHeader(Document document)
  {
    NodeList list = document.getElementsByTagName("head");
    Node head = list.item(0);
    // remove all other styles first
    Node next = head.getFirstChild();
    while (next != null)
    {
      boolean remove = false;
      if (next.getNodeName().equalsIgnoreCase("style"))
      {
        // remove = true;
      }
      // update character set to utf-8
      else if (next.getNodeName().equalsIgnoreCase("meta"))
      {
        NamedNodeMap attrs = next.getAttributes();
        Node attr = attrs.getNamedItem("http-equiv");
        if (attr != null)
        {
          attr = attrs.getNamedItem("content");
          if (attr != null)
          {
            attr.setNodeValue("text/html; charset=UTF-8");
          }
        }
      }
      /*else if (next.getNodeName().equalsIgnoreCase("link"))
      {
        NamedNodeMap map = next.getAttributes();
        if (map != null)
        {
          Node type = map.getNamedItem("type");
          if (type != null && type.getNodeValue().equalsIgnoreCase("text/css"))
          {
            remove = true;
          }
        }
      }*/
      if (remove)
      {
        Node tmp = next.getNextSibling();
        head.removeChild(next);
        next = tmp;
      }
      else
      {
        next = next.getNextSibling();
      }
    }

    createCSSElement(document, head, "concordstyles.css");
    createCSSElement(document, head, "print.css");
    createCSSElement(document, head, "contents.css");
  }

  private static void createCSSElement(Document document, Node headNode, String cssName)
  {
    Element link = document.createElement("link");
    headNode.appendChild(link);
    Attr attr = document.createAttribute("rel");
    attr.setValue("stylesheet");
    link.setAttributeNode(attr);
    attr = document.createAttribute("type");
    attr.setValue("text/css");
    link.setAttributeNode(attr);
    attr = document.createAttribute("href");
    attr.setValue(cssName);
    link.setAttributeNode(attr);
  }

}
