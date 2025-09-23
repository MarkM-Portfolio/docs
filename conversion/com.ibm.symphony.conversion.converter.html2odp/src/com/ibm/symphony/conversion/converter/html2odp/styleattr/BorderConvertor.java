/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.styleattr;

import java.util.Map;
import java.util.StringTokenizer;

import org.odftoolkit.odfdom.doc.style.OdfStyle;

import com.ibm.symphony.conversion.converter.html2odp.style.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class BorderConvertor extends GeneralPropertyConvertor {
    
    public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
    {
      
        String convBorderStyle = value;
        convBorderStyle = CSSUtil.convertRGBValues(convBorderStyle);
        convBorderStyle = convertBorderWidth(convBorderStyle).trim();
        
        super.convert(context, style, htmlStyle, name, convBorderStyle);
    }
    
    private String convertBorderWidth(String value)
    {
        StringTokenizer st = new StringTokenizer(value," ");
        StringBuilder sb = new StringBuilder(16);
        while(st.hasMoreTokens())
        {
            String temp = st.nextToken();
            temp = CSSUtil.convertBorderValue(temp);
            sb.append(temp);
            sb.append(" ");
        }
        return sb.toString();
    }
}

