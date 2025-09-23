package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;

/**
 * <p>
 * Special {@link IDraftActionHandler} implementation that composites multiple handlers and respond to action together.
 * <p>
 * <strong>IMPORTANT</strong>: Only the last handler in the handlers chain can change jp, or other handlers will not get the correct data.
 */
public class DraftActionHandlerCompositor implements IDraftActionHandler
{
  private List<IDraftActionHandler> handlers;

  public DraftActionHandlerCompositor()
  {
    handlers = new ArrayList<IDraftActionHandler>();
  }

  public void addHandler(IDraftActionHandler h)
  {
    handlers.add(h);
  }

  public void removeHandler(IDraftActionHandler h)
  {
    handlers.remove(h);
  }

  public void onAction(List<String> fieldPath, Actions action, JsonParser jp) throws JsonParseException, IOException
  {
    for (Iterator iterator = handlers.iterator(); iterator.hasNext();)
    {
      IDraftActionHandler h = (IDraftActionHandler) iterator.next();
      h.onAction(fieldPath, action, jp);
    }
  }

  public void postAction(List<String> fieldPath, Actions action, JsonParser jp)
  {
    for (Iterator iterator = handlers.iterator(); iterator.hasNext();)
    {
      IDraftActionHandler h = (IDraftActionHandler) iterator.next();
      h.postAction(fieldPath, action, jp);
    }
  }

  public void onFieldName(Actions action, JsonParser jp) throws JsonParseException, IOException
  {
    for (Iterator iterator = handlers.iterator(); iterator.hasNext();)
    {
      IDraftActionHandler h = (IDraftActionHandler) iterator.next();
      h.onFieldName(action, jp);
    }
  }
}
