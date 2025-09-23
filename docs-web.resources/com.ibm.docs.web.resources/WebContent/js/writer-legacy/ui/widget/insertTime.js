dojo.provide("writer.ui.widget.insertTime");
dojo.require("concord.i18n.locale");
dojo.require("dojo.date.locale");
dojo.require("concord.util.date");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("dijit.Tooltip");

dojo.declare("writer.ui.widget.insertTime", [concord.widgets.concordDialog], {
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
		var nls = dojo.i18n.getLocalization("writer","lang");
		dojo.attr(timeCombox,{
			"id": "C_d_InsertTimeDialogTimeCombox",
			"size": 10,
			"role":"listbox",
			"title": nls.selectTime,
			"aria-label": nls.selectTime
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
		if (e.keyCode == dojo.keys.ENTER) {
			if(this.onOk(this.editor))
				this.hide();
		}
	},
	
	onOk: function (editor)
	{
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

		for(var index = 0 ; index < this.FORMAT_COUNT; index++)
		{
			var opt = document.createElement('option');
			opt.text = this.timeNamesArray[index];
			dojo.attr(opt,{"role":"option"});
			dojo.attr(opt,{"title":this.timeNamesArray[index]});
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
		var format = this.getFormatPatten(this.CURRENT_TIME_FORMAT);
		format && editor.execCommand( 'insertTime', format );
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
			console.log(e);
		}
		var textList = formatPatten.split("'");
		for( var i=0; i< textList.length; i = i+2 ){
		//for case 
		// "MMMM d, y 'at' h:mm:ss a"
			textList[i] = textList[i].replace("a","am/pm").replace(/y+/g,"yyyy");
		}
		return textList.join("'");
	},
	
	setLocale: function()
	{
		this.locale= pe.scene.locale || g_locale;
	}	
});
