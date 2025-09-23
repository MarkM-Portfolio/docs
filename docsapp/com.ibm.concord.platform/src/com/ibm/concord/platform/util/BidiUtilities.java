/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.util;

import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spi.exception.PreferenceException;
import com.ibm.concord.spi.notification.IPreference;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;

public class BidiUtilities
{
  private static final Logger LOG = Logger.getLogger(BidiUtilities.class.getName());

  private static final String LRE = "\u202a";

  private static final String RLE = "\u202b";

  private static final String PDF = "\u202c";

  private static final String LTR_DIR = "ltr";

  private static final String RTL_DIR = "rtl";

  private static final String CONTEXTUAL_DIR = "contextual";

  public static final String TEXT_DIR_PROP = "bidiTextDir";

  public static String addEmbeddingUCC(String str, String textDir)
  {
    if (CONTEXTUAL_DIR.equals(textDir))
      textDir = calculateBTDForContextual(str);
    if (LTR_DIR.equals(textDir))
      return LRE + str + PDF;
    if (RTL_DIR.equals(textDir))
      return RLE + str + PDF;
    return str;
  }

  private static String calculateBTDForContextual(String str)
  {
    if (str.trim().length() == 0)
      return LTR_DIR;
    for (int i = 0; i < str.length(); i++)
    {
      byte directionality = Character.getDirectionality(str.charAt(i));
      if (directionality == Character.DIRECTIONALITY_RIGHT_TO_LEFT || directionality == Character.DIRECTIONALITY_RIGHT_TO_LEFT_ARABIC)
      {
        return RTL_DIR;
      }
      else if (directionality == Character.DIRECTIONALITY_LEFT_TO_RIGHT)
      {
        return LTR_DIR;
      }
    }
    return null;
  }

  public static HashMap<String, String> getBidiPreferences(UserBean caller, String repoId) throws ConcordException
  {
    IComponent component = Platform.getComponent("com.ibm.concord.platform.email.notice");
    try
    {
      IPreference preference = (IPreference) component.getService(IPreference.class, repoId);
      if(preference != null)
      {
        return preference.getBidiPreferences(caller);
      }
      else
      {
        return new HashMap<String, String>();
      }
    }
    catch (PreferenceException e)
    {
      HashMap<String, String> bidiPrefs = new HashMap<String, String>();
      LOG.log(Level.INFO, "REST API call failed to retrieve Bidi preferences, default values will be set.");
      bidiPrefs.put(IPreference.bidi_isBidi, "false");
      LOG.log(Level.INFO, "Bidi preference " + IPreference.bidi_isBidi + " was set to \"false\".");
      bidiPrefs.put(IPreference.bidi_textDir, "");
      LOG.log(Level.INFO, "Bidi preference " + IPreference.bidi_textDir + " was set to \"\".");
      return bidiPrefs;      
    }
  }
}
