package com.ibm.docs.viewer.automation.util;

import java.io.UnsupportedEncodingException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class EncodingHelper
{
  private static final Logger logger = Logger.getLogger(EncodingHelper.class.getName());

  public static String encodeHeader(String header)
  {
    String encodedHeader = header;
    try
    {
      StringBuffer buf = new StringBuffer(header.length() * 2);
      buf.append("=?UTF-8?Q?");
      byte[] bytes = header.getBytes("UTF-8");
      int len = bytes.length;
      int i = 0;
      while (i < len)
      {
        buf.append('=');
        int nByte = bytes[i];
        if (nByte < 0)
        {
          nByte += 256;
        }
        buf.append(Integer.toHexString(nByte));
        i++;
      }
      buf.append("?="); //$NON-NLS-1$
      encodedHeader = buf.toString();
    }
    catch (UnsupportedEncodingException e)
    {
      logger.log(Level.WARNING, "Failed to encode.", e.getMessage());
    }
    return encodedHeader;
  }

}
