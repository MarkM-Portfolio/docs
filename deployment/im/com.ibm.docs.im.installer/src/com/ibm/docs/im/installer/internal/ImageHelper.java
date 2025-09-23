/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.internal;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import org.eclipse.core.runtime.FileLocator;
import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.jface.resource.ImageRegistry;
import org.eclipse.ui.PlatformUI;
import org.eclipse.ui.plugin.AbstractUIPlugin;

import com.ibm.docs.im.installer.DocsPlugin;

public final class ImageHelper
{
  public static ImageDescriptor getSharedImageDescriptor(String key)
  {
    return PlatformUI.getWorkbench().getSharedImages().getImageDescriptor(key);
  }

  public static String getImagePath(String key)
  {

    StringBuffer path = new StringBuffer();
    // Create path from Key. May already contain prefix and suffix
    int index = key.lastIndexOf("/");
    if (!key.startsWith("images/"))
      path.append("images/");

    path.append(key);
    index = key.lastIndexOf(".");
    if (index < 0 && !key.endsWith(".gif"))
      path.append(".gif");

    URL url = DocsPlugin.getDefault().getBundle().getResource(path.toString());
    try
    {
      url = FileLocator.toFileURL(url);
    }
    catch (IOException e)
    {
      return null;
    }
    return url != null ? url.getPath() : null;
  }

  /**
   * Get an ImageDescriptor for the given key. If key does not contain a path separator "/" then prepend the "images/" directory. If key
   * does not contain a file extension separator (".") then append ".gif". Then look for the image.
   * 
   * @param ID
   *          plugin ID
   * @param registry
   *          image registry
   * @param key
   *          image name
   * @return
   */
  public static ImageDescriptor getImageDescriptor(String ID, ImageRegistry registry, String key)
  {
    // Fetch image descriptor from registry
    ImageDescriptor imageDescriptor = registry.getDescriptor(key);
    if (imageDescriptor != null)
      return imageDescriptor;

    StringBuffer path = new StringBuffer();

    // Create path from Key. May already contain prefix and suffix
    int index = key.lastIndexOf("/");
    if (!key.startsWith("images/"))
      path.append("images/");

    path.append(key);

    index = key.lastIndexOf(".");
    if (index < 0 && !key.endsWith(".gif"))
      path.append(".gif");

    // Load descriptor from .gif file in /images directory of plugin
    try
    {
      imageDescriptor = AbstractUIPlugin.imageDescriptorFromPlugin(ID, path.toString());
    }
    catch (RuntimeException ex)
    {
      /*
       * If this class is being used in a stand alone test harness the plugin may not be started. In this case build an image descriptor
       * with the given information.
       * 
       * TODO: Is there a better way than catching RuntimeException?
       */
      URL imageURL = null;
      String cpath = "file:" + path.toString(); //$NON-NLS-1$
      try
      {
        imageURL = new URL(cpath);
      }
      catch (MalformedURLException ex1)
      {

      }
      if (imageURL == null)
      {
        return null;
      }

      imageDescriptor = ImageDescriptor.createFromURL(imageURL);
    }

    // Use missing image icon if not found
    if (imageDescriptor == null)
      imageDescriptor = ImageDescriptor.getMissingImageDescriptor();

    // Save Descriptor in registry & return
    registry.put(key, imageDescriptor);
    return imageDescriptor;
  }

}
