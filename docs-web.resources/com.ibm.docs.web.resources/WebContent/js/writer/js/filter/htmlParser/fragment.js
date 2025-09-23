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
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has",
    "writer/filter/dtd",
    "writer/filter/HtmlParser",
    "writer/filter/htmlParser/text",
    "writer/filter/tools",
    "writer/filter/constants",
    "writer/filter/htmlParser/JsonWriter",
    "writer/filter/htmlParser/fragmentClz"
], function(declare, lang, has, dtd, HtmlParser, textModule, tools, constants, JsonWriter, fragmentClz) {

    // Block-level elements whose internal structure should be respected during
    // parser fixing.
    var nonBreakingBlocks = tools.extend({
        table: 1,
        ul: 1,
        ol: 1,
        dl: 1
    }, dtd.table, dtd.ul, dtd.ol, dtd.dl);

    // IE < 8 don't output the close tag on definition list items. (#6975)
    var optionalCloseTags = has("ie") && has("ie") < 8 ? {
        dd: 1,
        dt: 1
    } : {};

    var listBlocks = {
        ol: 1,
        ul: 1
    };

    // Dtd of the fragment element, basically it accept anything except for
    // intermediate structure, e.g. orphan <li>.
    var rootDtd = tools.extend({}, {
        html: 1
    }, dtd.html, dtd.body, dtd.head, {
        style: 1,
        script: 1
    });

    function isRemoveEmpty(node) {
        // Empty link is to be removed when empty but not anchor. (#7894)
        return node.name == 'a' && node.attributes.href || dtd.$removeEmpty[node.name];
    }

    function isTabSpan(node) {
        //chrome
        return node.attributes["class"] && node.attributes["class"].toLowerCase() == "apple-tab-span";
    }

    var fragment = {};

    /**
     * Creates a {@link writer.filter.htmlParser.fragment} from an HTML string.
     * 
     * @param {String}
     *            fragmentHtml The HTML to be parsed, filling the fragment.
     * @param {Number}
     *            [fixForBody=false] Wrap body with specified element if needed.
     * @param {writer.filter.htmlParser.element}
     *            contextNode Parse the html as the content of this element.
     * @returns writer.filter.htmlParser.fragment The fragment created.
     * @example var fragment = writer.filter.htmlParser.fragment.fromHtml( '<b>Sample</b>
     *          Text' ); alert( fragment.children[0].name ); "b" alert(
     *          fragment.children[1].value ); " Text"
     */
    fragment.fromHtml = function(fragmentHtml, fixForBody, contextNode) {
        var parser = new HtmlParser(),
            ff = contextNode || new fragmentClz(),
            pendingInline = [],
            pendingBRs = [],
            currentNode = ff,
            // Indicate we're inside a <textarea> element, spaces should be
            // touched differently.
            inTextarea = false,
            // Indicate we're inside a <pre> element, spaces should be touched
            // differently.
            inPre = false,

            // Indicate it's inside a tab span, spaces should be converted to tab stop.
            inTabSpan = false;

        function checkPending(newTagName) {
            var pendingBRsSent;

            if (pendingInline.length > 0) {
                for (var i = 0; i < pendingInline.length; i++) {
                    var pendingElement = pendingInline[i],
                        pendingName = pendingElement.name,
                        pendingDtd = dtd[pendingName],
                        currentDtd = currentNode.name && dtd[currentNode.name];

                    if ((!currentDtd || currentDtd[pendingName] || ((currentNode.name == "ul" || currentNode.name == "ol") && !pendingElement._.isBlockLike)) && (!newTagName || !pendingDtd || pendingDtd[newTagName] || !dtd[newTagName])) {
                        if (!pendingBRsSent) {
                            sendPendingBRs();
                            pendingBRsSent = 1;
                        }

                        // Get a clone for the pending element.
                        pendingElement = pendingElement.clone();

                        // Add it to the current node and make it the current,
                        // so the new element will be added inside of it.
                        pendingElement.parent = currentNode;
                        currentNode = pendingElement;

                        // Remove the pending element (back the index by one
                        // to properly process the next entry).
                        pendingInline.splice(i, 1);
                        i--;
                    } else {
                        // Some element of the same type cannot be nested, flat
                        // them,
                        // e.g. <a href="#">foo<a href="#">bar</a></a>. (#7894)
                        if (pendingName == currentNode.name)
                            addElement(currentNode, currentNode.parent, 1), i--;
                    }
                }
            }
        }

        function sendPendingBRs() {
            while (pendingBRs.length)
                currentNode.add(pendingBRs.shift());
        }
        /*
         * Beside of simply append specified element to target, this function
         * also takes care of other dirty lifts like forcing block in body,
         * trimming spaces at the block boundaries etc.
         * 
         * @param {Element} element The element to be added as the last child of
         * {@link target}. @param {Element} target The parent element to
         * relieve the new node. @param {Boolean} [moveCurrent=false] Don't
         * change the "currentNode" global unless there's a return point node
         * specified on the element, otherwise move current onto {@link target}
         * node.
         */
        function addElement(element, target, moveCurrent) {
            // Ignore any element that has already been added.
            if (element.previous !== undefined) {
                moveCurrent && (currentNode = target);
                return;
            }

            target = target || currentNode || fragment;

            // Current element might be mangled by fix body below,
            // save it for restore later.
            var savedCurrent = currentNode;

            // If the target is the fragment and this inline element can't go
            // inside
            // body (if fixForBody).
            if (fixForBody && (!target.type || target.name == 'body')) {
                var elementName, realElementName;
                if (element.attributes && (realElementName = element.attributes['data-cke-real-element-type']))
                    elementName = realElementName;
                else
                    elementName = element.name;

                if (elementName && !(elementName in dtd.$body || elementName == 'body' || element.isOrphan)) {
                    // Create a <p> in the fragment.
                    currentNode = target;
                    parser.onTagOpen(fixForBody, {});

                    // The new target now is the <p>.
                    element.returnPoint = target = currentNode;
                }
            }

            // Rtrim empty spaces on block end boundary. (#3585)
            if (element._.isBlockLike && element.name != 'pre' && element.name != 'textarea') {

                var length = element.children.length,
                    lastChild = element.children[length - 1],
                    text;
                if (lastChild && lastChild.type == constants.NODE_TEXT) {
                    if (!(text = tools.rtrim(lastChild.value)))
                        element.children.length = length - 1;
                    else
                        lastChild.value = text;
                }
            }

            target.add(element);

            if (element.returnPoint) {
                currentNode = element.returnPoint;
                delete element.returnPoint;
            } else
                currentNode = moveCurrent ? target : savedCurrent;
        }

        parser.onTagOpen = function(tagName, attributes, selfClosing,
            optionalClose) {

            var createElementByTag = HtmlParser.createElementByTag;
            var element = createElementByTag(tagName, attributes);
            // "isEmpty" will be always "false" for unknown elements, so we
            // must force it if the parser has identified it as a selfClosing
            // tag.
            if (element.isUnknown && selfClosing)
                element.isEmpty = true;

            // Check for optional closed elements, including browser quirks and
            // manually opened blocks.
            element.isOptionalClose = tagName in optionalCloseTags || optionalClose;

            // This is a tag to be removed if empty, so do not add it
            // immediately.
            if (isTabSpan(element))
                inTabSpan = true;
            else if (isRemoveEmpty(element)) {
                pendingInline.push(element);
                return;
            } else if (tagName == 'pre')
                inPre = true;
            else if (tagName == 'br' && inPre) {
                currentNode.add(new textModule('\n'));
                return;
            } else if (tagName == 'textarea')
                inTextarea = true;

            if (tagName == 'br') {
                pendingBRs.push(element);
                return;
            }

            while (1) {
                var currentName = currentNode.name;

                var currentDtd = currentName ? (dtd[currentName] || (currentNode._.isBlockLike ? dtd.div : dtd.span)) : rootDtd;

                // If the element cannot be child of the current element.
                if (!element.isUnknown && !currentNode.isUnknown && !currentDtd[tagName]) {
                    // Current node doesn't have a close tag, time for a close
                    // as this element isn't fit in. (#7497)
                    if (currentNode.isOptionalClose)
                        parser.onTagClose(currentName);
                    // Fixing malformed nested lists by moving it into a
                    // previous list item. (#3828)
                    else if (tagName in listBlocks && currentName in listBlocks) {
                        var children = currentNode.children,
                            lastChild = children[children.length - 1];

                        // Establish the list item if it's not existed.
                        if (!(lastChild && lastChild.name == 'li'))
                            addElement(
                                (lastChild = createElementByTag(
                                    'li')), currentNode);

                        !element.returnPoint && (element.returnPoint = currentNode);
                        currentNode = lastChild;
                    }
                    // Establish new list root for orphan list items.
                    else if (tagName in dtd.$listItem && currentName != tagName)
                        parser.onTagOpen(tagName == 'li' ? 'ul' : 'dl', {}, 0,
                            1);
                    // We're inside a structural block like table and list, AND
                    // the incoming element
                    // is not of the same type (e.g. <td>td1<td>td2</td>), we
                    // simply add this new one before it,
                    // and most importantly, return back to here once this
                    // element is added,
                    // e.g.
                    // <table><tr><td>td1</td><p>p1</p><td>td2</td></tr></table>
                    else if (currentName in nonBreakingBlocks && currentName != tagName) {
                        !element.returnPoint && (element.returnPoint = currentNode);
                        currentNode = currentNode.parent;
                    } else {
                        // The current element is an inline element, which
                        // need to be continued even after the close, so put
                        // it in the pending list.
                        if (currentName in dtd.$inline)
                            pendingInline.unshift(currentNode);

                        // The most common case where we just need to close the
                        // current one and append the new one to the parent.
                        if (currentNode.parent)
                            addElement(currentNode, currentNode.parent, 1);
                        // We've tried our best to fix the embarrassment here,
                        // while
                        // this element still doesn't find it's parent, mark it
                        // as
                        // orphan and show our tolerance to it.
                        else {
                            element.isOrphan = 1;
                            break;
                        }
                    }
                } else
                    break;
            }

            checkPending(tagName);
            sendPendingBRs();

            element.parent = currentNode;

            if (element.isEmpty)
                addElement(element);
            else
                currentNode = element;
        };

        parser.onTagClose = function(tagName) {
            // Check if there is any pending tag to be closed.
            for (var i = pendingInline.length - 1; i >= 0; i--) {
                // If found, just remove it from the list.
                if (tagName == pendingInline[i].name) {
                    pendingInline.splice(i, 1);
                    return;
                }
            }

            var pendingAdd = [],
                newPendingInline = [],
                candidate = currentNode;

            while (candidate != fragment && candidate && candidate.name != tagName) {
                // If this is an inline element, add it to the pending list, if
                // we're
                // really closing one of the parents element later, they will
                // continue
                // after it.
                if (!candidate._.isBlockLike)
                    newPendingInline.unshift(candidate);

                // This node should be added to it's parent at this point. But,
                // it should happen only if the closing tag is really closing
                // one of the nodes. So, for now, we just cache it.
                pendingAdd.push(candidate);

                // Make sure return point is properly restored.
                candidate = candidate.returnPoint || candidate.parent;
            }

            if (candidate && candidate != fragment) {
                // Add all elements that have been found in the above loop.
                for (i = 0; i < pendingAdd.length; i++) {
                    var node = pendingAdd[i];
                    addElement(node, node.parent);
                }

                currentNode = candidate;

                if (currentNode.name == 'pre')
                    inPre = false;

                if (currentNode.name == 'textarea')
                    inTextarea = false;

                if (isTabSpan(currentNode))
                    inTabSpan = false;

                if (candidate._.isBlockLike)
                    sendPendingBRs();

                addElement(candidate, candidate.parent);

                // The parent should start receiving new nodes now, except if
                // addElement changed the currentNode.
                if (candidate == currentNode)
                    currentNode = currentNode.parent;

                pendingInline = pendingInline.concat(newPendingInline);
            }

            if (tagName == 'body')
                fixForBody = false;
        };

        parser.onText = function(text) {
            // Trim empty spaces at beginning of text contents except <pre> and
            // <textarea>.
            if ((!currentNode._.hasInlineStarted || pendingBRs.length) && !inPre && !inTextarea) {
                text = tools.ltrim(text);

                if (text.length === 0)
                    return;
            }

            sendPendingBRs();
            checkPending();

            if (fixForBody && (!currentNode.type || currentNode.name == 'body') && tools.trim(text)) {
                this.onTagOpen(fixForBody, {}, 0, 1);
            }

            // Shrinking consequential spaces into one single for all elements
            // text contents.
            if (!inPre && !inTextarea && !inTabSpan)
                text = text.replace(/[\t\r\n ]{2,}|[\t\r\n]/g, ' ');

            currentNode.add(new textModule(text));
        };

        parser.onCDATA = function(cdata) {};

        parser.onComment = function(comment) {};

        // Parse it.
        parser.parse(fragmentHtml);

        // Send all pending BRs except one, which we consider a unwanted bogus.
        // (#5293)
        sendPendingBRs(!(has("ie") || has("trident")) && 1);

        // Close all pending nodes, make sure return point is properly restored.
        while (currentNode != ff)
            addElement(currentNode, currentNode.parent, 1);

        return ff;
    };

    return fragment;
});
