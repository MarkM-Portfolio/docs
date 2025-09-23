dojo.provide("writer.filter.tools");
(function() {
	writer.filter.tools = {
		extend : function(target) {
			var argsLength = arguments.length, overwrite, propertiesList;

			if (typeof (overwrite = arguments[argsLength - 1]) == 'boolean')
				argsLength--;
			else if (typeof (overwrite = arguments[argsLength - 2]) == 'boolean') {
				propertiesList = arguments[argsLength - 1];
				argsLength -= 2;
			}
			for ( var i = 1; i < argsLength; i++) {
				var source = arguments[i];
				for ( var propertyName in source) {
					// Only copy existed fields if in overwrite mode.
					if (overwrite === true || target[propertyName] == undefined) {
						// Only copy specified fields if list is provided.
						if (!propertiesList || (propertyName in propertiesList))
							target[propertyName] = source[propertyName];

					}
				}
			}

			return target;
		},
		
		bind : function( func, obj )
		{
			return function() { return func.apply( obj, arguments ); };
		},
		/**
		 * Convert the specified CSS length value to the calculated pixel length inside this page.
		 * <strong>Note:</strong> Percentage based value is left intact.
		 * @param {String} cssLength CSS length value.
		 */
		convertToPx : ( function ()
		{
			var calculator;

			return function( cssLength )
			{
				//TODO:
//				var pattern = /^\./;
//				if(pattern.test(cssLength))
//					cssLength = '0' + cssLength;
//
//				if ( !calculator )
//				{
//					calculator = CKEDITOR.dom.element.createFromHtml(
//							'<div style="position:absolute;left:-9999px;' +
//							'top:-9999px;margin:0px;padding:0px;border:0px;"' +
//							'></div>', CKEDITOR.document );
//					CKEDITOR.document.getBody().append( calculator );
//				}
//
//				if ( !(/%$/).test( cssLength ) )
//				{
//					calculator.setStyle( 'width', cssLength );
//					return calculator.$.clientWidth;
//				}

				return cssLength;
			};
		} )(),

		ltrim : (function() {
			// We are not using \s because we don't want "non-breaking spaces"
			// to be caught.
			var trimRegex = /^[ \t\n\r]+/g;
			return function(str) {
				return str.replace(trimRegex, '');
			};
		})(),

		rtrim : (function() {
			// We are not using \s because we don't want "non-breaking spaces"
			// to be caught.
			var trimRegex = /[ \t\n\r]+$/g;
			return function(str) {
				return str && str.replace(trimRegex, '');
			};
		})()
	};
})();
