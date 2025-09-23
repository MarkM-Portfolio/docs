dojo.provide("websheet.test.deferreds");

(function(runner) {
	var trigger = function(tr) {
		console.info("trigger: " + tr);
	};
	
	var task = function(deferred) {
		deferred = deferred || new dojo.Deferred();
		
		runner.app.pe.taskMan.waitForComplete(deferred, 
				runner.app.pe.taskMan.Priority.VisibleFormulaCalculation,
				runner.Env.mode === "API" ? 100 : 10);
		
		return deferred;
	};
	
	var initialize = function(deferred) {
		deferred = deferred || new dojo.Deferred();
		
		var hdl = setInterval(function() {
			if (runner.app && !runner.app.onload) {
				runner.app.onload = function() {
					clearInterval(hdl);
					trigger("init");
					deferred.callback();
				};
			}
		});
		return deferred;
	};
	
	var loadDocument = function(deferred) {
		deferred = deferred || new dojo.Deferred();
		var hdl = runner.app.dojo.subscribe("/websheet/documentLoaded", function() {
			runner.app.dojo.unsubscribe(hdl);
			setTimeout(function() {
				trigger("load document");
				task(deferred);
			}, 1000);
		});
		return deferred;
	};
	
	var isUpdateListEmpty = function() {
		var checklist = ["_TYPES.GRID", "_TYPES.OTHER"];
		if (this.updateList != null) {
			for (var item in checklist) {
				var target = this.updateList[checklist[item]];
				if (target && Object.keys(target).length > 0) {
					return false;
				}
			}
		}
		return true;
	};
	
	var isUpdateSheetListEmpty = function() {
		return !(this.updateSheetList && Object.keys(this.updateSheetList).length > 0);
	};
	
	var updateUI = function(deferred) {
		deferred = deferred || new dojo.Deferred();
		var broker = runner.app.websheet.Main.getUpdateBroker();
		var signal = dojo.aspect.afterOnce(broker, "_update", function() {
			var hdl = setInterval(function() {
				if (isUpdateListEmpty.apply(broker) && isUpdateSheetListEmpty.apply(broker))
				{
					clearInterval(hdl);
					trigger("update ui");
					task(deferred);
				}
			});
		});
		return deferred;
	};
	
	var endScroll = function(deferred) {
		deferred = deferred || new dojo.Deferred();
		var grid = runner.app.websheet.Main.getCurrentGrid();
		var signal = dojo.aspect.afterOnce(grid, "endScroll", function() {
			trigger("end scroll");
			if (runner.Env.mode === "API") {
				task(deferred);
			} else {
				deferred.callback();
			}
		});
		var hSignal = dojo.aspect.afterOnce(grid, "setScrollLeft", function() {
			dojo.aspect.afterOnce(grid, "updateUI", function() {
				trigger("end hscroll");
				task(deferred);
			});
		});
		return deferred;
	};
	
	var showSheet = function(deferred) {
		deferred = deferred || new dojo.Deferred();
		var workSheetContainer = runner.app.websheet.Main.getWorksheetContainer();
		var sheetDocScene = runner.app.pe.scene;
		var docObj = runner.app.websheet.Main.getDocumentObj();
		var signal = dojo.aspect.afterOnce(workSheetContainer, "showWorksheet", function() {
			if (docObj.isLoading || docObj.getPartialLoading()){
				dojo.aspect.afterOnce(sheetDocScene, "enableEdit", function() {
					trigger("show sheet then enable edit");
					task(deferred);
				});
			}else{
				trigger("show sheet");
				task(deferred);
			}
		}, true);
    	return deferred;
	};
	
	var coedit = function(deferred, count) {
		deferred = deferred || new dojo.Deferred();
		var hdl = setInterval(function() {
			if (runner.app.pe.scene.coedit &&
				runner.app.pe.scene.session.participantList.length === count)
			{
				clearInterval(hdl);
				deferred.callback();
			}
		}, 1000);
		return deferred;
	};
	
	var fallback = function(deferred, wait, ms) {
		deferred = deferred || new utils.Firework(new dojo.Deferred());
		wait.call(this);
		var hdl = setTimeout(function() {
			trigger("fallback");
			deferred.callback();
		}, ms);
		deferred.addCallback(function() {
			clearTimeout(hdl);
		});
		return deferred;
	};
	
	runner.deferreds = {
		task: task,
		initialize: initialize,
		init: initialize,
		loadDocument: loadDocument,
		doc: loadDocument,
		endScroll: endScroll,
		scroll: endScroll,
		updateUI: updateUI,
		ui: updateUI,
		showSheet: showSheet,
		sheet: showSheet,
		coedit: coedit,
		
		fallback: fallback
	};
	
})(window);