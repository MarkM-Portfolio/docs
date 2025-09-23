/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.lcfiles.daemon.util;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketAddress;
import java.net.UnknownHostException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.net.SocketFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.apache.commons.httpclient.ConnectTimeoutException;
import org.apache.commons.httpclient.HttpClientError;
import org.apache.commons.httpclient.params.HttpConnectionParams;
import org.apache.commons.httpclient.protocol.SecureProtocolSocketFactory;

/**
 * SelfSSLSocketFactory can be used to create SSLSockets that accept self-signed certificates.
 * 
 */
public class SelfSSLSocketFactory implements SecureProtocolSocketFactory
{
  private static final Logger LOG = Logger.getLogger(SelfSSLSocketFactory.class.getName());

  private SSLContext sslcontext = null;

  public SelfSSLSocketFactory()
  {
    super();
  }

  private static SSLContext createEasySSLContext()
  {
    try
    {
      String sslProtocol;
      String property = System.getProperty("com.ibm.jsse2.sp800-131");
      if ("strict".equals(property)) {
        if (LOG.isLoggable(Level.FINEST)) {
          LOG.finest("System property com.ibm.jsse2.sp800-131 is set to strict, using TLSv1.2");
        }
        sslProtocol = "TLSv1.2";
      } else {
        if (LOG.isLoggable(Level.FINEST)) {
          LOG.finest("SSLContext will use TLS");
        }
        sslProtocol = "TLSv1.1";
      }            
      SSLContext context = SSLContext.getInstance(sslProtocol);
      context.init(null, new TrustManager[] { createEasyTrustManager() }, null);
      return context;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Initialize SSL context failed.", e);
      throw new HttpClientError(e.toString());
    }
  }

  private static TrustManager createEasyTrustManager()
  {
    TrustManager easyTrustManager = new X509TrustManager()
    {
      public void checkClientTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException
      {
      }

      public void checkServerTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException
      {
      }

      public X509Certificate[] getAcceptedIssuers()
      {
        return new X509Certificate[0];
      }
    };
    return easyTrustManager;
  }

  private SSLContext getSSLContext()
  {
    if (this.sslcontext == null)
    {
      this.sslcontext = createEasySSLContext();
    }
    return this.sslcontext;
  }

  public Socket createSocket(String host, int port, InetAddress clientHost, int clientPort) throws IOException, UnknownHostException
  {

    return getSSLContext().getSocketFactory().createSocket(host, port, clientHost, clientPort);
  }

  public Socket createSocket(final String host, final int port, final InetAddress localAddress, final int localPort,
      final HttpConnectionParams params) throws IOException, UnknownHostException, ConnectTimeoutException
  {
    if (params == null)
    {
      throw new IllegalArgumentException("Parameters may not be null");
    }
    int timeout = params.getConnectionTimeout();
    SocketFactory socketfactory = getSSLContext().getSocketFactory();
    if (timeout == 0)
    {
      return socketfactory.createSocket(host, port, localAddress, localPort);
    }
    else
    {
      Socket socket = socketfactory.createSocket();
      SocketAddress localaddr = new InetSocketAddress(localAddress, localPort);
      SocketAddress remoteaddr = new InetSocketAddress(host, port);
      socket.bind(localaddr);
      socket.connect(remoteaddr, timeout);
      return socket;
    }
  }

  public Socket createSocket(String host, int port) throws IOException, UnknownHostException
  {
    return getSSLContext().getSocketFactory().createSocket(host, port);
  }

  public Socket createSocket(Socket socket, String host, int port, boolean autoClose) throws IOException, UnknownHostException
  {
    return getSSLContext().getSocketFactory().createSocket(socket, host, port, autoClose);
  }

  public boolean equals(Object obj)
  {
    return ((obj != null) && obj.getClass().equals(SelfSSLSocketFactory.class));
  }

  public int hashCode()
  {
    return SelfSSLSocketFactory.class.hashCode();
  }

}