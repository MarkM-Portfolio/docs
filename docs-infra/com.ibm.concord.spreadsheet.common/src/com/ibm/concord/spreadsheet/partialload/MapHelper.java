package com.ibm.concord.spreadsheet.partialload;

import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

public class MapHelper
{
  public static <K, V> void iterateMap(Map<K, V> m, IMapEntryListener<K, V> l)
  {
    Set<Entry<K, V>> set = m.entrySet();
    for (Iterator<Entry<K, V>> iterator = set.iterator(); iterator.hasNext();)
    {
      Entry<K, V> entry = iterator.next();
      if (l.onEntry(entry.getKey(), entry.getValue()))
      {
        break;
      }
    }
  }

  /**
   * Helper interface for easily iterate over a map.
   */
  public static interface IMapEntryListener<K, V>
  {
    /**
     * Called for every entry found in a map. Return true to halt the iteration.
     * 
     * @param e
     * @return
     */
    public boolean onEntry(K key, V value);
  }
}
