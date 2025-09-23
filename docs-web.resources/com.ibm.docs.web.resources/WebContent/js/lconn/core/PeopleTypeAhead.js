/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright IBM Corp. 2008, 2013                                    */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

/*

author: Ryan Silva

*/

dojo.provide("lconn.core.PeopleTypeAhead");

dojo.require("lconn.core.TypeAhead");
dojo.require("lconn.core.Res");
dojo.require("concord.util.BidiUtils");
dojo.require("dijit.form.ComboBox");
dojo.require('dijit.Tooltip');

dojo.declare(
    "lconn.core.PeopleTypeAhead",
    [lconn.core.TypeAhead,lconn.core.Res],
    {
       isGroup: false,
       isPersonAndGroup: false,
       isCommunity: false,
       size: "",
       pageSize: 15,
       multipleValues: false,
       NoResultsMessage: '',
       HeaderMessage: '',
       showHintText: true,
       disableSearchDirectory: false,
       autoSelectChars: [","],
       focused: false, //mark if the input dom has the focus
       templateString: null,
       templatePath: dojo.moduleUrl("lconn.core", "templates/ComboBox.html"),
       disableBizCard: false,
       isBidi: false,

       postMixInProperties: function() {
          this.loadDefaultBundle();
          this.searchDirectory = this.resBundle.rs_searchDirectory;
          if(this.isGroup) {
             this.searchDirectory = this.resBundle.rs_searchGroupDirectory;
          } else if(this.isCommunity) {
             this.searchDirectory = this.resBundle.rs_searchCommunityDirectory;
          } else if(this.isPersonAndGroup) {
             this.searchDirectory = this.resBundle.rs_searchPersonAndGroupDirectory;
          }

          if (this.showHintText){
             this.hintText = this.resBundle.rs_shadowText_searchDirectory;

             if(this.isGroup) {
                //hintText is defined in "lconn.core.TypeAhead"
                this.hintText = this.resBundle.rs_shadowText_searchGroupDirectory;
             } else if(this.isCommunity) {
                //hintText is defined in "lconn.core.TypeAhead"
                this.hintText = this.resBundle.rs_shadowText_searchCommunityDirectory;
             } else if(this.isPersonAndGroup) {
                //hintText is defined in "lconn.core.TypeAhead"
                this.hintText = this.resBundle.rs_shadowText_searchPersonAndGroupDirectory;
             }
          } else {
             this.hintText = null;
          }
          
          this.inherited(arguments);
          this.baseClass = "lotusText";
        },

        postCreate: function(){
           this.isBidi = BidiUtils.isBidiOn();
           this.inherited(arguments);

           // RTC#69640 - add aria-describedby to name type ahead fields
           var ariaDescribedByText = this.resBundle.rs_shadowText_searchDirectory;
           if(this.isGroup) {
              ariaDescribedByText = this.resBundle.rs_shadowText_searchGroupDirectory;
           } else if(this.isCommunity) {
              ariaDescribedByText = this.resBundle.rs_shadowText_searchCommunityDirectory;
           } else if(this.isPersonAndGroup) {
              ariaDescribedByText = this.resBundle.rs_shadowText_searchPersonAndGroupDirectory;
           }
           
           var node = dojo.place('<div id="'+this.id+'_ariaDescribedBy'+'" style="display:none;">'+ariaDescribedByText+'</div>', this.domNode, "after");
           dojo.attr(this.domNode, "aria-describedby", this.id+'_ariaDescribedBy');
        }, 

        //Convenience function to return the item or null if there isn't one.
        getItem: function() {
           return ( this.item ? this.item : null );
        },
        
        formatItem: function(item, html) {
           var str = "";
            
           if (typeof item == "string")
              return html ? this._htmlify(item) : item;
           if (!item || !item.name)
              return str;
            
           //If there's a comma in the name and there aren't already quotes around the name, then we'll surround the name in quotes
           if(item.name.indexOf(',') != -1 && item.name.length > 1 && item.name[0] != '"' && item.name[item.name.length-1] != '"') {
              if (html) {
                 // RTC 49860 Business Owner doesn't show up with quotes added.
                 if(item.businessOwner){
                    str += '&quot;' + this._htmlify(item.name) + '&quot;' + ": " + this._htmlify(item.businessOwner);
                 }else{
                    str += '&quot;' + this._htmlify(item.name) + '&quot;';
                 }
              }
              else {
                 str += '"' + item.name + '"';
              }
           } else {
              if ( html ) {
                 // SPR DJOS8FGSTL Added business owner to append to name if necessary
                 if(item.businessOwner){
                    str+= this._htmlify(item.name +": "+ item.businessOwner);
                 }else{
                    str += this._htmlify(this.isBidi ? BidiUtils.addEmbeddingUCC(item.name) : item.name );
                 }
              }
              else {
                 str += (this.isBidi ? BidiUtils.addEmbeddingUCC(item.name) : item.name);
              }
           }
           
           // FIXME: why is the email field called 'member'?
           if ( item.member ){
              if (html) {
                 str += ' &lt;' + this._htmlify(item.member) + '&gt;&lrm;';
              } else {
                 str += ' <' + item.member + '>\u200E';
              }
           }
           
           return str;
        },
            
        _htmlify: function(str) {
            return str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
        },
        
        //Most of this function is verbatim from base except for a few modifications where noted
        _onKeyDown: function(/*Event*/ evt){
           // summary:
           //    Handles keyboard events
           var key = evt.charOrCode;
           // except for cutting/pasting case - ctrl + x/v
           if(evt.altKey || ((evt.ctrlKey || evt.metaKey) && (key != 'x' && key != 'v')) || key == dojo.keys.SHIFT){
              return; // throw out weird key combinations and spurious events
           }
           var doSearch = false;
           var searchFunction = "_startSearchFromInput";
           var pw = this._popupWidget;
           var dk = dojo.keys;
           var highlighted = null;
           this._prev_key_backspace = false;
           this._abortQuery();
           if(this._opened){
              pw.handleKey(evt);
              highlighted = pw.getHighlightedOption();
              this._popupWidget._focusOptionNode(highlighted);
           }
           switch(key){
              case dk.PAGE_DOWN:
              case dk.DOWN_ARROW:          
              case dk.PAGE_UP:
              case dk.UP_ARROW:
                 if(!this._opened){
                    this._arrowPressed();
                    doSearch = true;
                    searchFunction = "_startSearchAll";
                 }
                 dojo.stopEvent(evt);
                 break;

              case dk.ENTER:
                 if(highlighted){
                    // only stop event on prev/next
                    if(highlighted == pw.nextButton){
                       this._nextSearch(1);
                       dojo.stopEvent(evt);
                       break;
                    }else if(highlighted == pw.previousButton){
                       this._nextSearch(-1);
                       dojo.stopEvent(evt);
                       break;
                    }else if(highlighted == pw.searchButton) {
                       pw.searchDirectory();
                       dojo.stopEvent(evt);
                       return;
                    } else if ( highlighted.item && parseInt(highlighted.item.type) < 0 ) {
                       dojo.stopEvent(evt);
                       break;
                    }
                    pw.attr('value', { target: highlighted });
                 }else{
                    // Update 'value' (ex: KY) according to currently displayed text
                    this._setBlurValue(); // set value if needed
                    this._setCaretPos(this.focusNode, this.focusNode.value.length); // move cursor to end and cancel highlighting
                    
                    // If nothing is selected or the popup isn't open, allow the form to be submitted
                    if (this.submitFormOnNonSelectingEnter) {
                       if (this.searchTimer) {
                          //clearTimeout(this.searchTimer);
                          //this.searchTimer = null;
                          this.searchTimer.remove();
                       }
                       this._lastQuery = null;
                       
                       break;
                    }
                 }
                 // default case:
                 if (this._opened) {
                    this._lastQuery = null; // in case results come back later
                    this._hideResultList();
                 }
                 // lconn.core: conditionally submit
                 if (!this.submitFormOnKey)
                    evt.preventDefault();
                 // fall through
                 break;
              case dk.TAB:
            	  var newvalue = this.attr('displayedValue');
                  // if the user had More Choices selected fall into the
                  // _onBlur handler
                  if(pw && (
                     newvalue == pw._messages["previousMessage"] ||
                     newvalue == pw._messages["nextMessage"])
                  ){
                     break;
                  }
                  if(highlighted){
                     //in 1.4 pw.attr will call this._selectOption();
                     // lconn.core: we need this for keyboard accessibility
                     pw.attr('value', { target: highlighted });
                  }
                  if(this._opened){
                     this._lastQuery = null; // in case results come back later
                     this._hideResultList();
                  }
                 break;
              case ' ':
                 if(highlighted){
                    dojo.stopEvent(evt);
                    this._selectOption();
                    this._hideResultList();
                 }else{
                    doSearch = true;
                 }
                 break;

              case dk.ESCAPE:
                 if(this._opened){
                    dojo.stopEvent(evt);
                    this._hideResultList();
                    
                    if(this._currentInput){
                        //lconn.core - restore the original typed value when user escapes from the dropdown
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
                  dijit.setWaiState(this.focusNode,"activedescendant", this.focusNode.id);
              	  this.focusNode.focus();
                 // Non char keys (F1-F12 etc..)  shouldn't open list.
                 // Ascii characters and IME input (Chinese, Japanese etc.) should.
                 // On IE and safari, IME input produces keycode == 229, and we simulate
                 // it on firefox by attaching to compositionend event (see compositionend method)
                 doSearch = typeof key == 'string' || key == 229;
           }
           if(doSearch){
              // need to wait a tad before start search so that the event
              // bubbles through DOM and we have value visible
              this.item = undefined; // undefined means item needs to be set
              //this.searchTimer = setTimeout(dojo.hitch(this, searchFunction),1);
              this.searchTimer = this.defer(dojo.hitch(this, searchFunction),1);
           }
        },
      
      _onFocus: function(/*Event*/ evt) {
         this.inherited(arguments);
         this.focused = true;
      },
      
      _onBlur: function(/*Event*/ evt){
         this.focused = false;
         
         //if focus is on bizcard, not close people typeahead menu
         var pw = this._popupWidget;
         if (!(pw && pw.tooltipFocused)) {
            this.inherited(arguments);
         }
         
         // RTC: 87198 - Have to remove this style when typeahead loses focus otherwise it interferes with other popups
         if(dojo.isIE && this.dropdownNode){
            dojo.removeClass(this.dropdownNode, "lconnTypeAhead");
         }
         this.updateHintText();
      },
        
      _startSearch: function(/*String*/ key, opt) {
    	  opt = opt || {};
         
         if (opt.searchImmediately) {
            opt.searchBoth = true;
         }

         var popupId = this.id + "_popup";
         if(!this._popupWidget){
            this._popupWidget = this.dropDown = new lconn.core.PeopleTypeAheadMenu({
               _strings: this._strings,
               rs_searchDirectory: this.searchDirectory,
               NoResultsMessage: this.NoResultsMessage,
               HeaderMessage: this.HeaderMessage,
               disableSearchDirectory: this.disableSearchDirectory,
               onChange: dojo.hitch(this, this._selectOption),
               id:popupId,
               inputWidget: this,
               disableBizCard: this.disableBizCard
            });
            
            // waiRole, waiState
            var role = this.textbox.getAttribute("wairole");
            if(role){
               dijit.setWaiRole(this.textbox, role);
            } 
            dijit.setWaiState(this._popupWidget.domNode, "live", "polite"); 
            dijit.removeWaiState(this.focusNode,"activedescendant");
            dijit.setWaiState(this.textbox,"owns", popupId); // associate popup with textbox
         } else {
             dijit.setWaiState(this.focusNode,"activedescendant", popupId);
         }
         
         // create a new query to prevent accidentally querying for a hidden
         // value from FilteringSelect's keyField
         this.item = null; // #4872
         var query = dojo.clone(this.query); // #5970
         this._lastQuery = query = key;
         // #5970: set _lastQuery, *then* start the timeout
         // otherwise, if the user types and the last query returns before the timeout,
         // _lastQuery won't be set and their input gets rewritten
         //this.searchTimer=setTimeout(dojo.hitch(this, function(query, _this){
         this.searchTimer=this.defer(dojo.hitch(this, function(query, _this){
            var dataObject=this.store.fetch({
               queryOptions: dojo.mixin({
                  ignoreCase:this.ignoreCase,
                  deep:true
               }, opt),
               query: query,
               onComplete:dojo.hitch(this, "_openResultList"),
               onError: function(errText){
                  console.error('dijit.form.ComboBox: ' + errText);
                  dojo.hitch(_this, "_hideResultList")();
               },
               start:0,
               count:this.pageSize
            });
            
            var nextSearch = function(dataObject, direction){
               dataObject.start += dataObject.count*direction;
               // #4091:
               //      tell callback the direction of the paging so the screen
               //      reader knows which menu option to shout
               dataObject.direction = direction;
               this.store.fetch(dataObject);
            }
            this._nextSearch = this._popupWidget.onPage = dojo.hitch(this, nextSearch, dataObject);
            this._popupWidget.searchDirectory=dojo.hitch(this, dojo.hitch(this, function() {
               //this._startSearch(key, {searchDirectory:true});
               dataObject.queryOptions.searchDirectory=true;
               this.store.fetch(dataObject);
            }));
            
         }, query, this), opt.searchImmediately ? 1 : this.searchDelay);
      },
      
      _openResultList: function(/*Object*/ results, /*Object*/ dataObject){
         if( this.disabled || 
               this.readOnly || 
               (dataObject.query != this._lastQuery)
         ){
            return;
         }
         this._popupWidget.clearResultList();
         
         if (results.length) {
            // Fill in the textbox with the first item from the drop down list,
            // and highlight the characters that were auto-completed. For
            // example, if user typed "CA" and the drop down list appeared, the
            // textbox would be changed to "California" and "ifornia" would be
            // highlighted.
            
            var zerothvalue = new String(this.formatItem(results[0]));
            if (zerothvalue && this.autoComplete && !this._prev_key_backspace &&
                  (dataObject.query != "")) {
               // when the user clicks the arrow button to show the full list,
               // startSearch looks for "*".
               // it does not make sense to autocomplete
               // if they are just previewing the options available.
               this._autoCompleteText(zerothvalue);
            }
         }
         dataObject._maxOptions = this._maxOptions;
         this._popupWidget.createOptions(
               results,
               dataObject,
               dojo.hitch(this, "_getMenuLabelFromItem")
         );

         this.results = results;
         
         // RTC 88769 - State of global sharebox esc key handler is not set properly
         // This is happening because the form.ComboBox always calls a hideResultsList
         // in the showResultsList function, but this is unnecessary and causes
         // issues with our publish open/close methods. Here we remove the hideResultList
         // functionality before calling the show method, then restore it afterwards.
         
         var hideFunction = dijit.form.ComboBox.prototype._hideResultList;
         dijit.form.ComboBox.prototype._hideResultList = function() { /* do nothing */ };

         // show our list (only if we have content, else nothing)
         this._showResultList();

         dijit.form.ComboBox.prototype._hideResultList = hideFunction;

         // In IE, body will get focus if set node visibility into hidden,
         // so that focusNode will lose focus causing its onBlur never hit,
         // then the pop-up widget will never close. Reset focus here.
         if (dojo.isIE && (this.focusNode != document.activeElement) && !this.focusNode.preventFocus)
            this.focusNode.focus();

         // #4091:
         //      tell the screen reader that the paging callback finished by
         //      shouting the next choice
         if(dataObject.direction){
            if(1 == dataObject.direction){
               this._popupWidget.highlightFirstOption();
            }else if(-1 == dataObject.direction){
               this._popupWidget.highlightLastOption();
            }
         }
      }
   }
);

dojo.declare(
      "lconn.core.PeopleTypeAheadMenu",
      [dijit.form._ComboBoxMenu,lconn.core.Res],

      {
          rs_searchDirectory: ' ',
          NoResultsMessage: '',
          HeaderMessage: '',
          templateString: "<ul waiRole='listbox' class='dijitReset dijitMenu' dojoAttachPoint='containerNode' dojoAttachEvent='onmousedown:_onMouseDown,onmouseup:_onMouseUp,onmouseover:_onMouseOver,onmouseout:_onMouseOut' tabIndex='-1' style='overflow:\"auto\";'>"
              +"<li class='dijitMenuItem dijitMenuPreviousButton' dojoAttachPoint='previousButton' role='option'></li>"
              +"<li class='dijitMenuItem headerNode' dojoAttachPoint='headerNode' role='option'></li>"
              +"<li class='dijitMenuItem resultsNode'  style='overflow: hidden;' dojoAttachPoint='resultsNode' role='option'></li>"
              +"<li class='dijitMenuItem searchDirectory ${searchDirectoryClass}' dojoAttachPoint='searchButton' role='option'>${rs_searchDirectory}</li>"
              +"<li class='dijitMenuItem dijitMenuNextButton' dojoAttachPoint='nextButton' role='option'></li>"
                  +"</ul>",
          _messages: null,
          searchDirectoryClass: "",
          disableSearchDirectory: false,
          disableBizCard: false,
          
          inputWidget: null,
          tooltipFocused: false,      //mark if the focus is on bizcard
          tooltipAroundNode: null,    //Node that the tooltip is centered around
          tooltipTimeout: null,       //Return value of setTimeout()
          tooltipDelay: 600,          //Time to delay before showing tooltip
          tooltipId: 0,               //Counter used for the tooltips to make sure only the latest one gets drawn
          
          popupClosed: true,          //A flag for the tooltip.  We set to false in _focusOptionNode (when an option
                                      //  is highlighted).  If the menu is closed, set to true.  This way, a tooltip
                                      //  won't show itself if the menu has been closed.
                                      //This flag is not a test for whether the type ahead menu is open.
          
          postMixInProperties: function() {
             this.loadDefaultBundle();
             this.inherited("postMixInProperties",arguments);
             if (this.disableSearchDirectory)
                this.searchDirectoryClass = "lotusHidden";
             if (!this.NoResultsMessage)
                this.NoResultsMessage = this.resBundle.rs_noResults || "";
          },

          postCreate:function(){
        	  // RTC 89423 Using "More" and "Previous" strings from the resource bundle as we have nothing else.
             dojo.attr(this.previousButton, "aria-label", this.resBundle.rs_navPrevLabel);
             dojo.attr(this.searchButton, "aria-label", this.rs_searchDirectory);
             dojo.attr(this.nextButton, "aria-label", this.resBundle.rs_more);

             this.searchButton.selectHandler = dojo.hitch(this, function(evt) {
                 dojo.stopEvent(evt);
                 this.searchDirectory();
                 return true; // Return true to skip the rest of the default behavior
             });
              
             this.resultsNode.selectHandler = dojo.hitch(this, function(evt) {
                 dojo.stopEvent(evt);
                 return true; // Return true to skip the rest of the default behavior
             });

             this.inherited("postCreate", arguments);
          },
          
          searchDirectory: function() {},
          
          setValue: function(/*Object*/ value){
             // INSERT: removed conditional check for " && parseInt(value.target.item.type) >= 0" from IF
             if ( value.target.item ) {
                this.value = value;
                this.onChange(value);
             }
          },
          
          _onMouseUp:function(/*Event*/ evt){
             if(evt.target==this.searchButton)
                this.searchDirectory();
             else if(evt.target!=this.resultsNode)
                this.inherited("_onMouseUp", arguments);
                //this.inherited("_onMouseUp", arguments);
          },
          
          _onMouseOver:function(/*Event*/ evt){
              if(evt.target === this.domNode){ return; }
              var tgt=evt.target;
              if(!(tgt==this.previousButton||tgt==this.nextButton||tgt==this.searchButton||tgt==this.resultsNode)){
                 // while the clicked node is inside the div
                 while(tgt && !tgt.getAttribute('item')){
                     // recurse to the top
                    tgt=tgt.parentNode;
                 }
              }
              this._focusOptionNode(tgt);
          },
          
          // lconn.core: use dijitMenuItemHover
          _focusOptionNode: function(/*DomNode*/ node){
             // summary:
             //    Does the actual highlight.
             if(this._highlighted_option != node){
                this._blurOptionNode();
                this._highlighted_option = node;
                dojo.removeClass(this._highlighted_option, "dijitMenuItemSelected");
                dojo.addClass(this._highlighted_option, "dijitMenuItemHover");
                //Show biz card tooltip
                var userid = dojo.attr(node, "exid");
                //check type, making sure we don't put bizcard on a group
                var type = dojo.attr(node, "persontype");
                
                //Close any open tooltips
                this.closeTooltip();
                
                //This will make sure that we'll only actually display a tooltip if it's the current one.
                //  If you focus on a person in the drop-down, and then focus on "Search Directory", tooltipId
                //  will increment when you highlight "Search Directory".  Since tooltips get shown via a callback
                //  called after a round trip to the profiles server, it's possible there is a tooltip for a person
                //  that hasn't yet been displayed when the user is highlighting the "Search Directory" menu item.
                //  The end result would be that the last highlighted person would have a tooltip while the user is 
                //  moused over "Search Directory".  By associating an id with each tooltip callback, only the latest
                //  tooltip will be displayed.
                this.tooltipId++;
                this.popupClosed = false;
                
                if (userid && (type==0) && !this.disableBizCard) {
                   this.renderBizCard(userid, node); 
                } else {
                   this.inputWidget._announceOption(node);
                   if (BidiUtils.isBidiOn()){
                	   var assigneeBox = dijit.byId('C_d_AssignASectionDialogassignee');
                	   if (assigneeBox){
                		   dojo.style( assigneeBox.focusNode, "direction", "ltr");
                	   }
                   }
                   
                }
             }
          },
          
          renderBizCard: function(userId, node) {
             if (dojo.exists("lconn.profiles.bizCard.bizCard.renderMiniBizCard") ) {
                this.tooltipTimeout = setTimeout(
                      dojo.hitch(
                            lconn.profiles.bizCard.bizCard,
                            "renderMiniBizCard",
                            userId,
                            dojo.hitch(this, "showTooltip", this.tooltipId, node)
                      ),
                      this.tooltipDelay
                );
             } else {
             	this.inputWidget._announceOption(node);
             }
          },
          
          // lconn.core: use dijitMenuItemHover
          _blurOptionNode:function(){
             // summary:
             // removes highlight on highlighted option
             if(this._highlighted_option){
                dojo.removeClass(this._highlighted_option, "dijitMenuItemHover");
                this._highlighted_option = null;
             }
          },
          
          _createOption:function(/*Object*/ item, labelFunc){
              var menuitem = this.inherited("_createOption", arguments);
              
              if ( item.userid )
                  dojo.attr(menuitem, "exid", item.userid);
              
              if ( item.type )
                  dojo.attr(menuitem, "persontype", item.type);
                  
              dojo.attr(menuitem, "aria-labelledby", "bc_document_node");
              
              return menuitem;
          },
          
          //We only override this function so that we can make it insert options before searchButton
          //  instead of before nextButton, and also to conditionally display the search button
          createOptions: function(results, dataObject, labelFunc){
              dojo.publish("lconn/core/typeahead/open");
              // Clear existing result nodes
              this.clearResultList();
              
              this.items = results;
              
              //this._dataObject=dataObject;
              //this._dataObject.onComplete=dojo.hitch(comboBox, comboBox._openResultList);
              // display "Previous . . ." button
              this.previousButton.style.display = (!dataObject.start || dataObject.start == 0) ? "none" : "";
              dojo.attr(this.previousButton, "id", this.id + "_prev");

              if(this.HeaderMessage) {
                 var el = this.headerNode;
                 while (el.firstChild) el.removeChild(el.firstChild);
                 el.appendChild(document.createTextNode(this.HeaderMessage));
                 el.item = this.HeaderMessage;
                 this.domNode.insertBefore(el, this.nextButton);
              }

              // create options using _createOption function defined by parent
              // ComboBox (or FilteringSelect) class
              // #2309:
              //      iterate over cache nondestructively
              dojo.forEach(results, function(item, i){
                  if (dataObject.count && i >= dataObject.count)
                      return;
   
                  var menuitem = this._createOption(item, labelFunc);
                  menuitem.className = "dijitMenuItem";
                  menuitem.setAttribute("item", i);   // index to this.items; use indirection to avoid mem leak
                  dojo.attr(menuitem, "id", this.id + i);
                  dojo.style(menuitem, "overflow", "hidden");
                  // Removed aria-label for defect 69657, aria-describedby read 
                  // only if no other aria-label attribute exists.
                  //dojo.attr(menuitem, "aria-label", item.name);
                  this.domNode.insertBefore(menuitem, this.nextButton);
              }, this);

              // display "Next . . ." button
              this.nextButton.style.display = (dataObject.count && dataObject.count < results.length) ? "" : "none";
              dojo.attr(this.nextButton,"id", this.id + "_next");

              // INSERT: Added a message node to display when there are no results
              var el = this.resultsNode;
              if (results.length == 0 && this.NoResultsMessage) {
                 var noResultsMsg = dojo.string.substitute(this.NoResultsMessage, [dataObject.query]);
                 while (el.firstChild) el.removeChild(el.firstChild);
                 el.appendChild(document.createTextNode(noResultsMsg));
                 el.item = noResultsMsg;
                 this.domNode.insertBefore(el, this.nextButton);
              }
              //give an ID for a11y
              dojo.attr(this.resultsNode, "id", this.id + "_resultsNode");
              
              // INSERT: Add a search directory button if we haven't already searched
              if (!dataObject.queryOptions.searchDirectory && dataObject.searchType != "directory") {
                 this.domNode.insertBefore(this.searchButton, this.nextButton);
              }
              //give an ID for a11y
              dojo.attr(this.searchButton, "id", this.id + "_searchDir");
          },

          //Override this function just to delete everything between the first and last items
          clearResultList:function(){
             // keep the previous and next buttons of course
             // INSERT: Added a message node to display when there are no results
             var first = this.previousButton;
             var last = this.nextButton;
             while (first.nextSibling && first.nextSibling != last)
                this.domNode.removeChild(first.nextSibling);
          },
          
          //Override this function just to change 2 to 3 since we added an extra node into the menu
          getListLength:function(){
             // INSERT: Added a message node to display when there are no results
             return this.domNode.childNodes.length - 2 - (this.searchButton.parentNode ? 1 : 0) - (this.resultsNode.parentNode ? 1 : 0) - (this.headerNode.parentNode ? 1 : 0);
          },
          
          showTooltip: function(id,node,html){
              //Make sure that this is the tooltip we're supposed to show.
              //This prevents a tooltip from showing if we've already requested a new one
              if ( id == this.tooltipId && !this.popupClosed) {
                  this.tooltipAroundNode = node;
                  dijit.showTooltip(html, node, ['after', 'before']);
                  
                  // Remove the wairole/role "alert" from tooltip, bizcard should not interrupt what is already being spoken.
                  dijit._masterTT.containerNode.removeAttribute("wairole");
                  dijit._masterTT.containerNode.removeAttribute("role");
                  
                  this.inputWidget._announceOption(node);
              dojo.publish("com/ibm/social/incontext/typeahead/onMiniBizCardDisplay", [html]);
              
              //put focus on the link in bizcard
              var a = dojo.query("a", "cardBody")[0];
              if (a) {
                 //this.tooltipFocused = true;
                 //a.focus();
                 
                 //if focus leave bizcard and is NOT on people typeahead input, close people typeahead menu
                 this.connect(a, "onblur", dojo.hitch(this, function(){
                    this.tooltipFocused = false;
                    var iw = this.inputWidget;
                    setTimeout(function(){
                       if (!(iw && iw.focused)) {
                          iw._hideResultList();
                       }
                    }, 100);
                 }));
                 
                 dojo.connect(a, "onkeypress", dojo.hitch(this, function(evt){
                    var key = evt.charOrCode;
                    var dk = dojo.keys;
                    var iw = this.inputWidget;
                    switch(key){
                       //if press ESC key, close bizcard, move focus to people typeahead input
                       case dk.ESCAPE:
                          this.closeTooltip();
                             if(iw && iw.domNode){
                                iw.domNode.focus();
                          }
                          break;
                       case dk.TAB:
                           if(iw && iw.domNode){
                              iw.domNode.focus();
                          }
                          dojo.stopEvent(evt);
                          break;
                    }
                 })
                 );
              }
              }
          },
          
          closeTooltip: function() {
             
             if ( this.tooltipAroundNode ) {
                dijit.hideTooltip(this.tooltipAroundNode);
                this.tooltipAroundNode = null;
             }
             if ( this.tooltipTimeout ){
                clearTimeout(this.tooltipTimeout);
                this.tooltipTimeout = null;
             }
          },
          
          onClose:function(){
             dojo.publish("lconn/core/typeahead/close");
             this.popupClosed = true;
             this.closeTooltip();
             this._blurOptionNode();
          }
      }
  );

