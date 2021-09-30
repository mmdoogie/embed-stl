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
	ob_start();
?>
<div class="wp-block-embed-stl-embed-stl">
	<div id="stl-preview-<?=$attrs['blockID']?>" class="embed-stl-target embed-stl-size-<?=$attrs['blockSize']?> <?= $attrs['showBorder'] ? 'embed-stl-yes-border' : ''?>">
<?php if (!$attrs['hideOverlayIcon']) { ?>
	<svg width="24" height="24" viewBox="0 0 128 128" class="embed-stl-cube-icon" role="img"><path d="M63.724 46.329c-.344 0-.689-.062-1.016-.186L26.019 32.032a2.82 2.82 0 0 1 0-5.272l37.357-14.111a2.85 2.85 0 0 1 2.026 0l36.021 14.111c1.095.418 1.812 1.468 1.812 2.636a2.82 2.82 0 0 1-1.806 2.636L64.74 46.143c-.327.124-.672.186-1.016.186zM34.898 29.396l28.826 11.086 28.826-11.086L64.393 18.31z"/><path d="M63.724 92.543c-.344 0-.689-.062-1.016-.186L26.019 78.246a2.82 2.82 0 0 1-1.806-2.636V30.454c0-1.558 1.264-2.822 2.822-2.822s2.822 1.264 2.822 2.822v43.22l33.867 13.027 33.867-13.027v-43.22c0-1.558 1.264-2.822 2.822-2.822s2.822 1.264 2.822 2.822V75.61a2.82 2.82 0 0 1-1.806 2.636L64.74 92.357c-.327.124-.672.186-1.016.186z"/><path d="M63.724 92.543c-1.558 0-2.822-1.264-2.822-2.822V44.565c0-1.558 1.264-2.822 2.822-2.822s2.822 1.264 2.822 2.822v45.156c0 1.558-1.264 2.822-2.822 2.822zm-15.875 22.994a2.81 2.81 0 0 1-2.258-1.129 2.82 2.82 0 0 1 .564-3.951l8.275-6.209-8.275-6.209a2.82 2.82 0 0 1-.564-3.951c.937-1.247 2.704-1.496 3.951-.564l11.289 8.467a2.82 2.82 0 0 1 0 4.516l-11.289 8.467c-.508.378-1.101.564-1.693.564z"/><path d="M56.316 107.071c-8.534 0-16.612-.406-24.011-1.202C22.066 104.835.343 101.914.343 88.785c0-5.357 5.526-9.833 16.414-13.298 1.789-.553 3.708.841 3.708 2.692 0 1.366-.948 2.506-2.235 2.766-9.031 2.907-12.332 6.042-12.243 7.84.134 2.69.235 8.78 26.905 11.467 7.214.779 15.088 1.174 23.424 1.174 1.558 0 2.822 1.264 2.822 2.822s-1.264 2.822-2.822 2.822zm19.699-.318a2.82 2.82 0 0 1-2.811-2.591c-.124-1.552 1.033-2.918 2.585-3.042 29.069-2.376 46.224-8.656 46.224-12.608 0-1.818-3.268-5.251-12.486-8.186a2.83 2.83 0 0 1-1.834-3.545c.474-1.484 2.055-2.303 3.545-1.834 10.894 3.466 16.42 7.942 16.42 13.298 0 13.914-40.195 17.582-51.411 18.502-.079.006-.158.006-.231.006z"/><path d="M80.398 115.155a2.81 2.81 0 0 0 2.258-1.129 2.82 2.82 0 0 0-.564-3.951l-8.275-6.209 8.275-6.209a2.82 2.82 0 0 0 .564-3.951c-.937-1.247-2.704-1.496-3.951-.564l-11.289 8.467a2.82 2.82 0 0 0 0 4.516l11.289 8.467c.508.378 1.101.564 1.693.564z"/></svg>
<?php } ?>
	</div>
	<script>
		var e = document.getElementById("stl-preview-<?=$attrs['blockID']?>");
		var stlView_<?=$attrs['blockID']?> = new StlViewer(e, {
			models: [{id: 0, filename: "<?=$attrs['mediaURL']?>", color: "<?=$attrs['modelColor']?>", display: "<?=$attrs['displayMode']?>"}],
			bg_color: "<?=$attrs['solidBackground'] ? $attrs['backgroundColor'] : 'transparent'?>", auto_rotate: <?=$attrs['autoRotate'] ? 'true' : 'false'?>, grid: <?=$attrs['showGrid'] ? 'true' : 'false'?>});
	</script>
</div>
<?php
	$out = ob_get_contents();
	ob_end_clean();
	return $out;
}
?>