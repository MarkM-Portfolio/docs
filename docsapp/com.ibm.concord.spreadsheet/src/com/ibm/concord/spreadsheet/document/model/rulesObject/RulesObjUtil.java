package com.ibm.concord.spreadsheet.document.model.rulesObject;

import com.ibm.concord.spreadsheet.common.ReferenceParser;

public class RulesObjUtil
{
	public static enum VALUETYPE
	{
		NUMBER, STRING, BOOLEAN, FORMULA, UNKNOWN, ABSFORMULA, RELFORMULA, ERROR
	}
	
	public static enum RELREFTYPE
	{
		NONE, COLUMN, ROW, ALL
	}

	public static boolean isRelativeRef(int refMask)
	 {
		 if(((refMask & ReferenceParser.START_ROW) > 0 && (refMask & ReferenceParser.ABSOLUTE_ROW) == 0)
					|| ((refMask & ReferenceParser.START_COLUMN) > 0 && (refMask & ReferenceParser.ABSOLUTE_COLUMN) == 0)
					|| ((refMask & ReferenceParser.END_ROW) > 0 && (refMask & ReferenceParser.ABSOLUTE_END_ROW) == 0)
					|| ((refMask & ReferenceParser.END_COLUMN) > 0 && (refMask & ReferenceParser.ABSOLUTE_END_COLUMN) == 0))
			return true;
		return false;
	 }
	
	public static RELREFTYPE getRelativeRef(int refMask)
	 {	 
		 boolean relativeRow = false;
		 boolean relativeCol = false;
		 if(((refMask & ReferenceParser.START_ROW) > 0 && (refMask & ReferenceParser.ABSOLUTE_ROW) == 0)
					|| ((refMask & ReferenceParser.END_ROW) > 0 && (refMask & ReferenceParser.ABSOLUTE_END_ROW) == 0))
		 {
			 relativeRow = true;
		 }		
		 if(((refMask & ReferenceParser.START_COLUMN) > 0 && (refMask & ReferenceParser.ABSOLUTE_COLUMN) == 0)
					|| ((refMask & ReferenceParser.END_COLUMN) > 0 && (refMask & ReferenceParser.ABSOLUTE_END_COLUMN) == 0)) 
		 {
			 relativeCol = true;
		 }
		 
		 if (relativeRow && relativeCol){
			 return RELREFTYPE.ALL;
		 } else if (relativeCol) {
			 return RELREFTYPE.COLUMN;
		 } else if (relativeRow) {
			 return RELREFTYPE.ROW;
		 } else {
			 return RELREFTYPE.NONE;
		 }
	 }
	 
	 
}