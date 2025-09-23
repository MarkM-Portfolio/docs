package com.ibm.symphony.conversion.converter.ods2json.sax.context;

import java.io.File;
import java.io.InputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.Future;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.ContextInfo;
import com.ibm.symphony.conversion.converter.ods2json.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.IFormatConverter;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.impl.ConversionService;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.JSONModel;
import com.ibm.symphony.conversion.spreadsheet.index.IndexUtil;

public class DrawImageContext extends GeneralContext
{
  private static final Logger LOG = Logger.getLogger(DrawImageContext.class.getName());
  public static Set<String> formatsCvt = new HashSet<String>();

  static Map<String, String> formatMimeTypeMap = new HashMap<String, String>();
  static
  {

    formatMimeTypeMap.put("wmf", "application/x-msmetafile");
    formatMimeTypeMap.put("emf", "application/x-msmetafile");
    formatMimeTypeMap.put("svm", "image/svm");

    formatsCvt.addAll(formatMimeTypeMap.keySet());
  }

  static final int NO_CONVERT = 0;

  static final int CONVERT = 1;

  static final int CONVERT_FAILED = 2;

  private int processFormatConvert(ConversionContext context, final String extName)
  {
    if (formatsCvt.contains(extName))
    {
      // needs to convert
      return CONVERT;
    }
    else
    {
      if (ConvertUtil.noCvtFormats.contains(extName))
      {
        return NO_CONVERT;
      }
      else
      {
        return CONVERT_FAILED;
      }
    }
  }

  private static class ConvertResult
  {
    boolean createPlaceHolder;

    String msg;

    ConvertResult(boolean createPlaceHolder, String msg)
    {
      this.createPlaceHolder = createPlaceHolder;
      this.msg = msg;
    }
  }

  private void submitConversionTask(final ConversionContext context, final String fileFullName, final int width, final int height)
  {
    final File file = new File(fileFullName);
    String fileName = file.getName();
    int dotIndex = fileName.lastIndexOf(".");

    final String fileNewName = fileName.substring(0, dotIndex) + ".png";
    final String extName = fileFullName.substring(fileFullName.lastIndexOf(".") + 1).toLowerCase();

    final Future<?> future = context.getTask(fileFullName);

    if (future == null)
    {
      Callable<ConvertResult> task = new Callable<ConvertResult>()
      {
        public ConvertResult call()
        {
          boolean createPlaceHolder = false;
          String msg = null;
          final Map<String, Object> param = new HashMap<String, Object>();
          param.put("width", width);
          param.put("height", height);
          param.put("targetName", fileNewName);

          ConversionResult rst = null;
          try
          {
            IConversionService conversionService = ConversionService.getInstance();
            IFormatConverter convertor = conversionService.getConverter(formatMimeTypeMap.get(extName), ConversionConstants.PNG_MIMETYPE);
            File subFile = new File(file.getParentFile().getAbsolutePath() + File.separator + extName);
            if (!subFile.exists())
              subFile.mkdir();
            rst = convertor.convert(file, subFile, param);
            LOG.info("Is image converted succed? " + rst.isSucceed());
            createPlaceHolder = !rst.isSucceed();
          }
          catch (Throwable th)
          {
            LOG.log(Level.INFO, th.getMessage(), th);
            createPlaceHolder = true;
          }
          finally
          {
            file.delete();
          }

          if (createPlaceHolder)
          {
            if ("wmf".equals(extName))
              msg = "Unsupported content: emf";
            else
              msg = "Unsupported content";

          }

          return new ConvertResult(createPlaceHolder, msg);
        }
      };

      context.addTask(fileFullName, task);
    }
    else
    {
      ConvertResult rst;
      try
      {
        rst = (ConvertResult) future.get();
      }
      catch (Exception e)
      {
        LOG.log(Level.INFO, e.getMessage(), e);
        rst = new ConvertResult(true, "Unsupported content");
      }
    }
  }
  
  public DrawImageContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
  }
  
  private void convertChartAsImage(String href, ConversionUtil.Document document)
  {
    Set<String> chartNames = (Set<String>)mContext.get("ChartNames");
    int sublen = ConversionConstant.DIR_OBJ_PREFIX.length();
    String fileName = href.substring(sublen+1);
    if(!chartNames.contains(fileName))
      return;
    
    try
    {
      //check the image format. If not png, return.
      OdfDocument odf = (OdfDocument) mContext.get("Source");
      OdfPackage odfPackage = odf.getPackage();
      InputStream in = odfPackage.getInputStream(href);
      if(in==null)
          return;
      byte[] aCode = new byte[4];
      in.read(aCode);
      in.close();
      String aCodeStr = new String(aCode,1,3);
      if (!"PNG".equalsIgnoreCase(aCodeStr))
      {
        return;
      }
      ODSConvertUtil.copyImageToDraftFolder(mContext, href);
      
      DrawFrameContext pContext = (DrawFrameContext)this.getParentConvertor();
      ConversionUtil.DrawFrameRange frameRange = pContext.getFrameRange();
      frameRange.rangeId = fileName;
      frameRange.usage = ConversionUtil.RangeType.CHART_AS_IMAGE;
      frameRange.href = "Pictures/object/" + fileName + ".png";
      document.unnameList.add(frameRange);
      
      pContext.addIdOnOdfElement(frameRange.rangeId);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "chart as image converted failed", e);
    }
  }

  public void startElement(AttributesImpl attrs)
  {
    super.startElement(attrs);
    ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
    ContextInfo info = (ContextInfo) mContext.get("TableInfo");
    try
    {
      String href = this.getAttrValue(ConversionConstant.ODF_ATTR_XLINK_HREF);
      boolean bObject = href.startsWith(ConversionConstant.DIR_OBJ_PREFIX);
      if(bObject)
      {
        //convertChartAsImage(href,document);
        return;
      }
      
      boolean bImage = href.startsWith(ConversionConstant.DIR_PIC_PREFIX);
      if(!bImage)
        return;
     
      int sublen = ConversionConstant.DIR_PIC_PREFIX.length();
      String fileName = href.substring(sublen+1);
      
      DrawFrameContext pContext = (DrawFrameContext)this.getParentConvertor();
      ConversionUtil.DrawFrameRange nameCellRange = pContext.getFrameRange();
      pContext.setNeedAddId(true);
      String cellRangeName = document.createId("image");
      nameCellRange.rangeId = ConversionUtil.hasValue(cellRangeName) ? cellRangeName : ("NameId" + info.nameRangeIndex);
      
	  pContext.addIdOnOdfElement(nameCellRange.rangeId);
      ODSConvertUtil.copyImageToDraftFolder(mContext, href);
      
      String fileFullName = mContext.get("TargetFolder") + File.separator + ConversionConstant.DIR_PIC_PREFIX + File.separator + fileName;
      String extName = fileFullName.substring(fileFullName.lastIndexOf(".") + 1).toLowerCase();
      int rst = processFormatConvert(mContext, extName);
            
      if (rst == CONVERT)
      {
        int dotIndex = fileName.lastIndexOf(".");
        String fileNewName = fileName.substring(0, dotIndex) + ".png";
        String path = "Pictures/" + extName + "/" + fileNewName;
        nameCellRange.href = path;
        String w = pContext.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_SVG_WIDTH);
        String h = pContext.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_SVG_HEIGHT);
        int width = Length.parseInt(w,Unit.POINT);
        int height = Length.parseInt(h,Unit.POINT);
        submitConversionTask(mContext,fileFullName,width,height);
      }
      else
    	nameCellRange.href = href;  
      
      JSONModel model = (JSONModel) pContext.getParentConvertor().getTarget();
      if(model instanceof Cell)
      {
        Map<String,Boolean> cellImageMap = (Map<String,Boolean>) mContext.get("cellImageMap");
        String cellId = IndexUtil.generateCellId(nameCellRange.startRowId, nameCellRange.startColId);
        cellImageMap.put(cellId, true);
      }
      nameCellRange.usage = ConversionUtil.RangeType.IMAGE;
      
      document.unnameList.add(nameCellRange);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "cell name range is invalid", e);
    }
    
  }
}
