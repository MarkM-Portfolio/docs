/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.conversion;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ConversionService {

  private static final String CONVERSION_SERVICE = "conversionService";
  private static final String CONVERSION_CONVERTER = "converter";

  private static IConversionService conversionService;

  public static IConversionService getConversionService(JSONObject config){
    if (conversionService == null)
      conversionService = ConversionService.createConversionService(config);
    return conversionService;
  }
  
  private static IConversionService createConversionService(JSONObject config){

    JSONArray converters = (JSONArray) config.get(CONVERSION_CONVERTER );
    if (converters != null && converters.size()>0)
      return new LocalConversionService(converters);

    JSONObject conversionService = (JSONObject) config.get(CONVERSION_SERVICE);
    if (conversionService != null)
      return new RemoteConversionService(conversionService);
    
    return null;
  }
}
