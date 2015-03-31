(function($) {

    'use strict';

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

    // Date formatter function
    function localDate(date) {
        var result = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
        return result;
    }


    // ===================== SHOW USER JOBS FUNCTION ============================
    var showJobs = function(apiUrl) {
        var dataHtml = '';
        var delCounter = 0;
        var pauCounter = 0;
        var pubCounter = 0;

        $('#user-jobs-heading').nextAll().remove(); // Dummy clear the job table

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

                        dataHtml += '<div class="Row" data-id="' + data[i]._id + '">'; // Row container DIV start

                        // 1st column
                        dataHtml += '<div class="CellRow">' +
                            '<span style="display:inline-block;padding-right:5px;"><i class="fa fa-chevron-right"></i></span>' +
                            '<span class="semi-bold" style="display:inline-block">' + data[i].details.jobTitle + '</span>';
                        if (data[i].newApp > 0) {
                            dataHtml += ' &nbsp;<span class="badge badge-danger">' + data[i].newApp + '</span>';
                        }
                        dataHtml += '</div>';

                        // 2nd column
                        dataHtml += '<div class="CellRow">';
                        if (data[i].status == 'deleted') {
                            dataHtml += '<span class="label label-important hidden-xs" data-toggle="tooltip" data-original-title="Deleted on ' + data[i].updatedAt + '">DELETED</span>' +
                                '<i class="fa fa-times fs-18 visible-xs" style="color: #f55753; font-size: 1.5em;"></i>';
                        } else if (data[i].status == 'paused') {
                            dataHtml += '<span class="label label-warning hidden-xs" data-toggle="tooltip" data-original-title="Paused on ' + data[i].updatedAt + '">PAUSED</span>' +
                                '<i class="fa fa-pause fs-18 visible-xs" style="color: #f55753; font-size: 1.2em;"></i>';
                        } else if (data[i].status == 'published') {
                            dataHtml += '<span class="label label-success hidden-xs" data-toggle="tooltip" data-original-title="Paused on ' + data[i].updatedAt + '">PUBLISHED</span>' +
                                '<i class="fa fa-check fs-18 visible-xs" style="color: #f55753; font-size: 1.5em;"></i>';
                        }
                        dataHtml += '</div>';

                        // 3rd column
                        dataHtml += '<div class="CellRow">#</div>';

                        // 4th column
                        dataHtml += '<div class="CellRow hidden-xs hidden-sm">' + data[i].app + '</div>';

                        // Last column
                        dataHtml += '<div class="CellRow">';
                        if (data[i].status == 'published') {
                            dataHtml += '<a href="#" id="editButton" data-target="#EditJob" data-toggle="modal" style="color: #000;padding-right: 15px;">' +
                                '<span class="p-t-5 p-b-5"><i class="fa fa-pencil fs-15"></i></span>' +
                                '</a>';
                            dataHtml += '<a href="/job/stat/' + data[i]._id + '" id="pauseButton" style="color: #000;padding-right: 15px;">' +
                                '<span class="p-t-5 p-b-5"><i class="fa fa-pause fs-15"></i></span>' +
                                '</a>';
                            dataHtml += '<a href="/job/del/' + data[i]._id + '" id="deleteButton" style="color: #000;padding-right: 15px;">' +
                                '<span class="p-t-5 p-b-5"><i class="fa fa-times fs-15"></i></span>' +
                                '</a>';
                        } else if (data[i].status == 'paused') {
                            dataHtml += '<a href="#" id="editButton" data-target="#EditJob" data-toggle="modal" style="color: #000;padding-right: 15px;">' +
                                '<span class="p-t-5 p-b-5"><i class="fa fa-pencil fs-15"></i></span>' +
                                '</a>';
                            dataHtml += '<a href="/job/stat/' + data[i]._id + '" id="publishButton" style="color: #000;padding-right: 15px;">' +
                                '<span class="p-t-5 p-b-5"><i class="fa fa-play fs-15"></i></span>' +
                                '</a>';
                            dataHtml += '<a href="/job/del/' + data[i]._id + '" id="deleteButton" style="color: #000;padding-right: 15px;">' +
                                '<span class="p-t-5 p-b-5"><i class="fa fa-times fs-15"></i></span>' +
                                '</a>';
                        } else if (data[i].status == 'deleted') {
                            dataHtml += '<a href="/job/del/' + data[i]._id + '" id="restoreButton" style="color: #000;padding-right: 15px;">' +
                                '<span class="p-t-5 p-b-5">' +
                                '<i class="fa fa-undo fs-15"></i>' +
                                '</span>' +
                                '</a>';
                        }
                        dataHtml += '</div>';

                        dataHtml += '</div>';

                        // --------------------- and here goes LOADING APPLICATIONS -----------------------
                        $.ajax({
                            dataType: "json",
                            url: "/api/job/apps/" + data[i]._id,
                            success: function(app) {

                                if (app.length > 0) {

                                    $.each(app, function(j) {
                                        if (app[j].read == false) {
                                            var badge = '<span class="badge badge-primary hint-text new-details">New</span>';
                                        } else if (app[j].read == true) {
                                            var badge = '';
                                        }

                                        dataHtml += '<div class="Row" data="' + app[j]._id + '">' +
                                            '<div class="CellRow">' + app[j].firstName + ' ' + app[j].lastName + ' ' + badge + '</div>' +
                                            '<div class="CellRow">' + app[j].email + '</div>' +
                                            '<div class="CellRow">' + moment(app[j].applyDate).startOf('minute').fromNow() + '</div>' +
                                            '<div class="CellRow"><button type="button" id="appDetailsButton" app-id="' + app[j]._id + '" class="btn btn-default p-l-10 p-r-10" data-toggle="modal" data-target="#seeDetailApplicant"><i class="fa fa-search fs-15"></i> See Details</button></div>' +
                                            '</div>';
                                    });

                                } else {
                                    dataHtml += '<div class="Row"><div class="CellRow text-center hint-text">' +
                                        '<h5>No applicants yet..</h5>' +
                                        '</div></div>';
                                }
                            }
                        });
                        // -------------   End of apps fetcing  --------------

                    });

                    // Set the job post counter
                    if (data.length > 1) var s = "s";
                    else var s = "";
                    if (delCounter > 0) var del = '<span class="h5 font-montserrat bold text-danger">' + delCounter + " deleted</span>";
                    else var del = "";
                    if (pauCounter > 0) var pau = '<span class="h5 font-montserrat bold text-warning">' + pauCounter + " paused</span>";
                    else var pau = "";
                    if (pubCounter > 0) var pub = '<span class="h5 font-montserrat bold text-success">' + pubCounter + " published</span>";
                    else var pub = "";
                    "" != pub ? "" != pau ? "" != del ? (pub += ", ", pau += " & ") : pub += " & " : pub += "" != del ? " & " : "" : "" != pau ? pau += "" != del ? " & " : "" : "" != del ? pau += "" : pub += "no", $("#job-counter").html("You have " + pub + pau + del + " job post" + s);

                    // FINALLY, SHOW THE WHOLE RESULTS...
                    $('#user-jobs-heading').after(dataHtml).hide().show('slow');

                } else { // if no job post at all
                    $('#user-job-counter').hide();
                    $('#user-job-table').hide();
                    $('#no-job-post').show('slow');
                }


            }
        });
    }

    // ######################################### BEGIN DOCUMENT ON READY FN ##############################################
    $(document).ready(function() {

        /////////// initiate user jobs table !!! ////////////
        var uEmail = $('#user-email').val(); // Get logged user email

        showJobs('/api/jobs/' + uEmail + '/hide');

        // 'show deleted job' radio button action
        $("input:radio[name=hide-radio]").click(function() {
            var value = $(this).val();
            showJobs('/api/jobs/' + uEmail + '/' + value);
        });


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

                        $("#EditJob div.panel form#form-edit div#s2id_dd-location-edit span.select2-chosen").text(data.profile.location);
                        $('#EditJob div.panel form#form-edit select#dd-location-edit option:selected').val(data.profile.location);

                        $('#EditJob div.panel form#form-edit textarea.description-text').parent().children('div.note-editor').children('.note-editable').html(data.profile.description);
                        $('#EditJob div.panel form#form-edit input.jobTitle').attr('value', data.details.jobTitle);

                        $('#EditJob div.panel form#form-edit div#s2id_category span.select2-chosen').text(data.details.category);
                        $('#EditJob div.panel form#form-edit select#category option:selected').val(data.details.category);

                        $('#EditJob div.panel form#form-edit div#s2id_jobType span.select2-chosen').text(data.details.jobType);
                        $('#EditJob div.panel form#form-edit select#jobType option:selected').val(data.details.jobType);

                        $('#EditJob div.panel form#form-edit textarea.jobScope-text').parent().children('div.note-editor').children('.note-editable').html(data.details.jobScope);
                        $('#EditJob div.panel form#form-edit textarea.requirements-text').parent().children('div.note-editor').children('.note-editable').html(data.details.requirements);


                        if ((data.details.currency == 'IDR') || (data.details.currency == 'idr')) {
                            $('#EditJob div.panel form#form-edit select.currency').append($("<option selected='selected'></option>").val('idr').html("IDR"));
                            $('#EditJob div.panel form#form-edit select.currency').append($("<option></option>").val('usd').html("USD"));
                        } else if ((data.details.currency == 'USD') || (data.details.currency == 'usd')) {
                            $('#EditJob div.panel form#form-edit select.currency').append($("<option></option>").val('idr').html("IDR"));
                            $('#EditJob div.panel form#form-edit select.currency').append($("<option selected='selected'></option>").val('usd').html("USD"));
                        };

                        $('#EditJob div.panel form#form-edit input.salaryFrom').val(data.details.salaryFrom);
                        $('#EditJob div.panel form#form-edit input.salaryTo').val(data.details.salaryTo);

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
        });


        $("#editJobImg").change(function() {
            readURL(this);
        });



        $('#summernote1,#summernote2,#summernote3').summernote();

        // Forms validation
        $('#form-create').validate();
        $('#form-edit').validate();
        $('#form-register').validate();
        $('#applyForm').validate();

        // create user avatar based on name initial
        $('#user-avatar').initial({
            width: 80,
            height: 80,
            charCount: 2,
            fontSize: 45
        });

        // Reset/clear form function
        $('.clear-btn').click(function() {
            $('#form-edit input').attr('value', '');
            $('textarea#summernote1,textarea#summernote2,textarea#summernote3').parent().children('.note-editor').children('.note-editable').text('');
            $('#Crd option:selected').text();
        });


        // Notification show up /////
        var msg = $('.msg-container').text();
        var type = $('.msg-container').attr('data-type');
        if (msg) {
            if (type == 'success') {
                $('body').pgNotification({
                    'message': msg,
                    'type': type,
                    'style': 'circle',
                    'position': 'top-left',
                    'thumbnail': '<img width="80" height="80" style="display: inline-block;" src="assets/img/success.png" data-src="assets/img/success.png" data-src-retina="assets/img/success.png" alt="">'
                }).show();
            }

        }


        // SEARCH APPLICANT FUNCTION
        $(".searchApplicant").on("keyup", function() {
            var g = $(this).val().toLowerCase();

            $("tr.applyDetail td span.job-applicant").each(function() {
                var s = $(this).text().toLowerCase();
                $(this).closest('tr.applyDetail')[s.indexOf(g) !== -1 ? 'show' : 'hide']();
            });
        });

        $('textarea').autosize();

        //$('.description-text').keydown(counter1);
        //$('.jobScope-text').keydown(counter2);
        //$('.requirements-text').keydown(counter3);

        $('#summernote2').summernote({
            height: 200
        });

        $('textarea').autosize();

        $('.login-btn').click(function() {
            $('.signUp-panel').hide();
            $('.forgetPass-panel').hide();
            $('.signIn-panel').fadeIn('3000').css({
                'display': 'table-cell',
                'vertical-align': 'middle'
            });
        });

        $('.signUp-btn').click(function() {
            $('.signIn-panel').hide();
            $('.forgetPass-panel').hide();
            $('.signUp-panel').fadeIn('3000').css({
                'display': 'table-cell',
                'vertical-align': 'middle'
            });
        });

        $('.forgotPassword-btn').click(function() {
            $('.signUp-panel').hide();
            $('.signIn-panel').hide();
            $('.forgetPass-panel').fadeIn('3000').css({
                'display': 'table-cell',
                'vertical-align': 'middle'
            });
        });

        $('.updatePassword-btn').click(function() {
            $('.password1').hide();
            $('.password2').fadeIn('3000').css({
                'display': 'table-cell',
                'vertical-align': 'middle'
            });
        });

        $('.btn-cancel-reset').click(function() {
            $('.password2').hide();
            $('.password1').fadeIn('3000').css({
                'display': 'table-cell',
                'vertical-align': 'middle'
            });
        });

        $("#pauseButton").click(function() {
            var $row = $(this).closest("tr"),
                $tds = $row.find("td:nth-child(1)");

            $.each($tds, function() {
                console.log($(this).text());
            });
        });

        // Input masking
        $("#salary-from").autoNumeric('init', {
            aSep: '.',
            aDec: ',',
            mDec: '0'
        });
        $("#salary-to").autoNumeric('init', {
            aSep: '.',
            aDec: ',',
            mDec: '0'
        });

        $("#salary-from-edit").autoNumeric('init', {
            aSep: '.',
            aDec: ',',
            mDec: '0'
        });
        $("#salary-to-edit").autoNumeric('init', {
            aSep: '.',
            aDec: ',',
            mDec: '0'
        });

        $('#detailedTable').jExpand();

    });

})(window.jQuery);
