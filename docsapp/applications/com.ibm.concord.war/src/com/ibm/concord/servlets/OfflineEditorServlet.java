package com.ibm.concord.servlets;

import java.io.IOException;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.util.LimitsUtil;
import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.entitlement.Entitlement;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.entitlement.gatekeeper.IGateKeeperService;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * Servlet implementation class EditorTemplate
 */
public class OfflineEditorServlet extends HttpServlet
{
  private static final long serialVersionUID = 1L;

  private static final String TEMPLATE_TYPE_PRES = "pres";

  private static final String TEMPLATE_TYPE_TEXT = "text";

  private static final String TEMPLATE_TYPE_SHEET = "sheet";

  private static final Logger LOG = Logger.getLogger(OfflineEditorServlet.class.getName());

  class OfflineDocEntry extends AbstractDocumentEntry
  {
    String title;

    String repository;

    String docUri;

    public String getTitle()
    {
      return title;
    }

    public String getRepository()
    {
      return repository;
    }

    @Override
    public String getDocUri()
    {
      return docUri;
    }

  }

  class OfflineTextDocumentEntry extends OfflineDocEntry
  {

  }

  /**
   * @see HttpServlet#HttpServlet()
   */
  public OfflineEditorServlet()
  {
    super();
    // TODO Auto-generated constructor stub
  }

  /**
   * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    String type = request.getParameter("type");
    renderEditorTemplate(request, response, type);

  }

  private void renderEditorTemplate(HttpServletRequest request, HttpServletResponse response, String type) throws ServletException,
      IOException
  {
    if (type == null || type.length() == 0)
      type = TEMPLATE_TYPE_PRES;

    request.setAttribute("doc_mode", "edit");
    request.setAttribute("template", true);

    packageEntitlements(request, response);

    JSONObject multitenancyConfig = Platform.getConcordConfig().getSubConfig("multitenancy");
    if (multitenancyConfig != null)
    {
      request.setAttribute("mt_enabled", Boolean.valueOf((String) multitenancyConfig.get("enablement")));
    }
    else
    {
      request.setAttribute("mt_enabled", false);
    }

    OfflineDocEntry docEntry = new OfflineDocEntry();

    docEntry.title = "'<%var(title)%>'";
    docEntry.repository = "<%var(repo)%>";// "concord.storage" or "lcfiles"
    docEntry.docUri = "<%var(uuid)%>";// "s2.odp" or "nt.odt"
    request.setAttribute("doc_entry", docEntry);
    request.setAttribute("login_retry", false);
    request.setAttribute("mobileOfflineMode", true);
    if (TEMPLATE_TYPE_PRES.equals(type))
    {
      renderPresEditorTemplate(request, response);
    }
    else if (TEMPLATE_TYPE_TEXT.equals(type))
    {
      renderTextEditorTemplate(request, response);
    }

  }

  private void packageEntitlements(HttpServletRequest request, HttpServletResponse response)
  {
    try
    {
      UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
      IEntitlementService service = (IEntitlementService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(
          IEntitlementService.class);
      Map<String, Entitlement> entitlements = service.getEntitlements(user);
      if (entitlements != null)
      {
        Iterator<Entitlement> iterator = entitlements.values().iterator();
        JSONArray entitleArray = new JSONArray();
        while (iterator.hasNext())
        {
          Entitlement entitle = iterator.next();
          entitleArray.add(entitle.toJson());
        }
        request.setAttribute("IBMDocs_Entitlements", entitleArray);
      }
      IGateKeeperService gkService = (IGateKeeperService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(
          IGateKeeperService.class);
      JSONObject features = gkService.getUserFeatures(user);
      if (features != null)
      {
        request.setAttribute("IBMDocs_GateKeeper", features);
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exception happens while getting the entitlements information for current user.", ex);
    }
  }

  private void renderTextEditorTemplate(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    request.setAttribute("doc_type", TEMPLATE_TYPE_TEXT);
    // Set the size limit into the request.
    IDocumentService docSrv = DocumentServiceUtil.getDocumentService(Platform.getMimeType(".odt"));
    request.setAttribute("doc_size_limit",
        LimitsUtil.getShownSizeLimit((JSONObject) docSrv.getConfig().get("limits"), Platform.getMimeType(".odt")));

    request.getRequestDispatcher("/WEB-INF/pages/apptext.jsp").forward(request, response);
  }

  private void renderPresEditorTemplate(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {

    request.setAttribute("doc_type", TEMPLATE_TYPE_PRES);

    packageEntitlements(request, response);

    // Set the size limit into the request.
    IDocumentService docSrv = DocumentServiceUtil.getDocumentService(Platform.getMimeType(".odp"));
    request.setAttribute("doc_size_limit",
        LimitsUtil.getShownSizeLimit((JSONObject) docSrv.getConfig().get("limits"), Platform.getMimeType(".odp")));

    request.getRequestDispatcher("/WEB-INF/pages/apppres.jsp").forward(request, response);
  }

  /**
   * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {

  }

}
