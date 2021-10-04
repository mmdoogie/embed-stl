<?php

/*
 *
 * Plugin Name: Embed STL
 * Plugin URI: https://github.com/mmdoogie/embed-stl
 * Description: Adds STL as a media type for uploads, provides editor block for embeddable viewer based on viewstl plugin
 * Version: 1.0.0
 * Author: mmdoogie
 * License: MIT
 * License URI: https://github.com/mmdoogie/embed-stl/blob/main/LICENSE
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
	$s_blockID = esc_attr($attrs['blockID']);
	$s_blockSize = esc_attr($attrs['blockSize']);
	$s_showBorder =  $attrs['showBorder'] ? 'embed-stl-yes-border' : '';
	$s_iconUrl = esc_url(plugins_url('/public/img/icon.svg', __FILE__));
	$s_mediaURL = esc_url($attrs['mediaURL']);
	$s_modelColor = esc_attr($attrs['modelColor']);
	$s_displayMode = esc_attr($attrs['displayMode']);
	$s_bgColor = $attrs['solidBackground'] ? esc_attr($attrs['backgroundColor']) : 'transparent';
	$s_autoRotate = $attrs['autoRotate'] ? true : false;
	$s_showGrid = $attrs['showGrid'] ? true : false;

	$viewerParams = array("models" => array(
		array("id" => 0, "filename" => $s_mediaURL, "color" => $s_modelColor, "display" => $s_displayMode)),
		"bg_color" => $s_bgColor, "auto_rotate" => $s_autoRotate, "grid" => $s_showGrid
	);

	ob_start();

	echo('<div class="wp-block-embed-stl-embed-stl">' . PHP_EOL);
	printf('<div id="stl-preview-%s" class="embed-stl-target embed-stl-size-%s %s">' . PHP_EOL, $s_blockID, $s_blockSize, $s_showBorder);
	if (!$attrs['hideOverlayIcon']) {
		printf('<img src="%s" class="embed-stl-cube-icon">' . PHP_EOL, $s_iconUrl);
	}
	echo('</div>'  . PHP_EOL . '<script>' . PHP_EOL);
	printf('var stlView_%1$s = new StlViewer(document.getElementById("stl-preview-%1$s"), %2$s);' . PHP_EOL, $s_blockID, wp_json_encode($viewerParams));
	echo('</script>' . PHP_EOL . '</div>' . PHP_EOL);

	$out = ob_get_contents();
	ob_end_clean();
	return $out;
}
?>