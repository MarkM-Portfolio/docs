/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.config;

import java.util.logging.Logger;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ThumbnailConfig
{
  public static enum ThumbnailRequestType {
    UPLOAD_NEW_DOCUMENT, VIEW_DOCUMENT, GENERATE_THUMBNAILS
  }

  public static int SMALLWIDTH = 100;

  public static int MEDIUMWIDTH = 250;

  public static int LARGEWIDTH = 500;

  public static int SMALLHEIGHT = 75;

  public static int MEDIUMHEIGHT = 188;

  public static int LARGEHEIGHT = 375;

  public static final String SMALL_THUMBNAIL_WIDTH_KEY = "smallthumbnailwidth";

  public static final String SMALL_THUMBNAIL_HEIGHT_KEY = "smallthumbnailheight";

  public static final String MEDIUM_THUMBNAIL_WIDTH_KEY = "mediumthumbnailwidth";

  public static final String MEDIUM_THUMBNAIL_HEIGHT_KEY = "mediumthumbnailheight";

  public static final String LARGE_THUMBNAIL_WIDTH_KEY = "largethumbnailwidth";

  public static final String LARGE_THUMBNAIL_HEIGHT_KEY = "largethumbnailheight";

  public static final String THUMBNAILS_JOB_KEY = "thumbnailservicejob";

  public static final String THUMBNAILS_CROPIMAGE_KEY = "cropimage";

  private static final Logger logger = Logger.getLogger(ThumbnailConfig.class.getName());

  static
  {
    JSONObject thumbnailsConfig = ViewerConfig.getInstance().getSubConfig("thumbnails");
    JSONArray array = (JSONArray) thumbnailsConfig.get("size");
    for (int i = 0; i < array.size(); i++)
    {
      JSONObject obj = (JSONObject) array.get(i);
      String type = (String) obj.get("type");
      String w = (String) obj.get("width");
      String h = (String) obj.get("height");
      if (type.endsWith("small"))
      {

        if (w != null)
        {
          SMALLWIDTH = Integer.parseInt(w);
          logger.fine("Using passed small thumbnail width: " + w);
        }
        else
        {
          logger.fine("Using default small thumbnail width: " + SMALLWIDTH);
        }

        if (h != null)
        {
          SMALLHEIGHT = Integer.parseInt(h);
          logger.fine("Using passed small thumbnail height: " + h);
        }
        else
        {
          logger.fine("Using default small thumbnail height: " + SMALLHEIGHT);
        }
      }
      else if (type.endsWith("medium"))
      {
        if (w != null)
        {
          MEDIUMWIDTH = Integer.parseInt(w);
          logger.fine("Using passed medium thumbnail width: " + w);
        }
        else
        {
          logger.fine("Using default medium thumbnail width: " + MEDIUMWIDTH);
        }

        if (h != null)
        {
          MEDIUMHEIGHT = Integer.parseInt(h);
          logger.fine("Using passed medium thumbnail height: " + h);
        }
        else
        {
          logger.fine("Using default medium thumbnail height: " + MEDIUMHEIGHT);
        }
      }
      else if (type.endsWith("large"))
      {
        if (w != null)
        {
          LARGEWIDTH = Integer.parseInt(w);
          logger.fine("Using passed large thumbnail width: " + w);
        }
        else
        {
          logger.fine("Using default large thumbnail width: " + LARGEWIDTH);
        }

        if (h != null)
        {
          LARGEHEIGHT = Integer.parseInt(h);
          logger.fine("Using passed large thumbnail height: " + h);
        }
        else
        {
          logger.fine("Using default large thumbnail height: " + LARGEHEIGHT);
        }
      }
    }
  }

}
