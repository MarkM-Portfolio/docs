/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.presentation;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.File;
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
import org.w3c.dom.Text;

import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.JTidyUtil;
import com.ibm.docs.common.io.FileUtil;

public class Draft2HtmlLocalizer
{
  private static final String CLASS = Draft2HtmlLocalizer.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  public static void localizePublishedContent(File contentFile, String content)
  {
    String parentFolder = contentFile.getParent();
    copyCSS(parentFolder);
    content = addCSS(content, contentFile);
    writeFile(parentFolder, content);
  }

  public static void writeFile(String converting, String content)
  {
    FileOutputStream fos = null;
    BufferedWriter writer = null;
    try
    {
      fos = new FileOutputStream(new File(converting + File.separator + "content.html"));
      writer = new BufferedWriter(new OutputStreamWriter(fos, "UTF8"));
      writer.write(content);
    }
    catch (Exception e)
    {
      LOG.logp(Level.WARNING, CLASS, "writeFile", e.getLocalizedMessage(), e);
    }
    finally
    {
      closeResource(writer);
      closeResource(fos);
    }
  }

  private static void copyCSS(String folder)
  {
    String root = ConcordUtil.getRootPath();

    String cssPath = buildPath(new String[] { root, "js", "ckeditor" });
    String contentStyles = buildPath(new String[] { cssPath, "contents.css" });// cssPath + File.separator + "contents.css";
    FileUtil.copyFileToDir(new File(contentStyles), new File(folder), "contents.css");

    cssPath = buildPath(new String[] { root, "js", "ckplugins", "concordtemplates", "templates", "css" });

    String concordStyles = cssPath + File.separator + "concordstyles.css";
    FileUtil.copyFileToDir(new File(concordStyles), new File(folder), "concordstyles.css");

    String templateCSS = buildPath(new String[] { cssPath, "odpprint.css" });
    FileUtil.copyFileToDir(new File(templateCSS), new File(folder), "odpprint.css");

    String TableStyleCSS = root + File.separator + "js" + File.separator + "ckplugins" + File.separator + "smarttables" + File.separator
        + "css" + File.separator + "smartTables.css";
    FileUtil.copyFileToDir(new File(TableStyleCSS), new File(folder), "smartTables.css");

    // String[] CSS_NAMES = { "presentation.css", "tableStyles.css", "documentContent.css", "slideEditor.css" };
    // String presentationCssPath = buildPath(new String[] { sc.getRealPath("/"), "styles", "css", "presentations" });
    // for (int f = 0; f < CSS_NAMES.length; f++)
    // {
    // String cssFile = buildPath(new String[] { presentationCssPath, CSS_NAMES[f] });
    // FileUtil.copyFileToDir(new File(cssFile), new File(folder), CSS_NAMES[f]);
    // }

    // also copy images
    File targetImagePath = new File(folder, "images");
    targetImagePath.mkdirs();
    String sourceImagePath = cssPath + File.separator + "images";
    FileUtil.nfs_copyDirToDir(new File(sourceImagePath), targetImagePath, FileUtil.NFS_RETRY_SECONDS);
  }

  private static String buildPath(String[] pathElements)
  {
    StringBuffer buffer = new StringBuffer();
    for (int i = 0; i < pathElements.length; i++)
    {
      if (i > 0)
      {
        buffer.append(File.separator);
      }
      buffer.append(pathElements[i]);
    }
    return buffer.toString();
  }

  private static String addCSS(String content, File contentFile)
  {
    BufferedReader sReader = null;
    BufferedWriter writer = null;
    try
    {
      sReader = new BufferedReader(new StringReader(content));
      writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(contentFile), "UTF8"));
      Tidy tidy = JTidyUtil.getTidy();
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
    catch (Exception e)
    {
      LOG.logp(Level.SEVERE, CLASS, "Unexpected exception in addCSS()", e.getLocalizedMessage(), e);
      return null;
    }
    finally
    {
      closeResource(sReader);
      closeResource(writer);
    }
  }

  private static void updateHeader(Document document)
  {
    NodeList list = document.getElementsByTagName("head");
    Node head = list.item(0);
    createCSSElement(document, head, "concordstyles.css");
    createCSSElement(document, head, "odpprint.css");
    createCSSElement(document, head, "contents.css");

    // add css for print
    Element styleElement = document.createElement("style");
    styleElement.setAttribute("type", "text/css");
    head.appendChild(styleElement);

    // for print.css , two slide in one page
    Text textElement = document.createTextNode(".PM1_concord {height:392px; width:522px; border:1px #aaaaaa solid;"
        + "margin-left:15px;margin-right:7px;margin-top:25px;font-size: 11.882988px;position: relative;} " + "p{margin:0 !important;}"
        + "p, ul{font-size:1em;}"
        + ".table_table {font-size:1em;height:100%;width:100%;border-collapse:collapse;} .table_table td{border:1px solid;}");

    // for odpprint.css, one slide in one page
    // Text textElement = document.createTextNode(".PM1_concord {height:1568mm; width:2088mm; border:3px #aaaaaa solid;" +
    // "margin-left:35mm;margin-right:7mm;margin-top:50mm;font-size: 47.531952mm; position: relative;}");

    styleElement.appendChild(textElement);

    // modify the path of office_styles.css and office_automatic_styles.css
    NodeList linkList = document.getElementsByTagName("link");

    int i = 0;
    Node item = linkList.item(i);
    while (item != null)
    {
      NamedNodeMap attrs = item.getAttributes();

      int j = 0;
      Node attr = attrs.item(i);
      while (attr != null)
      {
        if (attr.getNodeName().equalsIgnoreCase("href"))
        {
          String value = attr.getNodeValue();
          if (value.indexOf("office_styles.css") >= 0)
            attr.setNodeValue("office_styles.css");
          else if (value.indexOf("office_automatic_styles.css") >= 0)
            attr.setNodeValue("office_automatic_styles.css");
        }
        attr = attrs.item(++j);
      }
      item = linkList.item(++i);
    }
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

  /*
   * Quietly and cleanly closes the Closeable object (Streams, Readers, etc) if it is still open
   * 
   * @param closeable Closeable object (Streams, Readers, etc)
   */
  public static void closeResource(Closeable closeable)
  {
    if (closeable != null)
    {
      try
      {
        closeable.close();
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "close stream IOException", e);
      }
    }
  }
}
