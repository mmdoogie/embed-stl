( function( blocks, editor, i18n, element, components, _ ) {
	var __ = i18n.__;
	var el = element.createElement;
	var RichText = editor.RichText;
	var MediaUpload = editor.MediaUpload;
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
			}
		},

		edit: function( props ) {
			var attributes = props.attributes;
			if (!attributes.blockID) props.setAttributes({blockID: props.clientId.replaceAll("-","_")});

			if (!stlPreview) {
				var previewElement = document.getElementById('stl-preview-' + attributes.blockID);
				if (previewElement) {
					stlPreview = new StlViewer(previewElement);
					if (attributes.mediaURL) stlPreview.add_model({id: 0, filename:attributes.mediaURL});
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

			return el(
				'div',
				{ className: props.className },
				el(
					'div',
					{ className: 'selected-model' },
					[ el( MediaUpload, {
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
					el( 'span', {className: 'embed-stl-media-desc'}, attributes.mediaDesc)
					]
				),
				el(
					'div',
					{ id: 'stl-preview-' + attributes.blockID }
				)
			);
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
