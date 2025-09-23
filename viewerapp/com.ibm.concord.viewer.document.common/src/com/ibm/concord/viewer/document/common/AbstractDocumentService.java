/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.document.common;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.conversion.ConversionComponentImpl;
import com.ibm.concord.viewer.platform.conversion.IConversionService;
import com.ibm.concord.viewer.platform.conversion.StellentOption;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.concord.viewer.spi.job.IConversionJob;
import com.ibm.json.java.JSONObject;

public abstract class AbstractDocumentService implements IDocumentService
{
  private static final Logger LOG = Logger.getLogger(AbstractDocumentService.class.getName());

  private static final String CLASS_NAME = AbstractDocumentService.class.getName();

  public static IConversionService conversionService;

  private static Map<String, String> stellentOptionsSheet = new HashMap<String, String>();

  private static Map<String, String> stellentOptionsText = new HashMap<String, String>();

  private static Map<String, String> stellentOptionsPres = new HashMap<String, String>();

  private static Map<String, String> stellentOptions = new HashMap<String, String>();

  private JSONObject config = new JSONObject();

  static
  {
    JSONObject conversionConfig = Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getConfig();
    conversionService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
        IConversionService.class);

    JSONObject stellentConfig = (JSONObject) conversionConfig.get("conversionService");
    initStellentOptions(stellentConfig, "stellent", stellentOptions);
    initStellentOptions(stellentConfig, "sheet_stellent", stellentOptionsSheet);
    initStellentOptions(stellentConfig, "text_stellent", stellentOptionsText);
    initStellentOptions(stellentConfig, "pres_stellent", stellentOptionsPres);
  }

  public void forwardViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    String userAgent = request.getHeader("User-Agent").toLowerCase();
    LOG.log(Level.FINER, userAgent);
    if (userAgent.contains("ipad"))
      LOG.info("IPAD");
    else if (userAgent.contains("iphone"))
      LOG.info("IPHONE");
    else if (userAgent.contains("android") && userAgent.contains("mobile"))
      LOG.info("ANDROID PHONE");
    else if (userAgent.contains("android"))
      LOG.info("ANDROID PAD");
    else
      LOG.log(Level.FINER, "DESKTOP BROWSER");
    request.getRequestDispatcher("/WEB-INF/pages/view.jsp").forward(request, response);
  }

  private static void initStellentOptions(JSONObject config, String configKey, Map<String, String> options)
  {
    JSONObject conf = (JSONObject) config.get(configKey);
    for (StellentOption opt : StellentOption.values())
    {
      String value = (String) conf.get(opt.getName());
      if (value != null)
      {
        options.put(opt.getName(), value);
      }
      else
      {
        LOG.log(Level.FINE, "Fail to read stellent option for " + configKey + " setting, will use the same option on conversion server: "
            + opt.getName());
      }
    }
  }

  public void init(JSONObject config)
  {
    this.config = config;
  }

  public void localize(File contentDir)
  {
    ;
  }

  protected boolean containsConcordFolder(File odfFile) throws IOException
  {
    ZipInputStream zis = null;
    try
    {
      FileInputStream fis = new FileInputStream(odfFile);
      zis = new ZipInputStream(fis);
      ZipEntry entry = zis.getNextEntry();
      while ((entry = zis.getNextEntry()) != null)
      {
        if (entry.isDirectory() && entry.getName().startsWith("concord"))
        {
          return true;
        }
      }
    }
    finally
    {
      zis.close();
    }
    return false;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.document.services.IDocumentService#importDocument(com.ibm.concord.viewer.spi.beans.UserBean,
   * com.ibm.concord.viewer.spi.beans.IDocumentEntry)
   */
  public IDocumentEntry importDocument(UserBean caller, String userAgent, String mode, IDocumentEntry entry, IConversionJob job)
      throws Exception
  {
    LOG.entering(CLASS_NAME, "importDocument", new Object[] { entry.getDocUri() });
    DocumentServiceHelper documentServiceHelper = new DocumentServiceHelper(caller, userAgent, mode, entry, conversionService,
        this.getTargetMimeType(), job);
//    documentServiceHelper.setUserAgent(userAgent);
//    documentServiceHelper.setMode(mode);
    documentServiceHelper.exec();
    LOG.exiting(CLASS_NAME, "importDocument", new Object[] { entry.getDocUri() });
    return entry;
  }

  public JSONObject getConfigs()
  {
    return config;
  }

  protected abstract String getMimeType();

  protected abstract String getTargetMimeType();

  protected abstract String getExtension();

  public static Map<String, String> getStellentOptions(String mimeType)
  {
    String type = DocumentTypeUtils.getStellentType(mimeType);
    if (type == null)
    {
      return stellentOptions;
    }
    else if (type.equals(DocumentTypeUtils.PRESENTATION))
    {
      return stellentOptionsPres;
    }
    else if (type.equals(DocumentTypeUtils.SPREADSHEET))
    {
      return stellentOptionsSheet;
    }
    else if (type.equals(DocumentTypeUtils.TEXT))
    {
      return stellentOptionsText;
    }
    else
    {
      return stellentOptions;
    }
  }
}
