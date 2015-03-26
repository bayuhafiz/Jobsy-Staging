(function($) {

    'use strict';

    // Initialize a basic dataTable with row selection option
    var initBasicTable = function() {

        var table = $('#basicTable');

        var settings = {
            "sDom": "t",
            "sPaginationType": "bootstrap",
            "destroy": true,
            "paging": false,
            "scrollCollapse": true,
            "aoColumnDefs": [{
                'bSortable': false,
                'aTargets': [0]
            }],
            "order": [
                [1, "desc"]
            ]

        };

        table.dataTable(settings);

        $('#basicTable input[type=checkbox]').click(function() {
            if ($(this).is(':checked')) {
                $(this).closest('tr').addClass('selected');
            } else {
                $(this).closest('tr').removeClass('selected');
            }

        });

    }

    // Initialize a dataTable having bootstrap's stripes style
    var initStripedTable = function() {

        var table = $('#stripedTable');

        var settings = {
            "sDom": "t",
            "sPaginationType": "bootstrap",
            "destroy": true,
            "paging": false,
            "scrollCollapse": true

        };
        table.dataTable(settings);

    }

    // Initialize a dataTable with collapsible rows to show more details
    var initDetailedViewTable = function() {
        var table = $('#detailedTable');

        table.DataTable({
            "sDom": "t",
            "scrollCollapse": true,
            "paging": false,
            "bSort": false
        });

        // Add event listener for opening and closing details
        $('#detailedTable tbody').on('click', 'tr', function() {
            
            var _format = function(d) {
                // `d` is the original data object for the row
                return '<table id="appTable" class="table table-inline">' +
                    '<thead>' +
                    '<tr>' +
                    '<th>Name</th>' +
                    '<th>Email</th>' +
                    '<th>Applied</th>' +
                    '<th>Details</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                    '</tbody>' +
                    '</table>';
            }

            var tr = $(this).closest('tr');
            var row = table.DataTable().row(tr);

            //var row = $(this).parent()
            if ($(this).hasClass('shown') && $(this).next().hasClass('row-details')) {
                $(this).removeClass('shown');
                $(this).next().remove();
                return;
            }

            $(this).parents('tbody').find('.shown').removeClass('shown');
            $(this).parents('tbody').find('.row-details').remove();

            row.child(_format(row.data())).show();
            tr.addClass('shown');
            tr.next().addClass('row-details');

            // Load list of applicants
            var id = $(this).attr('data-id');
            $.ajax({
                dataType: "json",
                url: "/api/job/app/" + id,
                success: function(data) {
                    $.each(data, function(i) {
                        var dataHtml = '<tr>' +
                            '<td>' + data[i].firstName + ' ' + data[i].lastName + '</td>' +
                            '<td>' + data[i].email + '</td>' +
                            '<td>' + moment(data[i].applyDate).startOf('minute').fromNow() + '</td>' +
                            '<td><a data-target="#appDetails" data-toggle="modal" href="#">Click Here</a></td>' +
                            '</tr>';

                        $('#appTable').append(dataHtml);
                    });

                }
            });

        });

    }

    // Initialize a condensed table which will truncate the content 
    // if they exceed the cell width
    var initCondensedTable = function() {
        var table = $('#condensedTable');

        var settings = {
            "sDom": "t",
            "sPaginationType": "bootstrap",
            "destroy": true,
            "paging": false,
            "scrollCollapse": true
        };

        table.dataTable(settings);
    }

    initBasicTable();
    initStripedTable();
    initDetailedViewTable();
    initCondensedTable();

})(window.jQuery);
