package com.ibm.concord.spreadsheet.document.compare;

import com.ibm.concord.spreadsheet.document.compare.MapComparator.IJudger;


public class DefaultJudger implements IJudger
{
  public boolean isError(String path)
  {
    if (path.endsWith("maxrow") || path.endsWith("defaultcolumnstyle") || path.endsWith("defaultrowstyle") || path.endsWith("columns") || path.startsWith("content.styles"))
    {
      return false;
    }
    return true;
  }

  public boolean isMapping(String path)
  {
    return false;
  }

  public String getMapping(String key)
  {
    return key;
  }

  public boolean isEqual(Object v1, Object v2, String key)
  {
    if(v1 != null && v2 != null)
      return v1.equals(v2);
    if(v1 == null && v2 == null)
      return true;
    return false;
  }
}
