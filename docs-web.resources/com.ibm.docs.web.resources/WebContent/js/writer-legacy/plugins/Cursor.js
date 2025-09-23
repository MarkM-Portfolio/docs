dojo.provide("writer.plugins.Cursor");
dojo.require("writer.plugins.Plugin");
dojo.declare( "writer.plugins.Cursor",
[writer.plugins.Plugin], {
	init: function() {
		//init commands
		var keys = dojo.keys;
		var editor = this.editor;
		var commands = [ {
			name : "left",
			shift : false,
			ctrl: false,
			shortcut : keys.LEFT_ARROW
		}, {
			name : "left",
			shift : true,
			ctrl: false,
			shortcut : keys.LEFT_ARROW + writer.SHIFT
		}, {
			name : "left",
			shift : false,
			ctrl: true,
			shortcut : keys.LEFT_ARROW + writer.CTRL
		}, {
			name : "left",
			shift : true,
			ctrl: true,
			shortcut : keys.LEFT_ARROW + writer.CTRL+ writer.SHIFT
		}, {
			name : "right",
			shift : false,
			shortcut : keys.RIGHT_ARROW
		}, {
			name : "right",
			shift : true,
			ctrl: false,
			shortcut : keys.RIGHT_ARROW + writer.SHIFT
		}, {
			name : "right",
			shift : false,
			ctrl: true,
			shortcut : keys.RIGHT_ARROW + writer.CTRL
		}, {
			name : "right",
			shift : true,
			ctrl: true,
			shortcut : keys.RIGHT_ARROW + writer.CTRL + writer.SHIFT
		}, {
			name : "up",
			shift : false,
			ctrl: false,
			shortcut : keys.UP_ARROW
		}, {
			name : "up",
			shift : true,
			ctrl: false,
			shortcut : keys.UP_ARROW + writer.SHIFT
		}, {
			name : "up",
			shift : false,
			ctrl: true,
			shortcut : keys.UP_ARROW + writer.CTRL 
		},{
			name : "up",
			shift : true,
			ctrl: true,
			shortcut : keys.UP_ARROW + writer.CTRL + writer.SHIFT
		},{
			name : "up",
			shift : false,
			ctrl: true,
			alt: true,
			shortcut : keys.F3 
		},{
			name : "down",
			shift : false,
			ctrl: false,
			shortcut : keys.DOWN_ARROW
		},{
			name : "down",
			shift : true,
			ctrl: false,
			shortcut : keys.DOWN_ARROW + writer.SHIFT
		},{
			name : "down",
			shift : false,
			ctrl: true,
			shortcut : keys.DOWN_ARROW + writer.CTRL
		},{
			name : "down",
			shift : true,
			ctrl: true,
			shortcut : keys.DOWN_ARROW + writer.CTRL + writer.SHIFT
		},{
			name : "down",
			shift : false,
			ctrl: true,
			alt: true,
			shortcut : keys.F4 
		},{
			name : "pageup",
			shift : false,
			ctrl: false,
			shortcut : keys.PAGE_UP
		},{
			name : "pagedown",
			shift : false,
			ctrl: false,
			shortcut : keys.PAGE_DOWN
		},{
			name : "pageup",
			shift : true,
			ctrl: false,
			shortcut : keys.PAGE_UP + writer.SHIFT
		},{
			name : "pagedown",
			shift : true,
			ctrl: false,
			shortcut : keys.PAGE_DOWN + writer.SHIFT
		},{
			name : "home",
			shift : false,
			ctrl: false,
			shortcut : keys.HOME
		},{
			name : "home",
			shift : true,
			ctrl: false,
			shortcut : keys.HOME + writer.SHIFT
		},{
			name : "home",
			shift : false,
			ctrl: true,
			shortcut : keys.HOME + writer.CTRL
		},{
			name : "home",
			shift : true,
			ctrl: true,
			shortcut : keys.HOME + writer.SHIFT + writer.CTRL
		},{
			name : "end",
			shift : false,
			ctrl: false,
			shortcut : keys.END
		},{
			name : "end",
			shift : false,
			ctrl: true,
			shortcut : keys.END + writer.CTRL
		},{
			name : "end",
			shift : true,
			ctrl: false,
			shortcut : keys.END + writer.SHIFT
		},{
			name : "end",
			shift : true,
			ctrl: true,
			shortcut : keys.END + writer.SHIFT + writer.CTRL
		}
		];
		
		var cursorCommand = function(name, shift, ctrl, alt) {
			this._name = name;
			this._shift = shift;
			this._ctrl = ctrl;
			this._alt = !!alt;
			this.isPreviousLineRtl = false;
			this.previousCommandName = null;
		};
		cursorCommand.prototype.exec = function() {
			if(pe.lotusEditor.updateManager.isUpdating()){
				return;
			}			
			var  selection = editor.getSelection();
			var  lastrange = selection.getRanges()[0];
			
			var toTop, toEnd, commandName = this._defination._name,
				isLineRtl = writer.util.ViewTools.getLine(selection._end.obj);
			isLineRtl = isLineRtl&&isLineRtl.isRtlDir; // defect 43601 null pointer exception.
			/* when selection expands one line boundaries, when lines have different text direction
			   if left/right arrow selection started on RTL line, keep extending it in RTL specific way
			   if left/right arrow selection started on LTR line, keep extending it in regular way */
			if(commandName == 'left' || commandName == 'right') {
				if(this._shift) {
					if(selection.isEmpty()) {
						/* cache command name on selection start */
						this.previousCommandName = commandName;
						this.isPreviousLineRtl = isLineRtl;
					}else if(this.isPreviousLineRtl ^ isLineRtl) {
						/* toggle cached command name on line direction change */
						this.isPreviousLineRtl = isLineRtl;
						this.previousCommandName = (commandName == 'left') ? 'right' : 'left';
					}
					/* make use of cached command name on expanding selection */
					if(!selection.isEmpty() && this.previousCommandName && commandName != this.previousCommandName)
						commandName = this.previousCommandName;
				}else
					this.previousCommandName = null;
			}else
				this.previousCommandName = null;

			switch (commandName) {
			case 'left':
				dojo.publish(writer.EVENT.CURSORCOMMAND, [commandName, lastrange]);
				if(isLineRtl)
					selection.moveRight( this._shift, this._ctrl );
				else
					selection.moveLeft( this._shift, this._ctrl );
				break;
			case 'right':
				dojo.publish(writer.EVENT.CURSORCOMMAND, [commandName, lastrange]);
				if(isLineRtl)
					selection.moveLeft( this._shift, this._ctrl );
				else
					selection.moveRight( this._shift, this._ctrl );

				break;
			case 'up':
				dojo.publish(writer.EVENT.CURSORCOMMAND, [this._defination._name, lastrange]);
				selection.lineUp( this._shift, this._ctrl, this._alt );
				break;
			case 'down':
				dojo.publish(writer.EVENT.CURSORCOMMAND, [this._defination._name, lastrange]);
				selection.lineDown( this._shift, this._ctrl, this._alt );
				break;
			case 'pageup':
				dojo.publish(writer.EVENT.CURSORCOMMAND, [this._defination._name, lastrange]);
				selection.pageUp( this._shift );
				break;
			case 'pagedown':
				dojo.publish(writer.EVENT.CURSORCOMMAND, [this._defination._name, lastrange]);
				selection.pageDown( this._shift );
				break;
			case 'home':
				dojo.publish(writer.EVENT.CURSORCOMMAND, [this._defination._name, lastrange]);
				selection.lineStart( this._shift, this._ctrl );
				if (this._ctrl)
					toTop = true;
				break;
			case 'end':
				dojo.publish(writer.EVENT.CURSORCOMMAND, [this._defination._name, lastrange]);
				selection.lineEnd( this._shift, this._ctrl );
				break;
			default:
				return;
			}
			//scroll into view ....
			selection.scrollIntoView(toTop, toEnd);
			selection.AnnounceSelection(this._defination._name, this._defination._shift);
		};
		
		for (var i=0;i<commands.length;i++){
			var command = commands[i];
			var name = command.name;
			if( command.shift )
				name = 'to_'+ name;
			if( command.ctrl )
				name = name + '_ctrl';
			this.editor.addCommand( name, new cursorCommand(command.name, command.shift, command.ctrl, command.alt), command.shortcut);
		}
	}
});