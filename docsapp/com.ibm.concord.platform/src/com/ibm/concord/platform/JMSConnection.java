/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jms.JMSException;
import javax.jms.Session;
import javax.jms.TextMessage;
import javax.jms.Topic;
import javax.jms.TopicConnection;
import javax.jms.TopicConnectionFactory;
import javax.jms.TopicPublisher;
import javax.jms.TopicSession;
import javax.naming.Context;
import javax.naming.InitialContext;

public class JMSConnection
{
  private static final Logger LOG = Logger.getLogger(JMSConnection.class.getName());
  private static TopicConnectionFactory tcf;
  private static Topic topic;
  
  public final static String JMSCF_JNDI_NAME = "java:comp/env/jms/IBMDocsPublish";
  public final static String JMST_JNDI_NAME = "java:comp/env/jms/IBMDocsJournalTopic";
  private static boolean init_state = false;
  
  public static void initDataSource()
  {
    if (Platform.getConcordConfig().isCloud())
      return;
    try
    {
      Context ctx = new InitialContext();
      tcf = (TopicConnectionFactory) ctx.lookup(JMSCF_JNDI_NAME);
      topic = (Topic) ctx.lookup(JMST_JNDI_NAME);
      init_state = true;
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, "failed to initialize HCL Docs Journal relevant JNDI ", e);
    }
  }
  public static void close(TopicConnection topicConn, TopicSession topicSession, TopicPublisher topicPublisher)
  {
    if (Platform.getConcordConfig().isCloud())
      return;
    try
    {
      if (topicConn != null)
      {
        topicConn.close();
      }
    }
    catch (JMSException e)
    {
      LOG.log(Level.WARNING, "Error happens while closing JMS topic connection.", e);
    }

    try
    {
      if (topicSession != null)
      {
        topicSession.close();
      }
    }
    catch (JMSException e)
    {
      LOG.log(Level.WARNING, "Error happens while closing JMS topic session.", e);
    }

    try
    {
      if (topicPublisher != null)
      {
        topicPublisher.close();
      }
    }
    catch (JMSException e)
    {
      LOG.log(Level.WARNING, "Error happens while closing JMS topic publisher.", e);
    }
  }

  public static void writeMessage(String msg)
  {
    LOG.entering(JMSConnection.class.getName(), "writeMessage", new Object[] { msg });
    
    if (!init_state)
    {
      LOG.log(Level.WARNING, "Journal message is not published due to wrong Journal JMS settings: " + msg);
      return;
    }
    TopicConnection topicConn = null;
    TopicSession topicSession = null;
    TopicPublisher topicPublisher = null;

    try
    {
      topicConn = (TopicConnection) tcf.createTopicConnection();
      topicSession = topicConn.createTopicSession(false, Session.AUTO_ACKNOWLEDGE);
      topicPublisher = topicSession.createPublisher(topic);
      TextMessage message = topicSession.createTextMessage();
      message.setText(msg);
      topicPublisher.publish(message);
    }
    catch (JMSException e)
    {
      e.printStackTrace();
    }
    finally{
      close(topicConn, topicSession, topicPublisher);
    }
    LOG.exiting(JMSConnection.class.getName(), "writeMessages");
  }


}
