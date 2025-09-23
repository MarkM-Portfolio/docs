package com.ibm.concord.writer.model;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class TableCell extends ModelObject {
	public TableRow parent;

	TableCell(JSONObject jsonobj) {
		super(jsonobj);
		this.modelType = "tableCell";
	}

	TableCell(JSONObject jsonobj, TableRow row) {
		super(jsonobj);
		this.modelType = "tableCell";
		this.parent = row;
	}
	public void toMerge(){
		JSONObject object  = new JSONObject();
		this.setCellPr("vMerge", object);
		this.removeContents();	
	}
	public boolean isMerged(){
		JSONObject object  = this.getMergedJson();
		if(object!=null){
			if(object.get("val")==null){
				return true;
			}
		}
		return false;
	}
	public void setMergedStart(){
		if(this.isMergedStart()){
			return;
		}
		JSONObject object  = this.getMergedJson();
		if(object==null){
			object = new JSONObject();
			this.setCellPr("vMerge", object);
		}
		object.put("val", "restart");
	}
	public boolean isMergedStart(){
		JSONObject object  = this.getMergedJson();
		if(object!=null){
			Object o = object.get("val");
			if(o!=null&&o.toString().equalsIgnoreCase("restart")){
				return true;
			}
		}
		return false;
	}
	public void removeMergeStart(){
		if(!this.isMergedStart()){
			return;
		}
			
		JSONObject object = this.getMergedJson();
		if(object!=null){
			object.remove("val");
		}
	}
	public int getColSpan() {
		JSONObject colSpanJson = this.getColSpanJson();
		if (colSpanJson != null) {
			return Integer.parseInt(colSpanJson.get("val").toString());
		}
		return 1;
	}
	public void setColSpan(int span) {
		JSONObject colSpanJson = this.getColSpanJson();
		if(colSpanJson==null){
			colSpanJson = new JSONObject();
			this.setCellPr("gridSpan", colSpanJson); 
		}
		colSpanJson.put("val", span);
	}
	public void setBorder(JSONObject val){
		JSONObject pro = this.getCellPr();
		if (pro == null && !val.isEmpty())
		{
			pro = new JSONObject();
			this.jsonobj.put("tcPr", pro);
		}
		if(pro != null)
			pro.put("tcBorders", val);
	}
	
	public void setBorder(JSONObject val,boolean spread){
		this.setBorder(val);
		if(!spread)
			return;
		
		JSONObject table = this.parent.parent.jsonobj;
		JSONArray rows = (JSONArray) table.get("trs");
		int currentRowIdx = -1;
		int currentColIdx = -1;
		int rowsLen = rows.size();
		// get current rowIndex & colIndex
		for(int rowIdx = 0; rowIdx < rowsLen; rowIdx ++){
			JSONArray rowCells = (JSONArray) ((JSONObject) rows.get(rowIdx))
					.get("tcs");
			int colsLen = rowCells.size();
			for(int colIdx = 0; colIdx < colsLen; colIdx++){
				JSONObject cell = (JSONObject) rowCells.get(colIdx);
				if(cell.get("id") == this.jsonobj.get("id")){
					currentRowIdx = rowIdx;
					currentColIdx = colIdx;
					break;
				}
			}
			if(currentRowIdx != -1)
				break;
		}
		if(currentRowIdx == -1 || currentColIdx == -1)
			return;
		// fix vMerged cell borders
		JSONArray rowCells = (JSONArray) ((JSONObject) rows.get(currentRowIdx))
				.get("tcs");
		JSONObject leftBorder = (JSONObject) val.get("left");
		JSONObject rightBorder = (JSONObject) val.get("right");
		if(currentColIdx > 0){
			// change left vMerge cell's right border
			JSONObject preCell = (JSONObject) rowCells.get(currentColIdx - 1);
			JSONObject prePro = (JSONObject) preCell.get("tcPr");
			if(prePro != null){
				JSONObject vMerge = (JSONObject) prePro.get("vMerge");
				if(vMerge !=null && vMerge.isEmpty()){
					JSONObject mergedBorder = (JSONObject) prePro.get("tcBorders");
					if(mergedBorder == null && leftBorder != null){
						mergedBorder = new JSONObject();
						prePro.put("tcBorders",mergedBorder);
					}
					if(mergedBorder != null)
						mergedBorder.put("right", leftBorder);
				}
			}
		}
		if(currentColIdx < rowCells.size() -1){ //right vMerge cell
			// change right vMerge cell's 
			JSONObject nextCell = (JSONObject) rowCells.get(currentColIdx + 1);
			JSONObject nextPro = (JSONObject) nextCell.get("tcPr");
			if(nextPro != null){
				JSONObject vMerge = (JSONObject) nextPro.get("vMerge");
				if(vMerge !=null && vMerge.isEmpty()){
					JSONObject mergedBorder = (JSONObject) nextPro.get("tcBorders");
					if(mergedBorder == null && rightBorder != null){
						mergedBorder = new JSONObject();
						nextPro.put("tcBorders",mergedBorder);
					}
					if(mergedBorder != null)
						mergedBorder.put("left", rightBorder);
				}
			}
		}
		JSONObject bottomBorder = (JSONObject) val.get("bottom");
		int colSpansBefore = GetColSpanCntUntil(rowCells, currentColIdx);
		boolean leftChangeSpan = true,rightChangeSpan = true;
		for(int rowIdx = currentRowIdx + 1;rowIdx<rowsLen;rowIdx++){
			rowCells = (JSONArray) ((JSONObject) rows.get(rowIdx))
					.get("tcs");
			int changeIdx = GetAlignedColIdx(rowCells,
					colSpansBefore);
			if(changeIdx >= rowCells.size()) //no cell below
				break;
			JSONObject cell = (JSONObject) rowCells.get(changeIdx);
			if(cell == null)
				break;
			JSONObject cellPro = (JSONObject) cell.get("tcPr");
			if(cellPro == null)
				break;
			JSONObject vMerge = (JSONObject) cellPro.get("vMerge");
			if(vMerge == null || !vMerge.isEmpty())
				break;
			JSONObject mergedBorder = (JSONObject) cellPro.get("tcBorders");
			// did the vMerged cell below changed it's left
			boolean changeLeft = (changeIdx == 0);
			if(leftChangeSpan && changeIdx > 0){
				JSONObject preCell = (JSONObject) rowCells.get(changeIdx - 1);
				JSONObject prePro = (JSONObject) preCell.get("tcPr");
				if(prePro != null){
					JSONObject preVMerge = (JSONObject) prePro.get("vMerge");
					if(preVMerge !=null && preVMerge.isEmpty()){
						// the left cell of vMerged cell is vMerged 
						// it maybe omit 
						JSONObject preBorder = (JSONObject) prePro.get("tcBorders");
						if(preBorder == null && leftBorder != null){
							preBorder = new JSONObject();
							prePro.put("tcBorders",preBorder);
						}
						if(preBorder != null)
							preBorder.put("right", leftBorder);
						changeLeft = true;
					}else
						leftChangeSpan = false; //should be changed in other TableCell.setBorder of msgList
				}else
					leftChangeSpan = false;//should be changed in other TableCell.setBorder of msgList
			}

			// did the vMerged cell below changed it's right
			boolean changeRight = (changeIdx == (rowCells.size() - 1));
			if(rightChangeSpan && changeIdx < rowCells.size() - 1){
				JSONObject nextCell = (JSONObject) rowCells.get(changeIdx + 1);
				JSONObject nextPro = (JSONObject) nextCell.get("tcPr");
				if(nextPro != null){
					JSONObject nextVMerge = (JSONObject) nextPro.get("vMerge");
					if(nextVMerge !=null && nextVMerge.isEmpty()){
						// the right cell of vMerged cell is vMerged 
						// it maybe omit 
						JSONObject nextBorder = (JSONObject) nextPro.get("tcBorders");
						if(nextBorder == null && rightBorder != null){
							nextBorder = new JSONObject();
							nextPro.put("tcBorders", nextBorder);
						}
						if(nextBorder != null)
							nextBorder.put("left", rightBorder);
						changeRight = true;
					}else
						rightChangeSpan = false;//should be changed in other TableCell.setBorder of msgList
				}else
					rightChangeSpan = false;//should be changed in other TableCell.setBorder of msgList
			}
			boolean needInset = bottomBorder != null || (changeLeft && leftBorder != null) || (changeRight && rightBorder != null);
			if(mergedBorder == null && needInset){
				mergedBorder = new JSONObject();
				cellPro.put("tcBorders", mergedBorder);
			}
			if(mergedBorder != null){
				mergedBorder.put("top", bottomBorder);
				mergedBorder.put("bottom", bottomBorder);
				if(changeLeft)
					mergedBorder.put("left", leftBorder);
				if(changeRight)
					mergedBorder.put("right", rightBorder);
			}
			
			
		}
	}
	private JSONObject getColSpanJson() {
		JSONObject tcPr = this.getCellPr();
		if (tcPr == null) {
			return null;
		}
		JSONObject gridSpan = (JSONObject) tcPr.get("gridSpan");
		return gridSpan;
	}
	private JSONObject getMergedJson(){
		JSONObject tcPr = this.getCellPr();
		if (tcPr == null||tcPr.get("vMerge")==null) {
			return null;
		}
		return (JSONObject)tcPr.get("vMerge");
	}
	private JSONObject getCellPr() {
		JSONObject tcPr = (JSONObject) this.jsonobj.get("tcPr");
		return tcPr;
	}
	private void setCellPr(String key, Object value){
		JSONObject tcPr = this.getCellPr();
		if(tcPr==null){
			tcPr = new JSONObject();
			this.jsonobj.put("tcPr", tcPr);
		}
		if(value==null){
			tcPr.remove(key);
		}else{
			tcPr.put(key, value);
		}
		
	}
	public TableCell next(){
		return this.parent.nextCell(this);
	}
	public TableCell prev(){
		return this.parent.preCell(this);
	}
	
	
	
	public void removeContents(){
		this.jsonobj.remove("ps");
	}
	@Override
	public void insertElement(int index, JSONObject element) {
		JSONArray children = (JSONArray) ((JSONObject) this.jsonobj).get("ps");
		children.add(index, element);
	}

	@Override
	public void setStyle(JSONObject styles) {
		if (null == styles || styles.isEmpty()) {
			return;
		}
		String type = (String) styles.get("type");
		if (type.equals("cellColor")) {
			Object cnt = styles.get("cnt");
			JSONObject shd =null;
			if(cnt!=null&&!cnt.equals("")){
				shd = (JSONObject) cnt;
			}
			if(shd!=null&&!shd.isEmpty()){
				this.setCellPr("shd", shd);
			}else{
				this.setCellPr("shd", null);
			}			
		} else if (type.equals("cnSt")) {
			Object o = styles.get("v");
			if(o instanceof JSONObject){
				JSONObject cnfSt = (JSONObject) o;
				JSONObject tcPr = this.getCellPr();
				if (cnfSt == null || cnfSt.isEmpty()) {
					tcPr.remove("cnfStyle");
				} else {
					tcPr.put("cnfStyle", cnfSt);
				}
			}
			
		}

	}

	int GetColSpanCntUntil(JSONArray rowCells, int cellIdx) {
		int colSpansBeforeCell = 0;
		if (rowCells != null)
		{
    		for (int j = 0; j < cellIdx; j++) {
    			JSONObject tmpCell = (JSONObject) rowCells.get(j);
    			JSONObject tmpTcPr = (JSONObject) tmpCell.get("tcPr");
    			if (tmpTcPr == null) {
    				colSpansBeforeCell += 1;
    				continue;
    			}
    			JSONObject tmpGridSpan = (JSONObject) tmpTcPr.get("gridSpan");
    			int tmpColSpan = tmpGridSpan == null ? 1 : Integer
    					.parseInt(tmpGridSpan.get("val").toString());
    			colSpansBeforeCell += tmpColSpan;
    		}
		}
		return colSpansBeforeCell;
	}

	int GetAlignedColIdx(JSONArray rowCells, int colSpansCount) {
		int insertCellIdx = 0, currentTotalColSpans = 0;
		if (rowCells != null)
	    {
    		while (currentTotalColSpans < colSpansCount) {
    			JSONObject tmpCell = (JSONObject) rowCells.get(insertCellIdx++);
    			JSONObject tmpTcPr = (JSONObject) tmpCell.get("tcPr");
    			if (tmpTcPr == null) {
    				currentTotalColSpans += 1;
    				continue;
    			}
    			JSONObject tmpGridSpan = (JSONObject) tmpTcPr.get("gridSpan");
    			int tmpColSpan = tmpGridSpan == null ? 1 : Integer
    					.parseInt(tmpGridSpan.get("val").toString());
    			currentTotalColSpans += tmpColSpan;
    		}
	    }
		return insertCellIdx;
	}

	@Override
	public void setAttributes(JSONObject atts) {
		if (null == atts || atts.isEmpty()) {
			return;
		}
//        String tp = (String) atts.get("type");
//        if(tp != null && tp.equalsIgnoreCase("tcPrCh"))
//        {
//            if (atts.containsKey("ch"))
//            {
//                JSONArray tcPrCh = (JSONArray) jsonobj.get("tcPrCh");
//                if (tcPrCh == null)
//                {
//                  tcPrCh = new JSONArray();
//                  jsonobj.put("tcPrCh", tcPrCh);
//                }
//                tcPrCh.clear();
//                tcPrCh.addAll((JSONArray) atts.get("ch"));
//            }
//            return;
//        }
		
		if(atts.get("border")!=null){
			JSONObject border = (JSONObject)atts.get("border");
			Object spread = atts.get("spread");
			boolean isSpread = (spread == null || (Boolean)spread != false);
			this.setBorder(border,isSpread);
			return;
		}

		String rowSpan = atts.get("rowSpan").toString();
		String colSpan = atts.get("colSpan").toString();
		String tableID = (String) atts.get("table");
		String sRowIdx = atts.get("rowIdx").toString();
		
		int rSpan = Integer.parseInt(rowSpan);
		int cSpan = Integer.parseInt(colSpan);
		int rowIdx = Integer.parseInt(sRowIdx);

		JSONObject tcPr = (JSONObject) this.jsonobj.get("tcPr");
		JSONObject gridSpan = null;
		int currentColSpan = 1;
		if (tcPr != null) {
			gridSpan = (JSONObject) tcPr.get("gridSpan");
			
			if (null != gridSpan) {
				currentColSpan = Integer.parseInt(gridSpan.get("val").toString());
			}
		}

		JSONObject table = MessageUtil.getById(content, tableID);
		JSONArray rows = (JSONArray) table.get("trs");
		JSONArray rowCells = (JSONArray) ((JSONObject) rows.get(rowIdx))
				.get("tcs");
		int rowCellCount = rowCells.size();
		// get the total col spans of the row
		int rowSpansCount = GetColSpanCntUntil(rowCells, rowCellCount);
		int cellIdx = rowCells.indexOf(this.jsonobj);
		// get the total col spans before current cell in its row
		int colSpansBeforeCell = GetColSpanCntUntil(rowCells, cellIdx);
		int alreadyMergedCount = 0;
		if (colSpan != null && cSpan != 0) {
			// set colSpan
			// just set gridSpan
			if (null == tcPr) {
				tcPr = new JSONObject();
				this.jsonobj.put("tcPr", tcPr);
			}
			if (null == gridSpan) {
				gridSpan = new JSONObject();
			}
			currentColSpan += cSpan;
			gridSpan.put("val", currentColSpan);
			tcPr.put("gridSpan", gridSpan);

			// set vMerge cells' col span
			int offset = 1;
			if (rowIdx + offset < rows.size()) {
				JSONArray nextRowCells = (JSONArray) ((JSONObject) rows
						.get(rowIdx + offset)).get("tcs");
				int nextRowCellCount = nextRowCells.size();
				int nextRowColSpansCount = GetColSpanCntUntil(nextRowCells,
						nextRowCellCount);
				JSONObject downSideCell = null; // =
												// (JSONObject)nextRowCells.get(cellIdx);
				JSONObject downSideTcPr = null;// (JSONObject)downSideCell.get("tcPr");
				JSONObject vMerge = null;// (JSONObject)(downSideTcPr).get("vMerge");
				alreadyMergedCount = 1;// default
				while (rowSpansCount == nextRowColSpansCount) {
					alreadyMergedCount++;
					int changeIdx = GetAlignedColIdx(nextRowCells,
							colSpansBeforeCell);
					downSideCell = (JSONObject) nextRowCells.get(changeIdx);
					downSideTcPr = (JSONObject) downSideCell.get("tcPr");
					if (null == downSideTcPr){
						break;
					}
					vMerge = (JSONObject) (downSideTcPr).get("vMerge");

					if (!(vMerge != null && vMerge.isEmpty())) {
						break;
					}

					JSONObject downSideGridSpan = (JSONObject) downSideTcPr
							.get("gridSpan");
					int downSideColSpan = 0;
					if (null == downSideGridSpan) {
						downSideColSpan = 1;
						downSideGridSpan = new JSONObject();
					} else {
						downSideColSpan = Integer.parseInt(downSideGridSpan
								.get("val").toString());
					}
					downSideColSpan += cSpan;
					downSideGridSpan.put("val", downSideColSpan);
					downSideTcPr.put("gridSpan", downSideGridSpan);

					offset++;
					if (rowIdx + offset >= rows.size()) {
						break;
					}
					nextRowCells = (JSONArray) ((JSONObject) rows.get(rowIdx
							+ offset)).get("tcs");
					nextRowCellCount = nextRowCells.size();
					nextRowColSpansCount = GetColSpanCntUntil(nextRowCells,
							nextRowCellCount);
				}
			}

		}
		if (rowSpan != null && rSpan != 0) {
			// set row span
			// recover cells deleted
			if (rSpan > 0) {
				// skip rows already merged
				int nextRowCellCount, nextRowColSpansCount;
				if (alreadyMergedCount == 0) {// not yet calculated by col span
												// change
					do {
						alreadyMergedCount++;
						JSONArray nextRowCells = (JSONArray) ((JSONObject) rows
								.get(rowIdx + alreadyMergedCount)).get("tcs");
						nextRowCellCount = nextRowCells.size();
						nextRowColSpansCount = GetColSpanCntUntil(nextRowCells,
								nextRowCellCount);
					} while (nextRowColSpansCount == rowSpansCount);
				}

				if (alreadyMergedCount == 1) {
					// JSONObject tcPr = (JSONObject)this.jsonobj.get("tcPr");
					JSONObject vMerge = new JSONObject();
					vMerge.put("val", "restart");
					tcPr.remove("vMerge");
					tcPr.put("vMerge", vMerge);
				}

				for (int offset = 0; offset < rSpan; offset++) {
					JSONArray currentRowCells = (JSONArray) ((JSONObject) rows
							.get(rowIdx + alreadyMergedCount + offset))
							.get("tcs");
					// get the col idx in this row to insert vMerge cell
					int insertCellIdx = GetAlignedColIdx(currentRowCells,
							colSpansBeforeCell);
					JSONObject cellCopy = new JSONObject();
					JSONObject tcPrCopy = new JSONObject();
					JSONObject gridSpanCopy = new JSONObject();
					gridSpanCopy.put("val", currentColSpan);
					tcPrCopy.put("gridSpan", gridSpanCopy);
					JSONObject vMergeCopy = new JSONObject();
					tcPrCopy.put("vMerge", vMergeCopy);
					cellCopy.put("tcPr", tcPrCopy);
					currentRowCells.add(insertCellIdx, cellCopy);
				}

			} else {// delete cells to be merged
				int currentRowSpan = 1, alignedColIdx;
				int maxRowIdx = rows.size();
				while (currentRowSpan < maxRowIdx - rowIdx) {
					JSONArray nextRowCells = (JSONArray) ((JSONObject) rows
							.get(rowIdx + currentRowSpan)).get("tcs");
					alignedColIdx = GetAlignedColIdx(nextRowCells,
							colSpansBeforeCell);
					JSONObject nextCell = (JSONObject) nextRowCells
							.get(alignedColIdx);
					JSONObject tcPrNext = (JSONObject) nextCell.get("tcPr");
					if (null == tcPrNext)
						break;
					JSONObject vMerge = (JSONObject) tcPrNext.get("vMerge");
					if (null == vMerge || !vMerge.isEmpty()) {
						break;
					}
					currentRowSpan++;
				}
				while (currentRowSpan > 1 && rSpan < 0) {
					JSONArray lastRowCells = (JSONArray) ((JSONObject) rows
							.get(rowIdx + currentRowSpan - 1)).get("tcs");
					alignedColIdx = GetAlignedColIdx(lastRowCells,
							colSpansBeforeCell);
					lastRowCells.remove(alignedColIdx);
					currentRowSpan--;
					rSpan++;
				}
				if (currentRowSpan == 1) {
					tcPr.remove("vMerge");
				}
			}
			// set vMerge
		}

	}

	public void setContent(JSONArray content) {
		this.content = content;
	}

	private JSONArray content;

	@Override
	public void deleteElement(int index) {
		JSONArray children = (JSONArray) ((JSONObject) this.jsonobj).get("ps");
		children.remove(index);
	}
}
