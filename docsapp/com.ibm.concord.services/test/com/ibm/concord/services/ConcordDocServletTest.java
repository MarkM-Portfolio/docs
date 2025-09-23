package com.ibm.concord.services;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.logging.Logger;

import org.junit.runner.RunWith;
import org.junit.*;
import org.mockito.Matchers;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

import static org.powermock.api.mockito.PowerMockito.*;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.core.classloader.annotations.SuppressStaticInitializationFor;
import org.powermock.modules.junit4.*;
import org.powermock.reflect.Whitebox;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.*;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.services.servlet.ConcordDocServlet;
import com.ibm.concord.session.SessionConfig;
import com.ibm.concord.session.SessionManager;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.websphere.runtime.ServerName;


@RunWith(PowerMockRunner.class)
@PrepareForTest({ SessionConfig.class/*will mock static method*/, SessionManager.class/*mock Final class*/, ServerName.class, Logger.class, DocumentEntryUtil.class, ConcordConfig.class})
@SuppressStaticInitializationFor({"com.ibm.concord.services.rest.ServiceUtil"})
public class ConcordDocServletTest
{
  HttpServletRequest request;
  HttpServletResponse response;
  @Before
  public void setUp() {
    request = mock(HttpServletRequest.class);
    response = mock(HttpServletResponse.class);
  }
  
  @After
  public void tearDown() {
    
  }
  
  @Test
  public void testDoGetError() {
    /**** Mock Object, Method ***/
    // Mock Logger, because for different JVM
    mockStatic(Logger.class);
    Logger logger = mock(Logger.class);
    when(Logger.getLogger(Mockito.anyString())).thenReturn(logger);
    
    // Prepare to mock the static method of SessioniConfig
    mockStatic(SessionConfig.class);
    
    // PowerMockito can mock static method SessionConfig.getMaxActiveEditing
    // If use Mockito, it call the implementation of static method
    when(SessionConfig.getMaxActiveEditing()).thenReturn(2);
    
    // Mock SessionManager instance
    SessionManager sessionMgr = mock(SessionManager.class);
    
    // Prepare to mock the static method of SessionManager
    mockStatic(SessionManager.class);
    
    // Use PowerMockito to mock the method of SessionManager which is the final class
    when(SessionManager.getInstance()).thenReturn(sessionMgr);
    
    // for non-static non-final method, we can just use mockito
    when(sessionMgr.getActiveSessionNumbers()).thenReturn(10);
    
    // Mock ServerName.getFullName(), otherwise Encoder.encode will throw exception if the json contains null value
    mockStatic(ServerName.class);
    when(ServerName.getFullName()).thenReturn("DocsServer1");
    
    // Mock calling method, and don't care about the parameters when calling
    RequestDispatcher dispatcher = mock(RequestDispatcher.class);
    when(request.getRequestDispatcher(Mockito.anyString())).thenReturn(dispatcher);
    
    final HashMap<String, Object> attrMap = new HashMap<String, Object>();
    Mockito.doAnswer(new Answer() {
      public Object answer(InvocationOnMock invocation) {
          Object[] args = invocation.getArguments();
          attrMap.put((String)args[0], args[1]);
          return null;
      }})
      .when(request).setAttribute(Mockito.anyString(), Mockito.anyObject());
    
    Mockito.doAnswer(new Answer(){
      public Object answer(InvocationOnMock invocation) {
        Object[] args = invocation.getArguments();
        return attrMap.get((String)args[0]);
      }
    }).when(request).getAttribute(Mockito.anyString());
    
    /***** Call Method ***/
    ConcordDocServlet servlet = new ConcordDocServlet();
    // The test method is private/protected
    try
    {
      Method doGetMethod = ConcordDocServlet.class.getDeclaredMethod("doGet", HttpServletRequest.class, HttpServletResponse.class);
      doGetMethod.setAccessible(true);
      doGetMethod.invoke(servlet, request, response);
    }
    catch (NoSuchMethodException e)
    {
      e.printStackTrace();
      Assert.fail(e.getMessage());
    }
    catch (SecurityException e)
    {
      e.printStackTrace();
      Assert.fail(e.getMessage());
    }
    catch (IllegalAccessException e)
    {
      e.printStackTrace();
      Assert.fail(e.getMessage());
    }
    catch (IllegalArgumentException e)
    {
      e.printStackTrace();
      Assert.fail(e.getMessage());
    }
    catch (InvocationTargetException e)
    {
      e.printStackTrace();
      Assert.fail(e.getMessage());
    }
    
    /***** Verify ****/
    
    // Specified method/brance has been called
    Mockito.verify(request, Mockito.times(1)).getRequestDispatcher("/WEB-INF/pages/error.jsp");// or atLeaseOnce,
//    verify(request).getRequestDispatcher("abc"); // verify failed , because never called with param "abc"
    
    // Verify if static method has been called
    verifyStatic();
    SessionConfig.getMaxActiveEditing();
    
    // Call verifyStatic() per static method verification
//    PowerMockito.verifyStatic();
//    SessionConfig.getReloadLog(); // verify failed, because this static method never called before
    
    // we can verify the answer here
    Object obj = request.getAttribute("error_msg");
    System.out.println(obj);
    
  }
  
  @Test
  public void testDoGetThrowException() {
    /**** Mock Object, Method ***/
    // Mock static field - Logger, different JVM have different behavior
    // should not do like the following comments
//    mockStatic(Logger.class);
//    Logger logger = mock(Logger.class);
//    when(Logger.getLogger(Mockito.anyString())).thenReturn(logger);
    Logger logger = mock(Logger.class);
    Whitebox.setInternalState(ServiceUtil.class, "LOG", logger);
    Whitebox.setInternalState(ConcordConfig.class, "LOG", logger);
    Whitebox.setInternalState(DocumentEntryUtil.class, "LOG", logger);
    
    // Prepare to mock the static method of SessioniConfig
    mockStatic(SessionConfig.class);
    
    // PowerMockito can mock static method SessionConfig.getMaxActiveEditing
    // If use Mockito, it call the implementation of static method
    when(SessionConfig.getMaxActiveEditing()).thenReturn(100);
    
    // Mock SessionManager instance
    SessionManager sessionMgr = mock(SessionManager.class);
    
    // Prepare to mock the static method of SessionManager
    mockStatic(SessionManager.class);
    
    // Use PowerMockito to mock the method of SessionManager which is the final class
    when(SessionManager.getInstance()).thenReturn(sessionMgr);
    
    // for non-static non-final method, we can just use mockito
    when(sessionMgr.getActiveSessionNumbers()).thenReturn(10);
    
    // Mock ServerName.getFullName(), otherwise Encoder.encode will throw exception if the json contains null value
    mockStatic(ServerName.class);
    when(ServerName.getFullName()).thenReturn("DocsServer1");
    
 // Mock calling method, and don't care about the parameters when calling
    RequestDispatcher dispatcher = mock(RequestDispatcher.class);
    when(request.getRequestDispatcher(Mockito.anyString())).thenReturn(dispatcher);
    
    when(request.getServletPath()).thenReturn("/app/doc");
    when(request.getPathInfo()).thenReturn("/concord.storage/Untitled Draft4.xlsx/edit/content");
    UserBean user = mock(UserBean.class);
    
    // The following three have the same effect
//    when(request.getAttribute(IAuthenticationAdapter.REQUEST_USER)).thenReturn(user);
//    doReturn(user).when(request.getAttribute(IAuthenticationAdapter.REQUEST_USER));
    doReturn(user).when(request).getAttribute(IAuthenticationAdapter.REQUEST_USER);
    
    try
    {
      // ServiceUtil has initialize static method also need to be mocked, because it has dependency
      // not all the static method need be mocked
      ConcordConfig config = mock(ConcordConfig.class);
      mockStatic(ConcordConfig.class);
      when(ConcordConfig.getInstance()).thenReturn(config);
      when(config.isCookiesEnforceSecure()).thenReturn(false);
      
      mockStatic(ServiceUtil.class);
      when(ServiceUtil.checkServingSrv(request, response, "rep", "uri")).thenReturn(ServiceUtil.SERVING_STATUS_SUCCESS);
    }
    catch (IOException e1)
    {
      e1.printStackTrace();
    }
    
    // Mock exception
    try
    {
      // Throw exception with specific params, which should be consistent with request.getPath
      // if not consistent, it will not be mocked, but call real method
      mockStatic(DocumentEntryUtil.class);
      // Does not work because of params inconsistent
//      when(DocumentEntryUtil.getEntry(user, "rep", "uri", false)).thenThrow(RepositoryAccessException.class);
      // So we need customized parameter matcher to match any value of that type
      // Limitation, all the params should be any
      when(DocumentEntryUtil.getEntry(Matchers.any(UserBean.class), Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean())).thenThrow(new RepositoryAccessException("test"));
      // stub static method to throw Exception
//      doThrow(new RepositoryAccessException("test")).when(DocumentEntryUtil.class);
//      DocumentEntryUtil.getEntry(user, "rep", "uri", false);
    }
    // The Exception will never throw here, because the method has not been called in "when"
    catch (RepositoryAccessException e)
    {
      e.printStackTrace();
    }
    catch (DraftStorageAccessException e)
    {
      e.printStackTrace();
    }
    catch (DraftDataAccessException e)
    {
      e.printStackTrace();
    }
    
    /***** Call Method ***/
    ConcordDocServlet servlet = new ConcordDocServlet();
    // The test method is private/protected
    try
    {
      Method doGetMethod = ConcordDocServlet.class.getDeclaredMethod("doGet", HttpServletRequest.class, HttpServletResponse.class);
      doGetMethod.setAccessible(true);
      doGetMethod.invoke(servlet, request, response);
    }
    catch (NoSuchMethodException e)
    {
      e.printStackTrace();
      Assert.fail(e.getMessage());
    }
    catch (SecurityException e)
    {
      e.printStackTrace();
      Assert.fail(e.getMessage());
    }
    catch (IllegalAccessException e)
    {
      e.printStackTrace();
      Assert.fail(e.getMessage());
    }
    catch (IllegalArgumentException e)
    {
      e.printStackTrace();
      Assert.fail(e.getMessage());
    }
    catch (InvocationTargetException e)
    {
      e.printStackTrace();
      Assert.fail(e.getMessage());
    }
    
    /***** Verify ****/
  }
  
  // test private method, and verify private
  // test partial mock, spy
  // test constructor whenNew, verify new, attention preparefortest
  // test callRealMethod
}
