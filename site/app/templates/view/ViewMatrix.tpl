<div class='primaryContent'>
	<div class='container-fluid'>
		<h2>Matrix View <i class='fa fa-lg {{ VIEW_ICON }} primaryIcon'></i> </h2>
		<div class='subheadLarge'>The following is a matrix style representation of your experimental results.</div>
	</div>
</div>

<div id='viewDetailsWrap' class='greyBG marginTopSm paddingLg marginBotSm'>
	<div class='container-fluid'>
		<div class='pull-right'>
			<div class='viewDetail'><strong>Date Created: </strong> {{ VIEW_ADDEDDATE }}</div>
			<div class='viewDetail'><strong>Values Shown: </strong> {{ VIEW_VALUE }}</div>
			<div class='viewDetail'><strong>Generated By: </strong> {{ USER_NAME }}</div>
			{% if VIEW_STATE != "building" %}
				<div class='marginTopSm'><a href='{{ WEB_URL }}/View/Download?viewID={{ VIEW_ID }}' title='View Download'><button class='btn btn-orca2 btn-sm'><i class="fa fa-cloud-download fa-lg" style='color: #efbc2b'></i> Download View Data</button></a></div>
			{% endif %}
		</div>
		<h3>{{ VIEW_NAME }}</h3>
		<span id='addNewViewSubhead' class='subheadSmall'>{{ VIEW_DESC }}</span>
		{% if COL_LEGEND %}
			<div class='viewDetailFiles'><a class='showFileLegend'>View Files <i class='fa fa-angle-double-down'></i></a></div>
			<ul id='fileList' style='display: none;'>
			{% for COLUMN in COL_LEGEND %}
				<li><strong>{{ COLUMN.EXCEL_NAME }}: </strong> <a href='{{ WEB_URL }}/Files/View?id={{ COLUMN.FILE_ID }}' title='VIEW {{ COLUMN.FILE }}'>{{ COLUMN.FILE }}</a>,   <strong>Control: </strong> <a href='{{ WEB_URL }}/Files/View?id={{ COLUMN.BG_ID }}' title='VIEW {{ COLUMN.BG_FILE }}'>{{ COLUMN.BG_FILE }}</a></li>
			{% endfor %}
			</ul>
		{% endif %}
		{% if CAN_EDIT %}
			<div class='viewPermissions'><a class='showViewPermissions'>Edit Permissions <i class='fa fa-angle-double-down'></i></a></div>
		{% endif %}
	</div>
</div>

{% if CAN_EDIT %}
	{% include 'view/ViewPermissions.tpl' %}
{% endif %}

{% include 'blocks/ORCADataTableBlock.tpl' %}

<input type='hidden' id='viewID' name='viewID' value='{{ VIEW_ID }}' />
<input type='hidden' id='viewCode' name='viewCode' value='{{ VIEW_CODE }}' />
<input type='hidden' id='viewState' name='viewState' value='{{ VIEW_STATE }}' />
<input type='hidden' id='viewStyle' name='viewStyle' value='{{ VIEW_STYLE }}' />