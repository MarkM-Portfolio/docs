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
    "writer/constants",
    "writer/core/Broadcaster",
    "writer/core/Event"
], function(declare, constants, Broadcaster, Event) {

    // Reference from CKeditor command.js
    var Command = declare("writer.core.Command", Broadcaster, {
        _defination: null,
        _editor: null,

        constructor: function(editor, commandDef, name) {
            this._editor = editor;
            this._defination = commandDef;
            this._extend(this, commandDef, {
                state: constants.CMDSTATE.TRISTATE_OFF
            });
            this._name = name;

        },

        _extend: function(target) {
            var argsLength = arguments.length,
                overwrite, propertiesList;

            if (typeof(overwrite = arguments[argsLength - 1]) == 'boolean')
                argsLength--;
            else if (typeof(overwrite = arguments[argsLength - 2]) == 'boolean') {
                propertiesList = arguments[argsLength - 1];
                argsLength -= 2;
            }
            for (var i = 1; i < argsLength; i++) {
                var source = arguments[i];
                for (var propertyName in source) {
                    // Only copy existed fields if in overwrite mode.
                    if (overwrite === true || target[propertyName] == undefined) {
                        // Only copy  specified fields if list is provided.
                        if (!propertiesList || (propertyName in propertiesList))
                            target[propertyName] = source[propertyName];

                    }
                }
            }

            return target;
        },

        /**
         * Return the command name.
         */
        getName: function() {
            return this._name;
        },

        /**
         * Executes the command.
         * @param {Object} [data] Any data to pass to the command. Depends on the
         *      command implementation and requirements.
         * @returns {Boolean} A boolean indicating that the command has been
         *      successfully executed.
         * @example
         * command.<b>exec()</b>;  // The command gets executed.
         */
        execute: function(data) {
            if (this.state == constants.CMDSTATE.TRISTATE_DISABLED)
                return false;

            if (data && data.notFocus)
                delete data.notFocus;
            else
                this._editor.focus();
            // TODO Set focus to editor if needed.

            return (this._defination.exec.call(this, data) !== false);
        },

        /**
         * Enables the command for execution. The command state available before disabling it
         * is restored.
         * @example
         * command.<b>enable()</b>;
         * command.exec();    // Execute the command.
         */
        enable: function() {
            if (this.state == constants.CMDSTATE.TRISTATE_DISABLED)
                this.setState((!this.preserveState || (typeof this.previousState == 'undefined')) ? constants.CMDSTATE.TRISTATE_OFF : this.previousState);
        },

        /**
         * Disables the command for execution. The command state will be set to
         * @example
         * command.<b>disable()</b>;
         * command.exec();    // "false" - Nothing happens.
         */
        disable: function() {
            this.setState(constants.CMDSTATE.TRISTATE_DISABLED);
        },

        /**
         * Toggles the on/off (active/inactive) state of the command. This is
         * mainly used internally by context sensitive commands.
         * @example
         * command.<b>toggleState()</b>;
         */
        toggleState: function() {
            if (this.state == constants.CMDSTATE.TRISTATE_OFF)
                this.setState(constants.CMDSTATE.TRISTATE_ON);
            else if (this.state == constants.CMDSTATE.TRISTATE_ON)
                this.setState(constants.CMDSTATE.TRISTATE_OFF);
        },

        getState: function() {
            return this.state;
        },

        /**
         * Sets the command state.
         * @param {Number} newState The new state. See {@link #state}.
         * @returns {Boolean} Returns "true" if the command state changed.
         */
        setState: function(newState) {
            // Do nothing if there is no state change.
            if (this.state == newState)
                return false;

            this.previousState = this.state;

            // Set the new state.
            this.state = newState;

            // Fire command state changed. so other parts of the code can react to the
            // change.
            var event = new Event(constants.EVENT.CMD_STATE_CHANGE);
            this.broadcast(event);

            return true;
        }

    });



    return Command;
});
