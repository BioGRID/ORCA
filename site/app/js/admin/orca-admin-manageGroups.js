
/**
 * Javascript Bindings that apply to management of permission groups
 * in the admin tools
 */
 
(function( yourcode ) {

	yourcode( window.jQuery, window, document );

} (function( $, window, document ) {
	
	var baseURL = $("head base").attr( "href" );

	$(function( ) {
		initializeFormValidation( );
		$(".datatableBlock").orcaDataTableBlock({ 
			sortCol: 0, 
			sortDir: "ASC", 
			pageLength: 100,
			colTool: "managePermissionsHeader", 
			rowTool: "managePermissionsRows", 
			optionsCallback: function( datatable ) {
				initializePermissionChangeOptions( datatable );
			}
		});
	});

	
	/**
	 * Setup the functionality of the permissions change radio buttons
	 */
	 
	function initializePermissionChangeOptions( datatable ) {
		
		$(".datatableBlock").on( "change", ".permissionChange", function( ) {
			
			var currentClick = $(this);
			var submitSet = { };
			
			submitSet['permission'] = $(this).attr( "data-permission" );
			submitSet['level'] = $(this).val( );
			submitSet['adminTool'] = "permissionLevelChange";
			
			//Convert to JSON
			submitSet = JSON.stringify( submitSet );
		
			$.ajax({
				url: baseURL + '/scripts/adminTools.php',
				type: 'POST',
				data: { 'expData': submitSet}, 
				dataType: 'json'
			}).done( function( results ) {
				
				if( results['STATUS'] == "SUCCESS" ) {
					alertify.success( results['MESSAGE'] );
					datatable.draw( false );
				} else {
					alertify.error( results['MESSAGE'] );
				}
			});
		});
		
	}
	
	/**
	 * Setup the validation for the add new permission form
	 */
	
	function initializeFormValidation( ) {
		
		var fieldVals = { };
		
		fieldVals['groupName'] = {
			validators: {
				notEmpty: {
					message: 'You must enter a permission name'
				}
			}
		};
		
		fieldVals['groupMembers'] = {
			validators: {
				notEmpty: {
					message: 'You must select at least one member for the group'
				}
			}
		};
			
		$("#addGroupForm").formValidation({
			framework: 'bootstrap',
			fields: fieldVals
		}).on( 'success.form.fv', function( e ) {
			e.preventDefault( );
			
			var $form = $(e.target),
				fv = $(e.target).data( 'formValidation' );
			
			submitAddNewGroup( );
				
		});
	}
	
	function submitAddNewGroup( ) {
		
		var formData = $("#addGroupForm").serializeArray( );
		var submitSet = { };
		
		// Get main form data
		$.each( formData, function( ) {
			submitSet[this.name] = this.value;
		});
		
		// Add type of tool
		submitSet['adminTool'] = "addGroup";
		
		// Get multiuser select
		submitSet['groupMembers'] = [];
		$("#groupMembers option:selected").each( function( ) {
			submitSet['groupMembers'].push( $(this).val( ) );
		})
				
		// Convert to JSON
		submitSet = JSON.stringify( submitSet );
		
		// Send via AJAX for submission to
		// database and placement of files
		$.ajax({
			url: baseURL + "/scripts/adminTools.php",
			type: "POST",
			data: {"expData" : submitSet},
			dataType: 'json',
			beforeSend: function( ) {
				$("#messages").html( "" );
			}
		}).done( function( data, textStatus, jqXHR ) {
			
			var alertType = "success";
			var alertIcon = "fa-check";
			if( data["STATUS"] == "ERROR" ) {
				alertType = "danger";
				alertIcon = "fa-warning";
				$("#addGroupForm").formValidation( 'disableSubmitButtons', false );
			} else if( data["STATUS"] == "SUCCESS" ) {
				$("#addGroupForm").trigger( "reset" );
				$("#addGroupForm").data('formValidation').resetForm( );
				$(".orcaDataTable").DataTable( ).draw( false );
			}
			
			$("#messages").html( '<div class="alert alert-' + alertType + '" role="alert"><i class="fa ' + alertIcon + ' fa-lg"></i> ' + data['MESSAGE'] + '</div></div>' );
			
		}).fail( function( jqXHR, textStatus, errorThrown ) {
			console.log( jqXHR );
			console.log( textStatus );
			$("#addGroupForm").formValidation( 'disableSubmitButtons', false );
		});
		
	}
	
}));