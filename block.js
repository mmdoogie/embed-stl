( function( blocks, editor, i18n, element, components, _ ) {
	var __ = i18n.__;
	var el = element.createElement;
	var RichText = editor.RichText;
	var MediaUpload = editor.MediaUpload;

	blocks.registerBlockType( 'embed-stl/embed-stl', {
		title: __( 'Embed STL'),
		icon: 'car',
		category: 'media',
		keywords: ['3d', 'model', 'stl'],
		
		attributes: {
			title: {
				type: 'array',
				source: 'children',
				selector: 'h2',
			},
			mediaID: {
				type: 'number',
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

			var onSelectImage = function( media ) {
				var stlpreview = new StlViewer(document.getElementById('stl-preview-' + attributes.blockID), {models: [{id: 0, filename:media.url}]});
				return props.setAttributes( {
					mediaURL: media.url,
					mediaID: media.id,
				} );
			};

			return el(
				'div',
				{ className: props.className },
				el( RichText, {
					tagName: 'h2',
					inline: true,
					placeholder: __('Display Title'),
					value: attributes.title,
					onChange: function( value ) {
						props.setAttributes( { title: value } );
					},
				} ),
				el(
					'div',
					{ className: 'selected-model' },
					el( MediaUpload, {
						onSelect: onSelectImage,
						allowedTypes: 'application/sla',
						value: attributes.mediaID,
						render: function( obj ) {
							return el(
								components.Button,
								{
									onClick: obj.open,
									variant: attributes.mediaID ? 'link' : 'primary',
								},
								attributes.mediaID ? attributes.mediaURL : __('Media Browser')
							);
						},
					} )
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
