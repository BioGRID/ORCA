<div id='datatableBlock' class='datatableBlock greyBG marginTopSm paddingLg marginBotSm'>
	<div class='container-fluid'>
		<div class='pull-right col-lg-3 col-md-4 col-sm-5 col-xs-6 orcaDataTableFilterBox' style='padding-right: 0'>
			<div class='input-group marginBotSm marginTopSm'>
				<input type="text" class="form-control orcaDataTableFilterText" placeholder="Enter Filter Term" value="" autofocus>
				<span class='input-group-btn'>
					<button class='btn btn-success orcaDataTableFilterSubmit'>Filter <i class='fa fa-check'></i></button>
					{% if SHOW_ADVANCED %}
						<button class='btn btn-danger orcaDataTableAdvancedToggle'><i class='fa fa-search-plus'></i></button>
					{% endif %}
				</span>
			</div>
		</div>
		<h3>{{ TABLE_TITLE }} </h3>
		<span class='subheadSmall orcaDataTableFilterOutput'></span>
		{% if SHOW_ADVANCED %}
			{% include 'blocks/ORCADataTableAdvancedSearch.tpl' %}
		{% endif %}
		<div class='col-lg-12 col-md-12 col-sm-12 col-xs-12 paddingLeftNone paddingRightNone orcaDataTableTools'>
			{% if SHOW_TOOLBAR %}
				{% include 'blocks/ORCADataTableToolbar.tpl' %}
			{% endif %}
			<table class='orcaDataTable table table-striped table-bordered table-responsive table-condensed {{ DATATABLE_CLASS }}' width="100%"></table>
		</div>
		<input type='hidden' class='orcaRowCount' value='{{ ROW_COUNT }}' />
	</div>
</div>