package com.ibm.docs.sanity.check;

import java.io.File;
import java.util.Date;
import java.util.StringTokenizer;
import java.util.logging.Logger;

import com.ibm.docs.sanity.Constants;
import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.exception.SanityCheckException;

public abstract class AbstractCheckPoint implements ISanityCheckPoint
{
  private static final Logger LOG = Logger.getLogger(AbstractCheckPoint.class.getName());
  
  protected static final String CONCORD_CONFIG_FILE = "concord-config.json";

  private Date start;

  private Date end;

  private String formatMime;

  public AbstractCheckPoint(String formatMime)
  {
    this.formatMime = formatMime;
  }

  public void setUp() throws SanityCheckException
  {
    start = new Date();
  }

  public void tearDown() throws SanityCheckException
  {
    end = new Date();
  }

  public String getFormatMime()
  {
    return formatMime;
  }

  protected SanityCheckPointItem prepare(SanityCheckPointItem checkPointItem)
  {
    if (checkPointItem == null)
    {
      throw new NullPointerException("The SanityCheckPointItem is not allowed to be null for preparation.");
    }

    LOG.entering(AbstractCheckPoint.class.getName(), "prepare",
        new Object[] { checkPointItem.getName(), checkPointItem.getResult() != null });

    if (checkPointItem.getResult() == null)
    {
      checkPointItem.setResult(CheckResult.RESULT_NULL(formatMime));
    }

    checkPointItem.getResult().duration(end.getTime() - start.getTime());

    LOG.exiting(AbstractCheckPoint.class.getName(), "prepare", checkPointItem.getResult());
    return checkPointItem;
  }

  protected String resolve(String path)
  {
    if (path == null)
    {
      throw new NullPointerException("The path is not allowed to be null for resolve.");
    }

    LOG.entering(AbstractCheckPoint.class.getName(), "resolve", new Object[] { path });

    if (File.separatorChar == '\\')
    {
      if (path.indexOf('/') != -1)
      {
        path = path.replace('/', '\\');
      }
      if (path.endsWith("\\"))
      {
        path = path.substring(0, path.length() - 1);
      }
    }
    else
    {
      if (path.endsWith("/"))
      {
        path = path.substring(0, path.length() - 1);
      }
    }

    LOG.exiting(AbstractCheckPoint.class.getName(), "resolve", path);
    return path;
  }

  protected String escape(String path, String formatMime)
  {
    if (path == null)
    {
      throw new NullPointerException("The path is not allowed to be null for escape.");
    }

    LOG.entering(AbstractCheckPoint.class.getName(), "escape", new Object[] { path, formatMime });

    if (!Constants.ACCEPT_HEADER_HTML.equals(formatMime))
    {
      StringBuffer escaped = new StringBuffer();
      StringTokenizer st = new StringTokenizer(path, File.separator);
      while (st.hasMoreTokens())
      {
        escaped.append(st.nextToken());
        if (st.hasMoreTokens())
        {
          escaped.append('@');
        }
      }

      LOG.exiting(AbstractCheckPoint.class.getName(), "escape", escaped.toString());
      return escaped.toString();
    }
    else
    {
      LOG.exiting(AbstractCheckPoint.class.getName(), "escape", path);
      return path;
    }
  }
}
