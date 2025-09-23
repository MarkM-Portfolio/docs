/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversionResult;

import java.io.File;
import java.util.ArrayList;
import java.util.HashSet;

public class ConversionResult
{

  // warning feature ids
  private HashSet<String> featureIds;

  // conversion warnings
  private ArrayList<ConversionWarning> warnings;

  // converted file
  private File convertedFile;

  // converted file path
  private String convertedFilePath;

  // converted file mimetype
  private String mimeType;

  // if converted successfully
  private boolean isSucceed;

  public ConversionResult()
  {
    this.warnings = new ArrayList<ConversionWarning>();
    this.featureIds = new HashSet<String>();
    this.isSucceed = true;
  }

  /**
   * 
   * @param w
   */
  public void addWarning(ConversionWarning w)
  {
    if (!featureIds.contains(w.getFetureID()))
    {
      this.warnings.add(w);
      featureIds.add(w.getFetureID());
    }
  }

  /**
   * @param featureId the error code, represent an error or a feature for unsupported feature warning
   * @return has the warning or not given the feature id
   */
  public boolean hasWarning(String featureId)
  {
    return featureIds.contains(featureId);
  }
  
  /**
   * @return the warnings
   */
  public ArrayList<ConversionWarning> getWarnings()
  {
    return warnings;
  }

  /**
   * @param warnings
   *          the warnings to set
   */
  public void setWarnings(ArrayList<ConversionWarning> warnings)
  {
    this.warnings = warnings;
  }

  /**
   * @return the convertedFile
   */
  public File getConvertedFile()
  {
    return convertedFile;
  }

  /**
   * @param convertedFile
   *          the convertedFile to set
   */
  public void setConvertedFile(File convertedFile)
  {
    this.convertedFile = convertedFile;
    if( convertedFile != null)
    {
      this.convertedFilePath = convertedFile.getPath();
    }
    else
    {
      this.convertedFilePath = null;
    }
  }

  /**
   * If there is any warning
   * 
   * @return
   */
  public boolean isWarning()
  {
    return this.warnings != null && this.warnings.size() > 0;
  }

  /**
   * If completed successfully
   * 
   * @return
   */
  public boolean isSucceed()
  {
    return isSucceed;
  }

  /**
   * @return the convertedFilePath
   */
  public String getConvertedFilePath()
  {
    return convertedFilePath;
  }

  /**
   * @param convertedFilePath
   *          the convertedFilePath to set
   */
  public void setConvertedFilePath(String convertedFilePath)
  {
    this.convertedFilePath = convertedFilePath;
    if( convertedFilePath != null )
    {
      this.convertedFile = new File(convertedFilePath);
    }
    else
    {
      this.convertedFile = null;
    }
  }

  /**
   * @return the mimeType
   */
  public String getMimeType()
  {
    return mimeType;
  }

  /**
   * @param mimeType
   *          the mimeType to set
   */
  public void setMimeType(String mimeType)
  {
    this.mimeType = mimeType;
  }

  /**
   * @param isSucceed
   *          the isSucceed to set
   */
  public void setSucceed(boolean isSucceed)
  {
    this.isSucceed = isSucceed;
  }

}
