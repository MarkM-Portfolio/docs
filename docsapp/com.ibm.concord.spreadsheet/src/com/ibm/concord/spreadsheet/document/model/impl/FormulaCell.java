package com.ibm.concord.spreadsheet.document.model.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.document.model.Broadcaster;
import com.ibm.concord.spreadsheet.document.model.Listener;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.ACTION;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.EventSource;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.TYPE;
import com.ibm.concord.spreadsheet.document.model.formula.Area;
import com.ibm.concord.spreadsheet.document.model.formula.AreaManager;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaErrProperty;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.ReferenceToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.TokenType;
import com.ibm.concord.spreadsheet.document.model.formula.NameArea;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.CATEGORY;

/**
 * <p>
 * Model that stores formula tokens in a value cell. A FormulaCell cannot exist on its own, it has to be a member in a {@link ValueCell}. In
 * the case that we didn't load cells as models, FormulaCell lives in a map of { columnId: FormulaCell } in a {@link Row}.
 * <p>
 * A FormulaCell will never be put in an ordered list, so it doesn't need to extends {@link BasicModel}, like other models do.
 */
public class FormulaCell extends Listener
{
  public final static Logger LOG = Logger.getLogger(FormulaCell.class.getName());

  // store the reference token in the order of the reference index in the formula string
  private List<FormulaToken> tokenList;

  // if the cell has been parsed or not
  private boolean bParsed;

  private Sheet sheet;
  private int rowId, colId;
  //the flag for event happens
  private boolean bUpdateFormula;//formula need to update
  private boolean bDirty;//formula need to recalculate
  
  private int errProps;
  
  //the cell linked list which need be tracked when datachanged
  public FormulaCell next;
  public FormulaCell pre;

  public FormulaCell(Sheet st, int rId, int cId)
  {
    sheet = st;
    rowId = rId;
    colId = cId;
    tokenList = new ArrayList<FormulaUtil.FormulaToken>();
  }

  public void reset()
  {
    if (tokenList == null)
    {
      tokenList = new ArrayList<FormulaToken>();
    }

    clearRef();

    bParsed = false;
    bUpdateFormula = false;
    bDirty = false;
    errProps = FormulaErrProperty.NONE.getValue();
  }

  public void clearRef()
  {
    int size = tokenList.size();
    for (int i = size - 1; i >= 0; i--)
    {
      FormulaToken token = tokenList.get(i);
      Area a = token.getArea();
      if(a != null)
      {
        getSheet().getParent().getAreaManager().endListeningArea(a, this);
      }
    }
    tokenList.clear();
  }

  public boolean deleteRef(FormulaToken token)
  {
    Area a = token.getArea();
    if(a != null)
    {
      getSheet().getParent().getAreaManager().endListeningArea(a, this);
    }
    return tokenList.remove(token);
  }

  /**
   * push the token to cell's token list, and the position of the token in tokenList is in the order of token index
   * 
   * @param token
   *          the token for reference
   * @return the refrence id
   */
  public void pushRef(FormulaToken token)
  {
    pushRef(token, tokenList.size());
  }

  /**
   * push reference token at specified index
   * 
   * @param token
   * @param index
   * @return
   */
  public void pushRef(FormulaToken token, int index)
  {
    if (token != null)
      tokenList.add(index, token);
  }

  /**
   * set the token list which store all the reference tokens to the current cell and should add reference of each token to the reference
   * list
   * 
   * @param list
   *          the new token list which will replace the current token list of cell
   */
  public void setTokenList(List<FormulaToken> list)
  {
    if (list != null)
    {
      tokenList.clear();
      for (int i = 0; i < list.size(); i++)
      {
        FormulaToken token = list.get(i);
        pushRef(token);
      }
    }
  }

  public List<FormulaToken> getTokenList()
  {
    return tokenList;
  }

  public boolean isParsed()
  {
    return bParsed;
  }

  public void setParsed(boolean parsed)
  {
    this.bParsed = parsed;
  }

  public Sheet getSheet()
  {
    return sheet;
  }

  public boolean containWholeRowColRef()
  {
    for (int i = 0; i < tokenList.size(); i++)
    {
      FormulaToken token = tokenList.get(i);
      if(token instanceof ReferenceToken)
      {
        Area area = ((ReferenceToken)token).getArea();
        if(area != null) {
          ReferenceParser.ParsedRefType type = area.getType();
          if(type == ReferenceParser.ParsedRefType.ROW || type == ReferenceParser.ParsedRefType.COLUMN)
            return true;
        }
      }
    }
    return false;
  }
  
  public void setDirty(boolean bD)
  {
    setDirty(bD, false);
  }
  
  public void setDirty(boolean bD, boolean isDocumentLoading)
  {
    bDirty = bD;
    if(bDirty && !isDocumentLoading)
      appendToFormulaTrack();
  }
  
  public boolean isDirty()
  {
    return bDirty;
  }
  
  public boolean isUpdateFormula()
  {
    return bUpdateFormula;
  }
  
  public void updateErrProps(FormulaErrProperty p)
  {
    errProps |= p.getValue();
  }
  
  public void updateErrProps(Integer i)
  {
    if(i != null)
      errProps |= i;
  }
  
  public void setErrProps(FormulaErrProperty p)
  {
    errProps = p.getValue();
  }
  
  public void setErrProps(Integer i)
  {
    if(i != null)
      errProps = i;
  }
  
  public int getErrProps()
  {
    return errProps;
  }
  
  public boolean containErrProp(FormulaErrProperty p)
  {
    int r = errProps & p.getValue();
    return r > 0;
  }
  
  @Override
  public void notify(Broadcaster caster, NotifyEvent e)
  {
    //set dirty when set cell, and set formula update when delete/insert
    if(e.getCategory() == CATEGORY.DATACHANGE)
    {
      EventSource source = e.getSource();
    //TODO: check if care show/hide and other properties,
      if (source.getRefType() == TYPE.AREA)
      {
        bDirty = true;
        if(source.getAction() == ACTION.INSERT)
        {
          NameArea area = (NameArea)source.getRefValue();
          updateNameToken(area.getId(), area);
        } else if(source.getAction() == ACTION.DELETE)
        {
          NameArea area = (NameArea)caster;
          updateNameToken(area.getId(), null);
        }
      }
      else if (source.getRefType() == TYPE.SHEET)
      {
        RangeInfo range = (RangeInfo)source.getRefValue();
        int sheetId = range.getSheetId();
        
        // for predelete sheet event, set dirty and update formula flag for cells which are not in this delete sheet
        if(source.getAction() == ACTION.PREDELETE)
        {
          if(sheetId != sheet.getId())
          {
            bUpdateFormula = true;
            bDirty = true;
          }
        }
        else if(source.getAction() == ACTION.SET || source.getAction() == ACTION.PREMOVE)//rename sheet and move sheet for 3d reference
        {
          bDirty = true;
          if (source.getAction() == ACTION.SET)
            bUpdateFormula = true;
          else if (source.getAction() == ACTION.PREMOVE) {
            if(source.getData() != null) {
              Boolean bUpdate = (Boolean)source.getData().get("addressChanged");
              if(bUpdate != null && bUpdate.booleanValue())
                bUpdateFormula = true;
            }
          }
        }
        //TODO for cell care the sheet position should set dirty when serialize
      }
      else if ((source.getAction() == ACTION.PREINSERT || source.getAction() == ACTION.PREDELETE))
      {
        if (source.getRefType() == TYPE.ROW || source.getRefType() == TYPE.COLUMN)
        {
          bUpdateFormula = true;
          bDirty = true;
        }
      }
      else if (source.getAction() == ACTION.SET )
      {
        bDirty = true;
      }
      else if(source.getAction() == ACTION.SHOW || source.getAction() == ACTION.HIDE )
      {
        if(containErrProp(FormulaErrProperty.CARE_SHOWHIDE))
          bDirty = true;
      }
      else if(source.getAction() == ACTION.FILTER)
      {
        if(containErrProp(FormulaErrProperty.CARE_FILTER))
          bDirty = true;
      }
//      else
//        LOG.log(Level.WARNING, "Formula Cell can not support event with {0} {1}", new String[] { source.getAction().toString(),
//            source.getRefType().toString() });
      
      if(bDirty)
        appendToFormulaTrack();
    }
  }
  

  //update the area for name token
  private void updateNameToken(String id, NameArea area)
  {
    for(int i = 0; i < tokenList.size(); i++)
    {
      FormulaToken token = tokenList.get(i);
      if(token.getType() == TokenType.NAME && id.equalsIgnoreCase(token.getText()))
      {
        ReferenceToken refToken = (ReferenceToken)token;
        refToken.setArea(area);
        area.addListener(this);
      }
    }
  }

  private void appendToFormulaTrack()
  {
    Document doc = sheet.getParent();
    if(doc != null)
    {
      AreaManager man = doc.getAreaManager();
      man.appendToFormulaTrack(this);
    }
  }
  
  public RangeInfo getPos()
  {
    IDManager idMan = sheet.getIDManager();
    int colIndex = idMan.getColIndexById(sheet.getId(), colId);
    int rowIndex = idMan.getRowIndexById(sheet.getId(), rowId);
    return new RangeInfo(sheet.getId(), rowIndex, colIndex, rowIndex, colIndex, ParsedRefType.CELL);
  }
}
