<?php
/*
Plugin Name: WP Media Uploader Input Field
Plugin URI: http://nabeel.molham.me/plugins/wp-media-upload-input
Description: Uses WordPress media uploader to create input fields so you can use in your projects 
Version: 2.0
Author: Nabeel Molham
Author URI: http://nabeel.molham.me
License: GPL
*/

/**
 * Constants
 */
define( 'WP_MU_DIR', plugin_dir_path( __FILE__ ) );
define( 'WP_MU_URL', plugin_dir_url( __FILE__ ) );

class WP_Media_Uploader_Input
{
	/**
	 * Input Settings
	 * 
	 * @var array
	 */
	protected $settings;

	/**
	 * Is Multiple images input
	 * 
	 * @var boolean
	 */
	protected $is_multiple;

	/**
	 * Input value data
	 * 
	 * @var array
	 */
	protected $value;

	/**
	 * Input constructor
	 * 
	 * @param array|string $settings ( Optional )
	 * @param array $value ( Optional )Input default value or values if multiple
	 */
	public function __construct( $settings = '', $value = '' )
	{
		$this->set_options( $settings );
		$this->set_value( $value );
	}

	/**
	 * Set input value(s)
	 * 
	 * @param array $value
	 */
	public function set_value( $value )
	{
		// image(s) data
		if ( $this->is_multiple )
			$value = wp_parse_args( $value, array() );
		else 
			$value = wp_parse_args( $value, array( 'url' => '', 'id' => 0 ) );

		// image(s) filter
		$this->value = apply_filters( 'wpmuif_input_value', $value );

		return $this;
	}

	/**
	 * Set/Change input settings options
	 * 
	 * @param array|string $settings
	 */
	public function set_options( $settings )
	{
		// default settings
		$defaults = array (
				// input args
				'input_name' => 'image',
				'input_id_name' => 'id',
				'input_url_name' => 'url',
				'multiple' => 'no',
				'data_array' => true,
				'image_placeholder' => WP_MU_URL .'images/placeholder.png',
				'image_placeholder_width' => '70',
				'image_placeholder_height' => '70',
				'media_uploader_button_label' => __( 'Media Uploader' ),
				'single_remove_button_label' => __( 'Remove' ),
				'multiple_remove_button_label' => __( 'Remove All' ),
				// Media uploader args
				'frame_title' => __( 'Select an Image' ),
				'select_button_label' => __( 'Use Image' ),
				'remove_confirm_message' => __( 'Are you sure ?' ),
				'remove_confirm_yes' => __( 'Yes' ),
				'remove_confirm_no' => __( 'No' ),
				'file_type' => 'image',
		);

		// parse settings
		$this->settings = apply_filters( 'wpmuif_input_args', wp_parse_args( $settings, $defaults ) );

		// is multiple images
		$this->is_multiple = 'yes' == $this->settings['multiple'];

		return $this;
	}

	/**
	 * Set/Update single input setting option
	 * 
	 * @param string $option
	 * @param mixed $value
	 */
	public function set_option( $option, $value )
	{
		$this->settings[$option] = $value;

		// check specific settings
		switch ( $option )
		{
			// is multiple images
			case 'multiple':
				$this->is_multiple = 'yes' == $value;
				break;
		}

		return $this;
	}

	/**
	 * Render input field
	 * 
	 * @param boolean $echo if true HTML string will be returned
	 * @return string|void
	 */
	public function output_input( $echo = false )
	{
		// enqueue styles
		wp_enqueue_style( 'wpmuif-media-uploader-style', WP_MU_URL . 'css/media.css' );

		// enqueue scripts
		wp_enqueue_media();
		wp_enqueue_script( 'wpmuif-live-query', WP_MU_URL . 'js/jquery.livequery.min.js', array( 'jquery' ), false, true );
		wp_enqueue_script( 'wpmuif-media-uploader', WP_MU_URL . 'js/media.js', array( 'jquery' ), false, true );

		// image placeholder size
		$img_size = 'width="'. $this->settings['image_placeholder_width'] .'" height="'. $this->settings['image_placeholder_height'] .'"';

		// image(s) holder start
		$output = '<div class="wpmuif-field"><span class="image-holder wpmuif-image-holder'. ( $this->is_multiple ? ' multiple' : '' ) .'">';

		// inputs
		$inputs_fields = '';

		// single
		$inputs_name = array (
				'id' => $this->settings['data_array'] ?  $this->settings['input_name'] . '['.  $this->settings['input_id_name'] .']' :  $this->settings['input_id_name'],
				'url' =>  $this->settings['data_array'] ?  $this->settings['input_name'] . '['.  $this->settings['input_url_name'] .']' :  $this->settings['input_url_name'],
		);

		// multiple
		if ( $this->is_multiple )
		{
			$inputs_name = array (
					'id' =>  $this->settings['data_array'] ? $this->settings['input_name'] . '[%d]['.  $this->settings['input_id_name'] .']' :  $this->settings['input_id_name'] . '[%d]',
					'url' =>  $this->settings['data_array'] ? $this->settings['input_name'] . '[%d]['.  $this->settings['input_url_name'] .']' :  $this->settings['input_url_name'] . '[%d]',
			);
		}

		// is there file(s) selected or not
		$is_selected = null;

		if ( $this->is_multiple )
		{
			// multiple files

			// image item defaults
			$item_defualt = array (
					'id' => 0,
					'url' => '', 
			);

			// clear single file value if it was
			if ( isset( $this->value['id'] ) )
				$this->value = array( $item_defualt );

			// loop images
			foreach ( $this->value as $index => $item )
			{
				$item = wp_parse_args( $item, $item_defualt );

				// set is_selected
				if ( null === $is_selected )
					$is_selected = '' != $item['url'];

				$output .= '<span class="image image-'. $index .'" data-index="'. $index .'"><img src="'. ( '' == $item['url'] ? $this->settings['image_placeholder'] : $item['url'] ) .'" '. $img_size .' /></span>';
				$inputs_fields .= '<input name="'. sprintf( $inputs_name['id'], $index ) .'" type="hidden" value="'. (int) esc_attr( $item['id'] ) .'" class="image-id image-'. $index .'" />';
				$inputs_fields .= '<input name="'. sprintf( $inputs_name['url'], $index ) .'" type="hidden" value="'. esc_attr( $item['url'] ) .'" class="image-url image-'. $index .'" />';
			}
		}
		else
		{
			// single file
			$is_selected = '' != $this->value['url'];
			$output .= '<img src="'. ( $is_selected ? $this->value['url'] : $this->settings['image_placeholder'] ) .'" '. $img_size .' />';
			$inputs_fields .= '<input name="'. $inputs_name['id'] .'" type="hidden" value="'. (int) esc_attr( $this->value['id'] ) .'" class="image-id" />';
			$inputs_fields .= '<input name="'. $inputs_name['url'] .'" type="hidden" value="'. esc_attr( $this->value['url'] ) .'" class="image-url" />';
		}

		// image(s) holder end
		$output .= '</span>';

		// media uploader button
		$output .= '<input type="button" class="mu-image button'. ( $this->is_multiple ? ' multiple' : '' ) .'" value="'. $this->settings['media_uploader_button_label'] .'"';
		// data attributes
		foreach ( $this->settings as $option_name => $option_value )
		{
			switch ( $option_name )
			{
				case 'image_placeholder':
				case 'image_placeholder_width':
				case 'image_placeholder_height':
				case 'remove_confirm_message':
				case 'frame_title':
				case 'file_type':
				case 'select_button_label':
					$output .= ' data-'. str_replace( '_', '-', $option_name ) .'="'. esc_attr( $option_value ) .'"';
					break;
			}
		}
		$output .= ' data-input-names="'. esc_attr( json_encode( $inputs_name ) ) .'" />';

		// remove button
		$output .= '<input type="button" class="mu-image-remove button" value="';
		$output .= $this->is_multiple ? $this->settings['multiple_remove_button_label'] : $this->settings['single_remove_button_label'];
		$output .= '"'. ( $is_selected ? '' : ' style="display: none;"') .' />';

		// remove confirm
		$output .= '<span class="remove-confirm wpmuif-remove-confirm">';
		$output .= $this->settings['remove_confirm_message'];
		$output .= '&nbsp;&nbsp;&nbsp;<input type="button" class="button confirm-button confirm-yes" value="'. $this->settings['remove_confirm_yes'] .'" />';
		$output .= '&nbsp;&nbsp;&nbsp;<input type="button" class="button confirm-button confirm-no" value="'. $this->settings['remove_confirm_no'] .'" />';
		$output .= '</span>';

		// inputs output
		$output .= '<span class="inputs wpmuif-inputs">'. $inputs_fields .'</span>';

		// input holder end
		$output .= '</div>';

		// return or echo
		if ( $echo )
			echo apply_filters( 'wpmuif_input_field', $output );
		else
			return apply_filters( 'wpmuif_input_field', $output );
	}
}

// display only if test mode enabled
if ( defined( 'WP_MU_TEST_MODE' ) )
	add_action( 'admin_init', 'wpmuif_test_admin_init' );

/**
 * TEST: WP Admin init
*/
function wpmuif_test_admin_init()
{
	// Add the section to media settings
	add_settings_section( 'wpmuif_text_section', __( 'Media Uploader Field Input Test Section' ), '__return_false', 'media' );

	// Add the fields with the section
	add_settings_field( 'wpmuif_single_test', __( 'Single Image' ), 'wpmuif_test_input_callback', 'media', 'wpmuif_text_section', array( 'multiple' => 'no', 'input_name' => 'wpmuif_single_test' ) );
	add_settings_field( 'wpmuif_multiple_test', __( 'Multiple Image' ), 'wpmuif_test_input_callback', 'media', 'wpmuif_text_section', array( 'multiple' => 'yes', 'input_name' => 'wpmuif_multiple_test' ) );

	// Register our setting
	register_setting( 'media', 'wpmuif_single_test' );
	register_setting( 'media', 'wpmuif_multiple_test' );
}

/**
 * TEST: setting field callback
 * 
 * @param array $args
 */
function wpmuif_test_input_callback( $args )
{
	$input = new WP_Media_Uploader_Input( $args );
	$input->set_value( get_option( $args['input_name'], array() ) )->output_input( true );
}






