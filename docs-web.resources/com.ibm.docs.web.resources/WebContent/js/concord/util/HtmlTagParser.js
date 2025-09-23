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

dojo.provide("concord.util.HtmlTagParser");
dojo.require("concord.util.HtmlTag");

dojo.declare("concord.util.HtmlTagParser", null, {
	html: null,
	pos: 0,
	length: 0,
	
	constructor: function(html) {
		this.html = html;
		this.length = html.length;
	},
	
	next: function() {
		if (this.outOfBound(this.pos))
		{
			return null;
		}

		this.toTagStart();
		if (this.outOfBound())
		{
			return null;
		}
		// skip '<' if possible
		this.openTag();

		var tag = new concord.util.HtmlTag();
		// tag name
		var tagName = this.findTagName();
		tag.setTagName(tagName);
		if (this.outOfBound())
		{
			return tag;
		}

		if (this.reachTagEnd())
		{
			// end with found
			this.closeTag();
			return tag;
		}

		// attribute pairs
		var pair = null;
		while ((pair = this.findAttribute()) != null)
		{
			tag.addAttribute(pair[0], pair[1]);
		}

		// skip '>' if possible
		this.closeTag();
		return tag;

	},
	
	moveTo: function(i) {
		this.pos = i;
	},
	
	outOfBound: function(i) {
		if (i == undefined)
			i = this.pos;
		return (i<0 || i>=this.length);
	},
	
	skipSpace: function() {
		while (!this.outOfBound() && this.html.charAt(this.pos) == ' ')
		{
			this.pos++;
		}
	},
	
	reachTagEnd: function()
	{
		// tag closed, or another tag started
		return (this.html.charAt(this.pos) == '>' || this.html.charAt(this.pos) == '<');
	},

	openTag: function()
	{
		if (this.html.charAt(this.pos) == '<')
		{
			this.pos++;
		}
	},

	closeTag: function()
	{
		if (this.outOfBound())
			return;
		if (this.html.charAt(this.pos) == '>')
		{
			this.pos++;
		}
	},

	toTagStart: function()
	{
		while ((this.pos < this.length) && (this.html.charAt(this.pos) != '<'))
		{
			this.pos++;
		}
	},
	
	findTagName: function()
	{
		this.skipSpace();
		if (this.outOfBound())
		{
			return "";
		}

		var c = this.html.charAt(this.pos);
		if (c == '/')
		{
			this.pos++;
			if (this.outOfBound())
				return "";
		}

		var i = this.pos;
		var found = false;
		do {
			c = this.html.charAt(i);
			switch (c)
			{
				case ' ':
				case '>':
				case '<':
				case '/':
				{
					found = true;
					break;
				}
				default:
				{
					i++;
					break;
				}
			}
		} while (!found && !this.outOfBound(i));

		var name = this.html.substring(this.pos, i); 
		this.moveTo(i);
		return name;
	},
	
	findAttribute: function()
	{
		this.skipSpace();

		// <p attr=''  |attr2= ...
		if (this.outOfBound() || this.reachTagEnd())
		{
			return null;
		}

		var pair = new Array(2);
		pair[0] = this.findAttrName();
		pair[1] = null;

		this.skipSpace();
		if (this.outOfBound())
		{
			// end without close
			// <p attr |
			return pair;
		}

		if (this.reachTagEnd())
		{
			// <p attr |>
			// <p attr |<
			return pair;
		}

		var c = this.html.charAt(this.pos);

		if (c != '=')
		{
			// attribute without value
			// <p attr |attr2=...
			return pair;
		}

		// now attribute value follows
		this.pos++; // skip '='
		this.skipSpace();

		if (this.outOfBound())
		{
			// end without close
			// <p attr = |
			return pair;
		}

		if (this.reachTagEnd())
		{
			// <p attr = |>
			// <p attr = |<
			return pair;
		}

		pair[1] = this.findAttrValue();
		return pair;
	},

	findAttrName: function()
	{
		this.skipSpace();

		if (this.outOfBound() || this.reachTagEnd())
		{
			return null;
		}

		var i = this.pos;
		var c = this.html.charAt(i);
		if (c == '/')
		{
			// <p|/>
			// <p a=b |/...
			this.pos++;
		}

		var found = false;  
		do {
			c = this.html.charAt(i);
			switch (c)
			{
				case ' ':
				case '=':
				case '>':
				case '<':
				{
					found = true;
					break;
				}
				default:
				{
					i++;
					break;
				}
			}
		} while (!found && !this.outOfBound(i));

		if (this.pos == i)
			return null;
		var name = this.html.substring(this.pos, i);
		this.moveTo(i);
		return name;
	},

	findAttrValue: function()
	{
		this.skipSpace();

		if (this.outOfBound() || this.reachTagEnd())
		{
			return null;
		}

		var c = this.html.charAt(this.pos);
		var flag = 0; // no quote mark char
		if (c == '\'')
		{
			flag = 1;
			this.pos++;
		}
		else if (c == '"')
		{
			flag = 2;
			this.pos++;
		}

		if (this.outOfBound())
		{
			// <p a='|
			// <p a="|
			return null;
		}

		var v = "";
		var i = this.pos;
		do {
			c = this.html.charAt(i);
			switch (c)
			{
				case ' ':
				case '>':
				case '<':
				{
					if (flag == 0)
					{
						// attribute value without quote mark
						// <p attr=value| ...
						// <p attr=value|>...
						// <p attr=value|<...
						v = this.html.substring(this.pos, i);
						this.moveTo(i);
						return v;
					}
					break;
				}
				case '"':
				{
					var prev = this.html.charAt(i-1);
					if (flag == 2 && prev != '\\')
					{
						// <p a="abc|"
						v = this.html.substring(this.pos, i);
						this.moveTo(i+1);
						return v;            
					}
	
					// <p a=ab|"c ...
					// <p a="a\|"bc"
					break;
				}
				case '\'':
				{
					var prev = this.html.charAt(i-1);
					if (flag == 1 && prev != '\\')
					{
						// <p a='abc|'
						v = this.html.substring(this.pos, i);
						this.moveTo(i+1);
						return v;            
					}
	
					// <p a=ab|'c ...
					// <p a='a\|'bc'
					break;
				}
			} // switch

			i++;
		} while(!this.outOfBound(i));

		// reach end
		v = this.html.substring(this.pos, i);
		this.moveTo(i);
		return v;
	}
});