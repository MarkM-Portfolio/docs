/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.sym.impl;

import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.StringTokenizer;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.sym.util.Job;
import com.ibm.symphony.conversion.converter.sym.util.SymphonyCallback;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.exception.OutOfCapacityException;
import com.sun.star.awt.AsyncCallback;
import com.sun.star.awt.Size;
import com.sun.star.awt.XRequestCallback;
import com.sun.star.beans.PropertyValue;
import com.sun.star.beans.PropertyVetoException;
import com.sun.star.beans.UnknownPropertyException;
import com.sun.star.beans.XPropertySet;
import com.sun.star.bridge.XUnoUrlResolver;
import com.sun.star.container.NoSuchElementException;
import com.sun.star.container.XNameAccess;
import com.sun.star.container.XNameContainer;
import com.sun.star.document.MacroExecMode;
import com.sun.star.document.XExporter;
import com.sun.star.document.XFilter;
import com.sun.star.drawing.XDrawPage;
import com.sun.star.drawing.XDrawPages;
import com.sun.star.drawing.XDrawPagesSupplier;
import com.sun.star.frame.XComponentLoader;
import com.sun.star.frame.XStorable;
import com.sun.star.io.IOException;
import com.sun.star.lang.IllegalArgumentException;
import com.sun.star.lang.WrappedTargetException;
import com.sun.star.lang.XComponent;
import com.sun.star.lang.XMultiComponentFactory;
import com.sun.star.lang.XMultiServiceFactory;
import com.sun.star.lang.XServiceInfo;
import com.sun.star.style.XStyle;
import com.sun.star.style.XStyleFamiliesSupplier;
import com.sun.star.uno.Exception;
import com.sun.star.uno.UnoRuntime;
import com.sun.star.uno.XComponentContext;
import com.sun.star.util.CloseVetoException;
import com.sun.star.util.XCloseable;

public class SymFileConvert
{
  private static final Logger LOG = Logger.getLogger(SymFileConvert.class.getName());

  public static final String PDF = "PDF";

  public static final String HTML = "HTML";

  public static final String XHTML = "XHTML";

  public static final String JPEG = "JPEG";

  public static final String ODT = "ODT";

  public static final String PATH = "PATH";

  public static final String FILE_PWD_PARA_NAME = "filePassword";

  private String deletePath;

  private XComponentContext xRemoteContext = null;

  private XMultiComponentFactory xRemoteServiceManager = null;

  private String connectionStr;

  public SymFileConvert(String strCon)
  {
    this.connectionStr = strCon;
  }

  private XMultiServiceFactory getServiceFactory() throws java.lang.Exception
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("entering XMultiServiceFactory.getServiceFactory()");
    }

    XMultiServiceFactory xMSF = null;
    try
    {
      XMultiComponentFactory xOfficeMultiComponentFactory = xRemoteServiceManager;

      // Retrieve the component context
      // Query on the XPropertySet interface.
      XPropertySet xProperySet = (XPropertySet) UnoRuntime.queryInterface(XPropertySet.class, xOfficeMultiComponentFactory);

      // Get the default context from the editor service.
      Object oDefaultContext = null;

      try
      {
        oDefaultContext = xProperySet.getPropertyValue("DefaultContext");
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "getServiceFactory()", e);
      }

      if (oDefaultContext == null)
        return null;

      XComponentContext context = (XComponentContext) UnoRuntime.queryInterface(XComponentContext.class, oDefaultContext);
      xMSF = (XMultiServiceFactory) UnoRuntime.queryInterface(XMultiServiceFactory.class, context.getServiceManager());
    }
    catch (java.lang.Exception e)
    {
      LOG.log(Level.WARNING, "getServiceFactory()", e);
    }

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("exiting XMultiServiceFactory.getServiceFactory()");
    }

    return xMSF;
  }

  private XMultiComponentFactory getRemoteServiceManager(String unoUrl) throws java.lang.Exception
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("entering: unoUrl=" + unoUrl);
    }

    if (xRemoteContext == null)
    {
      XComponentContext xLocalContext = com.sun.star.comp.helper.Bootstrap.createInitialComponentContext(null);
      XMultiComponentFactory xLocalServiceManager = xLocalContext.getServiceManager();
      Object urlResolver = xLocalServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver", xLocalContext);

      // query XUnoUrlResolver interface from urlResolver object
      XUnoUrlResolver xUnoUrlResolver = (XUnoUrlResolver) UnoRuntime.queryInterface(XUnoUrlResolver.class, urlResolver);
      Object initialObject = null;
      initialObject = xUnoUrlResolver.resolve(unoUrl);
      XPropertySet xPropertySet = (XPropertySet) UnoRuntime.queryInterface(XPropertySet.class, initialObject);
      Object context = xPropertySet.getPropertyValue("DefaultContext");
      xRemoteContext = (XComponentContext) UnoRuntime.queryInterface(XComponentContext.class, context);
    }

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("exiting: unoUrl=" + unoUrl);
    }

    return xRemoteContext.getServiceManager();
  }

  /**
   * 
   * Open the htmlfile
   * 
   * 
   * 
   * @param fileName
   * 
   * @return
   * 
   * @throws java.lang.Exception
   */

  private XComponent openHTMLFile(String fileName) throws java.lang.Exception
  {
    xRemoteServiceManager = this.getRemoteServiceManager(connectionStr);
    Object desktop = xRemoteServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", xRemoteContext);
    XComponentLoader xComponentLoader = (XComponentLoader) UnoRuntime.queryInterface(XComponentLoader.class, desktop);

    PropertyValue[] loadProps = new PropertyValue[2];
    loadProps[0] = new PropertyValue();
    loadProps[0].Name = "Hidden";
    loadProps[0].Value = Boolean.TRUE;
    loadProps[1] = new PropertyValue();
    loadProps[1].Name = "FilterName";
    loadProps[1].Value = "HTML (StarWriter)";// "writer_web_HTML_help";

    XComponent xDocumentComponent = xComponentLoader.loadComponentFromURL("file:///" + fileName, "_blank", 0, loadProps);

    return xDocumentComponent;
  }

  /**
   * 
   * Open the file
   * 
   * @param fileName
   * 
   * @return
   * 
   * @throws java.lang.Exception
   */

  private XComponent openFile(String fileName, String password, boolean isDocx) throws java.lang.Exception
  {
    return openFile(fileName, password, isDocx, null);
  }
  
  private XComponent openFile(String fileName, String password, boolean isDocx, HashMap<String, String> options) throws java.lang.Exception
  {
    xRemoteServiceManager = this.getRemoteServiceManager(connectionStr);
    Object desktop = xRemoteServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", xRemoteContext);
    XComponentLoader xComponentLoader = (XComponentLoader) UnoRuntime.queryInterface(XComponentLoader.class, desktop);

    PropertyValue[] loadProps = null;

    if (isDocx)
    {
      loadProps = new PropertyValue[6];
      loadProps[0] = new PropertyValue();
      loadProps[0].Name = "Hidden";
      loadProps[0].Value = Boolean.TRUE;
      loadProps[1] = new PropertyValue();
      loadProps[1].Name = "FilterName";
      loadProps[1].Value = "MS Word 2007 XML";
      loadProps[2] = new PropertyValue();
      loadProps[2].Name = "ReadOnly";
      loadProps[2].Value = true;
      loadProps[3] = new PropertyValue();
      loadProps[3].Name = "MacroExecutionMode";
      loadProps[3].Value = MacroExecMode.NEVER_EXECUTE;
      loadProps[4] = new PropertyValue();
      loadProps[4].Name = "Password";
      loadProps[4].Value = password;
      loadProps[5] = new PropertyValue();
      loadProps[5].Name = "LimitationCheckLevel";
      short limitationCheckLevel = 1;
      loadProps[5].Value = limitationCheckLevel;
    }
    else
    {
      loadProps = new PropertyValue[6];
      loadProps[0] = new PropertyValue();
      loadProps[0].Name = "Hidden";
      loadProps[0].Value = Boolean.TRUE;
      loadProps[1] = new PropertyValue();
      loadProps[1].Name = "ReadOnly";
      loadProps[1].Value = true;
      loadProps[2] = new PropertyValue();
      loadProps[2].Name = "AsyncMode";
      loadProps[2].Value = false;
      loadProps[3] = new PropertyValue();
      loadProps[3].Name = "MacroExecutionMode";
      loadProps[3].Value = MacroExecMode.NEVER_EXECUTE;
      loadProps[4] = new PropertyValue();
      loadProps[4].Name = "Password";
      loadProps[4].Value = password;
      loadProps[5] = new PropertyValue();
      loadProps[5].Name = "LimitationCheckLevel";
      short limitationCheckLevel = 1;
      // do not need to do limitation check for the file which is exported by IBM docs
      if(options != null)
      {
        if(options.containsKey("isPublished") && Boolean.valueOf(options.get("isPublished").toString()) == true)
        {
          limitationCheckLevel = 0;
        }
      }
      loadProps[5].Value = limitationCheckLevel;
    }

    XComponent xDocumentComponent = null;
    try
    {
      String docUrl;
      if(fileName.startsWith("//")){//relative path with UNC pattern, e.g. \\9.181.137.167\shared
        docUrl = "file:" + fileName;
      }
      else
      {
        docUrl = "file:///" + fileName;
      }
      LOG.info("LoadDocument URL:"+ docUrl);
      xDocumentComponent = xComponentLoader.loadComponentFromURL(docUrl, "_blank", 0, loadProps);
    }
    catch (com.sun.star.task.ErrorCodeIOException errIO)
    {
      int errCode = errIO.ErrCode;

      if (errCode == 19211 || errCode == 68367 || errCode == 68368 || errCode == 68369)
      {
        LOG.warning("Password Protected document " + fileName);
      }
      else
      {
        LOG.severe("Fail to open document " + fileName + " by Symphony: " + errIO);
      }
      throw errIO;
    }

    return xDocumentComponent;
  }

  /**
   * 
   * Close the file
   * 
   * 
   * 
   * @param sourceFile
   * 
   * @param destFile
   */

  private void closeFile(XComponent xComponent)
  {
    XCloseable xCloseable = (XCloseable) UnoRuntime.queryInterface(XCloseable.class, xComponent);
    if (xCloseable != null)
    {
      try
      {
        xCloseable.close(false);
        xCloseable = null;
      }
      catch (CloseVetoException e)
      {
        xComponent.dispose();
        xComponent = null;
        LOG.log(Level.WARNING, "exception in closeFile:", e);
      }
    }
    else
    {
      xComponent.dispose();
      xComponent = null;
    }
  }

  private void saveFile(String sourceFile, String destFile, XComponent xComponent, PropertyValue[] lProperties) throws IOException
  {
    XStorable xStore = (XStorable) UnoRuntime.queryInterface(XStorable.class, xComponent);
  
    String destURL = destFile;
    if (destURL.startsWith("//"))//the path is the UNC pattern like \\9.123.154.22\sharedData
    {
      destURL = "file:" + destURL;
    }
    else//the path is local file path like C:\sharedData
    {
      destURL = "file:///" + destURL;

    }
    LOG.info("Save file, destURL: " + destURL);
    xStore.storeAsURL(destURL, lProperties);
    LOG.info("source=" + sourceFile + ", dest=" + destFile);
  }

  /**
   * 
   * convert the source format file to the PDF format file
   * 
   * @param sourceFile
   * 
   * @param destFile
   * @throws java.lang.Exception
   */

  private void exportToPDF(final String sourceFile, final String destFile, final String password, final boolean isDocx,
      final HashMap<String, String> options) throws java.lang.Exception
  {
    Job job = new Job()
    {
      public Object run() throws java.lang.Exception, IllegalArgumentException
      {
        XComponent xComponent = openFile(sourceFile, password, isDocx);
        String filter = "writer_pdf_Export";
        XServiceInfo xInfo = (XServiceInfo) UnoRuntime.queryInterface(XServiceInfo.class, xComponent);
        if (xInfo != null)
        {
          if (xInfo.supportsService("com.sun.star.text.TextDocument"))
          {
            filter = "writer_pdf_Export";
            
            if (options != null)
              modifySpreadsheetOrDocument(xComponent, options, filter);
          }
          else if (xInfo.supportsService("com.sun.star.sheet.SpreadsheetDocument"))
          {
            filter = "calc_pdf_Export";
            
            if (options != null)
              modifySpreadsheetOrDocument(xComponent, options, filter);
          }
          else if (xInfo.supportsService("com.sun.star.presentation.PresentationDocument"))
          {
            filter = "impress_pdf_Export";
            
            if (options != null)
              modifyPresentation(xComponent, options);
          }
        }

        XMultiServiceFactory xSMGR = getServiceFactory();
        XNameAccess xFilterContainer = (XNameAccess) UnoRuntime.queryInterface(XNameAccess.class,
            xSMGR.createInstance("com.sun.star.document.FilterFactory"));
        if (xFilterContainer.hasByName(filter) == false)
        {
          filter = null;
        }

        // Use this filter for export.
        if (filter != null)
        {
          PropertyValue[] lProperties = new PropertyValue[3];
          lProperties[0] = new PropertyValue();
          lProperties[0].Name = "FilterName";
          lProperties[0].Value = filter;
          lProperties[1] = new PropertyValue();
          lProperties[1].Name = "CompressionMode";
          lProperties[1].Value = "1";
          lProperties[2] = new PropertyValue();
          lProperties[2].Name = "FilterData";
          PropertyValue[] filterData = new PropertyValue[1];
          filterData[0] = new PropertyValue();
          filterData[0].Name = "UseTaggedPDF";
          filterData[0].Value = Boolean.valueOf(getFirstValue(options,"UseTaggedPDF"));
          lProperties[2].Value = filterData;
          
          XStorable xStore = (XStorable) UnoRuntime.queryInterface(XStorable.class, xComponent);
          String destURL = destFile;

          if (destURL.startsWith("//"))//UNC path like \\9.181.21.33\folder
          {
            xStore.storeToURL("File:" + destURL, lProperties);
          }
          else
          {
            xStore.storeToURL("File:///" + destURL, lProperties);
          }
          LOG.info("source=" + sourceFile + ", dest=" + destFile);
        }
        else
        {
          LOG.warning("unsupported filter: " + filter);
        }

        // close file
        closeFile(xComponent);

        return new Object();
      }
    };
    runWithOOMainThread(job);

  }

  /**
   * 
   * convert the source format file to the HTML format file
   * 
   * 
   * 
   * @param sourceFile
   * 
   * @param destFile
   * @throws java.lang.Exception
   */

  private void exportToHtml(String sourceFile, String destFile, String password, boolean isDocx) throws java.lang.Exception
  {
    XComponent xComponent = openFile(sourceFile, password, isDocx);
    String filter = HTML;

    // Check for existing state of this filter.
    if (filter != null)
    {
      XMultiServiceFactory xSMGR = getServiceFactory();
      XNameAccess xFilterContainer = (XNameAccess) UnoRuntime.queryInterface(XNameAccess.class,
          xSMGR.createInstance("com.sun.star.document.FilterFactory"));

      if (xFilterContainer.hasByName(filter) == false)
        filter = null;
    }
    XServiceInfo xInfo = (XServiceInfo) UnoRuntime.queryInterface(XServiceInfo.class, xComponent);
    if (xInfo != null)
    {
      if (xInfo.supportsService("com.sun.star.text.TextDocument"))
      {
        filter = "HTML (StarWriter)";
      }
      else if (xInfo.supportsService("com.sun.star.text.WebDocument"))
      {
        filter = "HTML";
      }
      else if (xInfo.supportsService("com.sun.star.sheet.SpreadsheetDocument"))
      {
        filter = "HTML (StarCalc)";
      }
    }

    // Use this filter for export.
    if (filter != null)
    {
      PropertyValue[] lProperties = null;
      lProperties = new PropertyValue[2];
      lProperties[0] = new PropertyValue();
      lProperties[0].Name = "FilterName";
      lProperties[0].Value = filter;
      lProperties[1] = new PropertyValue();
      lProperties[1].Name = "Overwrite";
      lProperties[1].Value = Boolean.TRUE;

      saveFile(sourceFile, destFile, xComponent, lProperties);
    }
    else
    {
      LOG.warning("unsupported filter: " + filter);
    }

    // close file
    closeFile(xComponent);
  }

  private void exportHtmlToPDF(String sourceFile, String destFile, HashMap<String, String> options) throws java.lang.Exception
  {
    XComponent xComponent = openHTMLFile(sourceFile);

    // ModifyDocument(xComponent, options);
    String filter = "writer_pdf_Export";// "writer_web_pdf_Export";

    // Check for existing state of this filter.
    if (filter != null)
    {
      XMultiServiceFactory xSMGR = getServiceFactory();
      XNameAccess xFilterContainer = (XNameAccess) UnoRuntime.queryInterface(XNameAccess.class,
          xSMGR.createInstance("com.sun.star.document.FilterFactory"));
      if (xFilterContainer.hasByName(filter) == false)
        filter = null;
    }

    // Use this filter for export.
    if (filter != null)
    {
      PropertyValue[] filterProps = new PropertyValue[2];
      filterProps[0] = new PropertyValue();
      filterProps[0].Name = "CompressMode";
      filterProps[0].Value = "1";
      filterProps[1] = new PropertyValue();
      filterProps[1].Name = "PageRange";
      filterProps[1].Value = "1-";

      PropertyValue[] propertyvalue = new PropertyValue[3];
      propertyvalue[0] = new PropertyValue();
      propertyvalue[0].Name = "Overwrite";
      propertyvalue[0].Value = Boolean.valueOf(true);
      propertyvalue[1] = new PropertyValue();
      propertyvalue[1].Name = "FilterName";
      propertyvalue[1].Value = "writer_pdf_Export";// "writer_web_pdf_Export"// ;
      propertyvalue[2] = new PropertyValue();
      propertyvalue[2].Name = "FilterData";
      propertyvalue[2].Value = filterProps;

      XStorable xStore = (XStorable) UnoRuntime.queryInterface(XStorable.class, xComponent);
      String destURL = destFile;// .replaceFirst("\\.[^.]+$",// ".html");

      xStore.storeToURL("file:///" + destURL, propertyvalue);
      LOG.info("Export pdf from " + sourceFile + " to " + destFile);
    }
    else
    {
      LOG.warning("unsupported filter: " + filter);
    }

    // close file
    closeFile(xComponent);
  }

  /**
   * 
   * convert the source format file to the HTML format file
   * 
   * @param sourceFile
   * 
   * @param destFile
   * @throws java.lang.Exception
   */

  private void exportHtmlToODF(String sourceFile, String destFile, String password) throws java.lang.Exception
  {
    XComponent xComponent = openFile(sourceFile, password, false);
    String filter = "writer_web_StarOffice_XML_Writer";

    // Check for existing state of this filter.
    if (filter != null)
    {
      XMultiServiceFactory xSMGR = getServiceFactory();
      XNameAccess xFilterContainer = (XNameAccess) UnoRuntime.queryInterface(XNameAccess.class,
          xSMGR.createInstance("com.sun.star.document.FilterFactory"));

      if (xFilterContainer.hasByName(filter) == false)
        filter = null;
    }

    // Use this filter for export.
    if (filter != null)
    {
      PropertyValue[] lProperties = new PropertyValue[2];
      lProperties[0] = new PropertyValue();
      lProperties[0].Name = "FilterName";
      lProperties[0].Value = filter;
      lProperties[1] = new PropertyValue();
      lProperties[1].Name = "Overwrite";
      lProperties[1].Value = Boolean.TRUE;

      XStorable xStore = (XStorable) UnoRuntime.queryInterface(XStorable.class, xComponent);
      String destURL = destFile;// .replaceFirst("\\.[^.]+$", // ".html");

      System.out.println("Export " + destURL + " start.");

      if (destURL.startsWith("/"))
      {
        xStore.storeToURL("File://" + destURL, lProperties);
      }
      else
      {
        xStore.storeToURL("File:///" + destURL, lProperties);
      }

      LOG.info("source=" + sourceFile + ", dest=" + destFile);
    }
    else
    {
      LOG.warning("unsupported filter: " + filter);
    }

    // close file
    closeFile(xComponent);
  }

  /**
   * 
   * convert the source format file to the JPEG format file
   * 
   * @param sourceFile
   * 
   * @param destFile
   * @throws java.lang.Exception
   */

  protected void exportToJPEG(String sourceFile, String destFile, String password, boolean isDocx) throws java.lang.Exception
  {
    XComponent xComponent = openFile(sourceFile, password, isDocx);
    destFile = "File:///" + destFile;
    XServiceInfo xInfo = (XServiceInfo) UnoRuntime.queryInterface(XServiceInfo.class, xComponent);

    if (xInfo != null)
    {
      if (!xInfo.supportsService("com.sun.star.presentation.PresentationDocument"))
      {
        throw new RuntimeException("unsupported file type. Only presentation can be export to jpg.");
      }
    }

    XMultiServiceFactory xServiceFactory = getServiceFactory();
    Object GraphicExportFilter = xServiceFactory.createInstance("com.sun.star.drawing.GraphicExportFilter");
    XExporter xExporter = (XExporter) UnoRuntime.queryInterface(XExporter.class, GraphicExportFilter);

    PropertyValue aProps[] = new PropertyValue[2];
    aProps[0] = new PropertyValue();
    aProps[0].Name = "MediaType";
    aProps[0].Value = "image/jpeg";

    /**
     * 
     * some graphics e.g. the Windows Metafile does not have a Media Type, for this case*aProps[0].Name = "FilterName"; it ispossible to
     * 
     * set a FilterName aProps[0].Value ="WMF";
     */

    int pageNum = getDrawPageCount(xComponent);
    String destBase = destFile.substring(0, destFile.lastIndexOf('.'));
    for (int i = 0; i < pageNum; i++)
    {
      String filePath = destBase + "Slide_" + (i + 1) + ".jpg";
      aProps[1] = new PropertyValue();
      aProps[1].Name = "URL";
      aProps[1].Value = filePath;

      XDrawPage xPage = getDrawPageByIndex(xComponent, i);
      XComponent xComp = (XComponent) UnoRuntime.queryInterface(XComponent.class, xPage);
      xExporter.setSourceDocument(xComp);

      XFilter xFilter = (XFilter) UnoRuntime.queryInterface(XFilter.class, xExporter);
      xFilter.filter(aProps);
    }
    LOG.info("source=" + sourceFile + ", dest=" + destFile);

    // close file
    closeFile(xComponent);
  }

  /*
   * 
   * convert XLS to ODS
   */

  private void exportToODS(String sourceFile, String destFile, String password, HashMap<String, String> options) throws java.lang.Exception
  {
    XComponent xComponent = openFile(sourceFile, password, false, options);
    String filter = "calc8";
    if (filter != null)
    {
      PropertyValue[] lProperties = null;
      lProperties = new PropertyValue[2];
      lProperties[0] = new PropertyValue();
      lProperties[0].Name = "FilterName";
      lProperties[0].Value = filter;
      lProperties[1] = new PropertyValue();
      lProperties[1].Name = "Overwrite";
      lProperties[1].Value = Boolean.TRUE;

      saveFile(sourceFile, destFile, xComponent, lProperties);
    }
    else
    {
      LOG.warning("unsupported filter: " + filter);
    }

    // close file
    closeFile(xComponent);
  }

  /*
   * 
   * convert PPT to ODP
   */

  private void exportToODP(final String sourceFile, final String destFile, final String password) throws java.lang.Exception
  {
    Job job = new Job()
    {
      public Object run() throws java.lang.Exception
      {
        XComponent xComponent = openFile(sourceFile, password, false);
        String filter = "impress8";
        if (filter != null)
        {
          PropertyValue[] lProperties = null;
          lProperties = new PropertyValue[2];
          lProperties[0] = new PropertyValue();
          lProperties[0].Name = "FilterName";
          lProperties[0].Value = filter;
          lProperties[1] = new PropertyValue();
          lProperties[1].Name = "Overwrite";
          lProperties[1].Value = Boolean.TRUE;
          saveFile(sourceFile, destFile, xComponent, lProperties);
        }
        else
        {
          LOG.warning("unsupported filter: " + filter);
        }

        // close file
        closeFile(xComponent);
        return new Object();
      }
    };
    runWithOOMainThread(job);
  }

  /*
   * 
   * convert DOC, DOCX to ODT
   */
  private void exportToODT(String sourceFile, String destFile, String password, boolean isDocx) throws java.lang.Exception
  {
    XComponent xComponent = openFile(sourceFile, password, isDocx);
    String filter = "writer8";
    if (filter != null)
    {
      PropertyValue[] lProperties = null;
      lProperties = new PropertyValue[2];
      lProperties[0] = new PropertyValue();
      lProperties[0].Name = "FilterName";
      lProperties[0].Value = filter;
      lProperties[1] = new PropertyValue();
      lProperties[1].Name = "Overwrite";
      lProperties[1].Value = Boolean.TRUE;
      saveFile(sourceFile, destFile, xComponent, lProperties);
    }
    else
    {
      LOG.warning("unsupported filter: " + filter);
    }

    // close file
    closeFile(xComponent);
  }

  /**
   * 
   * Convert the source ods format file to xls format file. Only support exporting to Microsoft Excel 97/2000/XP
   * 
   * 
   * 
   * @param sourceFile
   * 
   * @param destFile
   * @throws java.lang.Exception
   */

  private void exportToXLS(String sourceFile, String destFile, String password) throws java.lang.Exception
  {
    XComponent xComponent = openFile(sourceFile, password, false);
    String filter = "MS Excel 97"; // calc_MS_Excel_97
    if (filter != null)
    {
      PropertyValue[] lProperties = null;
      lProperties = new PropertyValue[2];
      lProperties[0] = new PropertyValue();
      lProperties[0].Name = "FilterName";
      lProperties[0].Value = filter;
      lProperties[1] = new PropertyValue();
      lProperties[1].Name = "Overwrite";
      lProperties[1].Value = Boolean.TRUE;
      saveFile(sourceFile, destFile, xComponent, lProperties);
    }
    else
    {
      LOG.warning("unsupported filter: " + filter);
    }

    // close file
    closeFile(xComponent);
  }

  /**
   * 
   * Convert the source odt format file to doc format file. Only support exporting to Microsoft Word 97/2000/XP
   * 
   * @param sourceFile
   * 
   * @param destFile
   * @throws java.lang.Exception
   */
  private void exportToDOC(String sourceFile, String destFile, String password) throws java.lang.Exception
  {
    XComponent xComponent = openFile(sourceFile, password, false);
    String filter = "MS Word 97"; // calc_MS_Word_97
    if (filter != null)
    {
      PropertyValue[] lProperties = null;
      lProperties = new PropertyValue[2];
      lProperties[0] = new PropertyValue();
      lProperties[0].Name = "FilterName";
      lProperties[0].Value = filter;
      lProperties[1] = new PropertyValue();
      lProperties[1].Name = "Overwrite";
      lProperties[1].Value = Boolean.TRUE;

      saveFile(sourceFile, destFile, xComponent, lProperties);
    }
    else
    {
      LOG.warning("unsupported filter: " + filter);
    }

    // close file
    closeFile(xComponent);
  }

  /**
   * 
   * Convert the source odp format file to ppt format file. Only support exporting to Microsoft PowerPoint 97/2000/XP
   * 
   * @param sourceFile
   * 
   * @param destFile
   * @throws java.lang.Exception
   */
  private void exportToPPT(String sourceFile, String destFile, String password) throws java.lang.Exception
  {
    XComponent xComponent = openFile(sourceFile, password, false);
    String filter = "MS PowerPoint 97"; // calc_MS_PowerPoint_97
    if (filter != null)
    {
      PropertyValue[] lProperties = null;
      lProperties = new PropertyValue[2];
      lProperties[0] = new PropertyValue();
      lProperties[0].Name = "FilterName";
      lProperties[0].Value = filter;
      lProperties[1] = new PropertyValue();
      lProperties[1].Name = "Overwrite";
      lProperties[1].Value = Boolean.TRUE;
      saveFile(sourceFile, destFile, xComponent, lProperties);
    }
    else
    {
      LOG.warning("unsupported filter: " + filter);
    }

    // close file
    closeFile(xComponent);
  }

  public static XDrawPage getDrawPageByIndex(XComponent xComponent, int nIndex) throws com.sun.star.lang.IndexOutOfBoundsException,
      com.sun.star.lang.WrappedTargetException
  {
    XDrawPagesSupplier xDrawPagesSupplier = (XDrawPagesSupplier) UnoRuntime.queryInterface(XDrawPagesSupplier.class, xComponent);
    XDrawPages xDrawPages = xDrawPagesSupplier.getDrawPages();
    return (XDrawPage) UnoRuntime.queryInterface(XDrawPage.class, xDrawPages.getByIndex(nIndex));
  }

  private int getDrawPageCount(XComponent document)
  {
    XDrawPagesSupplier xDrawPagesSupplier = (XDrawPagesSupplier) UnoRuntime.queryInterface(XDrawPagesSupplier.class, document);
    XDrawPages xDrawPages = xDrawPagesSupplier.getDrawPages();
    return xDrawPages.getCount();
  }

  /**
   * 
   * export the converted file to user target directory
   * 
   * @param sourceFile
   * 
   * @param destDirectory
   * 
   * @param fileType
   */
  public String convert(String sourceFile, String targetDir, String sourceType, String targetType, HashMap<String, String> options)
      throws java.lang.Exception
  {
    // check for source file
    boolean isDocx = false;

    if (sourceType.equalsIgnoreCase("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
      isDocx = true;

    File f = new File(sourceFile);
    
    if (!f.isFile() || !f.exists())
    { 
      throw new IllegalArgumentException("Source file does not exist."); 
    }
    

    String fileName;
    fileName = f.getName();
    try
    {
      if (fileName.lastIndexOf('.') > 0)
      {
        fileName = fileName.substring(0, fileName.lastIndexOf('.'));
      }
    }
    catch (java.lang.StringIndexOutOfBoundsException e)
    {
      throw new IllegalArgumentException("Source File does not have extension!");
    }

    // check for target directory
    if (targetDir.lastIndexOf('\\') == targetDir.length() - 1)
      targetDir = targetDir.substring(0, targetDir.length() - 1);

    File dir = new File(targetDir);
    if (!dir.isDirectory())
    {
      boolean state = dir.mkdirs();
      if (!state)
        throw new IllegalArgumentException("destDirectory File illegal.");
    }

    sourceFile = sourceFile.replaceAll("\\\\", "/");
    targetDir = targetDir.replaceAll("\\\\", "/");

    // check for password
    String password = null;
    if (options != null)
      password = getFirstValue(options, FILE_PWD_PARA_NAME);

    if (password == null)
      password = "";

    // begin covert

    String targetFilePath = targetDir + "/" + fileName;
    String ext = null;

    if (targetType.equalsIgnoreCase("application/pdf"))
    {
      ext = "pdf";
      if (sourceType.equalsIgnoreCase("text/html"))
      {
        exportHtmlToPDF(sourceFile, targetFilePath + ".pdf", options);
      }
      else
      {
        exportToPDF(sourceFile, targetFilePath + ".pdf", password, isDocx, options);
      }
    }
    else if (targetType.equalsIgnoreCase("text/html"))
    {
      ext = "html";
      exportToHtml(sourceFile, targetFilePath + ".html", password, isDocx);
      // check if the file size is out of capacity
      FileInputStream is = new FileInputStream(new File(targetFilePath + ".html"));
      if (is.available() > 1024 * 1024)// more than 1M
      {
        is.close();
        throw new OutOfCapacityException("Failed to support file with big size");
      }
      is.close();
    }
    else if (targetType.equalsIgnoreCase("image/jpeg"))
    {
      ext = "jpg";
      deletePath = targetFilePath;
      File file = new File(deletePath);
      file.mkdirs();

      exportToJPEG(sourceFile, targetFilePath + ".jpg", password, isDocx);

    }
    else if (targetType.equalsIgnoreCase("application/vnd.oasis.opendocument.text"))
    {
      ext = "odt";
      if (sourceType.equalsIgnoreCase("text/html"))
      {
        exportHtmlToODF(sourceFile, targetFilePath + ".odt", password);
      }
      else
      {
        // convert doc/docx to odt
        exportToODT(sourceFile, targetFilePath + ".odt", password, isDocx);
      }
    }
    else if (targetType.equalsIgnoreCase("application/vnd.ms-excel"))
    {
      if (sourceType.equalsIgnoreCase("application/vnd.oasis.opendocument.spreadsheet") 
          || sourceType.equalsIgnoreCase("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
          || sourceType.equalsIgnoreCase("application/vnd.oasis.opendocument.spreadsheet-template"))
      {
        ext = "xls";
        exportToXLS(sourceFile, targetFilePath + ".xls", password);
      }
      else
      {
        LOG.warning("Not supported export type:" + sourceType + "->" + targetType);
        throw new IllegalArgumentException("not supported export type.");
      }
    }
    else if (targetType.equalsIgnoreCase("application/vnd.oasis.opendocument.spreadsheet"))
    {
      if (sourceType.equalsIgnoreCase("application/vnd.ms-excel")
          || sourceType.equalsIgnoreCase("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
      {
        ext = "ods";
        exportToODS(sourceFile, targetFilePath + ".ods", password, options);
      }
      else
      {
        LOG.warning("Not supported export type:" + sourceType + "->" + targetType);
        throw new IllegalArgumentException("not supported export type.");
      }
    }
    else if (targetType.equalsIgnoreCase("application/vnd.oasis.opendocument.presentation"))
    {
      // convert ppt/pptx to odp
      if (sourceType.equalsIgnoreCase("application/vnd.ms-powerpoint")
          || sourceType.equalsIgnoreCase("application/vnd.openxmlformats-officedocument.presentationml.presentation"))
      {
        ext = "odp";
        exportToODP(sourceFile, targetFilePath + ".odp", password);
      }
      else
      {
        LOG.warning("Not supported export type:" + sourceType + "->" + targetType);
        throw new IllegalArgumentException("not supported export type.");
      }
    }
    else if (targetType.equalsIgnoreCase("application/msword"))
    {
      if (sourceType.equalsIgnoreCase("application/vnd.oasis.opendocument.text") 
          || sourceType.equalsIgnoreCase("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
          || sourceType.equalsIgnoreCase("application/vnd.oasis.opendocument.text-template"))
      {
        ext = "doc";
        exportToDOC(sourceFile, targetFilePath + ".doc", password);
      }
      else
      {
        LOG.warning("Not supported export type:" + sourceType + "->" + targetType);
        throw new IllegalArgumentException("not supported export type.");
      }
    }
    else if (targetType.equalsIgnoreCase("application/vnd.ms-powerpoint"))
    {
      if (sourceType.equalsIgnoreCase("application/vnd.oasis.opendocument.presentation") 
          || sourceType.equalsIgnoreCase("application/vnd.oasis.opendocument.presentation-template"))
      {
        ext = "ppt";
        exportToPPT(sourceFile, targetFilePath + ".ppt", password);
      }
      else
      {
        LOG.warning("Not supported export type:" + sourceType + "->" + targetType);
        throw new IllegalArgumentException("not supported export type.");
      }
    }
    else
    {
      LOG.warning("Not supported export type:" + sourceType + "->" + targetType);
      throw new IllegalArgumentException("not supported export type.");
    }

    return targetFilePath + "." + ext;
  }

  private String getFirstValue(HashMap<String, String> options, String key)
  {
    String value = null;
    if (options != null && options.containsKey(key) && options.get(key) != null)
    {
      StringTokenizer st = new StringTokenizer(options.get(key), ";");
      List<String> values = new ArrayList<String>();
      while (st.hasMoreTokens())
      {
        values.add(st.nextToken());
      }
      if(!values.isEmpty()) {
        value = values.get(0);        
      }      
    }
    return value;
  }

  private void setBooleanValue(XPropertySet xpro, String name, HashMap<String, String> options, String key)
      throws UnknownPropertyException, PropertyVetoException, IllegalArgumentException, WrappedTargetException
  {
    String value = getFirstValue(options, key);
    try
    {
      if (value != null)
      {
        xpro.setPropertyValue(name, Boolean.valueOf(value));
      }
    }
    catch(NumberFormatException e)
    {
      LOG.warning("Export to pdf, the value of parameter "+key+" is "+value+", it is not boolean.");
    }
  }

  private void setIntValue(XPropertySet xpro, String name, HashMap<String, String> options, String key) throws UnknownPropertyException,
      PropertyVetoException, IllegalArgumentException, WrappedTargetException
  {
    String value = getFirstValue(options, key);
    try
    {
      if (value != null)
      {
        xpro.setPropertyValue(name, Integer.valueOf(value));
      }
    }
    catch(NumberFormatException e)
    {
      LOG.warning("Export to pdf, the value of parameter "+key+" is "+value+", it is not Integer.");
    }
  }

  private void modifySpreadsheetOrDocument(XComponent xCom, HashMap<String, String> options, String filter) throws NoSuchElementException, WrappedTargetException,
      UnknownPropertyException, PropertyVetoException, IllegalArgumentException
  {
    XStyleFamiliesSupplier xFamiliesSupplier = (XStyleFamiliesSupplier) UnoRuntime.queryInterface(XStyleFamiliesSupplier.class, xCom);
    XNameAccess xFamiliesNA = xFamiliesSupplier.getStyleFamilies();
    Object pageStyles = xFamiliesNA.getByName("PageStyles");
    XNameContainer xPageStylesNA = (XNameContainer) UnoRuntime.queryInterface(XNameContainer.class, pageStyles);
    String[] allPageStyles = xPageStylesNA.getElementNames();
    for(String styleName : allPageStyles)
    {
      Object tempStyle = xPageStylesNA.getByName(styleName);

      XStyle xStyle = (XStyle) UnoRuntime.queryInterface(XStyle.class, tempStyle);
      XPropertySet xpro = (XPropertySet) UnoRuntime.queryInterface(XPropertySet.class, xStyle);

      String height = getFirstValue(options, "height");
      String width = getFirstValue(options, "width");
      if (height != null && width != null)
      {
        Size tem = new Size();
        try
        {
          tem.Height = Integer.valueOf(height);
          tem.Width = Integer.valueOf(width);
        }
        catch(NumberFormatException e)
        {
          LOG.warning("Export to pdf, the value of height and width are not Integer.");
        }
        xpro.setPropertyValue("Size", tem);
      }

      setBooleanValue(xpro, "FooterIsOn", options, "footer");
      setBooleanValue(xpro, "HeaderIsOn", options, "header");
      setIntValue(xpro, "FooterHeight", options, "FH");
      setIntValue(xpro, "HeaderHeight", options, "HH");
      setIntValue(xpro, "RightMargin", options, "right");
      setIntValue(xpro, "LeftMargin", options, "left");
      setIntValue(xpro, "BottomMargin", options, "bottom");
      setIntValue(xpro, "TopMargin", options, "top");  
      if("calc_pdf_Export".equals(filter))
      {
        setBooleanValue(xpro, "PrintGrid", options, "gridline");
        setBooleanValue(xpro, "PrintDownFirst", options, "page");
      }
    }
  }
  
  private void modifyPresentation(XComponent xCom, HashMap<String, String> options)throws Exception
  {
    XDrawPagesSupplier xDrawPagesSupplier = (XDrawPagesSupplier)UnoRuntime.queryInterface(XDrawPagesSupplier.class, xCom);
    XDrawPages xDrawPages = xDrawPagesSupplier.getDrawPages();
    int pageCount = xDrawPages.getCount();
    
    if(pageCount > 0)
    {
      XDrawPage xDrawPage = (XDrawPage)UnoRuntime.queryInterface(XDrawPage.class, xDrawPages.getByIndex(0));
      XPropertySet xpro = (XPropertySet) UnoRuntime.queryInterface(XPropertySet.class, xDrawPage);
      setIntValue(xpro, "Height", options, "height");
      setIntValue(xpro, "Width", options, "width");
      setIntValue(xpro, "BorderRight", options, "right");
      setIntValue(xpro, "BorderLeft", options, "left");
      setIntValue(xpro, "BorderBottom", options, "bottom");
      setIntValue(xpro, "BorderTop", options, "top");
    }
  }

  public Object runWithOOMainThread(Job job) throws java.lang.Exception
  {

    xRemoteServiceManager = getRemoteServiceManager(connectionStr);
    XRequestCallback xRequestCallback = (XRequestCallback) AsyncCallback.create(xRemoteContext);
    SymphonyCallback callback = new SymphonyCallback(job);
    try
    {
      xRequestCallback.addCallback(callback, null);
    }
    catch (java.lang.Exception e)
    {
      //do nothing, will throw the exception below
    }
    synchronized (job)
    {
      job.wait(120000);
    }

    if (callback.getException() != null)
    {
      throw callback.getException();
    }
    else
    {
      Object result = callback.getResult();
      if (result == null)
      {
        LOG.log(Level.WARNING,"This might be because Symphony conversion job wait timeout.");
        throw new RuntimeException(ConversionConstants.ERROR_SYM_JOB_OVERTIME);
      }
      return callback.getResult();
    }
  }
}
