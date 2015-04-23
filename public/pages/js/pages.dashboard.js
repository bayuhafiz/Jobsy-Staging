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
        $('#no-job-post').hide();

        $.ajax({
            dataType: "json",
            url: url,
            success: function(data) {
                if (data.length > 0) {

                    $.each(data, function(i) {

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
                            var newApp = ' <span class="badge badge-danger"><font style="color:#FFF;">' + data[i].newApp + ' unreviewed</font></span>';
                        } else {
                            var newApp = '';
                        }

                        // Generate datas
                        dataHtml += '<li data-id="' + data[i]._id + '">' +
                            '<h3 class="cbp-nttrigger">' + data[i].details.jobTitle + ' <small> ' + data[i].app + ' applications ' + newApp + '</small><span class="pull-right"><div class="btn-group">' + badge + toolbox + '</div></span>' +
                            '</h3>';

                        // Load application list
                        $.ajax({
                            async: false,
                            dataType: "json",
                            url: "/api/job/apps/" + data[i]._id,
                            success: function(app) {
                                if (app.length > 0) {
                                    dataHtml += '<div class="cbp-ntcontent">' +
                                        '<p class="small">Applications:</p>' +
                                        '<ul class="cbp-ntsubaccordion" style="padding: 0;width: 95%;margin-left: auto;margin-right: auto;">';

                                    $.each(app, function(i) {
                                        if (app[i].read == false) {
                                            var appBadge = '<span class="badge badge-danger"><i class="fa fa-eye"></i> </span>';
                                            var status = ' <a href="/app/set/' + app[i]._id + '"><span class="link pull-right"><i class="fa fa-eye"></i> Set as reviewed</span></a>';
                                        } else {
                                            var appBadge = '<span class="badge badge-success"><i class="fa fa-eye"></i> </span>';
                                            var status = '';
                                        }

                                        dataHtml += '<li app-id="' + data[i]._id + '">' +
                                            '<h5 class="cbp-nttrigger">' + appBadge + ' ' + app[i].firstName + ' ' + app[i].lastName + '<span class="pull-right"><i class="pg-clock"></i> ' + moment(app[i].applyDate).startOf('minute').fromNow() + '</span></h5>' +
                                            '<div class="cbp-ntcontent">' +
                                            '<div class="panel panel-default">' +
                                            '<div class="panel-heading separator">PROFILE' + status + '</div><div class="panel-body">' +
                                            '<div class="row">' +
                                            '<div class="col-md-2 col-xs-2">Email</div><div class="col-md-6 col-xs-6 bold">' + app[i].email + '</div><br />' +
                                            '<div class="col-md-2 col-xs-2">Phone</div><div class="col-md-6 col-xs-6 bold">' + app[i].phone + '</div><br />' +
                                            '<div class="col-md-2 col-xs-2">Location</div><div class="col-md-6 col-xs-6 bold">' + app[i].location + '</div><br />' +
                                            '<div class="col-md-2 col-xs-2">Last Job/Education</div><div class="col-md-6 col-xs-6 bold">' + app[i].lastJob + '</div>' +
                                            '</div>' +
                                            '</div>' +
                                            '<div class="panel-heading separator">COVER LETTER</div><div class="panel-body bold" style="word-break: break-word;  font-size: 0.8em;">' + app[i].coverLetter + '</div>' +
                                            '<div class="panel-heading separator">RESUME FILE</div><div class="panel-body bold"><a href="/uploads/resume/' + app[i].resumeFile + '" target="_blank"><span class="link bold">Click to download</span></a></div></div>' +
                                            '</div>' +
                                            '</li>';
                                    });
                                } else {
                                    dataHtml += '<div class="cbp-ntcontent">' +
                                        '<p class="small hint-text">No applications yet..</p>' +
                                        '<ul class="cbp-ntsubaccordion">';
                                }
                            }
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


                    $('#user-job-list').cbpNTAccordion();

                } else { // if no job post at all
                    //$('#user-job-counter').hide();
                    $('#no-job-post').show('slow');
                }

            }
        });
    };


    // ===================== INITIATE WIZARD FORM ============================
    var formWizard1 = function() {
        console.log('setting up CREATE JOB wizard...');

        $('#createWizard').bootstrapWizard({
            onTabShow: function(tab, navigation, index) {
                var $total = navigation.find('li').length;
                var $current = index + 1;

                // If it's the last tab then hide the last button and show the finish instead
                if ($current >= $total) {
                    $('#createWizard').find('.pager .next').hide();
                    $('#createWizard').find('.pager .previous').show();
                    $('#createWizard').find('.pager .finish').show();
                    $('#createWizard').find('.pager .finish').removeClass('disabled');
                } else {
                    $('#createWizard').find('.pager .next').show();
                    $('#editWizard').find('.pager .finish').hide();
                    $('#createWizard').find('.pager .finish').hide();
                }

                var li = navigation.find('li.active');

                var btnNext = $('#createWizard').find('.pager .next').find('button');
                var btnPrev = $('#createWizard').find('.pager .previous').find('button');

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
                    $('#createWizard').find('.pager .previous').hide();
                    removeIcons(btnPrev);
                } else {
                    // remove classes needed for button animations from next button
                    btnNext.removeClass('btn-animated from-left fa');
                    $('#createWizard').find('.pager .previous').show();
                    removeIcons(btnNext);
                }
            }
        });
    };

    var formWizard2 = function() {
        console.log('setting up EDIT JOB wizard...');

        $('#editWizard').bootstrapWizard({
            onTabShow: function(tab, navigation, index) {
                var $total = navigation.find('li').length;
                var $current = index + 1;

                // If it's the last tab then hide the last button and show the finish instead
                if ($current >= $total) {
                    $('#editWizard').find('.pager .next').hide();
                    $('#editWizard').find('.pager .previous').show();
                    $('#editWizard').find('.pager .finish').show();
                    $('#editWizard').find('.pager .finish').removeClass('disabled');
                } else {
                    $('#editWizard').find('.pager .next').show();
                    $('#editWizard').find('.pager .previous').hide();
                    $('#editWizard').find('.pager .finish').hide();
                }

                var li = navigation.find('li.active');

                var btnNext = $('#editWizard').find('.pager .next').find('button');
                var btnPrev = $('#editWizard').find('.pager .previous').find('button');

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
                    $('#createWizard').find('.pager .previous').hide();
                } else if ($current == 1) {
                    // remove classes needed for button animations from previous button
                    btnPrev.removeClass('btn-animated from-left fa');
                    removeIcons(btnPrev);
                    $('#createWizard').find('.pager .previous').hide();
                } else {
                    // remove classes needed for button animations from next button
                    btnNext.removeClass('btn-animated from-left fa');
                    removeIcons(btnNext);
                    $('#createWizard').find('.pager .previous').show();
                }
            }
        });
    };


    // ====================== BUY CREDITS FUNCTION ===========================
    var buyCredit = function(amount) {
        var BASE_URL = 'https://api.sandbox.veritrans.co.id/v2/charge';
        var order_id = Date.now() + user._id;
        var server_key = btoa('VT-server-XzWLJbFxyzU72hwjhpmM_K-y');
        var datas = {
            "payment_type": "vtweb",
            "vtweb": {
                "credit_card_3d_secure": true
            },
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": amount
            }
        };

        $.ajax({
            url: BASE_URL,
            type: 'POST',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.setRequestHeader('Authorization', 'Basic ' + server_key + ':');
            },
            data: datas,
            success: function() {
                console.log('success');
            },
            error: function() {
                console.log('failure');
            },
        });

    };


    // ######################################### BEGIN DOCUMENT ON READY FN ##############################################
    $(document).ready(function() {

        var uEmail = $('#user-email').val(); // Get logged user email
        showJobs('/api/jobs/' + uEmail + '/hide');

        // Create job form logic ////
        var initLogin = $('#init-login').val();
        if (initLogin == 'false') {
            formWizard1();

            var logo = $('#hidden-logo').val();
            $('#savedLogo').val(logo);

            var location = $('#hidden-location').val();
            $('#create-job-location-dropdown').select2('val', location);

            $('#createWizard').bootstrapWizard('show', 1);
        }


        // CKEditor configuration /////
        CKEDITOR.inline('editor1');
        CKEDITOR.inline('editor2');
        CKEDITOR.inline('editor3');


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


        // init switchery ////
        var elems = Array.prototype.slice.call(document.querySelectorAll('.switchery'));
        elems.forEach(function(html) {
            var switchery = new Switchery(html, {
                color: '#b2050d'
            });
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


        // ================================================================================================
        // START EVENT HANDLERS ===========================================================================
        // ================================================================================================

        // Buy Credits buttons action
        $('#btnBuy1').click(function() {
            buyCredit(50000);
        });
        $('#btnBuy5').click(function() {
            buyCredit(250000);
        });
        $('#btnBuy10').click(function() {
            buyCredit(500000);
        });

        // Switchery Handler >>> 'show deleted job'
        $('.switchery').change(function() {
            if ($(this).attr('checked')) {
                showJobs('/api/jobs/' + uEmail + '/show');
                $('p.switch-label').html('Click to hide<br>deleted job posting');
            } else {
                showJobs('/api/jobs/' + uEmail + '/hide');
                $('p.switch-label').html('Click to show<br>deleted job posting');
            }
        });

        //add mousedown handler on select2 mask to close dropdown
        $(document).on('mousedown', '#select2-drop-mask', function() {
            $('.dropdown.open').removeClass('open');
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

        $('body').on('click', '#editButton', function(e) {
            e.preventDefault();

            // Init edit form
            formWizard2();
            $('#editWizard').bootstrapWizard('show', 0);


            var dataHtml = '';
            var id = $(this).attr('data-id');

            // Init CKEditor before set datas up
            if (CKEDITOR.instances['editor1-edit']) {
                CKEDITOR.replace['editor1-edit'];
            } else {
                CKEDITOR.inline('editor1-edit');
            }

            if (CKEDITOR.instances['editor2-edit']) {
                CKEDITOR.replace['editor2-edit'];
            } else {
                CKEDITOR.inline('editor2-edit');
            }

            if (CKEDITOR.instances['editor3-edit']) {
                CKEDITOR.replace['editor3-edit'];
            } else {
                CKEDITOR.inline('editor3-edit');
            }

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
                        CKEDITOR.instances['editor1-edit'].setData(data.profile.description);
                        CKEDITOR.instances['editor2-edit'].setData(data.details.jobScope);
                        CKEDITOR.instances['editor3-edit'].setData(data.details.requirements);

                        $('input.jobTitle').attr('value', data.details.jobTitle);

                        var cat = data.details.category;
                        $('select#category-edit').select2('val', cat);

                        var cur = data.details.currency;
                        $("#EditJob select.currency").select2('val', cur);

                        var typ = data.details.jobType;
                        $('#EditJob select.jobType').select2('val', typ);

                        $('#EditJob input.salaryFrom').val(data.details.salaryFrom);
                        $('#EditJob input.salaryTo').val(data.details.salaryTo);

                        $('#EditJob div.panel form#form-edit input.companyName').attr('value', data.profile.name);

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
