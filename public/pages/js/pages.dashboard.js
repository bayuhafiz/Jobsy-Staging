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
    };

    // Date formatter function
    function localDate(date) {
        var result = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
        return result;
    };

    // ===================== SHOW USER JOBS FUNCTION ============================
    var showJobs = function(url) {
        var dataHtml = '';
        var badge = '';
        var toolbox = '';
        var delCounter = 0;
        var pauCounter = 0;
        var pubCounter = 0;

        // Dummy clear the job table
        $('#user-job-list').html('');

        $.ajax({
            dataType: "json",
            url: url,
            success: function(data) {
                if (data.length > 0) {

                    $.each(data, function(i) {

                        var random = 1 + Math.floor(Math.random() * 999);

                        if (data[i].status == 'deleted') {
                            delCounter = delCounter + 1; // Count deleted job
                            badge = '<span class="btn btn-sm btn-danger" style="cursor:default">DELETED</span>';
                            toolbox = '<div class="btn-group"><a href="/job/del/' + data[i]._id + '" id="restoreButton" class="btn btn-sm btn-white"><i class="fa fa-reply"></i></a></div>';
                        } else if (data[i].status == 'paused') {
                            pauCounter = pauCounter + 1; // Count paused job
                            badge = '<span class="btn btn-sm btn-warning" style="cursor:default">PAUSED</span>';
                            toolbox = '<div class="btn-group"><a href="#" id="editButton" data-target="#EditJob" data-id="' + data[i]._id + '" data-toggle="modal" class="btn btn-sm btn-white"><i class="fa fa-pencil"></i></a><a href="/job/stat/' + data[i]._id + '" class="btn btn-sm btn-white"><i class="fa fa-refresh"></i></a><a href="/job/del/' + data[i]._id + '" id="deleteButton" class="btn btn-sm btn-white"><i class="fa fa-trash-o"></i></a></div>';
                        } else if (data[i].status == 'published') {
                            pubCounter = pubCounter + 1; // Count published job
                            badge = '<span class="btn btn-sm btn-success" style="cursor:default">PUBLISHED</span>';
                            toolbox = '<a href="#" id="editButton" data-target="#EditJob" data-id="' + data[i]._id + '" data-toggle="modal" class="btn btn-sm btn-white"><i class="fa fa-pencil" data-toggle="" data-original-title="Up here!"></i></a><a href="/job/stat/' + data[i]._id + '" class="btn btn-sm btn-white"><i class="fa fa-power-off"></i></a><a href="/job/del/' + data[i]._id + '" id="deleteButton" class="btn btn-sm btn-white"><i class="fa fa-trash-o"></i></a>';
                        }

                        if (data[i].newApp > 0) {
                            var newApp = ' <span class="badge badge-danger"><font style="color:#FFF;">' + data[i].newApp + '</font></span>';
                        } else {
                            var newApp = '';
                        }

                        // Generate datas
                        dataHtml += '<li data-id="' + data[i]._id + '">' +
                            '<h3 class="cbp-nttrigger">' + data[i].details.jobTitle + ' <small> ' + data[i].app + ' applications ' + newApp + '</small><span class="pull-right"><div class="btn-group">' + badge + toolbox + '</div></span>' +
                            '</h3>';

                        // Load application list
                        $.ajax({
                            dataType: "json",
                            url: "/api/job/apps/" + data[i]._id,
                            success: function(app) {
                                if (app.length > 0) {
                                    if (app[i].read == false) {
                                        var appBadge = ' <span class="badge badge-danger">un-reviewed</span>';
                                    } else {
                                        var appBadge = ' <span class="badge badge-default">reviewed</span>';
                                    }

                                    dataHtml += '<div class="cbp-ntcontent">' +
                                        '<p class="small">Applications:</p>' +
                                        '<ul class="cbp-ntsubaccordion">';

                                    $.each(app, function(i) {
                                        dataHtml += '<li app-id="' + data[i]._id + '">' +
                                            '<h5 class="cbp-nttrigger">' + app[i].firstName + ' ' + app[i].lastName + ' ' + appBadge + '<span class="pull-right"><i class="pg-clock"></i> ' + moment(app[i].applyDate).startOf('minute').fromNow() + '</span></h5>' +
                                            '<div class="cbp-ntcontent">' +
                                            '<div class="panel panel-default">' +
                                            '<div class="panel-heading separator">Profile</div><div class="panel-body">' +
                                            '<div class="row">' +
                                            '<div class="col-md-1 col-xs-2">Email</div><div class="col-md-1 col-xs-1">:</div><div class="col-md-6 col-xs-6 bold">' + app[i].email + '</div><br />' +
                                            '<div class="col-md-1 col-xs-2">Phone</div><div class="col-md-1 col-xs-1">:</div><div class="col-md-6 col-xs-6 bold">' + app[i].phone + '</div><br />' +
                                            '<div class="col-md-1 col-xs-2">Location</div><div class="col-md-1 col-xs-1">:</div><div class="col-md-6 col-xs-6 bold">' + app[i].location + '</div>' +
                                            '</div>' +
                                            '</div>' +
                                            '<div class="panel-heading separator">Cover letter</div><div class="panel-body bold">' + app[i].coverLetter + '</div>' +
                                            '<div class="panel-heading separator">Resume File</div><div class="panel-body bold"><a href="/uploads/resume/' + app[i].resumeFile + '" target="_blank"><span class="link bold">Click to download</span></a></div></div>' +
                                            '</div>' +
                                            '</li>';
                                    });
                                } else {
                                    dataHtml += '<div class="cbp-ntcontent">' +
                                        '<p class="small hint-text">No applications yet..</p>' +
                                        '<ul class="cbp-ntsubaccordion">';
                                }
                            },
                            async: false
                        });

                        dataHtml += '</ul>' +
                            '</div>' +
                            '</li>';

                        // FINALLY, SHOW THE WHOLE RESULTS...
                        $('#user-job-list').html(dataHtml).hide().show('slow');

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



                } else { // if no job post at all
                    $('#user-job-counter').hide();
                    $('#no-job-post').show('slow');
                }

                $('#user-job-list').cbpNTAccordion();
            }
        });
    }



    // ######################################### BEGIN DOCUMENT ON READY FN ##############################################
    $(document).ready(function() {

        var uEmail = $('#user-email').val(); // Get logged user email
        showJobs('/api/jobs/' + uEmail + '/hide');

        // Create job form logic ////
        var initLogin = $('#init-login').val();
        if (initLogin == 'false') {
            var logo = $('#hidden-logo').val();
            $('#savedLogo').val(logo);

            var location = $('#hidden-location').val();
            $('#create-job-location-dropdown').select2('val', location);

            $('#PostNewJob div.panel .firstTab').removeClass('active');
            $('#PostNewJob div.panel .secondTab').addClass('active');
            $('#PostNewJob div.panel #tab1').removeClass('active');
            $('#PostNewJob div.panel #tab2').addClass('active');
        }


        // CKEditor configuration /////
        CKEDITOR.inline('editor1');
        CKEDITOR.inline('editor2');
        CKEDITOR.inline('editor3');

        CKEDITOR.inline('editor1-edit');
        CKEDITOR.inline('editor2-edit');
        CKEDITOR.inline('editor3-edit');


        // Forms validation /////
        $('#form-create-job').validate();
        $('#form-edit').validate();
        $('#form-register').validate();
        $('#applyForm').validate();


        // create user avatar based on name initial ////
        $('#user-avatar').initial({
            width: 80,
            height: 80,
            charCount: 2,
            fontSize: 45
        });


        // NOTIFICATIONS HANDLER /////
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


        // INPUT MASKING //////
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


        // WIZARD-FORM CONFIGURATIONS /////
        if ($('.firstTab').hasClass('active')) {
            $('.btn-previous').hide();
        };

        if ($('.secondTab').hasClass('active')) {
            $('.btn-previous').show();
        }

        $('#myFormWizard').bootstrapWizard({
            onTabShow: function(tab, navigation, index) {
                var $total = navigation.find('li').length;
                var $current = index + 1;

                // If it's the last tab then hide the last button and show the finish instead
                if ($current >= $total) {
                    $('#myFormWizard').find('.pager .next').hide();
                    $('#myFormWizard').find('.pager .finish').show();
                    $('#myFormWizard').find('.pager .finish').removeClass('disabled');
                } else {
                    $('#myFormWizard').find('.pager .next').show();
                    $('#myFormWizard').find('.pager .finish').hide();
                }

                var li = navigation.find('li.active');

                var btnNext = $('#myFormWizard').find('.pager .next').find('button');
                var btnPrev = $('#myFormWizard').find('.pager .previous').find('button');

                // remove fontAwesome icon classes
                function removeIcons(btn) {
                    btn.removeClass(function(index, css) {
                        return (css.match(/(^|\s)fa-\S+/g) || []).join(' ');
                    });
                }

                if ($current > 1 && $current < $total) {

                    var nextIcon = li.next().find('.fa');
                    var nextIconClass = nextIcon.attr('class').match(/fa-[\w-]*/).join();

                    removeIcons(btnNext);
                    btnNext.addClass(nextIconClass + ' btn-animated from-left fa');

                    var prevIcon = li.prev().find('.fa');
                    var prevIconClass = prevIcon.attr('class').match(/fa-[\w-]*/).join();

                    removeIcons(btnPrev);
                    btnPrev.addClass(prevIconClass + ' btn-animated from-left fa');
                } else if ($current == 1) {
                    // remove classes needed for button animations from previous button
                    btnPrev.removeClass('btn-animated from-left fa');
                    removeIcons(btnPrev);
                } else {
                    // remove classes needed for button animations from next button
                    btnNext.removeClass('btn-animated from-left fa');
                    removeIcons(btnNext);
                }
            }
        });

        $('#myFormWizard2').bootstrapWizard({
            onTabShow: function(tab, navigation, index) {
                var $total = navigation.find('li').length;
                var $current = index + 1;

                // If it's the last tab then hide the last button and show the finish instead
                if ($current >= $total) {
                    $('#myFormWizard2').find('.pager .next').hide();
                    $('#myFormWizard2').find('.pager .finish').show();
                    $('#myFormWizard2').find('.pager .finish').removeClass('disabled');
                } else {
                    $('#myFormWizard2').find('.pager .next').show();
                    $('#myFormWizard2').find('.pager .finish').hide();
                }

                var li = navigation.find('li.active');

                var btnNext = $('#myFormWizard2').find('.pager .next').find('button');
                var btnPrev = $('#myFormWizard2').find('.pager .previous').find('button');

                // remove fontAwesome icon classes
                function removeIcons(btn) {
                    btn.removeClass(function(index, css) {
                        return (css.match(/(^|\s)fa-\S+/g) || []).join(' ');
                    });
                }

                if ($current > 1 && $current < $total) {

                    var nextIcon = li.next().find('.fa');
                    var nextIconClass = nextIcon.attr('class').match(/fa-[\w-]*/).join();

                    removeIcons(btnNext);
                    btnNext.addClass(nextIconClass + ' btn-animated from-left fa');

                    var prevIcon = li.prev().find('.fa');
                    var prevIconClass = prevIcon.attr('class').match(/fa-[\w-]*/).join();

                    removeIcons(btnPrev);
                    btnPrev.addClass(prevIconClass + ' btn-animated from-left fa');
                } else if ($current == 1) {
                    // remove classes needed for button animations from previous button
                    btnPrev.removeClass('btn-animated from-left fa');
                    removeIcons(btnPrev);
                } else {
                    // remove classes needed for button animations from next button
                    btnNext.removeClass('btn-animated from-left fa');
                    removeIcons(btnNext);
                }
            }
        });



        // ================================================================================================
        // START EVENT HANDLERS ===========================================================================
        // ================================================================================================

        // 'show deleted job' radio button action
        $("input:radio[name=hide-radio]").click(function() {
            var value = $(this).val();
            showJobs('/api/jobs/' + uEmail + '/' + value);
        });

        //add mousedown handler on select2 mask to close dropdown
        $(document).on('mousedown', '#select2-drop-mask', function() {
            $('.job-filter-dropdown.open').removeClass('open');
            $('.job-dropdown.open').removeClass('open');
        });

        // APPLICATION SEARCH HANDLER ////
        $(".searchApplicant").on("keyup", function() {
            var g = $(this).val().toLowerCase();
            $("li h3.cbp-nttrigger").each(function() {
                var s = $(this).text().toLowerCase();
                $(this).closest('li')[s.indexOf(g) !== -1 ? 'show' : 'hide']();
            });
        });

        // Reset/clear form function /////
        $('.clear-btn').click(function() {
            $('#form-edit input').attr('value', '');
            $('textarea#editor1,textarea#editor2,textarea#editor3').parent().children('.note-editor').children('.note-editable').text('');
            $('#Crd option:selected').text();
        });


        // BASIC BUTTONS HANDLER ////
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

        $('.firstTab,.btn-previous').click(function() {
            $('.btn-previous').hide();
        });
        $('.secondTab,.btn-next').click(function() {
            $('.btn-previous').show();
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
            var id = $(this).attr('data-id');

            $('.btn-previous').hide(); // hide 'Company Profile' button from the form

            // Init CKEditor before set datas up
            if (CKEDITOR.instances['editor1-edit']) {
                delete CKEDITOR.instances['editor1-edit'];
                var editor1 = CKEDITOR.inline('editor1-edit');
            };

            if (CKEDITOR.instances['editor2-edit']) {
                delete CKEDITOR.instances['editor2-edit'];
                var editor2 = CKEDITOR.inline('editor2-edit');
            };

            if (CKEDITOR.instances['editor3-edit']) {
                delete CKEDITOR.instances['editor3-edit'];
                var editor3 = CKEDITOR.inline('editor3-edit');
            };

            $.ajax({
                dataType: "json",
                url: "/api/job/" + id,
                success: function(data) {
                    if (data) {
                        var img = 'uploads/logo/' + data.profile.logo;
                        $('#EditJob div.panel form#form-edit input#oldJobImg').attr('value', data.profile.logo);
                        $('#EditJob div.panel form#form-edit img#editJobImg-preview').attr('src', img);
                        $('#EditJob div.panel form#form-edit input.companyName').attr('value', data.profile.name);

                        var loc = data.profile.location;
                        $("select#location-edit").select2('val', loc);

                        // append datas
                        editor1.setData(data.profile.description);
                        editor2.setData(data.details.jobScope);
                        editor3.setData(data.details.requirements);

                        $('input.jobTitle').attr('value', data.details.jobTitle);

                        var cat = data.details.category;
                        $('select#category-edit').select2('val', cat);

                        if (data.details.jobType == 'full-time') {
                            data.details.jobType = 'Full Time';
                        }

                        if (data.details.jobType == 'contract') {
                            data.details.jobType = 'Contract';
                        }

                        if (data.details.jobType == 'part-time') {
                            data.details.jobType = 'Part Time';
                        }

                        $('#EditJob div.panel form#form-edit div#s2id_jobType span.select2-chosen').text(data.details.jobType);
                        $('#EditJob div.panel form#form-edit select#jobType option:selected').val();

                        if ((data.details.currency == 'IDR') || (data.details.currency == 'idr')) {
                            $('#EditJob select.currency').append($("<option selected='selected'></option>").val('idr').html("IDR"));
                            $('#EditJob select.currency').append($("<option></option>").val('usd').html("USD"));
                        } else if ((data.details.currency == 'USD') || (data.details.currency == 'usd')) {
                            $('#EditJob select.currency').append($("<option></option>").val('idr').html("IDR"));
                            $('#EditJob select.currency').append($("<option selected='selected'></option>").val('usd').html("USD"));
                        };

                        $('#EditJob input.salaryFrom').val(data.details.salaryFrom);
                        $('#EditJob input.salaryTo').val(data.details.salaryTo);

                        $('#EditJob div.panel form#form-edit input.companyName').attr('value', data.profile.name);


                        if (data.details.salaryType == 'Monthly') {
                            $('#EditJob select.salaryType').append($("<option selected='selected'></option>").val('Monthly').html("Monthly"));
                            $('#EditJob select.salaryType').append($("<option></option>").val('Annually').html("Annually"));
                            $('#EditJob select.salaryType').append($("<option></option>").val('Daily').html("Daily"));
                            $('#EditJob select.salaryType').append($("<option></option>").val('Hourly').html("Hourly"));
                        } else if (data.details.salaryType == 'Annually') {
                            $('#EditJob select.salaryType').append($("<option></option>").val('Monthly').html("Monthly"));
                            $('#EditJob select.salaryType').append($("<option selected='selected'></option>").val('Annually').html("Annually"));
                            $('#EditJob select.salaryType').append($("<option></option>").val('Daily').html("Daily"));
                            $('#EditJob select.salaryType').append($("<option></option>").val('Hourly').html("Hourly"));
                        } else if (data.details.salaryType == 'Daily') {
                            $('#EditJob select.salaryType').append($("<option></option>").val('Monthly').html("Monthly"));
                            $('#EditJob select.salaryType').append($("<option></option>").val('Annually').html("Annually"));
                            $('#EditJob select.salaryType').append($("<option selected='selected'></option>").val('Daily').html("Daily"));
                            $('#EditJob select.salaryType').append($("<option></option>").val('Hourly').html("Hourly"));
                        } else if (data.details.salaryType == 'Hourly') {
                            $('#EditJob select.salaryType').append($("<option></option>").val('Monthly').html("Monthly"));
                            $('#EditJob select.salaryType').append($("<option></option>").val('Annually').html("Annually"));
                            $('#EditJob select.salaryType').append($("<option></option>").val('Daily').html("Daily"));
                            $('#EditJob select.salaryType').append($("<option selected='selected'></option>").val('Hourly').html("Hourly"));
                        };


                        $('#EditJob div.panel form#form-edit').attr('action', '/update/' + data._id);

                    }

                    //$('#appDetailsCloseBtn').attr('onClick', 'location.href=\'/job/app/' + dataId + '\'');
                }
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



        $('#myFormWizard').bootstrapWizard({
            onTabShow: function(tab, navigation, index) {
                var $total = navigation.find('li').length;
                var $current = index + 1;

                // If it's the last tab then hide the last button and show the finish instead
                if ($current >= $total) {
                    $('#myFormWizard').find('.pager .next').hide();
                    $('#myFormWizard').find('.pager .finish').show();
                    $('#myFormWizard').find('.pager .finish').removeClass('disabled');
                } else {
                    $('#myFormWizard').find('.pager .next').show();
                    $('#myFormWizard').find('.pager .finish').hide();
                }

                var li = navigation.find('li.active');

                var btnNext = $('#myFormWizard').find('.pager .next').find('button');
                var btnPrev = $('#myFormWizard').find('.pager .previous').find('button');

                // remove fontAwesome icon classes
                function removeIcons(btn) {
                    btn.removeClass(function(index, css) {
                        return (css.match(/(^|\s)fa-\S+/g) || []).join(' ');
                    });
                }

                if ($current > 1 && $current < $total) {

                    var nextIcon = li.next().find('.fa');
                    var nextIconClass = nextIcon.attr('class').match(/fa-[\w-]*/).join();

                    removeIcons(btnNext);
                    btnNext.addClass(nextIconClass + ' btn-animated from-left fa');

                    var prevIcon = li.prev().find('.fa');
                    var prevIconClass = prevIcon.attr('class').match(/fa-[\w-]*/).join();

                    removeIcons(btnPrev);
                    btnPrev.addClass(prevIconClass + ' btn-animated from-left fa');
                } else if ($current == 1) {
                    // remove classes needed for button animations from previous button
                    btnPrev.removeClass('btn-animated from-left fa');
                    removeIcons(btnPrev);
                } else {
                    // remove classes needed for button animations from next button
                    btnNext.removeClass('btn-animated from-left fa');
                    removeIcons(btnNext);
                }
            }
        });


        $('#myFormWizard2').bootstrapWizard({
            onTabShow: function(tab, navigation, index) {
                var $total = navigation.find('li').length;
                var $current = index + 1;

                // If it's the last tab then hide the last button and show the finish instead
                if ($current >= $total) {
                    $('#myFormWizard2').find('.pager .next').hide();
                    $('#myFormWizard2').find('.pager .finish').show();
                    $('#myFormWizard2').find('.pager .finish').removeClass('disabled');
                } else {
                    $('#myFormWizard2').find('.pager .next').show();
                    $('#myFormWizard2').find('.pager .finish').hide();
                }

                var li = navigation.find('li.active');

                var btnNext = $('#myFormWizard2').find('.pager .next').find('button');
                var btnPrev = $('#myFormWizard2').find('.pager .previous').find('button');

                // remove fontAwesome icon classes
                function removeIcons(btn) {
                    btn.removeClass(function(index, css) {
                        return (css.match(/(^|\s)fa-\S+/g) || []).join(' ');
                    });
                }

                if ($current > 1 && $current < $total) {

                    var nextIcon = li.next().find('.fa');
                    var nextIconClass = nextIcon.attr('class').match(/fa-[\w-]*/).join();

                    removeIcons(btnNext);
                    btnNext.addClass(nextIconClass + ' btn-animated from-left fa');

                    var prevIcon = li.prev().find('.fa');
                    var prevIconClass = prevIcon.attr('class').match(/fa-[\w-]*/).join();

                    removeIcons(btnPrev);
                    btnPrev.addClass(prevIconClass + ' btn-animated from-left fa');
                } else if ($current == 1) {
                    // remove classes needed for button animations from previous button
                    btnPrev.removeClass('btn-animated from-left fa');
                    removeIcons(btnPrev);
                } else {
                    // remove classes needed for button animations from next button
                    btnNext.removeClass('btn-animated from-left fa');
                    removeIcons(btnNext);
                }
            }
        });


        /*var data = {
          // A labels array that can contain any sort of values
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          // Our series array that contains series objects or in this case series data arrays
          series: [
            [5, 2, 4, 2, 0]
          ]
        };

        // As options we currently only set a static size of 300x200 px. We can also omit this and use aspect ratio containers
        // as you saw in the previous example
        var options = {
          height: '200px'
        };

        var responsiveOptions = [
          ['screen and (min-width: 641px) and (max-width: 1024px)', {
            showPoint: false,
            axisX: {
              labelInterpolationFnc: function(value) {
                // Will return Mon, Tue, Wed etc. on medium screens
                return value.slice(0, 3);
              }
            }
          }],
          ['screen and (max-width: 640px)', {
            showLine: false,
            axisX: {
              labelInterpolationFnc: function(value) {
                // Will return M, T, W etc. on small screens
                return value[0];
              }
            }
          }]
        ];
        // Create a new line chart object where as first parameter we pass in a selector
        // that is resolving to our chart container element. The Second parameter
        // is the actual data object. As a third parameter we pass in our custom options.
        new Chartist.Bar('.ct-chart', data, options,responsiveOptions);*/



    });

})(window.jQuery);
