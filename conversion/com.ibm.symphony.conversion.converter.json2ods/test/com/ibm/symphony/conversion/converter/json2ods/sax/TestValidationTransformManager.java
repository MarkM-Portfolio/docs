package com.ibm.symphony.conversion.converter.json2ods.sax;


import static org.junit.Assert.*;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.junit.Test;

import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.ValidationTransformManager;

public class TestValidationTransformManager 
{
	public String testPath ;
	
	public ConversionUtil.Document doc;
	ValidationTransformManager validationTransMgr;
	
	public void loadData()
	{
		try{
			testPath = getClass().getResource("/").getPath() + "testData" + File.separator + "simpleDV";
			
		    doc = new ConversionUtil.Document();
		    String metaFilePath = testPath + File.separator + "meta.js";
		    String contentFilePath = testPath + File.separator + "content.js";
		    String preserveFilePath = testPath + File.separator + "preserve.js";
		    String referenceFilePath = testPath + File.separator + "reference.js";
		    doc.docMetaJSON = ConversionUtil.getObjectFromJSON(metaFilePath);
		    doc.docContentJSON = ConversionUtil.getObjectFromJSON(contentFilePath, true); 
		    doc.docPreserveJSON = ConversionUtil.getObjectFromJSON(preserveFilePath);
		    
		    doc.getObjectFromJSON();
		    
		    validationTransMgr = doc.validationTransMgr;
		}catch(Exception e)
		{
			e.printStackTrace();
		}
	}
	
	@Test
	public void testAll()
	{
		loadData();
		testAddValidation();
		testSortRanges();
		testTransformToRows();
		testMergeWithRows();
	}
	
	/**
	 * This method used to test addValidation method 
	 * after the loading of the document, this sample should contain
	 * 1) 5 validations unname ranges, 
	 * 2) 4 unique validations
	 * 3) 1 salve validation range
	 */
	public void testAddValidation()
	{
		assertEquals(5,validationTransMgr.rangeMap.size());
		assertEquals(4,validationTransMgr.validationMap.size());
		assertEquals(1,validationTransMgr.slaveRangeMap.size());
	}
	
	/**
	 * This method used to test sortRanges method, this sample should contain 5 ranges in order:
	 * row 1,3,5,7,9
	 */
	public void testSortRanges()
	{
		 HashMap<Integer,ArrayList<String>> orderRanges = validationTransMgr.orderedRanges.get("os1");
		 assertEquals(5,orderRanges.size());
		 Integer [] startRowIndexs = {1,3,5,7,9};
		 
		 for(int len = startRowIndexs.length -1, i = len; i >= 0; i--)
		 {
			 Integer startIndex = startRowIndexs[i];
			 ArrayList<String> list = orderRanges.get(startIndex);
			 assertEquals(0,list.size());
		 }	 
	}
	
	/**
	 * This method used to test transformToRows method, this sample contains 5 ranges in order:
	 * row 1,3,5,7,9, for each row there is a cell to represent the validations
	 */
	public void testTransformToRows()
	{
		List<Row> rowList = validationTransMgr.rows.get("os1");
		assertNotNull(rowList);
		
		assertEquals(5,rowList.size());
		
		Integer [] startRowIndexs = {1,3,5,7,9};
		for(int i = 0 ; i < rowList.size(); i++)
		{
			Row row = rowList.get(i);
			int index = startRowIndexs[i];
			assertEquals(index-1, row.rowIndex);
			
			List<Cell> cells = row.cellList;
			assertNotNull(cells);
			assertEquals(1,cells.size());
		}
	}
	
	/**
	 * This method used to test mergeWithRows method, after merge dataValidation cells with the existed cells
	 * for row 1,3,5,7,9: each row contains 2 cells, and the last cell is represented the data validation
	 */
	public void testMergeWithRows()
	{
		Sheet sheet = doc.getSheetById("os1");
		List<Row> rowList = sheet.rowList;
		Integer [] startRowIndexs = {1,3,5,7,9};
		int j = 0, len = rowList.size();
		for(int i = 0; i < 5; i++)
		{
			int index = startRowIndexs[i];
			while(j < len && rowList.get(j).cellList.size() == 0)
				j++;
			
			Row row = rowList.get(j);
			assertEquals(index-1, row.rowIndex);
			List<Cell> cells = row.cellList;
			assertNotNull(cells);
			assertEquals(2,cells.size());
			Cell vCell = cells.get(1);
			assertNotNull(vCell.validationName);
			assertTrue(vCell.validationName.length() > 0);
			j++;
		}	

	}
	
}
