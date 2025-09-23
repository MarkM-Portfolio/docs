/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.rendition;
import com.ibm.json.java.JSONObject;


/**
 * @author niebomin
 * 
 * Represents images converted by Stellent
 */
public interface IRendition
{
  /**
   * @return the width of the image
   */
  public int getWidth();
  
  /**
   * @return the height of the image
   */
  public int getHeigth();
  
  /**
   * @return the JSON object that includes the size information
   */
  public JSONObject toJson();
}
