dojo.provide("websheet.test.helpers");

(function(runner) {
	var nameOfCurrentSheet = function() {
		return runner.app.websheet.Main.getCurrentGrid().getSheetName();
	};
	
	var nameOfNextSheet = function() {
		//if the current sheet is the last one, return null
        var docObj = runner.app.websheet.model.ModelHelper.getDocumentObj(),
            vSheets = docObj.getVisibleSheets(),
            currentIndex = docObj.getSheetTabIndex(runner.app.websheet.Main.getCurrentGrid().getSheetName());
        if (currentIndex >= vSheets.length){
            return null;
        } else {
            return vSheets[currentIndex].getSheetName();
        }
	};
	
	var countOfVisibleSheets = function() {
        return runner.app.websheet.model.ModelHelper.getDocumentObj()
        		.getVisibleSheets().length;
	}; 
   
   	var nameOfSheetAtIndex = function(index) {
       var docObj = runner.app.websheet.model.ModelHelper.getDocumentObj(),
           vSheets = docObj.getVisibleSheets();
       return (index > vSheets.length || index < 1) ? null : vSheets[index - 1].getSheetName();
   	};
   	
   	var indexOfSheet = function(sheetName) {
        var docObj = runner.app.websheet.model.ModelHelper.getDocumentObj(),
            vSheets = docObj.getVisibleSheets(),
            currentIndex = docObj.getSheetTabIndex(sheetName);
        return currentIndex >= vSheets.length ? null : currentIndex;
   	};
   	
   	var indexOfCurrentSheet = function() {
   		return this.indexOfSheet(this.nameOfCurrentSheet());
   	};
   	
   	runner.helpers = {
		nameOfCurrentSheet: nameOfCurrentSheet,
		nameOfNextSheet: nameOfNextSheet, // return null if at the last sheet
		nameOfSheetAtIndex: nameOfSheetAtIndex,
		countOfVisibleSheets: countOfVisibleSheets,
		indexOfSheet: indexOfSheet,
		indexOfCurrentSheet: indexOfCurrentSheet
   	};
})(window);