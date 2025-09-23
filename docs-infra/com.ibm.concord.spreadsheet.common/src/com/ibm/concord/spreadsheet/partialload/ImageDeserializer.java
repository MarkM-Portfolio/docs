package com.ibm.concord.spreadsheet.partialload;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.partialload.serialize.IValueHandlerResult;
import com.ibm.concord.spreadsheet.partialload.serialize.impl.DefaultValueHandler;
import com.ibm.concord.spreadsheet.partialload.serialize.impl.SerializationUtils;

public class ImageDeserializer
{
  private static final Logger LOG = Logger.getLogger(ImageDeserializer.class.getName());
  
  private static class ImageHrefHandler extends DefaultValueHandler
  {
    private boolean hasReadUnnames = false;
    
    protected IValueHandlerResult doHandle(JsonParser jsonParser) throws JsonParseException, IOException
    {
      String fieldName = jsonParser.getCurrentName();
      if (fieldName == null)
      {
        return IValueHandlerResult.NEXT;
      }
      else if (fieldName.equals(ConversionConstant.UNNAME_RANGE))
      {
          hasReadUnnames = true;
          return IValueHandlerResult.TAKE_ORIGIN;
      }
      else
      {
        // ignore all others
        return hasReadUnnames ? IValueHandlerResult.END: IValueHandlerResult.SKIP;
      }
    }
  }
  

  private static class HrefInRangeListener extends AbstractJsonGeneratorListener
  {
    private enum State {
      RANGE, RANGE_ID, RANGE_DATA, ATTR_USAGE, ATTR_HREF
    }

    private State state = null;

    private String usage;
    private String href;
    private Set<String> hrefSet;
    public HrefInRangeListener(Set<String> hrefSet)
    {
      this.hrefSet = hrefSet;
    }

    @Override
    public void onFieldName(String name)
    {
      if (state == null)
      {
        if (name.equals(ConversionConstant.UNNAME_RANGE))
        {
          state = State.RANGE;
        }
      }
      else if (state == State.RANGE)
      {
        state = State.RANGE_ID;
      }
      else if (state == State.RANGE_ID)
      {
        if (name.equals(ConversionConstant.RANGE_USAGE))
        {
          state = State.ATTR_USAGE;
        }
        else if (name.equals(ConversionConstant.DATA))
        {
          state = State.RANGE_DATA;
        }
        else
        {
          // no interest
          ;
        }
      }
      else if(state == State.RANGE_DATA)
      {
        if(name.equals("href"))
          state = State.ATTR_HREF;
      }
      else
      {
        // no interest
      }
    }

    @Override
    public void onEndObject()
    {
      if (state != null)
      {
        switch (state)
          {
            case RANGE_ID :
              state = State.RANGE;  
              if(href!=null)
                hrefSet.add(href);
              href = null;
              usage = null;
              break;
            case RANGE_DATA :
              state = State.RANGE_ID;
              break;
            default:
              // no interest
              ;
          }
      }
    }

    @Override
    public String onString(String s)
    {
      if (state != null)
      {
        switch (state)
          {
            case ATTR_USAGE :
              usage = s;
              state = State.RANGE_ID;
              break;
            case ATTR_HREF:
              if("IMAGE".equals(usage) || "CHART_AS_IMAGE".equals(usage))
                href = s;
              else if("chart".equals(usage))
            	href = s + ".js";
              state = State.RANGE_ID;
              break;
            default:
              // no interest
              ;
          }
      }
      return s;
    }
  }
  
  public static void cleanUselessImages(String path)
  {
    String contentUri = path + File.separator + "content.js";
    String imageUri = path + File.separator + "Pictures";
    String chartUri = path + File.separator + "Charts";
    
    File imageDir = new File(imageUri);
    boolean hasImage = imageDir.exists() && imageDir.listFiles().length>0;
    File chartDir = new File(chartUri);
    boolean hasChart = chartDir.exists() && chartDir.listFiles().length>0;
    if(!hasImage && !hasChart)
    	return;
    
    File contentfile = new File(contentUri);
    if (!contentfile.exists())
      return;
    
    JsonFactory jsonFactory = new JsonFactory();
    JSONObjectGenerator contentGenerator = new JSONObjectGenerator();
    JsonParser contentJp = null;
    Set<String> imagesInUse = new HashSet<String>();
    try
    {
      contentJp = jsonFactory.createJsonParser(contentfile);
      contentGenerator.addListener(new HrefInRangeListener(imagesInUse));
      contentGenerator.writeStartObject();
      contentJp.nextToken();
      SerializationUtils.iterateSerializing(contentJp, contentGenerator, new ImageHrefHandler());
      if(hasImage)
    	  iterateAndCleanImage(imageDir,path.length(),imagesInUse);
      if(hasChart)
    	  iterateAndCleanImage(chartDir,path.length(),imagesInUse);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "error happened when clean the useless images", e);
    }
    finally
    {
        try
        {
          if (contentJp != null)
            contentJp.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "error happened when close the jaxson parser", e);
        }
    }
  }

  private static void iterateAndCleanImage(File fp, int pathlen, Set<String> imagesInUse)
  {
    File[] fs = fp.listFiles();
    for(int i=0;i<fs.length;i++)
    {
      File f = fs[i];
      if(f.isDirectory())
      {
        iterateAndCleanImage(f,pathlen,imagesInUse);
      }
      else
      {
        String abpath = f.getAbsolutePath();
        String subpath = abpath.substring(pathlen+1);
        subpath = subpath.replace("\\", "/");
        if(!imagesInUse.contains(subpath))
          f.delete();
      }
    }
  }
}
