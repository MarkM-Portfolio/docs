dojo.provide("writer.model.text.Hint");
/**
 * @author wangxum
 *
 */
writer.model.text.Hint=function(){
	
};
writer.model.text.Hint.prototype= {
		 /**
		 * Move the property
		 * @param index
		 * @param len
		 */
		move: function(index, len )
		{
			if(this.start > index)
				this.setStart( this.start + len );
			else if(this.start == index)
			{
				if(index == 0 || this.length==0){
					var preHint = this.previous();
					// Avoid insert text in empty run cause duplicate content when set style.
					if(preHint && preHint.start == index && preHint.length != 0)
					{
						this.setStart( this.start + len );
					}
					else
					{	
						this.setLength( this.length + len );
						this.markDirty();
					}
				}else
					this.setStart( this.start + len );
			}	
			else if((this.start + this.length) >= index)
			{
				this.setLength( this.length + len );
				this.markDirty();
			}
		},
		
		moveBackward:function(step, bMoveNext ){
			this.setStart( this.start + step );
			if( bMoveNext )
				this.moveNext( step );
		},
		
		moveNext: function( offset )
		{
			var next = this.next();
			while( next )
			{
				next.setStart( next.start + offset );
				next.markDirty();
				next = next.next();
			}	
		},
		
		offset: function( offset, bMoveNext  )
		{
			this.setLength( this.length + offset );
			this.markDirty();
			
			if( bMoveNext )
				this.moveNext( offset );
		},
		/*
		 * Set parent 
		 */
		setParent: function( parent )
		{
			this.parent = parent;
		},
		/*
		 * Set paragraph
		 */
		setParagraph: function( paragraph )
		{
			this.paragraph = paragraph;
		},
		/**
		 * inside method used by hints
		 * Remove the property from the index with length
		 * @param index
		 * @param len
		 */
		removeTextLength: function(index, len, container)
		{
			if(this.length == 0 && this.modelType == writer.MODELTYPE.TEXT)
			{
				if(container.length() == 1)
				{
					this.start = 0;
					return;
				}
				var prev = container.prev(this);
				if(!prev || !prev.br || prev.br.type == "page")
				{
					container.remove(this);
					this.deleteSel&&this.deleteSel();
				}
			}
			else if(this.start > index )
			{
				var delta = index + len - this.start;
				if(delta > 0)
				{
					if(delta >= this.length)
					{
						container.remove(this);
						this.deleteSel&&this.deleteSel();
					}
					else{
						this.length -= delta;
						this.start -= (len - delta);
						this.markDirty();
					}
				}
				else
				{
					this.start -= len;
					this.markDirty();
				}
			}	
			else if(this.start <= index  && this.start + this.length > index )
			{
				if( this.start + this.length > index + len )
				{
					this.length -=  len; 
					this.markDirty();
				}
				else if( this.start == index )
				{
					container.remove(this);
					this.deleteSel&&this.deleteSel();
				} 
				else 
				{
					this.length = index - this.start;
					this.markDirty();
				}
			}
		},
		createRun: function(reset)
		{
			var runs = new common.Container(this);
			if(this.container){
				this.container.forEach(function(childTextprop){
					var r = childTextprop.createRun(reset);
					if(r){
						if(r.isContainer){
							runs.appendAll(r);
						}else{
							runs.append(r);
						}
					}
				});
			}				
		},
		clearAllCache:function(){
			this.clearCache();
			if(this.container){
				var that = this;
				this.container.forEach(function(childTextprop){
					childTextprop.clearAllCache();
				});
			}
		},
		
		next: function(){
			if( this.parent )
				return this.parent.hints.next();
		},
		
//		//split a new hint 
//		//from start
//		split: function( index  ){
//		
//			var start = this.start;
//			var length = this.length;
//			if( index < start || index >= ( start + length ) )
//				return null;
//			
//			var split = this.clone();
//     		split.length = index - this.start;
//     		this.start = index;
//     		this.length -= index - start;
//		},
		getRuns: function()
		{
			if( this.container )
				return this.container;
			else
				return this;
		},
		//
		setStart: function( start )
		{
			this.start = start;
		},
		
		setLength: function( len )
		{
			this.length = len ;
		},
		
		byIndex: function(index, bSearchChild, bLeftSide)
		{
			if( index >= this.start && (index < ( this.start + this.length ) ||
					(bLeftSide && index == (this.start + this.length)))) 
				return this;
			else
				return null;
		},
		/**
		 * merge hint 
		 */
		canMerge: function(){
			return false;
		},
		/**
		 * merge
		 */
		merge: function( run )
		{
			this.length += run.length;
			if(run.author){
				this.author = run.author;
			}
		},
		getText:function(start,len){
			if( start == null )
				start = this.start || 0;
			if( len == null )
				len = this.length;
			
			if (!this.paragraph /*|| !this.paragraph.text*/){
				return "";
			}
			if (this.text) {
				return this.text.substr(start,len);
			} else  if(this.paragraph.text){
				return this.paragraph.text.substr(start,len);
			}// TODO run's parent maybe is not paragraph, like field/link
			else
				return "";
		},
		/**
		 * insert run
		 */
		insertHint: function( index, hint  ){
			if( this.canMerge( hint ))
			{
				this.merge( hint );
				this.markDirty();
				return this;
			}
			else
			{
				var right = this.split( index );
				var cs = pe.lotusEditor.relations.commentService;
				cs.trySetCommentOnInsertHint(hint, this, right);
				if( !right )
					this.parent.hints.insertAfter(hint, this);
				else{
					this.parent.hints.insertBefore(hint, right);
					if( right.length ==0 && right.modelType == "run.text")
					//remove this empty hint
						right.parent.hints.remove(right);
				}
				hint.setStart( index );
				hint.parent = this.parent;
				hint.markInsert();
				return hint;
			}
		},
		/**
		 * add text len
		 * @param len
		 * @param index
		 */
		addTextLength: function( len, index )
		{
			return false;
		},
		/**
		 * insert text into hint
		 * implement from low level to high level 
		 */
		insertText: function(  text, index){
			if( this.start > index || (  this.start+ this.length ) < index ){
				return false;
			}
			this.setLength( this.length + text.length );
			var parent = this.parent;
			while( parent && parent.hints ){
				parent.fixStart( this );
				if( parent.modelType ==  writer.MODELTYPE.PARAGRAPH ){
					var para = parent;
					para._insertText(text, index);
					para.markDirty();
					dojo.publish(writer.EVENT.REQUESTSPELLCHECKONPARA, [para, text, index]);
					break;
				}
				else{
					parent = parent.parent;
				}
			}
			return true;
		}
};