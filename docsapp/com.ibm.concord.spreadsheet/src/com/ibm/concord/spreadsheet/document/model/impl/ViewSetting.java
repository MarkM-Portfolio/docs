package com.ibm.concord.spreadsheet.document.model.impl;
import com.ibm.concord.spreadsheet.document.model.Broadcaster;
import com.ibm.concord.spreadsheet.document.model.Listener;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.ACTION;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.EventSource;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.TYPE;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;

public class ViewSetting extends Listener{
	private Document doc = null;
	
	public ViewSetting(Document doc){
		this.doc = doc;
		this.startListening(doc);
	}
	
	@Override
  public void notify(Broadcaster caster, NotifyEvent e)
  {
    EventSource event = e.getSource();
    ACTION act = event.getAction();
    TYPE type = event.getRefType();
    if(type == TYPE.ROW || type == TYPE.COLUMN){
      RangeInfo rangeInfo = (RangeInfo) event.getRefValue();
      switch (act)
        {
          case PREINSERT :
          case PREDELETE :
            if (type == TYPE.ROW)
            {
              updateFreezeRow((act == ACTION.PREINSERT), rangeInfo.getStartRow(), rangeInfo.getEndRow(),
                  this.doc.getSheetById(rangeInfo.getSheetId()));
            }
            else if (type == TYPE.COLUMN)
            {
              updateFreezeCol((act != ACTION.PREDELETE), rangeInfo.getStartCol(), rangeInfo.getEndCol(),
                  this.doc.getSheetById(rangeInfo.getSheetId()));
            }
            break;
        }
    }
  }
	
	private void updateFreezeRow (boolean bInsert, int startRow, int endRow, Sheet sheet){
		int delta = endRow - startRow + 1;
		int oldIndex = sheet.getFreezeRowIndex(), newIndex = oldIndex;
		if(startRow <= oldIndex){
			if(bInsert){
				newIndex += delta;
			}else{
				if(endRow < oldIndex)
					newIndex -= delta;
				else
					newIndex = Math.max(1, startRow - 1);
			}
		}
		sheet.setFreezeRowIndex(newIndex);
	}
	
	private void updateFreezeCol (boolean bInsert, int startCol, int endCol, Sheet sheet){
		if(endCol < 0) endCol = startCol;
		int delta = endCol - startCol + 1;
		int oldIndex = sheet.getFreezeColIndex(), newIndex = oldIndex;
		if(startCol <= oldIndex){
			if(bInsert){
				newIndex += delta;
			}else{
				if(endCol < oldIndex)
					newIndex -= delta;
				else
					newIndex = Math.max(1, startCol - 1);
			}
		}
		sheet.setFreezeColIndex(newIndex);
	}
}
