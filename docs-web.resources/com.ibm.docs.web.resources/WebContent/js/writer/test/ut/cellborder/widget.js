define([
	"dojo/keys",
	"dojo/has",
	"dojo/on",
	"writer/ui/widget/CellBorder"
], function (keys, has, on, CellBorder) {
	describe('writer.test.ut.cellborder.widget', function() {

		var loadTestData = function(){
			pe.lotusEditor.execCommand = function(){};
		};

		var fakeEvent = {
			preventDefault:function(){}, stopPropagation: function(){}
		};
	
		var widget;
	
		beforeEach(function() {
			loadTestData();
			widget = new CellBorder();
			jasmine.Clock.useMock();
		});
	
		afterEach(function() {
			jasmine.Clock.tick(3000);
			widget.destroy();
			widget = null;
		});
	
		it('widget init', function() {
			widget.focus();
			expect(widget.rangePanel.types).toEqual(["clear", "all", "inner", "horizontal", "vertical", "outer", "left", "top", "right", "bottom"]);
			expect(widget.typePicker.getValue()).toEqual("solid");
			expect(widget.widthPicker.getValue()).toEqual(1);
			expect(widget.colorBtn.getValue()).toEqual("000000");
			expect(widget._currentFocus).toEqual(widget.rangePanel);
			// set disable
			widget.widthPicker.set('disabled',true);
			expect(widget.widthPicker.disabled).toBeTruthy();
			widget.widthPicker.set('disabled',false);
			expect(widget.widthPicker.disabled).toBeFalsy();
		});
	
		it('Move focus by TAB', function() {
			widget.focus();
			var key = {keyCode:keys.TAB, preventDefault:function(){}, stopPropagation: function(){}};
			spyOn(key,"preventDefault");
			// TAB
			expect(widget._currentFocus).toEqual(widget.rangePanel);
			widget._onKeyDown(key);
			expect(widget._currentFocus).toEqual(widget.widthPicker);
			widget._onKeyDown(key);
			expect(widget._currentFocus).toEqual(widget.typePicker);
			widget._onKeyDown(key);
			expect(widget._currentFocus).toEqual(widget.colorBtn);
			widget._onKeyDown(key);
			expect(widget._currentFocus).toEqual(widget.rangePanel);
			//shift + TAB
			key.shiftKey = true;
			widget._onKeyDown(key);
			expect(widget._currentFocus).toEqual(widget.colorBtn);
			widget._onKeyDown(key);
			expect(widget._currentFocus).toEqual(widget.typePicker);
			widget._onKeyDown(key);
			expect(widget._currentFocus).toEqual(widget.widthPicker);
			widget._onKeyDown(key);
			expect(widget._currentFocus).toEqual(widget.rangePanel);
		});
	
		it('Select border range by arrow',function(){
			var rangePanel = widget.rangePanel;
			//spyOn(dojo,"stopEvent");
			// up
			var key = {keyCode:keys.UP_ARROW,preventDefault:function(){}, stopPropagation: function(){}};
			rangePanel._onKeyDown(key);
			expect(rangePanel.get("value")).toEqual("outer");
			// shift + up
			key.shiftKey = true;
			rangePanel._onKeyDown(key);
			expect(rangePanel.get("value")).toEqual("clear");
			// down
			key.shiftKey = false;
			key = {keyCode:keys.DOWN_ARROW,preventDefault:function(){}, stopPropagation: function(){}};
			rangePanel._onKeyDown(key);
			expect(rangePanel.get("value")).toEqual("outer");
			//shift + down
			key.shiftKey = true;
			rangePanel._onKeyDown(key);
			expect(rangePanel.get("value")).toEqual("clear");
			// left
			key.shiftKey = false;
			key = {keyCode:keys.LEFT_ARROW,preventDefault:function(){}, stopPropagation: function(){}};
			rangePanel._onKeyDown(key);
			expect(rangePanel.get("value")).toEqual("bottom");
			// shift + left
			key.shiftKey = true;
			rangePanel._onKeyDown(key);
			expect(rangePanel.get("value")).toEqual("clear");
			// right
			key.shiftKey = false;
			key = {keyCode:keys.RIGHT_ARROW,preventDefault:function(){}, stopPropagation: function(){}};
			rangePanel._onKeyDown(key);
			expect(rangePanel.get("value")).toEqual("all");
			// shift + right
			key.shiftKey = true;
			rangePanel._onKeyDown(key);
			expect(rangePanel.get("value")).toEqual("clear");
			//Enter
			spyOn(pe.lotusEditor,"execCommand");
			key = {keyCode:keys.ENTER,preventDefault:function(){}, stopPropagation: function(){}};
			rangePanel._onKeyDown(key);
		});
	
		it('Change border range',function(){
			var rangePanel = widget.rangePanel;
			spyOn(rangePanel,"onChange");
			// click
			//spyOn(dojo,"stopEvent");
			rangePanel._onClick(1,fakeEvent);
			expect(rangePanel.onChange).toHaveBeenCalled();
			// Space
			rangePanel.selectNode(2);
			key = {keyCode:keys.SPACE,preventDefault:function(){}, stopPropagation: function(){}};
			rangePanel._onKeyDown(key);
			expect(rangePanel.onChange).toHaveBeenCalled();
		});
		
		it('Select border width in popup by keyboard', function() {
			var widthPicker = widget.widthPicker;
			widthPicker.openDropDown();
			//spyOn(dojo,"stopEvent");
			spyOn(widthPicker,"onChange");
			var key = {keyCode:keys.UP_ARROW,preventDefault:function(){}, stopPropagation: function(){}};
			expect(widthPicker.get('value'))
				.toEqual(1);
			// Up
			widthPicker._onInputKeyDown(key);
			expect(widthPicker.get('value'))
				.toEqual(0.75);
			// down
			key.keyCode = keys.DOWN_ARROW;
			widthPicker._onInputKeyDown(key);
			expect(widthPicker.get('value'))
				.toEqual(1);
			// left
			key.keyCode = keys.LEFT_ARROW;
			widthPicker._onInputKeyDown(key);
			expect(widthPicker.get('value'))
				.toEqual(1);
			// right
			key.keyCode = keys.RIGHT_ARROW;
			widthPicker._onInputKeyDown(key);
			expect(widthPicker.get('value'))
				.toEqual(1);
			//ESCAPE
			key.keyCode = keys.ESCAPE;
			widthPicker._onInputKeyDown(key);
	
			expect(widthPicker.onChange).not.toHaveBeenCalled();
			//ENTER
			key.keyCode = keys.ENTER;
			widthPicker._onInputKeyDown(key);
		});
		
		it('Change border width limited',function(){
			var widthPicker = widget.widthPicker;
			widthPicker.set("value",6);
			widthPicker.setLimited(true);
			expect(widthPicker.get("value")).toEqual(3);
		});
	
		it('Change border width in popup by mouse',function(){
			var widthPicker = widget.widthPicker;
			spyOn(widthPicker,'onChange');
			widthPicker.openDropDown();
			var item = widthPicker.dropDown.getChildren()[2];
			widthPicker._onDropDownMouseDown();
			widthPicker._clickItem(item);
			expect(widthPicker.onChange).toHaveBeenCalled();
			widthPicker.closeDropDown();
		});
	
		it('Change border width in input box',function(){
			var widthPicker = widget.widthPicker;
			spyOn(widthPicker,'onChange');
			widthPicker.inputNode.value = "3pt";
			widthPicker._onInputChange();
			widthPicker.dropDownClosed();
			expect(widthPicker.onChange).toHaveBeenCalledWith(3);
		});
	
		it('Change border width in right by keyboard',function(){
			var widthPicker = widget.widthPicker;
			//spyOn(dojo,"stopEvent");
			// right
			var key = {keyCode:keys.RIGHT_ARROW,preventDefault:function(){}, stopPropagation: function(){}};
			// down is disabled
			// fontSizeDown is disabled
			widthPicker._onButtonKeyDown(key);
			widthPicker.focus("end");
			// fontSizeUp is diabled
			widthPicker.set('value',6);
			widthPicker._onButtonKeyDown(key);
			widthPicker.focus("end");
			expect(widthPicker.fontSizeUpDisabled).toBeTruthy();
			// both up & down is diabled
			widthPicker.fontSizeUpDisabled = true;
			widthPicker.fontSizeDownDisabled = true;
			widthPicker._onButtonKeyDown(key);
			widthPicker.focus("end");
			widthPicker.set('value',3);
			// select button & move back
			key.keyCode = keys.LEFT_ARROW;
			widthPicker._onUpArrowKeyDown(key);
			widthPicker._onButtonKeyDown(key);
			// down
			key.keyCode = keys.DOWN_ARROW;
			widthPicker._onUpArrowKeyDown(key);
			// select button & move back
			key.keyCode = keys.LEFT_ARROW;
			widthPicker._onDownArrowKeyDown(key);
			widthPicker._onButtonKeyDown(key);
			// up
			key.keyCode = keys.UP_ARROW;
			widthPicker._onDownArrowKeyDown(key);
			spyOn(widthPicker,'onChange');
			key.keyCode = keys.ENTER;
			// ENTER in up
			on.emit(widthPicker.fontSizeUpWrapper,"keydown",key);
			expect(widthPicker.onChange).toHaveBeenCalledWith(4.5);		
			// ENTER in down
			on.emit(widthPicker.fontSizeDownWrapper,"keydown",key);
			expect(widthPicker.onChange).toHaveBeenCalledWith(3);
		});
	
		it('border width mouse inputs',function(){
			var widthPicker = widget.widthPicker;
			widthPicker.set('value',3);
			spyOn(widthPicker,'onChange');
			on.emit(widthPicker.fontSizeUpWrapper,"mousedown",fakeEvent);
			expect(widthPicker.onChange).toHaveBeenCalledWith(4.5);
			on.emit(widthPicker.fontSizeDownWrapper,"mousedown",fakeEvent);
			expect(widthPicker.onChange).toHaveBeenCalledWith(3);
	
			// fontSizeUpDown should stop the default mouse event
			spyOn(fakeEvent,"preventDefault");
			on.emit(widthPicker.fontSizeUpDown,"mousedown",fakeEvent);
			// expect(fakeEvent.preventDefault).toHaveBeenCalled();
			on.emit(widthPicker.fontSizeUpDown,"click",fakeEvent);
			// expect(fakeEvent.preventDefault).toHaveBeenCalled();
	
			// if the widget is opened, it couldn't be click
			widthPicker._opened = true;
			widthPicker.__onClick();
			widthPicker.disabled = true;
			widthPicker._onInputMouseDown(fakeEvent);
			expect(fakeEvent.preventDefault).toHaveBeenCalled();
		});
	
		it('Select border type by keyboard',function(){
			var typePicker = widget.typePicker;
			//has("ie") = true;
			typePicker.openDropDown();
			//has("ie") = false;
			on.emit(typePicker.dropDown.domNode.parentNode,"scroll",{});
			typePicker.closeDropDown();
			typePicker.openDropDown();
			spyOn(typePicker,"onChange");
			var buttonNode = typePicker._buttonNode;
			// Left
			var key = {
				keyCode:keys.LEFT_ARROW,preventDefault:function(){}, stopPropagation: function(){}
			};
			on.emit(buttonNode,"keydown",key);
			// Right
			key.keyCode = keys.RIGHT_ARROW;
			on.emit(buttonNode,"keydown",key);
			// Up
			key.keyCode = keys.UP_ARROW;
			on.emit(buttonNode,"keydown",key);
			// Escape
			key.keyCode = keys.ESCAPE;
			on.emit(buttonNode,"keydown",key);
			expect(typePicker.onChange).not.toHaveBeenCalled();
	
			typePicker.openDropDown();
			// down
			key.keyCode = keys.DOWN_ARROW;
			on.emit(buttonNode,"keydown",key);
			// Enter
			key.keyCode = keys.ENTER;
			on.emit(buttonNode,"keydown",key);
			expect(typePicker.onChange).toHaveBeenCalled();
		});
	
		it('Change border type', function() {
			var typePicker = widget.typePicker;
			spyOn(typePicker,"onChange");
			var item = typePicker.dropDown.getChildren()[2];
			typePicker._onMouseDown(item);
			typePicker.dropDownClosed();
			expect(typePicker.onChange).toHaveBeenCalled();
		});
	
		it('Change color',function(){
			var colorBtn = widget.colorBtn;
			spyOn(colorBtn,"onChange");
			colorBtn.toggleDropDown();
			colorBtn.dropDown._selectedCell = 0;
			colorBtn.dropDown.onChange('autoColor');
			colorBtn.closeDropDown();
			expect(colorBtn.onChange).toHaveBeenCalled();
			colorBtn._color = "auto";
			colorBtn.toggleDropDown();
			colorBtn.dropDown.onChange('#000000');
			expect(colorBtn.get('value')).toEqual('000000');
			colorBtn.closeDropDown();
			colorBtn._color = "undefined color";
			colorBtn.toggleDropDown();
			colorBtn.closeDropDown();
		});
	});

});