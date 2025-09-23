/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.shape2image;

import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;

import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.apache.batik.dom.util.DOMUtilities;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.ImageTranscoder;
import org.apache.batik.transcoder.image.PNGTranscoder;
import org.apache.batik.transcoder.svg2svg.SVGTranscoder;

import java.util.logging.Level;
import java.util.logging.Logger;
import org.w3c.dom.Document;

import com.ibm.symphony.conversion.service.common.util.FileUtil;

public class TranscoderService
{
  private static final String CLASS = TranscoderService.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  public static String printToString(Document doc)
  {
    String output = "";
    Writer writer = null;
    try
    {
      writer = new StringWriter();
      print(doc, writer);
      output = writer.toString();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Invalid SVG Document", e);
    }
    finally
    {
      try
      {
        if (writer != null)
        {
          writer.close();
        }
      }
      catch (IOException e)
      {
      }
    }

    return output;
  }

  public void print(Document doc, String targetPath)
  {
    Writer writer = null;
    try
    {
      writer = new FileWriter(targetPath);
      print(doc, writer);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Invalid SVG Document", e);
    }
    finally
    {
      try
      {
        if (writer != null)
        {
          writer.close();
        }
      }
      catch (IOException e)
      {
      }
    }
  }

  private static void print(Document doc, Writer writer) throws Exception
  {
    SVGTranscoder coder = new SVGTranscoder();
    TranscoderInput input = new TranscoderInput(doc);
    TranscoderOutput output2 = new TranscoderOutput(writer);
    coder.transcode(input, output2);
  }

  // public void convertWMF2PNG(File file)
  // {
  // ByteArrayOutputStream svg = convertWMF2SVG(file);
  // convertSVG2PNG(svg);
  //
  // }
  //
  // public ByteArrayOutputStream convertWMF2SVG(File file)
  // {
  // WMFHeaderProperties prop = null;
  // try
  // {
  // prop = new WMFHeaderProperties(file);
  // }
  // catch (IOException e)
  // {
  // LOG.logp(Level.WARNING, CLASS, "convertWMF2SVG", e.getLocalizedMessage(), e);
  // }
  // byte[] wmf = new byte[(int) file.length()];
  // FileInputStream fileInputStream;
  // ByteArrayOutputStream svg = null;
  // try
  // {
  // fileInputStream = new FileInputStream(file);
  // fileInputStream.read(wmf);
  // WMFTranscoder transcoder = new WMFTranscoder();
  // transcoder.addTranscodingHint(WMFTranscoder.KEY_INPUT_WIDTH, Integer.valueOf(prop.getWidthBoundsPixels()));
  // transcoder.addTranscodingHint(WMFTranscoder.KEY_INPUT_HEIGHT, Integer.valueOf(prop.getHeightBoundsPixels()));
  // transcoder.addTranscodingHint(WMFTranscoder.KEY_XOFFSET, Integer.valueOf(prop.getXOffset()));
  // transcoder.addTranscodingHint(WMFTranscoder.KEY_YOFFSET, Integer.valueOf(prop.getYOffset()));
  // TranscoderInput input = new TranscoderInput(new ByteArrayInputStream(wmf));
  // svg = new ByteArrayOutputStream();
  //
  // TranscoderOutput output = new TranscoderOutput(svg);
  //
  // transcoder.transcode(input, output);
  // }
  // catch (FileNotFoundException e)
  // {
  // LOG.logp(Level.WARNING, CLASS, "convertWMF2SVG", e.getLocalizedMessage(), e);
  // }
  // catch (IOException e)
  // {
  // LOG.logp(Level.WARNING, CLASS, "convertWMF2SVG", e.getLocalizedMessage(), e);
  // }
  // catch (TranscoderException e)
  // {
  // LOG.logp(Level.WARNING, CLASS, "convertWMF2SVG", e.getLocalizedMessage(), e);
  // }
  // return svg;
  //
  // }

  // public void convertSVG2PNG(ByteArrayOutputStream svg)
  // {
  // ImageTranscoder it = new PNGTranscoder();
  // ByteArrayOutputStream png = new ByteArrayOutputStream();
  // try
  // {
  // it.transcode(new TranscoderInput(new ByteArrayInputStream(svg.toByteArray())), new TranscoderOutput(png));
  // }
  // catch (TranscoderException e)
  // {
  // LOG.log(Level.WARNING, "Invalid SVG Document", e);
  // }
  // }

  public boolean convertSVGDOM2PNG(Document doc, String targetPath, float width, float height)
  {
    BufferedOutputStream bstream = null;
    try
    {
      bstream = new BufferedOutputStream(new FileOutputStream(new File(targetPath)));
      return convertSVGDOM2PNG(doc, bstream, width, height);
    }
    catch (Exception e)
    {
      LOG.warning("Unexpected in shape2image conversion. Failing Shape is located here: " + targetPath);
      LOG.log(Level.WARNING, e.getMessage(), e);
    }
    finally
    {
      FileUtil.closeResource(bstream);
    }

    return false;
  }

  public boolean convertSVGDOM2PNG(Document doc, OutputStream os, float width, float height)
  {
    boolean success = false;
    ImageTranscoder coder = new PNGTranscoder();
    InputStream inputStream = null;
    StringWriter xmlAsWriter = new StringWriter();

    try
    {
      DOMUtilities.writeDocument(doc, xmlAsWriter);
      String domString = xmlAsWriter.toString();
      inputStream = new ByteArrayInputStream(domString.getBytes("UTF-8"));
      TranscoderInput input = new TranscoderInput(inputStream);
      TranscoderOutput output = new TranscoderOutput(os);
      // Since the height and width are placed in the SVG file, I don't think the hints are needed (and in fact seem to hurt in some cases)
      // coder.addTranscodingHint(PNGTranscoder.KEY_WIDTH, width);
      // coder.addTranscodingHint(PNGTranscoder.KEY_HEIGHT, height);
      coder.transcode(input, output);
      success = true;
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, e.getMessage(), e);
      LOG.warning(printToString(doc));
    }
    finally
    {
      FileUtil.closeResource(inputStream);
      FileUtil.closeResource(os);
    }
    return success;
  }
  
  public boolean convertSVG2PNG(InputStream is, OutputStream os)
  {
    boolean success = false;
    try
    {
    	TranscoderInput input = new TranscoderInput(is);
        TranscoderOutput transOutput = new TranscoderOutput(os);
        
        PNGTranscoder transcoder = new PNGTranscoder();
        transcoder.transcode(input, transOutput);
        success = true;
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, e.getMessage(), e);
    }
    finally
    {
      FileUtil.closeResource(is);
      FileUtil.closeResource(os);
    }
    return success;
  }
  
  public boolean convertSVG2PNG(String svg, OutputStream os)
  {
    boolean success = false;
    try
    {
    	TranscoderInput input = new TranscoderInput(new StringReader(svg));
        TranscoderOutput transOutput = new TranscoderOutput(os);
        
        PNGTranscoder transcoder = new PNGTranscoder();
        transcoder.transcode(input, transOutput);
        success = true;
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, e.getMessage(), e);
    }
    finally
    {
      FileUtil.closeResource(os);
    }
    return success;
  }
}
