package com.ibm.docs.viewer.automation;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.apache.http.Consts;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.CookieStore;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.protocol.ClientContext;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.conn.ssl.X509HostnameVerifier;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.HttpParams;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;

import com.ibm.json.java.JSONObject;

public final class ClientFactory
{
  private static final Logger logger = Logger.getLogger(ClientFactory.class.getName());

  public static HttpContext createHttpContext()
  {
    HttpContext httpContext = new BasicHttpContext();
    CookieStore cookieStore = new BasicCookieStore();
    httpContext.setAttribute(ClientContext.COOKIE_STORE, cookieStore);
    return httpContext;
  }

  public static HttpClient createHttpClient(String protocol)
  {
    java.lang.System.setProperty("sun.security.ssl.allowUnsafeRenegotiation", "true");
    HostnameVerifier hostnameVerifier = org.apache.http.conn.ssl.SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER;
    Scheme sch = null;
    if (protocol.startsWith("https"))
    {
      try
      {
	    String sslProtocol;
	    String property = System.getProperty("com.ibm.jsse2.sp800-131");
	    if ("strict".equals(property)) {
	      if (logger.isLoggable(Level.FINEST)) {
	    	  logger.finest("System property com.ibm.jsse2.sp800-131 is set to strict, using TLSv1.2");
	      }
	      sslProtocol = "TLSv1.2";
	    } else {
	      if (logger.isLoggable(Level.FINEST)) {
	    	  logger.finest("SSLContext will use TLS");
	      }
	      sslProtocol = "TLS";
	    }
	    SSLContext sslcontext = SSLContext.getInstance(sslProtocol);
        TrustManager tm = createTrustManager();
        if (tm == null)
        {
          throw new IllegalArgumentException();
        }
        sslcontext.init(null, new TrustManager[] { tm }, new SecureRandom());
        SSLSocketFactory sf = new SSLSocketFactory(sslcontext);
        sf.setHostnameVerifier((X509HostnameVerifier) hostnameVerifier);
        sch = new Scheme("https", sf, 443);
      }
      catch (Exception e)
      {
        logger.log(Level.WARNING, "Not able to create https context.", e.getMessage());
      }
    }
    ThreadSafeClientConnManager connManager = new ThreadSafeClientConnManager();
    connManager.setMaxTotal(100);
    connManager.setDefaultMaxPerRoute(100);
    HttpClient client = new DefaultHttpClient(connManager);
    HttpParams clientParams = client.getParams();
    clientParams.setParameter("http.socket.timeout", 30000);
    clientParams.setParameter("http.connection.timeout", 30000);
    clientParams.setParameter("http.connection-manager.timeout", 301000);
    if (sch != null)
    {
      client.getConnectionManager().getSchemeRegistry().register(sch);
    }
    return client;
  }

  private static TrustManager createTrustManager()
  {
    try
    {
      TrustManager easyTrustManager = new X509TrustManager()
      {
        public void checkClientTrusted(java.security.cert.X509Certificate[] x509Certificates, String s)
            throws java.security.cert.CertificateException
        {
          // To change body of implemented methods use File | Settings | File Templates.
        }

        public void checkServerTrusted(java.security.cert.X509Certificate[] x509Certificates, String s)
            throws java.security.cert.CertificateException
        {
          // To change body of implemented methods use File | Settings | File Templates.
        }

        public java.security.cert.X509Certificate[] getAcceptedIssuers()
        {
          return new java.security.cert.X509Certificate[0]; // To change body of implemented methods use File | Settings | File Templates.
        }
      };
      return easyTrustManager;
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Failed to create trust manager", e.getMessage());
    }
    return null;
  }

  public static HttpEntity createUrlEncoderEntity(JSONObject parameters)
  {
    List<NameValuePair> values = new ArrayList<NameValuePair>();
    Set<String> keys = parameters.keySet();
    for (String key : keys)
    {
      values.add(new BasicNameValuePair(key, (String) parameters.get(key)));
    }
    return new UrlEncodedFormEntity(values, Consts.UTF_8);
  }
}
