// Check user mail to matches w/ job email
window.checkJob = function(jobEmail, jobId) {
    var userEmail = $('#user_email').val(); // get user email
    var button = $('#btnToggleSlideUpSize');
    var initialState = button.attr('disabled', false).attr('class', 'btn btn-primary btn-animated from-top fa fa-arrow-down apply-job-btn apply').find('#button-text').text('Apply for this job');

    if (userEmail == 'none') {
        initialState;
    } else {
        if (userEmail == jobEmail) {
            initialState;
            $('#button-text').text('Edit this job');
            button.attr('data-id', jobId).attr('data-target', '#EditJob').attr('class', 'btn btn-primary btn-animated from-top fa fa-pencil apply-job-btn edit').css({
                'right': '0',
                'margin-top': '7px',
                'margin-right': '21px',
                'position': 'absolute'
            });
        } else if (userEmail != jobEmail) {
            initialState;
            $('#button-text').text('You cannot edit this job...');
            button.attr('class', 'btn btn-danger apply-job-btn').css({
                'right': '0',
                'margin-top': '7px',
                'margin-right': '21px',
                'position': 'absolute'
            }).attr('disabled', true);
        }
    }
};

// CLEAR JOBLIST FUNCTION
window.clearJobList = function() {
    $('div.list-view-group-container').html('');
    $('div#emailList').html('');
    return true;
};

// LOAD JOB LIST FUNCTION ===============================================
window.loadJobList = function(apiUrl) {
    $.ajax({
        dataType: "json",
        url: apiUrl,
        success: function(data) {

            var listViewGroupCont = $('<div/>', {
                "class": "list-view-group-container"
            });

            /*listViewGroupCont.html('<h2 class="list-view-group-header">JOB BOARD</h2>');*/

            clearJobList(); // clear the list before we do the magic

            if (data.length == 0) { // If there is no job to display

                var noJob = '<div class="text-center" style="margin-top: 50%; margin-bottom: auto; height: auto;"><h1 class="hint-text no-job"><br/><i class="fa fa-ban fa-2x"></i><br/>Oops, no job post found!</h1><span class="hint-text">Hint: Try changing your filter preference or your search keyword</span></div>';
                $('div#emailList').html(noJob);

                $('div.email-opened .email-content-wrapper').css('display', 'none');
                $('div.email-opened .no-email').show();

            } else {

                // Get logged user's email
                var userEmail = $('#user_email').val();

                // Let's do the magic!

                var ul = $('<ul/>', {
                    "id": "item-list",
                    "class": "no-padding"
                });

                $.each(data, function(i) {
                    var id = data[i]._id;
                    if (data[i].profile.logo) {
                        var logo = 'uploads/logo/' + data[i].profile.logo;
                    }
                    var name = data[i].profile.name.toUpperCase();
                    //var smLocation = data[i].profile.location;
                    var location = capitalize(data[i].profile.location);
                    //var description = data[i].profile.description;
                    var jobTitle = data[i].details.jobTitle;
                    var category = data[i].details.category;
                    //var smJobType = data[i].details.jobType;
                    var jobType = capitalize(data[i].details.jobType);
                    //var jobScope = data[i].details.jobScope;
                    //var requirements = data[i].details.requirements;
                    //var currency = data[i].details.currency.toUpperCase();
                    //var salaryFrom = data[i].details.salaryFrom;
                    //var salaryTo = data[i].details.salaryTo;
                    //var salaryType = data[i].details.salaryType;

                    // Time manipulation
                    var now = moment(Date.now());
                    var dueDate = moment(data[i].createdAt).add(30, 'd');
                    var diff = dueDate.diff(now, 'days');

                    var li = '';
                    if (i == 0) {
                        li += '<li class="item padding-15" data-id="' + id + '" job-index="' + i + '"data="active">';
                    } else {
                        li += '<li class="item padding-15" data-id="' + id + '" job-index="' + i + '">';
                    }

                    li += '<div class="middle img-list-box"> \
                                        <div class="thumbnail-wrapper circular d32b-danger" id="list-thumbnail" style="width:55px;height:55px;"> \
                                            <img class="img-list" alt="" data-src-retina="' + logo + '" data-src="' + logo + '" src="' + logo + '"> \
                                        </div> \
                                    </div> \
                                    <div class="checkbox  no-margin p-l-10"> \
                                        <input type="checkbox" value="1" id="emailcheckbox"> \
                                        <label for="emailcheckbox"></label> \
                                    </div> \
                                    <div class="middle details-list-box"> \
                                        <div class="inline"> \
                                            <p class="recipients no-margin hint-text small">' + name + '</p> \
                                            <p class="recipients no-margin" style="font-size:16px;white-space: normal;color: #3b4752;line-height:1.2">' + jobTitle + '</p> \
                                            <p class="recipients no-margin hint-text small"> \
                                             ' + replaceDash(location) + ', ' + replaceDash(jobType) + ' \
                                            </p> \
                                        </div> \
                                    </div>';

                    li += '<div class="datetime"><span class="hint-text bold">' + moment(data[i].createdAt).format('ddd, D MMM') + '</span></div>';

                    if (userEmail == 'none') {
                        li += '<div class="apply-btn" id="btn-apply-job" data-toggle="modal" data-target="#applyModal"><center><i class="fa fa-rocket" style="font-size: 23px;"></i></center><p>Apply now</p></div>\
                                <div class="clearfix"></div> \
                                </li>';
                    } else {
                        if (userEmail != data[i].email) {
                            li += '<div class="apply-btn" style="background-color:#cd5f64;width:30%"><center><i class="fa fa-ban" style="font-size: 23px;"></i></center><p>Logout to apply</p></div>\
                                <div class="clearfix"></div> \
                                </li>';
                        } else {
                            li += '<div class="apply-btn" id="btn-edit-job" data-toggle="modal" data-target="#EditJob"><center><i class="fa fa-pencil" style="font-size: 23px;"></i></center><p>Edit this post</p></div>\
                                <div class="clearfix"></div> \
                                </li>';
                        }
                    }


                    ul.append(li);

                    if (i == 0) { // AUTO OPEN FIRST INDEXED JOB POST
                        $.ajax({
                            dataType: "json",
                            url: "/api/job/" + id,
                            success: function(data) {
                                var li = $("li[data-id='" + data._id + "']");

                                li.find('.apply-btn').animate({
                                        'right': '0px'
                                    }).end().siblings()
                                    .find('.apply-btn').animate({
                                        'right': '-240px'
                                    });


                                $('.details-list-box').css({
                                    'position': 'relative'
                                })
                                li.find('.details-list-box').animate({
                                        'left': '-110px'
                                    }).end().siblings()
                                    .find('.details-list-box').animate({
                                        'left': '0px'
                                    });

                                $('.img-list-box').css({
                                    'position': 'relative'
                                })
                                li.find('.img-list-box').animate({
                                        'left': '-120px'
                                    }).end().siblings()
                                    .find('.img-list-box').animate({
                                        'left': '0px'
                                    });

                                // hide dropdown filter (mobile only)
                                $('.mobile-dropdown').hide();

                                //if (data != null) return;
                                var emailOpened = $('.email-opened');
                                var loc = capitalize(data.profile.location);
                                var jobType = capitalize(data.details.jobType);
                                var jobScopeText = nl2br(data.details.jobScope);
                                var requirementsText = nl2br(data.details.requirements);

                                emailOpened.find('.profile .name').text(data.profile.name.toUpperCase());
                                emailOpened.find('.profile .job-title').text(data.details.jobTitle);
                                emailOpened.find('.profile .datetime').text(replaceDash(loc) + ' - ' + replaceDash(jobType));
                                emailOpened.find('.company_overview').html(data.profile.description);
                                emailOpened.find('.details .salary .salary-from').text(data.details.currency.toUpperCase() + ' ' + data.details.salaryFrom);
                                emailOpened.find('.details .salary .salary-to').text(data.details.salaryTo);
                                emailOpened.find('.details .salary-type').text('/ ' + data.details.salaryType);
                                emailOpened.find('.job_scope').html(jobScopeText);
                                emailOpened.find('.requirements').html(requirementsText);



                                emailOpened.find('#opened-thumbnail').html('<img class="img-list" alt="" data-src-retina="' + logo + '" data-src="' + logo + '" src="' + logo + '">').attr('class', 'thumbnail-wrapper d48b-danger circular pull-right').css({
                                    'width': '129px',
                                    'height': '129px'
                                });

                                $('.no-email').hide();
                                $('.actions-dropdown').toggle();
                                $('.email-content').hide().fadeIn();
                                $('.actions, .email-content-wrapper').show();

                                if ($.Pages.isVisibleSm() || $.Pages.isVisibleXs()) {
                                    $('.email-list').toggleClass('slideLeft');
                                }

                                $(".email-content-wrapper").scrollTop(0);
                                $('#applyForm').attr('action', '/apply/' + id);

                                checkJob(data.email, id);

                            }
                        });
                    }

                });

                listViewGroupCont.append(ul);
                $('#emailList').append(listViewGroupCont).hide().show('medium'); // give it a little effect :P
                //$("#emailList").ioslist();

            }

        }
    })
};

// LOAD JOB LIST FUNCTION (MOBILE!!!) ===================================
window.loadJobListMobile = function(apiUrl) {
    $.ajax({
        dataType: "json",
        url: apiUrl,
        success: function(data) {

            $('div.list-view-wrapper').html(''); // clear the list before we do the magic

            var listViewGroupCont = $('<div/>', {
                "class": "list-view-group-container"
            });

            /*listViewGroupCont.html('<div class="list-view-group-header"><span>Job Board</span></div>');*/

            if (data.length < 1) { // If there is no job to display

                var noJob = '<div class="text-center" style="margin-top: auto; margin-bottom: auto;"><h1 class="hint-text"><br/><i class="fa fa-ban fa-2x"></i><br/>oops, no job post found!</h1><span class="hint-text">Hint: Try changing your filter preference or your search keyword</span></div>';
                $('.list-view-wrapper').html(noJob);

                $('div.email-opened .email-content-wrapper').css('display', 'none');
                $('div.email-opened .no-email').show();

            } else {

                // Let's do the magic!

                var ul = $('<ul/>', {
                    "id": "item-list",
                    "class": "no-padding"
                });

                $.each(data, function(i) {
                    var id = data[i]._id;
                    var logo = 'uploads/logo/' + data[i].profile.logo;
                    var name = data[i].profile.name.toUpperCase();
                    var smLocation = data[i].profile.location;
                    var location = capitalize(data[i].profile.location);
                    var description = data[i].profile.description;
                    var jobTitle = data[i].details.jobTitle;
                    var category = data[i].details.category;
                    var smJobType = data[i].details.jobType;
                    var jobType = capitalize(data[i].details.jobType);
                    var jobScope = data[i].details.jobScope;
                    var requirements = data[i].details.requirements;
                    var currency = data[i].details.currency.toUpperCase();
                    var salaryFrom = data[i].details.salaryFrom;
                    var salaryTo = data[i].details.salaryTo;
                    var salaryType = data[i].details.salaryType;

                    // Time manipulation
                    var now = moment(Date.now());
                    var dueDate = moment(data[i].createdAt).add(30, 'd');
                    var diff = dueDate.diff(now, 'days');

                    var li = '';
                    if (i == 0) {
                        li += '<li class="item padding-15" data-id="' + id + '" job-index="' + i + '" style="height:110px;" data="active">';
                    } else {
                        li += '<li class="item padding-15" data-id="' + id + '" job-index="' + i + '" style="height:110px;">';
                    }

                    li += '<div class="middle img-list-box"> \
                                        <div class="thumbnail-wrapper d32b-danger" id="list-thumbnail" style="max-width:90px; max-height:90px;"> \
                                            <img class="img-list" width="30" height="40" alt="" data-src-retina="' + logo + '" data-src="' + logo + '" src="' + logo + '"> \
                                        </div> \
                                    </div> \
                                    <div class="checkbox  no-margin p-l-10"> \
                                        <input type="checkbox" value="1" id="emailcheckbox"> \
                                        <label for="emailcheckbox"></label> \
                                    </div> \
                                    <div class="middle details-list-box"> \
                                        <div class="inline"> \
                                            <p class="recipients no-margin hint-text small">' + name + '</p> \
                                            <p class="recipients no-margin" style="font-size:16px;white-space: normal;color: #3b4752;">' + jobTitle + '</p> \
                                            <p class="recipients no-margin hint-text small"> \
                                             ' + replaceDash(location) + ', ' + replaceDash(jobType) + ' \
                                            </p> \
                                        </div> \
                                    </div>';
                    if (diff <= 3) {
                        if (diff == 1) {
                            li += '<div class="datetime"><span class="text-danger bold">' + diff + ' day left</span></div>';
                        } else {
                            li += '<div class="datetime"><span class="text-danger bold">' + diff + ' days left</span></div>';
                        }
                    } else {
                        li += '<div class="datetime"><span class="hint-text bold">' + diff + ' days left</span></div>';
                    }

                    li += '<p class="job-title job-title-hover bold" style="right:20px;line-height: 28px;position: absolute;opacity:0">' + currency + ' ' + salaryFrom + ' - ' + salaryTo + '</p> \
                                    <div class="clearfix"></div> \
                                </li>';

                    ul.append(li);

                });

                listViewGroupCont.append(ul);
                $('#emailList').append(listViewGroupCont).hide().show('medium'); // give it a little effect :P
                $("#emailList").ioslist();

            }

        }
    })
};

// APPLY FILTERS FUNCTION ===============================================
window.applyFilters = function() {
    var filters = $.map($("select.job-filter-dropdown").toArray(), function(e) {
        return $(e).val();
    }).join("/");

    // run the load job list function
    loadJobList('/api/jobs/' + filters);
};
