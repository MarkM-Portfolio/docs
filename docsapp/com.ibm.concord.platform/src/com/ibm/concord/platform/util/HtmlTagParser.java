/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.util;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class HtmlTagParser
{
  private String html;
  private int pos;
  private int length;
  
  /*
   * 
   */
  public HtmlTagParser(String html)
  {
    this.html = html;
    this.length = html.length();
  }
  
  public HtmlTag next()
  {
    if (outOfBound(pos))
    {
      return null;
    }
    
    toTagStart();
    if (outOfBound())
    {
      return null;
    }
    // skip '<' if possible
    openTag();
    
    HtmlTag tag = new HtmlTag();
    // tag name
    String tagName = findTagName();
    tag.setTagName(tagName);
    if (outOfBound())
    {
      return tag;
    }
    
    if (reachTagEnd())
    {
      // end with found
      closeTag();
      return tag;
    }
    
    // attribute pairs
    String[] pair = null;
    while ((pair = findAttribute()) != null)
    {
      tag.addAttribute(pair[0], pair[1]);
    }
    
    // skip '>' if possible
    closeTag();
    return tag;
  }
  
  private void moveTo(int i)
  {
    pos = i;
  }
  
  private boolean outOfBound(int i)
  {
    return (i<0 || i>=length);
  }
  
  public boolean outOfBound()
  {
    return (pos<0 || pos>=length);
  }
  
  private void skipSpace()
  {
    while (!outOfBound() && html.charAt(pos) == ' ')
    {
      pos++;
    }
  }
  
  private boolean reachTagEnd()
  {
    // tag closed, or another tag started
    return (html.charAt(pos) == '>' || html.charAt(pos) == '<');
  }
  
  public void openTag()
  {
    if (html.charAt(pos) == '<')
    {
      pos++;
    }
  }
  
  public void closeTag()
  {
    if (outOfBound())
      return;
    if (html.charAt(pos) == '>')
    {
      pos++;
    }
  }
  
  private void toTagStart()
  {
    while ((pos < length) && (html.charAt(pos) != '<'))
    {
      pos++;
    }
  }
  
  private String findTagName()
  {
    skipSpace();
    if (outOfBound())
    {
      return "";
    }
    
    char c = html.charAt(pos);
    if (c == '/')
    {
      pos++;
      if (outOfBound())
        return "";
    }
    
    int i = pos;
    boolean found = false;
    do {
      c = html.charAt(i);
      switch (c)
      {
        case ' ':
        case '>':
        case '<':
        case '/':
        {
          found = true;
          break;
        }
        default:
        {
          i++;
          break;
        }
      }
    } while (!found && !outOfBound(i));
    
    String name = html.substring(pos, i); 
    moveTo(i);
    return name;
  }
  
  private String[] findAttribute()
  {
    skipSpace();
    
    // <p attr=''  |attr2= ...
    if (outOfBound() || reachTagEnd())
    {
      return null;
    }
    
    String[] pair = new String[2];
    pair[0] = findAttrName();
    pair[1] = null;
    
    skipSpace();
    if (outOfBound())
    {
      // end without close
      // <p attr |
      return pair;
    }
    
    if (reachTagEnd())
    {
      // <p attr |>
      // <p attr |<
      return pair;
    }
    
    char c = html.charAt(pos);
    
    if (c != '=')
    {
      // attribute without value
      // <p attr |attr2=...
      return pair;
    }
    
    // now attribute value follows
    pos++; // skip '='
    skipSpace();
    
    if (outOfBound())
    {
      // end without close
      // <p attr = |
      return pair;
    }
    
    if (reachTagEnd())
    {
      // <p attr = |>
      // <p attr = |<
      return pair;
    }
    
    pair[1] = findAttrValue();
    return pair;
  }
  
  private String findAttrName()
  {
    skipSpace();
    
    if (outOfBound() || reachTagEnd())
    {
      return null;
    }
    
    int i = pos;
    char c = html.charAt(i);
    if (c == '/')
    {
      // <p|/>
      // <p a=b |/...
      pos++;
    }
    
    boolean found = false;  
    do {
      c = html.charAt(i);
      switch (c)
      {
        case ' ':
        case '=':
        case '>':
        case '<':
        {
          found = true;
          break;
        }
        default:
        {
          i++;
          break;
        }
      }
    } while (!found && !outOfBound(i));
    
    if (pos == i)
      return null;
    String name = html.substring(pos, i);
    moveTo(i);
    return name;
  }
  
  private String findAttrValue()
  {
    skipSpace();
    
    if (outOfBound() || reachTagEnd())
    {
      return null;
    }

    char c = html.charAt(pos);
    int flag = 0; // no quote mark char
    if (c == '\'')
    {
      flag = 1;
      pos++;
    }
    else if (c == '"')
    {
      flag = 2;
      pos++;
    }
    
    if (outOfBound())
    {
      // <p a='|
      // <p a="|
      return null;
    }
    
    String v = "";
    int i = pos;
    do {
      c = html.charAt(i);
      switch (c)
      {
        case ' ':
        case '>':
        case '<':
        {
          if (flag == 0)
          {
            // attribute value without quote mark
            // <p attr=value| ...
            // <p attr=value|>...
            // <p attr=value|<...
            v = html.substring(pos, i);
            moveTo(i);
            return v;
          }
          break;
        }
        case '"':
        {
          char prev = html.charAt(i-1);
          if (flag == 2 && prev != '\\')
          {
            // <p a="abc|"
            v = html.substring(pos, i);
            moveTo(i+1);
            return v;            
          }
          
          // <p a=ab|"c ...
          // <p a="a\|"bc"
          break;
        }
        case '\'':
        {
          char prev = html.charAt(i-1);
          if (flag == 1 && prev != '\\')
          {
            // <p a='abc|'
            v = html.substring(pos, i);
            moveTo(i+1);
            return v;            
          }
          
          // <p a=ab|'c ...
          // <p a='a\|'bc'
          break;
        }
      } // switch
      
      i++;
    } while(!outOfBound(i));
    
    // reach end
    v = html.substring(pos, i);
    moveTo(i);
    return v;
  }
}
