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
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import symphony.org.w3c.tidy.Tidy;

import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.util.JTidyUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;
import com.realobjects.pdfreactor.PDFreactor;

public class HTML2PDFConverter extends AbstractFormatConverter
{

  private static final Logger log = Logger.getLogger(HTML2PDFConverter.class.getName());

  private static final String LICENSE_FILE = "/pdfreactor-lic.xml";

  private static String LICENSE_KEY = null;

  private static final String HIDDEN_ELEMENT = "HTML2PDFConverter_hidden_element";

  private static final String HIDDEN_ELEMENT_STYLE = "HTML2PDFConverter_hidden_element_style";

  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "html2pdf"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters);
  }

  private Map prepareParameters(Map parameters/*,JSONObject option*/)
  {
    if (parameters == null)
      return null;

    String editorType = (String) parameters.get("editorType");
    if (editorType != null)
    {
      Map options = new HashMap();
      if (editorType.startsWith("writer"))
      {
        Map writerOpts = (Map) ConvertUtil.getDefaultPDFOptions().get("default_text");
        options.putAll(writerOpts);
//        options.putAll(option);
      }
      else if (editorType.startsWith("presentation"))
      {
        Map presentationOpts = (Map) ConvertUtil.getDefaultPDFOptions().get("default_presentation");
        options.putAll(presentationOpts);
      }
      options.putAll(parameters);
      return options;
    }
    else
      return parameters;
  }

  private IProcessor getProcessor(Map parameters)
  {
    if(parameters != null)
    {
      String editorType = (String) parameters.get("editorType");
      if (editorType != null)
      {
        if (editorType.startsWith("writer"))
        {
          return new WriterProcessor();
        }
        else if (editorType.startsWith("presentation"))
        {
          return new PresentationProcessor();
        }
      }
    }
    return new DefaultProcessor();
  }

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", new Object[] { sourceFile, targetFolder, parameters });
    log.info("source: " + sourceFile.getName());
    log.info("target: " + targetFolder);
//    JSONObject option =  getPDFPrintOption(sourceFile.getPath() + File.separator + IndexUtil.PDFPRINT);
    parameters = prepareParameters(parameters/*,option*/);

    // Step 1. check license
    ConversionResult result = new ConversionResult();
    if (!getPDFReaderLicense())
    {
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", Constants.ERROR_NOLICENSE);
      result.addWarning(ce);
      result.setSucceed(false);
      log.exiting(getClass().getName(), "convert");
      return result;
    }
    if (sourceFile.isDirectory())
      sourceFile = new File(sourceFile, "content.html");

    // Step 2. process the html with different processor.
    IProcessor processor = getProcessor(parameters);
    OutputStream out = null;

    
   


    try
    {
      Document htmlDoc = processor.preProcess(sourceFile, targetFolder, parameters);
      Tidy tidy = JTidyUtil.getTidy();
      out = new BufferedOutputStream(new FileOutputStream(sourceFile));
      tidy.pprint(htmlDoc, out);
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, e.getMessage(), e);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
    finally
    {
      try
      {
        if (out != null)
        {
          out.close();
        }
      }
      catch (IOException e)
      {
        log.log(Level.SEVERE, e.getMessage(), e);
      }
    }
    // Step 3. render document.
    InputStream in = null;      

    out = null;
    try
    {
      String pdfPath = targetFolder.getPath() + File.separator + "content.pdf";
      File convertedFile = new File(pdfPath);
      out = new BufferedOutputStream(new FileOutputStream(convertedFile));
      in = new BufferedInputStream(new FileInputStream(sourceFile));
      String cssStr = processor.getUserStyle(parameters);
      renderDocument(sourceFile.getPath(), new InputSource(in), out, cssStr);
      result.setConvertedFile(convertedFile);
    }
    catch (Exception e)
    {
      //log.severe(e.getMessage());
      log.log(Level.SEVERE, e.getMessage(), e);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    finally
    {
      processor.postProcess(sourceFile, targetFolder, parameters);
      if (out != null)
      {
        try
        {
          out.close();
        }
        catch (IOException e)
        {
          log.log(Level.SEVERE, e.getMessage(), e);
        }
      }

      if (in != null)
      {
        try
        {
          in.close();
        }
        catch (IOException e)
        {
          log.log(Level.SEVERE, e.getMessage(), e);
        }
      }
    }
    log.exiting(getClass().getName(), "convert");
    return result;
  }
  /*
  private JSONObject getPDFPrintOption(String filePath)
  {
    JSONObject option = null;
    try
    {
      InputStream is = new FileInputStream(new File(filePath));
      option = JSONObject.parse(is);
      is.close();
    }
    catch (FileNotFoundException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    catch (IOException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    return option;
  }*/
  private boolean getPDFReaderLicense()
  {
    if( LICENSE_KEY != null)
      return true;
    synchronized ( this )
    {
      log.info("Enter License Key Checking. ");
      BufferedReader br = null;
      try
      {
        InputStream f = this.getClass().getResourceAsStream(LICENSE_FILE);
        if (f != null)
        {
          br = new BufferedReader(new InputStreamReader(f));
          StringBuffer sBuffer = new StringBuffer();
          String line = null;
          do
          {
            line = br.readLine();
            if (line != null)
              sBuffer.append(line);
          }
          while (line != null);
          LICENSE_KEY = sBuffer.toString();
          log.info("License Key Correct! ");
          return true;
        }
      }
      catch (IOException e)
      {
        log.log(Level.SEVERE, e.getMessage(), e);
      }
      finally
      {
        try
        {
          if (br != null)
          {
            br.close();
          }
        }
        catch (IOException e)
        {
          log.log(Level.SEVERE, e.getMessage(), e);
        }
      }
      log.info("License Key Error! ");
      return false;
    }
  }

  private void renderDocument(String baseURL, InputSource is, OutputStream os, String cssStr) throws Exception
  {
    log.info("Start PDFreactor RenderDocument ! ");
    PDFreactor pdfReactor = new PDFreactor();
    if (LICENSE_KEY != null)
    {
      pdfReactor.setLicenseKey(LICENSE_KEY);
    }
    pdfReactor.setDocumentType(PDFreactor.DOCTYPE_XHTML);
    if (cssStr != null && cssStr.length() > 0)
    {
      Reader css = new StringReader(cssStr);
      org.w3c.css.sac.InputSource userStyle = new org.w3c.css.sac.InputSource(css);
      try
      {
        pdfReactor.addUserStyleSheet(userStyle);
      }
      catch (IOException e)
      {
        e.printStackTrace();
        log.severe("Encounter error while PDFreactor adds user style!");
      }
    }
    String url = new File(baseURL).toURI().toString();
    pdfReactor.setBaseURL(url);
    try
    {
      pdfReactor.renderDocument(is, os);
    }
    catch (Exception e)
    {
      throw e;
    }
    log.info("End PDFreactor RenderDocument ! ");
  }

}
