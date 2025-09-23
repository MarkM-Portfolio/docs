dojo.provide("writer.core.Command");

dojo.require("writer.core.Broadcaster");
dojo.require("writer.core.Event");

// Reference from CKeditor command.js
dojo.declare("writer.core.Command", [writer.core.Broadcaster], {
	_defination : null,
	_editor : null,

	constructor: function(editor, commandDef, name) {
		this._editor = editor;
		this._defination = commandDef;
		this._extend( this, commandDef,	
		{
			state : writer.TRISTATE_OFF
		});
		this._name = name;
		
	},
	
	_extend : function( target )
	{
		var argsLength = arguments.length,
			overwrite, propertiesList;

		if ( typeof ( overwrite = arguments[ argsLength - 1 ] ) == 'boolean')
			argsLength--;
		else if ( typeof ( overwrite = arguments[ argsLength - 2 ] ) == 'boolean' )
		{
			propertiesList = arguments [ argsLength -1 ];
			argsLength-=2;
		}
		for ( var i = 1 ; i < argsLength ; i++ )
		{
			var source = arguments[ i ];
			for ( var propertyName in source )
			{
				// Only copy existed fields if in overwrite mode.
				if ( overwrite === true || target[ propertyName ] == undefined )
				{
					// Only copy  specified fields if list is provided.
					if ( !propertiesList || ( propertyName in propertiesList ) )
						target[ propertyName ] = source[ propertyName ];

				}
			}
		}

		return target;
	},
	
	/**
	 * Return the command name.
	 */
	getName : function()
	{
		return this._name;
	},
	
	/**
	 * Executes the command.
	 * @param {Object} [data] Any data to pass to the command. Depends on the
	 *		command implementation and requirements.
	 * @returns {Boolean} A boolean indicating that the command has been
	 *      successfully executed.
	 * @example
	 * command.<b>exec()</b>;  // The command gets executed.
	 */
	execute : function(data)
	{
		if ( this.state == writer.TRISTATE_DISABLED )
			return false;
		
		if(data && data.notFocus)
			delete data.notFocus;
		else
			this._editor.focus();
		// TODO Set focus to editor if needed.

		return ( this._defination.exec.call( this, data ) !== false );
	},
	
	/**
	 * Enables the command for execution. The command state available before disabling it
	 * is restored.
	 * @example
	 * command.<b>enable()</b>;
	 * command.exec();    // Execute the command.
	 */
	enable : function()
	{
		if ( this.state == writer.TRISTATE_DISABLED )
			this.setState( ( !this.preserveState || ( typeof this.previousState == 'undefined' ) ) ? writer.TRISTATE_OFF : this.previousState );
	},
	
	/**
	 * Disables the command for execution. The command state will be set to
	 * @example
	 * command.<b>disable()</b>;
	 * command.exec();    // "false" - Nothing happens.
	 */
	disable : function()
	{
		this.setState( writer.TRISTATE_DISABLED );
	},
	
	/**
	 * Toggles the on/off (active/inactive) state of the command. This is
	 * mainly used internally by context sensitive commands.
	 * @example
	 * command.<b>toggleState()</b>;
	 */
	toggleState : function()
	{
		if ( this.state == writer.TRISTATE_OFF )
			this.setState( writer.TRISTATE_ON );
		else if ( this.state == writer.TRISTATE_ON )
			this.setState( writer.TRISTATE_OFF );
	},
	
	getState : function()
	{
		return this.state;
	},
	
	/**
	 * Sets the command state.
	 * @param {Number} newState The new state. See {@link #state}.
	 * @returns {Boolean} Returns "true" if the command state changed.
	 */
	setState : function(newState)
	{
		// Do nothing if there is no state change.
		if ( this.state == newState )
			return false;

		this.previousState = this.state;

		// Set the new state.
		this.state = newState;
		
		// Fire command state changed. so other parts of the code can react to the
		// change.
		var event = new writer.core.Event(writer.EVENT.CMD_STATE_CHANGE);
		this.broadcast(event);
		
		return true;
	}

});

//Tri-state constants.
/**
 * Used to indicate the ON or ACTIVE state.
 * @constant
 * @example
 */
writer.TRISTATE_ON = 1;

/**
 * Used to indicate the OFF or NON ACTIVE state.
 * @constant
 * @example
 */
writer.TRISTATE_OFF = 2;

/**
 * Used to indicate DISABLED state.
 * @constant
 * @example
 */
writer.TRISTATE_DISABLED = 0;

/**
 * Used to indicate HIDDEN state.
 * Hide the command related UI
 * @constant
 * @example
 */
writer.TRISTATE_HIDDEN = 3;
