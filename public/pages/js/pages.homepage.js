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
        var initialState = button.attr('data-target', '#applyModal').attr('disabled', false).attr('class', 'btn btn-complete btn-animated from-top fa fa-arrow-down').find('#button-text').text('Apply for this job');

        if (userEmail == 'none') {
            initialState;
        } else {
            if (userEmail == jobEmail) {
                initialState;
                $('#button-text').text('Edit this job');
                button.attr('data-id', jobId).attr('data-target', '#EditJob').attr('class', 'btn btn-success btn-animated from-top fa fa-pencil').css('right', '0').css('margin-top', '7px').css('margin-right', '21px').css('position', 'absolute');
            } else if (userEmail != jobEmail) {
                initialState;
                button.attr('disabled', true);
            }
        }
    }

    // LOAD JOB LIST FUNCTION ==================================
    var loadJobList = function(apiUrl) {
        $.ajax({
            dataType: "json",
            url: apiUrl,
            success: function(data) {

                var listViewGroupCont = $('<div/>', {
                    "class": "list-view-group-container"
                });

                $('div.list-view-wrapper').html(''); // clear the list before we do the magic

                if (data.length < 1) { // If there is no job to display

                    var noJob = '<div class="text-center" style="margin-top: auto; margin-bottom: auto;"><h1 class="hint-text"><br/><i class="fa fa-ban fa-2x"></i><br/>oops, no job post found!</h1><span class="hint-text">Hint: Try changing your filter preference or your search keyword</span></div>';
                    $('.list-view-wrapper').html(noJob);

                    $('div.email-opened .email-content-wrapper').css('display', 'none');
                    $('div.email-opened .no-email').show();

                } else {

                    // Let's do the magic!
                    listViewGroupCont.append('<div class="list-view-group-header"><span>Job Lists</span></div>');

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

                        li += '<div class="middle img-list-box" style="width: 110px;"> \
                                        <div class="thumbnail-wrapper d32b-danger" id="list-thumbnail" style="max-width:90px; max-height:90px;"> \
                                            <img class="img-list" style="margin-left: auto;margin-right: auto;display: block;max-width:79px;max-height:79px; width:auto; height:auto" width="30" height="40" alt="" data-src-retina="' + logo + '" data-src="' + logo + '" src="' + logo + '"> \
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

                        if (i == 0) { // AUTO OPEN FIRST INDEXED JOB POST
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

                                    emailOpened.find('.profile .name').text(data.profile.name);
                                    emailOpened.find('.profile .job-title').text(data.details.jobTitle);
                                    emailOpened.find('.profile .datetime').text(replaceDash(loc) + ' - ' + replaceDash(jobType));
                                    emailOpened.find('.company_overview').html(data.profile.description);
                                    emailOpened.find('.details .salary .salary-from').text(data.details.currency.toUpperCase() + ' ' + data.details.salaryFrom);
                                    emailOpened.find('.details .salary .salary-to').text(data.details.salaryTo);
                                    emailOpened.find('.details .salary-type').text('/ ' + data.details.salaryType);
                                    emailOpened.find('.job_scope').html(jobScopeText);
                                    emailOpened.find('.requirements').html(requirementsText);



                                    emailOpened.find('#opened-thumbnail').html('<img class="img-list" style="margin-left: auto;margin-right: auto;display: block;max-width:79px;max-height:79px; width:auto; height:auto" width="30" height="40" alt="" data-src-retina="' + logo + '" data-src="' + logo + '" src="' + logo + '">').attr('class', 'thumbnail-wrapper d48b-danger');

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
                    $("#emailList").ioslist();

                }

            }
        })
    };


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



    // BEGIN DOCUMENT ON READY FN ##############################################
    $(document).ready(function() {

        loadJobList('/api/jobs');

        // Infinite scroll trigger /////
        $('#item-list').jscroll({
            loadingHtml: '<img src="loading.gif" alt="Loading" /> Loading...',
            padding: 20,
            contentSelector: 'li'
        });

        // CKEditor configuration ////
        CKEDITOR.inline('editor1');
        CKEDITOR.inline('editor2');
        CKEDITOR.inline('editor3');
        CKEDITOR.inline('editor4');


        // Create job form logic for each user ////
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

        // FORM VALIDATION HANDLER ///
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


        // Input masking /////
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


        /// disable previous btn func ///
        if ($('.firstTab').hasClass('active')) {
            $('.btn-previous').hide();
        };

        if ($('.secondTab').hasClass('active')) {
            $('.btn-previous').show();
        }

        // form wizard configurations  ////
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



        // ========================
        // START EVENT HANDLERS ===
        // ========================

        // SEARCH INPUT HANDLER //////
        $(".searchJob").on("keyup", function() {
            var q = $(this).val();
            /*if (q == '') {
                $('.clear-search').css('display', 'none'); // remove clear icon
                loadJobList('/api/jobs');
            } else {
                if ($('.clear-search').css('display') == 'none') {
                    $('.clear-search').css('display', 'inline'); // add clear icon
                }
                // run the load job list function
                //loadJobList('/api/jobs/s/' + q);
            }*/
            var g = q.toLowerCase();

            $("li.item div.details-list-box div.inline").each(function() {
                var s = $(this).text().toLowerCase();
                $(this).closest('li.item')[s.indexOf(g) !== -1 ? 'show' : 'hide']();
            });

        });

        $('body').on("click", '.clear-search', function() {
            if ($(".searchJob").val() != '') {
                // remove clear icon
                $(".searchJob").val('');
                $('.clear-search').css('display', 'none');
                loadJobList('/api/jobs');
                //$(this).css('display', 'none'); 
            }
        });

        $(".searchJob").on("focus", function() {
            $(this).attr('placeholder', '');
        });

        $(".searchJob").on("blur", function() {
            var q = $(this).text();
            if (q == '') {
                //$('.clear-search').css('display', 'none'); // remove clear icon
                $(this).attr('placeholder', 'Search here..');
            }
        });



        // DROPDOWN FILTERS HANDLER ////
        $("select.job-filter-dropdown").on("change", function() {
            var filters = $.map($("select.job-filter-dropdown").toArray(), function(e) {
                return $(e).val();
            }).join("/");

            // run the load job list function
            loadJobList('/api/jobs/' + filters);
        });

        $("a[href='#reset']").click(function() {

            $("select.job-filter-dropdown").select2('val', 'all');

            var filters = $.map($("select.job-filter-dropdown").toArray(), function(e) {
                return $(e).val();
            }).join("/");

            // run the load job list function
            loadJobList('/api/jobs/' + filters);
        });


        // add mousedown handler on select2 mask to close dropdown /////
        $(document).on('mousedown', '#select2-drop-mask', function() {
            $('.job-filter-dropdown.open').removeClass('open');
            $('.job-dropdown.open').removeClass('open');
        });


        // JOB LIST HANDLER /////
        $('body').on('click', '.item .checkbox', function(e) {
            e.stopPropagation();
        });

        $('body').on('mouseenter', '.item', function(e) {
            $(this).children('.job-title').animate({
                'right': '20px',
                'opacity': '1'
            });

            $(this).children('.datetime').css('opacity', '0');
        });

        $('body').on('mouseleave', '.item', function(e) {
            $(this).children('.job-title').animate({
                'right': '0px',
                'opacity': '0'
            });

            $(this).children('.datetime').css('opacity', '1');
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


        // =========== OPEN JOB DETAILS HANDLER ======================
        $('body').on('click', '.item', function(e) {

            $('.list-view-group-container li').attr('data', '');
            $(this).attr('data', 'active');

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

                    emailOpened.find('.profile .name').text(data.profile.name);
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
                    emailOpened.find('#opened-thumbnail').html(thumbnailWrapper.html()).attr('class', thumbnailClasses);

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

        $(window).resize(function() {

            if ($(window).width() <= 1024) {
                $('.email-sidebar').hide();

            } else {
                $('.email-list').removeClass('slideLeft');
                $('.email-sidebar').show();
            }
        });


        // =============  APPLY JOB HANDLER ===============
        $('#btnToggleSlideUpSize').click(function() {
            var jobTitle = $('.profile .job-title').text();
            var companyName = $('.profile .name').text();
            var location = $('.profile .datetime').text();

            $('#app-to').text(jobTitle + ' at ' + companyName);
        });

        // ============== EDIT JOB FUNCTION ==========================
        $('#btnToggleSlideUpSize').click(function() {
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
                url: "/api/job/edit/" + id,
                success: function(data) {
                    if (data) {
                        var img = 'uploads/logo/' + data.profile.logo;
                        $('#EditJob div.panel form#form-edit input#oldJobImg').attr('value', data.profile.logo);
                        $('#EditJob div.panel form#form-edit img#editJobImg-preview').attr('src', img);
                        $('#EditJob div.panel form#form-edit input.companyName').attr('value', data.profile.name);

                        editor1.setData(data.profile.description);
                        editor2.setData(data.details.jobScope);
                        editor3.setData(data.details.requirements);

                        $('#EditJob div.panel form#form-edit input.jobTitle').attr('value', data.details.jobTitle);

                        var loc = data.profile.location;
                        $("select#location-edit").select2('val', loc);

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
                        $('#EditJob div.panel form#form-edit select#jobType option:selected').val(data.details.jobType);


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

        $('#btnToggleSlideUpSize').click(function() {
            var jobTitle = $('.profile .job-title').text();
            var companyName = $('.profile .name').text();
            var location = $('.profile .datetime').text();

            $('#app-to').text(jobTitle + ' at ' + companyName + ' ( ' + location + ' )');
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


    });


})(window.jQuery);
