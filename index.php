<?php

/*
 *
 * Plugin Name: Embed STL
 * Plugin URI: https://github.com/mmdoogie/embed-stl
 * Description: Adds STL as a media type for embeddable interactive preview
 * Version: 1.0.0
 * Author: mmdoogie
 *
 */

defined('ABSPATH') || exit;

add_action('init', 'embed_stl_load_textdomain');
add_action('init', 'embed_stl_register_block');
add_filter('upload_mimes', 'embed_stl_add_upload_mime');
add_filter('post_mime_types', 'embed_stl_add_post_mime');
wp_register_script('embed-stl-stl-viewer', plugins_url('/public/js/stl_viewer.min.js', __FILE__));
wp_enqueue_script('embed-stl-stl-viewer');

function embed_stl_load_textdomain() {
	load_plugin_textdomain('embed-stl', false, basename(__DIR__) . '/languages');
}

function embed_stl_register_block() {
	wp_register_script(
		'embed-stl',
		plugins_url('block.js', __FILE__),
		array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor', 'underscore'),
		filemtime(plugin_dir_path(__FILE__) . 'block.js')
	);
	
	wp_register_style(
		'embed-stl',
		plugins_url('style.css', __FILE__),
		array(),
		filemtime(plugin_dir_path(__FILE__) . 'style.css')
	);
	
	register_block_type('embed-stl/embed-stl', array('style' => 'embed-stl', 'editor_script' => 'embed-stl', 'render_callback' => 'embed_stl_render_callback'));
	if (function_exists('wp_set_script_translations')) {
		wp_set_script_translations('embed-stl', 'embed-stl');
	}
}

function embed_stl_add_upload_mime($mime_types=array()) {
	$mime_types['stl'] = 'application/sla';
	return $mime_types;
}

function embed_stl_add_post_mime($mime_types=array()) {
	$mime_types['application/sla'] = array('STLs', __('Manage STLs'), _n_noop('STL <span class="count">(%s)</span>', 'STLs <span class="count">(%s)</span>'));
	return $mime_types;
}

function embed_stl_render_callback($attrs, $content) {
	return "<div><h2>" . $attrs['title'] . "</h2></div><div id='stl-preview-" . $attrs['blockID'] . "'></div><script>var stlView_" . $attrs['blockID'] . " = new StlViewer(document.getElementById('stl-preview-" . $attrs['blockID'] . "'), {models:[{id:0,filename:'" . $attrs['mediaURL'] . "'}]});</script>";
}

?>