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
    "dojo/_base/declare"
], function(declare) {

    var Broadcaster = declare("writer.core.Broadcaster", null, {
        _listeners: null, // The array of listeners

        constructor: function() {
            this._listeners = [];
        },

        /**
         * Send notify to all listeners
         */
        broadcast: function(event) {
            for (var i = 0; i < this._listeners.length; i++) {
                this._listeners[i].notify(event);
            }
        },

        /**
         * Clear all listeners from this broadcaster.
         */
        clean: function() {
            for (var i = 0; i < this._listeners.length; i++) {
                this._listeners[i]._removeBroadcaster(this);
            }

            this._listeners = [];
        },

        /**
         * This is internal function which should be called from Listener.
         * Add the listener to this broadcaster.
         * 
         * @param listener, Listener
         */
        _addListener: function(mpListener) {
            // Assert the listener is not a Listener object. 
            if (!mpListener)
                return false;

            //if(dojo.exists(listener, 'notify'))
            // AMD FIXME BOB
            if ("writer.core.Listener" == mpListener.declaredClass)
                this._listeners.push(mpListener);
            else
                return false;

            return true;
        },

        /**
         * This is internal function which should be called from Listener
         * Remove the listener from the broadcaster.
         * 
         * @param listener
         */
        _removeListener: function(listener) {
            for (var i = 0; i < this._listeners.length; i++) {
                if (listener == this._listeners[i]) {
                    this._listeners.splice(i, 1);
                    return;
                }
            }

            // Assert the listener was not existed in this broadcaster. 
        }

    });

    return Broadcaster;
});
