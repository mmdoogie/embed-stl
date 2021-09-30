( function( blocks, blockEditor, i18n, element, components, _ ) {
	var __ = i18n.__;
	var el = element.createElement;
	var RichText = blockEditor.RichText;
	var MediaUpload = blockEditor.MediaUpload;
	var InspectorControls = blockEditor.InspectorControls;
	var PanelBody = components.PanelBody;
	var SelectControl = components.SelectControl;
	var ColorPicker = components.ColorPicker;
	var ToggleControl = components.ToggleControl;
	var stlPreview;

	blocks.registerBlockType( 'embed-stl/embed-stl', {
		title: __( 'Embed STL'),
		icon: 'car',
		category: 'media',
		keywords: ['3d', 'model', 'stl'],
		
		attributes: {
			mediaID: {
				type: 'number'
			},
			mediaDesc: {
				type: 'string'
			},
			mediaURL: {
				type: 'string'
			},
			blockID: {
				type: 'string'
			},
			blockSize: {
				type: 'string'
			},
			modelColor: {
				type: 'string'
			},
			displayMode: {
				type: 'string'
			},
			showGrid: {
				type: 'boolean'
			},
			autoRotate: {
				type: 'boolean'
			},
			showBorder: {
				type: 'boolean'
			},
			solidBackground: {
				type: 'boolean'
			},
			backgroundColor: {
				type: 'string'
			}
		},

		edit: function( props ) {
			var attributes = props.attributes;
			if (!attributes.blockID) props.setAttributes({blockID: props.clientId.replaceAll("-","_")});
			if (!attributes.blockSize) props.setAttributes({blockSize: 'sm'});
			if (!attributes.modelColor) props.setAttributes({modelColor: '#777777'});
			if (!attributes.displayMode) props.setAttributes({displayMode: 'flat'});
			if (!attributes.backgroundColor) props.setAttributes({backgroundColor: '#ffffff'});

			var modelsLoadedCallback = function() {
				stlPreview.camera.position.z = stlPreview.calc_z_for_auto_zoom();
				stlPreview.set_color(0, attributes.modelColor);
				stlPreview.set_display(0, attributes.displayMode);
				stlPreview.set_grid(attributes.showGrid);
				stlPreview.set_auto_rotate(attributes.autoRotate);
				if (attributes.solidBackground) stlPreview.set_bg_color(attributes.backgroundColor);
			}

			var sizeChangedObserved = function () {
				stlPreview.do_resize();
				stlPreview.camera.position.z = stlPreview.calc_z_for_auto_zoom();
			}

			var setupPreview = function() {
				if (!stlPreview) {
					var previewElement = document.getElementById('stl-preview-' + attributes.blockID);
					if (previewElement) {
						stlPreview = new StlViewer(previewElement, {all_loaded_callback: modelsLoadedCallback, zoom: 1});
						if (attributes.mediaURL) stlPreview.add_model({id: 0, filename:attributes.mediaURL});
						const obs = new MutationObserver(sizeChangedObserved);
						obs.observe(previewElement, {attributes: true});
					}
				}
			}

			var onSelectImage = function( media ) {
				if (stlPreview.models_count) stlPreview.remove_model(0);
				if (media.url) stlPreview.add_model({id: 0, filename:media.url});

				return props.setAttributes( {
					mediaURL: media.url,
					mediaDesc: media.id + ": " + media.title + " (" + media.filename + ")",
				} );
			};

			var onSizeSelectChange = function(newValue) {
				props.setAttributes({blockSize: newValue});
			};

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
					className: "embed-stl-size-" + attributes.blockSize + (attributes.showBorder ? " embed-stl-yes-border" : "")})
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
				el(ToggleControl, {label: __('Show XY Grid'), checked: attributes.showGrid, onChange: onShowGridChanged}),
				el(ToggleControl, {label: __('Auto Rotate'), checked: attributes.autoRotate, onChange: onAutoRotateChanged}),
				el(ToggleControl, {label: __('Viewport Border'), checked: attributes.showBorder, onChange: onShowBorderChanged}),
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
