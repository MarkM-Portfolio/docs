/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.proxy.lotuslive.saml.filter;

import java.io.FileInputStream;
import java.io.Reader;
import java.io.CharArrayReader;
import java.io.UnsupportedEncodingException;
import java.security.KeyStore;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.XMLConstants;
import javax.xml.namespace.NamespaceContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;

import org.joda.time.DateTime;
import org.opensaml.DefaultBootstrap;
import org.opensaml.Configuration;
import org.opensaml.saml1.core.Assertion;
import org.opensaml.security.SAMLSignatureProfileValidator;
import org.opensaml.xml.ConfigurationException;
import org.opensaml.xml.io.Unmarshaller;
import org.opensaml.xml.io.UnmarshallerFactory;
import org.opensaml.xml.security.x509.BasicX509Credential;
import org.opensaml.xml.signature.Signature;
import org.opensaml.xml.signature.SignatureValidator;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import com.ibm.ws.ffdc.FFDCFilter;
import com.ibm.ws.util.Base64;

public class OpenSAML
{
  private static Logger logger = Logger.getLogger(OpenSAML.class.getName());

  private static boolean bootstrap = false;

  static final String SAMLResponse = "SAMLResponse";

  static final String SAMLTarget = "TARGET";

  public OpenSAML()
  {
    try
    {
      if (bootstrap == false)
      {
        DefaultBootstrap.bootstrap();
        bootstrap = true;
      }
    }
    catch (ConfigurationException e)
    {
      e.printStackTrace();
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  public KeyStore getKeyStore(String path, String password)
  {
    KeyStore ks = null;
    try
    {
      ks = KeyStore.getInstance(KeyStore.getDefaultType());
      char[] passwd = password.toCharArray();
      FileInputStream fis = new FileInputStream(path);
      ks.load(fis, passwd);
      fis.close();
    }
    catch (Exception e)
    {
      if (logger != null)
      {
        logger.log(Level.SEVERE, "OpenSAML - getKeyStore - path:[" + path + "]", e);
      }
      FFDCFilter.processException(e, "OpenSAML - getKeyStore - path:[" + path + "]", "");

      ks = null;
    }
    return ks;
  }

  public X509Certificate getCertificate(KeyStore ks, String keyname, String password)
  {
    X509Certificate certificate = null;
    try
    {
//      Object obj = ks.getEntry(keyname, new KeyStore.PasswordProtection(password.toCharArray()));
//      if (obj instanceof KeyStore.PrivateKeyEntry)
//      {
//        KeyStore.PrivateKeyEntry tcEntry = (KeyStore.PrivateKeyEntry) ks.getEntry(keyname,
//            new KeyStore.PasswordProtection(password.toCharArray()));
//        certificate = (X509Certificate) tcEntry.getCertificate();
//      }
//      else if (obj instanceof KeyStore.TrustedCertificateEntry)
//      {
//        KeyStore.TrustedCertificateEntry tcEntry = (KeyStore.TrustedCertificateEntry) ks.getEntry(keyname,
//            new KeyStore.PasswordProtection(password.toCharArray()));
//        certificate = (X509Certificate) tcEntry.getTrustedCertificate();
//      }
      Object obj = ks.getEntry(keyname, null);
      if (obj instanceof KeyStore.PrivateKeyEntry)
      {
        KeyStore.PrivateKeyEntry tcEntry = (KeyStore.PrivateKeyEntry) obj;
        certificate = (X509Certificate) tcEntry.getCertificate();
      }
      else if (obj instanceof KeyStore.TrustedCertificateEntry)
      {
        KeyStore.TrustedCertificateEntry tcEntry = (KeyStore.TrustedCertificateEntry) obj;
        certificate = (X509Certificate) tcEntry.getTrustedCertificate();
      }
    }
    catch (Exception e)
    {
      if (logger != null)
      {
        logger.log(Level.SEVERE, "OpenSAML - getCertificate: ", e);
      }
      FFDCFilter.processException(e, "OpenSAML - getCertificate: ", "");
      certificate = null;
    }
    return certificate;
  }

  public boolean verifyAssertion(X509Certificate certificate, String base64, HashMap attrMap, HashMap status)
  {
    boolean signatureStatus = false;
    boolean validityStatus = false;
    boolean assertionStatus = false;

    String xml = null;
    try
    {
      byte[] decodedBytes = Base64.decode(base64);
      xml = new String(decodedBytes, "UTF-8");
    }
    catch (UnsupportedEncodingException e)
    {

    }

    if (certificate != null && xml != null)
    {
      try
      {
        DocumentBuilderFactory docfactory = DocumentBuilderFactory.newInstance();
        docfactory.setNamespaceAware(true); // never forget this!
        DocumentBuilder builder = docfactory.newDocumentBuilder();
        Reader reader = new CharArrayReader(xml.toCharArray());
        Document doc = builder.parse(new InputSource(reader));

        assertionStatus = checkAssertionStatus(doc);

        XPathFactory factory = XPathFactory.newInstance();
        XPath xpath = factory.newXPath();
        xpath.setNamespaceContext(new NSContext());
        XPathExpression xpathExpr = xpath.compile("//saml:Assertion");
        NodeList result = (NodeList) xpathExpr.evaluate(doc, XPathConstants.NODESET);
        if (result.getLength() == 0)
        {
          throw new RuntimeException("assertion not found");
        }
        else
        {
          int length = result.getLength();
          getAssertionAttributes(doc, attrMap);
          for (int i = 0; i < length; i++)
          {
            Element assertionElement = (Element) result.item(i);
            UnmarshallerFactory unmarshallerFactory = Configuration.getUnmarshallerFactory();
            Unmarshaller unmarshaller = unmarshallerFactory.getUnmarshaller(assertionElement);
            Assertion samlAssertion = (Assertion) unmarshaller.unmarshall(assertionElement);
            validityStatus = checkAssertionValidity(samlAssertion);
            samlAssertion.validate(true);
            Signature signature = samlAssertion.getSignature();
            SAMLSignatureProfileValidator pv = new SAMLSignatureProfileValidator();
            pv.validate(signature);

            BasicX509Credential credential = new BasicX509Credential();
            credential.setEntityCertificate(certificate);
            SignatureValidator sigValidator = new SignatureValidator(credential);
            sigValidator.validate(signature);
          }
          signatureStatus = true;
        }

      }
      catch (Exception e)
      {
        if (logger != null)
        {
          logger.log(Level.SEVERE, "OpenSAML - verifyAssertion: xml:[" + xml + "]", e);
        }
        FFDCFilter.processException(e, "OpenSAML - verifyAssertion: xml:[" + xml + "]", "");
      }
    }

    status.put("assertionStatus", String.valueOf(assertionStatus));
    status.put("validityStatus", String.valueOf(validityStatus));
    status.put("signatureStatus", String.valueOf(signatureStatus));

    if (signatureStatus && validityStatus && assertionStatus)
    {
      return true;
    }
    return false;
  }

  private boolean checkAssertionValidity(Assertion samlAssertion)
  {
    DateTime notBefore = samlAssertion.getConditions().getNotBefore();
    DateTime notOnOrAfter = samlAssertion.getConditions().getNotOnOrAfter();
    boolean status = false;
    if (notBefore != null && notOnOrAfter != null)
    {
      if (notBefore.isBeforeNow() && notOnOrAfter.isAfterNow())
      {
        status = true;
      }
    }
    return status;
  }

  private boolean checkAssertionStatus(Document doc)
  {
    String nodeName = "samlp:StatusCode";
    String attrKey = "attributes";
    String attrName = "Value";
    String successResult = "samlp:Success";
    boolean status = false;
    NodeList nodeList = (NodeList) doc.getElementsByTagName(nodeName);
    if (nodeList.getLength() > 0)
    {
      HashMap resultMap = parseNode(nodeList.item(0));
      if (resultMap.containsKey(attrKey))
      {
        HashMap attributesMap = (HashMap) resultMap.get(attrKey);
        if (attributesMap.containsKey(attrName))
        {
          String value = (String) attributesMap.get(attrName);
          if (value.compareTo(successResult) == 0)
          {
            status = true;
          }
        }
      }
    }
    return status;
  }

  private void getAssertionAttributes(Document doc, HashMap map)
  {

    String nodeName = "saml:Attribute";
    String attrKey = "attributes";
    String attrName = "AttributeName";
    String childKey = "child";
    String valueKey = "value";
    NodeList nodeList = (NodeList) doc.getElementsByTagName(nodeName);
    if (nodeList.getLength() > 0)
    {
      ArrayList result = parseNodeList(nodeList);
      Iterator iter = result.iterator();
      while (iter.hasNext())
      {
        HashMap node = (HashMap) iter.next();
        String key = "";
        String value = "";
        if (node.containsKey(attrKey))
        {

          HashMap attributesMap = (HashMap) node.get(attrKey);
          if (attributesMap.containsKey(attrName))
          {
            key = (String) attributesMap.get(attrName);
          }
        }
        if (node.containsKey(childKey))
        {
          ArrayList childList = (ArrayList) node.get(childKey);
          Iterator childIter = childList.iterator();
          while (childIter.hasNext())
          {
            HashMap child = (HashMap) childIter.next();
            if (child.containsKey(childKey))
            {
              ArrayList childList1 = (ArrayList) child.get(childKey);
              Iterator childIter1 = childList1.iterator();
              while (childIter1.hasNext())
              {
                HashMap valueMap = (HashMap) childIter1.next();
                if (valueMap.containsKey(valueKey))
                {
                  if (value.compareTo("") == 0)
                  {
                    value = (String) valueMap.get(valueKey);
                  }
                  else
                  {
                    value += "," + (String) valueMap.get(valueKey);
                  }
                  map.put(key, value);
                }
              }
            }
          }
        }
      }
    }
  }

  private ArrayList parseNodeList(NodeList nodelist)
  {
    ArrayList list = new ArrayList();
    int count = nodelist.getLength();
    for (int i = 0; i < count; i++)
    {
      Node node = nodelist.item(i);
      HashMap map = parseNode(node);
      list.add(map);
    }
    return list;
  }

  private HashMap parseNode(Node node)
  {
    HashMap map = new HashMap();
    map.put("name", node.getNodeName());
    map.put("value", node.getNodeValue());
    if (node.hasAttributes())
    {
      HashMap attrList = new HashMap();
      NamedNodeMap attrMap = node.getAttributes();
      int attr_count = attrMap.getLength();
      for (int i = 0; i < attr_count; i++)
      {
        Node attrNode = attrMap.item(i);
        attrList.put(attrNode.getNodeName(), attrNode.getNodeValue());
      }
      map.put("attributes", attrList);
    }
    if (node.hasChildNodes())
    {
      ArrayList childList = new ArrayList();
      map.put("child", childList);
      NodeList childNodes = node.getChildNodes();
      int child_count = childNodes.getLength();
      for (int i = 0; i < child_count; i++)
      {
        Node childNode = childNodes.item(i);
        HashMap child = parseNode(childNode);
        childList.add(child);
      }
    }
    return map;
  }

  private static class NSContext implements NamespaceContext
  {
    public String getNamespaceURI(String prefix)
    {
      return prefix.equals("saml") ? "urn:oasis:names:tc:SAML:1.0:assertion" : XMLConstants.NULL_NS_URI;
    }

    public String getPrefix(String namespaceURI)
    {
      return null;
    }

    public Iterator getPrefixes(String namespaceURI)
    {
      return null;
    }
  }
}
