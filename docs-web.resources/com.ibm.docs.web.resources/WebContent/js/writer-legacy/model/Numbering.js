dojo.require("writer.model.abstractNum");

dojo.provide("writer.model.Numbering");
writer.model.Numbering = function(source){
	this.init(source);
};
writer.model.Numbering.prototype = {
		init : function(source) {
			this.abstracts = {},this.imgs = {};
			this.nums = {};		// The object record the mapping from abstractNum to numId. 
			this.absNums = {};	// The object record the mapping from numId to abstractNum.
			for(var data in source)
			{
				if(data.indexOf('abstractNum') != -1)
					this.abstracts[data.substr(11)] = new writer.model.abstractNum(source[data]);
				else if(data.indexOf('numPicBullet') != -1)
					this.imgs[data.substr(12)] = new writer.model.text.Image(source[data],this);
				else if(data == "numIdMacAtCleanup ")	// Ignore it.
					continue;
				else
				{
					var numId = data.substr(3);
					var absNumId = source[data].abstractNumId;//parseInt(source[data].abstractNumId); 
					this.nums[numId] = absNumId;
					this.absNums[absNumId] = this.absNums[absNumId] || [];
					this.absNums[absNumId].push(numId);	// Many numId mapping to one absNumId
				}
			}
		},
		addList : function(nId,aId,absNum){
			// TODO Support lvlOverride attribute
			this.nums[nId] = aId;
			this.abstracts[aId] = absNum;
			this.absNums[aId] = this.absNums[aId] || [];
			this.absNums[aId].push(nId);
		},
		/**
		 * Get the other numId which mapping to same abstractNum.
		 * It's the same list.
		 * @param nId The numId
		 */
		getSameListNumId: function(numId)
		{
			var absNum = this.nums[numId];
			return absNum && this.absNums[absNum];
		},
		getImg : function(imageId, withOwner){
			var retImg = this.imgs[imageId];
			if(withOwner)
			{
				var jsonData = retImg.toJson();
				retImg = new writer.model.text.Image(jsonData, withOwner);
			}
			
			return retImg;
		},
		/**
		 * add img 
		 * @param img( img json or image model )
		 */
		addImg: function( imageId, img ){
			if( img.modelType == writer.MODELTYPE.IMAGE )
				this.imgs[imageId] = img;
	  		else if( img.rt == writer.model.text.Run.IMAGE || img.t == 'numPicBullet')
	  			this.imgs[imageId] = new writer.model.text.Image(img,this);
	  		else
	  			console.error( "wrong parameter!!");
		},
		getAbsNum : function(nId){
			return this.abstracts[this.nums[nId]];
		},
		getNumDefinitonByLevel : function(nId,lvl){
			var absNum = this.getAbsNum(nId);
			return absNum && absNum.getNumDefinitonByLevel(lvl);
		},
		getListPr : function(nId,lvl){
			var lvl = this.getNumDefinitonByLevel(nId, lvl);
			return lvl && lvl.getParaProperty();
		},
		isValidNumId: function(numId)
		{
			var absNumId = this.getSameListNumId(numId);
			return (absNumId && absNumId.length > 0);
//			if(this.nums[numId])
//				return true;
//			return false;
		}
};