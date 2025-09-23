/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.beans;

import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

/*
 * Parameters Bean for function importDocument
 *    Replaces the old JSONObject parameter
 * 
 */
public class ImportDocumentContext {
    
    public boolean upgradeConvert = false;
    
    public boolean uploadConvert = false;
    
    public boolean backgroundConvert = false;
    
    public String uploadConvertID = null;
    
    public boolean getSnapshot = false;
    
    public boolean isAdminUser = false;

    public String backgroundConvertSource = null;
    
    public String backgroundConvertTarget = null;
    
    public JSONObject backgroundConvertResult = null;
    
    public String password = null;
    
}
