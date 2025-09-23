/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.clipboard.CSVHelper");

/* for paste internal usage only */
dojo.declare("websheet.clipboard.CSVHelperPrototype", null, {

    getData: function (csvFileContents, separatorParam) {
    	var trunked = false;
    	
        var leadingWhiteSpaceCharacters = new RegExp("^\\s+", 'g');
        var trailingWhiteSpaceCharacters = new RegExp("\\s+$", 'g');
        var doubleQuotes = new RegExp('""', 'g');
        var arrayOfOutputRecords = [];
        var i;
        var separator = separatorParam ? separatorParam : "\t";
        
        var arrayOfInputLines = this._splitLines(csvFileContents);

        var len = arrayOfInputLines.length;
        var editor = websheet.model.ModelHelper.getEditor();
        var maxSheetRows = editor.getMaxRow();
        
        // IE, in our doctype, the table copied out will have blank lines between rows.
        var maxRow = Math.min(len, dojo.isIE ? maxSheetRows * 5 : maxSheetRows); //500000 - FIXME
        var maxColumn = websheet.Constant.MaxColumnIndex; //1024
        
        trunked = maxRow < len;
        var lastMalformedLine = null;
        
        for (i = 0; i < maxRow; ++i) {
            var singleLine = arrayOfInputLines[i];
            // console.info("singleLine " + singleLine.length)
            if (singleLine.length == 0) {
                arrayOfOutputRecords.push([]);
            } else if (singleLine.length > 0) {

                var listOfFields = singleLine.split(separator);
                var j = 0;
               
                if(i == maxRow - 1)
                {
                	// take care of malformed csv..
                	var howManyDoubleQuotes = singleLine.replace(/[^\"]/g, "").length;
                	if (howManyDoubleQuotes % 2 == 1)
                	{
                		lastMalformedLine = singleLine;
                        break;
                	}
                }
                
                while (j < listOfFields.length) {
                    var space_field_space = listOfFields[j];
                    var field_space = space_field_space.replace(leadingWhiteSpaceCharacters, ''); // trim leading whitespace
                    var field = field_space.replace(trailingWhiteSpaceCharacters, ''); // trim trailing whitespace


                    var firstChar = field.charAt(0);
                    var lastChar = field.charAt(field.length - 1);
                    var secondToLastChar = field.charAt(field.length - 2);
                    var thirdToLastChar = field.charAt(field.length - 3);
                    if (field.length === 2 && field == "\"\"") {
                        listOfFields[j] = ""; //Special case empty string field.
                    } else if ((firstChar == '"') && ((lastChar != '"') || ((lastChar == '"') && (secondToLastChar == '"') && (thirdToLastChar != '"')))) {
                        if (j + 1 === listOfFields.length) {
                             console.warn("The last field in record " + i + " is corrupted:\n" + field);
                            // return; //null
                        	 listOfFields[j] = field;
                             j += 1;
                             continue;
                        }                        
                        var count = (field.match(/\"/g) || []).length;
                        if (count > 0 && count % 2 === 0)
                        {// the count of " is divisible by 2, not a quoted \t
                            listOfFields[j] = field;
                            j += 1;                        	
                        }
                        else
                        {                        
	                        var nextField = listOfFields[j + 1];
	                        {                       
	                        	listOfFields[j] = field_space + separator + nextField;
	                        	listOfFields.splice(j + 1, 1); // delete element [j+1] from the list
	                        }
                        }
                    } else {
                        if ((firstChar == '"') && (lastChar == '"')) {
                            field = field.slice(1, (field.length - 1)); // trim the " characters off the ends
                            field = field.replace(doubleQuotes, '"'); // replace "" with "
                        }
                        listOfFields[j] = field;
                        j += 1;
                    }
                }
                arrayOfOutputRecords.push(listOfFields);
            }
        }
        
        if(lastMalformedLine != null)
        {
        	var last = this.getDataStrictMode(lastMalformedLine, this._splitLinesLooseMode(lastMalformedLine));
        	trunked = trunked || last.trunked;
        	arrayOfOutputRecords = arrayOfOutputRecords.concat(last.data);
        }

        var maxRow = dojo.isIE ? maxSheetRows * 5 : maxSheetRows;
        if(arrayOfOutputRecords.length > maxRow)
        {
        	arrayOfOutputRecords = arrayOfOutputRecords.slice(0, maxRow);
        	trunked = true;
        }
        
        return {data: arrayOfOutputRecords, trunked: trunked};
    },
    
    // take each \t as a cell separator.
    _splitLinesLooseMode: function(csvContent)
    {
    	var hasCellSeparator = csvContent.indexOf("\t") > 0;
        var split = [];
        var i;
        var line = "";
        var inQuotes = false;
        for (i = 0; i < csvContent.length; i++) {
            var c = csvContent.charAt(i);
            switch (c) {
                case '\"':
                    inQuotes = !inQuotes;
                    line += c;
                    break;
                case '\t':
                	inQuotes = false;
                	line += c;
                	break;
                case '\r':
                	if(!hasCellSeparator)
                		inQuotes = false;
                    if (inQuotes) {
                        line += c;
                    } else {
                        split.push(line);
                        line = "";
                        if (i < (csvContent.length - 1) && csvContent.charAt(i + 1) == '\n') {
                            i++;
                            //Skip it, it's CRLF
                        }
                    }
                    break;
                case '\n':
                	if(!hasCellSeparator)
                		inQuotes = false;
                    if (inQuotes) {
                        line += c;
                    } else {
                        split.push(line);
                        line = "";
                    }
                    break;
                default:
                    line += c;
            }
        }
        if (line !== "") {
            split.push(line);
        }

        for (i = csvContent.length - 2; i >= 0; i--) {
            var c = csvContent.charAt(i);
            if (c == "\n" && i > 1 && csvContent.charAt(i - 1) == '\r') {
                split.push("");
            }
            if (c != "\n" && c != "\r") break;
        }
        return split;
    },
    
    _splitLines: function (csvContent) {
        // summary:
        //		Function to split the CSV file contents into separate lines.
        //		Since line breaks can occur inside quotes, a Regexp didn't
        //		work as well.  A quick passover parse should be just as efficient.
        // tags:
        //		private
        var split = [];
        var i;
        var line = "";
        var inQuotes = false;
        for (i = 0; i < csvContent.length; i++) {
            var c = csvContent.charAt(i);
            switch (c) {
                case '\"':
                    inQuotes = !inQuotes;
                    line += c;
                    break;
                case '\r':
                    if (inQuotes) {
                        line += c;
                    } else {
                        split.push(line);
                        line = "";
                        if (i < (csvContent.length - 1) && csvContent.charAt(i + 1) == '\n') {
                            i++;
                            //Skip it, it's CRLF
                        }
                    }
                    break;
                case '\n':
                    if (inQuotes) {
                        line += c;
                    } else {
                        split.push(line);
                        line = "";
                    }
                    break;
                default:
                    line += c;
            }
        }
        if (line !== "") {
            split.push(line);
        }

        return split;
    },

    // in this mode, we assume that \t is always the separator, and \n is always the line break, not part of cell value.
	getDataStrictMode: function(csvFileContents, lines)
	{
		var arrayOfOutputRecords = [];
		var separator = "\t";
		var doubleQuotes = new RegExp('""','g');
		var editor = websheet.model.ModelHelper.getEditor();
		var maxSheetRows = editor.getMaxRow();
		if(!lines)
			lines = this._splitLinesStrictMode(csvFileContents);
		var len = lines.length;
		// IE, in our doctype, the table copied out will have blank lines between rows.
        var maxRow = Math.min(len, dojo.isIE ? maxSheetRows * 5 : maxSheetRows); //500000 - FIXME
        var trunked = maxRow < len;
        
        for(var i = 0; i < maxRow; i++)
        {
        	var singleLine = lines[i];
        	if(!singleLine)
				arrayOfOutputRecords.push([]);
			else
			{
				var listOfFields = singleLine.split(separator);
				var j = 0;
				while(j < listOfFields.length){
					var field = dojo.trim(listOfFields[j]);
					
					if(field.length > 1)
					{
						var firstChar = field.charAt(0);
						var lastChar = field.charAt(field.length - 1);
						
						if((firstChar == '"') && (lastChar == '"')){
							field = field.slice(1, (field.length - 1)); // trim the " characters off the ends
							field = field.replace(doubleQuotes, '"'); // replace "" with "
						}
					}
					listOfFields[j] = field;
					j++;
				}
				arrayOfOutputRecords.push(listOfFields);
			}
        }

		return {data: arrayOfOutputRecords, trunked: trunked};
	},

	_splitLinesStrictMode: function(csvContent) {
		return csvContent.split("\n");
	}
});

websheet.clipboard.CSVHelper = new websheet.clipboard.CSVHelperPrototype();