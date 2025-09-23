/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.shape2image;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;

public class ODFSVGMap
{
  private static final ODFSVGMap svgMap = new ODFSVGMap();

  private JSONObject jsonObj;

  // private Map elementMap = new HashMap();
  // private Map attributeMap = new HashMap();

  private ODFSVGMap()
  {
    setup();
  }

  public static ODFSVGMap getInstance()
  {
    return svgMap;
  }

  public void setup()
  {
    jsonObj = ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF_SVG);

  }

  public String find(String key)
  {
    return (String) jsonObj.get(key);
  }

  public boolean containsKey(String key)
  {
    return jsonObj.containsKey(key);
  }
}
