package com.ibm.docs.sanity.check.docs;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.ibm.docs.sanity.DeploymentEnvType;
import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.check.AbstractCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;
import com.ibm.docs.sanity.util.ServerTypeUtil;

public class DatabaseCheckPoint extends AbstractCheckPoint
{
  private static final Logger LOG = Logger.getLogger(DatabaseCheckPoint.class.getName());

  private static final Properties messages;

  private static final String JNDI_DATASOURCE = "java:comp/env/jdbc/docs_data_source";

  private static final String QUERY_PRODUCT_META = "select \"ID\", \"SCHEMA_VERSION\" from \"CONCORDDB\".\"PRODUCT\"";

  private static final String DB_OVERFLOW = "select substr(tabname,1,20) as table, overflow from syscat.tables where tabschema=? and type='T' and card > 0 and overflow > 0 and 100*(dec(overflow)/dec(card)) >= 5";

  static
  {
    String className = DatabaseCheckPoint.class.getSimpleName();
    messages = new Properties();

    messages.put(className + "@setUp@1", "");
    messages.put(className + "@setUp@2", "");
    messages.put(className + "@setUp@3", "");

    messages.put(className + "@doCheck@1", "Error Code : 3201. Not found the expected Product id. Expectation: [{0}], Actual: [{1}]");
    messages.put(className + "@doCheck@2", "Error Code : 3202. Not found the expected database schema version. Expectation: [{0}], Actual: [{1}]");
    messages.put(className + "@doCheck@3", "Error Code : 3203. Detected database overflow, needs reorg and runstats. {0}");

    messages.put(className + "@tearDown@1", "");
    messages.put(className + "@tearDown@2", "");
    messages.put(className + "@tearDown@3", "");
  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(DatabaseCheckPoint.class.getSimpleName(),
      "This checkpoint is sanity check for database (DB2).", messages);

  private DataSource docsDataSource;

  private Connection docsDBConnection;

  public DatabaseCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  public void setUp() throws SanityCheckException
  {
    super.setUp();
    LOG.entering(DatabaseCheckPoint.class.getName(), "setUp");

    try
    {
      Context ctx = new InitialContext();
      docsDataSource = (DataSource) ctx.lookup(JNDI_DATASOURCE);
    }
    catch (NamingException e)
    {
      throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "setUp", e);
    }

    try
    {
      docsDBConnection = docsDataSource.getConnection();
    }
    catch (SQLException e)
    {
      throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "setUp", e);
    }

    LOG.exiting(DatabaseCheckPoint.class.getName(), "setUp");
    return;
  }

  public void doCheck() throws SanityCheckException
  {
    LOG.entering(DatabaseCheckPoint.class.getName(), "doCheck");

    PreparedStatement stmt = null;
    ResultSet rs = null;
    try
    {
      stmt = docsDBConnection.prepareStatement(QUERY_PRODUCT_META);
      rs = stmt.executeQuery();
      rs.next();
      String dbId = rs.getString("ID");
      String dbVersion = rs.getString("SCHEMA_VERSION");
      LOG.log(Level.FINE, "{0} database schema version is {0}.", new Object[] { dbId, dbVersion });

      if (!"lotuslive.symphony".equals(dbId))
      {
        throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "doCheck", 1, new Object[] { "lotuslive.symphony", dbId });
      }
      if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.CLOUD)
      {
        if (!"1".equals(dbVersion))
        {
          throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "doCheck", 2, new Object[] { "1", dbVersion });
        }
      }
      else if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.ONPREMISE)
      {
        String sSchVer = Integer.toString(ServerTypeUtil.getSchemaVersion());

        if (!sSchVer.equals(dbVersion))
        {
          throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "doCheck", 2, new Object[] { sSchVer, dbVersion });
        }
      }
    }
    catch (SQLException e)
    {
      throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "doCheck", e);
    }
    finally
    {
      if (rs != null)
      {
        try
        {
          rs.close();
          rs = null;
        }
        catch (SQLException e)
        {
          throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "doCheck", e);
        }
      }

      if (stmt != null)
      {
        try
        {
          stmt.close();
          stmt = null;
        }
        catch (SQLException e)
        {
          throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "doCheck", e);
        }
      }
    }

    try
    {
      stmt = docsDBConnection.prepareStatement(DB_OVERFLOW);
      stmt.setString(1, "concorddb");
      rs = stmt.executeQuery();
      if (rs.next())
      {
        StringBuffer overflowDetails = new StringBuffer();
        do
        {
          String table = rs.getString("table");
          String overflow = rs.getString("overflow");
          overflowDetails.append("[");
          overflowDetails.append(table);
          overflowDetails.append(", ");
          overflowDetails.append(overflow);
          overflowDetails.append("] ");
        }
        while (rs.next());
        overflowDetails.setLength(overflowDetails.length() - 1);

        throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "doCheck", 3, new Object[] { overflowDetails.toString() });
      }
    }
    catch (SQLException e)
    {
      throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "doCheck", e);
    }
    finally
    {
      if (rs != null)
      {
        try
        {
          rs.close();
          rs = null;
        }
        catch (SQLException e)
        {
          throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "doCheck", e);
        }
      }

      if (stmt != null)
      {
        try
        {
          stmt.close();
          stmt = null;
        }
        catch (SQLException e)
        {
          throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "doCheck", e);
        }
      }
    }

    cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
    LOG.exiting(DatabaseCheckPoint.class.getName(), "doCheck");
  }

  public void tearDown() throws SanityCheckException
  {
    super.tearDown();
    LOG.entering(DatabaseCheckPoint.class.getName(), "tearDown");

    if (docsDBConnection != null)
    {
      try
      {
        docsDBConnection.close();
      }
      catch (SQLException e)
      {
        throw new SanityCheckException(this, cpItem, DatabaseCheckPoint.class, "tearDown", e);
      }
    }

    LOG.exiting(DatabaseCheckPoint.class.getName(), "tearDown");
    return;
  }

  public SanityCheckPointItem report()
  {
    LOG.entering(DatabaseCheckPoint.class.getName(), "report");

    prepare(cpItem);

    LOG.exiting(DatabaseCheckPoint.class.getName(), "report", cpItem.getResult().isSanity());
    return cpItem;
  }
}
