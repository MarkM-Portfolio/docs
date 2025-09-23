package com.ibm.concord.services;

import java.io.FileWriter;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.util.Constant;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.ImportDocumentContext;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONObject;

public class NewImportDocumentTest extends HttpServlet {
    
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
        IDocumentEntry docEntry = null;
        String repoId = "concord.storage";
        String uri = "Untitled Draft1.docx";
        
        UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
        //System.out.println(user.toJSON().toString());
        //UserBean user = new UserBean("E66028A9-2177-DF19-8525-77D60072EFA1", "ibm", null, null);
        /*
        user.setProperty("role_id", "0");
        user.setProperty("dn", "test1@cn.ibm.com");
        user.setProperty("photo", "\\/docs\\/images\\/NoPhoto_Person_48.png");
        user.setProperty("entitlement", "FULL");
        user.setProperty("role_name", "administrator");
        user.setProperty("email", "test1@cn.ibm.com");
        user.setProperty("disp_name", "test1");
        System.out.println(user.toJSON().toString());
        */
        try {
            docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, false);
        }
        catch (RepositoryAccessException e) {
            e.printStackTrace();
        }
        catch (DraftStorageAccessException e) {
            e.printStackTrace();
        }
        catch (DraftDataAccessException e) {
            e.printStackTrace();
        }
        
        if (null != docEntry) {
            IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services").getService(IDocumentServiceProvider.class);
            IDocumentService docService = serviceProvider.getDocumentService(docEntry.getMimeType());
            
            int testCase = 1;
            
            /*
             * paramlist:
             * 
             * upgrade
             * upload
             * snapshot
             * convertid
             * password
             * background
             * isadmin
             */
            
            /*
             * case 1/2
             * upload = t
             * convertid =
             * background = t
             */
            JSONObject parameters = new JSONObject();
            ImportDocumentContext parametersBean = new ImportDocumentContext();
            
            parameters.put(Constant.KEY_UPLOAD_CONVERT, "true");
            parameters.put(Constant.KEY_UPLOAD_CONVERT_ID, String.valueOf(testCase++));
            parameters.put(Constant.KEY_BACKGROUND_CONVERT, "true");
            
            parametersBean.uploadConvert = (true);
            parametersBean.uploadConvertID = (String.valueOf(testCase++));
            parametersBean.backgroundConvert = (true);
            
            // removed importDocumentOld, so dont call this function again
            try {
                //docService.importDocumentOld(user, docEntry, parameters);
            }
            catch (Exception e11) {
                e11.printStackTrace();
            } // 1
            
            try {
                docService.importDocument(user, docEntry, parametersBean);
            }
            catch (Exception e10) {
                e10.printStackTrace();
            } // 2
            
            parameters.clear();
            
            /*
             * case 3/4/5/6
             * upload = t
             * convertid =
             * isadmin = t/f
             */
            parameters.put(Constant.KEY_UPLOAD_CONVERT, "true");
            parameters.put(Constant.KEY_UPLOAD_CONVERT_ID, String.valueOf(testCase++));
            parameters.put(Constant.KEY_UPLOAD_CONVERT_IS_ADMIN, "true");
            
            parametersBean = new ImportDocumentContext();
            parametersBean.uploadConvert = (true);
            parametersBean.uploadConvertID = (String.valueOf(testCase++));
            parametersBean.isAdminUser = (true);
            
            try {
                //docService.importDocumentOld(user, docEntry, parameters);
            }
            catch (Exception e9) {
                e9.printStackTrace();
            } // 3
            
            try {
                docService.importDocument(user, docEntry, parametersBean);
            }
            catch (Exception e8) {
                e8.printStackTrace();
            } // 4
            
            parameters.put(Constant.KEY_UPLOAD_CONVERT_ID, String.valueOf(testCase++));
            parameters.put(Constant.KEY_UPLOAD_CONVERT_IS_ADMIN, "false");
            
            parametersBean.uploadConvertID = (String.valueOf(testCase++));
            parametersBean.isAdminUser = (false);
            
            try {
                //docService.importDocumentOld(user, docEntry, parameters);
            }
            catch (Exception e7) {
                e7.printStackTrace();
            } // 5
            
            try {
                docService.importDocument(user, docEntry, parametersBean);
            }
            catch (Exception e6) {
                e6.printStackTrace();
            } // 6
            
            parameters.clear();
            
            /*
             * case 7/8 
             * upgrade = t 
             * background = t
             */
            
            parameters.put(Constant.KEY_UPGRADE_CONVERT, "true");
            parameters.put(Constant.KEY_BACKGROUND_CONVERT, "true");
            
            parametersBean = new ImportDocumentContext();
            parametersBean.upgradeConvert = (true);
            parametersBean.backgroundConvert = (true);
            
            try {
                //docService.importDocumentOld(user, docEntry, parameters);
            }
            catch (Exception e5) {
                e5.printStackTrace();
            } // 7
            
            try {
                docService.importDocument(user, docEntry, parametersBean);
            }
            catch (Exception e4) {
                e4.printStackTrace();
            } // 8
            
            parameters.clear();
            
            /*
             * case 9/10/11/12
             * upgrade = t
             * snapshot = t/f
             * convertid =
             * password =
             */
            parameters.put(Constant.KEY_UPGRADE_CONVERT, "true");
            parameters.put("password", "passw0rd");
            
            parameters.put(Constant.KEY_GET_SNAPSHOT, "true");
            parameters.put(Constant.KEY_UPLOAD_CONVERT_ID, String.valueOf(testCase++));
            
            parametersBean = new ImportDocumentContext();
            parametersBean.upgradeConvert = (true);
            parametersBean.password = ("passw0rd");
            parametersBean.uploadConvertID = (String.valueOf(testCase++));
            parametersBean.getSnapshot = (true);
            
            try {
                //docService.importDocumentOld(user, docEntry, parameters);
            }
            catch (Exception e3) {
                e3.printStackTrace();
            } // 9
            
            parameters.put(Constant.KEY_UPLOAD_CONVERT_ID, String.valueOf(testCase++));
            try {
                docService.importDocument(user, docEntry, parametersBean);
            }
            catch (Exception e2) {
                e2.printStackTrace();
            } // 10
            
            parameters.put(Constant.KEY_GET_SNAPSHOT, "false");
            parameters.put(Constant.KEY_UPLOAD_CONVERT_ID, String.valueOf(testCase++));
            
            parametersBean.uploadConvertID = (String.valueOf(testCase++));
            parametersBean.getSnapshot = (false);
            
            try {
                //docService.importDocumentOld(user, docEntry, parameters);
            }
            catch (Exception e1) {
                e1.printStackTrace();
            } // 11
            
            try {
                docService.importDocument(user, docEntry, parametersBean);
            }
            catch (Exception e) {
                e.printStackTrace();
            } // 12
            
            parameters.clear();
            
            /*
             * case 13/14/15/16
             * upgrade = f
             * snapshot = t/f
             * convertid =
             * password =
             */
            parameters.put(Constant.KEY_UPGRADE_CONVERT, "false");
            parameters.put("password", "passw0rd");
            
            parameters.put(Constant.KEY_GET_SNAPSHOT, "true");
            parameters.put(Constant.KEY_UPLOAD_CONVERT_ID, String.valueOf(testCase++));
            
            parametersBean = new ImportDocumentContext();
            parametersBean.password = ("passw0rd");
            parametersBean.uploadConvertID = (String.valueOf(testCase++));
            parametersBean.getSnapshot = (true);
            
            try {
                //docService.importDocumentOld(user, docEntry, parameters);
            }
            catch (Exception e3) {
                e3.printStackTrace();
            } // 13
            
            try {
                docService.importDocument(user, docEntry, parametersBean);
            }
            catch (Exception e2) {
                e2.printStackTrace();
            } // 14
            
            parameters.put(Constant.KEY_GET_SNAPSHOT, "false");
            parameters.put(Constant.KEY_UPLOAD_CONVERT_ID, String.valueOf(testCase++));
            
            parametersBean.uploadConvertID = (String.valueOf(testCase++));
            parametersBean.getSnapshot = (false);
            
            try {
                //docService.importDocumentOld(user, docEntry, parameters);
            }
            catch (Exception e1) {
                e1.printStackTrace();
            } // 15
            
            try {
                docService.importDocument(user, docEntry, parametersBean);
            }
            catch (Exception e) {
                e.printStackTrace();
            } // 16
            
            parameters.clear();
            
        }
        
    }
    
}
