/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.document.message;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class SetCellMsg extends Message {
	private FormulaTokenId formulaTokenId;
	private TokenId colSpanTokenId;
	
	public SetCellMsg(JSONObject jsonEvent, IDManager idm) {
		super(jsonEvent, idm);

		JSONObject o = (JSONObject) jsonEvent.get(ConversionConstant.DATA);
		JSONObject jsonCell = (JSONObject) o.get("cell");
		
		if(jsonCell == null)// it is one invalid message. make the code robust in order to handle it.
			jsonCell = new JSONObject();
		Object value = jsonCell.get(ConversionConstant.VALUE_A);
		if (value != null && MessageUtil.isFormulaString(value.toString())) {
			formulaTokenId = new FormulaTokenId(value.toString(), jsonCell.get(ConversionConstant.TOKENARRAY));
		}
		Object colspan = jsonCell.get(ConversionConstant.COLSPAN_A);
		if(colspan!=null)
		{
			int nColSpan = ((Number)colspan).intValue();
			if(nColSpan>1)
			{
				Token token = refTokenId.getToken();
				int rowIndex = token.getStartRowIndex()+1;
				int colIndex = token.getStartColIndex()+1;
				int endCol = colIndex + nColSpan - 1;
				String strCol = ReferenceParser.translateCol(endCol);
				String ref = getRefValue() + ":" + strCol + rowIndex;
				Token newToken = new Token(ref,token.getSheetName(),OPType.UnnameRange);
				colSpanTokenId = new TokenId(newToken,idm);
			}
		}
	}	

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.ibm.concord.spreadsheet.document.message.Message#transformDataByIndex
	 * (com.ibm.concord.spreadsheet.document.message.IDManager)
	 */
	public void transformDataByIndex(IDManager idm) {
		if(formulaTokenId!=null)
			formulaTokenId.updateTokenId(idm,refTokenId.getToken().getSheetName());
		if(colSpanTokenId!=null)
			colSpanTokenId.updateId(idm);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.ibm.concord.spreadsheet.document.message.Message#transformDataById
	 * (com.ibm.concord.spreadsheet.document.message.IDManager)
	 */
	public boolean transformDataById(IDManager idm) {
		if (formulaTokenId != null || colSpanTokenId!=null)
		{
			JSONObject o = (JSONObject) data.get(ConversionConstant.DATA);
			JSONObject jsoncell = (JSONObject) o.get("cell");
			if(formulaTokenId != null)
			{
				formulaTokenId.updateToken(idm);
				jsoncell.put(ConversionConstant.VALUE_A, formulaTokenId.getValue());
				JSONArray tokenArr = formulaTokenId.getTokenArray();
				if(tokenArr != null && !tokenArr.isEmpty())
					jsoncell.put(ConversionConstant.TOKENARRAY, tokenArr);
			}
			if(colSpanTokenId!=null)
			{
				colSpanTokenId.updateToken(idm);
				int colspan = colSpanTokenId.getToken().getCount(OPType.Column);
				if(colspan>1)
					jsoncell.put(ConversionConstant.COLSPAN_A, colspan);
				else
					jsoncell.remove(ConversionConstant.COLSPAN_A);
			}
		}

		return true;
	}
}