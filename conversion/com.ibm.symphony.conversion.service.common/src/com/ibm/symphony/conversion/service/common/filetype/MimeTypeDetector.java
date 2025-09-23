/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.filetype;

import java.util.HashMap;
import java.util.Map;

public class MimeTypeDetector
{
  public static final String MimeTypeGroup_TXT = "TXT";

  public static final String MimeTypeGroup_ODF = "ODF";

  public static final String MimeTypeGroup_OFFICE = "office";

  public static final String MimeTypeGroup_OFFICEXML = "officeXML";

  public static Map<String, String> MimeTypeGroup = new HashMap<String, String>();
  static
  {
    MimeTypeGroup.put(MimeTypeConstants.TXT_MIMETYPE, MimeTypeGroup_TXT);

    MimeTypeGroup.put(MimeTypeConstants.DOC_MIMETYPE, MimeTypeGroup_OFFICE);
    MimeTypeGroup.put(MimeTypeConstants.PPT_MIMETYPE, MimeTypeGroup_OFFICE);
    MimeTypeGroup.put(MimeTypeConstants.XLS_MIMETYPE, MimeTypeGroup_OFFICE);

    MimeTypeGroup.put(MimeTypeConstants.DOCX_MIMETYPE, MimeTypeGroup_OFFICEXML);
    MimeTypeGroup.put(MimeTypeConstants.PPTX_MIMETYPE, MimeTypeGroup_OFFICEXML);
    MimeTypeGroup.put(MimeTypeConstants.XLSX_MIMETYPE, MimeTypeGroup_OFFICEXML);
    MimeTypeGroup.put(MimeTypeConstants.DOTX_MIMETYPE, MimeTypeGroup_OFFICEXML);
    MimeTypeGroup.put(MimeTypeConstants.POTX_MIMETYPE, MimeTypeGroup_OFFICEXML);
    MimeTypeGroup.put(MimeTypeConstants.XLTX_MIMETYPE, MimeTypeGroup_OFFICEXML);
    MimeTypeGroup.put(MimeTypeConstants.XLSM_MIMETYPE, MimeTypeGroup_OFFICEXML);
    MimeTypeGroup.put(MimeTypeConstants.XLSM_12_MIMETYPE, MimeTypeGroup_OFFICEXML);

    MimeTypeGroup.put(MimeTypeConstants.ODP_MIMETYPE, MimeTypeGroup_ODF);
    MimeTypeGroup.put(MimeTypeConstants.ODS_MIMETYPE, MimeTypeGroup_ODF);
    MimeTypeGroup.put(MimeTypeConstants.ODT_MIMETYPE, MimeTypeGroup_ODF);
    MimeTypeGroup.put(MimeTypeConstants.OTP_MIMETYPE, MimeTypeGroup_ODF);
    MimeTypeGroup.put(MimeTypeConstants.OTS_MIMETYPE, MimeTypeGroup_ODF);
    MimeTypeGroup.put(MimeTypeConstants.OTT_MIMETYPE, MimeTypeGroup_ODF);
  }

  private static MimeTypeDetector instance = new MimeTypeDetector();

  public static MimeTypeDetector getInstance()
  {
    return instance;
  }

  public IMimeTypeDetector getDetector(String input)
  {
    if(input.equals(MimeTypeGroup_OFFICE))
      return new MSOfficeOLEDetector();
    else if(input.equals(MimeTypeGroup_OFFICEXML))
      return new MSOfficeOOXMLDetector();
    else if(input.equals(MimeTypeGroup_ODF))
      return new ODFDetector();
    else if(input.equals(MimeTypeGroup_TXT))
      return new TXTDetector();

    return null;  
  }
}
