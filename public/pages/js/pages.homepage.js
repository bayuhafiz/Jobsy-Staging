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

    // ============================ LOAD JOB LIST FUNCTION ==================================

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
    // =================================== END OF LOAD JOB LIST FUNCTION ===============================================

    // Wysiwyg editor custom options

    var editorTemplate = {
        "font-styles": function(locale) {
            return '<li class="dropdown dropup">' + '<a data-toggle="dropdown" class="btn btn-default dropdown-toggle ">    <span class="glyphicon glyphicon-font"></span>    <span class="current-font">Normal text</span>    <b class="caret"></b>  </a>' + '<ul class="dropdown-menu">    <li><a tabindex="-1" data-wysihtml5-command-value="p" data-wysihtml5-command="formatBlock" href="javascript:;" unselectable="on">Normal text</a></li>     <li><a tabindex="-1" data-wysihtml5-command-value="h1" data-wysihtml5-command="formatBlock" href="javascript:;" unselectable="on">Heading 1</a></li>    <li><a tabindex="-1" data-wysihtml5-command-value="h2" data-wysihtml5-command="formatBlock" href="javascript:;" unselectable="on">Heading 2</a></li>    <li><a tabindex="-1" data-wysihtml5-command-value="h3" data-wysihtml5-command="formatBlock" href="javascript:;" unselectable="on">Heading 3</a></li>    <li><a tabindex="-1" data-wysihtml5-command-value="h4" data-wysihtml5-command="formatBlock" href="javascript:;" unselectable="on">Heading 4</a></li>    <li><a tabindex="-1" data-wysihtml5-command-value="h5" data-wysihtml5-command="formatBlock" href="javascript:;" unselectable="on">Heading 5</a></li>    <li><a tabindex="-1" data-wysihtml5-command-value="h6" data-wysihtml5-command="formatBlock" href="javascript:;" unselectable="on">Heading 6</a></li>  </ul>' + '</li>';
        },
        emphasis: function(locale) {
            return '<li>' + '<div class="btn-group">' + '<a tabindex="-1" title="CTRL+B" data-wysihtml5-command="bold" class="btn  btn-default" href="javascript:;" unselectable="on"><i class="editor-icon editor-icon-bold"></i></a>' + '<a tabindex="-1" title="CTRL+I" data-wysihtml5-command="italic" class="btn  btn-default" href="javascript:;" unselectable="on"><i class="editor-icon editor-icon-italic"></i></a>' + '<a tabindex="-1" title="CTRL+U" data-wysihtml5-command="underline" class="btn  btn-default" href="javascript:;" unselectable="on"><i class="editor-icon editor-icon-underline"></i></a>' + '</div>' + '</li>';
        },
        blockquote: function(locale) {
            return '<li>' + '<a tabindex="-1" data-wysihtml5-display-format-name="false" data-wysihtml5-command-value="blockquote" data-wysihtml5-command="formatBlock" class="btn  btn-default" href="javascript:;" unselectable="on">' + '<i class="editor-icon editor-icon-quote"></i>' + '</a>' + '</li>'
        },
        lists: function(locale) {
            return '<li>' + '<div class="btn-group">' + '<a tabindex="-1" title="Unordered list" data-wysihtml5-command="insertUnorderedList" class="btn  btn-default" href="javascript:;" unselectable="on"><i class="editor-icon editor-icon-ul"></i></a>' + '<a tabindex="-1" title="Ordered list" data-wysihtml5-command="insertOrderedList" class="btn  btn-default" href="javascript:;" unselectable="on"><i class="editor-icon editor-icon-ol"></i></a>' + '<a tabindex="-1" title="Outdent" data-wysihtml5-command="Outdent" class="btn  btn-default" href="javascript:;" unselectable="on"><i class="editor-icon editor-icon-outdent"></i></a>' + '<a tabindex="-1" title="Indent" data-wysihtml5-command="Indent" class="btn  btn-default" href="javascript:;" unselectable="on"><i class="editor-icon editor-icon-indent"></i></a>' + '</div>' + '</li>'
        },
        image: function(locale) {
            return '<li>' + '<div class="bootstrap-wysihtml5-insert-image-modal modal fade">' + '<div class="modal-dialog ">' + '<div class="modal-content">' + '<div class="modal-header">' + '<a data-dismiss="modal" class="close">×</a>' + '<h3>Insert image</h3>' + '</div>' + '<div class="modal-body">' + '<input class="bootstrap-wysihtml5-insert-image-url form-control" value="http://">' + '</div>' + '<div class="modal-footer">' + '<a data-dismiss="modal" class="btn btn-default">Cancel</a>' + '<a data-dismiss="modal" class="btn btn-primary">Insert image</a>' + '</div>' + '</div>' + '</div>' + '</div>' + '<a tabindex="-1" title="Insert image" data-wysihtml5-command="insertImage" class="btn  btn-default" href="javascript:;" unselectable="on">' + '<i class="editor-icon editor-icon-image"></i>' + '</a>' + '</li>'
        },
        link: function(locale) {
            return '<li>' + '<div class="bootstrap-wysihtml5-insert-link-modal modal fade">' + '<div class="modal-dialog ">' + '<div class="modal-content">' + '<div class="modal-header">' + '<a data-dismiss="modal" class="close">×</a>' + '<h3>Insert link</h3>' + '</div>' + '<div class="modal-body">' + '<input class="bootstrap-wysihtml5-insert-link-url form-control" value="http://">' + '<label class="checkbox"> <input type="checkbox" checked="" class="bootstrap-wysihtml5-insert-link-target">Open link in new window</label>' + '</div>' + '<div class="modal-footer">' + '<a data-dismiss="modal" class="btn btn-default">Cancel</a>' + '<a data-dismiss="modal" class="btn btn-primary" href="#">Insert link</a>' + '</div>' + '</div>' + '</div>' + '</div>' + '<a tabindex="-1" title="Insert link" data-wysihtml5-command="createLink" class="btn  btn-default" href="javascript:;" unselectable="on">' + '<i class="editor-icon editor-icon-link"></i>' + '</a>' + '</li>'
        }
    }

    var editorOptions = {
        "font-styles": true, //Font styling, e.g. h1, h2, etc. Default true
        "emphasis": false, //Italics, bold, etc. Default true
        "lists": false, //(Un)ordered lists, e.g. Bullets, Numbers. Default true
        "html": false, //Button which allows you to edit the generated HTML. Default false
        "link": true, //Button to insert a link. Default true
        "image": true, //Button to insert an image. Default true,
        "color": false, //Button to change color of font  
        "blockquote": true, //Blockquote  
        stylesheets: [getBaseURL() + "/pages/css/editor.css"],
        customTemplates: editorTemplate
    };

    function nFormatter(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2).replace(/\.0$/, '') + ' Milyar';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2).replace(/\.0$/, '') + ' Juta';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(2).replace(/\.0$/, '') + ' Ribu';
        }
        return num;
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


    // ######################################### BEGIN DOCUMENT ON READY FN ##############################################
    $(document).ready(function() {
      


        // run the load job list function
        loadJobList('/api/jobs');



        // Create job form logic
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



        // SEARCH INPUT ACTIONS //////

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

        // main search input fn
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

        // END OF SEARCH INPUT ACTIONS //////




        // DROPDOWN FILTERS ACTION
        $("select.job-filter-dropdown").on("change", function() {
            var filters = $.map($("select.job-filter-dropdown").toArray(), function(e) {
                return $(e).val();
            }).join("/");

            // run the load job list function
            loadJobList('/api/jobs/' + filters);
        });

        // RESET FILTERS
        $("a[href='#reset']").click(function() {

            $("select.job-filter-dropdown").select2('val', 'all');

            var filters = $.map($("select.job-filter-dropdown").toArray(), function(e) {
                return $(e).val();
            }).join("/");

            // run the load job list function
            loadJobList('/api/jobs/' + filters);
        });



        // CLICK ON JOB LIST ITEM ACTION
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


        // Opened job post details //////////////////////////////////////////////////
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

        /* ============== EDIT JOB FUNCTION ==========================
        ==============================================================*/
        $('#btnToggleSlideUpSize').click(function() {
            var dataHtml = '';
            var id = $(this).attr('data-id');

            $.ajax({
                dataType: "json",
                url: "/api/job/edit/" + id,
                success: function(data) {
                    if (data) {
                        var img = 'uploads/logo/' + data.profile.logo;
                        $('#EditJob div.panel form#form-edit input#oldJobImg').attr('value', data.profile.logo);
                        $('#EditJob div.panel form#form-edit img#editJobImg-preview').attr('src', img);
                        $('#EditJob div.panel form#form-edit input.companyName').attr('value', data.profile.name);

                        if (data.profile.location == 'Daerah-Istimewa-Yogyakarta') {
                            data.profile.location = 'Daerah Istimewa Yogyakarta';
                        }
                        if (data.profile.location == 'DKI-Jakarta') {
                            data.profile.location = 'DKI Jakarta';
                        }
                        if (data.profile.location == 'Jawa-Barat') {
                            data.profile.location = 'Jawa Barat';
                        }
                        if (data.profile.location == 'Jawa-Tengah') {
                            data.profile.location = 'Jawa Tengah';
                        }
                        if (data.profile.location == 'Jawa-Timur') {
                            data.profile.location = 'Jawa Timur';
                        }
                        if (data.profile.location == 'Kalimantan-Barat') {
                            data.profile.location = 'Kalimantan Barat';
                        }
                        if (data.profile.location == 'Kalimantan-Selatan') {
                            data.profile.location = 'Kalimantan Selatan';
                        }
                        if (data.profile.location == 'Kalimantan-Tengah') {
                            data.profile.location = 'Kalimantan Tengah';
                        }
                        if (data.profile.location == 'Kalimantan-Timur') {
                            data.profile.location = 'Kalimantan Timur';
                        }
                        if (data.profile.location == 'Kepulauan-Bangka-Belitung') {
                            data.profile.location = 'Kepulauan Bangka Belitung';
                        }
                        if (data.profile.location == 'Kepulauan-Riau') {
                            data.profile.location = 'Kepulauan Riau';
                        }
                        if (data.profile.location == 'Maluku-Utara') {
                            data.profile.location = 'Maluku Utara';
                        }
                        if (data.profile.location == 'Nanggroe-Aceh-Darussalam') {
                            data.profile.location = 'Nanggroe Aceh Darussalam';
                        }
                        if (data.profile.location == 'Nusa-Tenggara-Barat') {
                            data.profile.location = 'Nusa Tenggara Barat';
                        }
                        if (data.profile.location == 'Nusa-Tenggara-Timur') {
                            data.profile.location = 'Nusa Tenggara Timur';
                        }
                        if (data.profile.location == 'Papua-Barat') {
                            data.profile.location = 'Papua Barat';
                        }
                        if (data.profile.location == 'Sulawesi-Barat') {
                            data.profile.location = 'Sulawesi Barat';
                        }
                        if (data.profile.location == 'Sulawesi-Selatan') {
                            data.profile.location = 'Sulawesi Selatan';
                        }
                        if (data.profile.location == 'Sulawesi-Tengah') {
                            data.profile.location = 'Sulawesi Tengah';
                        }
                        if (data.profile.location == 'Sulawesi-Tenggara') {
                            data.profile.location = 'Sulawesi Tenggara';
                        }
                        if (data.profile.location == 'Sulawesi-Utara') {
                            data.profile.location = 'Sulawesi Utara';
                        }
                        if (data.profile.location == 'Sumatera-Selatan') {
                            data.profile.location = 'Sumatera Selatan';
                        }
                        if (data.profile.location == 'Sumatera-Utara') {
                            data.profile.location = 'Sumatera Utara';
                        }
                        if (data.profile.location == 'Sumatera-Barat') {
                            data.profile.location = 'Sumatera Barat';
                        }

                        $("#EditJob div.panel form#form-edit div#s2id_location span.select2-chosen").text(data.profile.location);
                        $('#EditJob div.panel form#form-edit select#location option:selected').val(data.profile.location);


                        $('#EditJob div.panel form#form-edit textarea.description-text').parent().children('div.note-editor').children('.note-editable').html(data.profile.description);
                        $('#EditJob div.panel form#form-edit input.jobTitle').attr('value', data.details.jobTitle);

                        if (data.details.category == 130) {
                            data.details.category = 'Audit & Pajak';
                        }
                        if (data.details.category == 135) {
                            data.details.category = 'Perbankan/Keuangan';
                        }
                        if (data.details.category == 132) {
                            data.details.category = 'Keuangan/Investasi';
                        }
                        if (data.details.category == 131) {
                            data.details.category = 'Akuntansi Umum/Pembiayaan';
                        }
                        if (data.details.category == 133) {
                            data.details.category = 'Staf/Administrasi umum';
                        }
                        if (data.details.category == 137) {
                            data.details.category = 'Personalia';
                        }
                        if (data.details.category == 146) {
                            data.details.category = 'Sekretaris';
                        }
                        if (data.details.category == 148) {
                            data.details.category = 'Manajemen Atas';
                        }
                        if (data.details.category == 100) {
                            data.details.category = 'Periklanan';
                        }
                        if (data.details.category == 101) {
                            data.details.category = 'Seni/Desain Kreatif';
                        }
                        if (data.details.category == 106) {
                            data.details.category = 'Hiburan/Seni Panggung';
                        }
                        if (data.details.category == 141) {
                            data.details.category = 'Hubungan Masyarakat';
                        }
                        if (data.details.category == 180) {
                            data.details.category = 'Arsitek/Desain Interior';
                        }
                        if (data.details.category == 184) {
                            data.details.category = 'Sipil/Konstruksi Bangunan';
                        }
                        if (data.details.category == 150) {
                            data.details.category = 'Properti/Real Estate';
                        }
                        if (data.details.category == 198) {
                            data.details.category = 'Survei Kuantitas';
                        }
                        if (data.details.category == 192) {
                            data.details.category = 'IT-Perangkat Keras';
                        }
                        if (data.details.category == 193) {
                            data.details.category = 'IT-Jaringan/Sistem/Sistem Database';
                        }
                        if (data.details.category == 191) {
                            data.details.category = 'IT-Perangkat Lunak';
                        }
                        if (data.details.category == 105) {
                            data.details.category = 'Pendidikan';
                        }
                        if (data.details.category == 121) {
                            data.details.category = 'Penelitian & Pengembangan';
                        }
                        if (data.details.category == 185) {
                            data.details.category = 'Teknik Kimia';
                        }
                        if (data.details.category == 187) {
                            data.details.category = 'Teknik Elektrikal';
                        }
                        if (data.details.category == 186) {
                            data.details.category = 'Teknik Elektro';
                        }
                        if (data.details.category == 189) {
                            data.details.category = 'Teknik Lingkungan';
                        }
                        if (data.details.category == 200) {
                            data.details.category = 'Teknik';
                        }
                        if (data.details.category == 195) {
                            data.details.category = 'Mekanik/Otomotif';
                        }
                        if (data.details.category == 190) {
                            data.details.category = 'Teknik Perminyakan';
                        }
                        if (data.details.category == 188) {
                            data.details.category = 'Teknik Lainnya';
                        }
                        if (data.details.category == 113) {
                            data.details.category = 'Dokter/Diagnosa';
                        }
                        if (data.details.category == 112) {
                            data.details.category = 'Farmasi';
                        }
                        if (data.details.category == 111) {
                            data.details.category = 'Praktisi/Asisten Medis';
                        }
                        if (data.details.category == 107) {
                            data.details.category = 'Makanan/Minuman/Pelayanan Restoran';
                        }
                        if (data.details.category == 114) {
                            data.details.category = 'Hotel/Pariwisata';
                        }
                        if (data.details.category == 115) {
                            data.details.category = 'Pemeliharaan';
                        }
                        if (data.details.category == 194) {
                            data.details.category = 'Manufaktur';
                        }
                        if (data.details.category == 196) {
                            data.details.category = 'Kontrol Proses';
                        }

                        if (data.details.category == 140) {
                            data.details.category = 'Pembelian/Manajemen Material';
                        }
                        if (data.details.category == 197) {
                            data.details.category = 'Penjaminan Kualitas / QA';
                        }
                        if (data.details.category == 142) {
                            data.details.category = 'Penjualan - Korporasi';
                        }
                        if (data.details.category == 139) {
                            data.details.category = 'Pemasaran/Pengembangan Bisnis';
                        }
                        if (data.details.category == 149) {
                            data.details.category = 'Merchandising';
                        }
                        if (data.details.category == 145) {
                            data.details.category = 'Penjualan Ritel';
                        }
                        if (data.details.category == 143) {
                            data.details.category = 'Penjualan - Teknik/Teknikal/IT';
                        }
                        if (data.details.category == 144) {
                            data.details.category = 'Proses desain dan kontrol';
                        }
                        if (data.details.category == 151) {
                            data.details.category = 'Tele-sales/Telemarketing';
                        }
                        if (data.details.category == 103) {
                            data.details.category = 'Aktuaria/Statistik';
                        }
                        if (data.details.category == 102) {
                            data.details.category = 'Pertanian';
                        }
                        if (data.details.category == 181) {
                            data.details.category = 'Penerbangan';
                        }
                        if (data.details.category == 182) {
                            data.details.category = 'Bioteknologi';
                        }
                        if (data.details.category == 183) {
                            data.details.category = 'Kimia';
                        }
                        if (data.details.category == 108) {
                            data.details.category = 'Teknologi Makanan/Ahli Gizi';
                        }
                        if (data.details.category == 109) {
                            data.details.category = 'Geologi/Geofisika';
                        }
                        if (data.details.category == 199) {
                            data.details.category = 'Ilmu Pengetahuan & Teknologi/Lab';
                        }
                        if (data.details.category == 119) {
                            data.details.category = 'Keamanan / Angkatan Bersenjata';
                        }
                        if (data.details.category == 134) {
                            data.details.category = 'Pelayanan Pelanggan';
                        }
                        if (data.details.category == 147) {
                            data.details.category = 'Logistik/Jaringan distribusi';
                        }
                        if (data.details.category == 138) {
                            data.details.category = 'Hukum / Legal';
                        }
                        if (data.details.category == 118) {
                            data.details.category = 'Perawatan Kesehatan / Kecantikan';
                        }
                        if (data.details.category == 120) {
                            data.details.category = 'Pelayanan kemasyarakatan';
                        }
                        if (data.details.category == 152) {
                            data.details.category = 'Teknikal &amp; Bantuan Pelanggan';
                        }
                        if (data.details.category == 110) {
                            data.details.category = 'Pekerjaan Umum';
                        }
                        if (data.details.category == 104) {
                            data.details.category = 'Jurnalis/Editor';
                        }
                        if (data.details.category == 117) {
                            data.details.category = 'Penerbitan';
                        }
                        if (data.details.category == 116) {
                            data.details.category = 'Lainnya/Kategori tidak tersedia';
                        }

                        $('#EditJob div.panel form#form-edit div#s2id_category span.select2-chosen').text(data.details.category);
                        $('#EditJob div.panel form#form-edit select#category').val(data.details.category);

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

        // Toggle email sidebar on mobile view
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

        $('#summernote1,#summernote2,#summernote3').summernote();
        $('#item-list').jscroll({ // Infinite scroll trigger
            loadingHtml: '<img src="loading.gif" alt="Loading" /> Loading...',
            padding: 20,
            contentSelector: 'li'
        });

        $('#form-create-job').validate();
        $('#form-edit').validate();
        $('#form-register').validate();
        $('#applyForm').validate();


        // create user avatar based on name
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


        // Overlay trigger button /////
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

        /// disable previous btn func
        if ($('.firstTab').hasClass('active')) {
            $('.btn-previous').hide();
        };

        $('.firstTab,.btn-previous').click(function() {
            $('.btn-previous').hide();
        });
        $('.secondTab,.btn-next').click(function() {
            $('.btn-previous').show();
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
