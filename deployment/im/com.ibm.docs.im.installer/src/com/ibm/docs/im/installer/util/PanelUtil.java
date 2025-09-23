/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.util;

import org.eclipse.jface.resource.FontRegistry;
import org.eclipse.swt.SWT;
import org.eclipse.swt.accessibility.ACC;
import org.eclipse.swt.accessibility.Accessible;
import org.eclipse.swt.events.DisposeEvent;
import org.eclipse.swt.events.DisposeListener;
import org.eclipse.swt.graphics.Font;
import org.eclipse.swt.graphics.FontData;
import org.eclipse.swt.graphics.ImageData;
import org.eclipse.swt.graphics.ImageLoader;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Label;
import org.eclipse.ui.forms.widgets.FormToolkit;

import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.internal.DynamicImageViewer;
import com.ibm.docs.im.installer.internal.ImageHelper;
import com.ibm.docs.im.installer.internal.Images;

public class PanelUtil
{

  private static FontRegistry fontRegistry;

  private PanelUtil()
  {

  }

  public static Label createBoldLabel(Composite parent, FormToolkit toolkit, String message)
  {
    Label _boldLabel = toolkit.createLabel(parent, message);
    FontData[] fD1 = _boldLabel.getFont().getFontData();
    fD1[0].setStyle(SWT.BOLD);
    final Font boldFont1 = new Font(_boldLabel.getDisplay(), fD1[0]);
    _boldLabel.setFont(boldFont1);
    _boldLabel.setLayoutData(new GridData(SWT.FILL, SWT.BEGINNING, true, false));
    _boldLabel.addDisposeListener(new DisposeListener()
    {
      public void widgetDisposed(DisposeEvent e)
      {
        boldFont1.dispose();
      }
    });
    return _boldLabel;
  }

  /**
   * To create a composed label, which is bold style label plus plain style label
   * 
   * @param parent
   * @param toolkit
   * @param boldStr
   *          value of bold string
   * @param plainStr
   *          value of plain string
   */
  public static void createComposedLabel(Composite parent, FormToolkit toolkit, String boldStr, String plainStr)
  {
    Label label = PanelUtil.createBoldLabel(parent, toolkit, boldStr);
    GridData gd = new GridData(SWT.FILL, SWT.FILL, false, false, 1, 1);
    label.setLayoutData(gd);
    setFont(label, -1);
    label = toolkit.createLabel(parent, plainStr, SWT.WRAP);
    // Must create a new instance of GridData
    gd = new GridData(SWT.FILL, SWT.FILL, false, false, 1, 1);
    label.setLayoutData(gd);
    setFont(label, -1);
  }

  /**
   * parseInt without exception.
   * 
   * @param s
   * @return
   */
  public static int parseInt(String s)
  {
    if (s == null)
    {
      return Constants.ILLEGAL_VALUE;
    }
    try
    {
      return Integer.parseInt(s);
    }
    catch (NumberFormatException nfe)
    {
      return Constants.ILLEGAL_VALUE;
    }
  }

  public static DynamicImageViewer createLoadingImg(Composite composite)
  {
    DynamicImageViewer canvas = new DynamicImageViewer(composite, composite.getBackground());
    GridData imageData = new GridData(GridData.BEGINNING, GridData.BEGINNING, false, false, 1, 1);
    imageData.verticalIndent = 4;
    canvas.setLayoutData(imageData);
    String path = ImageHelper.getImagePath(Images.IMG_LOADING);
    if (path != null)
    {
      ImageLoader loader = new ImageLoader();
      ImageData[] imageDatas = loader.load(path);
      canvas.setImages(imageDatas, loader.repeatCount);
      canvas.pack();
    }
    return canvas;
  }

  public static void setFontBold(Label label)
  {
    FontData fontData = label.getFont().getFontData()[0];
    final Font font = new Font(label.getDisplay(), new FontData(fontData.getName(), fontData.getHeight(), SWT.BOLD));
    label.setFont(font);
    label.addDisposeListener(new DisposeListener()
    {
      @Override
      public void widgetDisposed(DisposeEvent arg0)
      {
        font.dispose();
      }
    });
  }

  /**
   * To set label's font size
   * 
   * @param aabel
   * @param fontSize
   */
  public static void setFont(Label label, int fontHeight)
  {
    Font initialFont = label.getFont();
    FontData[] fontData = initialFont.getFontData();
    for (int i = 0; i < fontData.length; i++)
    {
      fontData[i].setHeight(fontData[i].getHeight() + fontHeight);
    }
    final Font newFont = new Font(label.getDisplay(), fontData);
    label.setFont(newFont);
    label.addDisposeListener(new DisposeListener()
    {
      @Override
      public void widgetDisposed(DisposeEvent arg0)
      {
        newFont.dispose();
      }
    });
  }

  public static void setCourierNewFont(Label label, int fontHeight)
  {
    Font initialFont = label.getFont();
    FontData[] fontData = initialFont.getFontData();
    int fHeight = fontData[0].getHeight() + fontHeight;
    if (fontRegistry == null)
    {
      fontRegistry = new FontRegistry(label.getDisplay());
      fontRegistry.put("example", new FontData[] { new FontData("Courier New", fHeight, SWT.NORMAL) });
      // Other styles
    }
    label.setFont(fontRegistry.get("example"));
  }

  /**
   * Register relationship for screen readers
   * 
   * @param label
   *          , the label for the control
   * @param control
   *          , the control labeled by
   */
  public static void registerAccRelation(Label label, Control control)
  {
    Accessible accLabel = label.getAccessible();
    Accessible accText = control.getAccessible();
    accLabel.addRelation(ACC.RELATION_LABEL_FOR, accText);
    accText.addRelation(ACC.RELATION_LABELLED_BY, accLabel);
  }
}
