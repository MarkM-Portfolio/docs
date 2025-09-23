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

import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Color;
import org.eclipse.swt.graphics.GC;
import org.eclipse.swt.graphics.Image;
import org.eclipse.swt.graphics.ImageData;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.graphics.Rectangle;
import org.eclipse.swt.widgets.Canvas;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Event;
import org.eclipse.swt.widgets.Listener;

public class DynamicImageViewer extends Canvas
{

  private Point origin = new Point(0, 0);

  private Image image;

  private ImageData[] imageDatas;

  private Image[] images;

  private int current;

  private int repeatCount;

  private Runnable animationTimer;

  private Color bg;

  private Display display;

  public DynamicImageViewer(Composite parent, Color bg)
  {
    super(parent, SWT.NO_BACKGROUND | SWT.NO_REDRAW_RESIZE);

    this.bg = bg;
    display = getDisplay();
    addListeners();
  }

  /**
   * @param repeatCount
   *          0 forever
   */
  public void setImages(ImageData[] imageDatas, int repeatCount)
  {
    checkWidget();

    this.image = null;
    this.imageDatas = imageDatas;
    this.repeatCount = repeatCount;
    convertImageDatasToImages();
    startAnimationTimer();
    redraw();
  }

  @Override
  public Point computeSize(int wHint, int hHint, boolean changed)
  {
    checkWidget();

    Image image = getCurrentImage();
    if (image != null)
    {
      Rectangle rect = image.getBounds();
      Rectangle trim = computeTrim(0, 0, rect.width, rect.height);
      return new Point(trim.width, trim.height);
    }

    return new Point(wHint, hHint);
  }

  @Override
  public void dispose()
  {
    if (image != null)
      image.dispose();

    if (images != null)
      for (int i = 0; i < images.length; i++)
        images[i].dispose();

    super.dispose();
  }

  protected void paint(Event e)
  {
    Image image = getCurrentImage();
    if (image == null)
      return;

    GC gc = e.gc;
    gc.drawImage(image, origin.x, origin.y);

    gc.setBackground(bg);
    Rectangle rect = image.getBounds();
    Rectangle client = getClientArea();
    int marginWidth = client.width - rect.width;
    if (marginWidth > 0)
    {
      gc.fillRectangle(rect.width, 0, marginWidth, client.height);
    }
    int marginHeight = client.height - rect.height;
    if (marginHeight > 0)
    {
      gc.fillRectangle(0, rect.height, client.width, marginHeight);
    }
  }

  private void addListeners()
  {
    addListener(SWT.Paint, new Listener()
    {
      public void handleEvent(Event e)
      {
        paint(e);
      }
    });
  }

  private void convertImageDatasToImages()
  {
    images = new Image[imageDatas.length];

    // Step 1: Determine the size of the resulting images.
    int width = imageDatas[0].width;
    int height = imageDatas[0].height;

    // Step 2: Construct each image.
    int transition = SWT.DM_FILL_BACKGROUND;
    for (int i = 0; i < imageDatas.length; i++)
    {
      ImageData id = imageDatas[i];
      images[i] = new Image(display, width, height);
      GC gc = new GC(images[i]);

      // Do the transition from the previous image.
      switch (transition)
        {
          case SWT.DM_FILL_NONE :
          case SWT.DM_UNSPECIFIED :
            // Start from last image.
            gc.drawImage(images[i - 1], 0, 0);
            break;
          case SWT.DM_FILL_PREVIOUS :
            // Start from second last image.
            gc.drawImage(images[i - 2], 0, 0);
            break;
          default:
            // DM_FILL_BACKGROUND or anything else,
            // just fill with default background.
            gc.setBackground(bg);
            gc.fillRectangle(0, 0, width, height);
            break;
        }

      // Draw the current image and clean up.
      Image img = new Image(display, id);
      gc.drawImage(img, 0, 0, id.width, id.height, id.x, id.y, id.width, id.height);
      img.dispose();
      gc.dispose();

      // Compute the next transition.
      // Special case: Can't do DM_FILL_PREVIOUS on the
      // second image since there is no "second last"
      // image to use.
      transition = id.disposalMethod;
      if (i == 0 && transition == SWT.DM_FILL_PREVIOUS)
        transition = SWT.DM_FILL_NONE;
    }
  }

  private Image getCurrentImage()
  {
    if (image != null)
      return image;

    if (images == null)
      return null;

    return images[current];
  }

  private void startAnimationTimer()
  {
    if (images == null || images.length < 2)
      return;

    final int delay = imageDatas[current].delayTime * 10;
    display.timerExec(delay, animationTimer = new Runnable()
    {
      public void run()
      {
        if (isDisposed())
          return;

        current = (current + 1) % images.length;
        redraw();

        if (current + 1 == images.length && repeatCount != 0 && --repeatCount <= 0)
          return;
        display.timerExec(delay, this);
      }
    });
  }

  public void stopAnimationTimer()
  {
    if (animationTimer != null)
      display.timerExec(-1, animationTimer);
  }

}
