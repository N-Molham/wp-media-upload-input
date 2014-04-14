/**
 * Media Uploader UI >= 3.5
 */
( function( window ) {
	jQuery( function( $ ) {
		// frame holder
		var file_frame;

		$( '.mu-image' ).livequery( function() {
			// the button itself
			var $button = $( this ),
				// remove button
				$remove = $button.parent().find( '.mu-image-remove' ),
				// remove confirm message
				$remove_confirm = $button.parent().find( '.remove-confirm' ),
				// image placeholder
				$image_holder = $button.parent().find( '.image-holder' ),
				// field settings
				mu_settings = $button.data(),
				// placeholder size
				image_size = 'width="'+ mu_settings.imagePlaceholderWidth +'" height="'+ mu_settings.imagePlaceholderHeight +'"';
				// items index
				last_index = 1;

			// remove image from multiple
			$image_holder.on( 'click', '.image', function() {
				if ( !confirm( mu_settings.removeConfirmMessage ) ) {
					return false;
				}

				var remove_index = '.image-'+ parseInt( $( this ).remove().attr( 'data-index' ) );
				$button.parent().find( '.inputs' ).find( remove_index ).remove();

				// reset component if all images removed
				if ( $image_holder.find( '.image' ).length < 1 ) {
					// dummy placeholder image
					$image_holder.html( '<img src="'+ mu_settings.imagePlaceholder +'" '+ image_size +' alt="" />' );

					// hide remove button
					$remove.css( 'display', 'none' );
				}
			});

			// remove button clicked
			$remove.on( 'click', function() {
				// show remove confirm message
				$remove_confirm.css( 'display', 'block' );

				// hide buttons
				$button.hide();
				$remove.hide();
			} );

			// remove confirm message buttons clicked
			$remove_confirm.find( '.confirm-button' ).click( function(){
				if ( $( this ).is( '.confirm-yes' ) ) {
					// agreed on removal, reset fields values
					if ( $button.hasClass( 'multiple' ) ) {
						// multiple images
						clear_multiple_images();
					} else {
						// single image
						$button.parent().find( '.image-url, .image-id' ).val( '' );
					}

					// dummy placeholder image
					$image_holder.html( '<img src="'+ mu_settings.imagePlaceholder +'" '+ image_size +' alt="" />' );

					// hide remove button
					$remove.css( 'display', 'none' );
				} else {
					// canceled
					$remove.show();
				}

				// reset component display
				$remove_confirm.css( 'display', 'none' );
				$button.show();
			} );

			$button.on( 'click', function( e ) {
				// prevent default behavior
				e.preventDefault();
				if ( typeof file_frame != 'undefined' ) {
					file_frame.close();
				}

				// if multiple file or not
				var is_multiple = $button.hasClass( 'multiple' );

				// create and open new file frame
				file_frame = wp.media( {
					//Title of media manager frame
					title: mu_settings.frameTitle,
					library: {
						type: mu_settings.fileType
					},
					button: {
						//Button text
						text: mu_settings.selectButtonLabel
					},
					//Do not allow multiple files, if you want multiple, set true
					multiple: is_multiple,
				} );

				// callback for selected image
				file_frame.on( 'select', function() {
					var selected = [];
					var selection = file_frame.state().get( 'selection' );
					if ( is_multiple ) {
						// multiple images selected
						selection.map( function( file ) {
							selected.push( file.toJSON() );
						} );
					} else {
						// single image
						selected.push( selection.first().toJSON() );
					}

					// clear images and inputs if multiple
					if ( is_multiple ) {
						clear_multiple_images();
					}

					// loop through selected images
					for ( var i = 0; i < selected.length; i++ ) {
						parse_selected_item( selected[i], is_multiple );
					}

					// trigger image(s) selected event
					$( 'body' ).trigger( 'wpmuif_image_selected', [selected] );
				} );

				// open file frame
				file_frame.open();
			} );

			// clear multiple images
			function clear_multiple_images() {
				$image_holder.empty();
				$button.parent().find( '.inputs' ).empty();
				last_index = 1;
			}
			
			// handle selected item
			function parse_selected_item( image_item, is_multiple ) {
				// image url hidden field
				var $url_field = $button.parent().find('.image-url');
				
				// image id hidden field
				var $id_field = $button.parent().find('.image-id');

				// create new inputs if multiple 
				if ( is_multiple ) {
					$id_field = $( '<input name="'+ wpmuif_sprintf( mu_settings.inputNames.id, last_index ) +'" type="hidden" value="" class="image-id image-'+ last_index +'" />' );
					$url_field = $( '<input name="'+ wpmuif_sprintf( mu_settings.inputNames.url, last_index ) +'" type="hidden" value="" class="image-url image-'+ last_index +'" />' );
				}

				// set inputs values
				$id_field.val(image_item.id);
				$url_field.val(image_item.url);

				// append inputs to it's holder if multiple
				if ( is_multiple ) {
					$button.parent().find('.inputs').append( [ $id_field, $url_field ] );
				}

				// check if the image has thumbnail to use instead of full size image
				if ( typeof image_item.sizes.thumbnail != 'undefined' ) {
					// has thumb
					if ( is_multiple ) {
						$image_holder.append('<span class="image image-'+ last_index +'" data-index="'+ last_index +'"><img src="'+ image_item.sizes.thumbnail.url +'" '+ image_size +' alt="" /></span>');
					} else {
						$image_holder.html('<img src="'+ image_item.sizes.thumbnail.url +'" '+ image_size +' alt="" />');
					}
				} else {
					// use full size image
					if ( is_multiple ) {
						$image_holder.append('<span class="image image-'+ last_index +'"><img src="'+ image_item.url +'" '+ image_size +' alt="" /></span>');
					} else {
						$image_holder.html('<img src="'+ image_item.url +'" '+ image_size +' alt="" />');
					}
				}
				// increase items length if multiple
				if ( is_multiple ) {
					last_index++;
				}

				// show remove button
				$remove.css( 'display', 'inline-block' );
			}
		} );

		// php like sprintf
		window.wpmuif_sprintf = function () {
			var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
			var a = arguments;
			var i = 0;
			var format = a[i++];

			// pad()
			var pad = function (str, len, chr, leftJustify) {
				if (!chr) {
					chr = ' ';
				}
				var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0)
				.join(chr);
				return leftJustify ? str + padding : padding + str;
			};

			// justify()
			var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
				var diff = minWidth - value.length;
				if (diff > 0) {
					if (leftJustify || !zeroPad) {
						value = pad(value, minWidth, customPadChar, leftJustify);
					} else {
						value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
					}
				}
				return value;
			};

			// formatBaseX()
			var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
				// Note: casts negative numbers to positive ones
				var number = value >>> 0;
				prefix = prefix && number && {
					'2': '0b',
					'8': '0',
					'16': '0x'
				}[base] || '';
				value = prefix + pad(number.toString(base), precision || 0, '0', false);
				return justify(value, prefix, leftJustify, minWidth, zeroPad);
			};

			// formatString()
			var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
				if (precision != null) {
					value = value.slice(0, precision);
				}
				return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
			};

			// doFormat()
			var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
				var number, prefix, method, textTransform, value;

				if (substring === '%%') {
					return '%';
				}

				// parse flags
				var leftJustify = false;
				var positivePrefix = '';
				var zeroPad = false;
				var prefixBaseX = false;
				var customPadChar = ' ';
				var flagsl = flags.length;
				for (var j = 0; flags && j < flagsl; j++) {
					switch (flags.charAt(j)) {
					case ' ':
						positivePrefix = ' ';
						break;
					case '+':
						positivePrefix = '+';
						break;
					case '-':
						leftJustify = true;
						break;
					case "'":
						customPadChar = flags.charAt(j + 1);
						break;
					case '0':
						zeroPad = true;
						customPadChar = '0';
						break;
					case '#':
						prefixBaseX = true;
						break;
					}
				}

				// parameters may be null, undefined, empty-string or real valued
				// we want to ignore null, undefined and empty-string values
				if (!minWidth) {
					minWidth = 0;
				} else if (minWidth === '*') {
					minWidth = +a[i++];
				} else if (minWidth.charAt(0) == '*') {
					minWidth = +a[minWidth.slice(1, -1)];
				} else {
					minWidth = +minWidth;
				}

				// Note: undocumented perl feature:
				if (minWidth < 0) {
					minWidth = -minWidth;
					leftJustify = true;
				}

				if (!isFinite(minWidth)) {
					throw new Error('sprintf: (minimum-)width must be finite');
				}

				if (!precision) {
					precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
				} else if (precision === '*') {
					precision = +a[i++];
				} else if (precision.charAt(0) == '*') {
					precision = +a[precision.slice(1, -1)];
				} else {
					precision = +precision;
				}

				// grab value using valueIndex if required?
				value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

				switch (type) {
				case 's':
					return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
				case 'c':
					return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
				case 'b':
					return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
				case 'o':
					return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
				case 'x':
					return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
				case 'X':
					return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
					.toUpperCase();
				case 'u':
					return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
				case 'i':
				case 'd':
					number = +value || 0;
					// Plain Math.round doesn't just truncate
					number = Math.round(number - number % 1);
					prefix = number < 0 ? '-' : positivePrefix;
					value = prefix + pad(String(Math.abs(number)), precision, '0', false);
					return justify(value, prefix, leftJustify, minWidth, zeroPad);
				case 'e':
				case 'E':
				case 'f': // Should handle locales (as per setlocale)
				case 'F':
				case 'g':
				case 'G':
					number = +value;
					prefix = number < 0 ? '-' : positivePrefix;
					method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
					textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
					value = prefix + Math.abs(number)[method](precision);
					return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
				default:
					return substring;
				}
			};

			return format.replace(regex, doFormat);
		};
	} );
} )( window );