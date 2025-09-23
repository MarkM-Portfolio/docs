/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.document.common.rendition;

import java.io.File;
import java.io.FileInputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.ConversionUtils;
import com.ibm.concord.viewer.platform.encryption.Encryptor;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.util.FileUtil;

public class RenditionUtil
{
  private static final Logger LOG = Logger.getLogger(RenditionUtil.class.getName());

  private static final String CLASS_NAME = RenditionUtil.class.getName();

  public final static String sourcePattern = "(.+)\\.([jJ][pP][gG]|[gG][iI][fF]|[bB][mM][pP]|[pP][nN][gG])";
  
  /**
   * List all the rendtions from a directory. If a physical file is passed, return the a list that only contains the file
   * 
   * @param f the specified file
   * @param sort indicate if it's required to sort the files
   * @return the rendition list
   */
  
  public static List<Rendition> fromFile(File f, boolean sort)
  {

    List<Rendition> renditions = new ArrayList<Rendition>();

    if (!f.isDirectory() && f.exists() && isReadable(f))
    {
      try
      {
        renditions.add(new Rendition(f/* , mapPreFix + "/0", mapPreFix + "/0", mapPreFix + "/" + f.getName() */));
      }
      catch (IOException e)
      {
        LOG.logp(Level.FINE, CLASS_NAME, "fromFile", "Unable to initialize rendition for file " + f.getAbsolutePath());
        return new ArrayList<Rendition>();
      }
    }
    else
    {
      final List<String> sourceImages = new ArrayList<String>();

      f.listFiles(new FilenameFilter()
      {
        public boolean accept(File dir, String name)
        {
          // only add images and only when the file is not locked
          if (name.matches(sourcePattern) /* && isReadable(new File(dir, name)) */)
          {
            sourceImages.add(name);
            return true;
          }
          else
          {
            return false;
          }
        }
      });

      if (sourceImages.size() > 0)
      {
        if (sort)
        {
          Collections.sort(sourceImages);
        }

        for (String image : sourceImages)
        {
          try
          {
            LOG.log(Level.FINEST, "Try initializing rendition for File, " + f.getAbsolutePath() + "/" + image);

            renditions.add(new Rendition(new File(f, image)/*
                                                            * , mapPreFix + "/" + position, mapPreFix + "/" + position, mapPreFix + "/" +
                                                            * image
                                                            */));
            LOG.log(Level.FINEST, "Done initializing rendition for File, " + f.getAbsolutePath() + "/" + image);
          }
          catch (Exception e)
          {
            LOG.logp(Level.FINE, CLASS_NAME, "fromFile", "Unable to initialize rendition for file " + f.getAbsolutePath());
            return renditions;
          }
        }
      }

    }
    return renditions;
  }
  
  public static List<Rendition> fromFile(File f, boolean sort, final ArrayList<String> existsImages)
  {

    List<Rendition> renditions = new ArrayList<Rendition>();

    if (!f.isDirectory() && f.exists() && isReadable(f))
    {
      try
      {
        renditions.add(new Rendition(f/* , mapPreFix + "/0", mapPreFix + "/0", mapPreFix + "/" + f.getName() */));
      }
      catch (IOException e)
      {
        LOG.logp(Level.FINE, CLASS_NAME, "fromFile", "Unable to initialize rendition for file " + f.getAbsolutePath());
        return new ArrayList<Rendition>();
      }
    }
    else
    {
      final List<String> sourceImages = new ArrayList<String>();

      f.listFiles(new FilenameFilter()
      {
        public boolean accept(File dir, String name)
        {
          // only add images and only when the file is not locked
          if (name.matches(sourcePattern) /* && isReadable(new File(dir, name)) */)
          {
            if (!existsImages.contains(name))
            {
              sourceImages.add(name);
            }
            return true;
          }
          else
          {
            return false;
          }
        }
      });

      if (sourceImages.size() > 0)
      {
        if (sort)
        {
          Collections.sort(sourceImages);
        }

        for (String image : sourceImages)
        {
          try
          {
            LOG.log(Level.FINEST, "Try initializing rendition for File, " + f.getAbsolutePath() + "/" + image);

            renditions.add(new Rendition(new File(f, image)/*
                                                            * , mapPreFix + "/" + position, mapPreFix + "/" + position, mapPreFix + "/" +
                                                            * image
                                                            */));
            LOG.log(Level.FINEST, "Done initializing rendition for File, " + f.getAbsolutePath() + "/" + image);
          }
          catch (Exception e)
          {
            LOG.logp(Level.FINE, CLASS_NAME, "fromFile", "Unable to initialize rendition for file " + f.getAbsolutePath());
            return renditions;
          }
        }
      }

    }
    return renditions;
  }
  
  public static List<Rendition> forceFromFile(File f, boolean sort, String stellentType, String width)
  {
    List<Rendition> renditions = new ArrayList<Rendition>();

    if (!f.isDirectory() && f.exists() && isReadable(f))
    {
      try
      {
        renditions.add(new Rendition(f/* , mapPreFix + "/0", mapPreFix + "/0", mapPreFix + "/" + f.getName() */));
      }
      catch (IOException e)
      {
        LOG.logp(Level.WARNING, CLASS_NAME, "fromFile", "Unable to initialize rendition for file " + f.getAbsolutePath());
        return new ArrayList<Rendition>();
      }
    }
    else
    {
      final List<String> sourceImages = new ArrayList<String>();

      f.listFiles(new FilenameFilter()
      {
        public boolean accept(File dir, String name)
        {
          // only add images and only when the file is not locked
          if (name.matches(sourcePattern) /* && isReadable(new File(dir, name)) */)
          {
            sourceImages.add(name);
            return true;
          }
          else
          {
            return false;
          }
        }
      });

      if (sourceImages.size() > 0)
      {
        if (sort)
        {
          Collections.sort(sourceImages);
        }

        for (String image : sourceImages)
        {
          try
          {
            LOG.log(Level.FINEST, "Try force initializing rendition for File, " + f.getAbsolutePath() + "/" + image);

            renditions.add(new Rendition(new File(f, image), stellentType, width));
            
            LOG.log(Level.FINEST, "Done force initializing rendition for File, " + f.getAbsolutePath() + "/" + image);
          }
          catch (Exception e)
          {
            LOG.logp(Level.WARNING, CLASS_NAME, "fromFile", "Unable to force initialize rendition for file " + f.getAbsolutePath());
          }
        }
      }

    }
    return renditions;
  }

  public static int getSizeFromFile(File f)
  {
      final List<String> sourceImages = new ArrayList<String>();

      f.listFiles(new FilenameFilter()
      {
        public boolean accept(File dir, String name)
        {
          // only add images and only when the file is not locked
          if (name.matches(sourcePattern))
          {
            sourceImages.add(name);
            return true;
          }
          else
          {
            return false;
          }
        }
      });
    return sourceImages.size();
  }
  private static boolean isReadable(File f)
  {
    boolean lockable = false;
    FileInputStream fis = null;
    try
    {
      fis = new FileInputStream(f);
    }
    catch (Exception e)
    {
      LOG.logp(Level.SEVERE, CLASS_NAME, "Fail to tryLock", e.getMessage(), e);
    }
    finally
    {
      if (fis != null)
      {
        try
        {
          fis.close();
        }
        catch (IOException e)
        {
          LOG.logp(Level.SEVERE, CLASS_NAME, "Fail to close output stream", e.getMessage(), e);
        }
      }
    }
    return lockable;
  }
  
  public static void encryptReditionFiles(File f, IDocumentEntry entry, UserBean user) {
    if (!f.isDirectory())
      return;
    
    final List<String> sourceImages = new ArrayList<String>();

    f.listFiles(new FilenameFilter()
    {
      public boolean accept(File dir, String name)
      {
        // only add images and only when the file is not locked
        if (name.matches(sourcePattern) /* && isReadable(new File(dir, name)) */)
        {
          sourceImages.add(name);
          return true;
        }
        else
        {
          return false;
        }
      }
    });
    
    if (sourceImages.size() > 0)
    {
      try
      {
        LOG.log(Level.FINE, CLASS_NAME, "begin to encrypt image files in folder " + f);
        for (String image : sourceImages)
        {
          File imgfile = new File(f, image);
          File tmpfile = new File(f, image+".enc");
          InputStream in = new FileInputStream(imgfile);
          InputStream en = ViewerUtil.getEncryptStream(in, entry, user, Encryptor.EncryptionMode.ENCRYPTION); 
          FileUtil.copyInputStreamToFile(en, tmpfile);
        }
        for (String image : sourceImages)
        {
          File imgfile = new File(f, image);
          File tmpfile = new File(f, image+".enc");
          imgfile.delete();
          tmpfile.renameTo(imgfile);
        }
        File done = new File(f, ConversionUtils.ENCRYPTION_DONE);
        done.createNewFile();
        LOG.log(Level.FINE, CLASS_NAME, "encrypt done for image files in folder " + f);
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Error happens when try to encrypt the image content under directory, {0} {1}", new Object[] {f, e});
      }
    }
  }
}
