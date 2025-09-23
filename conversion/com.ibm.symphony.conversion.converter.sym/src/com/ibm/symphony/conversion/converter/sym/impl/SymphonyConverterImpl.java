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

import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.sym.ISymphonyConverter;
import com.ibm.symphony.conversion.converter.sym.SymConversionResult;

public class SymphonyConverterImpl implements ISymphonyConverter
{
  private static final Logger LOG = Logger.getLogger(SymphonyConverterImpl.class.getName());
  
  private static SymphonyConverterImpl instance = new SymphonyConverterImpl();
  
  private SymphonyConverterImpl() {  
  }
  
  public static SymphonyConverterImpl getInstance() {
    return instance;
  }

  public SymConversionResult convert(String source, String sourceType, String targetType, HashMap<String, String> options) throws Exception
  {
    SymphonyConversionManager instance = SymphonyConversionManager.getInstance();
    return instance.convert(source, sourceType, targetType, options);
  }

  public SymConversionResult convert(String source, String targetFolder, String sourceType, String targetType,
      HashMap<String, String> options) throws Exception
  {
    SymphonyConversionManager instance = SymphonyConversionManager.getInstance();
    return instance.convert(source, targetFolder, sourceType, targetType, options);
  }

  public boolean hasAvailableInstance()
  {
    SymphonyConversionManager instance = SymphonyConversionManager.getInstance();
    int idleSymphonyCount = instance.getIdleSymphonyNumber();    
    LOG.log(Level.FINER, "Get Idle symphony count: " + idleSymphonyCount);
    return (idleSymphonyCount > 0);
  }

}
