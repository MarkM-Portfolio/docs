package com.ibm.docs.sanity.check.docs;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Date;
import java.util.Properties;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.XMLConfiguration;

import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.check.AbstractCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;
import com.ibm.docs.sanity.util.AppConfigurationUtil;
import com.ibm.docs.sanity.util.ServerTypeUtil;
import com.ibm.json.java.JSONObject;

public class StorageCheckPoint extends AbstractCheckPoint
{
  private static final Logger LOG = Logger.getLogger(StorageCheckPoint.class.getName());

  private static final Properties messages;

  static
  {
    String className = StorageCheckPoint.class.getSimpleName();
    messages = new Properties();

    messages.put(className + "@setUp@1", "The installation root path was not found.");
    messages.put(className + "@setUp@2", "The configuration file at [{0}] was not found.");
    messages.put(className + "@setUp@3", "The configuration file content cannot be parsed.");
    messages.put(className + "@setUp@4", "The shared data root path was not found.");

    messages.put(className + "@doCheck@1", "The shared data directory at [{0}] was not found.");
    messages.put(className + "@doCheck@2", "The draft directory under [{0}] was not found.");
    messages.put(className + "@doCheck@3", "The cache directory under [{0}] was not found.");
    messages.put(className + "@doCheck@4", "Cannot create directory in shared storage.");
    messages.put(className + "@doCheck@5", "The write operation on shared storage takes {0}ms for writing {1}MB data.");
    messages.put(className + "@doCheck@6", "The read operation on shared storage takes {0}ms for reading {1}MB data.");
    messages.put(className + "@doCheck@7", "Cannot delete file from shared storage.");
    messages.put(className + "@doCheck@8", "Cannot delete directory from shared storage.");

    messages.put(className + "@tearDown@1", "");
    messages.put(className + "@tearDown@2", "");
    messages.put(className + "@tearDown@3", "");
  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(StorageCheckPoint.class.getSimpleName(),
      "This checkpoint is sanity check for shared storage (NFS).", messages);

  private JSONObject rootConfig;

  private String sharedDataRoot;

  public StorageCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  public void setUp() throws SanityCheckException
  {
    super.setUp();
    LOG.entering(StorageCheckPoint.class.getName(), "setUp");

    XMLConfiguration cellVarConfig;
    try
    {
      cellVarConfig = new XMLConfiguration(ServerTypeUtil.varFile);
      // String installRoot = ServerTypeUtil.getCellVariable(cellVarConfig, "DOCS_INSTALL_ROOT");
      String configFS = AppConfigurationUtil.getAppConfigJsonPath("docs");
      if (configFS == null)
      {
        throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "setUp", 1);
      }

      // installRoot = resolve(installRoot);
      File configFile = new File(configFS);
      if (configFile.exists() && configFile.isFile())
      {
        FileInputStream fis = null;
        try
        {
          fis = new FileInputStream(configFile);
          rootConfig = JSONObject.parse(fis);
        }
        catch (FileNotFoundException e)
        {
          throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "setUp", e);
        }
        catch (IOException e)
        {
          throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "setUp", e);
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
              throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "setUp", e);
            }
          }
        }
      }
      else
      {
        String sPath = configFile.getPath();
        Properties prop = System.getProperties();
        String os = prop.getProperty("os.name");
        if (os.startsWith("win") || os.startsWith("Win"))
          sPath = sPath.replaceAll("\\\\", "\\\\\\\\");
        throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "setUp", 2,
            new Object[] { escape(sPath, this.getFormatMime()) });
      }

      if (rootConfig == null)
      {
        throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "setUp", 3);
      }

      sharedDataRoot = ServerTypeUtil.getCellVariable(cellVarConfig, "DOCS_SHARED_DATA_ROOT");
      if (sharedDataRoot == null)
      {
        throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "setUp", 4);
      }
    }
    catch (ConfigurationException e)
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "setUp", e);
    }

    LOG.exiting(StorageCheckPoint.class.getName(), "setUp");
    return;
  }

  public void doCheck() throws SanityCheckException
  {
    LOG.entering(StorageCheckPoint.class.getName(), "doCheck");

    if (!new File(sharedDataRoot).isDirectory())
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", 1, new Object[] { escape(sharedDataRoot,
          this.getFormatMime()) });
    }

    boolean[] results = new boolean[] { false, false };
    new File(sharedDataRoot).listFiles(new NestFilenameFilter(results));

    if (!results[0])
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", 2, new Object[] { escape(sharedDataRoot,
          this.getFormatMime()) });
    }

    if (!results[1])
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", 3, new Object[] { escape(sharedDataRoot,
          this.getFormatMime()) });
    }

    File sanityDir = new File(sharedDataRoot, "sanity");
    File tmpDir = new File(sanityDir, "check_" + UUID.randomUUID().toString());
    if (!tmpDir.mkdirs())
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", 4);
    }

    Date startW = new Date();
    File tmpFile = new File(tmpDir, "tmp_" + UUID.randomUUID().toString());
    OutputStream os = null;
    String testStr = "HCL Docs";
    try
    {
      tmpFile.createNewFile();
      os = new FileOutputStream(tmpFile);
      byte[] data = testStr.getBytes();
      os.write(data);
    }
    catch (FileNotFoundException e)
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", e);
    }
    catch (IOException e)
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", e);
    }
    finally
    {
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (IOException e)
        {
          throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", e);
        }
      }
    }
    Date endW = new Date();

    InputStream is = null;
    os = null;
    try
    {
      is = new FileInputStream(tmpFile);
      int length = testStr.getBytes().length;
      byte[] data = new byte[length];
      is.read(data, 0, data.length);
    }
    catch (FileNotFoundException e)
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", e);
    }
    catch (IOException e)
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", e);
    }
    finally
    {
      if (is != null)
      {
        try
        {
          is.close();
        }
        catch (IOException e)
        {
          throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", e);
        }
      }
    }
    Date endR = new Date();

    long costW = endW.getTime() - startW.getTime();
    if (costW > 1000 * 3)
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", 5, new Object[] { costW });
    }
    else
    {
      LOG.log(Level.FINE, "The write operation on shared storage takes {0}ms for writing data.", new Object[] { costW });
    }

    long costR = endR.getTime() - endW.getTime();
    if (costR > 1000 * 3)
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", 6, new Object[] { costR });
    }
    else
    {
      LOG.log(Level.FINE, "The read operation on shared storage takes {0}ms for reading data.", new Object[] { costR });
    }

    if (tmpFile.exists() && !tmpFile.delete())
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", 7);
    }

    if (!tmpDir.delete())
    {
      throw new SanityCheckException(this, cpItem, StorageCheckPoint.class, "doCheck", 8);
    }

    cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
    LOG.exiting(StorageCheckPoint.class.getName(), "doCheck");
  }

  public void tearDown() throws SanityCheckException
  {
    super.tearDown();
    LOG.entering(StorageCheckPoint.class.getName(), "tearDown");
    LOG.exiting(StorageCheckPoint.class.getName(), "tearDown");
    return;
  }

  public SanityCheckPointItem report()
  {
    LOG.entering(StorageCheckPoint.class.getName(), "report");

    prepare(cpItem);

    LOG.exiting(StorageCheckPoint.class.getName(), "report", cpItem.getResult().isSanity());
    return cpItem;
  }

  private static class NestFilenameFilter implements FilenameFilter
  {
    private boolean[] results;

    public NestFilenameFilter(boolean[] results)
    {
      this.results = results;
    }

    public boolean accept(File dir, String name)
    {
      if ("draft".equals(name))
      {
        results[0] = true;
      }

      if ("job_cache".equals(name))
      {
        results[1] = true;
      }

      return true;
    }
  }
}
