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

import java.util.logging.Logger;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.IUpgradeConvertor;


public abstract class AbstractHtmlUpgradeConvertor implements IUpgradeConvertor
{
  Logger log = Logger.getLogger(AbstractHtmlUpgradeConvertor.class.getName());

  public final void doUpgrade(ConversionContext context, Object element, Object parent, String conversionVersion)
  {
    doPredecessorUpgrade(context, element, parent, conversionVersion);
    // Do general specific upgrade stuff below
    doCurrentUpgrade(context, element, parent, conversionVersion);
  }

  /**
   * doPredecssorUpgrade gets the predecessors upgrade convertor and performs the upgrade on the predecessor release
   * @param context - the current conversion context.
   * @param element - the existing office:presentation OdfElement (if any).  May be null if the draft has never been published prior to upgrade. 
   * @param parent - the html content Dom.
   * @param sourceConversionVersion - this is the source conversionVersion, ie the release that this file was saved.
   */
  private void doPredecessorUpgrade(ConversionContext context, Object element, Object parent, String sourceConversionVersion)
  {
    // TODO: Once the source conversion version is available, we need to stop the predecessor upgrades once
    // the "source" conversionVersion is reached.
    IUpgradeConvertor pred = getPredecessorUpgradeConvertor();
    if (pred != null && isConversionNeeded(sourceConversionVersion))
      pred.doUpgrade(context, element, parent, sourceConversionVersion);
  }
 
  /**
   * getPredecessorUpgradeConvertor must be implemented by classes that extend this class.
   * @return the "upgrade convertor" for the previous version.
   */
  abstract protected IUpgradeConvertor getPredecessorUpgradeConvertor();

  /**
   * doCurrentUpgrade must be implemented by classes that extend this class.
   * It will do the upgrades necessary for that current release.
   * @param context - the current conversion context.
   * @param element - the existing office:presentation OdfElement (if any).  May be null if the draft has never been published prior to upgrade. 
   * @param parent - the html content Dom.
   * @param conversionVersion - this is the source conversionVersion, ie the release that this file was saved.
   */
  abstract protected void doCurrentUpgrade(ConversionContext context, Object element, Object parent, String conversionVersion);
  
  /**
   * @return the version supported by this convertor
   */
  abstract protected String getSupportedVersion();

  private boolean isConversionNeeded(String sourceConversionVersion)
  {
    String currentVersion = getSupportedVersion();
    if (currentVersion.compareTo(sourceConversionVersion) > 0) 
      return true;
    return false;
  }
}
