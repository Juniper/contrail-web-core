/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

function collapseAll() {
	$("div.accordion-body").each(function(i, element) {
		$(element).collapse('hide');
	});
};

function expandAll() {
	$("div.accordion-body").each(function(i, element) {
		$(element).collapse('show');
	});
};

function wrap() {
	$("pre").css("white-space", "pre-wrap");
};

function noWrap() {
	$("pre").css("white-space", "pre");
};


/* Table initialisation */
$(document).ready(function() {
	var $table = $('#struct-or-list-table');
	if($table) {
		$table.dataTable({
			"sDom": "<'row-fluid'<'pull-left'l><'pull-left dt-margin-10'f>r>t<'row-fluid'<'pull-left'p><'pull-left dt-margin-10'i>>",
			"sPaginationType": "bootstrap",
			"oLanguage": {
				"sLengthMenu": "_MENU_ Records per Page"
			}
		});
	}
});