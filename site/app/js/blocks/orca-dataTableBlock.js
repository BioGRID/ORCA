
/**
 * Javascript Bindings that apply to management and creation of 
 * jquery datatables instances
 */
 
(function( yourcode ) {

	yourcode( window.jQuery, window, document );

} (function( $, window, document ) {
	
	$.orcaDataTableBlock = function( el, options ) {
	
		var base = this;
		base.$el = $(el);
		base.el = el;
		
		base.data = { 
			id: base.$el.attr( "id" ),
			baseURL: $("head base").attr( "href" ),
			checkedBoxes: { }
		};
		
		/**
		 * Common Components
		 */
		
		base.components = { 
			table: base.$el.find( ".orcaDataTable" ),
			filterOutput: base.$el.find( ".orcaDataTableFilterOutput" ),
			filterSubmit: base.$el.find( ".orcaDataTableFilterSubmit" ),
			filterText: base.$el.find( ".orcaDataTableFilterText" ),
			tableRowCount: base.$el.find( ".orcaRowCount" ),
			toolbar: base.$el.find( ".orcaDataTableToolbar" ),
			advancedSearch: base.$el.find( ".orcaDataTableAdvancedSearch" ),
			advancedToggle: base.$el.find( ".orcaDataTableAdvancedToggle" ),
			globalSearchBox: base.$el.find( ".orcaDataTableFilterBox" ),
			advancedSearchBtn: base.$el.find( ".submitAdvancedSearchBtn" )
		};
		
		base.$el.data( "orcaDataTableBlock", base );
		
		/** 
		 * Setup basic structure and functionality of the 
		 * ORCA DataTable Block
		 */
		 
		base.init = function( ) {
			base.options = $.extend( {}, $.orcaDataTableBlock.defaultOptions, options );
			base.initializeTable( );
		};
		
		/**
		 * Grab the set of columns that will be displayed
		 * for this table
		 */
		
		base.fetchCols = function( ) {
			
			var submitSet = { 'tool' : base.options.colTool };
			$.extend( submitSet, base.options.addonParams );
			submitSet = JSON.stringify( submitSet );
			
			return $.ajax({
				
				url: base.data.baseURL + "/scripts/datatableTools.php",
				data: {"expData" : submitSet},
				method: "POST",
				dataType: "json"
				
			});
			
		};
		
		/**
		 * Setup the functionality of several tools that only
		 * apply when a datatable has been instantiated.
		 */
		
		base.initializeTools = function( ) {
			
			// SETUP Global Filter
			// By Button Click
			base.components.filterSubmit.click( function( ) {
				base.filterGlobal( base.components.filterText.val( ), true, false ); 
			});
			
			// By Pressing the Enter Key
			base.components.filterText.keyup( function( e ) {
				if( e.keyCode == 13 ) {
					base.filterGlobal( base.components.filterText.val( ), true, false ); 
				}
			});
			
			// Setup Check All Button on Toolbar
			if( base.options.hasToolbar ) {
				base.components.toolbar.find( ".orcaDataTableCheckAll" ).click( function( ) {
					var statusText = $(this).attr( "data-status" );
					
					if( statusText == "check" ) {
						base.setCheckAllStatus( "uncheck", true );
					} else if( statusText == "uncheck" ) {
						base.setCheckAllStatus( "check", false );
					}
					
				});
			}
			
			// Setup storage of checked boxes
			base.components.table.on( "change", ".orcaDataTableRowCheck", function( ) {
				if( $(this).prop( "checked" ) ) {
					base.data.checkedBoxes[$(this).val( )] = true;
				} else {
					base.data.checkedBoxes[$(this).val( )] = false;
				}
			});
			
			// Setup Advanced Toggle
			if( base.options.hasAdvanced ) {
				base.components.advancedToggle.click( function( ) {
					base.components.advancedSearch.toggle( );
					base.components.globalSearchBox.toggle( );
				});
			}
			
			// Setup Advanced Submit Button
			if( base.options.hasAdvanced ) {
				base.components.advancedSearchBtn.click( function( ) {
					base.processAdvancedSearches( true );
				});
			}
			
		};
		
		/**
		 * Setup the basic datatable functionality 
		 * table with the ability to load data as required
		 */
		
		base.initializeTable = function( ) {
			
			$.when( base.fetchCols( ) ).then( function( data, textStatus, jqXHR ) {
				
				var datatable = base.components.table.DataTable({
					processing: true,
					serverSide: true,
					columns: data,
					pageLength: base.options.pageLength,
					deferRender: true,
					order: [base.options.sortCol,base.options.sortDir],
					language: {
						processing: "Loading Data... <i class='fa fa-spinner fa-pulse fa-lg'></i>"
					},
					ajax : {
						url: base.data.baseURL + "/scripts/datatableTools.php",
						type: 'POST',
						data: function( d ) {  
							d.tool = base.options.rowTool;
							d.totalRecords = base.components.tableRowCount.val( );
							d.checkedBoxes = base.data.checkedBoxes;
							$.extend( d, base.options.addonParams );
							d.expData = JSON.stringify( d );
						}
					},
					infoCallback: function( settings, start, end, max, total, pre ) {
						base.components.filterOutput.html( pre );
					},
					dom : "<'row'<'col-sm-12'rt>><'row'<'col-sm-5'i><'col-sm-7'p>>"
						
				});
				
				base.initializeTools( );
				base.options.optionsCallback( datatable );
				
			});
				
		};
		
		/**
		 * Search the table via the global filter
		 */
		
		base.filterGlobal = function( filterVal, isRegex, isSmartSearch ) {
			base.components.table.DataTable( ).search( filterVal, isRegex, isSmartSearch, true ).draw( );
		};
		
		/**
		 * Search the table via a column specific filter
		 */
		 
		base.filterColumn = function( filterVal, columnIndex, isRegex, isSmartSearch ) {
			base.components.table.DataTable( ).column(columnIndex).search( filterVal, isRegex, isSmartSearch, true );
		};
		
		/**
		 * Reset all filters on every single column
		 */
		 
		base.resetAllFilters = function( ) {
			
			// Reset each column
			datatable = base.components.table.DataTable( )
			datatable.columns( ).every( function( ) {
				this.search( '' );
			});
			
			// Reset Global
			datatable.search( '' );
			
		};
		
		/**
		 * Step through all the advanced search options
		 * and process them as required
		 */
		 
		base.processAdvancedSearches = function( toDraw ) {
	
			// Reset current filters
			base.resetAllFilters( );
			
			// Step through existing fields and process each
			// correctly by type
			base.components.advancedSearch.find( ".orcaAdvancedField" ).each( function( ) {
				searchData = base.fetchAdvancedSearchFieldData( $(this) );
				if( searchData ) {
					base.filterColumn( JSON.stringify( searchData["data"] ), searchData["column"], true, false );
				}
			});
	
			if( toDraw ) {
				base.components.table.DataTable( ).draw( );
			}
	
		};
		
		/**
		 * Fetch data from advanced search field, based on its type
		 */
		 
		base.fetchAdvancedSearchFieldData = function( field ) {
			
			var fieldType = field.data( 'type' ).toUpperCase( );
			var column = "";
			var searches = [];
			
			if( fieldType == "TEXT" ) {
				
				// Contains only a single text field
				var inputField = field.find( "input[type=text]" );
				var query = inputField.val( );
				column = inputField.data( "column" );
				
				// Split phrases broken by vertical pipe
				query = query.split( "|" );
				for( var i = 0; i < query.length; i++ ) {
					searches.push( { "query" : query[i] } );
				}
				
			} else if( fieldType == "NUMERICRANGE" ) {
				
				// Contains 2 text fields for Minimum and Maximum range
				field.find( "input[type=text]" ).each( function( ) {
					var query  = $(this).val( );
					column = $(this).data( "column" );
					var range = $(this).data( "range" );
					
					if( query.length > 0 ) { 
						searches.push( { "query" : query, "range" : range.toUpperCase( ) } );
					}
					
				});
		
			}
			
			if( searches.length > 0 ) {
				return { "data" : searches, "column" : column };
			}
			
			return false;
			
		};		
		
		/**
		 * Set the check all button status to the values passed in
		 */
		 
		base.setCheckAllStatus = function( statusText, propVal ) {
			base.components.table.find( ".orcaDataTableRowCheck:enabled" ).prop( "checked", propVal );
			base.components.toolbar.find( ".orcaDataTableCheckAll" ).attr( "data-status", statusText );
		};
		
		base.updateOption = function( optionName, optionValue ) {
			base.options[optionName] = optionValue;
		};
		
		base.init( );
	
	};

	$.orcaDataTableBlock.defaultOptions = { 
		sortCol: 0,
		sortDir: "ASC",
		pageLength: 100,
		colTool: "",
		rowTool: "",
		addonParams: { },
		hasToolbar: false,
		hasAdvanced: false
	};

	$.fn.orcaDataTableBlock = function( options ) {
		return this.each( function( ) {
			(new $.orcaDataTableBlock( this, options ));
		});
	};
	
}));