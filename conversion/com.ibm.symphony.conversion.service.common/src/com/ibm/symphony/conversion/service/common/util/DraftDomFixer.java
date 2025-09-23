/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.symphony.conversion.service.common.util;

import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.imageio.ImageIO;

import org.jsoup.Jsoup;
import org.jsoup.helper.StringUtil;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Entities.EscapeMode;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.Elements;

class Point extends Object
{
  public double x;

  public double y;
}

class Body extends Object
{
  public double l;

  public double t;

  public double w;

  public double h;
}

public class DraftDomFixer
{
  private final String fversion = "1";

  private final String text8203 = "=_8203_=";

  private final String rtext8203 = String.valueOf((char) 8203);

  private final String rtext65279 = String.valueOf((char) 65279);

  private final String CLASS = DraftDomFixer.class.getName();

  private final Logger LOG = Logger.getLogger(CLASS);

  private boolean indebug = false;

  private String rootid;

  private HashMap<String, String> slideWrapperIds = new HashMap<String, String>();

  private HashMap<String, String> slideElementIds = new HashMap<String, String>();

  private HashMap<String, String> styleHashMap = new HashMap<String, String>();

  private HashMap<String, String> curElementLineIds = new HashMap<String, String>();

  private ArrayList<Integer> zindexSet = new ArrayList<Integer>();

  private HashMap<String, String> curElementSpanIds = new HashMap<String, String>();

  private String curSlideId;

  private String curElementId;

  private Document document;

  private String curElementLineId;

  private int startZindex = 500;

  private boolean needFixZIndex;

  private double slideH = 6857999.72534178;

  private double slideW = 9143999.862670908;

  private int defaultImageWidth = 800;

  private int defaultImageHight = 600;

  private int defaultImageSize = 500;

  private int defaultPoolSize = 10;

  private String getFamily(Element ele)
  {
    String presentationClass = ele.attr("presentation_class");
    String drawLayer = ele.attr("draw_layer");
    Element dataNode = null;
    Elements children = ele.children();
    if (children != null && children.size() > 0)
      dataNode = children.get(0);

    if (presentationClass.equals("outline") || presentationClass.equals("title") || presentationClass.equals("subtitle"))
    {
      return "text";
    }
    else if (presentationClass.equals("object"))
    {
      return "object";
    }
    else if (drawLayer.equals("backgroundobjects"))
    {
      return "background";
    }
    else if (presentationClass.equals("graphic") || ((dataNode != null) && (dataNode.attr("class").contains("draw_image"))))
    {
      ele.attr("presentation_class", "graphic");
      return "graphic";
    }
    else if (presentationClass.equals("date-time"))
    {
      return "date-time";
    }
    else if (presentationClass.equals("footer"))
    {
      return "footer";
    }
    else if (presentationClass.equals("header"))
    {
      return "header";
    }
    else if (presentationClass.equals("page-number"))
    {
      return "page-number";
    }
    else if (presentationClass.equals("notes"))
    {
      return "notes";
    }
    else if (((dataNode != null) && (dataNode.tagName().toLowerCase().equals("table"))) || presentationClass.equals("table"))
    {
      ele.attr("presentation_class", "table");
      return "table";
    }
    else if (presentationClass.equals("group"))
    {
      return "group";
    }
    else if (presentationClass.equals("chart"))
    {
      return "chart";
    }
    else if (presentationClass.equals("shape_svg"))
    {
      return "shape_svg";
    }
    else if ((dataNode != null)
        && ((dataNode.attr("class").contains("draw_text-box")) || dataNode.attr("odf_element").equalsIgnoreCase("draw_text-box")))
    {
      ele.attr("presentation_class", "");
      return "text";
    }
    else
    {
      return "";
    }
  }

  private String getFileString(String path)
  {
    InputStream is = null;
    BufferedReader br = null;
    String line = "";
    StringBuffer buf = new StringBuffer();
    try
    {
      is = new FileInputStream(path);
      br = new BufferedReader(new InputStreamReader(is, "UTF-8"));
      while ((line = br.readLine()) != null)
        buf.append(line + "\n");
      is.close();
    }
    catch (Exception e)
    {
    }
    finally
    {
      try
      {
        is.close();
      }
      catch (IOException e)
      {
      }
    }
    return buf.toString();
  }

  private void setFileString(String content, String path)
  {
    FileOutputStream fos = null;
    BufferedWriter bufferedWriter = null;
    try
    {
      fos = new FileOutputStream(new File(path));
      bufferedWriter = new BufferedWriter(new OutputStreamWriter(fos, "UTF-8"));
      bufferedWriter.write(content);
    }
    catch (FileNotFoundException ex)
    {
      LOG.log(Level.WARNING, "FileNotFoundException", ex);
    }
    catch (IOException ex)
    {
      LOG.log(Level.WARNING, "IOException", ex);
    }
    finally
    {
      try
      {
        if (bufferedWriter != null)
        {
          bufferedWriter.flush();
          bufferedWriter.close();
        }
        if (fos != null)
        {
          fos.close();
        }
      }
      catch (IOException ex)
      {
        LOG.log(Level.WARNING, "IOException", ex);
      }
    }
  }

  private void localTest()
  {
    String localDevDraftFolder = "C:\\IBMConversion\\data\\output\\odp2html\\389b897b-a3eb-41cf-a0d2-94f90040b544\\Pictures";
    dealImages(localDevDraftFolder);
    if (!localDevDraftFolder.isEmpty())
      return;
    boolean loopLocalDev = false;
    if (loopLocalDev)
    {
      indebug = false;
      int count = 0;
      // C:\IBM\sharedata\draft\ibm\draft\1\938\32700.odp\media
      localDevDraftFolder = "C:\\IBM\\sharedata\\draft\\ibm\\draft\\";
      File lddf = new File(localDevDraftFolder);
      if (lddf.isDirectory())
      {
        File[] lddffs = lddf.listFiles();
        for (File ldfile : lddffs)
        {
          if (ldfile.isDirectory())
          {
            File[] ldfiles = ldfile.listFiles();
            for (File filedds1 : ldfiles)
            {
              if (filedds1.isDirectory())
              {
                File[] filedds12 = filedds1.listFiles();
                for (File filedds11 : filedds12)
                {
                  String media = filedds11.getAbsoluteFile() + "\\media\\content.html";
                  File content2 = new File(media);
                  if (content2.exists())
                  {
                    count++;
                    System.out.println("fixing:" + media);
                    String content = getFileString(media);
                    String fixedDom = fixDom(content);
                    if (indebug)
                      LOG.info("--- Fix Dom Hteml Content ---\n" + fixedDom);
                    System.out.println("s");
                  }
                }

              }
            }

          }
        }
        System.out.println("fixed content.html:" + count);
      }
    }
    else
    {
      // just debug single file.
      indebug = false;
      // String path =
      // "D:\\dev\\shared\\draft\\ibm\\draft\\869\\576\\m.pptx\\media\\content.html";
      // String path =
      // "D:\\dev\\shared\\draft\\ibm\\draft\\368\\58\\m1.pptx\\media\\content.html";
      // String path =
      // "D:\\dev\\shared\\draft\\ibm\\draft\\139\\841\\m2.pptx\\media\\content.html";
      // String path =
      // "D:\\dev\\shared\\draft\\ibm\\draft\\766\\763\\m3.pptx\\media\\content.html";
      // String path =
      // "D:\\dev\\shared\\draft\\ibm\\draft\\286\\551\\m4.pptx\\media\\content.html";
      // String path = "D:\\mig\\content.html";
      for (int i = 0; i < 1000; i++)
      {
        String path = "E:\\export\\31\\content.html";
        String content = getFileString(path);
        String fixedDom = fixDom(content);
        String path1 = "E:\\export\\31o\\content11.html";
        setFileString(fixedDom, path1);
        // if (indebug)
        LOG.info("--- Fix Dom Hteml Content ---" + i);
      }
    }
  }

  // for conversion used.
  public void fixDomByPath(String filePath, int dWidth, int dHeight, int dImageSize, int dPoolSize)
  {
    String content = getFileString(filePath);
    String fixedDom = fixDom(content);
    setFileString(fixedDom, filePath);
    // Downsize large dimension picture to the give size in
    // conversion-config.json,
    defaultImageWidth = dWidth;
    defaultImageHight = dHeight;
    defaultImageSize = dImageSize;
    defaultPoolSize = dPoolSize;
    String pictureseFolder = filePath.replace("content.html", "Pictures");
    long startTime = System.currentTimeMillis();
    dealImages(pictureseFolder);
    long endTime = System.currentTimeMillis();
    LOG.info("Down images size cost time: " + (endTime - startTime) + " ms");
  }

  public static void main(String[] args) throws Exception
  {
    DraftDomFixer domf = new DraftDomFixer();
    domf.localTest();
  }

  private void dealImages(String imageFolder)
  {
    HashMap<String, String> todoList = new HashMap<String, String>();
    File lddf = new File(imageFolder);
    if (lddf.isDirectory())
    {
      File[] lddffs = lddf.listFiles();
      for (File ldfile : lddffs)
      {
        String media = ldfile.getAbsoluteFile().getAbsolutePath();
        int lastD = media.lastIndexOf(".");
        if (lastD < 0)
          continue;
        String extension = media.substring(lastD + 1).toLowerCase();
        // only deal with jpg,jpeg,bmp,png
        if (extension.equalsIgnoreCase("jpg") || extension.equalsIgnoreCase("jpeg") || extension.equalsIgnoreCase("bmp"))
        {
          todoList.put(media, "jpeg");
        }
        else if (!extension.equalsIgnoreCase("png"))
        {
          continue;
        }
        else
          todoList.put(media, "png");
      }
    }
    if (todoList.isEmpty())
      return;
    final CountDownLatch end = new CountDownLatch(todoList.size());
    Iterator<Entry<String, String>> it = todoList.entrySet().iterator();
    ExecutorService exe = Executors.newFixedThreadPool(defaultPoolSize);
    while (it.hasNext())
    {
      Entry<String, String> pairs = (Entry<String, String>) it.next();
      final String imgSrc = pairs.getKey().toString();
      final String formatName = pairs.getValue().toString();
      exe.execute(new Runnable()
      {
        @Override
        public void run()
        {
          downImageSize(imgSrc, formatName);
          end.countDown();
        }
      });
    }
    try
    {
      end.await();
    }
    catch (InterruptedException e)
    {
      e.printStackTrace();
    }
    finally
    {
      LOG.info("All downImageSize job ends,amount:" + todoList.size());
    }
    exe.shutdown();
  }

  private void downImageSize(String imagePath, String formatName)
  {
    int width = defaultImageWidth;
    int height = defaultImageHight;
    String srcFilePath = imagePath;
    String targetFilePath = imagePath;
    try
    {
      File targetFile = new File(targetFilePath);
      if (targetFile.length() < defaultImageSize * 1024)
      {
        return;
      }
      BufferedImage srcBufImage;
      srcBufImage = ImageIO.read(new File(srcFilePath));
      if (srcBufImage == null)
        return;
      int iWidth = srcBufImage.getWidth();
      int iHeight = srcBufImage.getHeight();
      float rate = (float) iWidth / (float) iHeight;
      boolean deal = false;
      if (iWidth > width)
      {
        width = defaultImageWidth;
        iHeight = (int) (defaultImageWidth / rate);
        deal = true;
      }
      else
      {
        width = iWidth;
      }
      if (iHeight > height)
      {
        height = defaultImageHight;
        width = (int) (defaultImageHight * rate);
        deal = true;
      }
      else
      {
        height = iHeight;
      }
      if (deal)
      {
        // the size of image is large than defaultImageWidth or
        // defaultImageHight.
        Image thumbnail = srcBufImage.getScaledInstance(width, height, Image.SCALE_SMOOTH);
        BufferedImage bufTarget = null;
        if (formatName.equalsIgnoreCase("jpeg"))
          bufTarget = new BufferedImage(thumbnail.getWidth(null), thumbnail.getHeight(null), BufferedImage.TYPE_INT_RGB);
        else
          bufTarget = new BufferedImage(thumbnail.getWidth(null), thumbnail.getHeight(null), BufferedImage.TYPE_INT_ARGB);
        bufTarget.getGraphics().drawImage(thumbnail, 0, 0, null);
        ImageIO.write(bufTarget, formatName, targetFile);
      }
    }
    catch (IOException e)
    {
      LOG.warning("==IOException while downImageSize,the media path is:" + imagePath);
    }
    return;
  }

  public String fixDom(String html)
  {
    if (indebug)
      LOG.info("--- start to do fix dom content ");
    String vtag = "<body fversion=\"";
    int findex = html.indexOf(vtag);
    if (findex > -1)
    {
      String version = "1";// html.substring(findex + vtag.length(),
      // findex + 1 + vtag.length());
      System.out.println("fixed content dom version is:" + version);
      return html;
    }
    html = html.replaceAll("&#8203;", text8203).replaceAll(rtext8203, text8203);
    String orgHtml = html;
    try
    {
      long d = System.currentTimeMillis();
      document = Jsoup.parse(html);
      long d2 = System.currentTimeMillis();
      if (indebug)
        LOG.info("time load html  :  " + (d2 - d));
      Elements heads = document.getElementsByTag("head");
      Element head = null;
      if (heads.size() > 1)
      {
        for (int i = heads.size() - 1; i > 0; i--)
        {
          heads.get(i).remove();
        }
        head = heads.get(0);
      }
      else if (heads.size() == 1)
      {
        head = heads.get(0);
      }
      if (head != null)
      {
        fixDomHeadStyles(head);
      }
      Elements roots = document.getElementsByClass("office_presentation");
      Element root = null;
      Element body = document.body();
      String bodyid = body.attr("id");
      if (bodyid.isEmpty())
      {
        body.attr("id", "body_id_0000");
      }
      if (roots != null && roots.size() > 0)
      {
        root = (Element) roots.get(0);
      }
      if (root == null)
        root = body;

      rootid = root.attr("id");
      Elements slideWrappers = root.children();
      for (int j = 0; j < slideWrappers.size(); j++)
      {
        Element slideWrapperEle = slideWrappers.get(j);
        if (slideWrapperEle.attr("class").contains("slideWrapper"))
        {
          Elements wpChild = slideWrapperEle.children();
          if (wpChild.size() == 0)
          {
            slideWrapperEle.remove();
          }
          else
          {
            fixDomSlide(slideWrapperEle);
          }
        }
      }
      document.select("svg img").tagName("image");
      long d3 = System.currentTimeMillis();
      if (indebug)
      {
        LOG.info("time fix slides  :  " + (d3 - d2));
        LOG.info("time whole fixDom  :  " + (d3 - d));
      }
      document.outputSettings().prettyPrint(false);
      document.outputSettings().escapeMode(EscapeMode.xhtml);
      html = document.outerHtml().trim();
    }
    catch (Exception e)
    {
      LOG.warning(CLASS + "ignore domfix");
      html = orgHtml;
    }
    Matcher m1 = Pattern.compile("[\r\n]*").matcher(html);
    if (m1.find())
    {
      html = m1.replaceAll("");
    }
    html = html.replaceAll("</span>", "1/span>");
    Matcher m2 = Pattern.compile(">+\\s+<").matcher(html);
    if (m2.find())
    {
      html = m2.replaceAll("><");
    }
    html = html.replaceAll("1/span>", "</span>");
    html = html.replaceAll("&amp;", "&").replaceAll("&apos;", "\'");
    int hend = html.indexOf("</head>");
    if (hend > 0)
    {
      String hb = html.substring(0, hend);
      hb = hb.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", "\"");
      String he = html.substring(hend, html.length());
      html = hb + he;
    }
    html = html.replaceAll(text8203, "&#8203;");
    html = html.replaceAll(" &#8203;", " ");
    html = html.replaceAll("<body", "<body fversion=\"" + fversion + "\"");
    slideWrapperIds.clear();
    slideElementIds.clear();
    styleHashMap.clear();
    curElementLineIds.clear();
    zindexSet.clear();
    curElementSpanIds.clear();
    return html;
  }

  private void fixDomHeadStyles(Element head)
  {
    Elements styles = head.getElementsByTag("style");
    for (Element style : styles)
    {
      parseHeadStyle(style);
    }
  }

  private void parseHeadStyle(Element styleElement)
  {
    String styleText = styleElement.html();
    String newStyleText = "";
    String[] styleLists = styleText.split("\\}");
    for (String stylePair : styleLists)
    {
      String[] styleItem = stylePair.split("\\{");
      if (styleItem.length == 2)
      {
        String k = styleItem[0].trim();
        String v = styleItem[1].trim();
        parseStyleToJSON(v);
        fixDomStylesBorder();
        v = parseStyleJSONtoString();
        newStyleText = newStyleText + k + " {" + v + "}\n";
      }
    }
    styleElement.removeAttr("type");
    styleElement.text(newStyleText);
  }

  private void fixDomStylesBorder()
  {
    String newStyleText = (String) styleHashMap.get("border-right");
    if (newStyleText != null)
    {
      newStyleText = convertBorderPt2EM(newStyleText);
      styleHashMap.put("border-right", newStyleText);
    }
    newStyleText = (String) styleHashMap.get("border-left");
    if (newStyleText != null)
    {
      newStyleText = convertBorderPt2EM(newStyleText);
      styleHashMap.put("border-left", newStyleText);
    }
    newStyleText = (String) styleHashMap.get("border-top");
    if (newStyleText != null)
    {
      newStyleText = convertBorderPt2EM(newStyleText);
      styleHashMap.put("border-top", newStyleText);
    }
    newStyleText = (String) styleHashMap.get("border-bottom");
    if (newStyleText != null)
    {
      newStyleText = convertBorderPt2EM(newStyleText);
      styleHashMap.put("border-bottom", newStyleText);
    }
    newStyleText = (String) styleHashMap.get("border");
    if (newStyleText != null)
    {
      newStyleText = convertBorderPt2EM(newStyleText);
      styleHashMap.put("border", newStyleText);
    }
    newStyleText = (String) styleHashMap.get("border-width");
    if (newStyleText != null)
    {
      newStyleText = convertBorderPt2EM(newStyleText);
      styleHashMap.put("border-width", newStyleText);
    }
  }

  private String convertBorderPt2EM(String borderStyle)
  {
    String styleText = borderStyle.trim();
    String newStyleText = "";
    String[] items = styleText.split(" ");
    for (String item : items)
    {
      if (item.endsWith("pt"))
      {
        item = convertPT2EM(item);
      }
      else if (item.endsWith("px"))
      {
        item = convertPX2EM(item);
      }
      newStyleText = newStyleText + item + " ";
    }
    return newStyleText;
  }

  private String convertPX2EM(String item)
  {
    String v = item.replaceAll("px", "");
    double dv = Double.parseDouble(v);
    double em = dv / 24;
    if (em < 0.08)
      em = 0.08;
    String e = em + "em";
    return e;
  }

  private String convertPT2EM(String item)
  {
    String v = item.replaceAll("pt", "");
    double dv = Double.parseDouble(v);
    double em = dv / 18;
    if (em < 0.08)
      em = 0.08;
    String e = em + "em";
    return e;
  }

  private void fixDomSlide(Element wrapperEle)
  {
    long s1 = System.currentTimeMillis();
    // Check children in SlideWrapperElement, should be only one
    // child<slide> at <slideWrap>
    Elements slides = wrapperEle.getElementsByClass("draw_page");
    for (int i = slides.size() - 1; i > 0; i--)
    {
      slides.get(i).remove();
    }
    Element slideEle = slides.get(0);
    fixDomSlideId(wrapperEle, slideEle);// done
    curSlideId = slideEle.attr("id");
    needFixZIndex = true;
    startZindex = 500;
    if (zindexSet == null)
      zindexSet = new ArrayList<Integer>();
    if (!zindexSet.isEmpty())
      zindexSet.clear();
    if (slideElementIds == null)
      slideElementIds = new HashMap<String, String>();
    if (!slideElementIds.isEmpty())
      slideElementIds.clear();
    fixDomSlideWidthHeight(slideEle);// done
    fixDomSlideSpeakerNotes(slideEle);// done

    Elements childList = slideEle.children();
    for (int i = 0; i < childList.size(); i++)
    {
      Element ele = childList.get(i);
      if (ele.attr("class").contains("draw_frame"))
      {
        fixDomElement(ele);
      }
    }
    doZindexSort(slideEle);
    long s2 = System.currentTimeMillis();
    if (indebug)
      LOG.info("time fix slide  " + curSlideId + " :  " + (s2 - s1));
  }

  private void doZindexSort(Element slideEle)
  {
    Collections.sort(zindexSet);
    if (indebug)
      System.out.println(zindexSet);
    // int zindex = 500;
    // for (int i = 0; i < zindexSet.size(); i++)
    // {
    // int index = zindexSet.get(i);
    // Elements domElements =
    // slideEle.getElementsByAttributeValueContaining("style", "z-index:" +
    // index);
    // for (int j = 0; j < domElements.size(); j++)
    // {
    // Element dom = domElements.get(j);
    // String styleText = dom.attr("style").trim();
    // HashMap styleHashMap = parseStyleToJSON(styleText);
    // styleHashMap.put("z-index", zindex);
    // styleText = parseStyleJSONtoString(styleHashMap);
    // dom.attr("style", styleText);
    // }
    // zindex += 5;
    // }
  }

  /*
   * To fix two issues 1.some slides has same ID. 2.slide id is missed.
   */
  private void fixDomSlideId(Element wrapperEle, Element slideEle)
  {
    String slideWrapperId = wrapperEle.attr("id");
    String slideId = slideEle.attr("id");
    if (!slideWrapperId.isEmpty())
    {
      if (slideWrapperIds.containsKey(slideWrapperId))
      { // duplicate
        // slideWrap id,
        // fix it.
        slideWrapperId = slideWrapperId + slideWrapperIds.size();
        wrapperEle.attr("id", slideWrapperId);
        // the slide id must duplicate too. update the slide id.
        slideId = slideId + slideWrapperIds.size();
        slideEle.attr("id", slideId);
      }
    }
    else
    {
      // slideWrap doesn't have ID fix it.
      slideWrapperId = "slideWrapper_" + rootid + "_" + slideWrapperIds.size();
      wrapperEle.attr("id", slideWrapperId);
      // the slide id must be missed too. update the slide id.
      slideId = "slide_" + rootid + "_" + slideWrapperIds.size();
      slideEle.attr("id", slideId);
    }
    slideWrapperIds.put(slideWrapperId, "1");
  }

  private void fixDomSlideWidthHeight(Element slideEle)
  {
    boolean fixed = false;
    String orientation = slideEle.attr("orientation");
    String pageheight = slideEle.attr("pageheight");
    String pagewidth = slideEle.attr("pagewidth");
    String pageunits = slideEle.attr("pageunits");
    if (orientation.isEmpty())
    {
      fixed = fixed || true;
      slideEle.attr("orientation", "landscape");
    }
    if (pageunits.isEmpty())
    {
      fixed = fixed || true;
      slideEle.attr("pageunits", "cm");
    }
    if (pagewidth.isEmpty())
    {
      fixed = fixed || true;
      pagewidth = "25.4";
      slideEle.attr("pagewidth", pagewidth);
    }
    if (pageheight.isEmpty())
    {
      fixed = fixed || true;
      pageheight = "19.05";
      slideEle.attr("pageheight", pageheight);
    }
    if (fixed)
    {
      slideEle.attr("is_edited", "true");
    }
    slideW = Double.parseDouble(pagewidth) * 360000;
    slideH = Double.parseDouble(pageheight) * 360000;
  }

  private void fixDomSlideSpeakerNotes(Element slideEle)
  {
    Elements notes = slideEle.getElementsByAttributeValue("presentation_class", "notes");
    Element speakerNote = null;
    if (notes.size() == 0)
    {
      speakerNote = createSpeakerNotes(slideEle);
    }
    else
    {
      // one slide should be only one speaker notes
      for (int i = notes.size() - 1; i > 0; i--)
      {
        notes.get(i).remove();
      }
      speakerNote = notes.get(0);
    }

    Element notesDrawText = null;
    Elements notesDrawTexts = speakerNote.children();
    for (int i = 0; i < notesDrawTexts.size(); i++)
    {
      Element ele = notesDrawTexts.get(i);
      if (ele.hasClass("draw_text-box"))
      {
        notesDrawText = ele;
        break;
      }
    }

    if (notesDrawText == null)
    {
      notesDrawText = createSpeakerNotesDrawText(speakerNote);
    }

    Elements notesDrawFrameClasses = notesDrawText.getElementsByClass("draw_frame_classes");

    Element notesDrawFrame = null;
    if (notesDrawFrameClasses.size() > 1)
    {
      // destroy all the other extra dfc that got added by error
      for (int i = notesDrawFrameClasses.size() - 1; i > 0; i--)
      {
        notesDrawFrameClasses.get(i).remove();
      }
    }
    notesDrawFrame = notesDrawFrameClasses.get(0);

    fixDomSlideSpeakerNotesDrawFrameNode(notesDrawFrame);
  }

  private Element createSpeakerNotesDrawText(Element speakerNote)
  {
    Element notesDrawText = document.createElement("div");
    notesDrawText.addClass("draw_text-box");
    notesDrawText.addClass("contentBoxDataNode");
    notesDrawText.addClass("layoutClassSS");
    notesDrawText.addClass("notes_tweaks");
    String textStyle = "height:100%; " + "width:100%; " + "border:0px solid; margin: 0px; padding: 0px;";
    notesDrawText.attr("style", textStyle);
    notesDrawText.attr("id", "notes_text_" + curSlideId);
    notesDrawText.attr("role", "textbox");
    notesDrawText.attr("tabindex", "0");

    Element notesTable = document.createElement("div");
    String notesTableStyle = "display: table; height: 100%; width: 100%; margin: 0px; padding: 0px;";
    notesTable.attr("style", notesTableStyle);
    notesTable.attr("role", "presentation");
    notesTable.attr("id", "notes_table_" + curSlideId);

    Element notesTableCell = document.createElement("div");
    notesTableCell.attr("role", "presentation");
    notesTableCell.addClass("draw_frame_classes");
    notesTableCell.addClass("defaultMaster_Title ");
    String notesTableCellStyle = "height:100%; " + "width:100%; " + "display:table-cell; " + "color:#000000; " + "font-size:12px; "
        + "font-family:Arial,Helvetica,sans-serif; " + "background-color:#FFFFFF; " + "border-width: 0px; ";
    notesTableCell.attr("style", notesTableCellStyle);
    notesTableCell.attr("id", "notes_tablecell_" + curSlideId);
    notesTable.appendChild(notesTableCell);
    notesDrawText.appendChild(notesTable);
    speakerNote.appendChild(notesDrawText);
    createDefaulTextForSpeakerNotes(notesTableCell);

    return notesDrawText;
  }

  private void fixDomSlideSpeakerNotesDrawFrameNode(Element drawFrameNode)
  {
    String notesTableCellStyle = "height:100%; " + "width:100%; " + "display:table-cell; " + "color:#000000; " + "font-size:12px; "
        + "font-family:Arial,Helvetica,sans-serif; " + "background-color:#FFFFFF; " + "border-width: 0px; ";
    if (drawFrameNode.children().size() == 0)
    {
      drawFrameNode.attr("style", notesTableCellStyle);
      // Need to add default text for speaker notes;
      createDefaulTextForSpeakerNotes(drawFrameNode);
    }

    String styleText = drawFrameNode.attr("style").trim();
    if (!styleText.isEmpty())
    {
      parseStyleToJSON(styleText);
      styleHashMap.put("border-width", "0px");
      styleHashMap.put("color", "#000000");
      styleHashMap.put("font-size", "12px");
      styleHashMap.put("font-family", "Arial,Helvetica,sans-serif");
      styleHashMap.put("background-color", "#FFFFFF");
      notesTableCellStyle = parseStyleJSONtoString();
    }
    drawFrameNode.attr("style", notesTableCellStyle);

    Elements plist = drawFrameNode.getElementsByTag("p");
    for (int i = 0; i < plist.size(); i++)
    {
      Element p = plist.get(i);
      fixSpeakerNotesTextStyle(p);
    }
    Elements slist = drawFrameNode.getElementsByTag("span");
    for (int i = 0; i < slist.size(); i++)
    {
      Element s = slist.get(i);
      fixSpeakerNotesTextStyle(s);
    }

    Elements lilist = drawFrameNode.getElementsByTag("li");
    for (int i = 0; i < lilist.size(); i++)
    {
      Element li = lilist.get(i);
      fixSpeakerNotesTextStyle(li);
    }
    Elements ollist = drawFrameNode.getElementsByTag("ol");
    for (int i = 0; i < ollist.size(); i++)
    {
      Element ol = ollist.get(i);
      ol.attr("style", "");
    }
    Elements ullist = drawFrameNode.getElementsByTag("ul");
    for (int i = 0; i < ullist.size(); i++)
    {
      Element ul = ullist.get(i);
      ul.attr("style", "");
    }
  }

  private void fixSpeakerNotesTextStyle(Element ele)
  {
    String nodeStyle = "color:#000000; " + "font-size:1em; " + "font-family:Arial,Helvetica,sans-serif; ";
    String orgStyleText = ele.attr("style").trim();
    if (!orgStyleText.isEmpty())
    {
      parseStyleToJSON(orgStyleText);
      styleHashMap.put("color", "#000000");
      styleHashMap.put("font-size", "1em");
      styleHashMap.put("font-family", "Arial,Helvetica,sans-serif");
      nodeStyle = parseStyleJSONtoString();
    }
    ele.attr("style", nodeStyle);
  };

  private String parseStyleJSONtoString()
  {
    String stylePair = "";
    Set<?> ks = styleHashMap.keySet();
    Iterator<?> i = ks.iterator();
    while (i.hasNext())
    {
      String k = i.next().toString().trim();
      String v = styleHashMap.get(k).toString().trim();

      int ki = k.indexOf(":");
      if (ki > 0)
      {
        k = k.substring(0, ki);
      }
      String text = k + ":" + v + ";";
      stylePair = stylePair + text;
    }
    return stylePair;
  }

  private void parseStyleToJSON(String styleText)
  {
    if (styleHashMap == null)
      styleHashMap = new HashMap<String, String>();
    if (!styleHashMap.isEmpty())
    {
      styleHashMap.clear();
    }
    // DOCS-50 and DOCS-51 starts
    //To avoid wrong split of css attributes and it' values(eg --> font-family - '&#47569;&#51008; &#44256;&#46357;)
    String[] styles;
    if(styleText.contains("\'")) 
    {
      styles= styleText.split(";(?=(?:[^\']*\'[^\']*\')*[^\']*$)", -1);
    }
    else
    {
      styles = styleText.split(";");
    }
    // DOCS-50 and DOCS-51 ends
    for (int i = 0; i < styles.length; i++)
    {
      String stylePair = styles[i];
      String[] kv = stylePair.split(":");
      if (kv.length == 2)
      {
        String k = kv[0].trim();
        String v = kv[1].trim();
        if (k.equalsIgnoreCase("background"))
        {
          if (v.indexOf("realTransparent.png") > 0)
          {
            continue;
          }
          if (v.equalsIgnoreCase("url("))
          {
            continue;
          }
        }
        int kn = 0;
        String ok = k;
        while (styleHashMap.containsKey(k))
        {
          k = ok + ":" + kn;
          kn++;
        }
        styleHashMap.put(k, v);
      }
      else
      {
        String k = kv[0].trim();
        String v = "";
        if (k.equalsIgnoreCase("filter") && kv.length == 3)
        {
          v = kv[1].trim() + ":" + kv[2].trim();
          styleHashMap.put(k, v);
        }
      }
    }
  }

  private void createDefaulTextForSpeakerNotes(Element drawFrameNode)
  {
    Element pNode = document.createElement("p");
    String pNodeStyle = "color:#000000; " + "font-size:1em; " + "font-family:Arial,Helvetica,sans-serif; ";
    pNode.addClass("defaultContentText");
    pNode.addClass("cb_notes");
    pNode.attr("style", pNodeStyle);
    pNode.attr("id", "p_" + curSlideId);

    Element spanNode = document.createElement("span");
    String spanNodeStyle = "font-size:1em;";
    spanNode.attr("style", spanNodeStyle);
    spanNode.attr("id", "s_" + curSlideId);
    spanNode.appendText("Click to add notes");
    Element brNode = document.createElement("br");
    brNode.addClass("hideInIE");
    pNode.appendChild(spanNode);
    pNode.appendChild(brNode);
    drawFrameNode.appendChild(pNode);
  }

  private Element buildTextNodeContent(String preID, String content)
  {
    Element table = document.createElement("div");
    String tableStyle = "height:100%; " + "width:100%; " + "display:table; table-layout:fixed; ";
    table.attr("style", tableStyle);
    table.attr("id", preID + "_tb");

    Element tableCell = document.createElement("div");
    tableCell.attr("role", "presentation");
    tableCell.addClass("draw_frame_classes");
    tableCell.addClass("defaultMaster_Title ");
    String tableCellStyle = "height:100%; " + "width:100%; " + "display:table-cell; ";
    tableCell.attr("style", tableCellStyle);
    tableCell.attr("id", preID + "_tc");
    Element pNode = createDefaulPline(preID, content);
    tableCell.appendChild(pNode);
    table.appendChild(tableCell);
    table.appendChild(tableCell);
    return table;
  }

  private Element createDefaulPline(String preID, String content)
  {
    Element pNode = document.createElement("p");
    pNode.addClass("text_p");
    pNode.attr("odf_element", "text:p");
    pNode.attr("id", "p_" + preID);

    Element spanNode = document.createElement("span");
    spanNode.attr("id", "s_" + preID);
    spanNode.attr("style", "font-size:1em; ");
    spanNode.appendText(content);
    Element brNode = document.createElement("br");
    brNode.addClass("hideInIE");
    pNode.appendChild(spanNode);
    pNode.appendChild(brNode);
    return pNode;
  }

  private Element createSpeakerNotes(Element slideEle)
  {

    Element notesDrawFrame = document.createElement("div");
    notesDrawFrame.addClass("draw_frame");
    notesDrawFrame.addClass("layoutClass");
    notesDrawFrame.attr("presentation_class", "notes");
    notesDrawFrame.attr("emptyCB_placeholder", "true");
    notesDrawFrame.attr("presentation_placeholder", "true");
    notesDrawFrame.attr("draw_layer", "layout");
    notesDrawFrame.attr("is_edited", "true");
    notesDrawFrame.attr("presentation_class", "notes");
    notesDrawFrame.attr("text_anchor-type", "paragraph");
    String style = "position:absolute; " + "top:100%; " + "width:100; " + "height:10%; " + "background-color:white; "
        + "border-top:2px solid #CCCCCC; " + "border-right:0px solid #CCCCCC; " + "border-bottom:0px solid #CCCCCC; "
        + "border-left:0px solid #CCCCCC; " + "overflow-x:hidden; " + "overflow-y:scroll; ";
    notesDrawFrame.attr("style", style);
    notesDrawFrame.attr("id", "notes_" + curSlideId);

    Element dateTime = document.createElement("div");
    dateTime.addClass("draw_frame");
    String dateTimeStyle = "visibility:hidden; " + "top:5.1%; " + "width:23.296%; " + "height:6.895%; " + "left:85%; "
        + "position:absolute; ";
    dateTime.attr("style", dateTimeStyle);
    dateTime.attr("draw_layer", "backgroundobjects");
    dateTime.attr("draw_text-style-name", "MP121");
    dateTime.attr("presentation_class", "date-time");
    dateTime.attr("text_anchor-type", "paragraph");
    dateTime.attr("text_datetime-format", "D4");
    dateTime.attr("text_fixed", "true");
    dateTime.attr("text_locale", "en");
    dateTime.attr("id", "notes_dateTime_" + curSlideId);

    Element dateTimeDrawTextBox = document.createElement("div");
    dateTimeDrawTextBox.addClass("draw_text-box");
    String dateTimeDrawTextBoxStyle = "height:100%; " + "width:100%; ";
    dateTimeDrawTextBox.attr("style", dateTimeDrawTextBoxStyle);
    dateTimeDrawTextBox.attr("role", "presentation");
    dateTimeDrawTextBox.attr("id", "notes_dateTimet_" + curSlideId);
    Element dateTimeTextNode = buildTextNodeContent("notes_dateTimet_" + curSlideId, text8203);
    dateTimeDrawTextBox.appendChild(dateTimeTextNode);
    dateTime.appendChild(dateTimeDrawTextBox);

    Element header = document.createElement("div");
    header.addClass("draw_frame");
    String headerStyle = "visibility:hidden; " + "top:5.1%; " + "width:23.296%; " + "height:6.895%; " + "left:5%; " + "position:absolute; ";
    header.attr("style", headerStyle);
    header.attr("draw_layer", "backgroundobjects");
    header.attr("draw_text-style-name", "MP129");
    header.attr("presentation_class", "header");
    header.attr("text_anchor-type", "paragraph");
    header.attr("id", "notes_header_" + curSlideId);
    Element headerDrawTextBox = document.createElement("div");
    headerDrawTextBox.addClass("draw_text-box");
    String headerDrawTextBoxStyle = "height:100%; " + "width:100%; ";
    headerDrawTextBox.attr("style", headerDrawTextBoxStyle);
    headerDrawTextBox.attr("role", "presentation");
    headerDrawTextBox.attr("id", "notes_headert_" + curSlideId);
    Element headerTextNode = buildTextNodeContent("notes_headert_" + curSlideId, text8203);
    headerDrawTextBox.appendChild(headerTextNode);
    header.appendChild(headerDrawTextBox);

    Element footer = document.createElement("div");
    footer.addClass("draw_frame");
    String footerStyle = "visibility:hidden; " + "top:85%; " + "width:23.296%; " + "height:6.895%; " + "left:5%; " + "position:absolute; ";
    footer.attr("style", footerStyle);
    footer.attr("draw_layer", "backgroundobjects");
    footer.attr("draw_text-style-name", "MP129");
    footer.attr("presentation_class", "footer");
    footer.attr("text_anchor-type", "paragraph");
    footer.attr("id", "notes_footer_" + curSlideId);
    Element footerDrawTextBox = document.createElement("div");
    footerDrawTextBox.addClass("draw_text-box");
    String footerDrawTextBoxStyle = "height:100%; " + "width:100%; ";
    footerDrawTextBox.attr("style", footerDrawTextBoxStyle);
    footerDrawTextBox.attr("role", "presentation");
    footerDrawTextBox.attr("id", "notes_footert_" + curSlideId);
    Element footerTextNode = buildTextNodeContent("notes_footert_" + curSlideId, text8203);
    footerDrawTextBox.appendChild(footerTextNode);
    footer.appendChild(footerDrawTextBox);

    Element pageNumber = document.createElement("div");
    pageNumber.addClass("draw_frame");
    String pageNumberStyle = "visibility:hidden; " + "top:85%; " + "width:23.296%; " + "height:6.895%; " + "left:85%; "
        + "position:absolute; ";
    pageNumber.attr("style", pageNumberStyle);
    pageNumber.attr("draw_layer", "backgroundobjects");
    pageNumber.attr("draw_text-style-name", "MP123");
    pageNumber.attr("presentation_class", "page-number");
    pageNumber.attr("text_anchor-type", "paragraph");
    pageNumber.attr("page-number-format", "4");
    pageNumber.attr("id", "notes_ pageNumber_" + curSlideId);
    Element pageNumberDrawTextBox = document.createElement("div");
    pageNumberDrawTextBox.addClass("draw_text-box");
    String pageNumberDrawTextBoxStyle = "height:100%; " + "width:100%; ";
    pageNumberDrawTextBox.attr("style", pageNumberDrawTextBoxStyle);
    pageNumberDrawTextBox.attr("role", "presentation");
    pageNumberDrawTextBox.attr("id", "notes_ pageNumbert_" + curSlideId);
    Element pageNumberTextNode = buildTextNodeContent("notes_ pageNumbert_" + curSlideId, "");
    pageNumberDrawTextBox.appendChild(pageNumberTextNode);
    pageNumber.appendChild(pageNumberDrawTextBox);
    notesDrawFrame.appendChild(dateTime);
    notesDrawFrame.appendChild(header);
    notesDrawFrame.appendChild(footer);
    notesDrawFrame.appendChild(pageNumber);
    slideEle.appendChild(notesDrawFrame);
    createSpeakerNotesDrawText(notesDrawFrame);
    return notesDrawFrame;
  }

  private void fixDomElement(Element ele)
  {
    long e1 = System.currentTimeMillis();
    fixDomElementId(ele, slideElementIds, curSlideId);// done
    ele.removeAttr("origh");
    ele.removeAttr("currh");
    curElementId = ele.attr("id");
    fixDomElementPosition(ele);// done
    if (needFixZIndex)
      fixDomElementZIndex(ele);

    String family = getFamily(ele);
    if (family.equalsIgnoreCase("text"))
    {
      fixDomElementTextBox(ele);
    }
    else if (family.equalsIgnoreCase("table"))
    {
      fixDomElementTable(ele);
    }
    else if (family.equalsIgnoreCase("graphic"))
    {
      fixDomElementGraphic(ele);
    }
    else if (family.equalsIgnoreCase("group"))
    {
      fixDomElementGroup(ele);
    }
    else if (family.equalsIgnoreCase("shape_svg"))
    {
      fixLine(ele);
    }
    long e2 = System.currentTimeMillis();
    if (indebug)
      LOG.info("time fix element  " + curElementId + " :  " + (e2 - e1));
  }

  private void fixDomElementId(Element ele, HashMap<String, String> elementIds, String parentId)
  {
    String eleid = ele.attr("id");
    if (!eleid.isEmpty())
    {
      if (elementIds.containsKey(eleid))
      {// duplicate Element id, fix it.
        eleid = eleid + elementIds.size();
        ele.attr("id", eleid);
      }
    }
    else
    {
      // Element doesn't have ID fix it.
      eleid = "e_" + parentId + "_" + elementIds.size();
      ele.attr("id", eleid);
    }
    elementIds.put(eleid, "1");
  }

  private void fixDomElementZIndex(Element ele)
  {
    if (getFamily(ele).equalsIgnoreCase("notes"))
      return;
    String draw_layer = ele.attr("draw_layer").trim();
    if (draw_layer.equalsIgnoreCase("backgroundobjects") || ele.hasClass("g_draw_frame"))
      return;

    String styleText = ele.attr("style").trim();
    parseStyleToJSON(styleText);
    int zindex = startZindex;
    if ((styleHashMap.get("z-index") == null || styleHashMap.get("z-index") == "auto"))
    {
      zindex += 5;
      startZindex = zindex;
    }
    else
    {
      String oZindex = (String) styleHashMap.get("z-index");
      zindex = Integer.parseInt(oZindex);
      if (startZindex < zindex)
      {
        startZindex = zindex;
      }
    }
    zindexSet.add(zindex);
    styleHashMap.put("z-index", zindex + "");
    styleText = parseStyleJSONtoString();
    ele.attr("style", styleText);
  }

  private void fixDomElementPosition(Element ele)
  {
    if (getFamily(ele).equalsIgnoreCase("notes"))
      return;
    String draw_layer = ele.attr("draw_layer").trim();
    if (draw_layer.equalsIgnoreCase("backgroundobjects"))
      return;
    String styleText = ele.attr("style").trim();
    if (!styleText.isEmpty())
    {
      parseStyleToJSON(styleText);
      if (styleHashMap.get("top") == null || !styleHashMap.get("top").toString().trim().endsWith("%"))
      {
        styleHashMap.put("top", "25%");
      }
      if (styleHashMap.get("left") == null || !styleHashMap.get("left").toString().trim().endsWith("%"))
      {
        styleHashMap.put("left", "18%");
      }
      if (styleHashMap.get("height") == null || !styleHashMap.get("height").toString().trim().endsWith("%"))
      {
        styleHashMap.put("height", "17.8451%");
      }
      if (styleHashMap.get("width") == null || !styleHashMap.get("width").toString().trim().endsWith("%"))
      {
        styleHashMap.put("width", "50%");
      }
      styleText = parseStyleJSONtoString();
    }
    else
    {// style is empty, using default value:
      styleText = "position: absolute; top: 25%; left: 18%; height: 17.8451%; width: 50%;";
    }
    ele.attr("style", styleText);
  }

  private void fixDomElementTextBox(Element drawFrame)
  {
    Elements drawFrameClasses = drawFrame.getElementsByClass("draw_frame_classes");
    if (drawFrameClasses.size() == 0)
      drawFrameClasses = drawFrame.getElementsByClass("draw_shape_classes");

    Element drawFrameclass = null;
    // destroy all the other extra dfc that got added by error
    for (int i = drawFrameClasses.size() - 1; i > 0; i--)
    {
      drawFrameClasses.get(i).remove();
    }
    if (drawFrameClasses.size() == 0)
    {
      // Empty textbox no dfc node exist, remove it.
      drawFrame.remove();
      return;
    }
    drawFrameclass = drawFrameClasses.get(0);
    fixDomElementTextDFC(drawFrameclass);
  }

  private void fixDomElementTextDFC(Element drawFrameclass)
  {
    if (curElementLineIds == null)
      curElementLineIds = new HashMap<String, String>();
    if (!curElementLineIds.isEmpty())
      curElementLineIds.clear();
    List<Node> lineChildrens = drawFrameclass.childNodes();
    for (int i = 0; i < lineChildrens.size(); i++)
    {
      Node lineNode = lineChildrens.get(i);
      if (lineNode instanceof Element)
      {
        String tagName = ((Element) lineNode).tagName();
        if (!tagName.equalsIgnoreCase("p") && !tagName.equalsIgnoreCase("ol") && !tagName.equalsIgnoreCase("ul"))
        {
          // only p,ul,ol is allow under DFC node.
          lineNode.remove();
          i = i - 1;
        }
        else
        {
          fixDomElementLineItem((Element) lineNode);
          if (lineNode.parent() == null)
          {
            i = i - 1;
          }
        }
      }
      else if (lineNode instanceof TextNode)
      {
        fixDomElementFlyTextToLineitem(lineNode);
      }
    }

    if (drawFrameclass.children().size() == 0)
    {
      Element pNode = createDefaulPline(curElementId, text8203);
      drawFrameclass.appendChild(pNode);
    }

  }

  private void fixDomElementTable(Element drawFrame)
  {
    Elements tables = drawFrame.children();
    // destroy all the other extra dfc that got added by error
    for (int i = tables.size() - 1; i > 0; i--)
    {
      tables.get(i).remove();
    }
    if (tables.size() == 0)
    {
      // Empty table, not table placeholder. no dfc node exist, remove it.
      if (!drawFrame.attr("presentation_placeholder").equalsIgnoreCase("true"))
        drawFrame.remove();
      return;
    }
    Element table = tables.get(0);
    table.addClass("smartTable");

    if (table.tagName().equalsIgnoreCase("table"))
    {
      Elements trs = table.getElementsByTag("tr");
      double defRowHeight = 100.0 / trs.size();
      for (int i = 0; i < trs.size(); i++)
      {
        Element tr = trs.get(i);
        tr.removeAttr("presrowheight");
        tr.removeAttr("origh");
        tr.removeAttr("currh");
        String htAttr = tr.attr("height");
        String styleText = tr.attr("style");
        parseStyleToJSON(styleText);

        if (!styleHashMap.containsKey("height"))
        {
          if (htAttr.isEmpty())
          {
            styleHashMap.put("height", defRowHeight + "%");
          }
          else
          {
            styleHashMap.put("height", htAttr);
          }
        }

        tr.removeAttr("height");
        styleText = parseStyleJSONtoString();
        tr.attr("style", styleText);
      }
    }
    else
    {
      drawFrame.remove();
      return;
    }
    Element tbody = fixDomElementTableTbody(table);
    if (tbody != null)
    {
      fixDomElementTableColGroup(table, tbody);
      fixDomElementTableTDS(tbody);
    }
  }

  private Element fixDomElementTableTbody(Element table)
  {
    Elements tbodys = table.getElementsByTag("tbody");
    if (tbodys.size() == 0)
    {
      // no tbody element, remove it.
      table.parent().remove();
      return null;
    }
    else
    {
      for (int i = tbodys.size() - 1; i > 0; i--)
      {
        tbodys.get(i).remove();
      }
      return tbodys.get(0);
    }
  }

  private void fixDomElementTableColGroup(Element table, Element tbody)
  {
    Elements colgroup = table.getElementsByTag("colgroup");
    if (colgroup.size() == 0)
    {
      // no colgroup, build it.
      int cols = getMaxTds(tbody);
      Element colg = document.createElement("colgroup");
      double total1 = 0;
      double widthPc = (1 / (cols * 1.0)) * 100.0;
      Elements trs = table.getElementsByTag("tr");
      Element fristTr = trs.get(0);
      Elements fristTds = fristTr.getElementsByTag("td");
      if (cols == fristTds.size())
      {
        for (int i = 0; i < cols - 1; i++)
        {
          Element col = document.createElement("col");
          col.attr("id", curElementId + "_col_" + i);
          Element td = fristTds.get(i);
          String styleText = td.attr("style");
          if (styleText.indexOf("width") > -1)
          {
            parseStyleToJSON(styleText);
            String owidth = (String) styleHashMap.get("width");
            double tm = widthPc;
            try
            {
              tm = Double.parseDouble(owidth.replace("%", ""));
            }
            catch (Exception e)
            {
              tm = widthPc;
            }
            total1 += tm;
            col.attr("style", "width:" + tm + "%");
          }
          else
          {
            col.attr("style", "width:" + widthPc + "%");
            total1 += widthPc;
          }
          colg.appendChild(col);
        }
        Element col = document.createElement("col");
        col.attr("id", curElementId + "_col_" + (cols - 1));
        col.attr("style", "width:" + (100 - total1) + "%");
        colg.appendChild(col);
      }
      else
      {

        for (int i = 0; i < cols - 1; i++)
        {
          Element col = document.createElement("col");
          col.attr("id", curElementId + "_col_" + i);
          total1 += widthPc;
          col.attr("style", "width:" + widthPc + "%");
          colg.appendChild(col);
        }
        Element col = document.createElement("col");
        col.attr("id", curElementId + "_col_" + (cols - 1));
        col.attr("style", "width:" + (100 - total1) + "%");
        colg.appendChild(col);
      }
      tbody.before(colg);
    }
  }

  private void fixDomElementTableTDS(Element tbody)
  {
    String bccurElementId = curElementId;
    Elements tds = tbody.getElementsByTag("td");
    for (Element td : tds)
    {
      String styleText = td.attr("style");
      parseStyleToJSON(styleText);
      styleHashMap.remove("width");
      styleText = parseStyleJSONtoString();
      td.attr("style", styleText);
      curElementId = td.attr("id");
      fixDomElementTextDFC(td);

    }
    Elements ths = tbody.getElementsByTag("th");
    for (Element th : ths)
    {
      String styleText = th.attr("style");
      parseStyleToJSON(styleText);
      styleHashMap.remove("width");
      styleText = parseStyleJSONtoString();
      th.attr("style", styleText);
      curElementId = th.attr("id");
      fixDomElementTextDFC(th);
    }
    curElementId = bccurElementId;
  }

  /*
   * private Element[][] buildTableMap(Element tbody) { int cols = getMaxTds(tbody); Elements trs = tbody.getElementsByTag("tr"); int rows =
   * trs.size(); // step1, build tableMap Element[][] tableMap = new Element[rows][cols]; for (int r = 0; r < trs.size(); r++) { Element tr
   * = trs.get(r); Elements tds = tr.getElementsByTag("td"); int colindex = 0; int colindexbc = 0; for (int c = 0; c < tds.size(); c++) {
   * Element td = tds.get(c); String cs = td.attr("colspan"); String rs = td.attr("rowspan"); int csd = 1; int rsd = 1; if (!cs.isEmpty()) {
   * csd = Integer.parseInt(cs); } if (!rs.isEmpty()) { rsd = Integer.parseInt(rs); } for (int i = 0; i < rsd; i++) {
   * 
   * int tmpr = r + i; while (tableMap[tmpr][colindex] != null) { String csdd = tableMap[tmpr][colindex].attr("colspan"); int csddd = 1; if
   * (!csdd.isEmpty()) { csddd = Integer.parseInt(csdd); } colindex = colindex + (csddd); }
   * 
   * colindexbc = colindex; for (int j = 0; j < csd; j++) { int rmpc = colindexbc + j; if (tableMap[tmpr][rmpc] == null) {
   * tableMap[tmpr][rmpc] = td; System.out.print("row:" + tmpr); System.out.println("col:" + rmpc); } } } } } return tableMap; }
   */
  private int getMaxTds(Element tbody)
  {
    int maxTd = 0;
    Elements trs = tbody.getElementsByTag("tr");
    for (int r = 0; r < trs.size(); r++)
    {
      Element tr = trs.get(r);
      Elements tds = tr.getElementsByTag("td");
      int curTds = tds.size();
      for (int c = 0; c < tds.size(); c++)
      {
        Element td = tds.get(c);
        String cs = td.attr("colspan");
        int csd = 1;
        if (!cs.isEmpty())
        {
          csd = Integer.parseInt(cs);
          curTds = curTds + (csd - 1);
        }
      }
      maxTd = maxTd > curTds ? maxTd : curTds;
    }
    return maxTd;
  }

  private void fixDomElementGroup(Element ele)
  {
    Elements elements = ele.getElementsByClass("g_draw_frame");
    for (int i = 0; i < elements.size(); i++)
    {
      Element element = elements.get(i);
      fixDomElement(element);
    }
  }

  private double getStylePosOrSize(String percentage)
  {
    String valueStr = percentage.substring(0, percentage.length() - 1);
    return Double.parseDouble(valueStr) / 100;
  }

  private Point getRotatedPoint(Point start, Point end, double rot)
  {
    if (rot == 0)
    {
      return end;
    }

    // move to center
    double dx = end.x - start.x;
    double dy = end.y - start.y;

    // cos(a+b), sin(a+b)
    double arc = rot * Math.PI / 180;
    double dx1 = dx * Math.cos(arc) - dy * Math.sin(arc);
    double dy1 = dx * Math.sin(arc) + dy * Math.cos(arc);

    // ret
    Point pt = new Point();
    pt.x = start.x + dx1;
    pt.y = start.y + dy1;

    return pt;
  }

  private Point getRotatedPoint(Point start, Point end, double rot, double radius)
  {
    if (radius == 0)
    {
      return start;
    }

    double dx = end.x - start.x;
    double dy = end.y - start.y;
    double dr = Math.sqrt(dx * dx + dy * dy);
    if (dr == 0)
    {
      return start;
    }

    double cos_a = dx / dr;
    double sin_a = dy / dr;

    Point new_end = new Point();
    new_end.x = start.x + radius * cos_a;
    new_end.y = start.y + radius * sin_a;

    return getRotatedPoint(start, new_end, rot);
  }

  private boolean getRotatedPoints(Point[] pt, int num, double rot, Point rotCenter)
  {
    // check
    if (pt == null)
      return false;
    if (num < 1)
      return false;
    if (rot == 0)
      return true;

    // loop
    for (int i = 0; i < num; ++i)
    {
      pt[i] = getRotatedPoint(rotCenter, pt[i], rot);
    } // end for

    return true;
  }

  private Point[] generateLineEnd(Point start, Point end, double lineWidth)
  {
    if (start == null || end == null)
      return null;
    // check
    if ((start.x == end.x) && (start.y == end.y))
      return null;

    // triangle, arrow, stealth, diamond, oval, none
    if (lineWidth == 0)
      return null;

    // init
    double lwMin = 12700 * 2; // 2pt
    double lw = (lineWidth > lwMin) ? lineWidth : lwMin;
    double radius = lw * 3.5;
    double degree = 30, arc = degree * Math.PI / 180, endFactor = (1.0 - Math.cos(arc)) / Math.sin(arc);
    // adjust end point
    endFactor *= lineWidth * 0.5;
    Point endNew = getRotatedPoint(end, start, 180, endFactor);

    // generate points for line
    Point[] threePoints = new Point[3];
    threePoints[0] = getRotatedPoint(endNew, start, degree, radius);
    threePoints[1] = endNew;
    threePoints[2] = getRotatedPoint(endNew, start, -degree, radius);

    return threePoints;
  }

  private void extendFrameByPoint(Body pathFrame, Point p)
  {
    // here take w and h as r and b
    if (pathFrame == null || p == null)
      return;
    // extend frame
    if (p.x < pathFrame.l)
      pathFrame.l = p.x;
    if (p.x > pathFrame.w)
      pathFrame.w = p.x;
    if (p.y < pathFrame.t)
      pathFrame.t = p.y;
    if (p.y > pathFrame.h)
      pathFrame.h = p.y;
  }

  private void fixLine(Element ele)
  {
    Elements svgs = ele.getElementsByTag("svg");
    if (svgs.size() == 1)
    {
      Element svg = svgs.get(0);
      if (!svg.attr("shape-version").isEmpty())
        return;
      Elements lines = svg.getElementsByTag("line");
      int num = lines.size();
      if (num >= 1)
      {
        // Get display body position and size
        String[] styles = ele.attr("style").trim().split(";");
        Body actDsp = new Body();
        for (int i = 0; i < styles.length; i++)
        {
          String kvPair = styles[i];
          String[] kv = kvPair.split(":");
          if (kv.length == 2)
          {
            String k = kv[0].trim();
            if (k.equalsIgnoreCase("left"))
            {
              actDsp.l = getStylePosOrSize(kv[1].trim()) * slideW;
            }
            else if (k.equalsIgnoreCase("top"))
            {
              actDsp.t = getStylePosOrSize(kv[1].trim()) * slideH;
            }
            else if (k.equalsIgnoreCase("width"))
            {
              actDsp.w = getStylePosOrSize(kv[1].trim()) * slideW;
            }
            else if (k.equalsIgnoreCase("height"))
            {
              actDsp.h = getStylePosOrSize(kv[1].trim()) * slideH;
            }
          }
        }

        // Get line start and end point(emu) relative to display box
        Element line = lines.get(0);
        Point lineStart = new Point();
        lineStart.x = getStylePosOrSize(line.attr("x1"));
        lineStart.y = getStylePosOrSize(line.attr("y1"));
        Point lineEnd = new Point();
        lineEnd.x = getStylePosOrSize(line.attr("x2"));
        lineEnd.y = getStylePosOrSize(line.attr("y2"));
        lineStart.x *= actDsp.w;
        lineStart.y *= actDsp.h;
        lineEnd.x *= actDsp.w;
        lineEnd.y *= actDsp.h;

        // Calculate line dir(0~8)
        int dir = 0;
        if (lineEnd.x > lineStart.x && lineEnd.y == lineStart.y)
        {
          dir = 0;
        }
        else if (lineEnd.x > lineStart.x && lineEnd.y > lineStart.y)
        {
          dir = 1;
        }
        else if (lineEnd.x == lineStart.x && lineEnd.y > lineStart.y)
        {
          dir = 2;
        }
        else if (lineEnd.x < lineStart.x && lineEnd.y > lineStart.y)
        {
          dir = 3;
        }
        else if (lineEnd.x < lineStart.x && lineEnd.y == lineStart.y)
        {
          dir = 4;
        }
        else if (lineEnd.x < lineStart.x && lineEnd.y < lineStart.y)
        {
          dir = 5;
        }
        else if (lineEnd.x == lineStart.x && lineEnd.y < lineStart.y)
        {
          dir = 6;
        }
        else if (lineEnd.x > lineStart.x && lineEnd.y < lineStart.y)
        {
          dir = 7;
        }

        // Get actual frame position and size
        // double factor = 12700;
        Body actFrm = new Body();
        // here take w and h as r and b
        actFrm.l = lineStart.x;
        actFrm.t = lineStart.y;
        actFrm.w = lineStart.x;
        actFrm.h = lineStart.y;
        extendFrameByPoint(actFrm, lineEnd);
        // adjust start/end point as in the first quadrant
        lineStart.x = actFrm.l;
        lineStart.y = actFrm.t;
        lineEnd.x = actFrm.w;
        lineEnd.y = actFrm.h;

        // Calculate two arrow three points
        Point[] endArrow = null;
        Point[] startArrow = null;
        if (num == 3)
        {
          endArrow = generateLineEnd(lineStart, lineEnd, 12700);
        }
        else if (num == 5)
        {
          endArrow = generateLineEnd(lineStart, lineEnd, 12700);
          startArrow = generateLineEnd(lineEnd, lineStart, 12700);
        }

        if (endArrow != null)
        {
          extendFrameByPoint(actFrm, endArrow[0]);
          extendFrameByPoint(actFrm, endArrow[1]);
          extendFrameByPoint(actFrm, endArrow[2]);
          endArrow[0].x /= 12700;
          endArrow[0].y /= 12700;
          endArrow[1].x /= 12700;
          endArrow[1].y /= 12700;
          endArrow[2].x /= 12700;
          endArrow[2].y /= 12700;
        }
        if (startArrow != null)
        {
          extendFrameByPoint(actFrm, startArrow[0]);
          extendFrameByPoint(actFrm, startArrow[1]);
          extendFrameByPoint(actFrm, startArrow[2]);
          startArrow[0].x /= 12700;
          startArrow[0].y /= 12700;
          startArrow[1].x /= 12700;
          startArrow[1].y /= 12700;
          startArrow[2].x /= 12700;
          startArrow[2].y /= 12700;
        }

        // Actual frame relative to slide editor
        actFrm.w = actFrm.w - actFrm.l;
        actFrm.h = actFrm.h - actFrm.l;
        actFrm.l += actDsp.l;
        actFrm.t += actDsp.t;
        // change emu to pt
        lineStart.x /= 12700;
        lineStart.y /= 12700;
        lineEnd.x /= 12700;
        lineEnd.y /= 12700;

        // Update svg preserve0
        svg.attr("preserve0", "dsp_x:" + actDsp.l + ";dsp_y:" + actDsp.t + ";dsp_height:" + actDsp.h + ";dsp_width:" + actDsp.w + ";frm_x:"
            + actFrm.l + ";frm_y:" + actFrm.t + ";frm_height:" + actFrm.h + ";frm_width:" + actFrm.w + ";dir:" + dir);
        svg.attr("shape-version", "1.5");

        // Get title id and all line ids and reuse them in new svg
        // structure
        // And remove all lines and title
        ArrayList<String> lineIds = new ArrayList<String>();
        HashMap<String, String> styleMap = new HashMap<String, String>();
        for (int i = 0; i < num; i++)
        {
          lineIds.add(lines.get(i).attr("id"));
          if (i == 0)
          {
            String[] lineStyles = lines.get(i).attr("style").trim().split(";");
            for (int j = 0, len = lineStyles.length; j < len; j++)
            {
              String kvPair = lineStyles[j];
              String[] kv = kvPair.split(":");
              if (kv.length == 2)
              {
                String key = kv[0].trim();
                String v = kv[1].trim();
                if (key.equalsIgnoreCase("stroke-width"))
                  v = v.replaceAll("pt", "");
                styleMap.put(key, v);
              }
            }
          }
          lines.get(i).remove();
        }
        Elements titles = svg.getElementsByTag("title");
        String titleId = "", titleContent = "";
        if (titles.size() == 1)
        {
          Element title = titles.get(0);
          titleId = title.attr("id");
          titleContent = title.text();
          title.remove();
        }

        // Form new svg structure as string first
        int index = 0;
        String svgHTML = "<g id=\"" + titleId + "\" groupfor=\"fill-line-arrow\">";
        // line
        svgHTML += "<g id=\"" + lineIds.get(index) + "_g" + "\" groupfor=\"line\">";
        svgHTML += "<path fill=\"none\" d=\"M " + String.format("%.2f", lineStart.x) + " " + String.format("%.2f", lineStart.y) + " L "
            + String.format("%.2f", lineEnd.x) + " " + String.format("%.2f", lineEnd.y) + "\" stroke-width=\""
            + styleMap.get("stroke-width") + "\" stroke-dasharray=\"none\" stroke-linecap=\"butt\" stroke-linejoin=\"round\" id=\""
            + lineIds.get(index) + "\" stroke=\"" + styleMap.get("stroke") + "\" />";
        svgHTML += "</g>";
        // arrow
        if (startArrow != null || endArrow != null)
        {
          index++;
          svgHTML += "<g id=\"" + lineIds.get(index) + "_g" + "\" groupfor=\"arrow\">";
          if (startArrow != null)
            svgHTML += "<path kind=\"arrow\" fill=\"none\" d=\"M " + String.format("%.2f", startArrow[0].x) + " "
                + String.format("%.2f", startArrow[0].y) + " L " + String.format("%.2f", startArrow[1].x) + " "
                + String.format("%.2f", startArrow[1].y) + " L " + String.format("%.2f", startArrow[2].x) + " "
                + String.format("%.2f", startArrow[2].y) + "\" stroke-width=\"" + styleMap.get("stroke-width")
                + "\" stroke-linecap=\"round\" id=\"" + "head_" + lineIds.get(index) + "\" stroke=\"" + styleMap.get("stroke") + "\" />";
          index++;
          if (endArrow != null)
            svgHTML += "<path kind=\"arrow\" fill=\"none\" d=\"M " + String.format("%.2f", endArrow[0].x) + " "
                + String.format("%.2f", endArrow[0].y) + " L " + String.format("%.2f", endArrow[1].x) + " "
                + String.format("%.2f", endArrow[1].y) + " L " + String.format("%.2f", endArrow[2].x) + " "
                + String.format("%.2f", endArrow[2].y) + "\" stroke-width=\"" + styleMap.get("stroke-width")
                + "\" stroke-linecap=\"round\" id=\"" + "tail_" + lineIds.get(index) + "\" stroke=\"" + styleMap.get("stroke") + "\" />";
          svgHTML += "</g>";
        }
        svgHTML += "</g>";
        svgHTML += "<title>" + titleContent + "</title>";
        svg.append(svgHTML);

        String finalHtml = "<div class=\"contentBoxDataNode\" style=\"position:relative;left:0%;top:0%;height:100%;width:100%;\" tabindex=\"0\" id=\""
            + lineIds.get(index) + "_data" + "\">";
        finalHtml += "<div presentation_class=\"graphic\" class=\"g_draw_frame\" draw_layer=\"layout\" style=\"position:absolute;left:0%;top:0%;width:100%;height:100%;\" text_anchor-type=\"paragraph\" tabindex=\"0\" shape_node=\"svg.on.shape\" id=\""
            + lineIds.get(index) + "_gdrawframe" + "\">";
        finalHtml += svg.outerHtml();
        finalHtml += "</div>";
        finalHtml += "</div>";
        svg.remove();
        ele.append(finalHtml);
        ele.attr("presentation_class", "group");
      }
    }
  }

  private HashMap<String, Object> calThreeBody(Element ele)
  {
    // Get original display body and frame body size
    Elements svgs = ele.getElementsByTag("svg");
    Element svg = null;

    Body origFrm = new Body();
    Body origDsp = new Body();
    double rot = 0;
    if (svgs.size() == 1)
    {
      svg = svgs.get(0);
      String[] preserves = svg.attr("preserve0").trim().split(";");
      for (int i = 0; i < preserves.length; i++)
      {
        String kvPair = preserves[i];
        String[] kv = kvPair.split(":");
        if (kv.length == 2)
        {
          String k = kv[0].trim();
          if (k.equalsIgnoreCase("frm_x"))
          {
            origFrm.l = Double.parseDouble(kv[1].trim());
          }
          else if (k.equalsIgnoreCase("frm_y"))
          {
            origFrm.t = Double.parseDouble(kv[1].trim());
          }
          else if (k.equalsIgnoreCase("frm_width"))
          {
            origFrm.w = Double.parseDouble(kv[1].trim());
          }
          else if (k.equalsIgnoreCase("frm_height"))
          {
            origFrm.h = Double.parseDouble(kv[1].trim());
          }
          else if (k.equalsIgnoreCase("dsp_x"))
          {
            origDsp.l = Double.parseDouble(kv[1].trim());
          }
          else if (k.equalsIgnoreCase("dsp_y"))
          {
            origDsp.t = Double.parseDouble(kv[1].trim());
          }
          else if (k.equalsIgnoreCase("dsp_width"))
          {
            origDsp.w = Double.parseDouble(kv[1].trim());
          }
          else if (k.equalsIgnoreCase("dsp_height"))
          {
            origDsp.h = Double.parseDouble(kv[1].trim());
          }
          else if (k.equalsIgnoreCase("rot_degree"))
          {
            rot = Double.parseDouble(kv[1].trim());
          }
        }
      }
    }

    // Get current display body(rotated) and then actual display body
    // Current display body
    Element mainNode = ele.parent().parent();
    String[] styles = mainNode.attr("style").trim().split(";");
    Body currDsp = new Body();
    for (int i = 0; i < styles.length; i++)
    {
      String kvPair = styles[i];
      String[] kv = kvPair.split(":");
      if (kv.length == 2)
      {
        String k = kv[0].trim();
        if (k.equalsIgnoreCase("left"))
        {
          currDsp.l = getStylePosOrSize(kv[1].trim()) * slideW;
        }
        else if (k.equalsIgnoreCase("top"))
        {
          currDsp.t = getStylePosOrSize(kv[1].trim()) * slideH;
        }
        else if (k.equalsIgnoreCase("width"))
        {
          currDsp.w = getStylePosOrSize(kv[1].trim()) * slideW;
        }
        else if (k.equalsIgnoreCase("height"))
        {
          currDsp.h = getStylePosOrSize(kv[1].trim()) * slideH;
        }
      }
    }

    boolean keepratio = false;
    if (svg != null)
    {
      String preAttr = svg.attr("preserveaspectratio");
      if (preAttr.indexOf("none") < 0)
        keepratio = true;
    }

    // recalculate actual display rect
    Body actDsp = new Body();
    actDsp.l = currDsp.l;
    actDsp.t = currDsp.t;
    actDsp.w = currDsp.w;
    actDsp.h = currDsp.h;
    // if to keep ratio, we should use the smaller one between width/height
    if (keepratio)
    {
      double oldRatio = origDsp.w / origDsp.h;
      double newRatio = currDsp.w / currDsp.h;
      if (newRatio > oldRatio)
      {
        actDsp.w = oldRatio * currDsp.h;
        actDsp.l = currDsp.l + (currDsp.w - actDsp.w) / 2;
      }
      else
      {
        actDsp.h = currDsp.w / oldRatio;
        actDsp.t = currDsp.t + (currDsp.h - actDsp.h) / 2;
      }
    }

    // work out the new frame box
    Point[] pt = new Point[4];
    // points for original frame
    pt[0] = new Point();
    pt[0].x = origFrm.l;
    pt[0].y = origFrm.t;
    pt[1] = new Point();
    pt[1].x = origFrm.l;
    pt[1].y = origFrm.t + origFrm.h;
    pt[2] = new Point();
    pt[2].x = origFrm.l + origFrm.w;
    pt[2].y = origFrm.t + origFrm.h;
    pt[3] = new Point();
    pt[3].x = origFrm.l + origFrm.w;
    pt[3].y = origFrm.t;

    // original rotation center
    Point center = new Point();
    center.x = (pt[0].x + pt[2].x) * 0.5;
    center.y = (pt[0].y + pt[2].y) * 0.5;
    // rotate
    getRotatedPoints(pt, 4, rot, center);

    // get real pt in actual_display_body
    for (int i = 0; i < 4; ++i)
    {
      pt[i].x = actDsp.l + (pt[i].x - origDsp.l) * actDsp.w / origDsp.w;
      pt[i].y = actDsp.t + (pt[i].y - origDsp.t) * actDsp.h / origDsp.h;
    } // end for

    // new rotation center
    center.x = (pt[0].x + pt[2].x) * 0.5;
    center.y = (pt[0].y + pt[2].y) * 0.5;

    // rotate back
    getRotatedPoints(pt, 4, -rot, center);

    // get actual frame
    Body actFrm = new Body();
    actFrm.l = pt[0].x; // p1
    actFrm.t = pt[0].y;

    double delta1 = pt[1].x - pt[0].x;
    double delta2 = pt[1].y - pt[0].y;
    double delta3 = pt[3].x - pt[0].x;
    double delta4 = pt[3].y - pt[0].y;

    actFrm.h = Math.sqrt(delta1 * delta1 + delta2 * delta2); // p1p2
    actFrm.w = Math.sqrt(delta3 * delta3 + delta4 * delta4); // p1p4

    if (rot != 0)
    {
      // If rotated, actual display box and orig display box will the one
      // containing the rotated shape which is not wanted.
      // Need recalculate path frame and extend it per line width and ...
      // Here just give a fixed gap for rotated shape per actual frame
      double gap = 5 * 12700;
      actDsp.l = actFrm.l - gap;
      actDsp.t = actFrm.t - gap;
      actDsp.w = actFrm.w + 2 * gap;
      actDsp.h = actFrm.h + 2 * gap;
    }

    HashMap<String, Object> obj = new HashMap<String, Object>();
    obj.put("actFrm", actFrm);
    obj.put("actDsp", actDsp);
    obj.put("rot", rot);
    if (origFrm.w == 0)
      obj.put("xRatio", 1.0);
    else
      obj.put("xRatio", actFrm.w / origFrm.w);
    if (origFrm.h == 0)
      obj.put("yRatio", 1.0);
    else
      obj.put("yRatio", actFrm.h / origFrm.h);
    return obj;
  }

  private String scaleStrPath(String path, double xRatio, double yRatio)
  {
    if (Math.abs(xRatio - 1) <= 1e-5 && Math.abs(yRatio - 1) <= 1e-5)
      return path;
    String[] pathElems = path.trim().split(" ");
    int len = pathElems.length;
    String updatedPath = "";
    for (int i = 0; i < len; ++i)
    {
      if (pathElems[i].equals("M"))
      {
        updatedPath += pathElems[i] + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * xRatio) + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * yRatio) + " ";
      }
      else if (pathElems[i].equals("L"))
      {
        updatedPath += pathElems[i] + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * xRatio) + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * yRatio) + " ";
      }
      else if (pathElems[i].equals("Q"))
      {
        updatedPath += pathElems[i] + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * xRatio) + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * yRatio) + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * xRatio) + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * yRatio) + " ";
      }
      else if (pathElems[i].equals("C"))
      {
        updatedPath += pathElems[i] + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * xRatio) + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * yRatio) + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * xRatio) + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * yRatio) + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * xRatio) + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * yRatio) + " ";
      }
      else if (pathElems[i].equals("a"))
      {
        // arcto will use lower case "a" to be relative to before point
        updatedPath += pathElems[i] + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * xRatio) + " "; // ellipse x radius
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * yRatio) + " "; // ellipse y radius
        // i += 3;
        updatedPath += pathElems[++i] + " ";
        updatedPath += pathElems[++i] + " ";
        updatedPath += pathElems[++i] + " ";
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * xRatio) + " "; // dest x
        updatedPath += String.format("%.2f", Double.parseDouble(pathElems[++i]) * yRatio) + " "; // dest y
      }
      else if (pathElems[i].equals("Z"))
      {
        updatedPath += pathElems[i] + " ";
      }
      else
      {

      }
    }
    return updatedPath.trim();
  }

  private String getArrowKind(String path)
  {
    String arrowKind = "arrow";
    String[] pathElems = path.trim().split(" ");
    int len = pathElems.length;
    // String updatedPath = "";
    ArrayList<Point> points = new ArrayList<Point>();
    boolean isArrow = true;
    for (int i = 0; i < len; ++i)
    {
      if (pathElems[i].equals("M") || pathElems[i].equals("L"))
      {
        Point p = new Point();
        p.x = Double.parseDouble(pathElems[++i]);
        p.y = Double.parseDouble(pathElems[++i]);
        points.add(p);
      }
      else if (pathElems[i].equals("Z"))
      {
        isArrow = false;
      }
    }

    int num = points.size();
    if (num == 3)
    {
      if (!isArrow)
        arrowKind = "triangle";
    }
    else if (num == 4)
    {
      // calculate adjacent points distant and compare
      arrowKind = "diamond"; // suppose it is diamond
      double distance = 0;
      for (int i = 0; i < num; i++)
      {
        int adjacentPointIndex = (i < 3) ? i + 1 : 0;
        Point p1 = points.get(i);
        Point p2 = points.get(adjacentPointIndex);
        double newDist = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
        if (i == 0)
        {
          distance = newDist;
        }
        else
        {
          if ((distance - newDist) > 1e-2)
          {
            // change it as stealth
            arrowKind = "stealth";
            break;
          }
        }
      }
    }
    return arrowKind;
  }

  private void fixSvg(Element ele, HashMap<String, Object> bodies)
  {
    Elements svgs = ele.getElementsByTag("svg");
    if (svgs.size() == 1)
    {
      Element svg = svgs.get(0);
      Body actFrm = (Body) bodies.get("actFrm");
      Body actDsp = (Body) bodies.get("actDsp");
      double rot = (Double) bodies.get("rot");
      double xRatio = (Double) bodies.get("xRatio");
      double yRatio = (Double) bodies.get("yRatio");

      // Remove "cursor:pointer" in shape data node and text box data node
      Element shapeDataNode = ele.parent();
      if (shapeDataNode != null)
      {
        String style = shapeDataNode.attr("style");
        style = style.replaceAll("cursor\\s*:\\s*pointer\\s*;", "");
        shapeDataNode.attr("style", style);
      }

      Element txtBox = ele.nextElementSibling();
      if (txtBox != null)
      {
        Element txtBoxDataNode = txtBox.child(0);
        if (txtBoxDataNode != null)
        {
          String style = txtBoxDataNode.attr("style");
          style = style.replaceAll("cursor\\s*:\\s*pointer\\s*;", "");
          txtBoxDataNode.attr("style", style);
        }
      }

      // fix main node pos, size
      if (rot != 0)
      {
        Element mainNode = ele.parent().parent();
        String[] styles = mainNode.attr("style").trim().split(";");
        String updatedStyles = "";
        double newPercent = 0;
        for (int i = 0; i < styles.length; i++)
        {
          String kvPair = styles[i];
          String[] kv = kvPair.split(":");
          if (kv.length == 2)
          {
            String k = kv[0].trim();
            if (k.equalsIgnoreCase("left"))
            {
              newPercent = actDsp.l / slideW;
              updatedStyles += (k + ":" + String.valueOf(newPercent * 100) + "%;");
            }
            else if (k.equalsIgnoreCase("top"))
            {
              newPercent = actDsp.t / slideH;
              updatedStyles += (k + ":" + String.valueOf(newPercent * 100) + "%;");
            }
            else if (k.equalsIgnoreCase("width"))
            {
              newPercent = actDsp.w / slideW;
              updatedStyles += (k + ":" + String.valueOf(newPercent * 100) + "%;");
            }
            else if (k.equalsIgnoreCase("height"))
            {
              newPercent = actDsp.h / slideH;
              updatedStyles += (k + ":" + String.valueOf(newPercent * 100) + "%;");
            }
            else
            {
              updatedStyles += (kvPair + ";");
            }
          }
        }
        mainNode.attr("style", updatedStyles);

        // rotation will be set rot in client side per model
        // Flip info cannot be found in old draft, just fix it as no
        // flip

        // Fix text box rotation
        if (txtBox != null)
        {
          String style = txtBox.attr("style");
          style = style.replaceAll("-webkit-transform[^;]+;", "");
          style = style.replaceAll("-moz-transform[^;]+;", "");
          style = style.replaceAll("-ms-transform[^;]+;", "");
          style = style.replaceAll("transform[^;]+;", "");
          txtBox.attr("style", style);
        }
      }

      // fix svg preserve0 attribute
      // flip info is missed when import, so just take dir as 1 for all
      // old imported shape
      svg.attr("preserve0", "dsp_x:" + actDsp.l + ";dsp_y:" + actDsp.t + ";dsp_height:" + actDsp.h + ";dsp_width:" + actDsp.w + ";frm_x:"
          + actFrm.l + ";frm_y:" + actFrm.t + ";frm_height:" + actFrm.h + ";frm_width:" + actFrm.w + ";rot_degree:" + rot + ";dir:1");
      svg.attr("shape-version", "1.5");

      // fix fill-line-arrow ang get path frame size
      Body pathFrame = new Body();
      Elements flas = svg.getElementsByAttributeValue("groupfor", "fill-line-arrow");

      if (flas.size() == 1)
      {
        Element fla = flas.get(0);
        Elements children = fla.children();
        for (int i = 0, len = children.size(); i < len; i++)
        {
          Element child = children.get(i);
          String groupFor = child.attr("groupfor");
          if (groupFor.equalsIgnoreCase("fill"))
          {
            // fill
            Elements rectOrCircles = child.children();
            for (int j = 0, size = rectOrCircles.size(); j < size; j++)
            {
              Element rectOrCircle = rectOrCircles.get(j);
              String tagName = rectOrCircle.tagName();
              if (tagName.equalsIgnoreCase("rect"))
              {
                if (Math.abs(xRatio - 1) <= 1e-5 && Math.abs(yRatio - 1) <= 1e-5)
                  continue;
                // scale x, y, width, height
                pathFrame.l = Double.parseDouble(rectOrCircle.attr("x")) * xRatio;
                pathFrame.t = Double.parseDouble(rectOrCircle.attr("y")) * yRatio;
                pathFrame.w = Double.parseDouble(rectOrCircle.attr("width")) * xRatio;
                pathFrame.h = Double.parseDouble(rectOrCircle.attr("height")) * yRatio;
                rectOrCircle.attr("x", String.valueOf(pathFrame.l));
                rectOrCircle.attr("y", String.valueOf(pathFrame.t));
                rectOrCircle.attr("width", String.valueOf(pathFrame.w));
                rectOrCircle.attr("height", String.valueOf(pathFrame.h));
              }
              else if (tagName.equalsIgnoreCase("circle"))
              {
                rectOrCircle.attr("radialfillx", "0.5");
                rectOrCircle.attr("radialfilly", "0.5");

                if (Math.abs(xRatio - 1) <= 1e-5 && Math.abs(yRatio - 1) <= 1e-5)
                  continue;

                // scale cx, cy, r
                rectOrCircle.attr("cx", String.valueOf(Double.parseDouble(rectOrCircle.attr("cx")) * xRatio));
                rectOrCircle.attr("cy", String.valueOf(Double.parseDouble(rectOrCircle.attr("cy")) * yRatio));
                // the radius need be recalculated from path
                // frame. But very complicated for arcto and
                // bezto.
                // So temporarily use a bigger radius
                rectOrCircle.attr("r",
                    String.valueOf(Double.parseDouble(rectOrCircle.attr("r")) * (Math.sqrt(xRatio * xRatio + yRatio * yRatio))));
              }
            }
          }
          else if (groupFor.equalsIgnoreCase("line"))
          {
            // line and arrow
            if (Math.abs(xRatio - 1) <= 1e-5 && Math.abs(yRatio - 1) <= 1e-5)
              continue;
            Elements paths = child.children();
            for (int j = 0, size = paths.size(); j < size; j++)
            {
              Element path = paths.get(j);
              String tagName = path.tagName();
              if (tagName.equalsIgnoreCase("path"))
              {
                String d = path.attr("d");
                d = scaleStrPath(d, xRatio, yRatio);
                path.attr("d", d);
              }
            }
          }
          else if (groupFor.equalsIgnoreCase("arrow"))
          {
            // line and arrow
            Elements paths = child.children();
            int size = paths.size();
            for (int j = 0; j < size; j++)
            {
              Element path = paths.get(j);
              String tagName = path.tagName();
              if (tagName.equalsIgnoreCase("path"))
              {
                String d = path.attr("d");
                // Set arrow kind for editor resize arrow path
                // calculation
                path.attr("kind", getArrowKind(d));

                if (Math.abs(xRatio - 1) <= 1e-5 && Math.abs(yRatio - 1) <= 1e-5)
                  continue;

                d = scaleStrPath(d, xRatio, yRatio);
                path.attr("d", d);
              }
              else if (tagName.equalsIgnoreCase("circle"))
              {
                // Set arrow kind for editor resize arrow path
                // calculation
                path.attr("kind", "oval");

                if (Math.abs(xRatio - 1) <= 1e-5 && Math.abs(yRatio - 1) <= 1e-5)
                  continue;

                // Only arrow has this tag
                // scale cx, cy, r
                path.attr("cx", String.valueOf(Double.parseDouble(path.attr("cx")) * xRatio));
                path.attr("cy", String.valueOf(Double.parseDouble(path.attr("cy")) * yRatio));
                // the radius need be recalculated from path
                // frame. But very complicated for arcto and
                // bezto.
                // So temporarily use a smaller radius
                path.attr("r", String.valueOf(Double.parseDouble(path.attr("r")) * (xRatio <= yRatio ? xRatio : yRatio)));
              }

              String pathId = path.id();
              if (pathId.indexOf("head") < 0 && pathId.indexOf("tail") < 0)
              {
                if (size == 1)
                {
                  // only one arrow
                  path.attr("id", "tail_" + pathId);
                }
                else
                {
                  if (j == 0)
                  {
                    path.attr("id", "head_" + pathId);
                  }
                  else if (j == 1)
                  {
                    path.attr("id", "tail_" + pathId);
                  }
                }
              }
            }
          }
        }
      }

      // fix clip path, image fill
      Elements defs = svg.getElementsByAttributeValue("groupfor", "defs");
      if (defs.size() == 1)
      {
        Element def = defs.get(0);

        // clip path
        Elements clipPaths = def.getElementsByTag("clipPath");
        if (clipPaths.size() == 1)
        {
          // scale path points and merge all paths as one
          Element clipPath = clipPaths.get(0);
          Elements paths = clipPath.children();
          String mergedPath = "";
          for (int i = 0, len = paths.size(); i < len; i++)
          {
            Element path = paths.get(i);
            String d = path.attr("d");
            mergedPath += scaleStrPath(d, xRatio, yRatio) + " ";
            // Only keep the first path
            if (i != 0)
              path.remove();
          }
          paths.get(0).attr("d", mergedPath);
        }

        // Image fill
        Elements patterns = def.getElementsByAttribute("imgtarget");
        if (patterns.size() == 1 && (Math.abs(xRatio - 1) > 1e-5 || Math.abs(yRatio - 1) > 1e-5))
        {
          Element pattern = patterns.get(0);
          pattern.attr("x", String.valueOf(pathFrame.l));
          pattern.attr("y", String.valueOf(pathFrame.t));
          pattern.attr("width", String.valueOf(pathFrame.w));
          pattern.attr("height", String.valueOf(pathFrame.h));

          Element image = pattern.child(0);
          image.attr("x", "0");
          image.attr("y", "0");
          image.attr("width", String.valueOf(pathFrame.w));
          image.attr("height", String.valueOf(pathFrame.h));
        }
      }
    }
  }

  private void fixDomElementGraphic(Element ele)
  {
    Elements svgs = ele.getElementsByTag("svg");
    Element mainNode = ele.parent().parent();
    boolean isMasterObj = mainNode.attr("draw_layer").equalsIgnoreCase("backgroundobjects");
    if (!isMasterObj && svgs.size() == 1)
    {
      Element svg = svgs.get(0);
      if (svg.attr("shape-version").isEmpty())
      {
        // Old svg shape migration
        // 1. Calculate display body, frame body, path frame body
        HashMap<String, Object> bodies = calThreeBody(ele);
        // 2. Merge clip path and scale path points
        // Rect, circle, image fill pattern position, rotate center
        // reset per path frame body
        fixSvg(ele, bodies);
      }
    }
  }

  private void fixDomElementLineItem(Element lineElement)
  {
    String tagName = lineElement.tagName();
    fixDomElementId(lineElement, curElementLineIds, curElementId);
    curElementLineId = lineElement.attr("id");
    if (tagName.equalsIgnoreCase("ol") || tagName.equalsIgnoreCase("ul"))
    {
      fixDomElementLineItemOLUL(lineElement);
    }
    else if (tagName.equalsIgnoreCase("p"))
    {
      fixDomElementLineItemPLI(lineElement);
    }
  }

  private void fixDomElementLineItemOLUL(Element lineElement)
  {
    boolean fixed = false;
    Element backElemetnt = lineElement.clone();
    // OL--li/li fix to OL-LI + OL-LI
    lineElement.removeAttr("style");
    List<Node> lineChildrens = lineElement.childNodes();
    LinkedHashSet<Element> fixLinesList = new LinkedHashSet<Element>();

    for (int i = 0; i < lineChildrens.size(); i++)
    {
      Node lineNode = lineChildrens.get(i);
      if (lineNode instanceof Element)
      {
        if (((Element) lineNode).tagName().equalsIgnoreCase("li"))
        {
          fixLinesList.add((Element) lineNode);
        }
        else
        {
          lineNode.remove();
          i = i - 1;
        }
      }
      else if (lineNode instanceof TextNode)
      {
        lineNode.remove();
        i = i - 1;
      }
    }
    if (fixLinesList.size() == 0)
    {
      lineElement.remove();
      fixed = true;
    }
    else if (fixLinesList.size() == 1)
    {
      Iterator<Element> di = fixLinesList.iterator();
      Element linetocheck = di.next();
      fixDomElementLineItemPLI(linetocheck);
    }
    else
    {
      Iterator<Element> di = fixLinesList.iterator();
      Element fristItem = di.next();// keep the first one, fix follows
      fixDomElementLineItemPLI(fristItem);

      int id = 1;
      while (di.hasNext())
      {
        fixed = true;
        Element linetoFix = di.next();
        Element newLine = lineElement.clone();
        List<Node> c = newLine.childNodes();
        for (int i = c.size() - 1; i >= 0; i--)
        {
          Node child = c.get(i);
          child.remove();
        }
        String orgid = newLine.attr("id") + (id++);
        newLine.attr("id", orgid);
        curElementLineIds.put(orgid, "1");
        Element newel = linetoFix.clone();
        orgid = newel.attr("id") + (id);
        newel.attr("id", orgid);
        linetoFix.remove();
        newLine.appendChild(newel);
        lineElement.after(newLine);
        fixDomElementLineItemPLI(newel);
      }
    }

    if (fixed)
    {
      LOG.info("--- fixDomElementLineItemOLUL ---\n" + backElemetnt.toString());
      backElemetnt = null;
    }
  }

  private void fixDomElementLineItemPLI(Element plElement)
  {
    if (curElementSpanIds == null)
      curElementSpanIds = new HashMap<String, String>();
    if (!curElementSpanIds.isEmpty())
      curElementSpanIds.clear();
    List<Node> spanAndTexts = plElement.childNodes();
    for (int i = 0; i < spanAndTexts.size(); i++)
    {
      Node spanElement = spanAndTexts.get(i);
      if (spanElement instanceof Element)
      {
        String nName = spanElement.nodeName();// can be a or span
        if (nName.equalsIgnoreCase("a"))
        {
          spanElement = spanElement.childNode(0);
          nName = spanElement.nodeName();
        }
        if (!nName.equalsIgnoreCase("span") && !nName.equalsIgnoreCase("br"))
        {
          String spanText = ((Element) spanElement).text();
          if (spanText.length() == 0)
            spanText = text8203;
          Element spanNode = document.createElement("span");
          String spanNodeStyle = "font-size:1em;";
          spanNode.attr("style", spanNodeStyle);
          String spanId = "s_" + curElementLineId + "_" + i;
          spanNode.attr("id", spanId);
          spanNode.appendText(spanText);
          spanElement.after(spanNode);
          spanElement.remove();
          curElementSpanIds.put(spanId, "1");
        }
        else if (nName.equalsIgnoreCase("span"))
        {
          fixDomElementId((Element) spanElement, curElementSpanIds, curElementLineId);
          fixDomElementNestSpan((Element) spanElement);
          String spanText = ((Element) spanElement).text();
          if (spanText.length() == 0)
          {
            spanText = text8203;
            ((Element) spanElement).appendText(spanText);
          }
        }
      }
      else if (spanElement instanceof TextNode)
      {
        String spanText = spanElement.outerHtml();
        spanText = spanText.trim();
        if (spanText.length() > 0)
        {
          Element spanNode = document.createElement("span");
          String spanNodeStyle = "font-size:1em;";
          spanNode.attr("style", spanNodeStyle);
          String spanId = "s_" + curElementLineId + "_" + i;
          spanNode.attr("id", spanId);
          curElementSpanIds.put(spanId, "1");
          spanNode.appendText(spanText);
          spanElement.after(spanNode);
        }
        spanElement.remove();
      }
    }

    // last element must is BR;
    Elements pc = plElement.children();
    if (pc.size() == 0)
    {
      Element spanNode = document.createElement("span");
      String spanNodeStyle = "font-size:1em;";
      spanNode.attr("style", spanNodeStyle);
      String spanId = "s_" + curElementLineId + "_" + curElementSpanIds.size();
      spanNode.attr("id", spanId);
      spanNode.appendText(text8203);
      plElement.appendChild(spanNode);
      curElementSpanIds.put(spanId, "1");
      Element brNode = document.createElement("br");
      brNode.addClass("hideInIE");
      plElement.appendChild(brNode);
    }
    else if (pc.size() == 1 && pc.get(0).tagName().equalsIgnoreCase("br"))
    {
      Element spanNode = document.createElement("span");
      String spanNodeStyle = "font-size:1em;";
      spanNode.attr("style", spanNodeStyle);
      String spanId = "s_" + curElementLineId + "_" + curElementSpanIds.size();
      spanNode.attr("id", spanId);
      spanNode.appendText(text8203);
      pc.get(0).before(spanNode);
    }
    else
    {
      Element lastBr = pc.get(pc.size() - 1);
      if (!lastBr.tagName().equalsIgnoreCase("br"))
      {
        Element brNode = document.createElement("br");
        brNode.addClass("hideInIE");
        plElement.appendChild(brNode);
      }
    }
  }

  private void fixDomElementFlyTextToLineitem(Node lineNode)
  {
    // text convert to P node.
    String oh = lineNode.outerHtml();
    if (oh.equalsIgnoreCase(" ") || oh.equalsIgnoreCase("&nbsp;") || oh.length() == 0
        || (oh.length() == 1 && (oh.equalsIgnoreCase(rtext65279) || oh.equalsIgnoreCase(rtext8203))))
    {
      return;
    }
    Node oldText = lineNode.clone();
    Element pNode = document.createElement("p");
    String pid = "p_" + curElementId + "_" + curElementLineIds.size();
    pNode.attr("id", pid);
    curElementLineIds.put(pid, "1");
    Element spanNode = document.createElement("span");
    String spanNodeStyle = "font-size:1em;";
    spanNode.attr("style", spanNodeStyle);
    spanNode.attr("id", "s_" + pid);
    spanNode.appendChild(oldText);
    Element brNode = document.createElement("br");
    brNode.addClass("hideInIE");
    pNode.appendChild(spanNode);
    pNode.appendChild(brNode);
    lineNode.after(pNode);
    lineNode.remove();
  }

  private void text(Element spanElement, StringBuilder accum)
  {
    List<Node> childNodes = spanElement.childNodes();
    for (Node child : childNodes)
    {
      if (child instanceof TextNode)
      {
        TextNode textNode = (TextNode) child;
        String text = textNode.getWholeText();
        text = StringUtil.normaliseWhitespace(text);
        accum.append(text);
      }
      else if (child instanceof Element)
      {
        Element element = (Element) child;
        text(element, accum);
      }
    }
  }

  private void fixDomElementNestSpan(Element spanElement)
  {
    try
    {
      List<Node> aspanAndTexts = spanElement.childNodes();
      if (aspanAndTexts.size() == 1 && aspanAndTexts.get(0) != null && aspanAndTexts.get(0).nodeName().equalsIgnoreCase("a"))
      {
        spanElement = (Element) aspanAndTexts.get(0).childNode(0);
      }
    }
    catch (Exception e)
    {
    }
    StringBuilder sb = new StringBuilder();
    text(spanElement, sb);
    String textContent = sb.toString();
    spanElement.text(textContent);
  }
}
