/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.feature.FeatureController");
dojo.require("concord.feature.FeatureDlg");
dojo.require("concord.feature.WelcomeDlg");
dojo.require("concord.feature.NewUserTourDlg");
dojo.require("concord.util.events");
dojo.require("concord.util.browser");

(function()
{
	var fUrl = contextPath + "/feature.json";
	var tUrl = contextPath + "/tour.json";
	var featureDlg = null;
	var welcomeDlg = null;
	var tourDlg = null;
	var tourFeaturIDs = null;
	dojo.subscribe(concord.util.events.doc_data_reload, null, function(){
		setTimeout(function(){
			if (!(concord.util.browser.isMobileBrowser() || pe.scene.isHTMLViewMode()))
				if(pe && pe.settings && (pe.settings.getToolbar() != 0)){
					if (pe.scene.docType == "sheet" && !pe.scene.editor.getFormulaBar().isShow)
						return;
					if (pe.scene.docType == "text" && pe.scene.isNote())
						return;					
					
					if (pe && pe.settings && pe.settings.getShowWelcome())
					{
						concord.feature.FeatureController.showWelcomeDlg();
					}
					else
					{
						concord.feature.FeatureController.showNewFeatureDlg(false);
					}
				}
		}, 200);
	});
	
	concord.feature.FeatureController.getFeatureSettingKey = function(ver){
		if (ver) {
			return "feature_"+ ver ;
		} else {
			return "feature_"+ g_version ;
		}
	};
	
	concord.feature.FeatureController.showNewFeatureDlg = function(force){
		if(!featureDlg)
		{
			var fVersion = concord.feature.FeatureController.getFeatureSettingKey();
			var shouldShow = (pe && pe.settings && (pe.settings.getShowNewFeature(fVersion) == 1)) ? true : false;
			if(force || shouldShow){		
				dojo.xhrGet({
					url: fUrl,
					handleAs: "json",
					sync: false,
					preventCache: true,
					load: function(data) {					
						concord.feature.FeatureController._showNewFeatureDlg(data);
					},
					error: function(error) {
						console.log('Failed to get new features from feature.json :' + error);
					}			
				});		
			}
		}
		else
		{
			featureDlg.show();
		}
	};
	
	concord.feature.FeatureController._showNewFeatureDlg = function(data){
		var fdata = null;
		if(window.pe.scene.docType == "pres"){
			fdata = data.pres;
		}else if(window.pe.scene.docType == "sheet"){
			fdata = data.sheet; 
		}else if(window.pe.scene.docType == "text"){
			fdata = data.text; 
		}
		if(!fdata) return;
		
		var version = g_version;
		var features = fdata.feature;
		var featureIDs = [];
		var fvers = [];
		for(var i=0 ; i<features.length; i++){
			var versionID = features[i].versionID;
			if(version == versionID){
				if (features[i].correlationVerIDs) {
					var correls = features[i].correlationVerIDs;
					for (var j=0; j<correls.length; j++) {
						var fver = concord.feature.FeatureController.getFeatureSettingKey(correls[j]);
						var bShow = (pe && pe.settings && (pe.settings.getShowNewFeature(fver) == 1)) ? true : false;
						if (bShow) {
							for(var k=0; k<features.length; k++) {
								if (correls[j] == features[k].versionID) {
									featureIDs = featureIDs.concat(features[k].featureIDs);
									fvers.push(fver);
									break;
								}
							}
						}
					}
				}
				featureIDs = featureIDs.concat(features[i].featureIDs);
				fvers.push(concord.feature.FeatureController.getFeatureSettingKey());
				break;
			}
		}
		featureIDs = concord.feature.FeatureController.filter(featureIDs);
		if(featureIDs && featureIDs.length != 0){
			var widget = concord.feature.FeatureController.createNewFeatureWidget(featureIDs, fvers);
			if(widget){
				widget.show();
			}
		}
	};
	
	concord.feature.FeatureController.createNewFeatureWidget = function(featureIDs, fversions){
		if(!featureDlg){			
			var mainNode = dojo.byId("mainNode");
			var tmpNode = dojo.create("div", null, mainNode);
			featureDlg = new concord.feature.FeatureDlg({id:"pFeature_"+ dojox.uuid.generateRandomUuid(), featureIDs: featureIDs, featureVers: fversions},tmpNode);
			concord.feature.FeatureController.enableNewfeatureMenu();
		}
		return featureDlg;
	};	
	
	concord.feature.FeatureController.enableNewfeatureMenu = function(){
		if(window.pe.scene.docType == "pres"){
			pe.scene.disableMenu("newFeatures", false);
		}else if(window.pe.scene.docType == "sheet"){
			pe.scene.disableMenu("S_i_NewFeaturs", false);
		}else if(window.pe.scene.docType == "text"){
			pe.scene.disableMenu("D_i_HelpNewFeatures", false);
		}				
	},
	
	concord.feature.FeatureController.showWelcomeDlg = function(){
		if(!welcomeDlg)
		{			
			var mainNode = dojo.byId("mainNode");
			var tmpNode = dojo.create("div", null, mainNode);
			welcomeDlg = new concord.feature.WelcomeDlg({id:"pWelcome_"+ dojox.uuid.generateRandomUuid(), docType: window.pe.scene.docType},tmpNode);	
		}
		welcomeDlg.show();
	};
	
	concord.feature.FeatureController.showTourDlg = function(last){	
		if(!tourDlg)
		{
			dojo.xhrGet({
				url: tUrl,
				handleAs: "json",
				sync: false,
				preventCache: true,
				load: function(data) {					
					concord.feature.FeatureController._showTourDlg(data, last);					
				},
				error: function(error) {
					console.log('Failed to get new user tour features from tour.json :' + error);
				}			
			});
		}
		else
		{
			var featureIDs = concord.feature.FeatureController._getTourFeatures();
			var filteredIDs = concord.feature.FeatureController.filter(featureIDs);
			tourDlg.setFeatureIDs(filteredIDs);
			if(last)
				tourDlg.showLastTour();
			else
				tourDlg.show();
		}
	};
	
	concord.feature.FeatureController._getTourFeatures = function(data){
		if(tourFeaturIDs)
			return tourFeaturIDs;
		
		var fdata = null;
		if(window.pe.scene.docType == "pres"){
			fdata = data.pres;
		}else if(window.pe.scene.docType == "sheet"){
			fdata = data.sheet; 
		}else if(window.pe.scene.docType == "text"){
			fdata = data.text; 
		}
		if(!fdata) return;
		
		var features = fdata.feature;
		var featureIDs = features[features.length -1].featureIDs;
		tourFeaturIDs = featureIDs;
				
		return tourFeaturIDs;
	};
	
	concord.feature.FeatureController._showTourDlg = function(data, last){
		var featureIDs = concord.feature.FeatureController._getTourFeatures(data);
		var filteredIDs = concord.feature.FeatureController.filter(featureIDs);
		if(filteredIDs && filteredIDs.length != 0){					
			var mainNode = dojo.byId("mainNode");
			var tmpNode = dojo.create("div", null, mainNode);
			tourDlg = new concord.feature.NewUserTourDlg({id:"pTour_"+ dojox.uuid.generateRandomUuid(), featureIDs: filteredIDs},tmpNode);
			if(last)
				tourDlg.showLastTour();
			else
				tourDlg.show();
		}
	};
	
	concord.feature.FeatureController.isWidgetShown = function(){
		if (welcomeDlg && welcomeDlg.isShown())
			return true;
		else if (tourDlg && tourDlg.isShown())
			return true;
		else if (featureDlg && featureDlg.isShown())
			return true;
		
		return false;
	};
	
	concord.feature.FeatureController.getWidget = function(){
		if (welcomeDlg)
			return welcomeDlg;
		else if (featureDlg)
			return featureDlg;
		
		return null;
	};
	
	concord.feature.FeatureController.resizeWidget = function(){
		var featureNode = dojo.query(".featuresdlg", dojo.body())[0];
		if (featureNode && !dojo.hasClass(featureNode, "hidden")){
			if(tourDlg) {
				tourDlg.show();
			}
			else if(featureDlg){
				featureDlg.show();
			}
		}
	};
	
	concord.feature.FeatureController.getPosition = function(featureID){
		var scene = window.pe.scene;
		/**
		 * We define "m", "r","t","b","c" properties in the return position object. 
			Please also consider of the Bidi case.
			"m", Apply left icon to render
			"r", Apply right icon to render
			"t", Apply top icon to render (by default)
			"b", Apply bottom icon to render
			"c", Don't apply arrow icon, when the dialog is sh
			{x: x, y: y, c : 1}
		 */
		return scene.getFeaturePosition(featureID) || {x: 100, y: 120};
	};
	
	concord.feature.FeatureController.afterShown = function(featureID){
		var scene = window.pe.scene;
		scene.afterFeatureShow(featureID);
	};
	
	concord.feature.FeatureController.filter = function(featureIDs){
		var scene = window.pe.scene;
		return scene.filterFeatureIDs(featureIDs);
	};	
})();