/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright IBM Corp. 2006, 2012                                    */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* @author Michael Ahern                                             */
/* ***************************************************************** */

dojo.provide("concord.widgets.typeahead.url");
dojo.require("concord.widgets.typeahead.util.Url");
/**
    Use concord.widgets.typeahead.url.parse() to break a URL into component parts.  Use concord.widgets.typeahead.url.write() to
    take those component parts and write them to a valid URL.  Use concord.widgets.typeahead.url.rewrite() to take
    a URL and quickly add or update query parameters.
    
    The component parts returned by parse() are:
        uri
        scheme
        authority
        path
        query
        queryParameters
            A map of string keys and either string values or string array values.  Takes precedence
            over .query during write()
        fragment
        authority
        user
        password
        host
        port
            Can be empty, null, or a string value.  This value will NOT be normalized

    ProxyUrlHelper is a helper class that determines if the
        var proxyURL = "http://ahernmt60:9080/profiles/ajax.proxy"; 
        var ph = new concord.widgets.typeahead.url.ProxyUrlHelper(proxyURL);
        
        ph.getProxifiedURL("http://ahernmt60:9080/communities/foobar.html")
            = "http://ahernmt60:9080/communtties/foobar.html"
        ph.getProxifiedURL("https://ahernmt60:9443/profiles/foo.html")
            = "http://ahernmt60:9080/profiles/ajaxProxy/https/ahernmt60%3A9443/profiles/foo.html"
 **/

concord.widgets.typeahead.url._const = {
    regex: /(^[a-zA-Z]+)\:\/\/([a-zA-Z\d][\a-z\A-Z\d\-\.]*)(:\d{1,5})?([\/\?\#].*)?/,
    protocolPorts: { "http": 80, "https": 443 }
};

concord.widgets.typeahead.url.parse = function(uri, uri2) {
   var l = arguments.length, u = null;
   
   if (!uri) {
       return null;
   } 
   else if ((typeof uri != "string" && console.trace) ||
            (uri2 && typeof uri2 != "string" && console.trace)) {
       throw "Arguments for URI must be a string";
   }
   
   uri = new dojo._Url(uri, uri2);
      
   uri.queryParameters = concord.widgets.typeahead.url.getRequestParameters(uri);
   return uri;
};
concord.widgets.typeahead.url.write = function(obj) {
   if (!obj)
      return null;
   var uri = "";
   if(obj.scheme)
      uri += obj.scheme + ":";
      
   if(obj.authority)
      uri += "//" + obj.authority;
      
   uri += obj.path;
   if(obj.queryParameters)
      uri += concord.widgets.typeahead.url.writeParameters(obj.queryParameters);
   else if(obj.query)
      uri += ((obj.query.charAt(0) != "?") ? "?" : "") + obj.query;
   if(obj.fragment)
      uri += "#" + obj.fragment;
    
   return uri;
}
dojo._Url.prototype.toCanonicalString = function() {
   return concord.widgets.typeahead.url.write(this);
}

concord.widgets.typeahead.url.rewrite = function(url,p) {
   if (url && p) {
      url = concord.widgets.typeahead.url.parse(url);
      dojo.mixin(url.queryParameters,p);
      url = concord.widgets.typeahead.url.write(url);
   }
   return url;
}

concord.widgets.typeahead.url.splitQuery = function(query) {
   var params = {};
   if (!query)
      return params;
   if (query.charAt(0) == "?")
      query = query.substring(1);

   var args = query.split("&");
   for (var i=0; i<args.length; i++)
      if (args[i].length > 0) {
         var separator = args[i].indexOf("=");
         if (separator == -1) {
            var key = decodeURIComponent(args[i]);
            var existing = params[key];
            if (dojo.isArray(existing))
               existing.push("");
            else if (existing)
               params[key] = [existing,""];
            else
               params[key] = "";
         } else if (separator > 0) {
            var key = decodeURIComponent(args[i].substring(0, separator));
            var value = decodeURIComponent(args[i].substring(separator+1));
            var existing = params[key];
            if (dojo.isArray(existing))
               existing.push(value);
            else if (existing)
               params[key] = [existing,value];
            else
               params[key] = value;
         }
      }
   return params;
};

concord.widgets.typeahead.url.getRequestParameters = function(uri) {
   if (!uri)
      return {};
   if (typeof uri == "string")
      uri = new dojo._Url(uri);
   return concord.widgets.typeahead.url.splitQuery(uri.query);
};

concord.widgets.typeahead.url.writeParameters = function(map) {
   var out = [];
   for (var key in map) {
      var values = map[key];
      if (typeof values != "undefined" && values != null) {
         key = encodeURIComponent(key);
         if (dojo.isArray(values)) {
            for (var i=0; i<values.length; i++)
               if (values[i]) {
                  out.push(out.length==0 ? "?" : "&");
                  out.push(key);
                  out.push("=");
                  out.push(encodeURIComponent(values[i]));
               }
         } else {
            out.push(out.length==0 ? "?" : "&");
            out.push(key);
            out.push("=");
            out.push(encodeURIComponent(values));
         }
      }
   }
   return out.join("");
};

/**
 * Using the passed service ref config object, utilize scheme detection and
 * create an appropriate <code>com.ibm.oneui.util.Url</code> object.
 * 
 * Example Usage:
 *  <code>concord.widgets.typeahead.url.getServiceUrl(concord.widgets.typeahead.config.services['cre'])</code>
 * 
 * @param <code>concord.widgets.typeahead.config.services[i]</code> object.
 * @return <code>com.ibm.oneui.util.Url</code> Object for the given service
 *         name. If the service config is <code>null</code> OR neither the
 *         HTTP or HTTPS urls are enabled, the method will return
 *         <code>null<code>.
 */
concord.widgets.typeahead.url.getServiceUrl = function(svcRefConfig) {
    var com_ibm_oneui_util_Url = concord.widgets.typeahead.util.Url,
         svcUrl = null;
    
    /* guard that the service and end points are available */
    if (!svcRefConfig) {
        return null;
    } 
    /* handle secure URL desired case */
    else if (com_ibm_oneui_util_Url.secure) {
        if (svcRefConfig.secureEnabled) {
            svcUrl = svcRefConfig.secureUrl;
        } else if (svcRefConfig.url) {
            svcUrl = svcRefConfig.url;
        } else {
            return null;
        }
    } 
    /* handle unsecure URL desired case */
    else {
        if (svcRefConfig.url) {
            svcUrl = svcRefConfig.url;
        } else if (svcRefConfig.secureEnabled) {
            svcUrl = svcRefConfig.secureUrl;
        } else {
            return null;
        }
    }
    
    return new com_ibm_oneui_util_Url(svcUrl);
};

/**
 * Ensures that a URL string is fully qualified filling out the details using
 * <code>dojo.global.location</code>. This implementation did not take
 * particular pains in its implementation for error checking, it is intended to
 * parse 'friendly' input. The primary motivator is to provide a means to
 * qualify the URLs from the oneui.proxy.proxify() method to allow them to be
 * fed to the url.parse()
 * 
 * @memberOf concord.widgets.typeahead.url
 * @name ensureQualified
 * @function
 * @param urlStr
 *            A URL string to qualify.
 * @returns {String} A fully qualified url String.
 */
concord.widgets.typeahead.url.ensureQualified = function(urlStr) {
    if (!urlStr) 
        throw "Null URL is not permitted";
    
    return new dojo._Url(dojo.global.location.toString(), urlStr).toString();
};

