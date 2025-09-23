/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform;

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

import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.platform.util.ViewerUtil;

public class JMSConnection
{
  private static final Logger LOG = Logger.getLogger(JMSConnection.class.getName());

  private static TopicConnectionFactory tcf;

  private static Topic topic;

  public final static String JMSCF_JNDI_NAME = "java:comp/env/jms/ViewerPublish";

  public final static String JMST_JNDI_NAME = "java:comp/env/jms/ViewerJournalTopic";

  private static boolean init_state = false;

  public static void initDataSource()
  {
    // Don't use it in smart cloud
    String deployment = ViewerUtil.getDeployment();
    boolean bSC = false;
    if (deployment != null && deployment.equalsIgnoreCase(Constant.SMART_CLOUD))
    {
      bSC = true;
    }
    if (bSC)
    {
      return;
    }

    try
    {
      Context ctx = new InitialContext();
      tcf = (TopicConnectionFactory) ctx.lookup(JMSCF_JNDI_NAME);
      topic = (Topic) ctx.lookup(JMST_JNDI_NAME);
      init_state = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "failed to initialize Viewer Journal relevant JNDI ");
    }
  }

  public static void close(TopicConnection topicConn, TopicSession topicSession, TopicPublisher topicPublisher)
  {
    // Don't use it in smart cloud
    String deployment = ViewerUtil.getDeployment();
    boolean bSC = false;
    if (deployment != null && deployment.equalsIgnoreCase(Constant.SMART_CLOUD))
    {
      bSC = true;
    }
    if (bSC)
    {
      return;
    }

    try
    {
      if (topicPublisher != null)
      {
        topicPublisher.close();
      }
      if (topicSession != null)
      {
        topicSession.close();
      }
      if (topicConn != null)
      {
        topicConn.close();
      }
    }
    catch (JMSException e)
    {
      LOG.log(Level.WARNING, "Error happens while closing JMS topic connection.");
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
    finally
    {
      close(topicConn, topicSession, topicPublisher);
    }
    LOG.exiting(JMSConnection.class.getName(), "writeMessages");
  }

}
