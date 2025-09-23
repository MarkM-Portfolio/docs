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

    var Listener = declare("writer.core.Listener", null, {
        _broadcasters: null,

        constructor: function() {
            this._broadcasters = [];
        },

        /**
         * Must be override by inherited class. 
         * Listener handler function. 
         * @param event
         */
        notify: function(event) {
            console.error("Not implemented the Listener:notify function.");
        },

        /**
         * If this listener is listening the Broadcaster 
         * @param broadcaster
         */
        isListening: function(broadcaster) {

        },

        /**
         * Start listen the Broadcaster
         * @param broadcaster
         * 
         * @returns Boolean
         */
        startListening: function(broadcaster) {
            if (broadcaster._addListener(this)) {
                this._broadcasters.push(broadcaster);
                return true;
            }

            return false;
        },

        /**
         * End listen the Broadcaster
         * @param broadcaster
         * @returns Boolean
         */
        endListening: function(broadcaster) {
            if (this.isListening(broadcaster)) {
                broadcaster._removeListener(this);
                this._removeBroadcaster(broadcaster);

                return true;
            }

            return false;
        },

        /**
         * Clear all Broadcasters
         */
        endListeningAll: function() {
            for (var i = 0; i < this._broadcasters.length; i++) {
                this._broadcasters[i]._removeListener(this);
            }

            this._broadcasters = [];
        },

        /**
         * Remove the Broadcaster
         * @param broadcaster
         */
        _removeBroadcaster: function(broadcaster) {
            for (var i = 0; i < this._broadcasters.length; i++) {
                if (broadcaster == this._broadcasters[i]) {
                    this._broadcasters.splice(i, 1);
                    return;
                }
            }
        }

    });

    return Listener;
});
