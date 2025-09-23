/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2odt;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.style.OdfStylePageLayout;
import org.odftoolkit.odfdom.dom.element.style.StyleMasterPageElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.odftoolkit.odfdom.pkg.manifest.OdfFileEntry;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.sym.SymConversionResult;
import com.ibm.symphony.conversion.converter.sym.impl.SymphonyConverterImpl;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class JSON2ODTConverter extends AbstractFormatConverter
{
  private static Logger log = Logger.getLogger(JSON2ODTConverter.class.getName());

  private static Map<String, String> styleNameMap = new HashMap<String, String>();

  private static HashSet<String> enhancedStyleName = new HashSet<String>();

  static
  {
    enhancedStyleName.add("draw:hatch");
    enhancedStyleName.add("draw:gradient");
    enhancedStyleName.add("draw:fill-image");
    enhancedStyleName.add("draw:opacity");
    enhancedStyleName.add("draw:stroke-dash");
    enhancedStyleName.add("draw:marker");
    enhancedStyleName.add("svg:linearGradient");
    enhancedStyleName.add("svg:radialGradient");
    enhancedStyleName.add("svg:stop");
  }

  private ConversionResult convert(File sourceFile, File targetFolder, Map parameters, boolean isZip) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", sourceFile.getPath());
    ConversionResult result = new ConversionResult();
    SymConversionResult symResult = null;
    String converted = null;
    File tmpFolder = getTempFolder();
    try
    {
      // json->docx
      ConversionResult tempResult = ConversionService.getInstance()
          .getConverter(ConversionConstants.JSON_MIMETYPE, ConversionConstants.DOCX_MIMETYPE).convert(sourceFile, tmpFolder, parameters);
      if(tempResult.isSucceed())
      {
          // docx->odt
          symResult = SymphonyConverterImpl.getInstance().convert(tempResult.getConvertedFilePath(), targetFolder.getAbsolutePath(),
              ConversionConstants.DOCX_MIMETYPE, ConversionConstants.ODT_MIMETYPE, parameters == null ? null : new HashMap(parameters));

          if (symResult.isSucceed())
          {
            converted = symResult.getTargetFile();
            File convertedFile = new File(converted);
            result.setConvertedFile(convertedFile);

            // zip target content folder
            if (isZip)
            {
              File convertedFolder = convertedFile.getParentFile();
              File targetFile = new File(convertedFolder.getParent(), convertedFolder.getName() + ConversionConstants.SUFFIX_ZIP);
              FileUtil.zipFolder(convertedFolder, targetFile);
              result.setConvertedFile(targetFile);
            }

            handlePreserve(sourceFile.getAbsolutePath(), targetFolder.getAbsolutePath());
          }
          else
          {
            String featureID = symResult.getErrorCode();
            String waringDesc = symResult.getErrorMsg();
            ConversionWarning ce = new ConversionWarning(featureID, false, "", waringDesc);
            result.addWarning(ce);
            result.setSucceed(false);
          }   	  
      }

    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "Failed to convert JSON to ODT:", e);
      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    finally
    {
      FileUtil.forceDelete(tmpFolder);
    }
    log.exiting(getClass().getName(), "convert");
    return result;
  }

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    return convert(sourceFile, targetFolder, parameters, false);
  }

  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "json2odt"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters, true);
  }

  private File getTempFolder()
  {
    IConversionService conversionService = ConversionService.getInstance();
    // Symphony converter uses source file name as converted file name. In order to avoid replacement,
    // create temp folder for each document
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "json2odt"
        + File.separator + "temp" + File.separator + UUID.randomUUID());
    tempFolder.mkdirs();
    return tempFolder;
  }

  public boolean isRunnableAvailable()
  {

    return SymphonyConverterImpl.getInstance().hasAvailableInstance();
  }

  private void handlePreserve(String xmlPath, String odtPath)
  {
    OdfDocument odfDoc = null;
    try
    {
      File shapeFile = new File(xmlPath, "odfshape.xml");
      File bgImgPath = new File(xmlPath, "Pictures/odfBgPic");
      boolean isShapePreserved = shapeFile.exists();
      boolean isBgImgPreserved = bgImgPath.exists();
      if (!isShapePreserved && !isBgImgPreserved)
        return;

      Element shapeRoot = null;
      Element shapeStyleRoot = null;
      if(isShapePreserved)
      {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document shapeDoc = builder.parse(shapeFile);
        shapeRoot = shapeDoc.getDocumentElement();
  
        File shapeStyleFile = new File(xmlPath, "odfshapestyle.xml");
        if (shapeStyleFile.exists())
        {
          Document styleDoc = builder.parse(shapeStyleFile);
          shapeStyleRoot = styleDoc.getDocumentElement();
        }
      }

      File odfFile = new File(odtPath, "content.odt");
      odfDoc = OdfDocument.loadDocument(odfFile);
      
      if(isShapePreserved)
      {
        OdfFileDom contentDom = odfDoc.getContentDom();
        OdfElement contentRoot = contentDom.getRootElement();
        OdfElement content = (OdfElement) contentRoot.getElementsByTagName(ODFConstants.OFFICE_TEXT).item(0);
        shapePreserve(content, shapeRoot, shapeStyleRoot, contentDom);
      }
      
      OdfFileDom styleDom = odfDoc.getStylesDom();
      OdfElement styleRoot = styleDom.getRootElement();
      NodeList nodelist = styleRoot.getElementsByTagName(ODFConstants.STYLE_HEADER);
      for(int i=0; i<nodelist.getLength(); i++)
      {
        OdfElement headerContent = (OdfElement) nodelist.item(i);
        if(isShapePreserved)
          shapePreserve(headerContent, shapeRoot, shapeStyleRoot, styleDom);
        if(isBgImgPreserved)
          bgImgPreserve(headerContent, styleDom, bgImgPath);
      }
      
      nodelist = styleRoot.getElementsByTagName(ODFConstants.STYLE_FOOTER);
      for(int i=0; i<nodelist.getLength(); i++)
      {
        OdfElement footerContent = (OdfElement) nodelist.item(i);
        if(isShapePreserved)
          shapePreserve(footerContent, shapeRoot, shapeStyleRoot, styleDom);
        if(isBgImgPreserved)
          bgImgPreserve(footerContent, styleDom, bgImgPath);
      }
      
      if(isShapePreserved)
        copyEnhancedStyle(shapeStyleRoot, styleDom);

      copyPictures(xmlPath, odfDoc);

      odfDoc.save(odfFile);
    }
    catch (Exception e)
    {
      log.log(Level.WARNING, "Failed to preserve shape", e);
    }
    finally
    {
      styleNameMap.clear();
      if (odfDoc != null)
        odfDoc.close();
    }
  }

  private void bgImgPreserve(OdfElement content, OdfFileDom dom, File bgImgPath)
  {
    NodeList nodelist = content.getElementsByTagName(ODFConstants.TEXT_A);
    int aLen = nodelist.getLength();
    for(int i=0; i<aLen; i++)
    {
      OdfElement aElement = (OdfElement) nodelist.item(i);
      String href = aElement.getAttribute(ODFConstants.ODF_ATTR_XLINK_HREF);

      int index1 = href.lastIndexOf("/");
      if(index1 == -1)
        continue;

      int index2 = href.lastIndexOf("media");
      if(index2 == -1 || (index2 != (index1 - 5)))
        continue;
      
      String fileName = href.substring(index1);
      String fullFileName = bgImgPath.getAbsolutePath() + fileName ;
      File imgFile = new File(fullFileName);
      if(imgFile.exists())
      {
        OdfElement bgElement = dom.createElementNS("style","style:background-image");
        bgElement.setAttributeNS("xlink", "xlink:href", "Pictures"+fileName);
        bgElement.setAttributeNS("xlink", "xlink:type", "simple");
        bgElement.setAttributeNS("xlink", "xlink:actuate", "onLoad");
        bgElement.setAttributeNS("style", "style:repeat", "no-repeat");
        
        StyleMasterPageElement master = (StyleMasterPageElement) content.getParentNode();
        String pgLayoutName = master.getStylePageLayoutNameAttribute();
        OdfStylePageLayout pgLayout = dom.getAutomaticStyles().getPageLayout(pgLayoutName);
        if(pgLayout != null)
        {
          NodeList props = pgLayout.getChildNodes();
          for(int j= 0;j< props.getLength();j++)
          {
            Node prop = props.item(j);
            if(prop.getNodeName().equalsIgnoreCase("style:page-layout-properties"))
            {
              if(prop.hasChildNodes())
                prop.insertBefore(bgElement, prop.getFirstChild());
              else
                prop.appendChild(bgElement);
              break;
            }
          }
        }

        aElement.getParentNode().removeChild(aElement);
       }
    }
  }

  private void shapePreserve(OdfElement content, Element shapeRoot, Element shapeStyleRoot, OdfFileDom dom)
  {
    Vector<Data> phVec = new Vector<Data>();
    Vector<Data> preserveVec = new Vector<Data>();
    getShapeAMap(content, phVec, preserveVec);
    int index = 0;
    for(int i=0; i< phVec.size(); i++)
    {
      Data data = phVec.get(i);
      String shapeID = data.getShapeID();
      OdfElement aElement = data.getAElement();
      Element shapeElement = getShapeElement(shapeRoot, shapeID);
      if (shapeElement == null)
        continue;
      
      OdfElement elementA = null;
      OdfElement elementB = null;
      if(shapeID.startsWith("_odfshape"))
      {
        elementA = preserveVec.get(index++).getAElement();
        elementB = preserveVec.get(index++).getAElement();
        
        Node cloneShape = dom.importNode(shapeElement, true);
        updateShapeTextAddStyle((Element) cloneShape, shapeStyleRoot, elementA, elementB, dom);
        copyImageStyle((Element) cloneShape, shapeStyleRoot, dom);
        deleteSpanInA((Element) cloneShape);
        
        Node parent = aElement.getParentNode();
        if ("page".equals(((Element) cloneShape).getAttribute(ODFConstants.TEXT_ANCHOR_TYPE)))
        {
          Node ancestor = parent.getParentNode();
          ancestor.insertBefore(cloneShape, ancestor.getFirstChild()); //anchor to page textbox under a p, move textbox to body
          if(parent.getFirstChild().getNextSibling() == null)//just a anchor to page textbox under a p, delete p
            ancestor.removeChild(parent);
        }
        else
          parent.insertBefore(cloneShape, aElement);
      }
      else if(shapeID.startsWith("_odfgroup"))
      {
        Node cloneGroup = dom.importNode(shapeElement, true);
        index = updateGroupTextAddStyle((Element) cloneGroup, shapeID, shapeStyleRoot, preserveVec, index, dom);
        deleteSpanInA((Element) cloneGroup);
        aElement.getParentNode().insertBefore(cloneGroup, aElement);
      }
    }
    
    // delete placeholder
    for (int i = 0; i < phVec.size(); i++)
    {
      Node node = phVec.get(i).getAElement();
      node.getParentNode().removeChild(node);
    }
    for (int i = 0; i < preserveVec.size(); i++)
    {
      Node node = preserveVec.get(i).getAElement();
      node.getParentNode().removeChild(node);
    }
    
  }
  
  private void getShapeAMap(Element content, Vector<Data> phVec, Vector<Data> preserveVec)
  {
    NodeList nodelist = content.getElementsByTagName(ODFConstants.TEXT_A);
    String firstShapeID = null;
    int j = 0;
    for(int i=0; i<nodelist.getLength(); i++)
    {
      OdfElement aElement = (OdfElement) nodelist.item(i);
      String href = aElement.getAttribute(ODFConstants.ODF_ATTR_XLINK_HREF);
      int index1 = href.lastIndexOf("_");
      if(index1 == -1)
        continue;
      int index2 = href.substring(0, index1).lastIndexOf("_");
      if(index2 == -1)
        continue;
      String shapeID = href.substring(index2, index1);
      
      if(firstShapeID == null)
      {
        if(shapeID.startsWith("_odfshape") || shapeID.startsWith("_odfgroup"))
        {
          firstShapeID = href;
          Data data = new Data(shapeID, aElement);
          phVec.add(data);
          continue;
        }
        else
          continue;
      }
      
      if(href.equals(firstShapeID))
      {
        Data data = new Data(shapeID, (OdfElement) aElement.getParentNode());
        preserveVec.add(data);
        j = i+1;
        break;
      }
      
      if(shapeID.startsWith("_odfshape") || shapeID.startsWith("_odfgroup"))
      {
        Data data = new Data(shapeID, aElement);
        phVec.add(data);
      }
    }
    
    for( ; j<nodelist.getLength(); j++)
    {
      OdfElement aElement = (OdfElement) nodelist.item(j);
      String href = aElement.getAttribute(ODFConstants.ODF_ATTR_XLINK_HREF);
      String shapeID;
      int index1 = href.lastIndexOf("_");
      if(index1 == -1)
        continue;
      int index2 = href.substring(0, index1).lastIndexOf("_");
      if(index2 == -1)
        shapeID = href.substring(index1, href.length());
      else
        shapeID = href.substring(index2, index1);
      
      if(shapeID.startsWith("_odfshape") ||shapeID.startsWith("_odfgroup") || shapeID.startsWith("_odfgrshape"))
      {
        Data data = new Data(shapeID, (OdfElement) aElement.getParentNode());
        preserveVec.add(data);
      }
    }
  }
  
  // get Shape Element from odfshape.xml
  private Element getShapeElement(Element root, String shapeID)
  {
    Element element = (Element) root.getFirstChild();
    while (element != null)
    {
      if (shapeID.equals(element.getAttribute("xml:id")))
        return element;
      element = (Element) element.getNextSibling();
    }
    return null;
  }

  private Element getShapeFromGroup(Element group, String shapeID)
  {
    Element child = (Element) group.getFirstChild();
    while (child != null)
    {
      if (shapeID.equals(child.getAttribute("xml:id")))
        return child;
      else if (ODFConstants.DRAW_G.equals(child.getNodeName()))
      {
        Element grandChild = getShapeFromGroup(child, shapeID);
        if (grandChild != null)
          return grandChild;
      }

      child = (Element) child.getNextSibling();
    }
    return null;
  }

  private void updateShapeTextAddStyle(Element shapeElement, Element shapeStyleRoot, Element elementA, Element elementB, OdfFileDom dom)
  {
    copyStyle(shapeElement, shapeStyleRoot, dom);
    shapeElement.removeAttribute("xml:id");
    boolean isTextbox = false;
    if (shapeElement.getNodeName().equals(ODFConstants.DRAW_FRAME))
    {
      shapeElement = (Element) shapeElement.getFirstChild();// get draw:text-box
      isTextbox = true;
    }
    
    Node child = shapeElement.getFirstChild();
    while (child != null)
    {
      Node temp = child;
      child = child.getNextSibling();
      if (isTextbox || temp.getNodeName().equals(ODFConstants.TEXT_P))
      {
        shapeElement.removeChild(temp);
      }
    }
    Node node = elementA.getNextSibling();
    Node flagNode = shapeElement.getFirstChild();
    while(node != elementB)
    {
      Node temp = node;
      node = node.getNextSibling();
      shapeElement.insertBefore(temp, flagNode);
    }
  }
  
  private int updateGroupTextAddStyle(Element groupElement, String groupID, Element shapeStyleRoot, Vector<Data> preserveVec, int index, OdfFileDom dom)
  {
    groupElement.removeAttribute("xml:id");
    
    Data data = preserveVec.get(index++);
    if(!data.getShapeID().equals(groupID))
    {
      return index-1;
    }
    
    for( ; index<preserveVec.size(); index++)
    {
      Data dataA = preserveVec.get(index);
      String shapeID = dataA.getShapeID();
      if(shapeID.equals(groupID))
      {
        index++;
        break;
      }
      Element elementA = dataA.getAElement();
      
      Data dataB = preserveVec.get(++index);
      Element elementB = dataB.getAElement();
      
      Element shapeElement = getShapeFromGroup(groupElement, shapeID);
      if (shapeElement != null)
      {
        updateShapeTextAddStyle(shapeElement, shapeStyleRoot, elementA, elementB, dom);
      }
    }
    
    copyStyle(groupElement, shapeStyleRoot, dom);
    copyImageStyle(groupElement, shapeStyleRoot, dom);
    NodeList nodelist = groupElement.getElementsByTagName(ODFConstants.DRAW_G);
    for (int j = 0; j < nodelist.getLength(); j++)
    {
      copyStyle((Element) nodelist.item(j), shapeStyleRoot, dom);
    }
    
    return index;
  }

  private void copyStyle(Element shapeElement, Element shapeStyleRoot, OdfFileDom dom)
  {
    if (shapeStyleRoot == null)
      return;

    String styleName = shapeElement.getAttribute(ODFConstants.DRAW_STYLE_NAME);
    String newStyleName = styleNameMap.get(styleName);
    if (newStyleName != null)
    {
      shapeElement.setAttribute(ODFConstants.DRAW_STYLE_NAME, newStyleName);
      return;
    }

    Node styleNode = shapeStyleRoot.getFirstChild();
    while (styleNode != null)
    {
      if (styleName.equals(((Element) styleNode).getAttribute(ODFConstants.STYLE_NAME)))
      {
        Node cloneStyleNode = dom.importNode(styleNode, true);
        if (dom.getAutomaticStyles().getStyle(styleName, OdfStyleFamily.Graphic) != null)// same style name, rename
        {
          newStyleName = styleName + "_1";
          ((Element) cloneStyleNode).setAttribute(ODFConstants.STYLE_NAME, newStyleName);
          shapeElement.setAttribute(ODFConstants.DRAW_STYLE_NAME, newStyleName);
          styleNameMap.put(styleName, newStyleName);
        }
        dom.getAutomaticStyles().appendChild(cloneStyleNode);
        shapeStyleRoot.removeChild(styleNode);
        return;
      }
      styleNode = styleNode.getNextSibling();
    }
  }

  private void copyEnhancedStyle(Element shapeStyleRoot, OdfFileDom styleDom)
  {
    Node child = shapeStyleRoot.getFirstChild();
    while (child != null)
    {
      if (enhancedStyleName.contains(child.getNodeName()))
      {
        Node cloneChild = styleDom.importNode(child, true);
        styleDom.getOfficeStyles().appendChild(cloneChild);
      }
      child = child.getNextSibling();
    }
  }

  private void copyImageStyle(Element element, Element shapeStyleRoot, OdfFileDom dom)
  {
    NodeList nodelist = element.getElementsByTagName(ODFConstants.DRAW_IMAGE);
    for (int j = 0; j < nodelist.getLength(); j++)
    {
      Element node = (Element) nodelist.item(j);
      copyStyle((Element) node.getParentNode(), shapeStyleRoot, dom);
      String href = node.getAttribute(ODFConstants.ODF_ATTR_XLINK_HREF);
      String hrefLowwer = href.toLowerCase();
      if(hrefLowwer.endsWith(".wmf") || hrefLowwer.endsWith(".emf"))
        node.setAttribute(ODFConstants.ODF_ATTR_XLINK_HREF, href.substring(0, href.length()-3)+"png");
      else if(href.lastIndexOf(".") == 0 && href.startsWith("./ObjectReplacements"))
      {
        href = href.replaceFirst(" ", "_");
        href = href.replaceFirst("./ObjectReplacements", "Pictures");
        node.setAttribute(ODFConstants.ODF_ATTR_XLINK_HREF, href+".png");
        Node parent = node.getParentNode();
        Node child = parent.getFirstChild();
        while(child != null)
        {
          if(child.getNodeName().equals("draw:object-ole"))
          {
            parent.removeChild(child);
            break;
          }
          child = child.getNextSibling();
        }
      }
    }
  }
  
  private void copyPictures(String sourcePath, OdfDocument odf)
  {
    File pictureRoot = new File(sourcePath + "/Pictures/");
    if (!pictureRoot.exists())
      return;

    FileInputStream in = null;
    OdfPackage odfPackage = odf.getPackage();
    Set<String> fileEntries = odfPackage.getFileEntries();
    File[] pictureFileList = pictureRoot.listFiles();
    try
    {
      for (int i = 0; i < pictureFileList.length; i++)
      {
        String fileName = pictureFileList[i].getName();
        if(pictureFileList[i].isFile() && !fileName.endsWith("svg"))
        {
          String filePath = "Pictures/" + fileName;
          if (!fileEntries.contains(filePath))
          {
            in = new FileInputStream(pictureFileList[i].getAbsolutePath());
            if (in != null)
            {
              odfPackage.insert(in, "./Pictures/" + fileName, OdfFileEntry.getMediaTypeString(fileName));
              in.close();
            }
          }
        }
      }
      
      File orRoot = new File(sourcePath + "/Pictures/ObjectReplacements/");
      if (orRoot.exists())
      {
        File[] orRootFileList = orRoot.listFiles();
        for (int i = 0; i < orRootFileList.length; i++)
        {
          String fileName = orRootFileList[i].getName();
          in = new FileInputStream(orRootFileList[i].getAbsolutePath());
          if (in != null)
          {
            odfPackage.insert(in, "./Pictures/" + fileName, OdfFileEntry.getMediaTypeString(fileName));
            in.close();
          }
        }
      }
      
      File bgRoot = new File(sourcePath + "/Pictures/odfBgPic/");
      if (bgRoot.exists())
      {
        File[] bgRootFileList = bgRoot.listFiles();
        for (int i = 0; i < bgRootFileList.length; i++)
        {
          String fileName = bgRootFileList[i].getName();
          in = new FileInputStream(bgRootFileList[i].getAbsolutePath());
          if (in != null)
          {
            odfPackage.insert(in, "./Pictures/" + fileName, OdfFileEntry.getMediaTypeString(fileName));
            in.close();
          }
        }
      }      
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "Picture copy error", e);
    }
    finally
    {
      if (in != null)
      {
        try
        {
          in.close();
        }
        catch (IOException e)
        {
        }
      }
    }
  }
  
  private void deleteSpanInA(Element element)
  {
    NodeList nodelist = element.getElementsByTagName(ODFConstants.TEXT_A);
    for(int i=0; i<nodelist.getLength(); i++)
    {
      Node node = nodelist.item(i);
      String content = node.getTextContent();
      Node child = node.getFirstChild();
      while(child != null)
      {
        Node temp = child;
        child = child.getNextSibling();
        node.removeChild(temp);
      }
      node.setTextContent(content);
    }
  }
}

class Data{
  
  public Data(String shapeID, OdfElement aElement)
  {
    this.shapeID = shapeID;
    this.aElement = aElement;
  }
  
  public String getShapeID()
  {
    return shapeID;
  }
  
  public OdfElement getAElement()
  {
    return aElement;
  }
  
  private String shapeID;
  private OdfElement aElement;
}
