/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlightediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import HighlightCommand from './highlightcommand';

import { downcastAttributeToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

const HIGHLIGHT = 'highlight';

const ElementSymbol = Symbol( 'Element' );

/**
 * The highlight editing feature. It introduces the {@link module:highlight/highlightcommand~HighlightCommand command} and the `highlight`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<mark>` element with a `class` attribute (`<mark class="marker-green">...</mark>`) depending
 * on the {@link module:highlight/highlight~HighlightConfig configuration}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HighlightEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'highlight', {
			options: [
				{
					model: 'yellowMarker',
					class: 'marker-yellow',
					title: 'Yellow marker',
					color: 'var(--ck-highlight-marker-yellow)',
					type: 'marker'
				},
				{
					model: 'greenMarker',
					class: 'marker-green',
					title: 'Green marker',
					color: 'var(--ck-highlight-marker-green)',
					type: 'marker'
				},
				{
					model: 'pinkMarker',
					class: 'marker-pink',
					title: 'Pink marker',
					color: 'var(--ck-highlight-marker-pink)',
					type: 'marker'
				},
				{
					model: 'blueMarker',
					class: 'marker-blue',
					title: 'Blue marker',
					color: 'var(--ck-highlight-marker-blue)',
					type: 'marker'
				},
				{
					model: 'redPen',
					class: 'pen-red',
					title: 'Red pen',
					color: 'var(--ck-highlight-pen-red)',
					type: 'pen'
				},
				{
					model: 'greenPen',
					class: 'pen-green',
					title: 'Green pen',
					color: 'var(--ck-highlight-pen-green)',
					type: 'pen'
				}
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow highlight attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: HIGHLIGHT} );
		
		editor.conversion.for( 'dataDowncast' )
			.add( downcastAttributeToElement( { model: HIGHLIGHT, view: _createElement } ) );

		editor.conversion.for( 'editingDowncast' )
			.add( downcastAttributeToElement( { model: HIGHLIGHT, view: ( color, writer ) => {
				return _createElement( color, writer );
			} } ) );

		editor.conversion.attributeToElement( {
			model: HIGHLIGHT,
				view: {
					name: 'font',
					styles: {
						'color': true
					},
					priority: 5,
					model: {
						key: 'highlight',
						value: viewElement => viewElement.getAttribute( 'color' )
					},
					type:'pen'
				}
		} );
		/*
		editor.conversion.for( 'upcast' )
			.add( upcastElementToAttribute( {
				model: HIGHLIGHT,
				view: {
					name: 'font',
					styles: {
						'color': viewElement => viewElement.getAttribute( 'color' )
					}
				}
			} ) );
	*/
		//editor.config.get( 'highlight.options' );

		// Set-up the two-way conversion.
		//editor.conversion.attributeToElement( _buildDefinition( options ) );

		editor.commands.add( 'highlight', new HighlightCommand( editor ) );
	}
}

// Converts the options array to a converter definition.
//
// @param {Array.<module:highlight/highlight~HighlightOption>} options An array with configured options.
// @returns {module:engine/conversion/conversion~ConverterDefinition}
function _buildDefinition( options ) {
	const definition = {
		model: {
			key: 'highlight',
			values: []
		},
		view: {}
	};

	for ( const option of options ) {
		definition.model.values.push( option.model );
		definition.view[ option.model ] = {
			name: 'font',
			styles: {
				'color': option.color
			},
			priority: 5
			//classes: option.class
		};
	}

	return definition;
}

function _createElement( color, writer ) {
	// Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
	const Element = writer.createAttributeElement( 'font', { styles : { 'color': color} }, { priority: 5 } );
	writer.setCustomProperty( ElementSymbol, true, Element );

	return Element;
}


