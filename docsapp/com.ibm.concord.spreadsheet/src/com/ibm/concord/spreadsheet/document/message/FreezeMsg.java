package com.ibm.concord.spreadsheet.document.message;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.json.java.JSONObject;

public class FreezeMsg extends Message {

	private int startIndex = -1;
	
	public FreezeMsg(JSONObject jsonEvent, IDManager idm) 
	{
		super(jsonEvent, idm);
		if(this.type == OPType.Row)
			startIndex = refTokenId.getToken().getStartRowIndex();
		else if(this.type == OPType.Column)
			startIndex = refTokenId.getToken().getStartColIndex();
	}

	public boolean transformRefById(IDManager idm) 
	{
		refTokenId.updateToken(idm);
		int index = idm.getSheetIndexById(refTokenId.getSheetId());
		if(index==-1)
			return false;
		return true;
	}
	
	public void updateIndex(Message msg) 
	{
		if(this.type != msg.type || this.type == OPType.Sheet) 
			return;
		
		if(!this.refTokenId.getSheetId().equals(msg.refTokenId.getSheetId()))
		  return;
		
		Token token = msg.refTokenId.getToken();
		int stIndex = -1, etIndex = -1;
		if(msg.type == OPType.Row)
		{
			stIndex = token.getStartRowIndex();
			etIndex = token.getEndRowIndex();
			if( etIndex == -1)
				etIndex = stIndex;
		}
		else if(msg.type == OPType.Column)
		{
			stIndex = token.getStartColIndex();
			etIndex = token.getEndColIndex();
			if( etIndex == -1)
				etIndex = stIndex;
		}
		int cnt = token.getCount(msg.type);
		if(msg.action == Action.Insert)
		{
			if(stIndex<= startIndex)
			{
				startIndex += cnt;
				if(this.type == OPType.Row && startIndex >= ConversionConstant.MAX_SHOW_ROW_NUM)
					startIndex = ConversionConstant.MAX_SHOW_ROW_NUM -1;
				else if(this.type == OPType.Column && startIndex >= ConversionConstant.MAX_SHOW_COL_NUM)
					startIndex = ConversionConstant.MAX_SHOW_COL_NUM -1;
			}
		}
		else if(msg.action == Action.Delete)
		{
			if(startIndex > etIndex)
				startIndex -= cnt;
			else if( startIndex >= stIndex && startIndex <= etIndex)
				startIndex = stIndex-1;
			if(startIndex < 0)
				startIndex = 0;
		}
	}
	
	public String setRefValue(IDManager idm)
	{
		Token token = refTokenId.getToken();
		String sheetName = token.getSheetName();
		sheetName = ReferenceParser.formatSheetName(sheetName);
		String refValue = sheetName;
		if(this.type == OPType.Row)
			refValue = sheetName + "!" + (startIndex + 1) ;
		else if( this.type == OPType.Column)
			refValue = sheetName + "!" + ReferenceParser.translateCol(startIndex + 1);
		else
			refValue = token.getSheetName();
		return refValue;
	}
}
