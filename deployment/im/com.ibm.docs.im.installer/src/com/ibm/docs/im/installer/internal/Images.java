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

import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.jface.resource.ImageRegistry;
import org.eclipse.swt.graphics.Image;

import com.ibm.docs.im.installer.DocsPlugin;

public final class Images
{
  public static final String IMG_LOADING = "loading"; //$NON-NLS-1$

  /**
   * Return the Image for the specified key from the image registry for this plugin
   * 
   * @param key
   * @return
   */
  public static Image getImage(String key)
  {
    ImageRegistry registry = DocsPlugin.getDefault().getImageRegistry();

    // Load Image Descriptor if needed
    ImageHelper.getImageDescriptor(DocsPlugin.getPluginID(), registry, key);
    Image image = registry.get(key);

    return image;
  }

  /**
   * Return the Image descriptor for the specified key from the image registry for this plugin. Creates desriptor from existing file in
   * <code>/images</code> directory of plugin if descriptor does not exist
   * 
   * @param key
   * @return
   */
  public static ImageDescriptor getImageDescriptor(String key)
  {
    // Retrieve the Image Registry for this plugin
    ImageRegistry registry = DocsPlugin.getDefault().getImageRegistry();

    // Get image descriptor from plugin
    return ImageHelper.getImageDescriptor(DocsPlugin.getPluginID(), registry, key);
  }
}
