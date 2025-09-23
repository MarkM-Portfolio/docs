/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ppt2pdf;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.sym.SymConversionResult;
import com.ibm.symphony.conversion.converter.sym.impl.SymphonyConverterImpl;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class PPT2PDFConverter extends AbstractFormatConverter
{
  private static String CONVERTOR = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_CONVERTOR, "PPT", "PDF");

  @SuppressWarnings("unused")
  private static Logger log = Logger.getLogger(PPT2PDFConverter.class.getName());

  private static final String PPT_MIMETYPE = "application/vnd.ms-powerpoint";

  private static final String PDF_MIMETYPE = "application/pdf";

  @SuppressWarnings({ "rawtypes", "unchecked" })
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    long start = System.currentTimeMillis();
    ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_STARTS, CONVERTOR));

    ConversionContext context = new ConversionContext();
    ConversionResult result = new ConversionResult();

    SymConversionResult symResult = null;
    try
    {
      context.put(ODPConvertConstants.CONTEXT_CONVERT_RESULT, result);

      HashMap hmParms = null;
      if (parameters == null)
      {
        hmParms = (HashMap) ConvertUtil.getDefaultPDFOptions().get("default_presentation");
      }
      else
      {
        hmParms = new HashMap(parameters);
      }

      symResult = SymphonyConverterImpl.getInstance()
          .convert(sourceFile.getPath(), targetFolder.getAbsolutePath(), PPT_MIMETYPE, PDF_MIMETYPE, hmParms);

      if (symResult.isSucceed())
      {
        result.setConvertedFilePath(symResult.getTargetFile());
      }
      else
      {
        ODPCommonUtil.addMessage(context, ODPConvertConstants.UNHANDLED_ERROR, false, "", "Failed on convert to ODP" + CONVERTOR, true);
      }
    }
    catch (Throwable t)
    {
      ODPCommonUtil.handleException(t, context, CONVERTOR);
    }

    long end = System.currentTimeMillis();
    ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ENDS, CONVERTOR, Long.toString(end - start)));

    return result;
  }

  @SuppressWarnings("rawtypes")
  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "ppt2pdf"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters);
  }

  public boolean isRunnableAvailable()
  {
    return SymphonyConverterImpl.getInstance().hasAvailableInstance();
  }

}
