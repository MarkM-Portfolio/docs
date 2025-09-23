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

import java.util.ArrayList;

import java.util.List;

import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil;
import com.ibm.concord.spreadsheet.document.message.IDManager;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Message implements IMessage {
	private static final Logger LOG = Logger.getLogger(Message.class.getName());
	protected JSONObject data; // jsonEvent
	public TokenId refTokenId = null; // the id of reference's refType

	protected enum OPType {
		Unknown, Sheet, Row, Column, Cell, UnnameRange
	};

	protected enum Action {
		Unknown, Insert, Delete, Move, Set, Lock, Release, Clear, Sort, Merge, Split, Filter, Freeze
	};

	public OPType type = OPType.Unknown; // message operation type
	public Action action = Action.Unknown; // message action

	// Token represents normalized cell address and stores the transformed cell
	// address
	static public class Token {
		// sheetname.[startcol][startrow]:[endcol][endrow]
		private String sheetName = null; // mandatory
		private String endSheetName = null;
		private int sheetIndex = -1;
		private int startRowIndex = -1; // optional - 0 based index
		private int endRowIndex = -1; // optional - 0 based index
		private int startColIndex = -1; // optional - 0 based index
		private int endColIndex = -1; // optional - 0 based index
		private boolean bFormulaToken = false; // the token comes from formula string?
		private ReferenceParser.ParsedRef ref = null;
		private OPType opType = OPType.Unknown;

		private void setRef(ReferenceParser.ParsedRef pRef, String curSheetName, OPType type) {
			opType = type;
			ref = pRef;
			if (pRef != null) {
				if (OPType.Sheet == opType) {
					sheetName = pRef.sheetName;
				} else {
					sheetName = ref.sheetName;
					if (sheetName == null)
						sheetName = curSheetName;
					if(ref.endSheetName != null)
						endSheetName = ref.endSheetName;
					startColIndex = ReferenceParser.translateCol(ref.startCol);
					startRowIndex = ReferenceParser.translateRow(ref.startRow);
					endColIndex = ReferenceParser.translateCol(ref.endCol);
					endRowIndex = ReferenceParser.translateRow(ref.endRow);

					// IDManager is 0-based index
					if (startColIndex > 0)
						--startColIndex;
					if (startRowIndex > 0)
						--startRowIndex;
					if (endColIndex > 0)
						--endColIndex;
					if (endRowIndex > 0)
						--endRowIndex;

					if (opType == null) {
						if (ParsedRefType.CELL == ref.type)
							opType = OPType.Cell;
						else if (ParsedRefType.RANGE == ref.type)
							opType = OPType.UnnameRange;
						else if (ParsedRefType.ROW == ref.type)
							opType = OPType.Row;
						else if (ParsedRefType.COLUMN == ref.type)
							opType = OPType.Column;
					}
				}
			}
		}

		public Token(ReferenceParser.ParsedRef ref, String curSheetName, OPType type) {
			this.setRef(ref, curSheetName, type);
		}

		public Token(String value, String curSheetName, OPType type) {
			ReferenceParser.ParsedRef ref = null;
			if (OPType.Sheet == type) {
				ref = new ReferenceParser.ParsedRef(value, null, null, null, null, null, ParsedRefType.SHEET, ReferenceParser.ABSOLUTE_NONE);
			} else {
				ref = ReferenceParser.parse(value);
			}
			this.setRef(ref, curSheetName, type);
		}

		protected int getIndex(OPType type) {
			int index = -1;
			switch (type) {
			case Row:
				index = startRowIndex;
				break;
			case Column:
				index = startColIndex;
				break;
			}

			return index;
		}

		protected int getCount(OPType type) {
			int count = 1;
			switch (type) {
			case Row:
				if (startRowIndex != -1 && endRowIndex != -1)
					count = endRowIndex - startRowIndex + 1;
				break;
			case Column:
				if (startColIndex != -1 && endColIndex != -1)
					count = endColIndex - startColIndex + 1;
				break;
			}

			return count;
		}

		protected int getSheetIndex() {
			return sheetIndex;
		}

		protected String getSheetName() {
			return sheetName;
		}

		protected String getEndSheetName() {
			return endSheetName;
		}
		
		protected int getStartRowIndex() {
			return startRowIndex;
		}

		protected int getEndRowIndex() {
			return endRowIndex;
		}

		protected int getStartColIndex() {
			return startColIndex;
		}

		protected int getEndColIndex() {
			return endColIndex;
		}

		protected void setSheetName(String name) {
			sheetName = name;
		}
		
		protected void setEndSheetName(String name) {
			endSheetName = name;
		}

		protected void setSheetIndex(int index) {
			sheetIndex = index;
		}

		protected void setStartRowIndex(int index) {
			startRowIndex = index;
		}

		protected void setStartColIndex(int index) {
			startColIndex = index;
		}

		protected void setEndRowIndex(int index) {
			endRowIndex = index;
		}

		protected void setEndColIndex(int index) {
			endColIndex = index;
		}

		protected OPType getType() {
			return opType;
		}

		protected void setFormulaToken() {
		    bFormulaToken = true;
		}
		
		protected boolean isFormulaToken() {
		    return bFormulaToken;
		}
		
		public String toString(boolean bSheet){
			if(bSheet){
				if (ref != null) {
					if (ref.sheetName != null)
						ref.sheetName = sheetName;
					if(ref.endSheetName != null)
						ref.endSheetName = endSheetName;
					return ref.toString();
				}
				 else
					return "";
			}else
				return toString();
		}
		
		/*
		 * Get cell address
		 */
		public String toString() {
			if (ref != null) {
				if (ref.sheetName != null)// keep the original address format
											// that with sheet name or not
					ref.sheetName = sheetName;
				if(ref.endSheetName != null)
					ref.endSheetName = endSheetName;
				// ReferenceParser is 1-based index instead
				ref.startCol = ReferenceParser.translateCol(startColIndex + 1);
				ref.startRow = ReferenceParser.translateRow(startRowIndex + 1);
				ref.endCol = ReferenceParser.translateCol(endColIndex + 1);
				ref.endRow = ReferenceParser.translateRow(endRowIndex + 1);
				return ref.toString();
			} else
				return "";
		}
	}

	/*
	 * TokenId represents id for cell address
	 */
	public static class TokenId {
		private String sheetId = null; // mandatory
		private String endSheetId = null;
		private String startRowId = null; // optional
		private String endRowId = null; // optional
		private String startColId = null; // optional
		private String endColId = null; // optional
		
		private Token token;

		// id range stores all row or column ids if one row or column range is
		// specified in cell addr
		// the id range can be used to search first row or column index if its
		// start or end row/column id
		// can't be found in IDManager.
		private String[] rowIdRange = null;
		private String[] colIdRange = null;

		public TokenId(Token token, IDManager im) {
			this.token = token;
			updateId(im);
		}

		protected String getSheetId() {
			return sheetId;
		}

		protected String[] getRowIdRange()
		{
			if(rowIdRange != null)
				return rowIdRange;
			else
			{
				String[] idRange = new String[1];
				idRange[0] = startRowId;
				return idRange;
			}
		}
		
		protected String[] getColIdRange()
		{
			if(colIdRange != null)
				return colIdRange;
			else
			{
				String[] idRange = new String[1];
				idRange[0] = startColId;
				return idRange;
			}
		}
		/*
		 * index --> Id transformation
		 * Won't transform row index for formula token if its row index is large than the maximum supported row index
		 */
		protected void updateId(IDManager idm) {
			if (idm == null)
				return;

			String sheetName = token.getSheetName();
			sheetId = idm.getSheetIdBySheetName(sheetName);
			if (sheetId == null)
				return;

			String endSheetName = token.getEndSheetName();
			if(endSheetName != null)
				endSheetId = idm.getSheetIdBySheetName(endSheetName);			
			
			boolean bFormulaToken = token.isFormulaToken();
			boolean bMaxStartRow = false, bMaxEndRow = false;
			int index = token.getStartRowIndex();
			if (index != -1) {
				if (!bFormulaToken)
				  startRowId = idm.getRowIdByIndex(sheetId, index, true);
				else {
				  if (index < ConversionConstant.MAX_REF_ROW_NUM)
				    startRowId = idm.getRowIdByIndex(sheetId, index, true);
				  else {
				    startRowId = ConversionConstant.MAX_REF;
				    bMaxStartRow = true;
				  }
				}
			}
			index = token.getStartColIndex();
			if (index != -1)
				startColId = idm.getColIdByIndex(sheetId, index, true);
			index = token.getEndRowIndex();
			if (index != -1) {
			    if (!bFormulaToken){
			      if(endSheetId != null)
			    	  endRowId = idm.getRowIdByIndex(endSheetId, index, true);
			      else
			    	  endRowId = idm.getRowIdByIndex(sheetId, index, true);
			    }
			    else {
			      if (index < ConversionConstant.MAX_REF_ROW_NUM){
		    	    if(endSheetId != null)
			    	    endRowId = idm.getRowIdByIndex(endSheetId, index, true);
			        else
			        	endRowId = idm.getRowIdByIndex(sheetId, index, true);
			      }
			      else {
			        endRowId = ConversionConstant.MAX_REF;
			        bMaxEndRow = true;
			      }
				}
			}
			index = token.getEndColIndex();
			if (index != -1){
				 if(endSheetId != null)
					 endColId = idm.getColIdByIndex(endSheetId, index, true);
				 else
					 endColId = idm.getColIdByIndex(sheetId, index, true);
			}

			OPType type = token.getType();
			int count;
			if (type == OPType.Row || type == OPType.UnnameRange) {
			    count = token.getCount(OPType.Row);
				if (count >= 2) {
					if (!bFormulaToken || (!bMaxStartRow && bMaxEndRow)) {
                        int startRowIndex = token.getStartRowIndex();
                        if (bFormulaToken && !bMaxStartRow)
                          count = ConversionConstant.MAX_REF_ROW_NUM - startRowIndex + 1;
					    
					    rowIdRange = new String[count];
					rowIdRange[0] = startRowId;
					rowIdRange[count - 1] = endRowId;
					for (int i = 1; i < count - 1; ++i) {
						// fill id into the idRange
						rowIdRange[i] = idm.getRowIdByIndex(sheetId, startRowIndex + i, true);
					    }
					}
				}
			}

			if (type == OPType.Column || type == OPType.UnnameRange) {
				count = token.getCount(OPType.Column);
				if (count >= 2) {
					colIdRange = new String[count];
					colIdRange[0] = startColId;
					colIdRange[count - 1] = endColId;
					int startColIndex = token.getStartColIndex();
					for (int i = 1; i < count - 1; ++i) {
						// fill id into the idRange
						colIdRange[i] = idm.getColIdByIndex(sheetId, startColIndex + i, true);
					}
				}
			}
		}

		protected Token getToken() {
			return token;
		}

		/*
		 * ID --> index transformation
		 * Won't transform the MAX_REF id for formula token which row index is large than the supported maximum row index
		 * 
		 * @param idm the latest version of IDManager
		 * 
		 * @return true if the id is found in IDManager false if id fails to be
		 * found in IDManager
		 */
		protected boolean updateToken(IDManager idm) {
			boolean success = true;
			boolean successRow = true;
			boolean successCol = true;

			if (idm == null)
				return false;
			if (sheetId == null) {
				token.setSheetName(null);
				return false;
			}

			String sheetName = idm.getSheetNameById(sheetId);
			if (sheetName == null)
				success = false;
			token.setSheetName(sheetName);
			
			if(endSheetId != null)
			{
				String endSheetName = idm.getSheetNameById(endSheetId);
				if(endSheetName == null)
					success = false;
				token.setEndSheetName(endSheetName);
			}

			int index = idm.getSheetIndexById(sheetId);
			token.setSheetIndex(index);

			boolean bFormulaToken = token.isFormulaToken();
			int oldStartRowIdx = token.getStartRowIndex();
			int oldEndRowIdx = token.getEndRowIndex();
			int delta = 0;
            		if (oldStartRowIdx != -1 && oldEndRowIdx != -1)
                		delta = oldEndRowIdx - oldStartRowIdx;
			
			if (startRowId != null) {
			  if( !startRowId.equalsIgnoreCase(ConversionConstant.MAX_REF))
			  {
				index = idm.getRowIndexById(sheetId, startRowId);
				if (index == -1) {
					success = successRow = false;
				}
				token.setStartRowIndex(index);
			  }
			}

			if (startColId != null) {
				index = idm.getColIndexById(sheetId, startColId);
				if (index == -1)
					success = successCol = false;
				if (index >= ConversionConstant.MAX_COL_NUM)
					success = successCol = false;
				token.setStartColIndex(index);
			}

			if (endRowId != null ) {
			  if( !endRowId.equalsIgnoreCase(ConversionConstant.MAX_REF))
			  {
				if(endSheetId != null)
					index = idm.getRowIndexById(endSheetId, endRowId);
				else
					index = idm.getRowIndexById(sheetId, endRowId);
				if (index == -1)
					success = successRow = false;
				
				token.setEndRowIndex(index);
			  } else if (bFormulaToken){
			      if (successRow) {
			        index = token.getStartRowIndex() + delta;
			        token.setEndRowIndex(index);
			      }
			  }
			}

			if (endColId != null) {
				if(endSheetId != null)
					index = idm.getColIndexById(endSheetId, endColId);
				else
					index = idm.getColIndexById(sheetId, endColId);
				if (index == -1)
					success = successCol = false;
				if (index >= ConversionConstant.MAX_COL_NUM)
				{
				  index = ConversionConstant.MAX_COL_NUM - 1;
				}
				token.setEndColIndex(index);
			}
			
			if(token.getEndRowIndex()>=ConversionConstant.MAX_ROW_NUM)
              token.setEndRowIndex(ConversionConstant.MAX_ROW_NUM - 1);

			if (success)
				return success;
			// reset success

			boolean found = false;
			if (rowIdRange != null) {
				successRow = true;
				index = token.getStartRowIndex();
				if (index == -1) {
					for (int i = 1; i < rowIdRange.length; ++i) {
						index = idm.getRowIndexById(sheetId, rowIdRange[i]);
						if (index != -1) {
							token.setStartRowIndex(index);
							found = true;
							break;
						}
					}

					if (!found)
						successRow = false;
				}

				index = token.getEndRowIndex();
				if (bFormulaToken && ConversionConstant.MAX_REF.equalsIgnoreCase(this.endRowId)) {
				    if (!successRow) {
				      // don't tranform the row index
				      successRow = true;
				    } else {
				      index = token.getStartRowIndex() + delta;
				      token.setEndRowIndex(index);
				    }
				} else if (index == -1) {
					found = false;
					for (int i = rowIdRange.length - 2; i >= 0; --i) {
						index = idm.getRowIndexById(sheetId, rowIdRange[i]);
						if (index != -1) {
							token.setEndRowIndex(index);
							found = true;
							break;
						}
					}

					if (!found)
						successRow = false;
				}
			}
			
			if (colIdRange != null) {
				successCol = true;
				index = token.getStartColIndex();
				if (index == -1) {
					found = false;
					for (int i = 1; i < colIdRange.length; ++i) {
						index = idm.getColIndexById(sheetId, colIdRange[i]);
						if (index != -1) {
							token.setStartColIndex(index);
							found = true;
							break;
						}
					}

					if (!found)
						successCol = false;
				}

				index = token.getEndColIndex();
				if (index == -1) {
					found = false;
					for (int i = colIdRange.length - 2; i >= 0; --i) {
						index = idm.getColIndexById(sheetId, colIdRange[i]);
						if (index != -1) {
						  
    						  if (index >= ConversionConstant.MAX_COL_NUM)
    						  {
    						    index = ConversionConstant.MAX_COL_NUM - 1;
    						  }
							token.setEndColIndex(index);
							found = true;
							break;
						}
					}

					if (!found)
						successCol = false;
				}
			}
//			if (rowIdRange == null && colIdRange == null)
//				return false;
			return successRow && successCol;
		}
	}

	/*
	 * utility class to transform formula string
	 */
	public static class FormulaTokenId {
		private ArrayList<FormulaToken> formulaTokenList = null;
		private ArrayList<TokenId> tokenIdList = null;

		private String value;
		private JSONArray tokenArr;

		public FormulaTokenId(String value, Object arr) {
			this.value = value;
			if(arr != null){
				tokenArr = (JSONArray)arr;
			}
		}

		// transform from index to id
		public void updateTokenId(IDManager idm, String sheetName) {
			// formula contains invalid cell reference
			if (value == null || value.indexOf(ConversionConstant.INVALID_REF) != -1)
				return;
			if(tokenArr != null)
				formulaTokenList = ConversionUtil.getTokenFromTokenArray(value, tokenArr);
			else
				formulaTokenList = ConversionUtil.getTokenFromFormula(value);
			tokenIdList = new ArrayList<TokenId>();
			for (int i = 0; i < formulaTokenList.size(); i++) {
				FormulaToken formulaToken = (FormulaToken) formulaTokenList.get(i);
				String text = formulaToken.getText();

				Token token = new Token(text, sheetName, null);
				token.setFormulaToken();
				TokenId tokenId = new TokenId(token, idm);
				tokenIdList.add(tokenId);
			}
		}

		// transform from id to token
		public boolean updateToken(IDManager idm) {
			if (value == null || formulaTokenList == null)
				return true;

			for (int i = 0; i < tokenIdList.size(); i++) {
				TokenId tokenId = tokenIdList.get(i);
				tokenId.updateToken(idm);
			}

			for (int i = 0; i < formulaTokenList.size(); i++) {
				FormulaToken formulaToken = (FormulaToken) formulaTokenList.get(i);

				Token token = tokenIdList.get(i).getToken();
				if(token.getSheetIndex() == -1)
					continue;
				String text = token.toString();

				formulaToken.setChangeText(text);
			}

			value = ConversionUtil.updateFormula(value, formulaTokenList, tokenArr);
			return true;
		}

		public String getValue() {
			return value;
		}
		
		public JSONArray getTokenArray(){
			return tokenArr;
		}
	}

	/*
	 * construct Message from jsonEvent and transform normalized refValue to id
	 */
	public Message(JSONObject jsonEvent, IDManager idm) {
		data = jsonEvent;

		String action = (String) jsonEvent.get(ConversionConstant.ACTION);

		if (action.equalsIgnoreCase(ConversionConstant.ACTION_SET))
			this.action = Action.Set;
		else if (action.equalsIgnoreCase(ConversionConstant.ACTION_INSERT))
			this.action = Action.Insert;
		else if (action.equalsIgnoreCase(ConversionConstant.ACTION_DELETE))
			this.action = Action.Delete;
		else if (action.equalsIgnoreCase(ConversionConstant.ACTION_MOVE))
			this.action = Action.Move;
		else if (action.equalsIgnoreCase(ConversionConstant.ACTION_CLEAR))
			this.action = Action.Clear;
		else if (action.equalsIgnoreCase(ConversionConstant.ACTION_LOCK))
			this.action = Action.Lock;
		else if (action.equalsIgnoreCase(ConversionConstant.ACTION_RELEASE))
			this.action = Action.Release;
		else if (action.equalsIgnoreCase(ConversionConstant.ACTION_SORT))
			this.action = Action.Sort;
		else if (action.equalsIgnoreCase(ConversionConstant.ACTION_FILTER))
			this.action = Action.Filter;		
		else if (action.equalsIgnoreCase(ConversionConstant.ACTION_MERGE))
			this.action = Action.Merge;
		else if (action.equalsIgnoreCase(ConversionConstant.ACTION_SPLIT))
			this.action = Action.Split;
		else if (action.equalsIgnoreCase(ConversionConstant.ACTION_FREEZE))
			this.action = Action.Freeze;

		JSONObject reference = (JSONObject) jsonEvent.get(ConversionConstant.REFERENCE);
		String refType = (String) reference.get(ConversionConstant.REF_TYPE);

		if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_CELL))
			this.type = OPType.Cell;
		else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_ROW))
			this.type = OPType.Row;
		else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_SHEET))
			this.type = OPType.Sheet;
		else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_COLUMN))
			this.type = OPType.Column;
		else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_UNNAMERANGE))
			this.type = OPType.UnnameRange;

		String refValue = getRefValue();
		Token token = new Token(refValue, null, this.type);
		this.refTokenId = new TokenId(token, idm);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.ibm.concord.spreadsheet.document.message.IMessage#getRefValue()
	 */
	public String getRefValue() {
		JSONObject reference = (JSONObject) data.get(ConversionConstant.REFERENCE);
		return (String) reference.get(ConversionConstant.REF_VALUE);
	}

	/*
	 * translate refValue from index to id
	 */
	public void transformRefByIndex(IDManager idm,boolean bCreate) {
		refTokenId.updateId(idm);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.ibm.concord.spreadsheet.document.message.IMessage#transformDataByIndex
	 * (com.ibm.concord.spreadsheet.document.message.IDManager)
	 */
	public void transformDataByIndex(IDManager idm) {
	}

	/*
	 * translate refValue from id to index
	 * 
	 * @return true if success transformation for refValue otherwise false
	 */
	public boolean transformRefById(IDManager idm) {
		return refTokenId.updateToken(idm);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.ibm.concord.spreadsheet.document.message.IMessage#transformDataById
	 * (com.ibm.concord.spreadsheet.document.message.IDManager)
	 */
	public boolean transformDataById(IDManager idm) {
		return true;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.ibm.concord.spreadsheet.document.message.IMessage#setRefValue(com
	 * .ibm.concord.spreadsheet.document.message.IDManager)
	 */
	public String setRefValue(IDManager idm) {
		Token token = refTokenId.getToken();

		return token.toString();
	}

	/*
	 * update message with transformed refValue;
	 * 
	 * @return the transformed JSON message
	 */
	public JSONObject toJSON(IDManager idm) {
		JSONObject jsonEvent = data;
		JSONObject reference = (JSONObject) jsonEvent.get(ConversionConstant.REFERENCE);
		String value = setRefValue(idm);
		reference.put(ConversionConstant.REF_VALUE, value);
		
		// change message's data (optional)
		setData();
		
		return data;
	}

	/*
	 * Change message's data.
     * Beside the transformation between index and id, there would have custom change for some types of messages
	 */
	public void setData() {
	}
	
	/*
	 * check if the message causes document structure change
	 * 
	 * @return true if the message causes document structure change otherwise
	 * false
	 */
	public boolean isStructChange() {
		if ((action == Action.Insert) || (action == Action.Delete) || (action == Action.Move) || (action == Action.Set && type == OPType.Sheet))
			return true;

		return false;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.ibm.concord.spreadsheet.document.message.IMessage#updateIDManager
	 * (com.ibm.concord.spreadsheet.document.message.IDManager, boolean)
	 */
	public boolean updateIDManager(IDManager idm, boolean reverse) {
		return true;
	}
	
	/*
	 * Transform message with traditional OT algorithm that compares one pair of message and
	 * use message semantic data to transform message index instead.
	 * Need to disable the mechanism of transforming between ID and index in order to make it work 
	 */
	public void updateIndex(Message msg) {
		return;
	}
	
	public static Message fromJSON(JSONObject jsonEvent, IDManager idm, boolean transSetCell){
		
		String action = (String) jsonEvent.get(ConversionConstant.ACTION);
		JSONObject reference = (JSONObject) jsonEvent.get(ConversionConstant.REFERENCE);
		String refType = (String) reference.get(ConversionConstant.REF_TYPE);

		Message msg = null;

		if (action.equalsIgnoreCase(ConversionConstant.ACTION_SET)) 
		{
			if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_CELL))
			{
				//If set cell event is updates for undo delete row/column, its data will not be transformed.
				if(transSetCell)
					msg = new SetCellMsg(jsonEvent, idm);
			}
			else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_SHEET)){
			    JSONObject o = (JSONObject)jsonEvent.get(ConversionConstant.DATA);
			    JSONObject sheet = (JSONObject)o.get("sheet");
			    if (sheet.get("visibility") != null)			    
			      msg = new SetSheetVisibilityMsg(jsonEvent, idm);
			    else if(sheet.get(ConversionConstant.OFFGRIDLINES) != null)
			      msg = new Message(jsonEvent, idm);
			    else
			      msg = new RenameSheetMsg(jsonEvent, idm);
			}
			else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_UNNAMERANGE))
				msg = new RangeMsg(jsonEvent, idm);
			else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_ROW))
				msg = new SetRowMsg(jsonEvent, idm);
			else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_COLUMN))
				msg = new SetColumnsMsg(jsonEvent, idm);
			else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_CHART))
				msg = new SetChartMsg(jsonEvent, idm);
		} else if (action.equalsIgnoreCase(ConversionConstant.ACTION_INSERT)) {
			if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_SHEET))
				msg = new InsertSheetMsg(jsonEvent, idm);
			else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_ROW))
				msg = new InsertRowMsg(jsonEvent, idm);
			else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_COLUMN))
				msg = new InsertColumnMsg(jsonEvent, idm);
			else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_UNNAMERANGE))
				msg = new InsertRangeMsg(jsonEvent, idm);
		} else if (action.equalsIgnoreCase(ConversionConstant.ACTION_DELETE)) {
			if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_SHEET))
				msg = new DeleteSheetMsg(jsonEvent, idm);
			else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_ROW))
				msg = new DeleteRowMsg(jsonEvent, idm);
			else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_COLUMN))
				msg = new DeleteColumnMsg(jsonEvent, idm);
			else if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_RANGE))
				msg = new DeleteRangeMsg(jsonEvent, idm);
		} else if (action.equalsIgnoreCase(ConversionConstant.ACTION_MOVE)) {
			if (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_SHEET))
				msg = new MoveSheetMsg(jsonEvent, idm);
		} else if (action.equalsIgnoreCase(ConversionConstant.ACTION_SORT)) {
			msg = new SortMsg(jsonEvent, idm);
		} else if (action.equalsIgnoreCase(ConversionConstant.ACTION_FILTER)) {
				msg = new FilterMsg(jsonEvent, idm);
		} else if (action.equalsIgnoreCase(ConversionConstant.ACTION_FREEZE)) {
				msg = new FreezeMsg(jsonEvent, idm);
		}

		// no need to use subclass Message class
		if (msg == null)
			msg = new Message(jsonEvent, idm);
		
		return msg;
	}
	
	public JSONArray getEvents(IDManager idm)
	{
		return null;
	}

	/*
	 * construct message from json array
	 */
	public static List<Message> fromJSONArray(JSONArray jsonList, IDManager idm) {
		List<Message> msgList = new ArrayList<Message>();
		boolean bNotInsert = true;
		for (int i = 0; i < jsonList.size(); i++) {
			JSONObject jsonEvent = (JSONObject) jsonList.get(i);
			//If set cell is master event, its data should be transformed.
			//If set cell event is updates for undo delete row/column, its data will not be transformed.
			//But if it is updates for cut event, its data should be transformed.
			Message msg = fromJSON(jsonEvent, idm, bNotInsert);

			if((i == 0) && (msg.action == Message.Action.Insert))
				bNotInsert = false;
			msgList.add(msg);
		}

		return msgList;
	}
}
