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

import java.util.Vector;
import java.util.logging.Logger;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;

/**
 * @author sfeiguo@cn.ibm.com
 * 
 */
public class DeleteTextOperation extends Operation {
	private int index;

	private int length;

	Vector<Node> nodeList = new Vector<Node>();

	private InsertPos insertPos = null;

	private static final Logger LOG = Logger.getLogger(DeleteTextOperation.class.getName());
	
	public InsertPos getInsertPos() {
		return insertPos;
	}

	public void setInsertPos(InsertPos insertPos) {
		this.insertPos = insertPos;
	}

	@Override
	public boolean read(JSONObject update) {
		try {
			setType(update.get(TYPE).toString());
			readAppend(update);
			setTarget(update.get(TARGET).toString());
			setIndex(Integer.parseInt(update.get(INDEX).toString()));
			setLength(Integer.parseInt(update.get(LENGTH).toString()));
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	@Override
	public void apply(Tidy tidy, Document dom) throws Exception {
		Element e = dom.getDocumentElement();
		Element target = XHTMLDomUtil.getElementbyId(e, getTarget());
	    if (target == null)
	        return;
		this.deleteText(target, index, length);
		for (int j = 0; j < nodeList.size(); j++) {
			Node p = nodeList.get(j);
			if(target.equals(p))   // Continue when removed node is the target node.
			  continue;
			p.getParentNode().removeChild(p);
		}
		target.normalize();
	}

	public void deleteText(Node node, int index, int length) {
		
		if (node.getNodeType() == Node.ELEMENT_NODE) {
		    //merge text nodes
		    XHTMLDomUtil.mergeTextNode( node );
		   
			NodeList children = node.getChildNodes();
			int childLen = children.getLength();
			if (childLen == 0) {
				nodeList.add(node);
				if (insertPos == null) {
					insertPos = new InsertPos(node.getParentNode(),
							XHTMLDomUtil.getNodeIndex(node));
				}
			}
			Node child = node.getFirstChild();
			while(child != null) {
				String pureText = XHTMLDomUtil.getPureText(child);
				int len = pureText.length();
				if (len >= index) {
					if (len >= length + index) {
						//if (index == 0 && len == length && (insertPos != null || child.getNodeType() == Node.TEXT_NODE))
						if (index == 0 && len == length)
							nodeList.add(child);
						else
							this.deleteText(child, index, length);
						return;
					} else {
						if(len==0){
							nodeList.add(child);
						}else{
							len -= index;
							if (len > 0)
							{
								if(insertPos != null || (length > len && index == 0) )
									nodeList.add(child);
								else
									this.deleteText(child, index, len);
							}
						}
						length -= len;
						index = 0;
					}
				} else
					index -= len;
				
				child = child.getNextSibling();
			}
		} else if (node.getNodeType() == Node.TEXT_NODE) {
			
			String value = node.getNodeValue();
			if (index + length > value.length()){
				String msgs = "Delete text error, index is:" + index + " length is:" + length;
				LOG.warning("==Apply delete text message error: " + msgs);
				return;
			}
			String ret = value.substring(0, index)
					+ value.substring(index + length);
			//java String.replace function doesn't support reg-expression, use replaceFirst instead.
			//Reg doesn't use '/' as start
			ret = ret.replaceFirst("^ ","\u00A0").replaceAll("  ", "\u00A0 ");
			node.setNodeValue(ret);
			if (insertPos == null) {
				insertPos = new InsertPos(node, index);
			}
		}
		
		
	}

      public int getIndex()
      {
        return index;
      }

      public void setIndex(int index)
      {
        this.index = index;
      }

      public int getLength()
      {
        return length;
      }

      public void setLength(int length)
      {
        this.length = length;
      }

  @Override
  public JSONObject write()
  {
    try {
      JSONObject update = new JSONObject();

      update.put(TYPE,getType());
      update.put(TARGET,getTarget());
      update.put(LENGTH, getLength());
      update.put(INDEX,getIndex());
      writeAppend(update);
      return update;
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    } 
  }
}

