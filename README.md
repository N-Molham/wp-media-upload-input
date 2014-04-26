# WordPress Media Uploader Input Field

A way to reuse media uploader in wordpress 3.5 or greater which is very very helpful and faster from the old one, OOP with chaining

## Usage ##
* just place the plugin folder in you plugins directory and activate it
* the class `WP_Media_Uploader_Input` will be available to use

## Example ##
```php
$input_settings = array ( 
		// input options
		'input_name' => 'image', // input name for back-end handling
		'input_id_name' => 'id', // item ID input field name
		'input_url_name' => 'url', // item URL input field name
		'multiple' => 'no', // select multiple items or not, "yes" or "no"
		'data_array' => true, // get id & url as an array or not
		'image_placeholder' => WP_MU_URL .'images/placeholder.png', // image placeholder url
		'image_placeholder_width' => '70', // image width
		'image_placeholder_height' => '70', // image height
		'media_uploader_button_label' => __( 'Media Uploader' ), // Media Uploader button name
		'single_remove_button_label' => __( 'Remove' ), // remove all items button label if multiple
		'multiple_remove_button_label' => __( 'Remove All' ), // remove item label if not multiple
		// Media uploader options
		'frame_title' => __( 'Select an Image' ), // Media Upload frame title 
		'select_button_label' => __( 'Use Image' ), // select button label
		'remove_confirm_message' => __( 'Are you sure ?' ), // confirm message on removing item(s)
		'remove_confirm_yes' => __( 'Yes' ), // "Yes" answer label
		'remove_confirm_no' => __( 'No' ), // "No" answer label
		'file_type' => 'image', // file type of items visible on Media Uploader window open
);
$input = new WP_Media_Uploader_Input( $input_settings );
$input->set_options( $input_settings );
$input->set_option( 'option_name', 'option_value' ); // set single option
$input->set_value( array() )->output_input( true ); // "output_input" with true passed will echo the layout and if false passed ( Default ) it will return HTML string of the layout
```

the code is highly customizable through filters, I will list them with docs as soon as possible but they are fairly easy to understand.

** Contact if there are any problems **

Hope you find it helpful :)

License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
