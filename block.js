( function( blocks, blockEditor, i18n, element, components, _ ) {
	var __ = i18n.__;
	var el = element.createElement;
	var RichText = blockEditor.RichText;
	var MediaUpload = blockEditor.MediaUpload;
	var InspectorControls = blockEditor.InspectorControls;
	var PanelBody = components.PanelBody;
	var SelectControl = components.SelectControl;
	var RangeControl = components.RangeControl;
	var ColorPicker = components.ColorPicker;
	var ToggleControl = components.ToggleControl;
	var viewers = {};

	var cubeIcon = el('svg', {className: "embed-stl-cube-icon", width: 24, height: 24, viewBox: "0 0 128 128"}, [
	el('path', {d: 'M63.724 46.329c-.344 0-.689-.062-1.016-.186L26.019 32.032a2.82 2.82 0 0 1 0-5.272l37.357-14.111a2.85 2.85 0 0 1 2.026 0l36.021 14.111c1.095.418 1.812 1.468 1.812 2.636a2.82 2.82 0 0 1-1.806 2.636L64.74 46.143c-.327.124-.672.186-1.016.186zM34.898 29.396l28.826 11.086 28.826-11.086L64.393 18.31z'}),
	el('path', {d: 'M63.724 92.543c-.344 0-.689-.062-1.016-.186L26.019 78.246a2.82 2.82 0 0 1-1.806-2.636V30.454c0-1.558 1.264-2.822 2.822-2.822s2.822 1.264 2.822 2.822v43.22l33.867 13.027 33.867-13.027v-43.22c0-1.558 1.264-2.822 2.822-2.822s2.822 1.264 2.822 2.822V75.61a2.82 2.82 0 0 1-1.806 2.636L64.74 92.357c-.327.124-.672.186-1.016.186z'}),
	el('path', {d: 'M63.724 92.543c-1.558 0-2.822-1.264-2.822-2.822V44.565c0-1.558 1.264-2.822 2.822-2.822s2.822 1.264 2.822 2.822v45.156c0 1.558-1.264 2.822-2.822 2.822zm-15.875 22.994a2.81 2.81 0 0 1-2.258-1.129 2.82 2.82 0 0 1 .564-3.951l8.275-6.209-8.275-6.209a2.82 2.82 0 0 1-.564-3.951c.937-1.247 2.704-1.496 3.951-.564l11.289 8.467a2.82 2.82 0 0 1 0 4.516l-11.289 8.467c-.508.378-1.101.564-1.693.564z'}),
	el('path', {d: 'M56.316 107.071c-8.534 0-16.612-.406-24.011-1.202C22.066 104.835.343 101.914.343 88.785c0-5.357 5.526-9.833 16.414-13.298 1.789-.553 3.708.841 3.708 2.692 0 1.366-.948 2.506-2.235 2.766-9.031 2.907-12.332 6.042-12.243 7.84.134 2.69.235 8.78 26.905 11.467 7.214.779 15.088 1.174 23.424 1.174 1.558 0 2.822 1.264 2.822 2.822s-1.264 2.822-2.822 2.822zm19.699-.318a2.82 2.82 0 0 1-2.811-2.591c-.124-1.552 1.033-2.918 2.585-3.042 29.069-2.376 46.224-8.656 46.224-12.608 0-1.818-3.268-5.251-12.486-8.186a2.83 2.83 0 0 1-1.834-3.545c.474-1.484 2.055-2.303 3.545-1.834 10.894 3.466 16.42 7.942 16.42 13.298 0 13.914-40.195 17.582-51.411 18.502-.079.006-.158.006-.231.006z'}),
	el('path', {d: 'M80.398 115.155a2.81 2.81 0 0 0 2.258-1.129 2.82 2.82 0 0 0-.564-3.951l-8.275-6.209 8.275-6.209a2.82 2.82 0 0 0 .564-3.951c-.937-1.247-2.704-1.496-3.951-.564l-11.289 8.467a2.82 2.82 0 0 0 0 4.516l11.289 8.467c.508.378 1.101.564 1.693.564z'})
	]);

	blocks.registerBlockType( 'embed-stl/embed-stl', {
		icon: cubeIcon,
		edit: function( props ) {
			var attributes = props.attributes;
			if (!attributes.blockID) props.setAttributes({blockID: props.clientId.replaceAll("-","_")});

			var stlPreview;

			var modelsLoadedCallback = function() {
				stlPreview.camera.position.z = stlPreview.calc_z_for_auto_zoom();
				stlPreview.set_color(0, attributes.modelColor);
				stlPreview.set_display(0, attributes.displayMode);
				stlPreview.set_grid(attributes.showGrid);
				stlPreview.set_auto_rotate(attributes.autoRotate);
				if (attributes.solidBackground) stlPreview.set_bg_color(attributes.backgroundColor);
				stlPreview.models[0].mesh.rotation.x = attributes.defaultRotateX / 57.2958;
				stlPreview.models[0].mesh.rotation.y = attributes.defaultRotateY / 57.2958;
				stlPreview.models[0].mesh.rotation.z = attributes.defaultRotateZ / 57.2958;
				stlPreview.models[0].mesh.scale.setScalar(attributes.defaultZoomMod < 0 ? -100 / (attributes.defaultZoomMod - 100) : (attributes.defaultZoomMod / 100) + 1);
			}

			var resetCamera = function() {
				c = stlPreview.get_camera_state();
				c.position = {...c.position, x:0, y:0, z:stlPreview.calc_z_for_auto_zoom()};
				c.target = {...c.target, x:0, y:0, z:0};
				stlPreview.set_camera_state(c);
			}

			var sizeChangedObserved = function () {
				stlPreview.do_resize();
				resetCamera();
			}

			var setupPreview = function() {
				if (!stlPreview) {
					if (attributes.blockID) stlPreview = viewers[attributes.blockID];
					if (!stlPreview) {
						var previewElement = document.getElementById('stl-preview-' + attributes.blockID);
						if (previewElement) {
							stlPreview = new StlViewer(previewElement, {all_loaded_callback: modelsLoadedCallback, zoom: 1, allow_drag_and_drop: false, send_no_model_click_event: true});
							viewers[attributes.blockID] = stlPreview;
							if (attributes.mediaURL) stlPreview.add_model({id: 0, filename:attributes.mediaURL});
							const obs = new MutationObserver(sizeChangedObserved);
							obs.observe(previewElement, {attributes: true});
							var recenterView = function (id, evt, dist, ct) {
								if (ct != 11) return;
								resetCamera();
							}
							stlPreview.set_on_model_mousedown(recenterView);
							window.addEventListener('resize', function() { recenterView(0, 0, 0, 11); });
						}
					}
				}
			}

			var onSelectImage = function( media ) {
				if (stlPreview.models_count) stlPreview.remove_model(0);
				stlPreview.all_loaded_callback = modelsLoadedCallback;
				if (media.url) stlPreview.add_model({id: 0, filename:media.url});

				return props.setAttributes( {
					mediaURL: media.url,
					mediaDesc: media.id + ": " + media.title + " (" + media.filename + ")",
				} );
			};

			var onSizeSelectChange = function(newValue) {
				props.setAttributes({blockSize: newValue});
			};

			var onModelAngleXChanged = function(newAngle) {
				props.setAttributes({defaultRotateX: newAngle});
				if (stlPreview.models_count) stlPreview.models[0].mesh.rotation.x = newAngle / 57.2958;
				resetCamera();
			}

			var onModelAngleYChanged = function(newAngle) {
				props.setAttributes({defaultRotateY: newAngle});
				if (stlPreview.models_count) stlPreview.models[0].mesh.rotation.y = newAngle / 57.2958;
				resetCamera();
			}

			var onModelAngleZChanged = function(newAngle) {
				props.setAttributes({defaultRotateZ: newAngle});
				if (stlPreview.models_count) stlPreview.models[0].mesh.rotation.z = newAngle / 57.2958;
				resetCamera();
			}

			var onModelZoomChanged = function(newZoom) {
				props.setAttributes({defaultZoomMod: newZoom});
				if (stlPreview.models_count) stlPreview.models[0].mesh.scale.setScalar(newZoom < 0 ? -100 / (newZoom - 100) : (newZoom / 100) + 1);
				resetCamera();
			}

			var onModelColorChanged = function(newColor) {
				props.setAttributes({modelColor: newColor.hex});
				if (stlPreview.models_count) stlPreview.set_color(0, newColor.hex);
			}

			var onDisplayModeChange = function(newValue) {
				props.setAttributes({displayMode: newValue});
				if (stlPreview.models_count) stlPreview.set_display(0, newValue);
			}

			var onShowGridChanged = function(newValue) {
				props.setAttributes({showGrid: newValue});
				if (stlPreview.models_count) stlPreview.set_grid(newValue);
			}

			var onAutoRotateChanged = function(newValue) {
				props.setAttributes({autoRotate: newValue});
				if (stlPreview.models_count) stlPreview.set_auto_rotate(newValue);
			}

			var onShowBorderChanged = function(newValue) {
				props.setAttributes({showBorder: newValue});
			}

			var onSolidBackgroundChanged = function(newValue) {
				props.setAttributes({solidBackground: newValue});
				if (newValue) {
					if (stlPreview.models_count) stlPreview.set_bg_color(attributes.backgroundColor);
				} else {
					if (stlPreview.models_count) stlPreview.set_bg_color('transparent');
				}
			}

			var onBackgroundColorChanged = function(newColor) {
				props.setAttributes({backgroundColor: newColor.hex});
				if (attributes.solidBackground && stlPreview.models_count) stlPreview.set_bg_color(newColor.hex);
			}

			var onOverlayIconChanged = function(newValue) {
				props.setAttributes({hideOverlayIcon: newValue});

				var e = document.getElementById('stl-preview-' + attributes.blockID).getElementsByClassName("embed-stl-cube-icon")[0];
				e.classList.toggle("embed-stl-hidden", newValue);
			}

			if (attributes.mediaURL) setupPreview();

			return [el('div',
				{ className: props.className },
				el('div',
					{ className: 'selected-model' },
					[ el(MediaUpload, {
						onSelect: onSelectImage,
						allowedTypes: 'application/sla',
						value: attributes.mediaID,
						render: function( obj ) {
							return el(
								components.Button,
								{
									onClick: function() {obj.open(); setupPreview();},
									isPrimary: true,
									text: __('Select Media')
								}
							);
						},
					} ),
					el('span', {className: 'embed-stl-media-desc'}, attributes.mediaDesc)
					]
				),
				el('div', { id: 'stl-preview-' + attributes.blockID,
					className: "embed-stl-target embed-stl-size-" + attributes.blockSize + (attributes.showBorder ? " embed-stl-yes-border" : "")},
					attributes.hideOverlayIcon ? element.cloneElement(cubeIcon, {className: "embed-stl-cube-icon embed-stl-hidden"}) : cubeIcon)
			),
			el(InspectorControls, {}, el(PanelBody, {title: __('Settings')}, [
				el(SelectControl, {label: __('Size'), value: attributes.blockSize, options: [
					{value: 'sm', label: __('Small')},
					{value: 'md', label: __('Medium')},
					{value: 'lg', label: __('Large')}], onChange: onSizeSelectChange}),
				el(SelectControl, {label: __('Display Mode'), value: attributes.displayMode, options: [
					{value: 'flat', label: __('Flat')},
					{value: 'smooth', label: __('Smooth')},
					{value: 'wireframe', label: __('Wireframe')}], onChange: onDisplayModeChange}),
				el('label', {}, __('Model Color')),
				el(ColorPicker, {color: attributes.modelColor, disableAlpha: true, onChangeComplete: onModelColorChanged}),
				el('label', {}, __('Initial Rotation')),
				el(RangeControl, {label: __('X'), value: attributes.defaultRotateX, onChange: onModelAngleXChanged, allowReset: true, resetFallbackValue: 0, min: -180, max: 180}),
				el(RangeControl, {label: __('Y'), value: attributes.defaultRotateY, onChange: onModelAngleYChanged, allowReset: true, resetFallbackValue: 0, min: -180, max: 180}),
				el(RangeControl, {label: __('Z'), value: attributes.defaultRotateZ, onChange: onModelAngleZChanged, allowReset: true, resetFallbackValue: 0, min: -180, max: 180}),
				el(RangeControl, {label: __('Zoom'), value: attributes.defaultZoomMod, onChange: onModelZoomChanged, allowReset: true, resetFallbackValue: 0, min: -200, max: 200}),
				el(ToggleControl, {label: __('Show XY Grid'), checked: attributes.showGrid, onChange: onShowGridChanged}),
				el(ToggleControl, {label: __('Auto Rotate'), checked: attributes.autoRotate, onChange: onAutoRotateChanged}),
				el(ToggleControl, {label: __('Viewport Border'), checked: attributes.showBorder, onChange: onShowBorderChanged}),
				el(ToggleControl, {label: __('Hide Overlay Icon'), checked: attributes.hideOverlayIcon, onChange: onOverlayIconChanged}),
				el(ToggleControl, {label: __('Solid Background'), checked: attributes.solidBackground, onChange: onSolidBackgroundChanged}),
				el(ColorPicker, {className: attributes.solidBackground ? "" : "embed-stl-hidden", color: attributes.backgroundColor, disableAlpha: true, onChangeComplete: onBackgroundColorChanged})
				])
			)];
		}
	} );
} )(
	window.wp.blocks,
	window.wp.editor,
	window.wp.i18n,
	window.wp.element,
	window.wp.components,
	window._
);
