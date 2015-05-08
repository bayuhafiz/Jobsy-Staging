(function($) {
    'use strict';

    var getBaseURL = function() {
        var url = document.URL;
        return url.substr(0, url.lastIndexOf('/'));
    }

    // Check user mail to matches w/ job email
    var checkJob = function(jobEmail, jobId) {
        var userEmail = $('#user_email').val(); // get user email
        var button = $('#btnToggleSlideUpSize');
        var initialState = button.attr('data-target', '#applyModal').attr('disabled', false).attr('class', 'btn btn-primary btn-animated from-top fa fa-arrow-down apply-job-btn apply').find('#button-text').text('Apply for this job');

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
    }

    // CLEAR JOBLIST FUNCTION
    var clearJobList = function() {
        $('div.list-view-group-container').html('');
        $('div#emailList').html('');
        return true;
    }

    // LOAD JOB LIST FUNCTION ===============================================
    var loadJobList = function(apiUrl) {
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

                    var noJob = '<div class="text-center" style="margin-top: 50%; margin-bottom: auto; height: auto;"><h1 class="hint-text"><br/><i class="fa fa-ban fa-2x"></i><br/>Oops, no job post found!</h1><span class="hint-text">Hint: Try changing your filter preference or your search keyword</span></div>';
                    $('div#emailList').html(noJob);

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
                                        <div class="thumbnail-wrapper d32b-danger" id="list-thumbnail"> \
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
                                            <p class="recipients no-margin" style="font-size:16px;white-space: normal;color: #3b4752;line-height:1.2">' + jobTitle + '</p> \
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

                        li += '<div class="apply-btn" id="btn-apply-job" data-toggle="modal" data-target="#applyModal"><center><i class="fa fa-rocket" style="font-size: 23px;"></i></center><p>Apply now</p></div>\
                                <div class="clearfix"></div> \
                                </li>';

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



                                    emailOpened.find('#opened-thumbnail').html('<img class="img-list" width="30" height="40" style="max-width: none;max-height: none;" alt="" data-src-retina="' + logo + '" data-src="' + logo + '" src="' + logo + '">').attr('class', 'thumbnail-wrapper d48b-danger circular pull-right').css({
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
                    $('#emailList').append(listViewGroupCont).hide().show('slow'); // give it a little effect :P
                    //$("#emailList").ioslist();

                }

            }
        })
    };

    // LOAD JOB LIST FUNCTION (MOBILE!!!) ===================================
    var loadJobListMobile = function(apiUrl) {
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
                    $('#emailList').append(listViewGroupCont).hide().show('slow'); // give it a little effect :P
                    $("#emailList").ioslist();

                }

            }
        })
    };


    // APPLY FILTERS FUNCTION ===============================================
    var applyFilters = function() {
        var filters = $.map($("select.job-filter-dropdown").toArray(), function(e) {
            return $(e).val();
        }).join("/");

        // run the load job list function
        loadJobList('/api/jobs/' + filters);
    }


    function nl2br(str, is_xhtml) {
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }

    function replaceDash(str) {
        return str.replace(/-/g, ' ');
    }

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function stripHTML(string) {
        var temp = string;
        var $temp = $(temp).find('span,p').contents().unwrap().end().end();
        return $temp;
    }


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


    // BEGIN DOCUMENT ON READY FN ##############################################
    $(document).ready(function() {

        
        // Load job list
        loadJobList('/api/jobs');


        //$('.cropme').simpleCropper();


        // Initiate filters dropdown
        $('select#category-filter').select2();
        $('select#location-filter').select2();
        $('select#jobType-filter').select2();

        // Tagged filters values
        $('#s2id_category-filter div.select2-drop').addClass('category_filter_dropdown');
        $('#s2id_location-filter div.select2-drop').addClass('location_filter_dropdown');
        $('#s2id_jobType-filter div.select2-drop').addClass('jobType_filter_dropdown');


        // Infinite scroll trigger /////
        $('#item-list').jscroll({
            loadingHtml: '<img src="loading.gif" alt="Loading" /> Loading...',
            padding: 20,
            contentSelector: 'li'
        });


        // CKEditor configuration ////
        var user = $('#user_email').val();
        if (user == 'none') {
            CKEDITOR.inline('editor4');
        } else {
            CKEDITOR.inline('editor1');
            CKEDITOR.inline('editor2');
            CKEDITOR.inline('editor3');
        }


        // Create job form logic for each user ////
        var initLogin = $('#init-login').val();
        if (initLogin) {
            // Init create form wizard
            formWizard1();

            if (initLogin == 'false') {
                var logo = $('#hidden-logo').val();
                $('#savedLogo').val(logo);

                var location = $('#hidden-location').val();
                $('#create-job-location-dropdown').select2('val', location);

                $('#createWizard').bootstrapWizard('show', 1);
            }
        }


        // FORM VALIDATION HANDLER ///
        $('#form-login').validate();
        $('#form-register').validate();
        $('#form-forgot').validate();
        $('#form-create-job').validate();
        $('#form-edit').validate();
        $('#form-register').validate();
        $('#applyForm').validate();


        // create user avatar based on name initial //////
        $('#user-avatar').initial({
            width: 80,
            height: 80,
            charCount: 2,
            fontSize: 45
        });

        // Notification show up /////
        var msg = $('.msg-container').text();
        var type = $('.msg-container').attr('data-type');
        if (msg) {
            $('body').pgNotification({
                'message': msg,
                'type': type,
                'style': 'flip',
                'position': 'top-left',
                'timeout': '5000'
            }).show();
        }



        // ========================
        // START EVENT HANDLERS ===
        // ========================

        // =========== OPEN JOB DETAILS HANDLER ======================
        $('body').on('click', '.item', function(e) {
            $(this).find('.apply-btn').animate({
                    'right': '0px'
                }).end().siblings()
                .find('.apply-btn').animate({
                    'right': '-240px'
                });


            $('.details-list-box').css({
                'position': 'relative'
            })
            $(this).find('.details-list-box').animate({
                    'left': '-110px'
                }).end().siblings()
                .find('.details-list-box').animate({
                    'left': '0px'
                });

            $('.img-list-box').css({
                'position': 'relative'
            })
            $(this).find('.img-list-box').animate({
                    'left': '-120px'
                }).end().siblings()
                .find('.img-list-box').animate({
                    'left': '0px'
                });


            $('.list-view-group-container li').attr('data', '');
            $(this).attr('data', 'active');

            // hide dropdown filter (mobile only)
            $('.mobile-dropdown').hide();

            e.stopPropagation();

            var id = $(this).attr('data-id');
            var email = null;
            var thumbnailWrapper = $(this).find('.thumbnail-wrapper');

            $.ajax({
                dataType: "json",
                url: "/api/job/" + id,
                success: function(data) {

                    //if (data != null) return;
                    var emailOpened = $('.email-opened');
                    var loc = capitalize(data.profile.location);
                    var jobType = capitalize(data.details.jobType);
                    var jobScopeText = nl2br(data.details.jobScope);
                    var requirementsText = nl2br(data.details.requirements);

                    emailOpened.find('.profile .name').text(data.profile.name.toUpperCase());
                    emailOpened.find('.profile .job-title').text(data.details.jobTitle);
                    emailOpened.find('.profile .datetime').text(replaceDash(loc) + ' - ' + replaceDash(jobType));
                    emailOpened.find('.company_overview p').text(data.profile.description);
                    emailOpened.find('.details .salary .salary-from').text(data.details.currency.toUpperCase() + ' ' + data.details.salaryFrom);
                    emailOpened.find('.details .salary .salary-to').text(data.details.salaryTo);
                    emailOpened.find('.details .salary-type').text('/ ' + data.details.salaryType);
                    emailOpened.find('.company_overview').html(data.profile.description);
                    emailOpened.find('.job_scope').html(jobScopeText);
                    emailOpened.find('.requirements').html(requirementsText);

                    var thumbnailClasses = thumbnailWrapper.attr('class').replace('d32', 'd48');
                    emailOpened.find('#opened-thumbnail').html(thumbnailWrapper.html()).attr('class', thumbnailClasses).addClass('circular pull-right');
                    emailOpened.find('.img-list').css({
                        "max-width": "none",
                        "max-height": "none"
                    });

                    $('.no-email').hide();
                    $('.actions-dropdown').toggle();
                    $('.email-content').hide().fadeIn();
                    $('.actions, .email-content-wrapper').show();
                    $('.email-content-wrapper .email-content').fadeIn();
                    if ($.Pages.isVisibleSm() || $.Pages.isVisibleXs()) {
                        $('.email-list').toggleClass('slideLeft');
                    }

                    $(".email-content-wrapper").scrollTop(0);
                    $('#applyForm').attr('action', '/apply/' + id);

                    checkJob(data.email, id);

                }
            });
        });


        
        // Buy Credits buttons HANDLER
        $('#btnBuy1').click(function() {
            var url = '/buy/1';
            window.location.href = url;
            return false;
        });
        $('#btnBuy5').click(function() {
            var url = '/buy/5';
            window.location.href = url;
            return false;
        });
        $('#btnBuy10').click(function() {
            var url = '/buy/10';
            window.location.href = url;
            return false;
        });


        //////////////// SEARCH INPUT HANDLER //////////////
        $(".searchJob").on("keyup", function(e) {
            var keyword = $(this).val();
            // clear job list
            clearJobList();
            // call search function
            loadJobList('/api/search/' + keyword);

            e.preventDefault;
        });

        /*$('.searchJob').blur(function () {
             $('.filter-box').css('display','none');
        });*/


        $('body').on("click", '.clear-search', function() {
            if ($(".searchJob").val() != '') {
                // remove clear icon
                $('.clear-search').css('display', 'none');
                loadJobList('/api/jobs');
                //$(this).css('display', 'none'); 
                $(".searchJob").val('').attr('placeholder', 'Search here..');
            }
        });

        $(".searchJob").on("focus", function() {
            $('.filter-box').slideDown('fast');
            $(this).attr('placeholder', '');
        });

        $(document).mouseup(function(e) {
            var container = $('.filter-box');
            var searchBox = $('.searchJob');
            var filters = $('#select2-drop-mask');

            if (!container.is(e.target) // if the target of the click isn't the container...
                && !searchBox.is(e.target) // nor the search box...
                && !filters.is(e.target) // nor the filters also...
                && container.has(e.target).length === 0) // ... nor a descendant of the container
            {
                if (searchBox.val() == '') {
                    $(".searchJob").val('').attr('placeholder', 'Search here..');
                }
                container.slideUp('fast');
            }
        });
        ///////////// END OF SEARCH INPUT HANDLER //////////////


        ////////////////// DROPDOWN FILTERS HANDLER //////////////////
        $('select#category-filter').change(function() {
            var a = $(this).select2('val');
            if (a == 'all') {
                $('span.searchJob_tag span.category_tag span').text('')
            } else {
                $('span.searchJob_tag span.category_tag').show();
                $('span.searchJob_tag span.category_tag span').text(a);
            }
            // Run the filters
            applyFilters();
        });

        $('select#location-filter').change(function() {
            var a = $(this).select2('val');
            if (a == 'all') {
                $('span.searchJob_tag span.location_tag span').text('');
            } else {
                $('span.searchJob_tag span.location_tag').show();
                $('span.searchJob_tag span.location_tag span').text(a);
            }
            // Apply the filters
            applyFilters();
        });

        $('select#jobType-filter').change(function() {
            var a = $(this).select2('val');
            if (a == 'all') {
                $('span.searchJob_tag span.jobType_tag span').text('');
            } else {
                $('span.searchJob_tag span.jobType_tag').show();
                $('span.searchJob_tag span.jobType_tag span').text(a);
            }
            // Apply the filters
            applyFilters();
        });

        // handler for deleting tags
        $('body').on('click', '.tags_filter_close', function() {
            var tag_type = $(this).parent('span').attr('class');
            if (tag_type == 'category_tag') {
                $("select#category-filter").select2("val", "");
            } else if (tag_type == 'location_tag') {
                $("select#location-filter").select2("val", "");
            } else if (tag_type == 'jobType_tag') {
                $("select#jobType-filter").select2("val", "");
            }
            $(this).siblings('span').html('').parent('span').css('display', 'none');

            // Apply the filters
            applyFilters();
        });

        // Handler for mobile filters
        $("select.mobile-filter-dropdown").on("change", function() { // For mobile only!!!
            var filters = $.map($("select.mobile-filter-dropdown").toArray(), function(e) {
                return $(e).val();
            }).join("/");

            // run the load job list function
            loadJobListMobile('/api/jobs/' + filters);
        });

        // Handler for reset button
        $("#btn-clear-filters").click(function(e) {
            // Reset all filters' value
            $("select.job-filter-dropdown").select2('val', 'all');
            // Hide all tags
            $('span.searchJob_tag span.category_tag').hide();
            $('span.searchJob_tag span.category_tag span').text('');
            $('span.searchJob_tag span.location_tag').hide();
            $('span.searchJob_tag span.location_tag span').text('');
            $('span.searchJob_tag span.jobType_tag').hide();
            $('span.searchJob_tag span.jobType_tag span').text('');
            // Apply the filters
            applyFilters();

            $(".searchJob").val('').attr('placeholder', 'Search here..');

            e.preventDefault();
        });


        // add mousedown handler on select2 mask to close dropdown /////
        /*$(document).on('mousedown', '#select2-drop-mask', function() {
            $('.job-filter-dropdown.open').removeClass('open');
            $('.job-dropdown.open').removeClass('open');
        });*/

        //////////////// END OF FILTERS HANDLER //////////////


        // JOB LIST HANDLER /////
        $('body').on('click', '.item .checkbox', function(e) {
            e.stopPropagation();
        });


        // BASIC BUTTONS HANDLER ////
        $('.firstTab,.btn-previous').click(function() {
            $('.btn-previous').hide();
        });

        $('.secondTab,.btn-next').click(function() {
            $('.btn-previous').show();
        });

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

        $('.toggle-email-sidebar').click(function(e) {
            e.stopPropagation();
            $('.email-sidebar').toggle();
        });

        $('.email-list-toggle').click(function() {
            $('.email-list').toggleClass('slideLeft');
        });

        $('.email-sidebar').click(function(e) {
            e.stopPropagation();
        })


        // FILTERS CONTROL ON MOBILE
        $(window).resize(function() {
            if ($(window).width() <= 1024) {
                $('.email-sidebar').hide();

            } else {
                $('.email-list').removeClass('slideLeft');
                $('.email-sidebar').show();
            }
        });

        $("a[href='#list']").click(function() {
            // show dropdown filter (mobile only)
            $('.mobile-dropdown').show();
        });


        // =============  EDIT JOB HANDLER ===============
        $('body').on('click', '.edit', function() {

            formWizard2();
            $('#editWizard').bootstrapWizard('show', 0);

            var id = $(this).attr('data-id');
            var email = null;
            var thumbnailWrapper = $(this).find('.thumbnail-wrapper');

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

                    //if (data != null) return;
                    var loc = capitalize(data.profile.location);
                    var jobType = capitalize(data.details.jobType);
                    var jobScopeText = nl2br(data.details.jobScope);
                    var requirementsText = nl2br(data.details.requirements);

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
            });
        });


        // =============  APPLY JOB HANDLER ===============
        $('body').on('click', '#btnToggleSlideUpSize', function(e) {

            var jobTitle = $('.profile .job-title').text();
            var companyName = $('.profile .name').text();
            var location = $('.profile .datetime').text();

            console.log(jobTitle + ' at ' + companyName);

            $('#app-to').text(jobTitle + ' at ' + companyName);

        });

        $('body').on('click', '.apply-btn', function(e) {

            var jobTitle = $('.profile .job-title').text();
            var companyName = $('.profile .name').text();
            var location = $('.profile .datetime').text();

            console.log(jobTitle + ' at ' + companyName);

            $('#app-to').text(jobTitle + ' at ' + companyName);


            $('#applyModal').modal({
                'show':true
            });
            
            e.stopPropagation();
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
        // end of Overlay trigger button /////

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

    });


})(window.jQuery);
