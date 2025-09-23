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

dojo.provide("websheet.widget.ImagePropHandler");
dojo.require("concord.widgets.ImagePropertyDialog");
dojo.requireLocalization("concord.widgets","ImagePropHandler");

dojo.declare("websheet.widget.ImagePropHandler", null, {
	editor : null, 	
	grid : null,
	dlg : null,
	dialogtitle:null,
	imageRange :null,
	imageDiv:null,
	MAXWIDTH:4608, // 768*6 the max width px support
	MAXHEIGHT:6144,// 1024*6 the max height px support	
	
	constructor: function(parent, grid, imageRange, imageDiv){
		this.editor = parent;
		this.grid = grid;
		this.imageRange = imageRange;
		this.imageDiv = imageDiv;
		var nls = dojo.i18n.getLocalization("concord.widgets","ImagePropHandler");	
		this.dialogtitle = nls.sprdialogtitle;
	},	
	
	showDlg : function(){		
		if( !this.dlg ){	
			this.dlg = new concord.widgets.ImagePropertyDialog(this, this.dialogtitle, null, null);
		}	
		this.dlg.show();	
	},
	
	doCancel: function(){
		this.imageDiv.endResizeWithDialog();
	},
	
	updateImageRange: function(grid, imageRange, imageDiv){
		this.grid = grid;
		this.imageRange = imageRange;
		this.imageDiv = imageDiv;
	},	
	
	getImageInfo:function(){
		this.imageDiv.startResizeWithDialog();
		var imagePosInfo = this.imageDiv.getImagePosInfo();
		var alt = this.imageDiv.rangeInfo.range.data.alt || "";
		return this.convertToUMPerLocale(imagePosInfo.width, imagePosInfo.height, alt);		 
	},
	
	setImageInfo: function(width, height, border, alt){
		var node = this.grid.domNode;
		if (!(node && node.parentNode)) return;
		var imageInfo =this.convertToPX(width, height);		
		var imagePosInfo = this.imageDiv.getImagePosInfo();
		var newWidth =  imageInfo.width ;
		var newHeight =  imageInfo.height;
		
		if(this.imageDiv._drawDiv != null){
			//Get RightBottom Cell position
			if(imagePosInfo.width != imageInfo.width || imagePosInfo.height != imageInfo.height){
				this.imageDiv.isResizing = true;
				var cellInfo = this.grid.getCellInfoWithPosition(imagePosInfo.left + newWidth, imagePosInfo.top + newHeight, true);			
				if(imagePosInfo.width != imageInfo.width){
					if(this.imageDiv._imageResizeDiv){
						this.imageDiv._imageResizeDiv.style.width = width - cellInfo.colReviseOffset +"px";
					}
					this.imageDiv._drawDiv.style.width = width - cellInfo.colReviseOffset +"px";
					if(this.imageDiv._image){
						this.imageDiv._image.style.width = width - cellInfo.colReviseOffset +"px"; 
					}
				}
				if(imagePosInfo.height != imageInfo.height){
					if(this.imageDiv._imageResizeDiv){
						this.imageDiv._imageResizeDiv.style.height = height - cellInfo.rowReviseOffset + "px";
					}
					this.imageDiv._drawDiv.style.height = height - cellInfo.rowReviseOffset + "px";
					if(this.imageDiv._image){
						this.imageDiv._image.style.height = height- cellInfo.rowReviseOffset + "px";
					}
				}
			}
			if(this.imageDiv._image && alt && alt != this.imageDiv._image.alt){
				this.imageDiv._image.alt = alt;
				this.imageDiv.isResizing = true;
			}
			this.imageDiv.newAlt = alt;
			this.imageDiv.updateResizeDivs();			
			this.imageDiv.endResize();
		}else{
			this.imageDiv.endResizeWithDialog();
		}			 
	},
	
	/**
	 * Convert from PX to Locale related unit measurement
	 */
	convertToPX: function(width, height){	
		return {width:width, height:height};
	},
	
	/**
	 *  This method is used to convert from PX to unit of measurement per Locale
	 * 
	 */
	convertToUMPerLocale: function(width, height, alt){		
		return {width:width, height:height, Alt: alt, isSupportAlt:true, MaxWidth:this.MAXWIDTH, MaxHeight:this.MAXHEIGHT};
	}
	
});
