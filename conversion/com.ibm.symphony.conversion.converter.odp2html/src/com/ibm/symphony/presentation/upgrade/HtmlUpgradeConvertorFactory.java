/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.symphony.presentation.upgrade;

import com.ibm.symphony.conversion.service.common.IUpgradeConvertor;
import com.ibm.symphony.conversion.service.common.IUpgradeConvertorFactory;

public class HtmlUpgradeConvertorFactory implements IUpgradeConvertorFactory
{
  private static HtmlUpgradeConvertorFactory instance = new HtmlUpgradeConvertorFactory();

  // IMPORTANT!!!!! MUST READ =============================================================================
  // NOTE: The GENERAL_CONVERTOR will need to be updated to the latest release.  Additionally, constants in 
  // com.ibm.symphony.conversion.service.ConversionConstants (CURRENT_CONVERTER_VERSION_PRESENTATION) and
  // com.ibm.concord.presentation.PresentationDocumentService (DRAFT_FORMAT_VERSION)
  // need to updated to the current release string.
  // ======================================================================================================
  private static final IUpgradeConvertor GENERAL_CONVERTOR = new GeneralHtmlUpgradeConvertor11();

  public static IUpgradeConvertorFactory getInstance()
  {
    return instance;
  }

  /**
   * Add other convertors here, a candidate might be a convertor to handle master styles
   * Note: input may be null if no odfdraft exists
   */
  public IUpgradeConvertor getConvertor(Object input)
  {
    IUpgradeConvertor convertor = null;
    convertor = GENERAL_CONVERTOR;
    return convertor;
  }

}
