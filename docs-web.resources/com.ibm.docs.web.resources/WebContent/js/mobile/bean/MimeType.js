dojo.provide("mobile.bean.MimeType");
dojo.declare("mobile.bean.MimeType",null,{
	TEXT: 0,
	PRES: 1,
	SHEET: 2,
	IMAGE: 4,
	AUDIO: 5,
	ZIP: 6,
	PDF: 7,
	UNKNOWN: -1,
	symphonyTypeMap: null,
	allowMS: true,
	constructor: function(params){
		dojo.mixin(this,params);
		this.symphonyTypeMap = {"txt": this.TEXT,"odt": this.TEXT, "ods":this.SHEET,"odp":this.PRES};
		if(this.allowMS){
			dojo.mixin(this.symphonyTypeMap,{
				"doc": this.TEXT,
				"docx": this.TEXT,
				"xls": this.SHEET,
				"xlsx": this.SHEET,
				"ppt": this.PRES,
				"pptx": this.PRES
			});
		}
	},
	//In actually, use extension to verify mimeType 
	valueOf: function(extension){
		if(!extension || typeof(extension) != "string"){
			return this.UNKNOWN;
		}
		extension = extension.toLowerCase();
		var retVal = this.symphonyTypeMap[extension];
		return retVal=== null? this.UNKNOWN:retVal;
	},
	//verified by extension
	generate_mtHTML: function(extension){
		var MimeTypeObj = this;
		var contextPath = FILES_CONTEXT.contextPath,
			staticRootPath = FILES_CONTEXT.staticRootPath;
		var result = ["<a href='javascript: void(0);' class='lotus_mimeType_a'><img link='",null,"' class='lutos_mimeType32 ",null,"' src='"+contextPath+staticRootPath+"/images/lc3/blank.gif'></img></a>"];
		var class_pos = 3;
		this.generate_mtPart = function(extension){
			var mimeType = MimeTypeObj.valueOf(extension);
			switch(mimeType){
				case MimeTypeObj.IMAGE:
					result[class_pos] = "lotus_mimeType32_image";
					break;
				case MimeTypeObj.TEXT:
					result[class_pos] = "lotus_mimeType32_text";
					break;
				case MimeTypeObj.PRES:
					result[class_pos] = "lotus_mimeType32_pres";
					break;
				case MimeTypeObj.SHEET:
					result[class_pos] = "lotus_mimeType32_sheet";
					break;
				case MimeTypeObj.AUDIO:
					result[class_pos] = "lotus_mimeType32_audio";
					break;
				case MimeTypeObj.ZIP:
					result[class_pos] = "lotus_mimeType32_zip";
					break;
				case MimeTypeObj.PDF:
					result[class_pos] = "lotus_mimeType32_pdf";
					break;
				default:
					result[class_pos] = "lotus_mimeType32_unknown";
			}
			return result;
		};
		return this.generate_mtPart(extension);
	}
});
