window.showJobs = function(url) {
    var dataHtml = '';
    var timeBadge = '';
    var badge = '';
    var toolbox = '';
    var delCounter = 0;
    var pauCounter = 0;
    var pubCounter = 0;

    // Dummy clear the job table
    $('.jobs-panel').html('');
    $('#no-job-post').hide();

    $.ajax({
        dataType: "json",
        url: url,
        success: function(data) {
            if (data.length > 0) {
                $.each(data, function(i) {

                    dataHtml += '<div class="collapse-card" data-id="' + data[i]._id + '">';

                    if (data[i].status == 'deleted') {
                        delCounter = delCounter + 1; // Count deleted job
                        timeBadge = '<span class="label label-danger">Deleted on ' + moment(data[i].updatedAt).format('D MMMM YYYY') + '</span>';
                        timeStamp = '<span class="hint-text pull-right time-stamp">' + moment(data[i].createdAt).startOf('minute').fromNow() + '</span>';
                        badge = '<i status="deleted" class="fa fa-trash-o fa-2x" style="color:#D2D2D2;"></i>';
                        toolbox = '<div class="btn-group"><button data-id="' + data[i]._id + '" id="restoreButton" class="btn btn-white"><i class="fa fa-reply"></i></button></div>';
                    } else if (data[i].status == 'paused') {
                        pauCounter = pauCounter + 1; // Count paused job
                        timeBadge = '<span class="label label-warning">Paused on ' + moment(data[i].updatedAt).format('D MMMM YYYY') + '</span>';
                        timeStamp = '<span class="hint-text pull-right time-stamp">' + moment(data[i].createdAt).startOf('minute').fromNow() + '</span>';
                        badge = '<i status="paused" class="fa fa-times-circle fa-2x" style="color:#D2D2D2"></i>';
                        toolbox = '<div class="btn-group"><button id="editButton" data-target="#EditJob" data-id="' + data[i]._id + '" data-toggle="modal" class="btn btn-white"><i class="fa fa-pencil"></i></button><button data-id="' + data[i]._id + '" class="btn btn-white" id="publishButton"><i class="fa fa-refresh"></i></button><button data-id="' + data[i]._id + '" id="deleteButton" class="btn btn-white"><i class="fa fa-trash-o"></i></button></div>';
                    } else if (data[i].status == 'published') {
                        pubCounter = pubCounter + 1; // Count published job
                        timeBadge = '<span class="label label-success">Last update on ' + moment(data[i].updatedAt).format('D MMMM YYYY') + '</span>';
                        timeStamp = '<span class="hint-text pull-right time-stamp">' + moment(data[i].createdAt).startOf('minute').fromNow() + '</span>';
                        badge = '<i status="published" class="fa fa-check-circle fa-2x" style="color:#D2D2D2"></i>';
                        toolbox = '<button href="#" id="editButton" data-target="#EditJob" data-id="' + data[i]._id + '" data-toggle="modal" class="btn btn-white"><i class="fa fa-pencil" data-toggle="" data-original-title="Up here!"></i></button><button data-id="' + data[i]._id + '" id="pauseButton" class="btn btn-white"><i class="fa fa-power-off"></i></button><button data-id="' + data[i]._id + '" id="deleteButton" class="btn btn-white"><i class="fa fa-trash-o"></i></button>';
                    }

                    if (data[i].newApp > 0) {
                        var newApp = ' <span class="badge badge-danger"><font style="color:#FFF;">' + data[i].newApp + '</font></span>';
                    } else {
                        var newApp = '';
                    }

                    // Generate datas
                    dataHtml += '<div class="collapse-card__heading">' +
                        '<div class="collapse-card__title">' +
                        badge + '&nbsp;&nbsp;<span style="font-size:16px!important;">' + data[i].details.jobTitle + '</span>&nbsp;&nbsp;<span class="new-app">' + newApp + '</span>' +
                        '<span class="time-badge" style="display:none;padding-left:10px;">' + timeBadge + '</span>' + timeStamp +
                        '<span class="jobs-toolbox pull-right ' + data[i]._id + '" style="display:none;">' + toolbox + '</span>' +
                        '</div>' +
                        '</div>';

                    // Load application list
                    $.ajax({
                        async: false,
                        dataType: "json",
                        url: "/api/job/apps/" + data[i]._id,
                        success: function(app) {

                            dataHtml += '<div class="collapse-card__body">';

                            if (app.length > 0) {
                                if (app.length == 1) {
                                    dataHtml += '<p class="text-center">There is 1 application:</p>';
                                } else {
                                    dataHtml += '<p class="text-center">There are ' + app.length + ' applications:</p>';
                                }

                                $.each(app, function(i) {
                                    if (app[i].read == false) {
                                        var appBadge = '<span class="badge badge-danger"><i class="fa fa-eye"></i> </span>';
                                        var status = ' <a href="/app/set/' + app[i]._id + '"><span class="link pull-right"><i class="fa fa-eye"></i> </span></a>';
                                    } else {
                                        var appBadge = '<span class="badge badge-default"><i class="fa fa-eye"></i></span>';
                                        var status = '';
                                    }

                                    dataHtml += '<p app-id="' + data[i]._id + '" class="app-item">' + appBadge + '  <span>' + app[i].fullName.toUpperCase() + ' (' + app[i].location + ')' + '</span><span class="pull-right small"><i class="pg-clock"></i> ' + moment(app[i].applyDate).startOf('hour').fromNow() + '</span></p>';
                                });
                            } else {
                                dataHtml += '<p class="text-center" style="color:#9E9E9E"><i class="fa fa-exclamation-circle" style="color:#9E9E9E"></i> No applications yet..</p>';
                            }

                            dataHtml += '</div>';
                        }
                    });

                    dataHtml += '</div>';

                    // FINALLY, SHOW THE WHOLE RESULTS...
                    $('.jobs-panel').html(dataHtml).hide().fadeIn();
                    // Call the plugin
                    var list = $('.collapse-card').paperCollapse({
                        animationDuration: 200
                    });
                });

                // EVENT HANDLERS!!!
                // On job list click
                $('.collapse-card').on('click', function(e) {
                    $(this).siblings().removeClass('active').find('.collapse-card__body').css('display', 'none');
                    $(this).siblings().find('.jobs-toolbox').css('display', 'none');
                    $(this).siblings().find('.time-badge').hide();
                    $(this).siblings().find('.new-app').show();
                    $(this).siblings().find('.time-stamp').show();

                    if ($(this).hasClass('active') == true) {
                        $(this).find('.jobs-toolbox').css('display', 'block');
                        $(this).find('.time-badge').show();
                        $(this).find('.new-app').hide();
                        $(this).find('.time-stamp').hide();
                    } else {
                        $(this).find('.jobs-toolbox').css('display', 'none');
                        $(this).find('.time-badge').hide();
                        $(this).find('.new-app').show();
                        $(this).find('.time-stamp').show();
                    }
                    e.preventDefault();
                });

                // View application details
                $('.app-item').on('click', function() {
                    var userCredit = $('#hidden-credits').val();
                    if (userCredit == '0') {
                        swal({
                            type: "error",
                            title: "Not enough credit",
                            text: "This action costs you 1 credit and you have 0 credit remaining. Buy more credits?",
                            showCancelButton: true,
                            closeOnConfirm: true,
                            confirmButtonText: "Yes, buy more credits",
                            confirmButtonColor: "#52D5BE"
                        }, function() {
                            $('#billingForm').modal('show');
                        });
                    } else {
                        if (userCredit == '1') {
                            var s = '';
                        } else {
                            var s = 's';
                        }
                        swal({
                            title: "View Application",
                            text: "This action will cost you 1 credit (you have " + userCredit + " credit" + s + " remaining). Continue?",
                            showCancelButton: true,
                            closeOnConfirm: false,
                            confirmButtonText: "Yes, proceed",
                            confirmButtonColor: "#52D5BE"
                        }, function() {
                            var appId = $(this).attr('app-id');
                            $.ajax({
                                url: '/api/job/app' + appId,
                                type: 'GET',
                                dataType: 'json',
                                success: function(result) {
                                    console.log(result);
                                }
                            });
                        });
                    }

                });

                // Pause a job post
                $('body').on('click', '#pauseButton', function() {
                    var jobId = $(this).attr('data-id');
                    swal({
                        title: "Pause Job",
                        text: "You are about to pause a live job posting. Continue?",
                        showCancelButton: true,
                        closeOnConfirm: false,
                        confirmButtonText: "Yes, pause it",
                        confirmButtonColor: "#52D5BE"
                    }, function() {
                        swal.disableButtons();
                        setTimeout(function() {
                            $.ajax({
                                method: "GET",
                                dataType: "json",
                                url: "/api/job/stat/" + jobId,
                                success: function(data) {
                                    if (data.type == 'error') {
                                        swal({
                                            type: data.type,
                                            title: 'Oops..',
                                            text: data.msg,
                                            showCancelButton: false,
                                            confirmButtonColor: "#52D5BE",
                                            confirmButtonText: "OK",
                                        });
                                    } else {
                                        swal({
                                            type: data.type,
                                            title: data.title,
                                            html: data.msg,
                                            timer: 3000,
                                            showCancelButton: false,
                                            showConfirmButton: false
                                        });
                                        setTimeout(function() {
                                            // Get logged user email
                                            var uEmail = $('#user-email').val();
                                            // Refresh the job list
                                            showJobs('/api/jobs/' + uEmail + '/hide');
                                        }, 3500);
                                    }
                                }
                            });
                        }, 2000);
                    });
                });

                // Re-publish a job post
                $('body').on('click', '#publishButton', function() {
                    var jobId = $(this).attr('data-id');
                    swal({
                        title: "Publish Job",
                        text: "You are about to republish your job post that currently paused. Continue?",
                        showCancelButton: true,
                        closeOnConfirm: false,
                        confirmButtonText: "Yes, publish it",
                        confirmButtonColor: "#52D5BE"
                    }, function() {
                        swal.disableButtons();
                        setTimeout(function() {
                            $.ajax({
                                method: "GET",
                                dataType: "json",
                                url: "/api/job/stat/" + jobId,
                                success: function(data) {
                                    if (data.type == 'error') {
                                        swal({
                                            type: data.type,
                                            title: 'Oops..',
                                            text: data.msg,
                                            showCancelButton: false,
                                            confirmButtonColor: "#52D5BE",
                                            confirmButtonText: "OK",
                                        });
                                    } else {
                                        swal({
                                            type: data.type,
                                            title: data.title,
                                            html: data.msg,
                                            timer: 3000,
                                            showCancelButton: false,
                                            showConfirmButton: false
                                        });
                                        setTimeout(function() {
                                            // Get logged user email
                                            var uEmail = $('#user-email').val();
                                            // Refresh the job list
                                            showJobs('/api/jobs/' + uEmail + '/hide');
                                        }, 3500);
                                    }
                                }
                            });
                        }, 2000);
                    });
                });

                // Delete a job post
                $('body').on('click', '#deleteButton', function(e) {
                    e.preventDefault();
                    var jobId = $(this).attr('data-id');
                    swal({
                        title: "Delete Job",
                        text: "You are about to delete a job posting. Are you sure?",
                        showCancelButton: true,
                        closeOnConfirm: false,
                        confirmButtonText: "Yes, delete it",
                        confirmButtonColor: "#b2050d"
                    }, function() {
                        swal.disableButtons();
                        setTimeout(function() {
                            $.ajax({
                                method: "GET",
                                dataType: "json",
                                url: "/api/job/del/" + jobId,
                                success: function(data) {
                                    if (data.type == 'error') {
                                        swal({
                                            type: data.type,
                                            title: 'Oops..',
                                            text: data.msg,
                                            showCancelButton: false,
                                            confirmButtonColor: "#52D5BE",
                                            confirmButtonText: "OK",
                                        });
                                    } else {
                                        swal({
                                            type: data.type,
                                            title: data.title,
                                            html: data.msg,
                                            showCancelButton: false,
                                            confirmButtonColor: "#52D5BE",
                                            confirmButtonText: "OK",
                                        }, function() {
                                            // Get logged user email
                                            var uEmail = $('#user-email').val();
                                            // Refresh the job list
                                            showJobs('/api/jobs/' + uEmail + '/hide');
                                        });
                                    }
                                }
                            });
                        }, 2000);
                    });
                });

                // Restore a job post
                $('body').on('click', '#restoreButton', function(e) {
                    e.preventDefault();
                    var jobId = $(this).attr('data-id');
                    swal({
                        title: "Restore Job",
                        text: "You are about to restore a deleted job posting. Are you sure?",
                        showCancelButton: true,
                        closeOnConfirm: false,
                        confirmButtonText: "Yes, restore it",
                        confirmButtonColor: "#b2050d"
                    }, function() {
                        swal.disableButtons();
                        setTimeout(function() {
                            $.ajax({
                                method: "GET",
                                dataType: "json",
                                url: "/api/job/del/" + jobId,
                                success: function(data) {
                                    if (data.type == 'error') {
                                        swal({
                                            type: data.type,
                                            title: 'Oops..',
                                            text: data.msg,
                                            showCancelButton: false,
                                            confirmButtonColor: "#52D5BE",
                                            confirmButtonText: "OK",
                                        });
                                    } else {
                                        swal({
                                            type: data.type,
                                            title: data.title,
                                            html: data.msg,
                                            showCancelButton: false,
                                            confirmButtonColor: "#52D5BE",
                                            confirmButtonText: "OK",
                                        }, function() {
                                            // Get logged user email
                                            var uEmail = $('#user-email').val();
                                            // Refresh the job list
                                            showJobs('/api/jobs/' + uEmail + '/show');
                                        });
                                    }
                                }
                            });
                        }, 2000);
                    });
                });

                // END OF EVENT HANDLERS

                // Set the job post counter
                if (data.length > 1) var s = "s";
                else var s = "";
                if (delCounter > 0) var del = '<span class="h5 font-montserrat bold text-danger">' + delCounter + " deleted</span>";
                else var del = "";
                if (pauCounter > 0) var pau = '<span class="h5 font-montserrat bold text-warning">' + pauCounter + " paused</span>";
                else var pau = "";
                if (pubCounter > 0) var pub = '<span class="h5 font-montserrat bold text-success">' + pubCounter + " published</span>";
                else var pub = "";
                "" != pub ? "" != pau ? "" != del ? (pub += ", ", pau += " & ") : pub += " & " : pub += "" != del ? " & " : "" : "" != pau ? pau += "" != del ? " & " : "" : "" != del ? pau += "" : pub += "no",
                    $("#job-counter").html("You have " + pub + pau + del + " job post" + s);

            } else { // if no job post at all
                //$('#user-job-counter').hide();
                $('#no-job-post').show();
            }

        }
    });
};
