/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet;

import java.io.IOException;

public abstract class Properties {
    static java.util.Properties p = null;

    static {
        p = new java.util.Properties();
        try {
            p.load(Properties.class.getClassLoader().getResourceAsStream("common.properties"));
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    public static String getProperty(String key, String defaultValue) {
        return p.getProperty(key, defaultValue);
    }

}
