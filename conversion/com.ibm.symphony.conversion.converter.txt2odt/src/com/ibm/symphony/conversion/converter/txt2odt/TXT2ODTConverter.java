/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.txt2odt;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfTextDocument;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.element.meta.MetaDocumentStatisticElement;
import org.odftoolkit.odfdom.incubator.meta.OdfMetaDocumentStatistic;
import org.odftoolkit.odfdom.incubator.meta.OdfOfficeMeta;
import org.w3c.dom.NodeList;

import com.ibm.icu.text.CharsetDetector;
import com.ibm.icu.text.CharsetMatch;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class TXT2ODTConverter extends AbstractFormatConverter
{
  private static Logger log = Logger.getLogger(TXT2ODTConverter.class.getName());

  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    try
    {
      IConversionService conversionService = ConversionService.getInstance();
      File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "txt2odt"
          + File.separator + UUID.randomUUID());

      boolean isNewDirSuccess = targetFolder.mkdirs();

      if (isNewDirSuccess)
        return convert(sourceFile, targetFolder, parameters);
      else
        return failedConversionResult(ConversionConstants.ERROR_UNKNOWN, null);
    }
    catch (Exception e)
    {
      return failedConversionResult(ConversionConstants.ERROR_UNKNOWN, e.getMessage());
    }
  }
  
  private ConversionResult failedConversionResult(String ERROR_ID, String ERROR_Message) throws ConversionException
  {
    ConversionResult result = new ConversionResult();
    ConversionWarning ce = new ConversionWarning(ERROR_ID, false, "", ERROR_Message);
    result.addWarning(ce);
    result.setSucceed(false);
    return result;
  }

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", new Object[] { sourceFile, targetFolder, parameters });
    
    boolean ignoreLimit = (parameters != null && Boolean.valueOf((String) parameters.get("isPublished")));
    if(!ignoreLimit && isFileTooLarge(sourceFile))
    {
      ConversionResult result = new ConversionResult();
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_FILE_IS_TOO_LARGE, false, "", "File size is greater than predefined pure text size");
      Map<String, String> params = new HashMap<String, String>();
      params.put("conv_err_code", ConversionConstants.ERROR_DOCUMENT_EXCEED_PAGE_CHARACTER);
      ce.setParameters(params);     
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
    
    ConversionResult result = new ConversionResult();
    OdfDocument odfDoc = null;
    
    try
    {
      String odfPath = targetFolder.getPath() + File.separator + sourceFile.getName() + ".odt";
      File odfFile = new File(odfPath);
      if (!odfFile.exists())
      {
        odfDoc = OdfTextDocument.newTextDocument();
        odfDoc.save(odfFile);
      }
      convert(odfDoc, sourceFile);
      odfDoc.save(odfFile);
      result.setConvertedFile(odfFile);
      
    }
    catch (Exception e)
    {
      log.severe(e.getMessage());
      result = failedConversionResult(ConversionConstants.ERROR_UNKNOWN, e.getMessage());
    }
    finally
    {
      if (odfDoc != null)
      {
        odfDoc.close();
      }
    }
    log.exiting(getClass().getName(), "convert");
    return result;
  }
  
  public void convert(OdfDocument odfDoc, File sourceFile)
  {
    BufferedReader br = null;
    BufferedInputStream bis = null;
    try
    {   
      OdfElement odfContent = odfDoc.getContentDom().getRootElement();
      OdfElement officeText = (OdfElement) odfContent.getElementsByTagName(ODFConstants.OFFICE_TEXT).item(0);
      
      NodeList nodelist = officeText.getChildNodes();
      for(int i=nodelist.getLength(); i>0; i--)
        officeText.removeChild(officeText.getFirstChild());
      
      CharsetDetector cd = new CharsetDetector();
      bis = new BufferedInputStream( new FileInputStream( sourceFile ) );
      cd.setText(bis);
      CharsetMatch cm = cd.detect();
      String charset = cm.getName();
      
      br = new BufferedReader(new InputStreamReader(new FileInputStream(sourceFile), charset));
      
      String lineText = null; 
      OdfFileDom odfFileDom = odfDoc.getContentDom();
      while((lineText = br.readLine()) != null)
      { 
        OdfElement odfElement = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_P));
        ((OdfStylableElement)odfElement).setStyleName("Preformatted_20_Text");
        officeText.appendChild(odfElement);
        
        int index = 0;
        int lineTextLen = lineText.length();
        for(int i=0; i<lineTextLen; i++)
        {
          if(lineText.charAt(i) == '\t')
          {
            if(index != i)
              odfElement.appendChild(odfFileDom.createTextNode(lineText.substring(index, i)));
            index = i+1;
            OdfElement tabOdfElement = odfFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_TAB));
            odfElement.appendChild(tabOdfElement);
          }
        }
        if(index != lineTextLen)
          odfElement.appendChild(odfFileDom.createTextNode(lineText.substring(index)));
      } 
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    finally
    {
      if (br != null)
      {
        try
        {
          br.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
      if (bis != null)
      {
        try
        {
          bis.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
  }
  
  private boolean isFileTooLarge(File file)
  {
    int maxKByteSize = 768;
	JSONObject docConfItem = (JSONObject) ConversionService.getInstance().getConfig("document");
	if (docConfItem != null)
	{
	  maxKByteSize = ((Long) docConfItem.get("max-pure-text-size")).intValue();
	}
	long fileLen = file.length();
	int len = (int) (fileLen/1024) + (fileLen%1024==0?0:1) ;
	if(len > maxKByteSize)
	  return true;
	  
	return false;
  }
  
//  public TxtWithoutSRVElement(String text)
//  {
//    Pattern p = Pattern.compile("\\s*|\r");
//  }
}
