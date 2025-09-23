dojo.provide("concord.widgets.insertTime");
dojo.require("concord.i18n.locale");
dojo.require("dojo.date.locale");
dojo.require("concord.util.date");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("dijit.Tooltip");
dojo.require("concord.util.BidiUtils");

dojo.declare("concord.widgets.insertTime", [concord.widgets.concordDialog], {
	timeNamesArray: null,
	timeCodesArray: null,
	
	dateNow: null,
	CURRENT_TIME: null,
	CURRENT_TIME_FORMAT: null,
	
	FORMAT_COUNT: 2,
	
	timeList: null,
	locale:null,
	
	dialogId: null,
	
	TimeFormatCode: {
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
		"Hm":{
			timeCategory:"dateFormatItem-Hm"
		},
		"Hms":{
			timeCategory:"dateFormatItem-Hms"
		},
		"ms":{
			timeCategory:"dateFormatItem-ms"
		},
		"hm":{
			timeCategory:"dateFormatItem-hm"
		},
		"HHmmss":{
			timeCategory:"dateFormatItem-HHmmss"
		},
		"H":{
			timeCategory:"dateFormatItem-H"
		},
		"hms":{
			timeCategory:"dateFormatItem-hms"
		},
		"HHmm":{
			timeCategory:"dateFormatItem-HHmm"
		},
		//date-time format
		"dateTimeShort":{
			dateCategory:"dateFormat-short",
			timeCategory:"timeFormat-short",
			formatLength: "short"
		},
		"dateTimeMedium":{
			dateCategory:"dateFormat-medium",
			timeCategory:"timeFormat-medium",
			formatLength: "medium"
		},
		"dateTimeLong":{
			dateCategory:"dateFormat-long",
			timeCategory:"timeFormat-long",
			formatLength: "long"
		},
		"dateTimeLong2":{
			dateCategory:"dateFormat-long",
			timeCategory:"timeFormat-medium",
			formatLength: "long"
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
		this.dialogId = "C_d_InsertTimeDialog";
	},	

	initTimeArrays: function()
	{	
		this.dateNow = new Date();
		if(concord.util.date.isBuddistLocale()){
			this.dateNow = new dojox.date.buddhist.Date(this.dateNow);
		}		
		this.timeCodesArray = new Array("short","medium",
								"dateTimeShort","dateTimeMedium","dateTimeLong2");
		this.FORMAT_COUNT = this.timeCodesArray.length;
		this.timeNamesArray = new Array(this.FORMAT_COUNT);

		for(var i = 0 ; i < this.FORMAT_COUNT; i++)
		{
			this.timeNamesArray[i] = this.formatTime(this.dateNow, this.timeCodesArray[i]);
		}		
		this.setLocale();
	},	
	
	createContent: function (contentDiv)
	{
		this.initTimeArrays();
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
		
		var timeCombox = dojo.create('select', null, layoutTR0TD1);
		this.timeList = timeCombox;
		dojo.attr(timeCombox,{
			"id": "C_d_InsertTimeDialogTimeCombox",
			"size": 10,
			"role":"listbox",
			"title": "Select Time",
			"aria-label": "Select Time"
		});
		
		for(var index = 0 ; index < this.FORMAT_COUNT; index++)
		{
			var opt = document.createElement('option');
			opt.text = this.timeNamesArray[index];
			dojo.attr(opt,{"role":"option"});
			dojo.attr(opt,{"title":this.timeNamesArray[index]});
			dojo.attr(opt,{"aria-label":this.timeNamesArray[index]});

			if(dojo.isIE)
			{
				timeCombox.add(opt);
			}
			else
			{
				timeCombox.add(opt,null);
			}
		}
		dojo.attr(timeCombox.options[0],{"selected":"selected"});
		dojo.attr(timeCombox,{"style":"width:400px;"});
		dojo.connect(timeCombox,"onchange", dojo.hitch(this,this.onSelected));
		dojo.connect(timeCombox,"onkeyup", dojo.hitch(this,this.onSelected));
	},

	/*Methods begins here*/
	onSelected: function(e)
	{
		var index = this.timeList.selectedIndex;
		this.CURRENT_TIME = this.timeNamesArray[index];;
		this.CURRENT_TIME_FORMAT = this.timeCodesArray[index];
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
		this.insertSelectedTime(editor);
		return true;
	},
	reset: function()
	{
		this.initTimeArrays();
		var element = dojo.byId("C_d_InsertTimeDialogTimeCombox");
		var eSize = element.length;
		for(var index = 0 ; index < eSize; index++)
		{
			element.remove(0);
		}
		var isBidi = BidiUtils.isBidiOn() && BidiUtils.isBidiLocale(this.locale);
		for(var index = 0 ; index < this.FORMAT_COUNT; index++)
		{
			var opt = document.createElement('option');
			opt.text = (isBidi) ? BidiUtils.addRLMToStr(this.timeNamesArray[index]) : this.timeNamesArray[index];
			dojo.attr(opt,{"role":"option"});
			if (isBidi){
				dojo.attr(opt,{"title":BidiUtils.addRLMToStr(this.timeNamesArray[index])});
			} else {
				dojo.attr(opt,{"title":this.timeNamesArray[index]});
			}
			dojo.attr(opt,{"aria-label":this.timeNamesArray[index]});

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
		this.CURRENT_TIME=this.timeNamesArray[0];
		this.CURRENT_TIME_FORMAT = this.timeCodesArray[0];
	},	
	
	insertSelectedTime: function(editor)
	{
		var idValue = MSGUTIL.getUUID(); 
		var patten = this.getFormatPatten(this.CURRENT_TIME_FORMAT);
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
		
		var formatType = "time";
		
		if(this.CURRENT_TIME_FORMAT.indexOf("dateTime") == 0)
			formatType = "dateTime";
			
		//header footer exist.
		var noHeaderFooter = pe.scene.headerfooter==null || pe.scene.headerfooter.currentArea=="text";
		var element = noHeaderFooter ? editor.document.createElement( 'span' ) : document.createElement( 'span' );			
		
		element.setAttribute("id", idValue );			
		element.setAttribute( "class", "ODT_DT "+"DT_TYPE_"+formatType );
		element.setAttribute( "unselectable", "on" );
		element.setAttribute( "contenteditable", "false" );
		element.setAttribute( "longdesc", patten);
		element.setAttribute( "datetime", dateFull);
		element.setAttribute( "lang", this.locale);
		
		if ( noHeaderFooter )
		{
			element.appendText(this.CURRENT_TIME);
			editor.insertElement( element );
		}
		else
		{
			element.innerHTML = this.CURRENT_TIME;
			pe.scene.headerfooter.setCursor();
			concord.widgets.headerfooter.headerfooterUtil.insertNodeAtCursor(element);		
		}
	},

	/*string*/formatTime: function(showString, /*format*/format) {
		var rawDate = showString;

		try{
			try{
					
				var options = {};
				var pattern = this.TimeFormatCode[format];
				if(pattern){
					dojo.mixin(options, pattern);
					if(format.indexOf("dateTime") == -1)//for dateTime, the selector should be null
						options.selector = "time";
				}else{
					options.timePattern = format;
					options.selector = "time";
				}
				options.locale = this.locale;
				
				if(format.indexOf("dateTime") == 0)
        			options.selector = "dateTime";
				showString = dojo.date.locale.format(rawDate, options);
			}
			catch(e){
				showString = dojo.date.locale.format(rawDate,{
					selector: "time"
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
				var pattern = this.TimeFormatCode[format];
				if(pattern){
					dojo.mixin(options, pattern);
					if(format.indexOf("dateTime") == -1)//for dateTime, the selector should be null
						options.selector = "time";
				}else{
					options.timePattern = format;
					options.selector = "time";
				}
				options.locale = this.locale;
				
				if(format.indexOf("dateTime") == 0)
        			options.selector = "dateTime";
				
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
