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

dojo.provide("concord.widgets.specialcharDlg");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("dijit.Tooltip");
dojo.requireLocalization("concord.widgets", "specialcharDlg");

dojo.declare("concord.widgets.specialcharDlg", [concord.widgets.concordDialog], {
	
	reset : function()
	{
		if(typeof pe != 'undefined')
		{
			this.editor = pe.scene.getEditor();
		}

		this.dbc_lock = false;
		var nls = dojo.i18n.getLocalization("concord.widgets","concordDialog");
		
		this.cancelLabel = nls.cancelLabel;
		this.oKLabel = nls.oKLabel;
		
		var dlgNls = dojo.i18n.getLocalization("concord.widgets","specialcharDlg");;
		this.concordTitle = dlgNls.title;
			
		this.setDialogID();
		
		this.dialog = dijit.byId(this.dialogId);
		if( this.dialog )
			this._destroy();

		this.dialog = this.createDialog();
		this.selectedNode = null;
		this.postCreate();
	},
	
	createContent: function(contentDiv) {
		var layoutTable = dojo.create( "table", null, contentDiv  );
		dijit.setWaiRole(layoutTable,'presentation');
		var layoutTbody = dojo.create('tbody', null, layoutTable);
		var all = dojo.create('tr', null, layoutTbody);
		var layoutTR0TD0 = dojo.create('td', null, all);
		var layoutTR0TD1 = dojo.create('td', null, all);
		var charContainer = dojo.create('div', null, layoutTR0TD0);
		var previewContainer = dojo.create('div', null, layoutTR0TD1);

		var charTable = dojo.create('table', null, charContainer);
		dijit.setWaiRole(charTable,'presentation');
		dojo.attr( charTable, {
			'id' : 'chartable',
			'style' : 'border: 2px solid; width: 320px; height: 100%; border-collapse: collapse;',
			'align' : 'center',
			'cellspacing' : '2',
			'cellpadding' : '2',
			'border' : '1'
		} );
		
		var i = 0 ;
		while ( i < this.chars.length )
		{
			var charTr = dojo.create('tr', null, charTable);

			for( var j = 0 ; j < this.charColumns ; j++, i++ )
			{
				var charTd = dojo.create('td', null, charTr);
				dojo.attr(charTd, {
					'align': 'center',
					'valign': 'middle'
				});
				if ( this.chars[ i ] )
				{
					dojo.attr( charTd, { 'style' : 'cursor: default' } );
					var span = dojo.create('span', null, charTd);
					dojo.attr( span, {
						'style' : 'outline: none; cursor: inherit; display: block; height: 1.25em; width: 1.25em; padding-bottom: 0.25em; color: #000000; text-align: center;" title="' + this.chars[i].replace( /&/g, '&amp;' ) + '"',
						'onclick' : dojo.hitch(this, 'onClick'),
						'onkeydown' : dojo.hitch(this, 'onKeydown')
					} );
					span.innerHTML = this.chars[i];
				}
				else
					charTd.innerHTML = '&nbsp;';
			}
		}
		
		var charPreview = dojo.create( "div", null, previewContainer );
		var htmlPreview = dojo.create( "div", null, previewContainer );
		dojo.attr( charPreview, {
			'id' : 'charPreview',
			'style' : 'border:2px solid rgb(152,200,248);background-color:#ffffff;font-size:28px;height:40px;width:70px;padding-top:9px;margin:10px;font-family:\'Microsoft Sans Serif\',Arial,Helvetica,Verdana;text-align:center;'
		} );
		dojo.attr( htmlPreview, {
			'id' : 'htmlPreview',
			'style' : 'border:2px solid rgb(152,200,248);background-color:#ffffff;font-size:14px;height:20px;width:70px;padding-top:2px;margin:10px;font-family:\'Microsoft Sans Serif\',Arial,Helvetica,Verdana;text-align:center;'
		} );
		charPreview.innerHTML = '&nbsp;';
		htmlPreview.innerHTML = '&nbsp;';
		this.setWarningMsg("");
	},

	postCreate : function()
	{
		var firstNode = dojo.byId('chartable');
		if( firstNode ) {
//			firstNode = firstNode.getFirst().getFirst().getFirst();
			firstNode = firstNode.firstChild.firstChild.firstChild;
			this.selectItem(firstNode);
		}
	},
	
	setDialogID: function()
	{
		this.dialogId = "info";
	},
	
	onOk : function()
	{
		if( this.selectedNode && typeof pe != 'undefined' )
		{
//			var editor = pe.scene.getEditor();
//			var origRange = editor.origRange;
//			if(MSGUTIL.isSelectedRangeNotAvailable(origRange,true))
//			{
//				//Remove me,temp fix for pseudo
//				var nls = dojo.i18n.getLocalization('concord.widgets','toolbar');
//				var warningMessage = nls.targetRemovedWhenDialogOpen;
//				pe.scene.showWarningMessage(warningMessage,2000);
//				return;
//			}
//			this.selectedNode.removeClass( "BlueBackground" );
			dojo.removeClass(this.selectedNode, "BlueBackground");
			// TODO insert to editor
//			editor.insertHtml( this.selectedNode.getHtml() );
			var text = this.selectedNode.textContent || this.selectedNode.innerText;
			this.editor.getShell().insertText(text);
		}
		this.hide();
	},

	onClick : function( evt )
	{
		evt.target && this.selectItem( evt.target ); 
	},

	selectItem : function( target )
	{
		var value =  target.innerHTML;
		if ( value )
		{
			// Trigger blur manually if there is focused node.
			this.unselectPreItem();

			var htmlPreview = dojo.byId('htmlPreview');
			htmlPreview.innerHTML = value;
			var charPreview = dojo.byId('charPreview');
			charPreview.innerHTML = value;
			
			dojo.addClass(target.parentNode, "BlueBackground");
			dojo.attr(target, 'tabIndex', '0');
			target.focus();
			
//			target.getParent().addClass( "BlueBackground" ); // add this class to cell instead of string target
//			target.setAttribute( 'tabindex', '0' );
//			target.focus();

			// Memorize focused node.
			this.selectedNode = target;
			pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(value);
		}
	},

	unselectPreItem : function()
	{
		if( this.selectedNode )
		{
			var value =  this.selectedNode.innerHTML;
			if ( value )
			{
				var htmlPreview = dojo.byId('htmlPreview');
				htmlPreview.innerHTML = '&nbsp;';
				var charPreview = dojo.byId('charPreview');
				charPreview.innerHTML = '&nbsp;';
				dojo.removeClass(this.selectedNode.parentNode, "BlueBackground");
				dojo.removeAttr (this.selectedNode, 'tabIndex');
//				this.selectedNode.getParent().removeClass( "BlueBackground" ); // remove background from the cell
//				this.selectedNode.removeAttribute( 'tabindex' );
			}
		}
	},

	onKeydown : function( ev )
	{
		// Get an Anchor element.
		var element = ev.target || ev.srcElement;;
		var relative, nodeToMove;
		var td = element.parentNode;
		var keystroke = ev.keyCode;

		switch ( keystroke )
		{
			// RIGHT-ARROW
			case 39 :
				// relative is TD
				relative = td.nextSibling;
				if( !relative && td.parentNode.nextSibling )
					relative = td.parentNode.nextSibling.firstChild;
				if ( relative )
				{
					nodeToMove = relative.firstChild;
					if ( nodeToMove.nodeType == 1 )
					{
						this.selectItem( nodeToMove );
						nodeToMove.focus();
					}
				}
				ev.preventDefault();
				break;
			// LEFT-ARROW
			case 37 :
				// relative is TD
				relative = td.previousSibling;
				if( !relative && td.parentNode.previousSibling )
					relative = td.parentNode.previousSibling.lastChild;
				if ( relative )
				{
					nodeToMove = relative.firstChild;
					this.selectItem( nodeToMove );
					nodeToMove.focus();
				}
				ev.preventDefault();
				break;
			// UP-ARROW
			case 38 :
				// relative is TR
				if ( ( relative = element.parentNode.parentNode.previousSibling ) )
				{
					var index = 0;
					var current = element.parentNode;
					while ( current && ( current = current.previousSibling ) )
						index++;
					
					nodeToMove = relative.childNodes[index];
					nodeToMove = nodeToMove.childNodes[0];
					this.selectItem( nodeToMove );
					nodeToMove.focus();
				}
				ev.preventDefault();
				break;
			// DOWN-ARROW
			case 40 :
				// relative is TR
				if ( ( relative = element.parentNode.parentNode.nextSibling ) )
				{
					var index = 0;
					var current = element.parentNode;
					while ( current && ( current = current.previousSibling ) )
						index++;
					
					nodeToMove = relative.childNodes[index];
					nodeToMove = nodeToMove.childNodes[0];
					if ( nodeToMove && nodeToMove.nodeType == 1 )
					{
						this.selectItem( nodeToMove );
						nodeToMove.focus();
					}
				}
				ev.preventDefault();
				break;
			default :
				// Do not stop not handled events.
				return;
		}
	},

	charColumns : 17,
	
	chars :
		[
			'!','&quot;','#','$','%','&amp;',"'",'(',')','*','+','-','.','/',
			'0','1','2','3','4','5','6','7','8','9',':',';',
			'&lt;','=','&gt;','?','@',
			'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O',
			'P','Q','R','S','T','U','V','W','X','Y','Z',
			'[',']','^','_','`',
			'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p',
			'q','r','s','t','u','v','w','x','y','z',
			'{','|','}','~','&euro;','&lsquo;','&rsquo;','&rsquo;','&ldquo;',
			'&rdquo;','&ndash;','&mdash;','&iexcl;','&cent;','&pound;',
			'&curren;','&yen;','&brvbar;','&sect;','&uml;','&copy;','&ordf;',
			'&laquo;','&not;','&reg;','&macr;','&deg;','&plusmn;','&sup2;',
			'&sup3;','&acute;','&micro;','&para;','&middot;','&cedil;',
			'&sup1;','&ordm;','&raquo;','&frac14;','&frac12;','&frac34;',
			'&iquest;','&Agrave;','&Aacute;','&Acirc;','&Atilde;','&Auml;',
			'&Aring;','&AElig;','&Ccedil;','&Egrave;','&Eacute;','&Ecirc;',
			'&Euml;','&Igrave;','&Iacute;','&Icirc;','&Iuml;','&ETH;',
			'&Ntilde;','&Ograve;','&Oacute;','&Ocirc;','&Otilde;','&Ouml;',
			'&times;','&Oslash;','&Ugrave;','&Uacute;','&Ucirc;','&Uuml;',
			'&Yacute;','&THORN;','&szlig;','&agrave;','&aacute;','&acirc;',
			'&atilde;','&auml;','&aring;','&aelig;','&ccedil;','&egrave;',
			'&eacute;','&ecirc;','&euml;','&igrave;','&iacute;','&icirc;',
			'&iuml;','&eth;','&ntilde;','&ograve;','&oacute;','&ocirc;',
			'&otilde;','&ouml;','&divide;','&oslash;','&ugrave;','&uacute;',
			'&ucirc;','&uuml;','&uuml;','&yacute;','&thorn;','&yuml;',
			'&OElig;','&oelig;','&#372;','&#374','&#373','&#375;',
			// Greek Letters
			'&Alpha;','&Beta;','&Gamma;','&Delta;','&Epsilon;','&Zeta;','&Eta;',
			'&Theta;','&Iota;','&Kappa;','&Lambda;','&Mu;','&Nu;','&Xi;','&Omicron;',
			'&Pi;','&Rho;','&Sigma;','&Tau;','&Upsilon;','&Phi;','&Chi;','&Psi;','&Omega;',
			'&alpha;','&beta;','&gamma;','&delta;','&epsilon;','&zeta;','&eta;','&theta;',
			'&iota;','&kappa;','&lambda;','&mu;','&nu;','&xi;','&omicron;','&pi;','&rho;',
			'&sigmaf;','&sigma;','&tau;','&upsilon;','&phi;','&chi;','&psi;','&omega;','&thetasym;',
			'&upsih;','&piv;',
			// symbols
			'&sbquo;','&#8219;','&bdquo;','&hellip;','&trade;','&#9658;','&bull;',
			'&rarr;','&rArr;','&hArr;','&diams;','&asymp;','&#8362'
		]
});