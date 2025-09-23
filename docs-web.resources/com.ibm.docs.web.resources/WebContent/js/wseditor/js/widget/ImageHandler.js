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

dojo.provide("websheet.widget.ImageHandler");
//dojo.require("websheet.widget.ImageDiv");
dojo.require("websheet.widget.ImageDiv");
dojo.require("concord.main.App");
dojo.requireLocalization("websheet.widget","ImageHandler");
dojo.requireLocalization("concord.widgets", "InsertImageDlg");

dojo.declare("websheet.widget.ImageHandler", websheet.widget.DrawFrameHandler, {

	//used to show new insert image to get image width, height
	sizeDiv:null,
	// handler for new insert image onload event
	onLoadHandler:null,
	
	nls:null,

    imageDrawedMap:{},
    
	constructor: function(editor) {
		this.usage = websheet.Constant.RangeUsage.IMAGE;
	},
	
	// call back function 
	_insertImageCB: function(fileUri, imgdata, srcParms, bNotFocus){
		var controller = this.editor.getController();
		var docObj = this.editor.getDocumentObj();
		var grid = this.editor.getCurrentGrid();
        var sheetName = grid.getSheetName();
        var x = 0;
        var y = 0;	
        var ex = 0, ey = 0;
        var width;
        var height;
        if (imgdata) {
        	width = imgdata.w;
        	height = imgdata.h;
        	srcParms.srcImageData = imgdata;
        } else {
			width = this._newImage.offsetWidth;
			height = this._newImage.offsetHeight;	
        }
        this.editor.moveSelectRectFocusVisible();
        var rangeAddr;
        var drawDiv = this.editor.getDrawFrameHdl().getSelectedDrawDivInCurrSheet();
        //Get anchor by currently focused shape.
        if(imgdata && drawDiv){
        	var offset = drawDiv.getRenderDivPosition();
        	var imgLeftPos = offset.left + 15;
        	var imgRightPos = imgLeftPos + width;
        	var newLeftTopCellInfo = drawDiv._grid.getCellInfoWithPosition(imgLeftPos, offset.top + 16, false, false, offset.bFrozen);
        	var newRightBottomCellInfo = drawDiv._grid.getCellInfoWithPosition(imgRightPos, offset.top + 16 + height, true, true, offset.bFrozen);
          
           if(newRightBottomCellInfo.colReviseOffset){ 
				width = width - newRightBottomCellInfo.colReviseOffset;
				if (width < websheet.Constant.minImgWidth) {
					if(!this.nls)
						this.nls = dojo.i18n.getLocalization("websheet.widget","ImageHandler");
					this.editor.scene.showWarningMessage(this.nls.imageSizeMsg,2000);
					return;
				}
			}
			if(newRightBottomCellInfo.rowReviseOffset){
				height = height - newRightBottomCellInfo.rowReviseOffset;
				if(height < websheet.Constant.minImgHeight){
					if(!this.nls)
						this.nls = dojo.i18n.getLocalization("websheet.widget","ImageHandler");
					this.editor.scene.showWarningMessage(this.nls.imageSizeMsg,2000);
					return;
				}
			}	
			
			var params = {refMask: websheet.Constant.RANGE_MASK};
			rangeAddr = websheet.Helper.getAddressByIndex(sheetName, newLeftTopCellInfo.rowIndex + 1, websheet.Helper.getColChar(newLeftTopCellInfo.colIndex),
									null,newRightBottomCellInfo.rowIndex + 1, websheet.Helper.getColChar(newRightBottomCellInfo.colIndex),params);
           
            if(imgdata.pt == "absolute"){
            	rangeAddr = websheet.Helper.createVirtualRef(sheetName);
				x = offset.left + 15;
				y = offset.top + 16 + grid.scroller.scrollTop;
            }else{
            	x = newLeftTopCellInfo["colOffset"];
				y = newLeftTopCellInfo["rowOffset"];
				ex = newRightBottomCellInfo["colOffset"];
				ey = newRightBottomCellInfo["rowOffset"];
            }
     	 }
     	 //Get anchor by currently focused cell.
		if(!rangeAddr){
			var selectRect = grid.selection.selector();
			var rowIndex = selectRect.focusRow + 1;
			var colIndex = selectRect.focusCol;
			var strColIndex = websheet.Helper.getColChar(colIndex);			
			var leftTopPos = this._getCellLeftTopPos(sheetName,rowIndex,colIndex,grid, true);
			if(!leftTopPos)
				return;
			var imgRightPos = leftTopPos.left + width;
			var rightBottomCellInfo = grid.getCellInfoWithPosition(imgRightPos, leftTopPos.top + height, true, true, leftTopPos.freeze);
			if(imgdata){
			 	if(rightBottomCellInfo.colReviseOffset){
					width = width - rightBottomCellInfo.colReviseOffset;
					if(width < websheet.Constant.minImgWidth){
						if(!this.nls)
							this.nls = dojo.i18n.getLocalization("websheet.widget","ImageHandler");
						this.editor.scene.showWarningMessage(this.nls.imageSizeMsg,2000);
						return;
					}
				}
				if(rightBottomCellInfo.rowReviseOffset){
					height = height - rightBottomCellInfo.rowReviseOffset;
					if(height < websheet.Constant.minImgHeight){
						if(!this.nls)
							this.nls = dojo.i18n.getLocalization("websheet.widget","ImageHandler");
						this.editor.scene.showWarningMessage(this.nls.imageSizeMsg,2000);
						return;
					}
				}
			}
			
			var endRowIndex = rightBottomCellInfo.rowIndex + 1;
			var endColIndex = rightBottomCellInfo.colIndex;
			ex = rightBottomCellInfo.colOffset;
			ey = rightBottomCellInfo.rowOffset;			
			var strEndColIndex = websheet.Helper.getColChar(endColIndex);
		
			var params = {refMask: websheet.Constant.RANGE_MASK};
			rangeAddr = websheet.Helper.getAddressByIndex(sheetName, rowIndex, strColIndex,null,endRowIndex,strEndColIndex,params);
		
			if(imgdata && imgdata.pt == "absolute"){
				rangeAddr = websheet.Helper.createVirtualRef(sheetName);
				var topleft = this._getCellLeftTopPos(sheetName,rowIndex,colIndex,this.editor.getCurrentGrid());
				if(!topleft)
					return;
				x = topleft.left;
				y = topleft.top;
			}
		}
		var uuid = dojox.uuid.generateRandomUuid();
		var rangeid = websheet.Constant.IDPrefix.RANGE + uuid;
		var attrs = {usage: this.usage, rangeid: rangeid};
		var sheetId = docObj.getSheetId(sheetName);		
		var zIndex = this.editor.getDrawFrameHdl().getMaxZIndex(sheetId) + 1;		
		
		if(imgdata) {
			var data = {w: width, h: height, x:x, y:y,z:zIndex, ex:ex ,ey:ey , pt: imgdata.pt};
			if (imgdata.svg)
				data.svg = imgdata.svg; //shape
			else
				data.href = fileUri;
			if(imgdata.alt)
				data.alt = imgdata.alt;
		}		
		else {
//			var data = {w: width, h: height, x:0, y:0,ex:ex, ey:ey, z:zIndex, pt: "relative2", href: fileUri};
			var data = {w: width, h: height, x:0, y:0,ex:ex, ey:ey, z:zIndex, pt: "relative", href: fileUri};
		}
		attrs.data = data;
		
		// use timer to delay create image to fix issue 12730-[FF][XP]New a spreadsheet and insert an image, the inserted image occasionally display a blank picture at first.
		setTimeout(dojo.hitch(this, this._insertRange, controller, rangeid, rangeAddr, attrs, srcParms, bNotFocus),100);
		
		//destroy the unnecessary resource
		if(this.onLoadHandler){
			dojo.disconnect(this.onLoadHandler);
			this.onLoadHandler=null;	    		    	
		}
		if(this.sizeDiv){
			dojo.destroy(this.sizeDiv);
			delete this.sizeDiv;	
		}
	},
	
	_insertRange: function(controller, rangeid, rangeAddr, attrs, srcParms, bNotFocus){
		var cb = this.editor._clipboard;
		if(cb._cutting){
			cb.exitSelect(true);
		}

		var revAttrs = {usage: this.usage, rangeid: rangeid};
		this.editor.execCommand(commandOperate.INSERTRANGE, [rangeid, rangeAddr, attrs, revAttrs]);
		
		if (!bNotFocus) {
			var range = this._areaMgr.getRangeByUsage(rangeid,this.usage);
			this.setFocus(range);
		}
	},
	
	// image stuff insert image at current focus cell
	insertImage: function (/*string*/fileUri, data, srcParms, bNotFocus) {
		// No response from server after image file is uploaded
		if (!fileUri) return;    	
		var controller = this.editor.getController();
        var sheetName = this.editor.getCurrentGrid().getSheetName();
		var grid = controller.getGrid(sheetName);
		if (!grid) return;
		if(!data){
			// need to load the image in order to get the width and height of the image			
			this.sizeDiv = dojo.create('div', null, grid.contentViews);	
			this.sizeDiv.id="sizeDiv";
			this._newImage = dojo.create("img", {src: fileUri},this.sizeDiv);  		
			this.onLoadHandler = dojo.connect(this._newImage,"onload",dojo.hitch(this, this._insertImageCB, fileUri, null, null, bNotFocus));
		}else{
			this._insertImageCB(fileUri,data, srcParms, bNotFocus);
		}
	},
	
	uploadImageWithFiles: function (files) {
		dojo.requireLocalization("concord.widgets", "InsertImageDlg");
		var nls = dojo.i18n.getLocalization("concord.widgets", "InsertImageDlg");
		
		var self = this;
		if (!self._dragDropUploadForm) {
			var form = self._dragDropUploadForm = dojo.create('form', {
    			name: "gridDragDropUploadForm",
    			style: {
    				position: "absolute",
    				top: "-1000px",
    				left: "-1000px"
    			}
    		}, dojo.body());
    		dojo.attr(form, {"enctype": "multipart/form-data"});
    		form.action = self.editor.filebrowserImageUploadUrl;
		}
		var uploadFormData = new FormData(self._dragDropUploadForm);
		for (var i = 0, len = files.length; i < len; i++) {
			uploadFormData.append("files", files[i]);
		}
		pe.scene.showWarningMessage(nls.loading);
        var servletUrl = self.editor.filebrowserImageUploadUrl;
        if (dojo.isSafari) {
        	var xhr = new XMLHttpRequest();
        	var requestHeader = {headers: {}};
        	concord.main.App.addCsrfToken(requestHeader);
        	xhr.open('POST', servletUrl, true);
        	var headers = requestHeader.headers;
        	for(var hdr in headers){
        		if(headers[hdr]){
					//Only add header if it has a value. This allows for instance, skipping
					//insertion of X-Requested-With by specifying empty value.
					xhr.setRequestHeader(hdr, headers[hdr]);
				}
			}
        	xhr.onload = function(ev) {
        	  // Handling logic omitted
        		var success;
        		if (xhr.status < 300) {
        			try {
        				success = self.uploadResponseHalde(xhr.responseText);
        			} catch (e) {success = false;}
        		}
        		if (!success) {
        			self.uploadRequestError();
        		}
        	};
        	xhr.onerror = function () {
        		self.uploadRequestError();
        	};
        	xhr.send(uploadFormData);
        	return;
        }
        var dfd = dojo.xhrPost({
			url: servletUrl,
			handleAs: "text",
			contentType: null,
			sync: false,
			postData: uploadFormData
		});
        dfd.addCallback(dojo.hitch(this, this.uploadResponseHalde));
		dfd.addErrback(function() {self.uploadRequestError();});
	},
	
	uploadImageBase64: function (data) {
		var nls = dojo.i18n.getLocalization("concord.widgets", "InsertImageDlg");

		var result = data.match(/^data:image\/([\w]+);base64/);
		if (!result) {
			return null;
		}
		var imgeType;
		var types = ['bmp', 'jpg', 'jpeg', 'gif', 'png'];
		for ( var i = 0; i < types.length; i++) {
			if (types[i] == result[1]) {
				imgeType = result[1];
				break;
			}
		}
		if (!imgeType) {
			pe.scene.showWarningMessage(nls.invalidImageType, 2000);
			return null;
		}
		var servletUrl = concord.util.uri.getEditAttRootUri() + "?method=dataUrl";
		pe.scene.showWarningMessage(nls.loading);
		var self = this;
		var deferred = dojo.xhrPost({
			url: servletUrl,
			handleAs: "json",
			load: function(response) {
				var newUri = response.uri;
				pe.scene.hideErrorMessage();
				self.insertImage(newUri);
			},
			error: function(error) {
				pe.scene.hideErrorMessage();
			},
			sync: false,
			contentType: "text/plain",
			postData: data
		});
		return deferred;
	},
	
	uploadRequestError: function () {
		this.editor.scene.hideErrorMessage();
		var nls = dojo.i18n.getLocalization("websheet.dialog","InsertImageDlg");
    	var insertImageErrorMsg = nls.insertImageErrorP1 + '<br>' +nls.insertImageErrorP2 + '<br>' + nls.insertImageErrorP3 ;		        
    	this.editor.scene.showErrorMessage(insertImageErrorMsg,10000);
	},

	uploadResponseHalde: function (data) {
		this.editor.scene.hideErrorMessage();
		var fileUrlFromServer;
		var errorMessage;
		
		var header = '<html><body><textarea>';
		var tail = '</textarea></body></html>';
		var jsonString = data.slice(data.indexOf(header) + header.length, data.lastIndexOf(tail));
		var json = dojo.fromJson(jsonString);
		if (json.attachments && json.attachments.length>0) {
			fileUrlFromServer = json.attachments[0].url;
			errorMessage = json.attachments[0].msg;
		}
		if (errorMessage) {
			if(errorMessage == 'insert_image_server_error') {
				var nls = dojo.i18n.getLocalization("websheet.dialog","InsertImageDlg");
	        	var insertImageErrorMsg = nls.insertImageErrorP1 + '<br>' +nls.insertImageErrorP2 
	                                      + '<br>' + nls.insertImageErrorP3 ;		        
	        	this.editor.scene.showErrorMessage(insertImageErrorMsg,10000);	
			} else {
				this.editor.scene.showErrorMessage(dojo.string.substitute(this.editor.nls.maxImgSize,[errorMessage]),2000);
			}
			return false;
		}
		if (!fileUrlFromServer ) {
			var nls = dojo.i18n.getLocalization("websheet.dialog","InsertImageDlg");
        	var insertImageErrorMsg = nls.insertImageErrorP1 + '<br>' +nls.insertImageErrorP2 
                                      + '<br>' + nls.insertImageErrorP3 ;		        
        	this.editor.scene.showErrorMessage(insertImageErrorMsg,10000);
			return false;
		}
		this.editor.getImageHdl().insertImage(fileUrlFromServer);
		return true;
	},
	
	onArrowKeyDown:function(sheetName, e, dir){		
		var move = false;
		var imageSheetMap = this.getDrawFrameMapBySheetName(sheetName);
		if(imageSheetMap){
	    	for(var imageid in imageSheetMap){
	    		var imageDiv = imageSheetMap[imageid];
	    		if(imageDiv && imageDiv.isSelected()){
	    			imageDiv.keyMove(e, dir);
	    			move = true;
	    		}
	    	}  
		}
		return move;
	},

	
	// draw all images when load the sheet
	drawAll: function(sheetName)
    {
        var controller = this.editor.getController();
        var docObj = this.editor.getDocumentObj();
        var grid = controller.getGrid(sheetName);
        if(!grid.isGridVisible())
        	return;
                
        var imageList = this._areaMgr.getRangesByUsage(this.usage, sheetName);
        this.isLoadingDraw = true;
        try{
        	if(imageList.length > 0)
	        {
	        	this.prepareColsWidth(grid);
	        	this.prepareRowsHeight(imageList,grid);
	        }
	        for(var i=0;i<imageList.length;i++)
	        {
	            var imageRange = imageList[i];
	            this._drawImage(imageRange,grid);
	        }
        }catch(e)
        {
        	console.log(e);
        }
        this.isLoadingDraw = false;
        this.resetCache();        
    },
    
    drawImage: function(imageRange,grid)
    {
    	if(!grid.isGridVisible())
          return;
         
    	try{
    		var rangeInfo = imageRange._getRangeInfo();    		
       		var sheetName = this.editor.getCurrentGrid().getSheetName();
       		if(rangeInfo.sheetName != sheetName)
       			return;
	    	this.prepareCache(rangeInfo, grid);
	    	this._drawImage(imageRange,grid);
    	}catch(e)
    	{
    		console.log(e);
    	}
		this.resetCache();
    },
    
    /*
     * call this founction if only the _rowsHeightMap and _colsWidthMap has been prepared
     */
    _drawImage: function(imageRange,grid)
    {
    	//verify if this image type is unsupported by Doc
    	if(imageRange.usage == websheet.Constant.RangeUsage.IMAGE && (imageRange.data.href.indexOf("file:///") == 0 || imageRange.data.href.length < 3 || websheet.config.config.unsupportedImages.indexOf(imageRange.data.href.substr(-3).toLowerCase()) != -1))
        	return;
    	
    	var isRelative = this.isRelativeShape(imageRange);
    	var rect = this._getFrameRect(imageRange, grid);
    	if(rect == null){
   			this.hideImgDiv(imageRange);
   			return;
    	}    	
        imageRange.data.w = rect.w;
        imageRange.data.h = rect.h;
        
    	if(isRelative && this.isFirstTimeDraw(imageRange.getId())){
    		// update image position information if the image x, y is bigger than row height or col width
    		if(!this._updateDrawPos(imageRange, grid))
    			return;
    	}
    	if (this.editor.isMobile() && !this.editor.scene.bJSMobileApp) {
    		return /*Do not render image on mobile app*/;
    	}
        var ImgDiv = this.getDrawFrameDivbySheetName(imageRange.getSheetName() ,imageRange.getId());
        if(ImgDiv)
        {
        	ImgDiv.redraw({top:rect.t,left:rect.l},{w:rect.w,h:rect.h});
        }
        else
        {        	
        	var imageInfo = { x: rect.l, y:rect.t,  width:rect.w, height:rect.h,
        			range:imageRange,isRelative: isRelative};
//        	ImgDiv = new websheet.widget.ImageDiv(grid, imageInfo, this, imageRange.getId());  	
        	ImgDiv = new websheet.widget.ImageDiv(grid, imageInfo, this, imageRange.getId());
        	this.addDrawFrameDiv2Map(imageRange.getSheetName(), imageRange.getId(), ImgDiv);
        }
    },

    hideImgDiv: function(imageRange)
    {
    	var imgDiv = this.getDrawFrameDivbySheetName(imageRange.getSheetName() ,imageRange.getId());
    	if(imgDiv)
    		imgDiv.hide();
    },
    
    isFirstTimeDraw: function(imageId){
    	return !this.imageDrawedMap[imageId];
    },    
    
    addDrawFrameDiv2Map: function(sheetName, imageId, imageDiv){
    	this.inherited(arguments);
    	this.imageDrawedMap[imageId]=imageId;
    },  
    
    setFocus: function(imageRange){
    	 this.scrollFrameIntoView(imageRange, true);
    },
	
	notify: function(area, event) {
		if(event && event._type == websheet.Constant.EventType.DataChange)
		{
			var s = event._source;
			var data = s.data;
			if (s.refType == websheet.Constant.OPType.AREA) {
				var controller = this.editor.getController();
				switch(s.action) {
					case websheet.Constant.DataChange.DELETE:{
						this.removeDrawFrameFromUI(area.getSheetName(), area.getId());
						break;
					}
					case websheet.Constant.DataChange.INSERT:{
						area.data = {};
						for(var attr in data) {
							area.data[attr] = data[attr];
						}
						controller.calcDrawFrameInfo(area);
						this.drawImage(area,this.editor.getCurrentGrid());
						if(s.mode){//focus to image if undo/redo
					     	this.setFocus(area);
						}
						break;
					}
					case websheet.Constant.DataChange.SET:{
						// do not care about the refValue which is the old position of image (parsedRef type)
						if(!area.data)
							area.data = {};
						for(var attr in data) {
							area.data[attr] = data[attr];
						}
						if(data || s.mode != undefined)//don't redraw image when update area is caused by undo delete row/column.
							this.drawImage(area,this.editor.getCurrentGrid());
						break;
					}
				}
			} else {
				 this.inherited(arguments);
			}
		}
	}
});