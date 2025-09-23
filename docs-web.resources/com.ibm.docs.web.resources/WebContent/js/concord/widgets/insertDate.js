dojo.provide("concord.widgets.insertDate");
dojo.require("concord.i18n.locale");
dojo.require("dojo.date.locale");
dojo.require("concord.util.date");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("dijit.Tooltip");
dojo.require("concord.util.BidiUtils");

dojo.declare("concord.widgets.insertDate", [concord.widgets.concordDialog], {
	dateNamesArray: null,
	dateCodesArray: null,
	
	dateNow: null,
	
	CURRENT_DATE: null,
	CURRENT_DATE_FORMAT: null,
	
	FORMAT_COUNT: 2,
	
	dateList: null,
	locale:null,
	
	dialogId: null,
	
	DateFormatCode: {
		"short":{
			formatName:"short",
			formatLength: "short"
		},
		"medium":{
			formatName:"medium",
			formatLength: "medium"
		},
		"long":{
			formatName:"long",
			formatLength: "long"
		},
		"full":{
			formatName:"full",
			formatLength: "full"
		},
		"yM":{
			dateCategory:"dateFormatItem-yM"
		},
		"yQ":{
			dateCategory:"dateFormatItem-yQ"
		},
		"yyQ":{
			dateCategory:"dateFormatItem-yyQ"
		},
		"MMMEd":{
			dateCategory:"dateFormatItem-MMMEd"
		},
		"yQQQ":{
			dateCategory:"dateFormatItem-yQQQ"
		},
		"MMM":{
			dateCategory:"dateFormatItem-MMM"
		},
		"y":{
			dateCategory:"dateFormatItem-y"
		},
		"yMMM":{
			dateCategory:"dateFormatItem-yMMM"
		},
		"EEEd":{
			dateCategory:"dateFormatItem-EEEd"
		},
		"yMMMM":{
			dateCategory:"dateFormatItem-yMMMM"
		},
		"MMMMEd":{
			dateCategory:"dateFormatItem-MMMMEd"
		},
		"MMMd":{
			dateCategory:"dateFormatItem-MMMd"
		},
		"MMMMd":{
			dateCategory:"dateFormatItem-MMMMd"
		},
		"M":{
			dateCategory:"dateFormatItem-M"
		},
		"MEd":{
			dateCategory:"dateFormatItem-MEd"
		},
		"yMMMEd":{
			dateCategory:"dateFormatItem-yMMMEd"
		},
		"Md":{
			dateCategory:"dateFormatItem-Md"
		},
		"yMEd":{
			dateCategory:"dateFormatItem-yMEd"
		},
		"d":{
			dateCategory:"dateFormatItem-d"
		}
	},	
    
	constructor: function() 
	{		
	},
	calcWidth: function()
	{
		return "480px";
	},
	
	setDialogID: function() {
		this.dialogId = "C_d_InsertDateDialog";
	},	

	initDateArrays: function()
	{	
		this.dateNow = new Date();
		if(concord.util.date.isBuddistLocale()){
			this.dateNow = new dojox.date.buddhist.Date(this.dateNow);
		}
		this.dateCodesArray = new Array("short","medium","long","full");
		this.FORMAT_COUNT = this.dateCodesArray.length;
		this.dateNamesArray = new Array(this.FORMAT_COUNT);

		for(var i = 0 ; i < this.FORMAT_COUNT; i++)
		{
			this.dateNamesArray[i] = this.formatDate(this.dateNow, this.dateCodesArray[i]);
			if (BidiUtils.isGuiRtl())
				this.dateNamesArray[i] = BidiUtils.removeUCC (this.dateNamesArray[i]);
		}		
		this.setLocale();
	},	
	
	createContent: function (contentDiv)
	{
		this.initDateArrays();
		/*create layout table*/
		var layoutTable = dojo.create('table', null, contentDiv);
		var layoutTbody = dojo.create('tbody', null, layoutTable);
		var all=dojo.create('tr', null, layoutTbody);
		var tdArea=dojo.create('td', null, all);
		var div = dojo.create('div', null, tdArea);
		var layoutTR0TD1 = dojo.create('div', null, div);
		dojo.addClass(layoutTR0TD1,"sigleDiv");
		dojo.addClass(layoutTable,"printSpreadsheetTable");
		dojo.addClass(div,"sigleDiv");
		dojo.attr(layoutTable,{"role":"presentation"});
		
		var dateCombox = dojo.create('select', null, layoutTR0TD1);
		this.dateList = dateCombox;
		dojo.attr(dateCombox,{
			"id": "C_d_InsertDateDialogdateCombox",
			"size": 10,
			"role":"listbox",
			"title": "Select Time",
			"aria-label": "Select Time"
		});
		
		for(var index = 0 ; index < this.FORMAT_COUNT; index++)
		{
			var opt = document.createElement('option');
			opt.text = this.dateNamesArray[index];
			dojo.attr(opt,{"role":"option"});
			dojo.attr(opt,{"title":this.dateNamesArray[index]});
			dojo.attr(opt,{"aria-label":this.dateNamesArray[index]});

			if(dojo.isIE)
			{
				dateCombox.add(opt);
			}
			else
			{
				dateCombox.add(opt,null);
			}
		}
		dojo.attr(dateCombox.options[0],{"selected":"selected"});
		dojo.attr(dateCombox,{"style":"width:400px;"});
		dojo.connect(dateCombox,"onchange", dojo.hitch(this,this.onSelected));
		dojo.connect(dateCombox,"onkeyup", dojo.hitch(this,this.onSelected));
		this.setDefaultValue();
	},

	/*Methods begins here*/
	onSelected: function(e)
	{
		var index = this.dateList.selectedIndex;
		this.CURRENT_DATE = this.dateNamesArray[index];
		this.CURRENT_DATE_FORMAT = this.dateCodesArray[index];
	},
	
	onOk: function (editor)
	{
		var origRange = editor.origRange;
		var notInHeaderFooter = pe.scene.headerfooter==null || pe.scene.headerfooter.currentArea=="text";
		if(notInHeaderFooter && origRange && MSGUTIL.isSelectedRangeNotAvailable(origRange))
		{
			var nls = dojo.i18n.getLocalization('concord.widgets','toolbar');
			var warningMessage = nls.targetRemovedWhenDialogOpen;
			pe.scene.showWarningMessage(warningMessage,2000);
			return true;
		}
		this.insertSelectedDate(editor);
		return true;
	},
	reset: function()
	{
		this.initDateArrays();
		var element = dojo.byId("C_d_InsertDateDialogdateCombox");
		var eSize = element.length;
		for(var index = 0 ; index < eSize; index++)
		{
			element.remove(0);
		}
		var isBidi = BidiUtils.isBidiOn() && BidiUtils.isBidiLocale(this.locale);
		for(var index = 0 ; index < this.FORMAT_COUNT; index++)
		{
			var opt = document.createElement('option');
			opt.text = (isBidi) ? BidiUtils.addRLMToStr(this.dateNamesArray[index]) : this.dateNamesArray[index];
			dojo.attr(opt,{"role":"option"});
			if (isBidi){
				dojo.attr(opt,{"title":BidiUtils.addRLMToStr(this.dateNamesArray[index])});
			} else {
				dojo.attr(opt,{"title":this.dateNamesArray[index]});
			}
			dojo.attr(opt,{"aria-label":this.dateNamesArray[index]});

			if(dojo.isIE)
			{
				element.add(opt);
			}
			else
			{
				element.add(opt,null);
			}
		}
		dojo.attr(element.options[0],{"selected":"selected"});
		this.setDefaultValue();		
	},
	onCancel: function (editor)
	{
		var noHeaderFooter = pe.scene.headerfooter==null || pe.scene.headerfooter.currentArea=="text";
		if(!noHeaderFooter)
		{
			this.dialog.refocus = false;
			this.dialog.disconnect(this.focusHdl);
			this.focusHdl = null;
			pe.scene.headerfooter.setCursor();
		}
		return true;
	},

	setDefaultValue: function()
	{
		this.CURRENT_DATE=this.dateNamesArray[0];
		this.CURRENT_DATE_FORMAT = this.dateCodesArray[0];
	},	
	
	insertSelectedDate: function(editor)
	{
		var patten = this.getFormatPatten(this.CURRENT_DATE_FORMAT);
		var dateFull = this.dateNow.getFullYear();
		dateFull += "-";
		dateFull += (this.dateNow.getMonth()+1);
		dateFull += "-";
		dateFull += this.dateNow.getDate();
		dateFull += "T";
		dateFull += this.dateNow.getHours();
		dateFull += ":";
		dateFull += this.dateNow.getMinutes();
		dateFull += ":";
		dateFull += this.dateNow.getSeconds();			
		dateFull += ".";
		dateFull += this.dateNow.getMilliseconds();
		var idValue = MSGUTIL.getUUID(); 
		
		//header footer exist.
		var noHeaderFooter = pe.scene.headerfooter==null || pe.scene.headerfooter.currentArea=="text";
		var element = noHeaderFooter ? editor.document.createElement( 'span' ) : document.createElement( 'span' );			

		element.setAttribute("id", idValue );			
		element.setAttribute( "class", "ODT_DT " + "DT_TYPE_date");
		element.setAttribute( "unselectable", "on" );
		element.setAttribute( "contenteditable", "false" );
		element.setAttribute( "datetime", dateFull);
		element.setAttribute( "lang", this.locale);
		element.setAttribute( "longdesc", patten);		
		
		if ( noHeaderFooter )
		{
			element.appendText(this.CURRENT_DATE);
			editor.insertElement( element );
		}
		else
		{
			element.innerHTML = this.CURRENT_DATE;
			pe.scene.headerfooter.setCursor();
			concord.widgets.headerfooter.headerfooterUtil.insertNodeAtCursor(element);
		}		
	},

	/*string*/formatDate: function(showString, /*format*/format){
		var rawDate = showString;

		try{
			try{								
				var options = {};
				var pattern = this.DateFormatCode[format];
				if(pattern){
					dojo.mixin(options, pattern);
					if(format.indexOf("dateTime") == -1)//for dateTime, the selector should be null
						options.selector = "date";
				}else{
					options.datePattern = format;
					options.selector = "date";
				}
				options.locale = this.locale;
				showString = dojo.date.locale.format(rawDate, options);
			}
			catch(e){
				showString = dojo.date.locale.format(rawDate,{
					selector: "date"
				});
				console.log(e);
			}
		}
		catch(e){
			return showString;
		}
		
		return showString;
	},

	/*string*/getFormatPatten: function(/*format*/format){
		var formatPatten;
		try{
			try{								
				var options = {};
				var pattern = this.DateFormatCode[format];
				if(pattern){
					dojo.mixin(options, pattern);
					if(format.indexOf("dateTime") == -1)//for dateTime, the selector should be null
						options.selector = "date";
				}else{
					options.datePattern = format;
					options.selector = "date";
				}
				options.locale = this.locale;
				formatPatten = concord.i18n.locale.getFormatPatten(options);
			}
			catch(e){
				console.log(e);
			}
		}
		catch(e){
			
		}
		
		return formatPatten;
	},
	
	setLocale: function()
	{
		this.locale=g_locale;
	}		
});
