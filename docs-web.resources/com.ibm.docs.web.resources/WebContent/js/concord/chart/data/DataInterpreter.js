/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.chart.data.DataInterpreter");
dojo.require("concord.chart.model.ModelFactory");
dojo.require("concord.chart.model.DataSeries");

dojo.declare("concord.chart.data.DataInterpreter", null,{
	_chartType: null,
	
	constructor: function(chartType)
	{
		this._chartType = chartType;
	},
	
	/**
	 * @param dataSrc, 2-dim data array. dataSrc is provided by the editors
	 * @returns the number of the category and the label
	 * For example:
	 * dataSrc:
	 * |  |Jan|Feb|Mar|
	 * |a |1  |2  |3  |
	 * |b |2  |3  |1  |
	 * |c |3  |2  |1  |
	 * The category number is 1, and the label number is 1.
	 * The category will be "Jan", "Feb", "Mar". 1 means the category only has 1 row
	 * "a" will be the label of the series [1,2,3]. Label number is 1 means the label only has 1 column
	 */
	
	interpreteDataSource: function(dataSrc, mode)
	{
		var labelNum = 0;
		var cateNum = 0;
		var dataSource = null;
		
		var firstRow = dataSrc[0];
		var rowNum = dataSrc.length;
		var colNum = firstRow.length;
		
		//a cell
		if(rowNum==1 && colNum==1)
			return {dataSource:"row", labelNumber: 0, categoryNumber: 0};
			
		if(mode=="auto" && rowNum==1)  //single row
		{
			dataSource = "row";
			var i=0;
			for(;i<colNum;i++)
			{
				if(firstRow[i]!=null)
					break;
			}
			//all the cells are empty
			if(i==colNum)
				labelNum = 1;
			else
				labelNum = i;
			
			if(labelNum==0)
			{
				for(i=0;i<colNum;i++)
				{
					if(typeof(firstRow[i])!="string")
						break;
				}
				if(i==colNum)
					labelNum = 1;
				else
					labelNum = i;
			}
			return {dataSource:dataSource, labelNumber: labelNum, categoryNumber: 0};
		}
		else if(mode=="auto" && colNum==1) //single column
		{
			dataSource = "column";
			var j=0;
			for(j=0;j<rowNum;j++)
			{
				if(dataSrc[j][0]!=null)
					break;
			}
			if(j==rowNum)
				labelNum = 1;
			else
				labelNum = j;
			
			if(labelNum==0)
			{
				for(j=0;j<rowNum;j++)
				{
					if(typeof(dataSrc[j][0])!="string")
						break;
				}
				if(j==rowNum)
					labelNum = 1;
				else
					labelNum = j;
			}
			return {dataSource:dataSource, labelNumber: labelNum, categoryNumber: 0};
		}
		
		//multiple row and columns
		var emptyCellInRow = 0;
		var emptyCellInCol = 0;
		var emptyRow = 0;
		var emptyCol = 0;
		
		//find the empty cell in the left top corner of the range
		for(var i=0;i<rowNum;i++)
		{
			var num = 0;
			var row = dataSrc[i];
			for(var j=0;j<colNum;j++)
			{
				if(row[j]==null)
					num++;
				else
					break;
			}
			if(num<colNum)
			{
				emptyCellInRow = num;
				break;
			}
			else if(num==row.length)
				emptyRow++;
		}
		
		for(var i=0;i<colNum;i++)
		{
			var num = 0;
			for(var j=0;j<rowNum;j++)
			{
				if(dataSrc[j][i]==null)
					num++;
				else
					break;
			}
			if(num<rowNum)
			{
				emptyCellInCol = num;
				break;
			}
			else if(num==rowNum)
				emptyCol++;
		}
		
		//if the first several rows are empty, they should not be included in the empty cells in the first column
		emptyCellInCol -= emptyRow;
		emptyCellInRow -= emptyCol;
		
		if(emptyCellInRow>0 || emptyCellInCol>0)
		{
			if(mode=="auto")
			{
				if(colNum-emptyCellInRow>=rowNum-emptyCellInCol)
					dataSource = "row";
				else
					dataSource = "column";
			}
			else
				dataSource = mode;
			
			if(dataSource=="row")
			{
				labelNum = emptyCellInRow;
				cateNum = emptyCellInCol;
			}
			else
			{
				labelNum = emptyCellInCol;
				cateNum = emptyCellInRow;
			}
			
			return {dataSource:dataSource, labelNumber: labelNum, categoryNumber: cateNum};
		}
		
		
		var dpNumInRow = 0;
		var dpNumInCol = 0;
		
		//last row
		var lastRow = dataSrc[dataSrc.length-1];
		for(var i=lastRow.length-1;i>=emptyCol;i--)
		{
			if(lastRow[i]==null || (typeof lastRow[i]) =="number" )
				dpNumInRow++;
			else
				break;
		}
		//last column
		for(var i=dataSrc.length-1;i>=emptyRow;i--)
		{
			var row = dataSrc[i];
			var v = row[row.length-1];
			if(v==null || typeof v == "number")
				dpNumInCol++;
			else
				break;
		}
		
		if(dpNumInCol<1)
			dpNumInCol = 1;
		if(dpNumInRow<1)
			dpNumInRow=1;
		
		if(mode=="auto")
		{
			if(dpNumInRow>=dpNumInCol)
				dataSource = "row";
			else
				dataSource = "column";
		}
		else
			dataSource = mode;
		
		if(dataSource=="row")
		{
			labelNum = colNum-dpNumInRow;
			cateNum = rowNum-dpNumInCol;
		}
		else
		{
			labelNum = rowNum-dpNumInCol;
			cateNum = colNum-dpNumInRow;
		}
		
		return {dataSource:dataSource, labelNumber: labelNum, categoryNumber: cateNum};
	},
	
	/**
	 * @param dataSeqList List<{role:xx,addr:xx}>
	 * @param args
	 * @returns List<DataSeries>
	 */
	generateSeries: function(dataSeqList, args, dataProvider)
	{
		var seriesList = [];
		var seq = dataSeqList[0];
		var role = seq.role;
		var hasCategory = false;
		var category = null;
		if(role=="cat")
		{
			hasCategory = true;
			category = dataProvider.createDataSequence({ref:seq.addr,"role" : "cat","pts" : seq.pts});
			category.setProperty("role", "cat");
		}
		for(var i=hasCategory?1:0; i<dataSeqList.length;i++)
		{
			var series = new concord.chart.model.DataSeries();
			
			seq = dataSeqList[i];
			role = seq.role;
			if(role=="label")
			{
				series.putDataSequence("label", dataProvider.createDataSequence({ref:seq.addr,"role" : "label","pts" : seq.pts}));
				var valSeq = dataSeqList[i+1];
				if(valSeq!=null)
				{
					series.putDataSequence("yVal", dataProvider.createDataSequence({ref:valSeq.addr,"role" : "yVal","pts" : seq.pts}));
					seriesList.push(series);
				}
				i++;
			}
			else if(role=="values")
			{
				series.putDataSequence("yVal", dataProvider.createDataSequence({ref:seq.addr,"role" : "yVal","pts" : seq.pts}));
				seriesList.push(series);
			}
			else
			{
				//should never happen
			}
			
		}
		return {category:category, seriesList: seriesList};
	}
});

dojo.declare("concord.chart.data.ScatterDataInterpreter", [concord.chart.data.DataInterpreter],{
	
	generateSeries: function(dataSeqList, args,dataProvider)
	{
		var seriesList = [];
		
		var seq = dataSeqList[0];
		var role = seq.role;
		//If only one sequence, it must be used as yVal
		//If two sequence, and the first role is label, the second is used as yVal
		if(dataSeqList.length==1 || (dataSeqList.length==2 && role=="label"))
		{
			var series = new concord.chart.model.DataSeries();
			if(dataSeqList.length==2)
			{
				series.putDataSequence("label", dataProvider.createDataSequence( {ref:seq.addr,"role" : "label", "pts":seq.pts}));
				seq = dataSeqList[1];
			}
			series.putDataSequence("yVal", dataProvider.createDataSequence({ref:seq.addr, "role" : "yVal","pts":seq.pts}));
			seriesList.push(series);
			
			return {seriesList: seriesList};
		}
		
		var i=0;
		var xValues = null;
		if(role=="cat" || role=="values" )
		{
			xValues = seq;
			i = 1;
		}
		else if(role=="label")
		{
			xValues = dataSeqList[1];
			i = 2;
		}
		else
		{
			//should never happen
		}
		
		for(; i<dataSeqList.length;i++)
		{
			var series = new concord.chart.model.DataSeries();
			series.putDataSequence("xVal", dataProvider.createDataSequence({ref:xValues.addr, "role" : "xVal","pts":xValues.pts}));
			
			seq = dataSeqList[i];
			role = seq.role;
			if(role=="label")
			{
				series.putDataSequence("label", dataProvider.createDataSequence( {ref:seq.addr,"role" : "label", "pts":seq.pts}));
				var valSeq = dataSeqList[i+1];
				if(valSeq!=null)
				{
					series.putDataSequence("yVal", dataProvider.createDataSequence({ref:valSeq.addr, "role" : "yVal", "pts":valSeq.pts}));
					seriesList.push(series);
				}
				i++;
			}
			else if(role=="values")
			{
				series.putDataSequence("yVal", dataProvider.createDataSequence({ref:seq.addr, "role" : "yVal", "pts":seq.pts}));
				seriesList.push(series);
			}
			else
			{
				//should never happen
			}
		}
		return {seriesList: seriesList};
	}
});