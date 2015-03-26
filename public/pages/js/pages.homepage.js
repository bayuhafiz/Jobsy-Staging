(function($) {
    'use strict';

    var getBaseURL = function() {
        var url = document.URL;
        return url.substr(0, url.lastIndexOf('/'));
    }

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


    $(document).ready(function() {

        $('#mark-email').click(function() {
            $('.item .checkbox').toggle();
        });

        // function to shorten currency
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


        // Load list of emails
        $.ajax({
            dataType: "json",
            url: "/api/jobs",
            success: function(data) {

                var listViewGroupCont = $('<div/>', {
                    "class": "list-view-group-container"
                });
                listViewGroupCont.append('<div class="list-view-group-header"><span> Job Lists</span></div>');
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

                    //console.log('Now >> ' + now.format('DD-MM-YYYY') + '\nCreated >> ' + moment(data[i].createdAt).format('DD-MM-YYYY') + '\nDue >> ' + dueDate.format('DD-MM-YYYY') + '\nLeft >> ' + diff + ' days left\n\n');

                    var li = '';
                    li += '<li class="item padding-15 email-list-search all ' + category + ' ' + smLocation + ' ' + smJobType + '" data-id="' + id + '" job-index="' + i + '" style="height:110px;"> \
                                <div class="middle" style="width: 110px;"> \
                                    <div class="thumbnail-wrapper d32b-danger" id="list-thumbnail" style="max-width:90px; max-height:90px;"> \
                                        <img class="img-list" style="margin-left: auto;margin-right: auto;display: block;max-width:79px;max-height:79px; width:auto; height:auto" width="30" height="40" alt="" data-src-retina="' + logo + '" data-src="' + logo + '" src="' + logo + '"> \
                                    </div> \
                                </div> \
                                <div class="checkbox  no-margin p-l-10"> \
                                    <input type="checkbox" value="1" id="emailcheckbox"> \
                                    <label for="emailcheckbox"></label> \
                                </div> \
                                <div class="middle"> \
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
                                    li += '<div class="datetime"><span class="text-danger bold">' + diff + ' day left to apply</span></div>';
                                } else {
                                    li += '<div class="datetime"><span class="text-danger bold">' + diff + ' days left to apply</span></div>';
                                }
                            } else {
                                li += '<div class="datetime"><span class="hint-text bold">' + diff + ' days left to apply</span></div>';
                            }
                    
                    li +=  '<p class="job-title job-title-hover bold" style="right:20px;line-height: 28px;position: absolute;opacity:0">' + currency + ' ' + salaryFrom + ' - ' + salaryTo + '</p> \
                                <div class="clearfix"></div> \
                            </li>';
                    ul.append(li);

                    if (i == 0) { // Auto open first index
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

                                emailOpened.find('#opened-thumbnail').html('<img class="img-list" style="margin-left: auto;margin-right: auto;display: block;max-width:79px;max-height:79px; width:auto; height:auto" width="30" height="40" alt="" data-src-retina="' + logo + '" data-src="' + logo + '" src="' + logo + '">').attr('class', 'd48b-danger');

                                $('.no-email').hide();
                                $('.actions-dropdown').toggle();
                                $('.actions, .email-content-wrapper').show();
                                if ($.Pages.isVisibleSm() || $.Pages.isVisibleXs()) {
                                    $('.email-list').toggleClass('slideLeft');
                                }

                                $(".email-content-wrapper").scrollTop(0);
                                $('#applyForm').attr('action', '/apply/' + id);

                            }
                        });
                    }

                });

                listViewGroupCont.append(ul);
                $('#emailList').append(listViewGroupCont);

                $("#emailList").ioslist();

            }
        });


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

        // Opened job post >> details
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
                    $('.actions, .email-content-wrapper').show();
                    if ($.Pages.isVisibleSm() || $.Pages.isVisibleXs()) {
                        $('.email-list').toggleClass('slideLeft');
                    }

                    $(".email-content-wrapper").scrollTop(0);
                    $('#applyForm').attr('action', '/apply/' + id);

                }
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

    });

})(window.jQuery);
