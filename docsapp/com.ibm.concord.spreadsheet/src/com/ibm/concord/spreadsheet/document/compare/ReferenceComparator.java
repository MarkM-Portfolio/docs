package com.ibm.concord.spreadsheet.document.compare;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.json.java.JSONObject;

public class ReferenceComparator extends MapComparator
{
  private MetaJudger mj;

  public ReferenceComparator(IJudger j, String path)
  {
    super(j, path);
    mj = (MetaJudger) j;
  }

  @Override
  public boolean reportNotEqual(String key, Object left, Object right)
  {

    if (left instanceof JSONObject && right instanceof JSONObject)
    {
      JSONObject lo = (JSONObject) left;
      JSONObject ro = (JSONObject) right;
      String type = (String) lo.get(ConversionConstant.REFERENCE_TYPE);
      Object o = lo.get(ConversionConstant.FORMULA_TOKEN_INDEX);

      if (type == null || !type.equals(ro.get(ConversionConstant.REFERENCE_TYPE)))
      {
        return super.reportNotEqual(key, left, right);
      }

      if (o == null || !o.equals(ro.get(ConversionConstant.FORMULA_TOKEN_INDEX)))
      {
        return super.reportNotEqual(key, left, right);
      }

      if (type.equals(ConversionConstant.VIRTUAL_REFERENCE))
      {
        o = lo.get(ConversionConstant.LEFTTOKENINDEX);
        if (o == null || !o.equals(ro.get(ConversionConstant.LEFTTOKENINDEX)))
        {
          return true;
        }

        o = lo.get(ConversionConstant.RIGHTTOKENINDEX);
        if (o == null || !o.equals(ro.get(ConversionConstant.RIGHTTOKENINDEX)))
        {
          return true;
        }
      }
      else if (type.equals(ConversionConstant.NAMES_REFERENCE))
      {
        o = lo.get(ConversionConstant.NAMES_REFERENCE);
        if (o == null || !o.equals(ro.get(ConversionConstant.NAMES_REFERENCE)))
        {
          return true;
        }
      }
      else if (type.equals(ConversionConstant.REF_TYPE_CELL))
      {
        String id = (String) lo.get(ConversionConstant.SHEETID);
        if (id == null || !mj.getMapping(id).equals(ro.get(ConversionConstant.SHEETID)))
        {
          return true;
        }

        id = (String) lo.get(ConversionConstant.ROWID_NAME);
        if (id == null || !mj.getMapping(id).equals(ro.get(ConversionConstant.ROWID_NAME)))
        {
          return true;
        }

        id = (String) lo.get(ConversionConstant.COLUMNID_NAME);
        if (id == null || !mj.getMapping(id).equals(ro.get(ConversionConstant.COLUMNID_NAME)))
        {
          return true;
        }

        o = lo.get(ConversionConstant.RANGE_ADDRESS);
        if (id == null || !o.equals(ro.get(ConversionConstant.RANGE_ADDRESS)))
        {
          return true;
        }
      }
      else
      {
        // "range" type

        String id = (String) lo.get(ConversionConstant.SHEETID);
        if (id == null || !mj.getMapping(id).equals(ro.get(ConversionConstant.SHEETID)))
        {
          return true;
        }

        id = (String) lo.get(ConversionConstant.RANGE_STARTROWID);
        if (id == null || !mj.getMapping(id).equals(ro.get(ConversionConstant.RANGE_STARTROWID)))
        {
          return true;
        }

        id = (String) lo.get(ConversionConstant.RANGE_ENDROWID);
        if (id == null || !mj.getMapping(id).equals(ro.get(ConversionConstant.RANGE_ENDROWID)))
        {
          return true;
        }

        id = (String) lo.get(ConversionConstant.RANGE_STARTCOLID);
        if (id == null || !mj.getMapping(id).equals(ro.get(ConversionConstant.RANGE_STARTCOLID)))
        {
          return true;
        }

        id = (String) lo.get(ConversionConstant.RANGE_ENDCOLID);
        if (id == null || !mj.getMapping(id).equals(ro.get(ConversionConstant.RANGE_ENDCOLID)))
        {
          return true;
        }

        o = lo.get(ConversionConstant.RANGE_ADDRESS);
        if (id == null || !o.equals(ro.get(ConversionConstant.RANGE_ADDRESS)))
        {
          return true;
        }
      }
      
      return false;
    }
    else
    {
      return super.reportNotEqual(key, left, right);
    }
  }
}
