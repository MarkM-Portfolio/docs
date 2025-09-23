package com.ibm.concord.spreadsheet.document.model.impl;

import java.util.HashMap;
import java.util.List;

/**
 * <p>
 * A map that can lookup row/column index by providing an ID. This map keeps the reference of the ID array in IDManager. While looking up,
 * it keep the ID -> (1-based) index it have been looked.
 * <p>
 * Note that put() to the map, or iterate over it is not allowed (yet not forbid by code).
 */
public class IDToIndexMap extends HashMap<Integer, Integer>
{
  private static final long serialVersionUID = -7765244616092713586L;

  private int index;

  private List<Integer> idArray;

  public IDToIndexMap(List<Integer> l)
  {
    super();
    idArray = l;
    index = 0;
  }

  @Override
  public Integer get(Object key)
  {
    Integer id = (Integer) key;
    Integer o = super.get(key);
    if (o != null)
    {
      return o;
    }
    else
    {
      // currently key (id) is not found in the map, look it up in the ID array
      if (index >= idArray.size())
      {
        // search already done before, id not found
        return IDManager.INVALID;
      }

      for (; index < idArray.size(); ++index)
      {
        o = idArray.get(index);
        if (o != null)
        {
          put(o, index + 1);
          if (o.equals(id))
          {
            return index + 1;
          }
        }
      }
      return IDManager.INVALID;
    }
  }

  @Override
  public void clear()
  {
    super.clear();
    index = 0;
  }
}
