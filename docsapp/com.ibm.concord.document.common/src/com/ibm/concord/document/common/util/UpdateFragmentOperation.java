/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.util;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.json.java.JSONObject;

public class UpdateFragmentOperation extends Operation
{

  private String fragId = null;
  private String content = null;
  
  final private static String DATA = "data";
  final private static String FRAGID = "fragId";
  
  @Override
  public void apply(Tidy tidy, Document dom) throws Exception
  {
    int sInx = content.indexOf("<body");
    int eInx = content.indexOf("</body>");
    sInx = content.indexOf('>', sInx);
    String body = content.substring(sInx + 1, eInx);

    Element e = dom.getDocumentElement();
    Map<String, Object> updateLists = new HashMap<String, Object>();
    List<Element> elements = XHTMLDomUtil.getElementsbyClass(e, "reference");
    // insert new node
    for (int i = 0; i < elements.size(); i++)
    {
      Element element = elements.get(i);
      String frag_id = element.getAttribute("frag_id");
      if (frag_id != null && frag_id.equalsIgnoreCase(fragId))
      {
        List<Node> lists = XHTMLDomUtil.getElements(element, "ol", null);
        lists.addAll(XHTMLDomUtil.getElements(element, "ul", null));
        Iterator<Node> it = lists.iterator();
        while (it.hasNext())
        {
          Node list = it.next();
          if (!list.getParentNode().getNodeName().equalsIgnoreCase("li"))
          {
            // we get a list which located in task in master document, and it will be replaced by private document, so we need to record it and update it later
            String listclass = ListUtil.getListClass(list);
            if (!updateLists.containsKey(listclass))
            {
              Map<String, Object> info = ListUtil.getWholeListInfo(list);
              updateLists.put(listclass, info);
            }
          }
        }
        
        // do the replace job in following code
        Element newElement = XHTMLDomUtil.parseString(tidy, body, true);
        // remove old child in reference node
        while (element.hasChildNodes()){
          element.removeChild(element.getFirstChild());
        }
        // remove frag_id attribute
        element.setAttribute("frag_id", "");
        Node clone = null;
        Node child = newElement.getFirstChild();
        while (child != null)
        {
          clone = child.cloneNode(true);
          element.appendChild(clone);
          child = child.getNextSibling();
        }
        
        // now we try to update the lists
        Iterator<Entry<String, Object>> iter = updateLists.entrySet().iterator();
        while (iter.hasNext())
        {
          Map.Entry<String, Object> entry = (Map.Entry<String, Object>) iter.next();
          String listclass = entry.getKey();
          Map<String, Object> info = (Map<String, Object>) entry.getValue();
          int currentIndex = ((Integer)info.get("currentIndex")).intValue();
          Element updateList = null;
          Element header = (Element) info.get("header");
          if (currentIndex == 0) // currentIndex == 0 means the header is located in task and have been modified(may be removed), so need to find new header
          {
            List<Node> temp = XHTMLDomUtil.getElements(element, header.getNodeName(), listclass);
            if (!temp.isEmpty()) {
              //thanks Godness, private push the header back
              updateList = (Element) temp.get(0);
            } else {
              //bad luck, the header is removed in private document, try to find there is any continue ol/ol remain in master document.
              List<Node> ls = (List<Node>) info.get("lists");
              Iterator<Node> lsit = ls.iterator();
              while (lsit.hasNext())
              {
                Node l = lsit.next();
                if (l.getOwnerDocument() != null)
                {
                  // find a survival, let it be header 
                  updateList = (Element) l;
                  break;
                }
              }
            }
          } else { // currentIndex != 0, so our header will not be modified in this case, let's update it directly.
            updateList = header;
          }
          if (updateList != null)
          {
            updateList.setAttribute("types", (String)info.get("outline"));
            XHTMLDomUtil.removeClass(updateList, "continue");
            ListUtil.updateListValue(updateList, null, false);
          }
        }
      }
    }
  }

  @Override
  public boolean read(JSONObject update)
  {
    if (Operation.UPDATE_FRAGMENT.equals(update.get(TYPE).toString()))
    {
      this.setContent((String) update.get(DATA));
      this.setFragId((String) update.get(FRAGID));
      this.setType(Operation.UPDATE_FRAGMENT);
      if ((fragId != null) && (content != null))
        return true;
    }
    return false;
  }

  @Override
  public JSONObject write()
  {
    JSONObject ob = new JSONObject();
    ob.put(TYPE, Operation.UPDATE_FRAGMENT);
    ob.put(DATA, getContent());
    ob.put(FRAGID, getFragId());
    return ob;
  }

  public String getFragId()
  {
    return fragId;
  }

  public void setFragId(String fragId)
  {
    this.fragId = fragId;
  }

  public String getContent()
  {
    return content;
  }

  public void setContent(String content)
  {
    this.content = content;
  }

}
