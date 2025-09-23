/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of HCL                              */
/*                                                                   */
/* Copyright HCL Technologies Ltd. 2021                       		 */
/*                                                                   */
/* US Government Users Restricted Rights                             */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.libre;

import java.util.Locale;

import com.outsideinsdk.ExportStatusCode;

public abstract class ExportStatusCodeEx extends ExportStatusCode
{

  public static final ExportStatusCodeEx SCCERR_SINGPAGE_TIMEUP = new ExportStatusCodeEx(0x900)
  {

    @Override
    protected String getErrMessage()
    {
      return "Single page conversion times out";
    }

  };

  public static final ExportStatusCodeEx SCCERR_DOWNSIZE_ERROR = new ExportStatusCodeEx(0x901)
  {

    @Override
    protected String getErrMessage()
    {
      return "Downsize full image error";
    }

  };

  public ExportStatusCodeEx(int code)
  {
    super(code);
  }

  protected abstract String getErrMessage();

  @Override
  public String getCodeText()
  {
    return getErrMessage();
  }

  @Override
  public String getCodeText(Locale locale)
  {
    return getCodeText();
  }

  @Override
  public String toString()
  {
    return getCodeText();
  }
  
  
}
