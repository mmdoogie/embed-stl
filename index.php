<?php

/*
 *
 * Plugin Name: Embed STL
 * Plugin URI: https://github.com/mmdoogie/embed-stl
 * Description: Adds STL as a media type for uploads, provides editor block for embeddable viewer based on viewstl plugin
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.0
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

function embed_stl_load_textdomain() {
	load_plugin_textdomain('embed-stl', false, basename(__DIR__) . '/languages');
}

function embed_stl_register_block() {
	register_block_type(__DIR__, array('render_callback' => 'embed_stl_render_callback'));
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
	$s_rx = sprintf("%0.4f", $attrs['defaultRotateX'] / 57.2958);
	$s_ry = sprintf("%0.4f", $attrs['defaultRotateY'] / 57.2958);
	$s_rz = sprintf("%0.4f", $attrs['defaultRotateZ'] / 57.2958);
	$s_zx = sprintf("%0.4f", $attrs['defaultZoomMod'] < 0 ? -100 / ($attrs['defaultZoomMod'] - 100) : ($attrs['defaultZoomMod'] / 100) + 1);

	$viewerParams = array("models" => array(
		array("id" => 0, "filename" => esc_url($attrs['mediaURL']), "color" => esc_attr($attrs['modelColor']), "display" => esc_attr($attrs['displayMode']))),
		"bg_color" => esc_attr($attrs['solidBackground'] ? $attrs['backgroundColor'] : 'transparent'), "auto_rotate" => $attrs['autoRotate'] ? true : false, "grid" => $attrs['showGrid'] ? true : false,
		"allow_drag_and_drop" => false, "send_no_model_click_event" => true
	);

	ob_start();

	echo('<div class="wp-block-embed-stl-embed-stl">' . PHP_EOL);
	printf('<div id="stl-preview-%s" class="embed-stl-target embed-stl-size-%s %s">' . PHP_EOL, esc_attr($attrs['blockID']), esc_attr($attrs['blockSize']), esc_attr($attrs['showBorder'] ? 'embed-stl-yes-border' : ''));
	if (!$attrs['hideOverlayIcon']) {
		printf('<img src="%s" class="embed-stl-cube-icon">' . PHP_EOL, esc_url(plugins_url('/public/img/icon.svg', __FILE__)));
	}
	echo('</div>'  . PHP_EOL . '<script>' . PHP_EOL);
	printf('var e = document.getElementById("stl-preview-%1$s"); var stlView_%1$s = new StlViewer(e, %2$s);' . PHP_EOL, esc_attr($attrs['blockID']), wp_json_encode($viewerParams));
	printf('function stlView_%1$s_recenter(id,evt,dist,ct) { if (ct != 11) return; v=stlView_%1$s; c=v.get_camera_state(); c.position={...c.position, x:0, y:0, z:v.calc_z_for_auto_zoom()}; c.target={...c.target, x:0, y:0, z:0}; v.set_camera_state(c);};' . PHP_EOL, esc_attr($attrs['blockID']));
	printf('function stlView_%1$s_orient() { v=stlView_%1$s; m=v.models[0].mesh; m.rotation.x=%2$s; m.rotation.y=%3$s; m.rotation.z=%4$s; m.scale.setScalar(%5$s); };' . PHP_EOL, esc_attr($attrs['blockID']), esc_attr($s_rx), esc_attr($s_ry), esc_attr($s_rz), esc_attr($s_zx));
	printf('window.addEventListener("resize", function() { stlView_%1$s_recenter(0,0,0,11); });' . PHP_EOL, esc_attr($attrs['blockID']));
	printf('stlView_%1$s.set_on_model_mousedown(stlView_%1$s_recenter);' . PHP_EOL, esc_attr($attrs['blockID']));
	printf('stlView_%1$s.all_loaded_callback=stlView_%1$s_orient;' . PHP_EOL, esc_attr($attrs['blockID']));
	echo('</script>' . PHP_EOL . '</div>' . PHP_EOL);

	$out = ob_get_contents();
	ob_end_clean();
	return $out;
}
?>