package com.ibm.concord.services.rest.handlers.docsvr;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang3.StringEscapeUtils;

import com.ibm.icu.text.CharsetDetector;
import com.ibm.icu.text.CharsetMatch;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class CSVParser
{
  private static final Logger LOG = Logger.getLogger(CSVParser.class.getName());

  private static final char DOUBLEQUOTE = '"';

  private static final char SPACE = ' ';

  private static final char TAB = '\t';

  private String expr = "";

  private int position = 0;

  public JSONObject parse(File srcFile, String separator) throws IOException
  {
    InputStreamReader in = null;
    BufferedInputStream bis = null;
    BufferedReader buffer = null;
    JSONObject obj = new JSONObject();
    JSONArray output = new JSONArray();
    try
    {

      bis = new BufferedInputStream(new FileInputStream(srcFile));

      String charset = getEncoding(bis);
      in = new InputStreamReader(bis, charset);
      buffer = new BufferedReader(in);
      String line = null;
      boolean isClose = true;
      ArrayList<String> rowList = new ArrayList<String>();
      if (null == separator || "".equals(separator))
        separator = ",";
      int size = separator.length();
      char[] s = new char[size];
      for (int i = 0; i < size; i++)
      {
        char c = separator.charAt(i);
        s[i] = c;
      }

      ArrayList<Character> sepaList = new ArrayList<Character>();
      StringBuilder reg = new StringBuilder();
      int len = s.length;

      // TODO
      for (int i = 0; i < len - 1; i++)
      {
        sepaList.add(s[i]);
        if (s[i] == '\\')
          reg.append("\\u005C");
        else if (s[i] == '.')
          reg.append("\\u002E");
        else if (s[i] == '$')
          reg.append("\\u0024");
        else if (s[i] == '^')
          reg.append("\\u005E");
        else if (s[i] == '{')
          reg.append("\\u007B");
        else if (s[i] == '[')
          reg.append("\\u005B");
        else if (s[i] == '(')
          reg.append("\\u0028");
        else if (s[i] == '|')
          reg.append("\\u007C");
        else if (s[i] == ')')
          reg.append("\\u0029");
        else if (s[i] == '*')
          reg.append("\\u002A");
        else if (s[i] == '+')
          reg.append("\\u002B");
        else if (s[i] == '?')
          reg.append("\\u003F");
        else
          reg.append(s[i]).append("|");
      }
      char lst = s[len - 1];
      if (lst == '\\')
        reg.append("\\u005C");
      else if (lst == '.')
        reg.append("\\u002E");
      else if (lst == '$')
        reg.append("\\u0024");
      else if (lst == '^')
        reg.append("\\u005E");
      else if (lst == '{')
        reg.append("\\u007B");
      else if (lst == '[')
        reg.append("\\u005B");
      else if (lst == '(')
        reg.append("\\u0028");
      else if (lst == '|')
        reg.append("\\u007C");
      else if (lst == ')')
        reg.append("\\u0029");
      else if (lst == '*')
        reg.append("\\u002A");
      else if (lst == '+')
        reg.append("\\u002B");
      else if (lst == '?')
        reg.append("\\u003F");
      else
        reg.append(s[len - 1]);
      sepaList.add(s[len - 1]);

      StringBuilder row = new StringBuilder();
      line = buffer.readLine();
      if(line!=null && line.length()>0 && line.charAt(0)==0xFEFF)
      {
        StringBuffer buf = new StringBuffer(line);
        buf.deleteCharAt(0);
        line = buf.toString();
      }
      
      // is first in a data piece
      boolean firstChar;
      while (line != null)
      {
        int length = line.length();
        firstChar = true;
        for (int i = 0; i < length; i++)
        {
          char c = line.charAt(i);
          if ((firstChar || !isClose) && DOUBLEQUOTE == c && !sepaList.contains(DOUBLEQUOTE))
          {
            isClose = !isClose;
          }
          
          if (firstChar)
          {
            firstChar = false;
          }
          
          if (sepaList.contains(c))
          {
            // next char will be first char
            firstChar = true;
          }
        }
        String next = buffer.readLine();
        if (null == next)
          isClose = true;
        if (!isClose)
          row.append(line).append("\n");
        else
        {
          row.append(line);
          rowList.add(row.toString());
          row = new StringBuilder();
        }
        line = next;
      }

      Iterator<String> it = rowList.iterator();
      while (it.hasNext())
      {
        String ro = it.next();
        JSONArray array = new JSONArray();
        if (ro.length() == 0 || ro.matches("[" + reg + "]*"))
        {
          output.add(array);
          continue;
        }
        else
        {
          expr = ro;
          position = 0;
          String[] cols = getCols(ro, sepaList);
          for (int i = 0; i < cols.length; i++)
          {
            String x = cols[i];
            array.add(x);
          }
          output.add(array);
        }
      }
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.SEVERE, "File is Not Found", e);
    }
    catch (UnsupportedEncodingException e)
    {
      LOG.log(Level.SEVERE, "Unsupported Encoding", e);
    }
    finally
    {
      if (bis != null)
        bis.close();
    }
    // TODO invalid content
    obj.put("csvContent", output);
    return obj;
  }

  public static String getEncoding(InputStream bis)
  {
    CharsetDetector detector = new CharsetDetector();
    String charset = null;
    try
    {
      detector.setText(bis);
      CharsetMatch match = detector.detect();
      charset = match.getName();
      return charset;
    }
    catch (IOException e)
    {
    }
    return charset;
  }

  public static boolean isUTF8Encoding(InputStream bis)
  {
    return "UTF-8".equals(getEncoding(bis));
  }

  private String[] getCols(String sline, List<Character> separator)
  {
    List<String> list = new ArrayList<String>();

    StringBuilder str = new StringBuilder();

    int ch = read();
    boolean ignore = true;
    boolean isClose = true;
    // first char in one data piece
    boolean firstChar = true;
    while (ch != 0)
    {
      char c = (char) ch;
      if (isClose && separator.contains(c))
      {
        String value = escape(str.toString());
        list.add(value);
        str = new StringBuilder();
        ignore = true;
        firstChar = true;
      }
      else if (ch == DOUBLEQUOTE && (firstChar || !isClose))
      {
        // DOUBLEQUOTE only works for the 1st char in a data piece, or,
        // of previously a DOUBLEQUOTE is read, read the pairing one.
        int chNext = read();
        isClose = !isClose;
        if (chNext == DOUBLEQUOTE && !ignore)
        {
          isClose = !isClose;
          str.append((char) ch);
        }
        else if (chNext != 0)
        {
          unread();
        }

        ignore = false;
        firstChar = false;
      }
      else
      {
        str.append((char) ch);
        firstChar = false;
      }
      ch = read();
      if (ch == 0)
      {
        String value = escape(str.toString());
        list.add(value);
        ignore = true;
      }
    }
    String[] text = new String[list.size()];
    list.toArray(text);
    return text;
  }

  private int read()
  {
    if (position > expr.length() - 1)
      return 0;
    return expr.charAt(position++);
  }

  private int unread()
  {
    position--;
    return position;
  }

  private String escape(String v)
  {
    String res = StringEscapeUtils.escapeHtml4(v);
    // double quote conflicts with JSON escape, get it back
    res = res.replaceAll("&quot;", "\"");
    return res;
  }

  public static void main(String args[])
  {
    CSVParser parser = new CSVParser();
    List<Character> c = new ArrayList<Character>();
    c.add(',');
    // parser.expr = "1,\"1984,11\",\"\"\"app\"\"\",";
    // parser.expr = "ASC,\"\"\"s\"\"\"\"\"\",\"\"\"\"\"\"\"\"\",g";
    parser.expr = "123\",\"567\",\"8";

    String[] t = parser.getCols(parser.expr, c);
    System.out.println("Final Result: " + Arrays.toString(t));
    for (int i = 0; i < t.length; i++)
    {
      System.out.println("|" + t[i] + "|");
    }
  }
}
