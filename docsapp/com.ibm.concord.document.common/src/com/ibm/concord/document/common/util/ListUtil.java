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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class ListUtil
{
  private static final String LIST = "list";

  private static final String INDENT = "indent";

  public enum listType {
    A {
      @Override
      public String getNextValue(String currentValue,int interval)
      {
        // TODO Auto-generated method stub
        String ret = "";
        if (interval == 0)
        {
          ret = "A";
        } else {
    	  char[] values = currentValue.toCharArray();
          int length= values.length; 
          int tmp = 'Z'-values[0];
          char nextChar;
          length = length + interval/26;
          interval = interval%26;
          if(tmp>=interval){
            nextChar = (char)(values[0]+interval);
          }else{
            length++;
            nextChar = (char)('A' + (interval-tmp-1));
          }
         
          for (int i = 0; i < length; i++)
          {
            ret = ret + nextChar;
          }
        }
        return ret;
      }

      @Override
      public void init()
      {
        // TODO Auto-generated method stub

      }
    },
    a {
      @Override
      public String getNextValue(String currentValue,int interval)
      {
        // TODO Auto-generated method stub
        String ret = "";
        if (interval == 0)
        {
          ret = "a";
        } else {
          char[] values = currentValue.toCharArray();
          int length= values.length; 
          int tmp = 'z'-values[0];
          char nextChar;
          length = length + interval/26;
          interval = interval%26;
          if(tmp>=interval){
            nextChar = (char)(values[0]+interval);
          }else{
            length++;
            nextChar = (char)('a' + (interval-tmp-1));
          }
          for (int i = 0; i < length; i++)
          {
            ret = ret + nextChar;
          }
        }
        return ret;
      }

      @Override
      public void init()
      {
        // TODO Auto-generated method stub

      }
    },
    I {
      private String[] values = { "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI",
          "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII", "XXVIII", "XXIX", "XXX", "XXXI", "XXXII",
          "XXXIII", "XXXIV", "XXXV", "XXXVI", "XXXVII", "XXXVIII", "XXXIX", "XL", "XLI", "XLII", "XLIII", "XLIV", "XLV", "XLVI", "XLVII",
          "XLVIII", "XLIX", "L", "LI", "LII", "LIII", "LIV", "LV", "LVI", "LVII", "LVIII", "LIX", "LX", "LXI", "LXII", "LXIII", "LXIV",
          "LXV", "LXVI", "LXVII", "LXVIII", "LXIX", "LXX", "LXXI", "LXXII", "LXXIII", "LXXIV", "LXXV", "LXXVI", "LXXVII", "LXXVIII",
          "LXXIX", "LXXX", "LXXXI", "LXXXII", "LXXXIII", "LXXXIV", "LXXXV", "LXXXVI", "LXXXVII", "LXXXVIII", "LXXXIX", "XC", "XCI", "XCII",
          "XCIII", "XCIV", "XCV", "XCVI", "XCVII", "XCVIII", "XCIX", "C", "CI", "CII", "CIII", "CIV", "CV", "CVI", "CVII", "CVIII", "CIX",
          "CX", "CXI", "CXII", "CXIII", "CXIV", "CXV", "CXVI", "CXVII", "CXVIII", "CXIX", "CXX", "CXXI", "CXXII", "CXXIII", "CXXIV",
          "CXXV", "CXXVI", "CXXVII", "CXXVIII" };

      private Map<String, Integer> valuesMap = new HashMap<String, Integer>();

      private String[] singles = { "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX" };

      private String[] decades = { "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC" };

      private String[] hundreds = { "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM" };

      public void init()
      {
        for (int i = 0; i < values.length; i++)
        {
          valuesMap.put(values[i], new Integer(i));
        }
      }

      private String convertRom(int num)
      {
        int thousand = num / 1000;
        num = num % 1000;
        int hunred = num / 100;
        num = num % 100;
        int decade = num / 10;
        num = num % 10;
        String ret = "";
        if (thousand > 0)
        {
          for (int i = 0; i < thousand; i++)
          {
            ret = ret + 'M';
          }
        }
        if (hunred > 0)
        {
          ret = ret + this.hundreds[hunred - 1];
        }
        if (decade > 0)
        {
          ret = ret + this.decades[decade - 1];
        }
        if (num > 0)
        {
          ret = ret + this.singles[num - 1];
        }
        return ret;
      }

      private int convertFromRom(String romValue)
      {
        int r = 0;
        char rom[] = romValue.toLowerCase().toCharArray();
        for (int c = 0; c < rom.length; c++)
        {
          char chr = rom[c];
          char next = ' ';
          char prev = ' ';
          if (c < rom.length - 1)
            next = rom[c + 1];
          if (c > 0)
            prev = rom[c - 1];
          if (chr == 'i')
          {
            if (next == 'v')
              r += 4;
            else if (next == 'x')
              r += 9;
            else
              r += 1;
            continue;
          }
          if (chr == 'v')
          {
            if (prev != 'i')
              r += 5;
            continue;
          }
          if (chr == 'x')
          {
            if (prev != 'i')
              if (next == 'l')
                r += 40;
              else if (next == 'c')
                r += 90;
              else
                r += 10;
            continue;
          }
          if (chr == 'l')
          {
            if (prev != 'x')
              r += 50;
            continue;
          }
          if (chr == 'c')
          {
            if (prev != 'x')
              if (next == 'd')
                r += 400;
              else if (next == 'm')
                r += 900;
              else
                r += 100;
            continue;
          }
          if (chr == 'd')
          {
            if (prev != 'c')
              r += 500;
            continue;
          }
          if (chr == 'm')
          {
            if (prev != 'c')
              r += 1000;
            continue;
          }
        }
        return r;
      }

      @Override
      public String getNextValue(String currentValue,int interval )
      {
        // TODO Auto-generated method stub
        String ret = "";
        if (interval == 0)
        {
          ret = values[0];
        } else {
          Integer index = valuesMap.get(currentValue);
          int i = -1;
          if (index == null)
          {
            i = convertFromRom(currentValue);
            i = i + interval;
            ret = convertRom(i);
          } else {
            i = index;
            i = i + interval;
            if (i < values.length)
            {
              ret = values[i];
            } else {
              ret = convertRom(i);
            }
          }
        }
        return ret;
      }
    },
    i {
      private String[] values = { "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi",
          "xvii", "xviii", "xix", "xx", "xxi", "xxii", "xxiii", "xxiv", "xxv", "xxvi", "xxvii", "xxviii", "xxix", "xxx", "xxxi", "xxxii",
          "xxxiii", "xxxiv", "xxxv", "xxxvi", "xxxvii", "xxxviii", "xxxix", "xl", "xli", "xlii", "xliii", "xliv", "xlv", "xlvi", "xlvii",
          "xlviii", "xlix", "l", "li", "lii", "liii", "liv", "lv", "lvi", "lvii", "lviii", "lix", "lx", "lxi", "lxii", "lxiii", "lxiv",
          "lxv", "lxvi", "lxvii", "lxviii", "lxix", "lxx", "lxxi", "lxxii", "lxxiii", "lxxiv", "lxxv", "lxxvi", "lxxvii", "lxxviii",
          "lxxix", "lxxx", "lxxxi", "lxxxii", "lxxxiii", "lxxxiv", "lxxxv", "lxxxvi", "lxxxvii", "lxxxviii", "lxxxix", "xc", "xci", "xcii",
          "xciii", "xciv", "xcv", "xcvi", "xcvii", "xcviii", "xcix", "c", "ci", "cii", "ciii", "civ", "cv", "cvi", "cvii", "cviii", "cix",
          "cx", "cxi", "cxii", "cxiii", "cxiv", "cxv", "cxvi", "cxvii", "cxviii", "cxix", "cxx", "cxxi", "cxxii", "cxxiii", "cxxiv",
          "cxxv", "cxxvi", "cxxvii", "cxxviii" };

      private Map<String, Integer> valuesMap = new HashMap<String, Integer>();

      private String[] singles = { "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix" };

      private String[] decades = { "x", "xx", "xxx", "xl", "l", "lx", "lxx", "lxxx", "xc" };

      private String[] hundreds = { "c", "cc", "ccc", "cd", "d", "dc", "dcc", "dccc", "cm" };

      public void init()
      {
        for (int i = 0; i < values.length; i++)
        {
          valuesMap.put(values[i], new Integer(i));
        }
      }

      private String convertRom(int num)
      {
        int thousand = num / 1000;
        num = num % 1000;
        int hunred = num / 100;
        num = num % 100;
        int decade = num / 10;
        num = num % 10;
        String ret = "";
        if (thousand > 0)
        {
          for (int i = 0; i < thousand; i++)
          {
            ret = ret + 'm';
          }
        }
        if (hunred > 0)
        {
          ret = ret + this.hundreds[hunred - 1];
        }
        if (decade > 0)
        {
          ret = ret + this.decades[decade - 1];
        }
        if (num > 0)
        {
          ret = ret + this.singles[num - 1];
        }
        return ret;
      }

      private int convertFromRom(String romValue)
      {
        int r = 0;
        char rom[] = romValue.toLowerCase().toCharArray();
        for (int c = 0; c < rom.length; c++)
        {
          char chr = rom[c];
          char next = ' ';
          char prev = ' ';
          if (c < rom.length - 1)
            next = rom[c + 1];
          if (c > 0)
            prev = rom[c - 1];
          if (chr == 'i')
          {
            if (next == 'v')
              r += 4;
            else if (next == 'x')
              r += 9;
            else
              r += 1;
            continue;
          }
          if (chr == 'v')
          {
            if (prev != 'i')
              r += 5;
            continue;
          }
          if (chr == 'x')
          {
            if (prev != 'i')
              if (next == 'l')
                r += 40;
              else if (next == 'c')
                r += 90;
              else
                r += 10;
            continue;
          }
          if (chr == 'l')
          {
            if (prev != 'x')
              r += 50;
            continue;
          }
          if (chr == 'c')
          {
            if (prev != 'x')
              if (next == 'd')
                r += 400;
              else if (next == 'm')
                r += 900;
              else
                r += 100;
            continue;
          }
          if (chr == 'd')
          {
            if (prev != 'c')
              r += 500;
            continue;
          }
          if (chr == 'm')
          {
            if (prev != 'c')
              r += 1000;
            continue;
          }
        }
        return r;
      }

      @Override
      public String getNextValue(String currentValue,int interval)
      {
        // TODO Auto-generated method stub
        String ret = "";
        if (interval == 0)
        {
          ret = values[0];
        } else {
          Integer index = valuesMap.get(currentValue);
          
          int i = -1;
          if (index == null)
          {
            i = convertFromRom(currentValue);
            i= i + interval;
            ret = convertRom(i);
          } else {
            i = index;
            i = i + interval;
            if (i < values.length)
            {
              ret = values[i];
            } else {
              ret = convertRom(i);
            }
          }
        }
        return ret;
      }
    },
    N {
      @Override
      public String getNextValue(String currentValue,int interval)
      {
        // TODO Auto-generated method stub
        try
        {
          if (interval == 0)
          {
            return "1";
          } else {
            Integer i = Integer.parseInt(currentValue);
            i = i+ interval;
            return i.toString();
          }
        }
        catch (Exception e)
        {
          // TODO: handle exception
          return null;
        }
      }

      @Override
      public void init()
      {
        // TODO Auto-generated method stub

      }

    },
    J1 {
    	private String[] values = { "イ", "ロ", "ハ", "ニ", "ホ", "ヘ", "ト", "チ", "リ", "ヌ", "ル", "ヲ", "ワ", "カ", "ヨ", "タ", "レ", "ソ", "ツ", "ネ", "ナ", "ラ", "ム", "ウ", "ヰ", "ノ", "オ", "ク", "ヤ", "マ", "ケ", "フ", "コ", "エ", "テ", "ア", "サ", "キ", "ユ", "メ", "ミ", "シ", "ヱ", "ヒ", "モ", "セ", "ス", "ン" };
    	private Map<String, Integer> valuesMap = new HashMap<String, Integer>();
        @Override
        public String getNextValue(String currentValue,int interval)
        {
          // TODO Auto-generated method stub
          int next = 0;
          if (interval != 0 )
          {
            Integer index = valuesMap.get(currentValue);
            next = (index + interval) % valuesMap.size();
          }
          String ret = values[next];
          return ret;
        }

        @Override
        public void init()
        {
          // TODO Auto-generated method stub
        	for (int i = 0; i < values.length; i++)
            {
              valuesMap.put(values[i], new Integer(i));
            }
        }
      },
    J2 {
        private String[] values = { "ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ", "ソ", "タ", "チ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ", "ネ", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ", "マ", "ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ", "ル", "レ", "ロ", "ワ", "ヲ", "ン"};
        private Map<String, Integer> valuesMap = new HashMap<String, Integer>();
        @Override
        public String getNextValue(String currentValue,int interval)
        {
          // TODO Auto-generated method stub
          int next = 0;
          if (interval != 0)
          {
            Integer index = valuesMap.get(currentValue);
            next = (index + interval) % valuesMap.size();
          }
          String ret = values[next];
          return ret;
        }

        @Override
        public void init()
        {
          // TODO Auto-generated method stub
            for (int i = 0; i < values.length; i++)
            {
              valuesMap.put(values[i], new Integer(i));
            }
        }
      };
    static
    {
      listType.I.init();
      listType.i.init();
      listType.J1.init();
      listType.J2.init();
    }
    public static listType getBaseType(String type)
    {
      listType list = listType.N;
      if (type.equals("I"))
      {
        list = listType.I;
      }
      else if (type.equals("A"))
      {
        list = listType.A;
      }
      else if (type.equals("a"))
      {
        list = listType.a;
      }
      else if (type.equals("i"))
      {
        list = listType.i;
      } 
      else if (type.equals("イロハ") || type.equals("ｲﾛﾊ")) 
      {
        list = listType.J1;
      } 
      else if (type.equals("アイウ") || type.equals("ｱｲｳ")) 
      {
        list = listType.J2;
      }
      return list;
    }
    public static String getNextValue(String type, String currentValue,int interval  )
    {
      listType list = getBaseType(type);
      return list.getNextValue(currentValue,interval);
    }

    abstract public String getNextValue(String currentValue,int interval );

    abstract public void init();

  }

  public static String unicode2char(String b) {
    String result = b;
    if (b.charAt(0) == '\\')
    {
        int c[] = {Integer.parseInt(b.substring(1), 16)};
        result = new String(c, 0, 1);
    }
    return result;
  }

  public static String char2unicode(String c) {
    // Returns hex String representation of char c
    String str = null;
    if (c.length() == 1)
    {
      StringBuilder sb = new StringBuilder();
      sb.append("\\");
      sb.append(String.format("%04x", c.codePointAt(0)));
      str = sb.toString();
    }
    return str;
  }
  public static boolean isList(Node node)
  {
    if (node != null && node.getNodeType() == Node.ELEMENT_NODE)
    {
      String name = node.getNodeName();
      if (name.equalsIgnoreCase("ol") || name.equalsIgnoreCase("ul"))
      {
        return true;
      }
    }

    return false;
  }

  public static boolean isListItem(Node node)
  {
    if (node != null && node.getNodeType() == Node.ELEMENT_NODE)
    {
      String name = node.getNodeName();
      if (name.equalsIgnoreCase("li"))
      {
        return true;
      }
    }

    return false;
  }
  public static boolean isListSpacer(Node node)
  {
    if (node != null && node.getNodeType() == Node.ELEMENT_NODE)
    {
      String name = node.getNodeName();
      if (name.equalsIgnoreCase("img") && XHTMLDomUtil.hasClass((Element) node, "listSpacer"))
      {
        return true;
      }
    }

    return false;
  }
  public static String convertToListType(String style)
  {
    String type = style;

    if (style.equalsIgnoreCase("lst-ur"))
      type = "I";
    else if (style.equalsIgnoreCase("lst-lr"))
      type = "i";
    else if (style.equalsIgnoreCase("lst-uap") || style.equalsIgnoreCase("lst-ua"))
      type = "A";
    else if (style.equalsIgnoreCase("lst-lap") || style.equalsIgnoreCase("lst-la"))
      type = "a";
    else if (style.equalsIgnoreCase("lst-n") || style.equalsIgnoreCase("lst-n2") || style.equalsIgnoreCase("lst-np"))
      type = "1";
    else if (style.equalsIgnoreCase("lst-j1"))
      type = "イロハ";
    else if (style.equalsIgnoreCase("lst-j2"))
      type = "アイウ";
    return type;
  }

  public static String getListType(Node node)
  {
    String type = null;
    if (isListItem(node))
    {
      String css = getListClass(node);
      type = convertToListType(css);
      if (type == null)
        node = node.getParentNode();
    }
    if (isList(node))
    {
      Map<String, Object> toplist = new HashMap<String, Object>();
      getTopList(node, toplist);
      Node tmpNode = (Node) toplist.get(LIST);
      if (tmpNode != null)
      {
        Node header = getHeaderList(tmpNode);
        String[][] outline = getOutlineInfo((Element) header);
        int indent = (Integer) toplist.get(INDENT);
        if (indent >= outline.length)
          indent = outline.length - 1;
        type = outline[indent][0];
      }
    }
    if (type == null)
      type = "1";
    return type;
  }
  public static String getListItemValue(Node node)
  {
    String value = "";
    if (isListItem(node))
    {
      Element heading = (Element) getHeadingInListItem(node);
      if (heading != null)
      {
        value = heading.getAttribute("values");
      }
      else
      {
        value = ((Element) node).getAttribute("values");
      }
      if (value != null)
      {
        int index = value.lastIndexOf('.');
        value = value.substring(index+1);
      }
    }
    return value;
  }

  public static void setListItemValue(Node node, String value, int showLevel)
  {
    if (isListItem(node))
    {
      if (!value.equalsIgnoreCase(""))
      {
        Node list = node.getParentNode();
        if (list != null)
        {
          Node parentItem = list.getParentNode();
          for (int i = 1; i < showLevel; i++)
          {
            String prefix = "";
            if (parentItem.getParentNode().getNodeName().equalsIgnoreCase("ol") )
            {
                prefix = getListItemValue(parentItem);
            }
            value = prefix + "." + value;
            parentItem = parentItem.getParentNode().getParentNode();
          }
        }
      }
      Element heading = (Element) getHeadingInListItem(node);
      if (heading != null)
      {
        heading.setAttribute("values", value);
      }
      else
      {
        ((Element) node).setAttribute("values", value);
      }
    }
  }

  public static int getIndentLevel(Node node)
  {
//	  var indentLevel = 0;
//		if (MSGUTIL.isListItem(node))
//			node = node.getParent();
//		if (MSGUTIL.isList(node))
//		{
//			var parent = node.getParent();
//			while ( MSGUTIL.isListItem(parent) )
//			{
//				parent = parent.getParent();
//				indentLevel++;
//				parent = parent.getParent();
//			}
//		}
//		return indentLevel;  
//	  
    int indentLevel = 0;
    if(isListItem(node)){
    	node= node.getParentNode();
    }
    if (isList(node))
    {
      Node parent = node.getParentNode();
      while (isListItem(parent))
      {
        parent = parent.getParentNode();
        indentLevel++;
        parent = parent.getParentNode();
      }
    }
    return indentLevel;
  }

  public static Map<String, Object> getTopList(Node node, Map<String, Object> ret)
  {
    Node topList = null;
    int indentLevel = 0;
    if (isList(node))
    {
      topList = node;
      Node parent = topList.getParentNode();
      while (isListItem(parent))
      {
        indentLevel++;
        topList = parent.getParentNode();
        parent = topList.getParentNode();
      }
    }
    ret.put(LIST, topList);
    ret.put(INDENT, new Integer(indentLevel));
    return ret;
  }

  public static Map<String, Object> getWholeListInfo(Node node)
  {
    Map<String, Object> result = null;
    if (isListItem(node))
      node = node.getParentNode();
    if (isList(node))
    {
      result = new HashMap<String, Object>();
      Map<String, Object> top = new HashMap<String, Object>();
      top = getTopList(node, top);
      Node topNode = ((Node) (top.get(ListUtil.LIST)));
      String name = topNode.getNodeName();
      String listClass = getListClass(topNode);
      Element doc = topNode.getOwnerDocument().getDocumentElement();
      boolean end = false;
      List<Node> nodeList = XHTMLDomUtil.getElements(doc, name, listClass);
      int headerIndex = -1;
      int count = 0;
      Pattern p2 = Pattern.compile("(?:^|\\s+)continue(?=\\s|$)");
      Iterator<Node> iter = nodeList.iterator();
      while (iter.hasNext())
      {
        Node tmp = iter.next(); 
        String cls = ((Element) tmp).getAttribute(XHTMLDomUtil.CLASS_ATTR);
        boolean b = p2.matcher(cls).find();
        if (!b )
        {
          if (!end)
          {
            headerIndex = count;
          } else {
            break;
          }
        } else {
          if (headerIndex < 0)
          {
            headerIndex = count;
          }
        }
        if (tmp == topNode)
        {
          end = true;
          result.put("currentIndex", new Integer(count-headerIndex));
        }
        count++;
      }
      List<Node> sublist = nodeList.subList(headerIndex, count);
      Element header = (Element) nodeList.get(headerIndex);
      result.put("header", header);
      result.put("outline", header.getAttribute("types"));
      result.put("lists", sublist);
    }
    return result;
  }

  public static Node getHeaderList(Node node)
  {
    Node ret = null;
    if (isList(node))
    {
      Map<String, Object> top = new HashMap<String, Object>();
      getTopList(node, top);
      if (top.get(LIST) != null)
      {
        Node topList = (Element) top.get(LIST);
        String css = getListClass(topList);
        String elementName = topList.getNodeName();
        NodeList lists = ((Element) topList.getParentNode()).getElementsByTagName(elementName);
        List<Node> nodes = new ArrayList<Node>();
        for (int i = 0; i < lists.getLength(); i++)
        {
          Node tmpNode = lists.item(i);
          if (XHTMLDomUtil.hasClass((Element) tmpNode, css))
            ;
          nodes.add(tmpNode);
        }
        for (int i = 0; i < nodes.size(); i++)
        {
          Element tmpNode = (Element) nodes.get(i);
          if (!XHTMLDomUtil.hasAttribute(tmpNode, "continue"))
          {
            ret = tmpNode;
          }
          if (tmpNode == topList)
          {
            break;
          }
        }

      }
    }
    return ret;
  }

  public static boolean isHeading(String node)
  {
    Pattern p = Pattern.compile("^h[1-6]");
    Matcher m = p.matcher(node);
    return m.find();
  }

  public static Node getHeadingInListItem(Node node)
  {
    if (isListItem(node))
    {
      try
      {
        Node firstChild = node.getFirstChild();
        if (firstChild.getNodeType() == Node.ELEMENT_NODE)
        {
          String nodeName = firstChild.getNodeName();
          if (isHeading(nodeName))
          {
            return firstChild;
          }
        }
      }
      catch (Exception e)
      {
        return null;
      }
    }
    return null;
  }

  public static String getListClass(Node node)
  {
    Pattern regx;
    String listclass = null;
    if (isList(node))
      regx = Pattern.compile("lst-[a-zA-Z0-9_\\-]+");
    else 
      regx = Pattern.compile("[A-Za-z0-9_]+(_[0-9]+)+(\\s|$)|lst-[a-zA-Z0-9_\\-]+");
    Element element = (Element) node;
    String css = element.getAttribute("class");
    
    if (css != null)
    {
      Matcher matcher = regx.matcher(css);
      if (matcher.find())
      {
          listclass = matcher.group().trim();
      }
      if (listclass == null && isListItem(node))
      {
          Node heading = getHeadingInListItem(node);
          if (heading != null)
            return getListClass(heading);
      } 
    }
    return listclass;
  }

  public static void removeListClass(Node node)
  {
    String listClass = getListClass(node);
    if (listClass != null && listClass.length() != 0)
    {
      Node heading = null;
      if (isListItem(node))
        heading = getHeadingInListItem(node);
      if (heading != null)
        XHTMLDomUtil.removeClass((Element) heading, listClass);
      else
        XHTMLDomUtil.removeClass((Element) node, listClass);
    }
  }
  public static String[] getFirstStop (Node node)
  {
    if (isList(node))
    {
      Element heading = (Element) getHeadingInListItem(node);
      Element item = (Element) node;
      if (heading != null)
        item = heading;
      if (item.hasAttribute("_firststop"))
      {
        return item.getAttribute("_firststop").split(",");
      }
    }
    return null;
  }
  public static void setListSpacer(Node node)
  {
    Node heading = getHeadingInListItem(node);
    Node item = node;
    if (heading != null)
    {
      item = heading;
    }
    Node first = item.getFirstChild();
    if (!isListSpacer(first))
    {
      Element spacer = first.getOwnerDocument().createElement("img");
      XHTMLDomUtil.addClass(spacer, "listSpacer");
      XHTMLDomUtil.addClass(spacer, "noSrcAttr");
      spacer.setAttribute("unselectable", "on");
      if (first != null)
        item.insertBefore(spacer, first);
      else
        item.appendChild(spacer);
    }
  }
  public static void setListClass(Node node, String css)
  { 
    if (isListItem(node))
    {
      removeListClass(node);
      Node heading = getHeadingInListItem(node);
      if (heading != null)
      {
        XHTMLDomUtil.addClass((Element) heading, css);
      }
      else
      {
        XHTMLDomUtil.addClass((Element) node, css);
      }
    }
  }
  
  public static void setMarginClass(Element node, String css)
  { 
    if (isList(node))
    {
      if (!XHTMLDomUtil.hasClass(node, css))
      {
        String cls = node.getAttribute("class");
        if (cls != null && cls.length() > 0)
          cls = cls.replaceAll("[A-Za-z0-9_]+(_[0-9]+)+(\\s|$)", "");
        cls += " " + css;
        node.setAttribute("class", cls.trim());
      }
    }
  }
  

  public static String[][] getOutlineInfo(Element node)
  {
    if (!isList(node))
      return null;
    String str = node.getAttribute("types");
    if (str == null || str == "")
    {
      if (node.getNodeName().equalsIgnoreCase("ol"))
      {
        String[][] val = {{"lst-n", "1", "ol"},{"lst-la", "1", "ol"},{"lst-lr", "1", "ol"},{"lst-n", "1", "ol"},{"lst-la", "1", "ol"},{"lst-lr", "1", "ol"},{"lst-n", "1", "ol"},{"lst-la", "1", "ol"},{"lst-lr", "1", "ol"},{"lst-n", "1", "ol"}};
        return val;
      } else {
        String[][] val = {{"lst-c", "1", "ul"},{"lst-d", "1", "ul"},{"lst-cs", "1", "ul"},{"lst-c", "1", "ul"},{"lst-d", "1", "ul"},{"lst-cs", "1", "ul"},{"lst-c", "1", "ul"},{"lst-d", "1", "ul"},{"lst-cs", "1", "ul"},{"lst-c", "1", "ul"}};
        return val;
      }
    } else {
      String[] infos = str.split(":");
      String[][] ret = new String[infos.length][3];
      for (int i = 0; i < infos.length; i++)
      {
        if (infos[i].length() == 0)
        {
          ret[i][0] = "lst-n";
          ret[i][1] = "1";
          ret[i][2] = "ol";
         }
        int index = infos[i].indexOf(',');
        ret[i][2] = "ol";
        if (index == 0)
        {
          ret[i][0] = "";
        } else {
          ret[i][0] = infos[i].substring(0, index);
          if (ret[i][0].startsWith("\\"))
          {
            ret[i][0] = unicode2char(ret[i][0]);
            ret[i][2] = "ul";
          } else if (ret[i][0].startsWith("url") || (ret[i][0].startsWith("lst-") && convertToListType(ret[i][0]).endsWith(ret[i][0]))  )
          {
            ret[i][2] = "ul";
          }
          
        }
        if (index < (infos[i].length()-1) )
        {
          ret[i][1] = infos[i].substring(index+1);
        } else {
          ret[i][1] = "1";
        }
      }
      return ret;
    }
  }

  public static String[] getStartValues( Element node)
  {
    String[] values = null;
    if (isList(node))
    {
      String start = node.getAttribute("starts");
      if (start != null && !start.equalsIgnoreCase(""))
      {
        values = start.split(",");
      }
    }
    return values;
  }
  public static String getListItemClassFromOutline(String[][] outline, String listClass, int indent)
  {
    if (indent >= outline.length)
      indent = outline.length-1;
    String css = outline[indent][0];
    if (css.length()== 0 || !css.startsWith("lst-")) // it's a converted list
    {
      int index = listClass.lastIndexOf('-');
      css = listClass.substring(index+1) + "_" + (indent+1);
    }
    return css;
  }
  public static String getMarginClassFromOutline(String[][] outline, String listClass, int indent)
  {
	String css = null;
    if (indent >= outline.length)
      indent = outline.length-1;
    int index = listClass.lastIndexOf('-');
    String str = listClass.substring(index+1);
   // if (!str.matches("/[A-Z]{4}/g"))
    {
    	css = str  + "_" + (indent+1);
    }
    return css;
  }

  public static Node getFollowedList(Node node, Map<String, Object> info, boolean rtl)
  {
    Node follow = null;
    if (isList(node))
    {
      Node parent = node.getParentNode();
      // the list's parent isn't <li>, so it's the first level list
      if (!isListItem(parent))
      {
        // if we want to find previous followed list, then this list should have class 'continue'
        if ((rtl && XHTMLDomUtil.hasClass((Element) node, "continue") || !rtl))
        {
          // the first level list must have list class, or else it's a bug
          List<Node> lists = (List<Node>) info.get("lists");
          Iterator<Node> iter = lists.iterator();
          Node previous = null;
          int count = -1;
          while (iter.hasNext())
          {
            Node list = iter.next();
            count++;
            if (list.equals(node))
            {
              if (rtl)
                follow = previous;
              else if (!rtl && iter.hasNext())
                follow = iter.next();
            }
            previous = list;
          }
        }
      }
      else
      {
        // ok, this is a multiple level list
        
        /* try to find in same li first, like this:
        
        <ol>
            <li>
                <ol><li></li></ol>
                <ol><li></li></ol>
            </li>
        </ol>
        */
        Node sibling = rtl ? node.getPreviousSibling() : node.getNextSibling();
        while (sibling != null && !isList(sibling))
        {
            sibling = rtl ? sibling.getPreviousSibling() : sibling.getNextSibling();
        }
        if (sibling != null)
        {
          follow = sibling;
        } else {
          if (!rtl || getListClass(parent) == null)
          {
            sibling = rtl ? parent.getPreviousSibling() : parent.getNextSibling();
            if (isListItem(sibling))
            {
              Node last = sibling.getLastChild();
              if (isList(last) && (rtl || getListClass(sibling) == null))
              {
                follow = last;
              }
            } else { // there is no sibling list item, so try to find parent's followed list
              Node list = parent.getParentNode();
              Node followParent = getFollowedList(list, info, rtl);
              if (followParent != null)
              {
                Node item = rtl ? followParent.getLastChild() : followParent.getFirstChild();
                if (rtl || getListClass(item) == null)
                {
                  Node last = item.getLastChild();
                  if (isList(last))
                    follow = last;
                } 
              }
            }
          }
        }
      }
    }
    return follow;
  }

  public static Node getFollowedListItem(Node node, Map<String, Object> info,  boolean rtl)
  {
    Node listItem = null;
    if (isListItem(node))
    {
      listItem = rtl ? node.getPreviousSibling() : node.getNextSibling();
      if (listItem == null)
      {
        Node list = getFollowedList(node.getParentNode(), info, rtl);
        if (list != null)
        {
          listItem = rtl ? list.getLastChild() : list.getFirstChild();
        }
      }
      if (listItem != null && getListClass(listItem) == null)
      {
         Node temp = getFollowedListItem(listItem, info,  rtl);
         if (temp != null)
           listItem = temp;
      }
    }
    return listItem;
  }
  public static void updateListValue(Node node, Map<String, Object> info, boolean forceFromHeader)
  {
    if (isList(node))
    {
      if (info == null)
        info = getWholeListInfo(node);
      Element header = (Element) info.get("header");
      List<Node> lists = (List<Node>) info.get("lists");
      int startIndex = ((Integer) info.get("currentIndex")).intValue();
      if (forceFromHeader)
        startIndex = 0;
      int index = -1;
      String[][] outline = getOutlineInfo(header);
      String[] startValues = getStartValues(header);
      String listClass = getListClass(header);
      Iterator<Node> iter = lists.iterator();
      //String[] firststops = getFirstStop(header);
      while (iter.hasNext())
      {
        index++;
        Element list = (Element) iter.next();
        if (index >= startIndex)
        {
          
          if (!list.getAttribute("id").equalsIgnoreCase(header.getAttribute("id")))
            list.removeAttribute("types");
          List<Node> items = XHTMLDomUtil.getElements(list, "li", null);
          Iterator<Node> it = items.iterator();
          while (it.hasNext())
          {
            Element item = (Element) it.next();
            Element parent = (Element) item.getParentNode();
            String css = getListClass(item);
            //if ( css != null)
            {
              int indent = getIndentLevel(item);
              if (indent >= outline.length)
                indent = outline.length-1;
              if (!parent.getNodeName().equalsIgnoreCase(outline[indent][2]))
              {
                
                Element newParent = XHTMLDomUtil.renameNode(parent, outline[indent][2]);
                if (parent.equals(list))
                {
                  lists.set(index, newParent); 
                }
                parent = newParent;
              }
              String newCss = getListItemClassFromOutline(outline, listClass, indent);
              String marginClass = getMarginClassFromOutline(outline, listClass, indent);
              if (marginClass != null)
              {
                setMarginClass(parent, marginClass);
                if ( !XHTMLDomUtil.hasClass(parent, "concordList") && marginClass.matches("/[A-Z]{4}_[0-9]+/g"))
                {
                  XHTMLDomUtil.addClass(parent, "concordList");
                }
              }
              int showLevel = Integer.parseInt(outline[indent][1]);
              String type = convertToListType(outline[indent][0]);
              String value = "";
              if (!outline[indent][0].equalsIgnoreCase(""))
              {
                if (startValues == null || indent >= startValues.length || startValues[indent] == null || startValues[indent].equalsIgnoreCase("") || startValues[indent].equalsIgnoreCase("1"))
                {
                    value = listType.getNextValue(type, null, 0);
                } else {
                    value = listType.getNextValue(type, type, Integer.parseInt(startValues[indent])-1);
                }
                if (parent.getNodeName().equalsIgnoreCase("ol"))
                {
                  Node previous = getFollowedListItem(item, info, true);
                  if (previous != null)
                  {
                    //if (getListClass(previous) != null)
                    value = getListItemValue(previous);
                    if (css != null && !css.equalsIgnoreCase("lst-header"))
                      value = listType.getNextValue(type, value,1);
                  }
                }
              }
//              if (css != null)
//              {
//                if (firststops != null && indent < firststops.length)
//                {
//                  item.setAttribute("_firststop",  firststops[indent]);
//                } else {
//                  item.removeAttribute("_firststop");
//                }
//                setListSpacer(item);
//              }
              setListItemValue(item, value, showLevel);
              if (css != null && !css.equalsIgnoreCase("lst-header") && !newCss.equalsIgnoreCase(css))
                setListClass(item, newCss);
              
              if( marginClass != null )
                item.setAttribute("_list", marginClass);
            } 
            /*else {
              item.removeAttribute("value");
            }
            */
          }
        }
      } 
    }
  }

  public static void updateDocument(Document dom)
  {
    List<Node> listItems = XHTMLDomUtil.getElements(dom.getDocumentElement(), "li", null);
    Iterator<Node> it = listItems.iterator();
    while (it.hasNext())
    {
      Node item = it.next();
      if (getListClass(item) != null)
      {
        setListSpacer(item);
      }
    }
  }
  public static void test(Object obj)
  {
    obj = new Object();
  }

  public static void main(String[] args)
  {
     System.out.println(listType.getNextValue("A", "ZZ",29));
     System.out.println(listType.getNextValue("A", "AA",29));
     System.out.println(listType.getNextValue("A", "AA",3));
     System.out.println(listType.getNextValue("A", "ZZ",29));
     
     
     
     System.out.println(listType.getNextValue("a", "zz",29));
     System.out.println(listType.getNextValue("a", "aa",29));
     System.out.println(listType.getNextValue("a", "aa",3));
     System.out.println(listType.getNextValue("a", "zz",29));
     
     System.out.println(listType.getNextValue("I", "II",3));
     System.out.println(listType.getNextValue("i", "ii",4));
     
     
     System.out.println(listType.getNextValue("N", "100",3));
     
  }
}
