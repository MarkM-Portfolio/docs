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

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConvertUtil;

//===================================================================================
// WARNING: THIS WAS ORIGINALLY IN THE ODP COMMON PROJECT.  THE VERSION THAT REMAINS
// IN THAT PACKAGE NOW WIRES-THROUGH TO THIS CLASS.  IF YOU ADD METHODS HERE, YOU WILL 
// WANT A WIRE-THROUGH METHOD THERE.
//===================================================================================
@SuppressWarnings("unchecked")
public class ODPConvertMapUtil
{
  private static final String CLASS = ODPConvertMapUtil.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  public static String MAP_HTML = "Html-Map";

  public static String MAP_ODF = "ODF-Map";

  public static String MAP_ODF_ATTR = "ODF-Attr-Map";

  public static String MAP_ODF_SVG = "ODF-SVG";

  public static String MAP_NAMESPACE = "Namespace-Map";

  public static String MAP_DEFAULT_ODP_STYLES = "Default_ODP_Styles";

  public static String MAP_HTML_CLASS = "Html-Class-Map";

  public static String MAP_SUPPLIMENTS = "Common_Maps_Suppliments";
  
  public static String MAP_LOCALE_FONTNAME = "Locale-FontName";

  private static String JSON_SUFFIX = ".json";

  private static Map<String, JSONObject> _ODP_CONVERT_MAPS = null;

  static
  {
    // load the common maps.
    _ODP_CONVERT_MAPS = new HashMap<String, JSONObject>();
    JSONObject convertMap = new JSONObject();
    convertMap.putAll(ConvertUtil.getHtmlMap());
    _ODP_CONVERT_MAPS.put(MAP_HTML, convertMap);
    convertMap = new JSONObject();
    convertMap.putAll(ConvertUtil.getODFMap());
    _ODP_CONVERT_MAPS.put(MAP_ODF, convertMap);
    convertMap = new JSONObject();
    convertMap.putAll(ConvertUtil.getNamespaceMap());
    _ODP_CONVERT_MAPS.put(MAP_NAMESPACE, convertMap);

    InputStream input = null;
    try
    {
      // change the loaded common maps for presentation specific settings.
      input = ODPConvertMapUtil.class.getResourceAsStream(MAP_SUPPLIMENTS + JSON_SUFFIX);
      JSONObject suppliments = JSONObject.parse(input);
      Iterator<Entry<String, JSONObject>> iter = suppliments.entrySet().iterator();
      while (iter.hasNext())
      {
        Entry<String, JSONObject> entry = iter.next();
        JSONObject baseMap = _ODP_CONVERT_MAPS.get(entry.getKey());
        JSONObject value = entry.getValue();
        if (value != null)
        {
          baseMap.putAll(value);
        }
      }
      input.close();
      
      // load the presentation specific entry.
      input = ODPConvertMapUtil.class.getResourceAsStream(MAP_ODF_SVG + JSON_SUFFIX);
      _ODP_CONVERT_MAPS.put(MAP_ODF_SVG, JSONObject.parse(input));
      input.close();

      input = ODPConvertMapUtil.class.getResourceAsStream(MAP_HTML_CLASS + JSON_SUFFIX);
      _ODP_CONVERT_MAPS.put(MAP_HTML_CLASS, JSONObject.parse(input));
      input.close();

      input = ODPConvertMapUtil.class.getResourceAsStream(MAP_DEFAULT_ODP_STYLES + JSON_SUFFIX);
      _ODP_CONVERT_MAPS.put(MAP_DEFAULT_ODP_STYLES, JSONObject.parse(input));
      input.close();

      input = ODPConvertMapUtil.class.getResourceAsStream(MAP_ODF_ATTR + JSON_SUFFIX);
      _ODP_CONVERT_MAPS.put(MAP_ODF_ATTR, JSONObject.parse(input));
      input.close();
      
      input = ODPConvertMapUtil.class.getResourceAsStream(MAP_LOCALE_FONTNAME + JSON_SUFFIX);
      _ODP_CONVERT_MAPS.put(MAP_LOCALE_FONTNAME, JSONObject.parse(input));
      input.close();
    }
    catch (FileNotFoundException fnfException)
    {
      LOG.logp(Level.SEVERE, CLASS, "Unexpected exception in static initializer", fnfException.getLocalizedMessage(), fnfException);
    }
    catch (IOException ioException)
    {
      LOG.logp(Level.SEVERE, CLASS, "Unexpected exception in static initializer", ioException.getLocalizedMessage(), ioException);
    }
  }

  public static JSONObject getJSONMap(String key)
  {
    return _ODP_CONVERT_MAPS.get(key);
  }
}
