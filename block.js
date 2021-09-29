( function( blocks, blockEditor, i18n, element, components, _ ) {
	var __ = i18n.__;
	var el = element.createElement;
	var RichText = blockEditor.RichText;
	var MediaUpload = blockEditor.MediaUpload;
	var InspectorControls = blockEditor.InspectorControls;
	var PanelBody = components.PanelBody;
	var SelectControl = components.SelectControl;
	var ColorPicker = components.ColorPicker;
	var stlPreview;

	blocks.registerBlockType( 'embed-stl/embed-stl', {
		title: __( 'Embed STL'),
		icon: 'car',
		category: 'media',
		keywords: ['3d', 'model', 'stl'],
		
		attributes: {
			mediaID: {
				type: 'number',
			},
			mediaDesc: {
				type: 'string',
			},
			mediaURL: {
				type: 'string',
			},
			blockID: {
				type: 'string'
			},
			blockSize: {
				type: 'string'
			},
			modelColor: {
				type: 'string'
			}
			}
		},

		edit: function( props ) {
			var attributes = props.attributes;
			if (!attributes.blockID) props.setAttributes({blockID: props.clientId.replaceAll("-","_")});
			if (!attributes.blockSize) props.setAttributes({blockSize: 'sm'});
			if (!attributes.modelColor) props.setAttributes({modelColor: '#777777'});

			var modelsLoadedCallback = function() {
				stlPreview.camera.position.z = stlPreview.calc_z_for_auto_zoom();
				stlPreview.set_color(0, attributes.modelColor);
			}

			var sizeChangedObserved = function () {
				stlPreview.do_resize();
				stlPreview.camera.position.z = stlPreview.calc_z_for_auto_zoom();
			}

			if (!stlPreview) {
				var previewElement = document.getElementById('stl-preview-' + attributes.blockID);
				if (previewElement) {
					stlPreview = new StlViewer(previewElement, {all_loaded_callback: modelsLoadedCallback, zoom: 1});
					if (attributes.mediaURL) stlPreview.add_model({id: 0, filename:attributes.mediaURL});
					const obs = new MutationObserver(sizeChangedObserved);
					obs.observe(previewElement, {attributes: true});
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
									onClick: obj.open,
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
					className: "embed-stl-size-" + attributes.blockSize})
			),
			el(InspectorControls, {}, el(PanelBody, {title: __('Settings')}, [
				el(SelectControl, {label: __('Size'), value: attributes.blockSize, options: [
					{value: 'sm', label: __('Small')},
					{value: 'md', label: __('Medium')},
					{value: 'lg', label: __('Large')}], onChange: onSizeSelectChange}),
				el('label', {}, __('Model Color')),
				el(ColorPicker, {color: attributes.modelColor, disableAlpha: true, onChangeComplete: onModelColorChanged})
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
