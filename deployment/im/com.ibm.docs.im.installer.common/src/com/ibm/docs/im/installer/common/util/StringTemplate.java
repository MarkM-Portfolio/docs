/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2015.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */

package com.ibm.docs.im.installer.common.util;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class StringTemplate {
    final private String template;
    final private Matcher m;
    static final private Pattern keyPattern = 
        Pattern.compile("\\$\\{([a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*)*)\\}");
    private boolean blanknull=false;

    public StringTemplate(String template) { 
        this.template=template;
        this.m = keyPattern.matcher(template);
    }

    /**
     * @param map substitution map
     * @return substituted string
     */
    public String substitute(Map<String, ? extends Object> map)
    {
        this.m.reset();
        StringBuffer sb = new StringBuffer();
        while (this.m.find())
        {
            String k0 = this.m.group();
            String k = this.m.group(1);
            Object vobj = map.get(k);
            String v = (vobj == null) 
                ? (this.blanknull ? "" : k0)
                : vobj.toString();
            this.m.appendReplacement(sb, Matcher.quoteReplacement(v));
        }
        this.m.appendTail(sb);
        return sb.toString();       
    }

    public StringTemplate setBlankNull()
    {
        this.blanknull=true;
        return this;
    } 
}