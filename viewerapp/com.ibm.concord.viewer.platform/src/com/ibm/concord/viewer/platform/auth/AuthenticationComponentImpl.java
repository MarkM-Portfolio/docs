/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.auth;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.AsyncContext;
import javax.servlet.AsyncEvent;
import javax.servlet.AsyncListener;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.component.Component;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */

class AsyncFilterJob implements Runnable
{
  static int threadCounter = 0;

  IAuthenticationAdapter authAdapter;

  AsyncContext ctx;

  FilterChain chain;

  static final Logger logger = Logger.getLogger(AsyncFilterJob.class.getName());

  AsyncFilterJob(AsyncContext ctx, IAuthenticationAdapter authAdapter, FilterChain chain)
  {
    this.authAdapter = authAdapter;
    this.ctx = ctx;
    this.chain = chain;
  }

  @Override
  public void run()
  {
    try
    {
      long start = System.currentTimeMillis();
      logger.log(Level.FINER, "AsyncFilterJob is started. {0}", ((HttpServletRequest) ctx.getRequest()).getRequestURI());
      authAdapter.doFilter(ctx.getRequest(), ctx.getResponse(), chain);
      ctx.complete();
      long end = System.currentTimeMillis();
      logger.log(Level.FINER, "AsyncFilterJob is finished. {0}ms. {1}",
          new Object[] { (end - start), ((HttpServletRequest) ctx.getRequest()).getRequestURI() });
    }
    catch (IOException e)
    {
      logger.log(Level.FINER, e.getLocalizedMessage());
    }
    catch (ServletException e)
    {
      logger.log(Level.FINER, e.getLocalizedMessage());
    }
    finally
    {
      decreaseThreadCount();
    }
  }

  public synchronized static void decreaseThreadCount()
  {
    if (AsyncFilterJob.threadCounter > 0)
    {
      AsyncFilterJob.threadCounter--;
      logger.log(Level.FINER, "Async servlet number is decreased to {0}", AsyncFilterJob.threadCounter);
    }
  }

  public synchronized static boolean increaseThreadCount()
  {
    if (AsyncFilterJob.threadCounter < ViewerConfig.getInstance().getMaxAsyncThreadCount())
    {
      AsyncFilterJob.threadCounter++;
      logger.log(Level.FINER, "Async servlet number is increased to {0}", AsyncFilterJob.threadCounter);
      return true;
    }
    return false;
  }

  public static int getThreadCount()
  {
    return AsyncFilterJob.threadCounter;
  }

}

public class AuthenticationComponentImpl extends Component implements IAuthenticationAdapter
{
  private static final Logger LOG = Logger.getLogger(AuthenticationComponentImpl.class.getName());

  public static final String COMPONENT_ID = "com.ibm.concord.viewer.platform.auth";

  private Map<String, IAuthenticationAdapter> providersMap = new HashMap<String, IAuthenticationAdapter>();

  private IAuthenticationAdapter defaultProvider;

  private IAuthenticationAdapter provider;

  @Override
  public void destroy()
  {
    Set<String> adapterKeys = providersMap.keySet();
    for (String adapterKey : adapterKeys)
    {
      IAuthenticationAdapter adapter = providersMap.get(adapterKey);
      adapter.destroy();
    }
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    String repoId = ViewerUtil.getRepoAndFile((HttpServletRequest) request)[0];
    LOG.log(Level.FINE, "Auth repoId is {0}", repoId);
    if (repoId != null)
    {
      provider = providersMap.get(repoId);
    }
    if (provider == null)
    {
      provider = defaultProvider;
      LOG.log(Level.FINE, "Use default provider {0}", defaultProvider.getClass());
    }

    if (repoId != null && repoId.equalsIgnoreCase(RepositoryServiceUtil.MAIL_REPO_ID))
    {
      LOG.log(Level.FINER, "Got verse request: {0}", ((HttpServletRequest) request).getRequestURI());
      InputStream ins = request.getInputStream();
      if (ins != null && ins.available() > 0)
      {
        LOG.log(Level.FINER, "Got upload request from verse: {0}", ((HttpServletRequest) request).getRequestURI());
        AsyncContext ctx = request.startAsync();
        ctx.setTimeout(ViewerConfig.getInstance().getAsyncTimeout());
        if (ctx.getRequest().isAsyncSupported())
        {
          ctx.addListener(new AsyncListener()
          {
            boolean isTimeOut = false;

            @Override
            public void onTimeout(AsyncEvent arg0) throws IOException
            {
              int status = ((HttpServletResponse) arg0.getAsyncContext().getResponse()).getStatus();
              String uri = ((HttpServletRequest) arg0.getAsyncContext().getRequest()).getRequestURI();
              isTimeOut = true;
              LOG.log(Level.WARNING, "onTimeout. uri={0}. status={1}", new Object[] { uri, status });
            }

            @Override
            public void onStartAsync(AsyncEvent arg0) throws IOException
            {
              // TODO Auto-generated method stub

            }

            @Override
            public void onError(AsyncEvent arg0) throws IOException
            {
              // TODO Auto-generated method stub

            }

            @Override
            public void onComplete(AsyncEvent arg0) throws IOException
            {
              if (isTimeOut)
              {
                int status = ((HttpServletResponse) arg0.getAsyncContext().getResponse()).getStatus();
                String uri = ((HttpServletRequest) arg0.getAsyncContext().getRequest()).getRequestURI();
                LOG.log(Level.WARNING, "OnComplete. uri={0}. status={1}", new Object[] { uri, status });
              }
            }
          });

          if (AsyncFilterJob.increaseThreadCount())
          {
            LOG.log(Level.FINER, "Start async servlet to process {0}", ((HttpServletRequest) request).getRequestURI());
            ctx.start(new AsyncFilterJob(ctx, provider, chain));
            return;
          }
          else
          {
            ctx.complete();
            LOG.log(Level.WARNING, "Failed to handle the request {0}. Number of async serverlet has exceeded upper limit.",
                ((HttpServletRequest) request).getRequestURI());
            ((HttpServletResponse) response).setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            ((HttpServletResponse) response).setHeader("x-viewer-error", "Thread pool is full.");
            return;
          }
        }
        else
        {
          ctx.complete();
          LOG.log(Level.SEVERE, "Async serverlet is NOT support. Checking the configurations to resolve the issue.");
        }
      }
    }

    provider.doFilter(request, response, chain);

  }

  @Override
  public void init(FilterConfig config) throws ServletException
  {
    Set<String> adapterKeys = providersMap.keySet();
    for (String adapterKey : adapterKeys)
    {
      IAuthenticationAdapter adapter = providersMap.get(adapterKey);
      adapter.init(config);
    }

  }

  @Override
  public Object getService(String repoId)
  {
    provider = providersMap.get(repoId);
    if (provider == null)
    {
      provider = defaultProvider;
    }
    return provider;
  }

  @Override
  public Object getService(Class<?> clazz)
  {
    return this;
  }

  @Override
  public UserBean getUserBean(String id) throws Exception
  {
    // ONLY used by LCFiles for now
    return defaultProvider.getUserBean(id);
  }

  @Override
  public void init(JSONObject config)
  {
    JSONArray adapters = (JSONArray) config.get("adapters");
    for (int i = 0; i < adapters.size(); i++)
    {
      JSONObject adapterConfig = (JSONObject) adapters.get(i);
      try
      {
        Class<?> clazz = Class.forName((String) adapterConfig.get("class"));
        IAuthenticationAdapter provider = (IAuthenticationAdapter) clazz.newInstance();
        String id = (String) adapterConfig.get("id");
        JSONObject providerConfig = (JSONObject) adapterConfig.get("config");
        providerConfig.put("id", id);
        provider.init(providerConfig);
        providersMap.put(id, provider);
        if (id.equalsIgnoreCase((String) config.get("default")))
        {
          defaultProvider = provider;
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "component " + COMPONENT_ID + " initialization failed", e);
        throw new IllegalStateException(e);
      }
    }

  }

}
