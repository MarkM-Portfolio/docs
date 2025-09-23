/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.template;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.ODPMetaFile;

public class ConvertTemplateUtil
{
  private static final String CLASS = ConvertTemplateUtil.class.toString();

  // private static final Logger log = Logger.getLogger(ConvertTemplateUtil.class.getName());

  private static Map<String, TemplateBean> templateMap = new ConcurrentHashMap<String, TemplateBean>();

  static
  {
    loadTemplate();
  }

  @SuppressWarnings("unchecked")
  private static void loadTemplate()
  {
    InputStream input = null;
    try
    {
      input = ConvertTemplateUtil.class.getResourceAsStream(ODPConvertConstants.FILE_TEMPLATE_LIST);

      JSONObject list = JSONObject.parse(input);
      Set<String> set = list.keySet();
      for (String item : set)
      {
        JSONObject subList = (JSONObject) list.get(item);
        String titleImg = (String) subList.get(ODPConvertConstants.TITLE);
        String pageImg = (String) subList.get(ODPConvertConstants.PAGE);
        String textName = (String) subList.get(ODPConvertConstants.TEXT_NAME);
        loadTemplateResource(item, textName, titleImg, pageImg);
      }
    }
    catch (IOException e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".loadTemplate");
      ODPCommonUtil.logException(Level.SEVERE, message, e);
    }
    finally
    {
      ODPMetaFile.closeResource(input);
    }
  }

  private static void loadTemplateResource(String name, String textName, String img1, String img2)
  {
    String filename = null;
    InputStream in = null;
    byte[] out;
    TemplateBean bean = new TemplateBean();

    // title img
    filename = name + ODPConvertConstants.FILE_RESOURCE_SEPARATOR + img1;
    in = ConvertTemplateUtil.class.getResourceAsStream(filename);
    out = getByteByInputStream(in, filename);
    bean.setTitleImgStream(out);
    bean.setTitleImgName(img1);
    bean.setTitleStyleName(name);

    // page img
    filename = name + ODPConvertConstants.FILE_RESOURCE_SEPARATOR + img2;
    in = ConvertTemplateUtil.class.getResourceAsStream(filename);
    out = getByteByInputStream(in, filename);
    bean.setPageImgStream(out);
    bean.setPageImgName(img2);
    bean.setPageStyleName(textName);

    // styles.xml
    filename = name + ODPConvertConstants.FILE_RESOURCE_SEPARATOR + ODPConvertConstants.FILE_STYLES_XML;
    in = ConvertTemplateUtil.class.getResourceAsStream(filename);
    out = getByteByInputStream(in, filename);
    bean.setStyleXml(out);
    templateMap.put(name, bean);
    templateMap.put(textName, bean);
  }

  private static byte[] getByteByInputStream(InputStream in, String filename)
  {
    int read = 0;
    int chunk = 0;
    byte[] data = new byte[1024];
    ByteArrayOutputStream _copy = new ByteArrayOutputStream(1024); // 1024?the default is 32
    try
    {
      while (-1 != (chunk = in.read(data)))
      {
        read += data.length;
        _copy.write(data, 0, chunk);
      }
      _copy.flush();
      _copy.close();
      in.close();
    }
    catch (Throwable e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ERROR_OPENING_FILE, filename);
      ODPCommonUtil.logMessage(Level.WARNING, message);
    }
    finally
    {
      ODPMetaFile.closeResource(in);
    }

    return _copy.toByteArray();
  }

  // public static void main(String args[])
  // {
  // System.out.println(int.class.getCanonicalName());
  // }

  public static TemplateBean getTemplate(String key)
  {
    if (key == null || key.length() == 0 || key.equals(ODPConvertConstants.DEFAULT_TEMPLATE))
      return null;
    // key=key.toLowerCase();
    return templateMap.get(key);
  }
}
