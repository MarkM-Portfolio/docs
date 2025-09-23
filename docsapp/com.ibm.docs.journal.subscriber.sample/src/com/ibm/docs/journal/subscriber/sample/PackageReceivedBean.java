/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */


package com.ibm.docs.journal.subscriber.sample;

import java.io.File;
import java.io.IOException;
import java.util.logging.FileHandler;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ejb.MessageDrivenBean;
import javax.ejb.MessageDrivenContext;
import javax.jms.JMSException;
import javax.jms.MessageListener;
import javax.jms.TextMessage;

import com.ibm.concord.config.ConcordConfig;

/**
 * Bean implementation class for Message-Driven Bean: PackageReceived
 * 
 * @ejb.bean name="PackageReceived" transaction-type="Container" destination-type="javax.jms.Topic" message-selector="package_received"
 * 
 */
public class PackageReceivedBean implements MessageListener, MessageDrivenBean
{
  private static final long serialVersionUID = 6569939380549081881L;

  private static Logger logger = Logger.getLogger("JournalSubscriber");

  private MessageDrivenContext myMessageDrivenCtx;

  private boolean init_state = false;

  private String journalDir;

  private final String FILENAME = "journal%g.log";

  private String logfullpath;

  private FileHandler fh = null;

  private final int COUNT = 200; // count of file numbers

  private final int LIMIT = 10 * 1024 * 1024; // 1M

  public PackageReceivedBean()
  {
    // this.journalDir = WASConfigHelper.getCellVariable("DOCS_INSTALL_ROOT");
    String installRoot = ConcordConfig.getInstance().getInstallRoot();
    if (installRoot == null || installRoot.length() == 0)
    {
      logger.log(Level.WARNING, "DOCS_INSTALL_ROOT WAS variable NOT SETUP, JOURNLAL IS DISABLED.");
      return;
    }

    this.journalDir = ConcordConfig.getInstance().getInstallRoot() + File.separator + "journal";
    File file = new File(this.journalDir);
    if (!file.exists())
    {
      file.mkdirs();
    }
    init_state = true;
    this.logfullpath = this.journalDir + File.separator + this.FILENAME;
    try
    {
      logger.setLevel(Level.ALL);
      this.fh = new FileHandler(this.logfullpath, this.LIMIT, this.COUNT, true);
      this.fh.setFormatter(new SimpleJournalFormatter());
      logger.addHandler(fh);
    }
    catch (IOException e)
    {
      throw new IllegalStateException("Journal LOG file not exist.");
    }

  }

  /**
   * getMessageDrivenContext
   */
  public MessageDrivenContext getMessageDrivenContext()
  {
    return myMessageDrivenCtx;
  }

  /**
   * setMessageDrivenContext
   */
  public void setMessageDrivenContext(MessageDrivenContext ctx)
  {
    myMessageDrivenCtx = ctx;
  }

  public void ejbCreate()
  {
  }

  public void ejbRemove()
  {
    this.fh.close();
  }

  public void onMessage(javax.jms.Message msg)
  {
    if (!init_state)
    {
      logger.log(Level.WARNING, "DOCS_INSTALL_ROOT WAS variable NOT SETUP, JOURNLAL IS DISABLED.");
      return;
    }
    if (!(msg instanceof TextMessage))
    {
      logger.info("HCL Docs Journal get illeagal message");
      throw new RuntimeException();
    }
    TextMessage textMsg = (TextMessage) msg;
    try
    {
      logger.info(textMsg.getText());
      fh.flush();
      // fh.close();
    }
    catch (JMSException x)
    {
      throw new RuntimeException(x);
    }
    /*
     * finally { fh.close(); }
     */
  }
}