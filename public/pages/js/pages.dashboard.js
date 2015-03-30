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

    // ===================== SHOW USER JOBS FUNCTION ============================
    var showJobs = function(apiUrl, condition) {
        var dataHtml = '';
        var delCounter = 0;
        var pauCounter = 0;
        var pubCounter = 0;

        $('#job-table-content').html(''); // Dummy clear the job table


        $.ajax({
            dataType: "json",
            url: apiUrl,
            success: function(data) {
                if (data.length > 0) {
                    $.each(data, function(i) {
                        if (data[i].status == 'deleted') {
                            delCounter = delCounter + 1; // Count deleted job
                        } else if (data[i].status == 'paused') {
                            pauCounter = pauCounter + 1; // Count paused job
                        } else if (data[i].status == 'published') {
                            pubCounter = pubCounter + 1; // Count published job
                        }

                        if (condition == 'hide') { // if condition is 'hide deleted'
                            if (data[i].status != 'deleted') {
                                dataHtml += '<tr data-id="' + data[i]._id + '" class="applyDetail">' +
                                    '<td class="v-align-middle">' +
                                    '<span class="job-applicant">' +
                                    '<span class="semi-bold">' + data[i].details.jobTitle + '</span>';
                                if (data[i].newApp > 0) {
                                    dataHtml += ' &nbsp;<span class="badge badge-danger">' + data[i].newApp;
                                }
                                dataHtml += '</span>' +
                                    '</td>' +
                                    '<td class="v-align-middle text-center">';
                                if (data[i].status == 'paused') {
                                    dataHtml += '<span class="label label-warning hidden-xs">PAUSED</span>' +
                                        '<i class="fa fa-pause fs-18 visible-xs" style="color: #eac459; font-size: 1.1em;"></i>';
                                } else if (data[i].status == 'published') {
                                    dataHtml += '<span class="label label-success hidden-xs">PUBLISHED</span>' +
                                        '<i class="fa fa-check fs-18 visible-xs" style="color: #10cfbd; font-size: 1.5em;"></i>';
                                }
                                dataHtml += '</td>' +
                                    '<td class="v-align-middle text-center hidden-xs">#</td>' +
                                    '<td class="v-align-middle text-center hidden-xs hidden-sm">' + data[i].app + '</td>' +
                                    '<td class="v-align-middle text-center">' +
                                    '<div class="btn-group btn-group-justified">';
                                if (data[i].status == 'published') {
                                    dataHtml += '<div class="btn-group">' +
                                        '<a href="#" id="editButton" data-target="#EditJob" data-toggle="modal" class="btn btn-default ">' +
                                        '<span class="p-t-5 p-b-5"><i class="fa fa-pencil fs-15"></i></span>' +
                                        '</a>' +
                                        '</div>';
                                    dataHtml += '<div class="btn-group hidden-xs">' +
                                        '<a href="/job/stat/' + data[i]._id + '" id="pauseButton" class="btn btn-default">' +
                                        '<span class="p-t-5 p-b-5"><i class="fa fa-pause fs-15"></i></span>' +
                                        '</a>' +
                                        '</div>';
                                    dataHtml += '<div class="btn-group">' +
                                        '<a href="/job/del/' + data[i]._id + '" id="deleteButton" class="btn btn-default">' +
                                        '<span class="p-t-5 p-b-5"><i class="fa fa-times fs-15"></i></span>' +
                                        '</a>' +
                                        '</div>';
                                } else if (data[i].status == 'paused') {
                                    dataHtml += '<div class="btn-group">' +
                                        '<a href="#" id="editButton" data-target="#EditJob" data-toggle="modal" class="btn btn-default ">' +
                                        '<span class="p-t-5 p-b-5"><i class="fa fa-pencil fs-15"></i></span>' +
                                        '</a>' +
                                        '</div>';
                                    dataHtml += '<div class="btn-group hidden-xs">' +
                                        '<a href="/job/stat/' + data[i]._id + '" id="publishButton" class="btn btn-default">' +
                                        '<span class="p-t-5 p-b-5"><i class="fa fa-play fs-15"></i></span>' +
                                        '</a>' +
                                        '</div>';
                                    dataHtml += '<div class="btn-group">' +
                                        '<a href="/job/del/' + data[i]._id + '" id="deleteButton" class="btn btn-default">' +
                                        '<span class="p-t-5 p-b-5"><i class="fa fa-times fs-15"></i></span>' +
                                        '</a>' +
                                        '</div>';
                                }

                                dataHtml += '</div>' +
                                    '</td>' +
                                    '</tr>'; // Show only published job
                            }
                        } else if (condition == 'show') { // if the condition is 'show deleted'
                            dataHtml += '<tr data-id="' + data[i]._id + '" class="applyDetail">' +
                                '<td class="v-align-middle">' +
                                '<span class="job-applicant">' +
                                '<span class="semi-bold">' + data[i].details.jobTitle + '</span>';
                            if (data[i].newApp > 0) {
                                dataHtml += ' &nbsp;<span class="badge badge-danger">' + data[i].newApp;
                            }
                            dataHtml += '</span>' +
                                '</td>' +
                                '<td class="v-align-middle text-center">';
                            if (data[i].status == 'deleted') {
                                dataHtml += '<span class="label label-important hidden-xs" data-toggle="tooltip" data-original-title="Deleted on ' + data[i].updatedAt + '">DELETED</span>' +
                                    '<i class="fa fa-times fs-18 visible-xs" style="color: #f55753; font-size: 1.5em;"></i>';
                            } else if (data[i].status == 'paused') {
                                dataHtml += '<span class="label label-warning hidden-xs">PAUSED</span>' +
                                    '<i class="fa fa-pause fs-18 visible-xs" style="color: #eac459; font-size: 1.1em;"></i>';
                            } else if (data[i].status == 'published') {
                                dataHtml += '<span class="label label-success hidden-xs">PUBLISHED</span>' +
                                    '<i class="fa fa-check fs-18 visible-xs" style="color: #10cfbd; font-size: 1.5em;"></i>';
                            }
                            dataHtml += '</td>' +
                                '<td class="v-align-middle text-center hidden-xs">#</td>' +
                                '<td class="v-align-middle text-center hidden-xs hidden-sm">' + data[i].app + '</td>' +
                                '<td class="v-align-middle text-center">' +
                                '<div class="btn-group btn-group-justified">';
                            if (data[i].status == 'published') {
                                dataHtml += '<div class="btn-group">' +
                                    '<a href="#" id="editButton" data-target="#EditJob" data-toggle="modal" class="btn btn-default ">' +
                                    '<span class="p-t-5 p-b-5"><i class="fa fa-pencil fs-15"></i></span>' +
                                    '</a>' +
                                    '</div>';
                                dataHtml += '<div class="btn-group hidden-xs">' +
                                    '<a href="/job/stat/' + data[i]._id + '" id="pauseButton" class="btn btn-default">' +
                                    '<span class="p-t-5 p-b-5"><i class="fa fa-pause fs-15"></i></span>' +
                                    '</a>' +
                                    '</div>';
                                dataHtml += '<div class="btn-group">' +
                                    '<a href="/job/del/' + data[i]._id + '" id="deleteButton" class="btn btn-default">' +
                                    '<span class="p-t-5 p-b-5"><i class="fa fa-times fs-15"></i></span>' +
                                    '</a>' +
                                    '</div>';
                            } else if (data[i].status == 'paused') {
                                dataHtml += '<div class="btn-group">' +
                                    '<a href="#" id="editButton" data-target="#EditJob" data-toggle="modal" class="btn btn-default ">' +
                                    '<span class="p-t-5 p-b-5"><i class="fa fa-pencil fs-15"></i></span>' +
                                    '</a>' +
                                    '</div>';
                                dataHtml += '<div class="btn-group hidden-xs">' +
                                    '<a href="/job/stat/' + data[i]._id + '" id="publishButton" class="btn btn-default">' +
                                    '<span class="p-t-5 p-b-5"><i class="fa fa-play fs-15"></i></span>' +
                                    '</a>' +
                                    '</div>';
                                dataHtml += '<div class="btn-group">' +
                                    '<a href="/job/del/' + data[i]._id + '" id="deleteButton" class="btn btn-default">' +
                                    '<span class="p-t-5 p-b-5"><i class="fa fa-times fs-15"></i></span>' +
                                    '</a>' +
                                    '</div>';
                            } else if (data[i].status == 'deleted') {
                                dataHtml += '<div class="btn-group">' +
                                    '<a href="/job/del/' + data[i]._id + '" id="restoreButton" class="btn btn-default ">' +
                                    '<span class="p-t-5 p-b-5">' +
                                    '<i class="fa fa-undo fs-15"></i>' +
                                    '</span>' +
                                    '</a>' +
                                    '</div>';
                            }


                            dataHtml += '</div>' +
                                '</td>' +
                                '</tr>';
                        }
                    });


                    $('#job-table-content').append(dataHtml).hide().show('slow');

                    // Set the job post counter
                    if (data.length > 1) {
                        var s = 's';
                    } else {
                        var s = '';
                    }

                    if (delCounter > 0) {
                        var del = '<span class="h5 font-montserrat bold text-danger">' + delCounter + ' deleted</span>';
                    } else {
                        var del = '';
                    }

                    if (pauCounter > 0) {
                        var pau = '<span class="h5 font-montserrat bold text-warning">' + pauCounter + ' paused</span>';
                    } else {
                        var pau = '';
                    }

                    if (pubCounter > 0) {
                        var pub = '<span class="h5 font-montserrat bold text-success">' + pubCounter + ' published</span>';
                    } else {
                        var pub = '';
                    }

                    ////// begin ',' and '&' logic /////
                    if (pub != '') {
                        if (pau != '') {
                            if (del != '') {
                                pub += ', ';
                                pau += ' & ';
                            } else {
                                pub += ' & ';
                            }
                        } else {
                            if (del != '') {
                                pub += ' & ';
                            } else {
                                pub += '';
                            }
                        }
                    } else { // if pub is empty
                        if (pau != '') {
                            if (del != '') {
                                pau += ' & ';
                            } else {
                                pau += '';
                            }
                        } else {
                            if (del != '') {
                                pau += '';
                            } else {
                                pub += 'no';
                            }
                        }
                    }

                    // Show them up!
                    $('#job-counter').html('You have ' + pub + pau + del + ' job post' + s);

                } else { // if no job post at all
                    $('#no-job-post').show('slow');
                }


            }
        });
    }


    /* ============== DETAILS APP FUNCTION ==========================
    ==============================================================*/
    $('body').on('click', '#appDetailsButton', function() {
        $('#appDetailsCloseBtn').removeAttr('onClick'); // dummy clean button's onClick attribute
        $('#seeDetailApplicant div.modal-body form').html();

        var dataHtml = '';
        var appId = $(this).parent().parent().attr('data');
        $.ajax({
            dataType: "json",
            url: "/api/job/app/" + appId,
            success: function(data) {
                if (data) {
                    $.each(data, function(i) {
                        dataHtml = '<div class="form-group">' +
                            '<label for="fname" class="col-sm-3 control-label">Full Name</label>' +
                            '<div class="col-sm-9">' + data[i].firstName + ' ' + data[i].lastName + '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                            '<label for="fname" class="col-sm-3 control-label">Email</label>' +
                            '<div class="col-sm-9">' + data[i].email + '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                            '<label for="fname" class="col-sm-3 control-label">Phone</label>' +
                            '<div class="col-sm-9">' + data[i].phone + '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                            '<label for="fname" class="col-sm-3 control-label">Location</label>' +
                            '<div class="col-sm-9">' + data[i].location + '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                            '<label for="fname" class="col-sm-3 control-label">Apply Date</label>' +
                            '<div class="col-sm-9">' + moment(data[i].applyDate).format('dddd, DD MMMM YYYY') + '</div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                            '<label for="fname" class="col-sm-3 control-label">Cover Letter</label>' +
                            '<div class="col-sm-9">' + data[i].coverLetter + '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                            '<label for="fname" class="col-sm-3 control-label">Resume File</label>' +
                            '<div class="col-sm-9">' +
                            '<a class="btn btn-success" href="uploads/resume/' + data[i].resumeFile + '" target="_blank"><i class="fa fa-arrow-down"></i> Download</a>' +
                            '</div>';
                    });
                }

                $('#appDetailsCloseBtn').attr('onClick', 'location.href=\'/job/app/' + appId + '\'');
                $('#seeDetailApplicant div.modal-body form').html(dataHtml);

            }
        });
    });


    /* ============== EDIT JOB FUNCTION ==========================
    ==============================================================*/
    $('body').on('click', '#editButton', function() {
        var dataHtml = '';
        var id = $(this).parent().parent().parent().parent().attr('data-id');

        $.ajax({
            dataType: "json",
            url: "/api/job/edit/" + id,
            success: function(data) {
                if (data) {
                    var img = 'uploads/logo/' + data.profile.logo;
                    $('#EditJob div.panel form#form-edit input#oldJobImg').attr('value', data.profile.logo);
                    $('#EditJob div.panel form#form-edit img#editJobImg-preview').attr('src', img);
                    $('#EditJob div.panel form#form-edit input.companyName').attr('value', data.profile.name);
                    $("#EditJob div.panel form#form-edit select#location").val(data.profile.location);
                    $('#EditJob div.panel form#form-edit textarea.description-text').parent().children('div.note-editor').children('.note-editable').html(data.profile.description);
                    $('#EditJob div.panel form#form-edit input.jobTitle').attr('value', data.details.jobTitle);
                    $('#EditJob div.panel form#form-edit select#category').val(data.details.category);
                    $('#EditJob div.panel form#form-edit input#jobType').val(data.details.jobType);
                    $('#EditJob div.panel form#form-edit textarea.jobScope-text').parent().children('div.note-editor').children('.note-editable').html(data.details.jobScope);
                    $('#EditJob div.panel form#form-edit textarea.requirements-text').parent().children('div.note-editor').children('.note-editable').html(data.details.requirements);


                    if ((data.details.currency == 'IDR') || (data.details.currency == 'idr')) {
                        $('#EditJob div.panel form#form-edit select.currency').append($("<option selected='selected'></option>").val('idr').html("IDR"));
                        $('#EditJob div.panel form#form-edit select.currency').append($("<option></option>").val('usd').html("USD"));
                    } else if ((data.details.currency == 'USD') || (data.details.currency == 'usd')) {
                        $('#EditJob div.panel form#form-edit select.currency').append($("<option></option>").val('idr').html("IDR"));
                        $('#EditJob div.panel form#form-edit select.currency').append($("<option selected='selected'></option>").val('usd').html("USD"));
                    };

                    $('#EditJob div.panel form#form-edit input.salaryFrom').attr('value', data.details.salaryFrom);
                    $('#EditJob div.panel form#form-edit input.salaryTo').attr('value', data.details.salaryTo);

                    $('#EditJob div.panel form#form-edit input.companyName').attr('value', data.profile.name);


                    if (data.details.salaryType == 'Monthly') {
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option selected='selected'></option>").val('Monthly').html("Monthly"));
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option></option>").val('Annually').html("Annually"));
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option></option>").val('Daily').html("Daily"));
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option></option>").val('Hourly').html("Hourly"));
                    } else if (data.details.salaryType == 'Annually') {
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option></option>").val('Monthly').html("Monthly"));
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option selected='selected'></option>").val('Annually').html("Annually"));
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option></option>").val('Daily').html("Daily"));
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option></option>").val('Hourly').html("Hourly"));
                    } else if (data.details.salaryType == 'Daily') {
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option></option>").val('Monthly').html("Monthly"));
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option></option>").val('Annually').html("Annually"));
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option selected='selected'></option>").val('Daily').html("Daily"));
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option></option>").val('Hourly').html("Hourly"));
                    } else if (data.details.salaryType == 'Hourly') {
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option></option>").val('Monthly').html("Monthly"));
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option></option>").val('Annually').html("Annually"));
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option></option>").val('Daily').html("Daily"));
                        $('#EditJob div.panel form#form-edit select.salaryType').append($("<option selected='selected'></option>").val('Hourly').html("Hourly"));
                    };


                    $('#EditJob div.panel form#form-edit').attr('action', '/update/' + data._id);

                }

                //$('#appDetailsCloseBtn').attr('onClick', 'location.href=\'/job/app/' + dataId + '\'');

            }

        });


        function readURL(input) {
            // read logo file being uploaded
            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function(e) {
                    $('#editJobImg-preview').attr('src', e.target.result);
                }

                reader.readAsDataURL(input.files[0]);
            }
        }
        $("#editJobImg").change(function() {
            readURL(this);
        });

    });



    // Initialize a dataTable with collapsible rows to show more details
    var initDetailedViewTable = function() {

        var _format = function(d) {
            // `d` is the original data object for the row
            return '<table id="appTable" class="table table-inline">' +
                '<thead>' +
                '<tr>' +
                '<th>Name</th>' +
                '<th>Email</th>' +
                '<th>Applied</th>' +
                '<th></th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                '</tbody>' +
                '</table>';
        }

        var table = $('#detailedTable');

        table.DataTable({
            "sDom": "t",

            "scrollCollapse": true,
            "paging": false,
            "bSort": false
        });

        // Add event listener for opening and closing details
        $('#detailedTable tbody').on('click', 'tr.applyDetail td:not(:last-child)', function() {

            var tr = $(this).closest('tr');
            var row = table.DataTable().row(tr);

            if (tr.hasClass('shown') && tr.next().hasClass('row-details')) {
                tr.removeClass('shown');
                tr.next().remove();
                return;
            }

            $(this).parents('tbody').find('.shown').removeClass('shown');
            $(this).parents('tbody').find('.row-details').remove();

            row.child(_format(row.data())).show();
            tr.addClass('shown');
            tr.next().addClass('row-details');

            // Load list of applicants
            /*var id = tr.attr('data-id');

            $.ajax({
                dataType: "json",
                url: "/api/job/apps/" + id,
                success: function(data) {
                    if (data.length > 0) {
                        $.each(data, function(i) {
                            if (data[i].read == false) {
                                var dataHtml = '<tr data="' + data[i]._id + '">' +
                                    '<td>' + data[i].firstName + ' ' + data[i].lastName + ' <span class="badge badge-primary hint-text new-details">new</span></td>' +
                                    '<td>' + data[i].email + '</td>' +
                                    '<td>' + moment(data[i].applyDate).startOf('minute').fromNow() + '</td>' +
                                    '<td><button type="button" id="appDetailsButton" app-id="' + data[i]._id + '" class="btn btn-default p-l-10 p-r-10" data-toggle="modal" data-target="#seeDetailApplicant"><i class="fa fa-search fs-15"></i> See Details</button></td>' +
                                    '</tr>';
                            } else if (data[i].read == true) {
                                var dataHtml = '<tr data="' + data[i]._id + '">' +
                                    '<td>' + data[i].firstName + ' ' + data[i].lastName + '</td>' +
                                    '<td>' + data[i].email + '</td>' +
                                    '<td>' + moment(data[i].applyDate).startOf('minute').fromNow() + '</td>' +
                                    '<td><button type="button" id="appDetailsButton" app-id="' + data[i]._id + '" class="btn btn-default p-l-10 p-r-10" data-toggle="modal" data-target="#seeDetailApplicant"><i class="fa fa-search fs-15"></i> See Details</button></td>' +
                                    '</tr>';
                            }
                            $('#appTable').append(dataHtml);
                        });
                    } else {
                        $('#appTable').html('<div class="text-center hint-text">' +
                            '<h5>No applicants yet..</h5>' +
                            '</div>').hode().show('slow');
                    }


                }
            }); */

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

    //initBasicTable();
    //initStripedTable();
    initDetailedViewTable();
    //initCondensedTable();



    $(document).ready(function() {
        var uEmail = $('#user-email').val(); // Get logged user email

        // initiate user jobs list
        showJobs('/api/jobs/' + uEmail, 'hide');

        // 'show deleted job' radio button action
        $("input:radio[name=hide-radio]").click(function() {
            var value = $(this).val();
            showJobs('/api/jobs/' + uEmail, value);
        });


    });

})(window.jQuery);
