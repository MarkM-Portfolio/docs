dojo.provide("writer.filter.htmlParser.pastefromword");
(function()
{
	var fragmentPrototype = writer.filter.htmlParser.fragment.prototype,
		elementPrototype = writer.filter.htmlParser.element.prototype;

	fragmentPrototype.onlyChild = elementPrototype.onlyChild = function()
	{
		var children = this.children,
			count = children.length,
			firstChild = ( count == 1 ) && children[ 0 ];
		return firstChild || null;
	};

	elementPrototype.removeAnyChildWithName = function( tagName )
	{
		var children = this.children,
			childs = [],
			child;

		for ( var i = 0; i < children.length; i++ )
		{
			child = children[ i ];
			if ( !child.name )
				continue;

			if ( child.name == tagName )
			{
				childs.push( child );
				children.splice( i--, 1 );
			}
			childs = childs.concat( child.removeAnyChildWithName( tagName ) );
		}
		return childs;
	};

	elementPrototype.getAncestor = function( tagNameRegex )
	{
		var parent = this.parent;
		while ( parent && !( parent.name && parent.name.match( tagNameRegex ) ) )
			parent = parent.parent;
		return parent;
	};

	fragmentPrototype.firstChild = elementPrototype.firstChild = function( evaluator )
	{
		var child;

		for ( var i = 0 ; i < this.children.length ; i++ )
		{
			child = this.children[ i ];
			if ( evaluator( child ) )
				return child;
			else if ( child.name )
			{
				child = child.firstChild( evaluator );
				if ( child )
					return child;
			}
		}

		return null;
	};

	// Adding a (set) of styles to the element's 'style' attributes.
	elementPrototype.addStyle = function( name, value, isPrepend )
	{
		var styleText, addingStyleText = '';
		// name/value pair.
		if ( typeof value == 'string' )
			addingStyleText += name + ':' + value + ';';
		else
		{
			// style literal.
			if ( typeof name == 'object' )
			{
				for ( var style in name )
				{
					if ( name.hasOwnProperty( style ) )
						addingStyleText += style + ':' + name[ style ] + ';';
				}
			}
			// raw style text form.
			else
				addingStyleText += name;

			isPrepend = value;
		}

		if ( !this.attributes )
			this.attributes = {};

		styleText = this.attributes.style || '';

		styleText = ( isPrepend ?
		              [ addingStyleText, styleText ]
					  : [ styleText, addingStyleText ] ).join( ';' );

		this.attributes.style = styleText.replace( /^;|;(?=;)/, '' );
	};

	/**
	 * Return the DTD-valid parent tag names of the specified one.
	 * @param tagName
	 */
	writer.filter.dtd.parentOf = function( tagName )
	{
		var result = {};
		for ( var tag in this )
		{
			if ( tag.indexOf( '$' ) == -1 && this[ tag ][ tagName ] )
				result[ tag ] = 1;
		}
		return result;
	};

	// 1. move consistent list item styles up to list root.
	// 2. clear out unnecessary list item numbering.
	function postProcessList( list )
	{
		var children = list.children,
			child,
			attrs,
			count = list.children.length,
			match,
			mergeStyle,
			msolistId,
			styleTypeRegexp = /list-style-type:(.*?)(?:;|$)/,
			stylesFilter =  writer.filter.htmlParser.pastefromword.filters.stylesFilter;

		attrs = list.attributes;
		if ( styleTypeRegexp.exec( attrs.style ) )
			return;

		for ( var i = 0; i < count; i++ )
		{
			child = children[ i ];

			if ( child.attributes.value && Number( child.attributes.value ) == i + 1 )
				delete child.attributes.value;

			match = styleTypeRegexp.exec( child.attributes.style );

			if ( match )
			{
				if ( match[ 1 ] == mergeStyle || !mergeStyle ){
					mergeStyle = match[ 1 ];
					if( child.attributes[ "cke:mso-list"] )
						 msolistId = child.attributes[ "cke:mso-list"];
					
					else if ( child.children[0] && child.children[0].name == "p" )
					//IE11
					{
							writer.filter.htmlParser.pastefromword.filters.stylesFilter(
							[
								[ 'mso-list', null, function( val )
								{
									msolistId = val;
								} ]
							] )( child.children[0].attributes.style );
					}
				}
				else
				{
					mergeStyle = null;
					break;
				}
			}
		}

		if ( mergeStyle )
		{
			for ( i = 0; i < count; i++ )
			{
				attrs = children[ i ].attributes;
				attrs.style && ( attrs.style = stylesFilter( [ [ 'list-style-type'] ] )( attrs.style ) || '' );
			}
			msolistId && ( list.attributes[ "cke:mso-list"] = msolistId );
			list.addStyle( 'list-style-type', mergeStyle );
		}
	}

	var cssLengthRelativeUnit = /^([.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz){1}?/i;
	var emptyMarginRegex = /^(?:\b0[^\s]*\s*){1,4}$/;		// e.g. 0px 0pt 0px
	var romanLiternalPattern = '^m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$',
		lowerRomanLiteralRegex = new RegExp( romanLiternalPattern ),
		upperRomanLiteralRegex = new RegExp( romanLiternalPattern.toUpperCase() );

	var orderedPatterns = { 'decimal' : /\d+/, 'lower-roman': lowerRomanLiteralRegex, 'upper-roman': upperRomanLiteralRegex, 'lower-alpha' : /^[a-z]+[.|\s]*$/, 'upper-alpha': /^[A-Z]+[.|\s]*$/ },
		unorderedPatterns = { 'disc' : /[l\u00B7\u2002]/, 'circle' : /[\u006F\u00D8]/,'square' : /[\u006E\u25C6]/},
		listMarkerPatterns = { 'ol' : orderedPatterns, 'ul' : unorderedPatterns },
		romans = [ [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'] ],
		alpahbets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	// Convert roman numbering back to decimal.
	function fromRoman( str )
	 {
		 str = str.toUpperCase();
		 var l = romans.length, retVal = 0;
		 for ( var i = 0; i < l; ++i )
		 {
			 for ( var j = romans[i], k = j[1].length; str.substr( 0, k ) == j[1]; str = str.substr( k ) )
				 retVal += j[ 0 ];
		 }
		 return retVal;
	 }

	// Convert alphabet numbering back to decimal.
	function fromAlphabet( str )
	{
		str = str.toUpperCase();
		var l = alpahbets.length, retVal = 1;
		for ( var x = 1; str.length > 0; x *= l )
		{
			retVal += alpahbets.indexOf( str.charAt( str.length - 1 ) ) * x;
			str = str.substr( 0, str.length - 1 );
		}
		return retVal;
	}

	writer.filter.htmlParser.pastefromword =
	{
		utils :
		{
			// Create a <cke:listbullet> which indicate an list item type.
			createListBulletMarker : function ( bullet, bulletText, style )
			{
				var attributes = { 'cke:listsymbol' : bullet[ 0 ] };
				if( style ) attributes["style"] = style;
				var marker = writer.filter.htmlParser.createElementByTag( 'cke:listbullet', attributes );
				marker.add( new writer.filter.htmlParser.text( bulletText ) );
				return marker;
			},

			isListBulletIndicator : function( element )
			{
				var styleText = element.attributes && element.attributes.style;
				if ( /mso-list\s*:\s*Ignore/i.test( styleText ) )
					return true;
			},

			notParagraphFont : function( element )
			{
				var oChild = element.onlyChild();
				var childValue = oChild && (oChild.type == 3)&& oChild.value;
				if(childValue && childValue == '&nbsp;')
				{
					var pName = element.parent.name;
					return !(pName == 'o:p' || pName == 'font' || pName == 'span' || pName == 'p');
				}
				return false;
			},

			isContainingOnlySpaces : function( element )
			{
				var text;
				return ( ( text = element.onlyChild() ) && !element.attributes["cke_tab"]
					    && ( /^(:?\s|&nbsp;)+$/ ).test( text.value ) );
			},

			resolveList : function( element )
			{
				// <cke:listbullet> indicate a list item.
				var attrs = element.attributes,
					listMarker;

				if ( ( listMarker = element.removeAnyChildWithName( 'cke:listbullet' ) )
						&& listMarker.length
						&& ( listMarker = listMarker[ 0 ] ) )
				{
					if( (/^h\d/).test(element.name)){
						var ret = element.name.match(/^h(\d)$/);
						if( ret )
							attrs[ 'cke:indent' ] = parseInt(ret[1]);
					}
					element.name = 'cke:li';
					var mergeStyles = [ 'font-size','color','font-style','text-decoration'];
					for( var i=0;i< mergeStyles.length; i++ ){
						var styleValue = listMarker.getStyle()[mergeStyles[i]];
						if( styleValue ){
						//merge styles
							if( attrs.style && attrs.style.substr(-1)!= ";" )
								attrs.style +=";";
							attrs.style += mergeStyles[i]+":" + styleValue;
						};
					}
					
					var font = listMarker.getStyle()['font-family'];
					if( font && (( font.indexOf("Wingdings")==0) || font =="Webdings" || font == "Symbol")){
					//symbol bullet font
					//set default bullet is "."
						attrs['cke:listsymbol']=".";
					}
					if ( attrs.style )
					{
						attrs.style =  writer.filter.htmlParser.pastefromword.filters.stylesFilter(
								[
									[ 'line-height' ]
								] )( attrs.style, element ) || '';
					}
					// Inherit attributes from bullet.
					writer.filter.tools.extend( attrs, listMarker.attributes );
					return true;
				}
				return false;
			},

			// Providing a shorthand style then retrieve one or more style component values.
//			getStyleComponents : ( function()
//			{
//				var calculator = CKEDITOR.dom.element.createFromHtml(
//								'<div style="position:absolute;left:-9999px;top:-9999px;"></div>',
//								CKEDITOR.document );
//				CKEDITOR.document.getBody().append( calculator );
//
//				return function( name, styleValue, fetchList )
//				{
//					calculator.setStyle( name, styleValue );
//					var styles = {},
//						count = fetchList.length;
//					for ( var i = 0; i < count; i++ )
//						styles[ fetchList[ i ] ]  = calculator.getStyle( fetchList[ i ] );
//
//					return styles;
//				};
//			} )(),

			listDtdParents : writer.filter.dtd.parentOf( 'ol' )
		},

		filters :
		{
				// Transform a normal list into flat list items only presentation.
				// E.g. <ul><li>level1<ol><li>level2</li></ol></li> =>
				// <cke:li cke:listtype="ul" cke:indent="1">level1</cke:li>
				// <cke:li cke:listtype="ol" cke:indent="2">level2</cke:li>
				flattenList : function( element, level )
				{
					level = typeof level == 'number' ? level : 1;

					var	attrs = element.attributes,
						listStyleType;
					//IE11
					writer.filter.htmlParser.pastefromword.filters.stylesFilter(
					[
						[ 'list-style-type', null, function( val )
						{
							listStyleType = val;
						} ]
					] )( attrs.style );
					// All list items are of the same type.
					if( !listStyleType && attrs.type  ){
						switch ( attrs.type )
						{
							case 'a' :
								listStyleType = 'lower-alpha';
								break;
							case 'A' :
								listStyleType = 'upper-alpha';
								break;
							case '1' :
								listStyleType = 'decimal';
								break;
							case 'I' :
								listStyleType = 'upper-roman';
								break;
							case 'i' :
								listStyleType = 'lower-roman';
								break;
							case 'disc' :
								listStyleType = 'disc';
								break;
							case 'square' :
								listStyleType = 'square';
								break;
							case 'circle' :
								listStyleType = 'circle';
								break;
							// TODO: Support more list style type from MS-Word.
						}
					}

					var children = element.children,
						child;

					for ( var i = 0; i < children.length; i++ )
					{
						child = children[ i ];

						if ( child.name in writer.filter.dtd.$listItem )
						{
							var attributes = child.attributes,
								listItemChildren = child.children,
								count = listItemChildren.length,
								last = listItemChildren[ count - 1 ];

							// Move out nested list.
							if ( last.name in writer.filter.dtd.$list )
							{
								element.add( last, i + 1 );

								// Remove the parent list item if it's just a holder.
								if ( !--listItemChildren.length )
									children.splice( i--, 1 );
							}

							child.name = 'cke:li';
							// Inherit numbering from list root on the first list item.
							attrs.start && !i && ( attributes.value = attrs.start );
							listStyleType &&( attributes["cke:list-style-type"] = listStyleType );
							attributes["cke:listtype"] = element.name;
						}
						// Flatten sub list.
						else if ( child.name in writer.filter.dtd.$list )
						{
							// Absorb sub list children.
							arguments.callee.apply( this, [ child, level + 1 ] );
							children = children.slice( 0, i ).concat( child.children ).concat( children.slice( i + 1 ) );
							element.children = [];
							for ( var j = 0, num = children.length; j < num ; j++ )
								element.add( children[ j ] );
						}
					}

					delete element.name;

					// We're loosing tag name here, signalize this element as a list.
					attrs[ 'cke:list' ] = 1;
				},
				/**
				 *  Try to collect all list items among the children and establish one
				 *  or more HTML list structures for them.
				 * @param element
				 */
				assembleList : function( element )
				{
					var children = element.children, child,
							listItem,   // The current processing cke:li element.
							listItemAttrs,
							listItemIndent, // Indent level of current list item.
							lastIndent,
							lastListItem, // The previous one just been added to the list.
							list, // Current staging list and it's parent list if any.
							openedLists = [];

					// Properties of the list item are to be resolved from the list bullet.
					var bullet,
						bulletFont,
						listType,
						listStyleType,
						itemNumeric;

					for ( var i = 0; i < children.length; i++ )
					{
						child = children[ i ];

						if ( 'cke:li' == child.name )
						{
							child.reName('li');
							listItem = child;
							listItemAttrs = listItem.attributes;
							bullet = listItemAttrs[ 'cke:listsymbol' ];
							bullet = bullet && bullet.match( /^(?:[(]?)([^\s]+?)([.) ]?)$/ );
							listType = listStyleType = itemNumeric = null;

							if ( listItemAttrs[ 'cke:ignored' ] )
							{
								children.splice( i--, 1 );
								continue;
							}
								
							if ( listItemAttrs.style )
							{
								var marginleft = null;
								var hanging = null;
								listItemAttrs.style =  writer.filter.htmlParser.pastefromword.filters.stylesFilter(
										[
											// Text-indent is not representing list item level any more.
											[ 'mso-text-indent-alt', null, function( indent ){
												hanging = indent;
											} ],
											[ 'line-height' ],
											// First attempt is to resolve indent level from on a constant margin increment.
											[ ( /^margin(:?-left)?$/ ), null, function( margin )
											{
												// Deal with component/short-hand form.
												var values = margin.split( ' ' );
												marginleft =  values[ 3 ] || values[ 1 ] || values [ 0 ];
												// Figure out the indent unit by checking the first time of incrementation.
											} ],
											
//											[ 'tab-stops', null, function( val ){
//												var values =  val.split(/ /);
//												for( var i=0; i< values.length-1; i++ ){
//													if( values[i]== "list"  )
//													{
//														list_tab = values[i+1];
//													}
//												}
//											}],
											// The best situation: "mso-list:l0 level1 lfo2" tells the belonged list root, list item indentation, etc.
											[ ( /^mso-list$/ ), null, function( val )
											{
												if( val == "Ignore")
													return;
												val = val.split( ' ' );
												var listId = val[ 2 ]||val[ 0 ],
													indent =  val[ 1 ] && Number( val[ 1 ].match( /\d+/ ) );
												if( hanging && hanging.indexOf( "-") == 0 )
													hanging = hanging.substring(1);
												writer.filter.htmlParser.listTypes[listId]=writer.filter.htmlParser.listTypes[listId]||{};
												writer.filter.htmlParser.listTypes[listId][indent] = {};
												if( marginleft )
													writer.filter.htmlParser.listTypes[listId][indent]["left"]=marginleft;
												if( hanging )
													writer.filter.htmlParser.listTypes[listId][indent]["hanging"]=hanging;
												listItemAttrs[ 'cke:listId' ] = listId;
												listItemAttrs[ 'cke:indent' ] = indent;
											} ]
										] )( listItemAttrs.style, element ) || '';
							}
							// List item indent level might come from a real list indentation or
							// been resolved from a pseudo list item's margin value, even get
							// no indentation at all.
							listItemId =  listItemAttrs[ 'cke:listId' ];
							if( listItemId == null ){
								var styleId = child.attributes["styleId"];
								if( /^Heading\d$/.test(styleId)){
									listItemId = styleId;
									listItemIndent = styleId.match(/\d/)[0];
								}
								else{
									listItemId = listItemAttrs["class"] || WRITER.MSG_HELPER.getUUID(); 
									listItemIndent = 1;
								}
								listItemAttrs[ 'cke:listId' ] = listItemId;
								listItemAttrs[ 'cke:indent' ] = listItemIndent;
								if( hanging && hanging.indexOf( "-") == 0 )
									hanging = hanging.substring(1);
								writer.filter.htmlParser.listTypes[listItemId]=writer.filter.htmlParser.listTypes[listItemId]||{};
								writer.filter.htmlParser.listTypes[listItemId][listItemIndent] = {};
								if( marginleft )
									writer.filter.htmlParser.listTypes[listItemId][listItemIndent]["left"]=marginleft;
								if( hanging )
									writer.filter.htmlParser.listTypes[listItemId][listItemIndent]["hanging"]=hanging;
							}
							else
								listItemIndent = Number( listItemAttrs[ 'cke:indent' ] );

							var data = writer.filter.htmlParser.listTypes[listItemId][listItemIndent];
							
							if( data.listType )
								continue;
							if ( !bullet )
							{
								listType = listItemAttrs[ 'cke:listtype' ] || 'ol';
								listStyleType = listItemAttrs[ 'cke:list-style-type' ];
							}
							else
							{
								for ( var type in listMarkerPatterns )
								{
									for ( var style in listMarkerPatterns[ type ] )
									{
										if ( listMarkerPatterns[ type ][ style ].test( bullet[ 1 ] ) )
										{
											// Small numbering has higher priority, when dealing with ambiguous
											// between C(Alpha) and C.(Roman).
											if ( type == 'ol' && ( /alpha|roman/ ).test( style ) )
											{
												var num = /roman/.test( style ) ? fromRoman( bullet[ 1 ] ) : fromAlphabet( bullet[ 1 ] );
												if ( !itemNumeric || num < itemNumeric )
												{
													itemNumeric = num;
													listType = type;
													listStyleType = style;
												}
											}
											else
											{
												listType = type;
												listStyleType = style;
												break;
											}
										}
									}
								}

								// Simply use decimal/disc for the rest forms of unrepresentable
								// numerals, e.g. Chinese..., but as long as there a second part
								// included, it has a bigger chance of being a order list ;)
								!listType && ( listType = bullet[ 2 ] ? 'ol' : 'ul' );
							}

							listStyleType = listStyleType || ( listType == 'ol' ? 'decimal' : 'disc' );
							// Figure out start numbering.
							if ( listType == 'ol' && bullet )
							{
								switch ( listStyleType )
								{
									case 'decimal' :
										itemNumeric = Number( bullet[ 1 ] );
										break;
									case 'lower-roman':
									case 'upper-roman':
										itemNumeric = fromRoman( bullet[ 1 ] );
										break;
									case 'lower-alpha':
									case 'upper-alpha':
										itemNumeric = fromAlphabet( bullet[ 1 ] );
										break;
								}
								itemNumeric = itemNumeric || 1;
							}
							
							data.listType = listType;
							data.listStyleType = listStyleType;
						//	if( list_tab ) ( data.tabPos = list_tab );
						//	data.startNum = itemNumeric;
						}
					}
			},

				/**
				 * A simple filter which always rejecting.
				 */
				falsyFilter : function( value )
				{
					return false;
				},

				/**
				 * A simple filter for styles with same name.
				 */
				dupStyleFilter : function( styleText )
				{
					var rules =[]; 
					styleText
						.replace( /\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g,
							 function( match, name, value )
							 {
								var idx = -1;
								for(var i=0;i<rules.length;i++)
								{
									if(rules[i][0] == name)
									{
										idx = i;
										break;
									}									
								}
								if(idx>0)
									rules[idx][1] += ' ' + value;
								else
									rules.push([name,value]);
							 });
					for ( var i = 0 ; i < rules.length ; i++ )						
						 rules[ i ] = rules[ i ].join( ':' );
					return rules.length ?
					         ( rules.join( ';' ) + ';' ) : false;
				},

				/**
				 * A filter dedicated on the 'style' attribute filtering, e.g. dropping/replacing style properties.
				 * @param styles {Array} in form of [ styleNameRegexp, styleValueRegexp,
				 *  newStyleValue/newStyleGenerator, newStyleName ] where only the first
				 *  parameter is mandatory.
				 * @param whitelist {Boolean} Whether the {@param styles} will be considered as a white-list.
				 */
				stylesFilter : function( styles, whitelist )
				{
					return function( styleText, element )
					{
						 var rules = [];
						// html-encoded quote might be introduced by 'font-family'
						// from MS-Word which confused the following regexp. e.g.
						//'font-family: &quot;Lucida, Console&quot;'
						( styleText || '' )
							.replace( /&quot;/g, '"' )
							.replace( /\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g,
								 function( match, name, value )
								 {
									 name = name.toLowerCase();
									 name == 'font-family' && ( value = value.replace( /["']/g, '' ) );

									 var namePattern,
										 valuePattern,
										 newValue,
										 newName;
									 for ( var i = 0 ; i < styles.length; i++ )
									 {
										if ( styles[ i ] )
										{
											namePattern = styles[ i ][ 0 ];
											valuePattern = styles[ i ][ 1 ];
											newValue = styles[ i ][ 2 ];
											newName = styles[ i ][ 3 ];

											if ( name.match( namePattern )
												 && ( !valuePattern || value.match( valuePattern ) ) )
											{
												name = newName || name;
												whitelist && ( newValue = newValue || value );

												if ( typeof newValue == 'function' )
													newValue = newValue( value, element, name );

												// Return an couple indicate both name and value
												// changed.
												if ( newValue && newValue.push )
													name = newValue[ 0 ], newValue = newValue[ 1 ];

												if ( typeof newValue == 'string' )
													rules.push( [ name, newValue ] );
												return;
											}
										}
									 }

									 !whitelist && rules.push( [ name, value ] );

								 });

						for ( var i = 0 ; i < rules.length ; i++ )
							 rules[ i ] = rules[ i ].join( ':' );
						return rules.length ?
						         ( rules.join( ';' ) + ';' ) : false;
					 };
				},

				/**
				 * A filter which remove cke-namespaced-attribute on
				 * all none-cke-namespaced elements.
				 * @param value
				 * @param element
				 */
				bogusAttrFilter : function( value, element )
				{
					if( element.name.indexOf( 'cke:' ) == -1 )
						return false;
				},

				/**
				 * A filter which will be used to apply inline css style according the stylesheet
				 * definition rules, is generated lazily when filtering.
				 */
				applyStyleFilter : null

			},

		getRules : function( config )
		{
			var dtd = writer.filter.dtd,
				blockLike = writer.filter.tools.extend( {}, dtd.$block, dtd.$listItem, dtd.$tableContent ),
				filters = this.filters,
				falsyFilter = filters.falsyFilter,
				stylesFilter = filters.stylesFilter,
				dupStyleFilter = filters.dupStyleFilter,
				bogusAttrFilter = filters.bogusAttrFilter,
				createListBulletMarker = this.utils.createListBulletMarker,
				flattenList = filters.flattenList,
				assembleList = filters.assembleList,
				isListBulletIndicator = this.utils.isListBulletIndicator,
				notParagraphFont = this.utils.notParagraphFont,
				containsNothingButSpaces = this.utils.isContainingOnlySpaces,
				resolveListItem = this.utils.resolveList,
				listDtdParents = this.utils.listDtdParents,
				removeFontStyles = config.pasteFromWordRemoveFontStyles !== false,
				removeStyles = config.pasteFromWordRemoveStyles !== false;

			return {

				elementNames :
				[
					// Remove script, meta and link elements.
					[ ( /meta|link|script/ ), '' ]
				],
				
				root : function( element )
				{ //root node
					element.filterChildren();
					assembleList( element );
				},

				elements :
				{
					'^' : function( element )
					{
						// Transform CSS style declaration to inline style.
						var applyStyleFilter;
						if ( dojo.isFF && ( applyStyleFilter = filters.applyStyleFilter ) )
							applyStyleFilter( element );
					},

					$ : function( element )
					{
						var tagName = element.name || '',
							attrs = element.attributes;

						// Convert length unit of width/height on blocks to
						// a more editor-friendly way (px).
						if ( tagName in blockLike
							&& attrs.style )
						{
							attrs.style = stylesFilter(
										[ [ ( /^(:?width|height)$/ ), null, null ] ] )( attrs.style ) || '';
							if(dojo.isWebKit)
								attrs.style = dupStyleFilter( attrs.style ) || '';
						}

						// Processing headings.
						if ( tagName.match( /h\d/ ) )
						{
							element.filterChildren();
							// Is the heading actually a list item?
							var styleId;
							if( (ret = element.name.match(/h([1-6])/) )&& ret[1] ){
									styleId = "Heading"+ret[1];
							}
							if( resolveListItem( element ) ){
								if( styleId){
									element.attributes["styleId"] = styleId;
								}
								return;
							}
						}
						// Remove inline elements which contain only empty spaces.
						else if ( tagName in dtd.$inline )
						{
							element.filterChildren();
							if ( containsNothingButSpaces( element ) )
								delete element.name;
						}
						// Remove element with ms-office namespace,
						// with it's content preserved, e.g. 'o:p'.
						else if ( tagName.indexOf( ':' ) != -1
								 && tagName.indexOf( 'cke' ) == -1 )
						{
							element.filterChildren();

							// Restore image real link from vml.
							if ( tagName == 'v:imagedata' )
							{
								var href = element.attributes[ 'o:href' ];
								if ( href )
									element.attributes.src = href;
								element.name = 'img';
								return;
							}
							delete element.name;
						}

						// Assembling list items into a whole list.
						if ( tagName in listDtdParents )
						{
							element.filterChildren();
							assembleList( element );
						}
					},

					// We'll drop any style sheet, but Firefox conclude
					// certain styles in a single style element, which are
					// required to be changed into inline ones.
					'style' : function( element )
					{
						if ( dojo.isFF )
						{
							// Grab only the style definition section.
							var oChild = element.onlyChild();
							var styleDefSection = oChild && oChild.value && oChild.value.match( /\/\* Style Definitions \*\/([\s\S]*?)\/\*/ ),
								styleDefText = styleDefSection && styleDefSection[ 1 ],
								rules = {}; // Storing the parsed result.

							if ( styleDefText )
							{
								styleDefText
									// Remove line-breaks.
									.replace(/[\n\r]/g,'')
									// Extract selectors and style properties.
									.replace( /(.+?)\{(.+?)\}/g,
										function( rule, selectors, styleBlock )
										{
											selectors = selectors.split( ',' );
											var length = selectors.length, selector;
											for ( var i = 0; i < length; i++ )
											{
												// Assume MS-Word mostly generate only simple
												// selector( [Type selector][Class selector]).
												writer.filter.tools.trim( selectors[ i ] )
															  .replace( /^(\w+)(\.[\w-]+)?$/g,
												function( match, tagName, className )
												{
													tagName = tagName || '*';
													className = className.substring( 1, className.length );

													// Reject MS-Word Normal styles.
													if( className.match( /MsoNormal/ ) )
														return;

													if( !rules[ tagName ] )
														rules[ tagName ] = {};
													if( className )
														rules[ tagName ][ className ] = styleBlock;
													else
														rules[ tagName ] = styleBlock;
												} );
											}
										});

								filters.applyStyleFilter = function( element )
								{
									var name = rules[ '*' ] ? '*' : element.name,
										className = element.attributes && element.attributes[ 'class' ],
										style;
									if( name in rules )
									{
										style = rules[ name ];
										if( typeof style == 'object' )
											style = style[ className ];
										// Maintain style rules priorities.
										style && element.addStyle( style, true );
									}
								};
							}
						}
						return false;
					},

					'p' : function( element )
					{
						// This's a fall-back approach to recognize list item in FF3.6,
						// as it's not perfect as not all list style (e.g. "heading list") is shipped
						// with this pattern. (#6662)
						if ( /MsoListParagraph/.exec( element.attributes[ 'class' ] ) )
						{
							var bulletText = element.firstChild( function( node )
							{
								return node.type == writer.filter.NODE_TEXT && !containsNothingButSpaces( node.parent );
							});
							var bullet = bulletText && bulletText.parent,
								bulletAttrs = bullet && bullet.attributes;
							bulletAttrs && !bulletAttrs.style && ( bulletAttrs.style = 'mso-list: Ignore;' );
						}
						if( /MsoCommentText/.test( element.attributes[ 'class' ]||"") )
							//foot node reference 
									return false;
						element.filterChildren();

						var attrs = element.attributes,
							parent = element.parent,
							children = element.children;

						// Is the paragraph actually a list item?
						if ( resolveListItem( element ) )
							return;

					},

					'div' : function( element )
					{
						// Aligned table with no text surrounded is represented by a wrapper div, from which
						// table cells inherit as text-align styles, which is wrong.
						// Instead we use a clear-float div after the table to properly achieve the same layout.
						var singleChild = element.onlyChild();
						if( singleChild && singleChild.name == 'table' )
						{
							var attrs = element.attributes;
							singleChild.attributes = writer.filter.tools.extend( singleChild.attributes, attrs );
							attrs.style && singleChild.addStyle( attrs.style );

							var clearFloatDiv = writer.filter.htmlParser.createElementByTag( 'div' );
							clearFloatDiv.addStyle( 'clear' ,'both' );
							element.add( clearFloatDiv );
							delete element.name;
						}
					},

					'td' : function ( element )
					{
						// 'td' in 'thead' is actually <th>.
						if ( element.getAncestor( 'thead') )
							element.reName('th');
					},

					// MS-Word sometimes present list as a mixing of normal list
					// and pseudo-list, normalize the previous ones into pseudo form.
					'ol' : flattenList,
					'ul' : flattenList,
					'dl' : flattenList,

					'font' : function( element )
					{
						// Drop the font tag if it comes from list bullet text.
						if ( isListBulletIndicator( element.parent ) )
						{
							delete element.name;
							return;
						}
						
						element.filterChildren();
						
						// IE:drop the font tag and it's child like this:<td><font>&nbsp;</font><p>...
						if(dojo.isIE&& notParagraphFont(element))
							return false;

						var attrs = element.attributes,
							styleText = attrs.style,
							parent = element.parent;

						if ( 'font' == parent.name )     // Merge nested <font> tags.
						{
							writer.filter.tools.extend( parent.attributes,
									element.attributes );
							styleText && parent.addStyle( styleText );
							delete element.name;
						}
						// Convert the merged into a span with all attributes preserved.
						else
						{
							styleText = styleText || '';
							// IE's having those deprecated attributes, normalize them.
							if ( attrs.color )
							{
								attrs.color != '#000000' && ( styleText += 'color:' + attrs.color + ';' );
								delete attrs.color;
							}
							if ( attrs.face )
							{
								styleText += 'font-family:' + attrs.face + ';';
								delete attrs.face;
							}
							// TODO: Mapping size in ranges of xx-small,
							// x-small, small, medium, large, x-large, xx-large.
							//do not support large/small/medium size
//							if ( attrs.size )
//							{
//								styleText += 'font-size:' +
//								             ( attrs.size > 3 ? 'large'
//										             : ( attrs.size < 3 ? 'small' : 'medium' ) ) + ';';
//								delete attrs.size;
//							}

							element.reName( 'span' );
							element.addStyle( styleText );
						}
					},

					'span' : function( element )
					{
						// Remove the span if it comes from list bullet text.
						if ( isListBulletIndicator( element.parent ) )
							return false;
						if( (/MsoEndnoteReference|MsoFootnoteReference|MsoCommentReference/).test( element.attributes[ 'class' ]||"" ) )
						//foot node reference 
								return false;
						// List item bullet type is supposed to be indicated by
						// the text of a span with style 'mso-list : Ignore' or an image.
						if ( isListBulletIndicator( element ) )
						{
							var listSymbolNode = element.firstChild( function( node )
							{
								if( node.value )
									return node.value.replace(/[&nbsp;|\s]/gi,"")!="";
								else
									return node.name == 'img';
							});

							var listSymbol =  listSymbolNode && ( listSymbolNode.value || 'l.' ),
								listType = listSymbol && listSymbol.match( /^(?:[(]?)([^\s]+?)([.) ]?)$/ );

							if ( listType )
							{
								var marker = createListBulletMarker( listType, listSymbol, listSymbolNode.parent.attributes["style"] );
								// Some non-existed list items might be carried by an inconsequential list, indicate by "mso-hide:all/display:none",
								// those are to be removed later, now mark it with "cke:ignored".
								var ancestor = element.getAncestor( 'span' );
								if ( ancestor && (/ mso-hide:\s*all|display:\s*none /).test( ancestor.attributes.style ) )
									marker.attributes[ 'cke:ignored' ] = 1;
								if( ancestor && ancestor.attributes[ 'style' ] )
									marker.attributes[ 'style' ] = ancestor.attributes[ 'style' ];
								return marker;
							}
						}
						
						element.filterChildren();
						if ( containsNothingButSpaces( element ) )
						{
							var attrs = element.attributes;
							var styleText = attrs && attrs.style;
							if( /^mso-tab-count:1$/.test(styleText))
							{
								element.children[0].value = "\t";
								attrs["cke_tab"] = "1";
								return null;
							}
							else
							{
								delete element.name;
								return null;
							}
						}
						// Update the src attribute of image element with href.
						var children = element.children,
							attrs = element.attributes,
							styleText = attrs && attrs.style,
							firstChild = children && children[ 0 ];

						// Assume MS-Word mostly carry font related styles on <span>,
						// adapting them to editor's convention.
						if ( styleText )
						{
							var pat_fs = /(^|;)font-size:[^:;]*;/;
							var fs = '';
							styleText = styleText.replace(pat_fs,function(all,n1){if(n1 && n1==';') {fs=all.substring(1);return';';} else {fs=all;return '';}});							
							if(fs)
							{
								if(!styleText || /;$/.test(styleText.replace( /&quot;$/, '' )))
									styleText += fs;
								else
									styleText += ';' + fs;
							}

							attrs.style = stylesFilter(
									[
										// Drop 'inline-height' style which make lines overlapping.
										[ 'line-height' ]
									] )( styleText, element ) || '';
						}

						return null;
					},

					// Editor doesn't support anchor with content currently (#3582),
					// drop such anchors with content preserved.
					'a' : function( element )
					{
						var attrs = element.attributes;
						if ( attrs && !attrs.href && attrs.name )
							delete element.name;
						else if ( dojo.isWebKit && attrs.href && attrs.href.match( /file:\/\/\/[\S]+#/i ) )
							attrs.href = attrs.href.replace( /file:\/\/\/[^#]+/i,'' );
						
						if( attrs && attrs.href && /^#_Toc/.test(attrs.href))
						//remove toc
							delete element.name;
					},
					'cke:listbullet' : function( element )
					{
						if ( element.getAncestor( /h\d/ ) && !config.pasteFromWordNumberedHeadingToList )
							delete element.name;
					}
				},

				attributeNames :
				[
					// Remove onmouseover and onmouseout events (from MS Word comments effect)
					[ ( /^onmouse(:?out|over)/ ), '' ],
					// Onload on image element.
					[ ( /^onload$/ ), '' ],
					// Remove office and vml attribute from elements.
					[ ( /(?:v|o):\w+/ ), '' ],
					// Remove lang/language attributes.
					[ ( /^lang/ ), '' ]
				],

				attributes :
				{
					'style' : stylesFilter(
					removeStyles ?
					// Provide a white-list of styles that we preserve, those should
					// be the ones that could later be altered with editor tools.
					[
						// Leave list-style-type
						[ ( /^list-style-type$/ ), null ],

						// Preserve margin-left/right which used as default indent style in the editor.
						[ ( /^margin$|^margin-(?!bottom|top)/ ), null, function( value, element, name )
							{
								if ( element.name in { p : 1, div : 1 } )
								{
									var indentStyleName = config.contentsLangDirection == 'ltr' ?
											'margin-left' : 'margin-right';

									// Extract component value from 'margin' shorthand.
									if ( name == 'margin' )
									{
//										value = getStyleComponents( name, value,
//												[ indentStyleName ] )[ indentStyleName ];
									}
									else if ( name != indentStyleName )
										return null;

									if ( value && !emptyMarginRegex.test( value ) )
										return [ indentStyleName, value ];
								}

								return null;
							} ],

						// Preserve clear float style.
						[ ( /^clear$/ ) ],

						[ ( /^border.*|margin.*|vertical-align|float$/ ), null,
							function( value, element )
							{
								if ( element.name == 'img' )
									return value;
							} ],

						[ (/^width|height$/ ), null,
							function( value, element )
							{
								if ( element.name in { table : 1, td : 1, th : 1, img : 1 } )
									return value;
							} ]
					] :
					// Otherwise provide a black-list of styles that we remove.
					[
						[ ( /^mso-/ ) ],
						// Fixing color values.
						[ ( /-color$/ ), null, function( value )
						{
							if( value == 'transparent' )
								return false;
							if( dojo.isFF )
								value = value.replace( /-moz-use-text-color/g, 'transparent' );
							return value.replace( /windowtext/ig, '#000000' );
						} ],
						[(/^border.*$/),null,function(value)
						 {
							return value.replace( /windowtext/ig, '#000000' );
						 } ],
						// Remove empty margin values, e.g. 0.00001pt 0em 0pt
						[ ( /^margin$/ ), emptyMarginRegex ],
						[ (/^width$/ ), null,function( value, element )
						 {
							if( value && value.length>0 && element.name in { td : 1, th : 1 } )
								return ajustWidth(value,element);
							return value;
						 } ],				
						[ 'text-indent', '0cm' ],
						[ ('line-height') ],						
						[ 'page-break-before' ],
						[ 'tab-stops' ],
						[ 'display', 'none' ],
						removeFontStyles ? [ ( /font-?/ ) ] : null
					], removeStyles ),

					// Prefer width styles over 'width' attributes.
					'width' : function( value, element )
					{
						if( element.name in dtd.$tableContent )
							return false;
					},
					// Prefer border styles over table 'border' attributes.
					'border' : function( value, element )
					{
						if( element.name in dtd.$tableContent )
							return false;
					},

					// Only Firefox carry style sheet from MS-Word, which
					// will be applied by us manually. For other browsers
					// the css className is useless.
					'class' : falsyFilter,

					// MS-Word always generate 'background-color' along with 'bgcolor',
					// simply drop the deprecated attributes.
					'bgcolor' : falsyFilter,

					// Deprecate 'valign' attribute in favor of 'vertical-align'.
					'valign' : removeStyles ? falsyFilter : function( value, element )
					{
						element.addStyle( 'vertical-align', value );
						return false;
					}
				},

				// Fore none-IE, some useful data might be buried under these IE-conditional
				// comments where RegExp were the right approach to dig them out where usual approach
				// is transform it into a fake element node which hold the desired data.
				comment :
					!dojo.isIE ?
						function( value, node )
						{
							var imageInfo = value.match( /<img.*?>/ ),
								listInfo = value.match( /^\[if !supportLists\]([\s\S]*?)\[endif\]$/ );

							// Seek for list bullet indicator.
							if ( listInfo )
							{
								// Bullet symbol could be either text or an image.
								var listSymbol = listInfo[ 1 ] || ( imageInfo && 'l.' ),
									listType = listSymbol && listSymbol.match( />(?:[(]?)([^\s]+?)([.)]?)</ );
								return createListBulletMarker( listType, listSymbol );
							}

							// Reveal the <img> element in conditional comments for Firefox.
							if( dojo.isFF && imageInfo )
							{
								var img = writer.filter.htmlParser.fragment.fromHtml( imageInfo[ 0 ] ).children[ 0 ],
									previousComment = node.previous,
									// Try to dig the real image link from vml markup from previous comment text.
									imgSrcInfo = previousComment && previousComment.value.match( /<v:imagedata[^>]*o:href=['"](.*?)['"]/ ),
									imgSrc = imgSrcInfo && imgSrcInfo[ 1 ];

								// Is there a real 'src' url to be used?
								imgSrc && ( img.attributes.src = imgSrc );
								return img;
							}

							return false;
						}
					: falsyFilter
			};
		}
	};
})();
