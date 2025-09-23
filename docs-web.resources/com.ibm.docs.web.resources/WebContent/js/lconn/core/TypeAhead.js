/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright IBM Corp. 2008, 2014                                    */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

/*
 author: Ryan Silva
 Documentation: https://w3.webahead.ibm.com/w3ki/display/conndev/Dojo+TypeAhead+Widget

 */

dojo.provide("lconn.core.TypeAhead");

dojo.require("dijit.form.ComboBox");
dojo.require("lconn.core.util.text");
dojo.require("concord.util.BidiUtils");

dojo.declare("lconn.core.TypeAhead", [dijit.form.ComboBox], {
   size: "",
   templateString: null,
   templatePath: dojo.moduleUrl("lconn.core", "templates/ComboBox.html"),

   // Convenience function to return the item or null if there isn't one.
   getItem: function() {
      return (this.item ? this.item : null);
   },

   // lconn.core
   formatItem: function(item, html) {
      if (!html) {
         return item;
      } else {
         return item = item.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
      }
   },

   // lconn.core: shorthand form for html formatting
   formatItemHtml: function(item) {
      return this.formatItem(item, true);
   },

   // minChars: number
   // The number of characters that need to be typed before doing a search
   minChars: 1,

   // maxChars: number
   // The number of characters allowed per word. Default = -1 (no max)
   maxChars: -1,

   // multipleValues: bool
   // Sets whether or not this type-ahead should support multiple values.
   // If true, then typing a token (usually comma) will cause the type-ahead
   // to reset and begin searching for a new name.
   multipleValues: true,

   // token: string
   // The character to split all the names by in the text box.
   // Only used if multipleValues is true.
   token: '',

   hintText: null,

   autoComplete: false,

   submitFormOnKey: false,

   submitFormOnNonSelectingEnter: false,

   searchDelay: 300,

   // Addition to undo http://bugs.dojotoolkit.org/ticket/6220
   postCreate: function() {

      // connect the publish hide function to the hideResult function
      dojo.connect(this, "_showResultList", this._fixPosition);

      // Undo setting fontFamily, since we don't have an drop-down arrow to worry about
      var fontFamily = this.focusNode.style.fontFamily || "";

      // Certain LotusLive apps use dojo 1.5 which requires that "this.downArrowNode" be set
      if (!this.downArrowNode) {
         this.downArrowNode = this.domNode.parentNode.appendChild(dojo.create("div", {
            style: {
               display: "none"
            }
         }));
      }

      // associate dummy popup with textbox to avoid PRT violation
      this.dummyPopupNode = this.domNode.parentNode.appendChild(dojo.create("div", {
         id: this.id + "_dummypopup",
         style: {
            display: "none"
         }
      }));
      dojo.attr(this.dummyPopupNode, "role", "textbox");
      dijit.setWaiState(this.domNode, "owns", this.dummyPopupNode.id);

      this.inherited(arguments);
      this.focusNode.style.fontFamily = fontFamily;
      this.updateHintText();
      this.focusNode.style.direction = BidiUtils.isGuiRtl() ? 'rtl' : 'ltr'; 
   },

   _onFocus: function( /* Event */ evt) {
      this.updateHintText(null, true);
      this.inherited(arguments);
      if (dojo.isIE) {
         // SPR #SYEE882LWY - workaround for another wacky IE focus issue
         // Texbox got focus when it was clicked on, but IE was not sending any keydown events
         // focus the textbox with JS, which makes it start working
         window.setTimeout("dijit.focus(dojo.byId('" + this.textbox.id + "'))", 0);
      }
   },

   _trimKeys: function() {
      // if maxChars is set, make sure no words in the typeahead exceed it.
      if (this.maxChars > 0) {
         var fn = this.focusNode;
         var inputKeys = ((this.multipleValues) ? fn.value.split(this.token) : [fn.value]);
         var changed = false;
         // truncate to the maximum chars
         for (var i = 0; i < inputKeys.length; i++) {
            // need to check the actual byte length to make sure we don't exceed the storage
            if (lconn.core.util.text.getByteLength(inputKeys[i]) > this.maxChars) {
               var oldKey = inputKeys[i];
               inputKeys[i] = lconn.core.util.text.trimToByteLength(inputKeys[i], this.maxChars);
               changed = true;
               // TODO - better logging?
               if (window.console) console.log("lconn.core.TypeAhead key too long. Trimming '" + oldKey + "' to '" + inputKeys[i] + "'.");
            }
         }

         if (changed) {
            fn.value = inputKeys.join((this.multipleValues) ? this.token : "");
         }

      }
   },

   _onBlur: function( /* Event */ evt) {

      this._trimKeys();

      this.inherited(arguments);

      // RTC: 87198 - Have to remove this style when typeahead loses focus otherwise it interferes with other popups
      if (dojo.isIE && this.dropdownNode) {
         dojo.removeClass(this.dropdownNode, "lconnTypeAhead");
      }
      this.updateHintText();
   },

   // Wrapper around hasAttribute DOM API unsupported by IE
   _hasAttr: function(domNode, attr) {
      return dojo.isIE ? domNode.getAttribute(attr) !== null : domNode.hasAttribute(attr);
   },

   setValue: function() {
      this.inherited(arguments);
      this.updateHintText(arguments[0], false);
   },

   updateHintText: function(hint, focus) {
      var focusNode = this.focusNode;
      if (hint) focusNode.title = this.hintText = hint;

      if (this.hintText) {
         if (!this._focused && (focusNode.value == "" || !focusNode.hasInput)) {
            focusNode.hasInput = false;
            focusNode.style.color = "#666";
            focusNode.value = this.hintText || "";
         } else if (!focusNode.hasInput) {
            focusNode.hasInput = true;
            focusNode.style.color = "#000";

            if (focusNode.value != "") {
               focusNode.value = "";

               // Make sure the input keeps focus when clicking in the field in FF
               if (focus && dojo.isFF) {
                  setTimeout(function() {
                     dijit.focus(focusNode);
                  }, 1);
               }
            }

            // Make sure the cursor is visible when tabbing into the main search box
            if (focus && dojo.isIE) try {
               dijit.selectInputText(focusNode, 0, 0);
            } catch (e) {}
         }
      }
   },

   // If maxChars is defined, then we need to restrict EACH individual tag to this length.
   // Which means we need to determine the size of the current tag we're typing, not just
   // the overall length of the field. So we'll need to inspect the keypress event and
   // check the input and make sure it's allows so that no individual tag will exceed this
   // maximum.
   _checkKeyLength: function( /* Event */ evt) {

      try {
         // maxChars is defined, let's inspect the key and data...
         if (this.maxChars > 0) {
            var this_ = this;

            // loop through the list of special keys and allow them regardless
            var isKeyAlwaysAllowed_ = function(event) {
                  var k = event.charOrCode;
                  var tk = this_.token;

                  // if the key is the token, allow it.
                  if (this_.multipleValues && tk.length == 1 && tk == k) {
                     return true;
                  }

                  // dojo.keys has a list of special key definitions. We'll use them
                  // to determine whether to allow the keypress to proceed.
                  var dk = dojo.keys;
                  for (dkname in dk) {
                     if (dk[dkname]) {
                        if (dkname !== "SPACE" && dkname.indexOf("NUMPAD_") == -1 && k == dk[dkname]) {
                           return true;
                        }
                     }
                  }

                  return false;
               };

            // get the current word where the caret position is at in the input field.
            var getCurrentWord_ = function() {
                  var fn = this_.focusNode;
                  var tk = this_.token;

                  var cpos = this_._getCaretPos(this_.focusNode); // current cursor position
                  var cword = this_.getTextBoxValue(); // current overall text box value
                  if (this_.multipleValues && tk.length > 0) { // if multivalue, find the individual tag.
                     cword = tk + cword + tk;
                     cword = cword.substring(0, cword.indexOf(tk, cpos + tk.length));
                     cword = cword.substring(cword.lastIndexOf(tk) + tk.length);
                  }

                  return cword;
               };

            // check for the special characters and length of the current word.
            if (isKeyAlwaysAllowed_(evt) || lconn.core.util.text.getByteLength(getCurrentWord_()) < this.maxChars) {
               return true;
            }

            // if we got here, then the key pressed isn't a special key or token AND the length is too long
            if (evt.preventDefault) {
               evt.preventDefault();
            } else {
               evt.returnValue = false; // ie
            }
            return false;

         }
      } catch (e) {}

      // catch-all
      return true;

   },

   // Enforcing text direction
   _onKeyUp: function( /* Event */ evt) {
	   //TODO BidiUtils
   },

   // Most of this function is verbatim from base except for a few modifications where noted
   _onKeyPress: function( /* Event */ evt) {
      if (!this._checkKeyLength(evt)) return; // first check to make sure we're under maxchars for this word
      // summary:
      // Handles keyboard events
      var key = evt.charOrCode;
      // except for cutting/pasting case - ctrl + x/v
      if (evt.altKey || ((evt.ctrlKey || evt.metaKey) && (key != 'x' && key != 'v')) || key == dojo.keys.SHIFT) {
         return; // throw out weird key combinations and spurious events
      }
      var doSearch = false;
      var searchFunction = "_startSearchFromInput";
      var pw = this._popupWidget;
      var dk = dojo.keys;
      var highlighted = null;
      this._prev_key_backspace = false;
      this._abortQuery();
      if (this._opened) {
         pw.handleKey(key);
         highlighted = pw.getHighlightedOption();
      }
      switch (key) {
      case dk.PAGE_DOWN:
      case dk.DOWN_ARROW:
      case dk.PAGE_UP:
      case dk.UP_ARROW:
         if (!this._opened) {
            this._arrowPressed();
            doSearch = true;
            searchFunction = "_startSearchAll";
         } else {
            this._announceOption(highlighted);
         }
         dojo.stopEvent(evt);
         break;

      case dk.ENTER:
         // prevent submitting form if user presses enter. Also
         // prevent accepting the value if either Next or Previous
         // are selected
         if (highlighted) {
            // only stop event on prev/next
            if (highlighted == pw.nextButton) {
               this._nextSearch(1);
               dojo.stopEvent(evt);
               break;
            } else if (highlighted == pw.previousButton) {
               this._nextSearch(-1);
               dojo.stopEvent(evt);
               break;
            }
         } else {
            // Update 'value' (ex: KY) according to currently displayed text
            this._setBlurValue(); // set value if needed
            this._setCaretPos(this.focusNode, this.focusNode.value.length); // move cursor to end and cancel highlighting
            // If nothing is selected or the popup isn't open, allow the form to be submitted
            if (this.submitFormOnNonSelectingEnter) {
               if (this.searchTimer) {
                  this.searchTimer.remove();
                  this.searchTimer = null;
               }
               this._lastQuery = null;
               if (this._opened) {
                  this._hideResultList();
               }
               this._trimKeys(); // trim any keys before submitting if maxChars is set
               break;
            }
         }
         // default case:
         // lconn.core: conditionally submit
         if (!this.submitFormOnKey) evt.preventDefault();
         // fall through
      case dk.TAB:
         var newvalue = this.attr('displayedValue');
         // if the user had More Choices selected fall into the
         // _onBlur handler
         if (pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])) {
            break;
         }
         if (highlighted) {
            // in 1.4 pw.attr will call this._selectOption()
            // lconn.core: we need this for keyboard accessibility
            pw.attr('value', {
               target: highlighted
            });
         }
         if (this._opened) {
            this._lastQuery = null; // in case results come back later
            this._hideResultList();
         }
         break;

      case dk.ESCAPE:
         if (this._opened) {
            dojo.stopEvent(evt);
            this._hideResultList();
            if (this._currentInput) {
               // lconn.core - restore the original typed value when user escapes from the dropdown
               this.focusNode.value = this._currentInput
               delete this._currentInput;
            }
         }
         break;

      case dk.DELETE:
      case dk.BACKSPACE:
         this._prev_key_backspace = true;
         doSearch = true;
         break;

      default:
         dijit.setWaiState(this.focusNode, "activedescendant", this.focusNode.id);
         this.focusNode.focus();
         // Non char keys (F1-F12 etc..) shouldn't open list.
         // Ascii characters and IME input (Chinese, Japanese etc.) should.
         // On IE and safari, IME input produces keycode == 229, and we simulate
         // it on firefox by attaching to compositionend event (see compositionend method)
         doSearch = typeof key == 'string' || key == 229;
      }
      if (doSearch) {
         // need to wait a tad before start search so that the event
         // bubbles through DOM and we have value visible
         this.item = undefined; // undefined means item needs to be set
         this.searchTimer = this.defer(dojo.hitch(this, searchFunction), 1);
      }
   },

   // lconn.core
   _numTokensPreceding: function(str, pos) {
      // figure out how many tokens (if any) are in the given string, before pos
      var checkStr = str.substring(0, pos);
      // this should use _splitByToken, but the rest of the code is dumb and uses a plain split, so just do that
      var count = checkStr.split(this.token).length - 1;

      return count;
   },

   // a function to split a string by the current token, ignoring repeated tokens
   _splitByToken: function _splitByToken(str) {
      var retval = [str];
      if (this.token && str.indexOf(this.token) != -1) {
         // remove duplicate tokens
         str = str.replace(new RegExp(this.token + "+", "g"), this.token);
         // remove any leading or trailing tokens
         str = str.replace(new RegExp("^" + this.token), "");
         str = str.replace(new RegExp(this.token + "$"), "");
         // split on tokens
         retval = str.split(this.token);
      }
      return retval;
   },

   _autoCompleteText: function( /* String */ text) {
      // summary:
      // Fill in the textbox with the first item from the drop down
      // list, and highlight the characters that were
      // auto-completed. For example, if user typed "CA" and the
      // drop down list appeared, the textbox would be changed to
      // "California" and "ifornia" would be highlighted.
      var fn = this.focusNode;

      var cpos = this._getCaretPos(fn);

      // IE7: clear selection so next highlight works all the time
      dijit.selectInputText(fn, fn.value.length);

      var inputKeys;

      if (this.multipleValues) inputKeys = fn.value.split(this.token);
      else inputKeys = [fn.value];

      // Find which key the caret is currently in by counting the number of tokens preceding cpos
      var count = 0;
      if (this.multipleValues) count = this._numTokensPreceding(fn.value, cpos);

      if (this.multipleValues && this.token != ' ' && count > 0) text = ' ' + text;

      // does text autoComplete the value in the textbox?
      var caseFilter = this.ignoreCase ? 'toLowerCase' : 'substr';

      if (dojo.string.trim(text[caseFilter](0)).indexOf(dojo.string.trim(inputKeys[count][caseFilter](0))) == 0) {

         // only add to input node as we would overwrite Capitalisation of chars
         // actually, that is ok
         if (cpos + 1 > fn.value.length || fn.value.charAt(cpos) == this.token) {
            var end = cpos + text.length - inputKeys[count].length;

            if (text != this.NoResultsMessage && text != this.searchDirectory && text.indexOf("**") == -1) {
               inputKeys[count] = text; // .substr(cpos);
               fn.value = inputKeys.join(this.token);
               // visually highlight the autocompleted characters
               dijit.selectInputText(fn, cpos, end);
            } else {
               fn.value = this._currentInput;
            }
         }

      } else {
         // text does not autoComplete; replace the whole value and highlight
         if (text != this.NoResultsMessage && text != this.searchDirectory && text.indexOf("**") == -1) {
            inputKeys[count] = text;
            fn.value = inputKeys.join(this.token);
            var startPos = 0;
            for (var i = 0; i < count; i++)
            startPos += inputKeys[i].length;

            startPos += this.token.length * count;

            dijit.selectInputText(fn, startPos, startPos + text.length);
         } else {
            fn.value = this._currentInput;
         }
      }
   },

   _openResultList: function( /* Object */ results, /* Object */ dataObject) {
      this._fetchHandle = null;
      if (!this.domNode || // lconn.core: don't reveal results list if node has been destroyed
      this.disabled || this.readOnly || (dataObject.query != this._lastQuery)) {
         return;
      }
      this._popupWidget.clearResultList();
      if (!results.length && (this.hideEmptyResults || dataObject.hideEmptyResults)) {
         this._hideResultList();
         return;
      }

      // Fill in the textbox with the first item from the drop down list,
      // and highlight the characters that were auto-completed. For
      // example, if user typed "CA" and the drop down list appeared, the
      // textbox would be changed to "California" and "ifornia" would be
      // highlighted.
      dataObject._maxOptions = this._maxOptions;
      var nodes = this._popupWidget.createOptions(results, dataObject, dojo.hitch(this, "_getMenuLabelFromItem"));

      this.results = results;

      // show our list (only if we have content, else nothing)
      this._showResultList();

      // #4091:
      // tell the screen reader that the paging callback finished by
      // shouting the next choice
      if (dataObject.direction) {
         if (1 == dataObject.direction) {
            this._popupWidget.highlightFirstOption();
         } else if (-1 == dataObject.direction) {
            this._popupWidget.highlightLastOption();
         }
         this._announceOption(this._popupWidget.getHighlightedOption());
      } else if (this.autoComplete && !this._prev_key_backspace /* && !dataObject.direction */
      // when the user clicks the arrow button to show the full list,
      // startSearch looks for "*".
      // it does not make sense to autocomplete
      // if they are just previewing the options available.
      && !/^[*]+$/.test(dataObject.query[this.searchAttr])) {
         this._announceOption(nodes[1]); // 1st real item
      }
   },

   _showResultList: function() {
      this.inherited(arguments);

      // Override to set activedescendant when the popup shows if it doesn't already have one
      var fn = this.focusNode;
      var pw = this._popupWidget;
      if (this._opened && pw && pw.id && !dijit.getWaiState(fn, "activedescendant")) dijit.setWaiState(fn, "activedescendant", pw.id);

      // RTC: 86479
      // if(pw != null)
      // pw.domNode.style.height = "auto";
      // RTC: 83154 - In IE there is an overflow issue that causes unnecessary horizontal scrollbars on initial render
      if (dojo.isIE) {
         dojo.addClass(pw.domNode.parentNode, "lconnTypeAhead");
         this.dropdownNode = pw.domNode.parentNode;
      }

   },

   _fixPosition: function() {
      var node = this.focusNode;
      if (node) {
         var pos = dojo.position(node, true);
         var posLocal = dojo.position(node);
         var listNode = this._popupWidget.domNode;
         var listPos = dojo.position(listNode, true);
         var listPosLocal = dojo.position(listNode);
         var windowWidth = dijit.getViewport().w;

         if ((listPos.y + 1) < (pos.y + pos.h)) {
            // Position the TA above the text
            if ((posLocal.y - listPosLocal.h) > 0) {
               dojo.style(listNode.parentNode, {
                  top: (pos.y - listPos.h) + "px"
               });
            } else {
               if (!dojo.isIE) {
                  pos.h = pos.h + 5;
               }
               dojo.style(listNode.parentNode, {
                  top: (pos.y + pos.h) + "px"
               });
               // RTC: 86479: Typehead popup should present scrollbars in narrow contexts
               // listNode.style.height = "auto";
            }
         }
         // Reposition if there is no space on the rigth
         if (listPos.x + listNode.parentNode.clientWidth > windowWidth) {
            dojo.style(listNode.parentNode, {
               left: (windowWidth - listNode.parentNode.clientWidth) + "px"
            });
         }
      }
      dojo.publish("com/ibm/social/incontext/typeahead/onDisplayChange", [this._popupWidget]);
   },

   _announceOption: function( /* Node */ node) {
      // summary:
      // a11y code that puts the highlighted option in the textbox.
      // This way screen readers will know what is happening in the
      // menu.
      if (!node) {
         return;
      }

      // Get the cursor position before doing anything else
      var cpos = this._getCaretPos(this.focusNode);

      // pull the text value from the item attached to the DOM node
      var newValue;
      if (node == this._popupWidget.nextButton || node == this._popupWidget.previousButton ||
      // lconn.core: exclude case when user clicks on the search from directory item
      node == this._popupWidget.searchButton) {
         newValue = node.innerHTML;
         this.item = undefined;
         this.value = '';
      } else {
         var item = this.dropDown.items[node.getAttribute("item")];
         // lconn.core: we don't call labelFunc here - surprise, it gets called in dojo 1.4 anyhow!
         newValue = this.formatItem(item);
         // currently this method causes the selected value to be written to the textbox.
         // for a multiplevalue typeahead, this wipes out what the user previously typed
         // Don't set the 'item' attribute if multiple values are allowed
         // Doing so resets the input's value, and breaks autocomplete of multiple values
         if (!this.multipleValues) this.attr('item', item, false, newValue);
      }

      // lconn.core: get the text that the user manually entered (cut off autocompleted text)
      if (this.multipleValues) {
         // IE workaround: fall back to original position if we can't get the current position
         cpos = cpos || this.caretPos || this.focusNode.value.length;

         var curValue = this.focusNode.value
         if (this._currentInput) {
            // restore the value the user originally typed
            curValue = this._currentInput;
         }
         var inputKeys = curValue.split(this.token);
         var count = this._numTokensPreceding(curValue, cpos);

         var q = this._lastQuery;

         if (this.multipleValues && this.token != ' ' && count > 0) q = ' ' + q;

         inputKeys[count] = q;

         this.focusNode.value = inputKeys.join(this.token);
      } else this.focusNode.value = this.focusNode.value.substring(0, cpos);

      this._setCaretPos(this.focusNode, cpos);

      // set up ARIA activedescendant
      dijit.setWaiState(this.focusNode, "activedescendant", dojo.attr(node, "id"));
      // autocomplete the rest of the option to announce change
      this._autoCompleteText(newValue);
   },

   // lconn.core: override
   _selectOption: function( /* DomNode */ target) {

      // summary:
      // Menu callback function, called when an item in the menu is selected.
      // lconn.core: bypass update of the input field for some typeahead
      if (!this.noUpdateOnSelect) {
         this._announceOption(target);
      }
      this._hideResultList();
      this._setCaretPos(this.focusNode, this.focusNode.value.length);

      // lconn.core: Need an event that happens after the caret position is adjusted
      this.onSelect(this.dropDown.items[target.getAttribute('item')]);

      this._handleOnChange(this.value, true);
      // Remove aria-activedescendant since the drop down is no loner visible
      // after closeDropDown() but _announceOption() adds it back in
      this.focusNode.removeAttribute("aria-activedescendant");
   },

   // lconn.core: Need an event that happens after the caret position is adjusted
   onSelect: function(item) {},

   // lconn.core
   _doSelect: function(tgt) {
      var newValue = this.formatItem(tgt.item);

      if (this.multipleValues) {
         var oldValue = this.keyArr[this.keyIdx];

         this.keyArr[this.keyIdx] = (this.keyIdx != 0 && this.token != ' ' ? ' ' : '') + newValue;

         newValue = this.keyArr.join(this.token);

         // tokenSpace is token + space if token is not already a space
         var tokenSpace = this.token + (this.token != ' ' ? ' ' : '');

         if (newValue.length >= tokenSpace.length && newValue.substring(newValue.length - tokenSpace.length) != tokenSpace) newValue += tokenSpace;
      } else {
         this.item = tgt.item;
      }

      this.attr('value', newValue);
      this._setCaretPos(this.focusNode, newValue.length);
   },

   _startSearchAll: function() {
      this._startSearch('');
   },

   _startSearchFromInput: function() {
      // We need to split the string by "," and then do a search on the name
      // where the cursor currently resides
      var currentInput = this._currentInput = this.focusNode.value;
      var searchString = currentInput;

      if (this.multipleValues) {
         this.keyArr = currentInput.split(this.token);
         this.caretPos = this._getCaretPos(this.focusNode);
         // The index associated with the name in keyArr which is currently being typed
         // is equal to the number of tokens preceding the cursor.
         this.keyIdx = this._numTokensPreceding(currentInput, this.caretPos);

         searchString = this.keyArr[this.keyIdx];
      }

      // Trim white-space from the beginning and end of searchString
      searchString = dojo.string.trim(searchString);

      // Only search if the searchString is at least minChars long
      if (this.shouldStartSearch(searchString)) this._startSearch(searchString);
      else this._hideResultList();
   },

   _hideResultList: function() {
      // Temporary workaround
      this.closeDropDown();
   },

   shouldStartSearch: function( /* String */ query) {
      var shouldStart;
      if (this.store && this.store.shouldStartSearch) shouldStart = this.store.shouldStartSearch(query);

      /**
       * Ideographic written languages (Japanese Kanji, Chinese) have single characters that represent more information than a Latin (English) character. UTF-8 representation is a fair estimate of complexity, so minChars is treated as "minBytes". encodeURIComponent is the simplest way to convert to UTF-8 in Javascript.
       */
      if (typeof shouldStart == "undefined") {
         var minChars = this.minChars;
         if (query.length >= minChars) return true;

         var length = 0;
         var encoded = encodeURIComponent(query); // converts strings to UTF-8 encoded representations
         for (var i = 0; i < encoded.length; i++) {
            length++;

            if (length >= minChars) break;

            if (encoded.charAt(i) == "%") i += 2;
         }
         shouldStart = length >= minChars;
      }
      return shouldStart;
   },

   _startSearch: function( /* String */ key) {
      var popupId = this.id + "_popup";
      if (!this._popupWidget) {
         this._popupWidget = this.dropDown = new dijit.form._ComboBoxMenu({
            onChange: dojo.hitch(this, this._selectOption),
            id: popupId
         });
         dijit.setWaiRole(this._popupWidget.domNode, "listbox");
         dijit.setWaiState(this._popupWidget.domNode, "live", "polite");
         this._popupWidget.domNode.style.listStyleType = "none";
         dijit.removeWaiState(this.focusNode, "activedescendant");
         dijit.setWaiState(this.textbox, "owns", popupId); // associate popup with textbox
         dojo.addClass(this._popupWidget.domNode, "lconnHighlight");
      } else {
         dijit.setWaiState(this.focusNode, "activedescendant", popupId);
      }
      // create a new query to prevent accidentally querying for a hidden
      // value from FilteringSelect's keyField
      var query = dojo.clone(this.query); // #5970
      this._lastInput = key; // Store exactly what was entered by the user.
      this._lastQuery = query = key;
      // #5970: set _lastQuery, *then* start the timeout
      // otherwise, if the user types and the last query returns before the timeout,
      // _lastQuery won't be set and their input gets rewritten
      this.searchTimer = this.defer(dojo.hitch(this, function(query, _this) {
         this.searchTimer = null;
         var fetch = {
            queryOptions: {
               ignoreCase: this.ignoreCase,
               deep: true
            },
            query: query,
            onComplete: dojo.hitch(this, "_openResultList"),
            onError: function(errText) {
               _this._fetchHandle = null;
               console.error('dijit.form.ComboBox: ' + errText);
               dojo.hitch(_this, "_hideResultList")();
            },
            start: 0,
            count: this.pageSize
         };
         dojo.mixin(fetch, _this.fetchProperties);
         this._fetchHandle = _this.store.fetch(fetch);

         var nextSearch = function(dataObject, direction) {
               dataObject.start += dataObject.count * direction;
               // #4091:
               // tell callback the direction of the paging so the screen
               // reader knows which menu option to shout
               dataObject.direction = direction;
               this._fetchHandle = this.store.fetch(dataObject);
            };
         this._nextSearch = this._popupWidget.onPage = dojo.hitch(this, nextSearch, this._fetchHandle);
      }, query, this), this.searchDelay);
   },

   // lconn.core
   getAttribute: function( /* string */ attr) {
      if (this.item && this.item[attr]) return this.item[attr];
      else return '';
   },

   // lconn.core: get the real value in the text box
   getTextBoxValue: function() {
      return this.focusNode.value;
   },

   _getMenuLabelFromItem: function( /* Item */ item) {
      // lconn.core: we don't use labelFunc
      var label = this.formatItemHtml(item);
      var key = '';

      if (this.multipleValues) key = dojo.string.trim(this.keyArr[this.keyIdx]);
      else key = dojo.string.trim(this.focusNode.value);

      // Escape html chars in key and label
      key = key.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");

      var labelLower = label.toLowerCase();
      var keyLower = key.toLowerCase();

      var startIdx = 0;
      var match = null;

      // Originally changed from Files:
      // Changed algorithm to highlight matches that are not substring (i.e. typing "derek carr"
      // does not highlight the "carr" in "DEREK W. CARR" because of the "W."). Also appending
      // to an array and then calling join is more efficient than string concatenation.
      var keySegments = keyLower.split(/\s/);
      var sbf = [];

      for (var i = 0; i < keySegments.length; i++) {
         var s = keySegments[i];
         var match = labelLower.indexOf(s, startIdx);
         if (match != -1) {
            sbf.push(label.substring(startIdx, match));
            sbf.push("<b>");
            sbf.push(label.substring(match, match + s.length));
            sbf.push("</b>");
            startIdx = match + s.length;
         }
      }
      sbf.push(label.substring(startIdx));
      return {
         html: true,
         label: sbf.join("")
      };
   }
});
