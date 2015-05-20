(function($) {

    'use strict';

    // Function to serialize form-datas to JSON
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
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
        $('#accordion').html('');
        $('#no-job-post').hide();

        $.ajax({
            dataType: "json",
            url: url,
            success: function(data) {
                if (data.length > 0) {

                    $.each(data, function(i) {

                        if (data[i].status == 'deleted') {
                            delCounter = delCounter + 1; // Count deleted job
                            badge = '<i class="fa fa-times-circle" style="color:rgb(205, 95, 100);"></i>';
                            toolbox = '<div class="btn-group"><button data-id="' + data[i]._id + '" id="deleteButton" class="btn btn-sm btn-white"><i class="fa fa-reply"></i></button></div>';
                        } else if (data[i].status == 'paused') {
                            pauCounter = pauCounter + 1; // Count paused job
                            badge = '<i class="fa fa-minus-circle" style="color:#f8d053"></i>';
                            toolbox = '<div class="btn-group"><button id="editButton" data-target="#EditJob" data-id="' + data[i]._id + '" data-toggle="modal" class="btn btn-sm btn-white"><i class="fa fa-pencil"></i></button><button data-id="' + data[i]._id + '" class="btn btn-sm btn-white" id="pauseButton"><i class="fa fa-refresh"></i></button><button data-id="' + data[i]._id + '" id="deleteButton" class="btn btn-sm btn-white"><i class="fa fa-trash-o"></i></button></div>';
                        } else if (data[i].status == 'published') {
                            pubCounter = pubCounter + 1; // Count published job
                            badge = '<i class="fa fa-check-circle" style="color:#52D5BE"></i>';
                            toolbox = '<button href="#" id="editButton" data-target="#EditJob" data-id="' + data[i]._id + '" data-toggle="modal" class="btn btn-sm btn-white"><i class="fa fa-pencil" data-toggle="" data-original-title="Up here!"></i></button><button data-id="' + data[i]._id + '" id="pauseButton" class="btn btn-sm btn-white"><i class="fa fa-power-off"></i></button><button data-id="' + data[i]._id + '" id="deleteButton" class="btn btn-sm btn-white"><i class="fa fa-trash-o"></i></button>';
                        }

                        if (data[i].newApp > 0) {
                            var newApp = ' <span class="badge badge-danger"><font style="color:#FFF;">' + data[i].newApp + ' unreviewed</font></span>';
                        } else {
                            var newApp = '';
                        }

                        // Generate datas
                        dataHtml += '<li data-id="' + data[i]._id + '">' +
                            '<div class="link">' + badge + '<h4 style="margin-top:auto;">' + data[i].details.jobTitle + '</h4><i class="fa fa-chevron-down"></i></div>' +
                            '<ul class="submenu">';

                        // Load application list
                        $.ajax({
                            dataType: "json",
                            url: "/api/job/apps/" + data[i]._id,
                            success: function(app) {
                                if (app.length > 0) {
                                    $.each(app, function(i) {
                                        if (app[i].read == false) {
                                            var appBadge = '<span class="badge badge-danger"><i class="fa fa-eye"></i> </span>';
                                            var status = ' <a href="/app/set/' + app[i]._id + '"><span class="link pull-right"><i class="fa fa-eye"></i> Set as reviewed</span></a>';
                                        } else {
                                            var appBadge = '<span class="badge badge-success"><i class="fa fa-eye"></i> </span>';
                                            var status = '';
                                        }

                                        dataHtml += '<li app-id="' + data[i]._id + '">' +
                                            '<h5>' + appBadge + ' ' + app[i].firstName + ' ' + app[i].lastName + '<span class="pull-right"><i class="pg-clock"></i> ' + moment(app[i].applyDate).format('minute').fromNow() + '</span></h5>' +
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
                            '</li>';

                        // FINALLY, SHOW THE WHOLE RESULTS...
                        $('#accordion').html(dataHtml);

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
                    //$('#user-job-counter').hide();
                    $('#no-job-post').show();
                }

            }
        });
    };


    // ===================== INITIATE WIZARD FORM ============================
    var formWizard1 = function() {
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


    // For image processing purpose
    function tempUpload(img) {
        var data = {
            'image': img
        };
        $.ajax({
            type: 'post',
            url: '/api/upload/image',
            data: data,
            dataType: "json",
            success: function(data) {
                var temp_img = data.msg;
                $('#image-file').attr('src', 'uploads/temp/' + temp_img);
            }
        });
    };



    // +++++++++++++++++++++++ BEGIN DOCUMENT ON READY FN +++++++++++++++++++++++
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $(document).ready(function() {


        //////// Image processing /////////
        // Create Post Modal //
        var options = {
            thumbBox: '.thumbBox',
            spinner: '.spinner',
            imgSrc: 'avatar.png',
            resizeToWidth: 190,
            resizeToHeight: 190
        }
        var cropper;

        $('.logoBox').on('click', function() {
            $('#logo_file').trigger('click');
        });

        $('#btn-cropper-done,#btn-cropper-close').click(function() {
            $('#PostNewJob, #EditJob').css({
                'overflow-x': 'hidden',
                'overflow-y': 'auto',
                'z-index': '1041'
            });
            $('body').css('overflow', 'hidden');
        });

        $('#PostNewJob .close, #EditJob .close').click(function() {
            $('body').css('overflow', 'auto');
        });

        $('#logo_file').on('change', function() {
            $('#modal_cropper').modal({
                show: true
            });

            var reader = new FileReader();
            reader.onload = function(e) {
                options.imgSrc = e.target.result;

                // Attach image to canvas
                cropper = $('.imageBox').cropbox(options);
            }

            reader.readAsDataURL(this.files[0]);
            this.files = [];

            $('.action').fadeIn('slow');
        });

        $('#btn-cropper-choose').on('click', function() {
            $('#logo_file').trigger('click');
        });

        $('#btn-cropper-done').on('click', function() {
            var img = cropper.getDataURL()
            $('#image-source').val(img);
            $('#logo-preview').attr('src', img);
            $('#modal_cropper').modal('hide');
        });

        $('#btn-cropper-zoomin').on('click', function() {
            cropper.zoomIn();
        });

        $('#btn-cropper-zoomout').on('click', function() {
            cropper.zoomOut();
        });

        // Edit Modal //
        var options_edit = {
            thumbBox: '.thumbBox_edit',
            spinner: '.spinner_edit',
            imgSrc: 'avatar_edit.png',
            resizeToWidth: 190,
            resizeToHeight: 190
        }
        var cropper_edit;

        $('.logoBox_edit').on('click', function() {
            $('#logo_file_edit').click();
        });

        $('#btn-cropper-done_edit,#btn-cropper-close_edit').click(function() {
            $('#EditJob').css({
                'overflow-x': 'hidden',
                'overflow-y': 'auto',
                'z-index': '1041'
            });
            $('body').css('overflow', 'hidden');
        });

        $('#EditJob .close').click(function() {
            $('body').css('overflow', 'auto');
        });

        $('#logo_file_edit').on('change', function() {
            $('#modal_cropper_edit').modal({
                show: true
            });

            var reader_edit = new FileReader();
            reader_edit.onload = function(e) {
                options_edit.imgSrc = e.target.result;

                // Attach image to canvas
                cropper_edit = $('.imageBox_edit').cropbox(options_edit);
            }

            reader_edit.readAsDataURL(this.files[0]);
            this.files = [];

            $('.action_edit').fadeIn('slow');
        });

        // Tool buttons:
        $('#btn-cropper-choose_edit').on('click', function() {
            $('#logo_file_edit').trigger('click');
        });

        $('#btn-cropper-done_edit').on('click', function() {
            var img_edit = cropper_edit.getDataURL()
            $('#image-source_edit').val(img_edit);
            $('#logo-preview_edit').attr('src', img_edit);
            $('#changed').val('yes');
            $('#modal_cropper_edit').modal('hide');
        });

        $('#btn-cropper-zoomin_edit').on('click', function() {
            cropper_edit.zoomIn();
        });

        $('#btn-cropper-zoomout_edit').on('click', function() {
            cropper_edit.zoomOut();
        });
        ///// End of Image processing ///////


        // Salary input group events
        $('#salary-from,#salary-to,#salary-from-edit,#salary-to-edit').focus(function() {
            $(this).css('background-color', '#fff');
        });

        $('#salary-from,#salary-to,#salary-from-edit,#salary-to-edit').blur(function() {
            $(this).css('background-color', '#f9f9fb');
        });


        var elems = Array.prototype.slice.call(document.querySelectorAll('.switchery'));
        elems.forEach(function(html) {
            var switchery = new Switchery(html, {
                color: '#b2050d'
            });
        });

        var uEmail = $('#user-email').val(); // Get logged user email
        var switch_checked = localStorage['switch_checked']; // Get switchery status from session
        if (switch_checked == 'yes') {
            var stat = 'show';
            $('p.switch-label').html('Click to view<br>live job posts');
            if ($('.switchery').attr('checked')) {
                console.log('nothing to change...');
            }
        } else {
            var stat = 'hide';
            $('p.switch-label').html('Click to view<br>deleted job posts');
            if ($('.switchery').attr('checked')) {
                $(this).removeAttr('checked');
                console.log('state changed!');
            }
        }

        // Then show the jobs
        showJobs('/api/jobs/' + uEmail + '/' + stat);



        // Create job form logic ////
        /*var initLogin = $('#init-login').val();
        if (initLogin == 'false') {
            formWizard1();

            var logo = $('#hidden-logo').val();
            $('#savedLogo').val(logo);

            var location = $('#hidden-location').val();
            $('#create-job-location-dropdown').select2('val', location);

            $('#createWizard').bootstrapWizard('show', 1);
        }*/


        // CKEditor configuration /////
        CKEDITOR.inline('editor1');
        CKEDITOR.inline('editor2');
        CKEDITOR.inline('editor3');


        /////////////// FORM VALIDATION HANDLER //////////////
        // FORM CREATE JOB POST
        $('#form-create-job')
            .find('[name="currency"]')
            .select2()
            .change(function(e) {
                $('#form-create-job').formValidation('revalidateField', 'currency');
            })
            .end()
            .find('[name="salaryType"]')
            .select2()
            .change(function(e) {
                $('#form-create-job').formValidation('revalidateField', 'salaryType');
            })
            .end()
            .find('[name="location"]')
            .select2()
            .change(function(e) {
                $('#form-create-job').formValidation('revalidateField', 'location');
            })
            .end()
            .find('[name="category"]')
            .select2()
            .change(function(e) {
                $('#form-create-job').formValidation('revalidateField', 'category');
            })
            .end()
            .find('[name="jobType"]')
            .select2()
            .change(function(e) {
                $('#form-create-job').formValidation('revalidateField', 'jobType');
            })
            .end()
            .formValidation({
                framework: 'bootstrap',
                fields: {
                    logo_file: {
                        validators: {
                            file: {
                                extension: 'jpeg,png',
                                type: 'image/jpeg,image/png',
                                maxSize: 2097152, // 2048 * 1024
                                message: 'The selected file is not valid'
                            }
                        }
                    },
                    companyName: {
                        validators: {
                            notEmpty: {
                                message: 'The company name required'
                            },
                            stringLength: {
                                min: 5,
                                message: 'Must be more than 4 characters long'
                            }
                        }
                    },
                    jobTitle: {
                        validators: {
                            notEmpty: {
                                message: 'The job position is required'
                            },
                            stringLength: {
                                min: 5,
                                message: 'Must be more than 4 characters long'
                            }
                        }
                    },
                    currency: {
                        validators: {
                            message: 'Please select currency',
                            callback: function(value, validator, $field) {
                                // Get the selected options
                                var options = validator.getFieldElements('currency').val();
                                return (options != null);
                            }
                        }
                    },
                    salaryFrom: {
                        validators: {
                            notEmpty: {
                                message: 'The minimum salary is required'
                            }
                        }
                    },
                    salaryTo: {
                        validators: {
                            notEmpty: {
                                message: 'The maximum salary is required'
                            }
                        }
                    },
                    salaryType: {
                        validators: {
                            message: 'Please select salary type',
                            callback: function(value, validator, $field) {
                                // Get the selected options
                                var options = validator.getFieldElements('salaryType').val();
                                return (options != null);
                            }
                        }
                    },
                    location: {
                        validators: {
                            notEmpty: {
                                message: 'Please choose job location'
                            }
                        }
                    },
                    category: {
                        validators: {
                            notEmpty: {
                                message: 'Please choose job category'
                            }
                        }
                    },
                    jobType: {
                        validators: {
                            notEmpty: {
                                message: 'Please choose job type'
                            }
                        }
                    },
                    description: {
                        validators: {
                            notEmpty: {
                                message: 'Please provide company description',
                            }
                        }
                    },
                    jobScope: {
                        validators: {
                            notEmpty: {
                                message: 'Please provide job scopes'
                            }
                        }
                    },
                    requirements: {
                        validators: {
                            notEmpty: {
                                message: 'Please provide job requirements'
                            }
                        }
                    }
                }
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();

                // Reset the message element when the form is valid
                $('#status_post').html('');

                var $form = $(e.target),
                    fv = $form.data('formValidation');

                $.ajax({
                    url: $form.attr('action'),
                    data: $form.serialize(),
                    type: 'POST',
                    success: function(result) {
                        if (result.type == 'success') {
                            swal({
                                type: 'success',
                                title: "Success!",
                                text: result.msg
                            }, function() {
                                $('#PostNewJob').modal('hide');
                                loadJobList('/api/jobs');
                            });
                        } else {
                            $('<li/>')
                                .wrapInner(
                                    $('<span/>')
                                    .attr('class', 'ajax_error')
                                    .html(result.msg)
                                )
                                .appendTo('#status_post');
                        }
                    }
                });
            })
            .on('success.field.fv', function(e, data) {
                // Reset the message element when the form is valid
                $('#status_post').html('');
            });
        // EOF

        // EDIT JOB POST
        $('#form-edit')
            .find('[name="currency"]')
            .select2()
            .change(function(e) {
                $('#form-create-job').formValidation('revalidateField', 'currency');
            })
            .end()
            .find('[name="salaryType"]')
            .select2()
            .change(function(e) {
                $('#form-create-job').formValidation('revalidateField', 'salaryType');
            })
            .end()
            .find('[name="location"]')
            .select2()
            .change(function(e) {
                $('#form-create-job').formValidation('revalidateField', 'location');
            })
            .end()
            .find('[name="category"]')
            .select2()
            .change(function(e) {
                $('#form-create-job').formValidation('revalidateField', 'category');
            })
            .end()
            .find('[name="jobType"]')
            .select2()
            .change(function(e) {
                $('#form-create-job').formValidation('revalidateField', 'jobType');
            })
            .end()
            .formValidation({
                framework: 'bootstrap',
                fields: {
                    logo_file: {
                        validators: {
                            file: {
                                extension: 'jpeg,png',
                                type: 'image/jpeg,image/png',
                                maxSize: 2097152, // 2048 * 1024
                                message: 'The selected file is not valid'
                            }
                        }
                    },
                    companyName: {
                        validators: {
                            notEmpty: {
                                message: 'The company name required'
                            },
                            stringLength: {
                                min: 5,
                                message: 'Must be more than 4 characters long'
                            }
                        }
                    },
                    jobTitle: {
                        validators: {
                            notEmpty: {
                                message: 'The job position is required'
                            },
                            stringLength: {
                                min: 5,
                                message: 'Must be more than 4 characters long'
                            }
                        }
                    },
                    currency: {
                        validators: {
                            message: 'Please select currency',
                            callback: function(value, validator, $field) {
                                // Get the selected options
                                var options = validator.getFieldElements('currency').val();
                                return (options != null);
                            }
                        }
                    },
                    salaryFrom: {
                        validators: {
                            notEmpty: {
                                message: 'The minimum salary is required'
                            }
                        }
                    },
                    salaryTo: {
                        validators: {
                            notEmpty: {
                                message: 'The maximum salary is required'
                            }
                        }
                    },
                    salaryType: {
                        validators: {
                            message: 'Please select salary type',
                            callback: function(value, validator, $field) {
                                // Get the selected options
                                var options = validator.getFieldElements('salaryType').val();
                                return (options != null);
                            }
                        }
                    },
                    location: {
                        validators: {
                            notEmpty: {
                                message: 'Please choose job location'
                            }
                        }
                    },
                    category: {
                        validators: {
                            notEmpty: {
                                message: 'Please choose job category'
                            }
                        }
                    },
                    jobType: {
                        validators: {
                            notEmpty: {
                                message: 'Please choose job type'
                            }
                        }
                    },
                    description: {
                        validators: {
                            notEmpty: {
                                message: 'Please provide company description'
                            }
                        }
                    },
                    jobScope: {
                        validators: {
                            notEmpty: {
                                message: 'Please provide job scopes'
                            }
                        }
                    },
                    requirements: {
                        validators: {
                            notEmpty: {
                                message: 'Please provide job requirements'
                            }
                        }
                    }
                }
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();

                // Reset the message element when the form is valid
                $('#status_edit').html('');

                var $form = $(e.target),
                    formData = new FormData(),
                    fv = $form.data('formValidation'),
                    params = $form.serializeArray(),
                    editors = new Array();

                // Get CKEditor values
                params.push({
                    name: 'description',
                    value: CKEDITOR.instances['editor1-edit'].getData()
                });
                params.push({
                    name: 'jobScope',
                    value: CKEDITOR.instances['editor2-edit'].getData()
                });
                params.push({
                    name: 'requirements',
                    value: CKEDITOR.instances['editor3-edit'].getData()
                });

                $.each(params, function(i, val) {
                    formData.append(val.name, val.value);
                });

                $.ajax({
                    url: $form.attr('action'),
                    data: formData,
                    type: 'POST',
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function(result) {
                        if (result.type == 'success') {
                            swal({
                                type: 'success',
                                title: "Success!",
                                text: result.msg
                            }, function() {
                                $('#EditJob').modal('hide');
                                loadJobList('/api/jobs');
                            });
                        } else {
                            $('<li/>')
                                .wrapInner(
                                    $('<span/>')
                                    .attr('class', 'ajax_error')
                                    .html(result.msg)
                                )
                                .appendTo('#status_edit');
                        }
                    }
                });
            })
            .on('success.field.fv', function(e, data) {
                // Reset the message element when the form is valid
                $('#status_edit').html('');
            });
        // EOF

        // END FORM VALIDATION HANDLER ////////////


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


        // ////////////  Input masking ////////////////
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


        // ================================================================================================
        // START EVENT HANDLERS ===========================================================================
        // ================================================================================================

        // Switchery Handler >>> 'show deleted job'
        $('.switchery').change(function() {
            if ($(this).attr('checked')) {
                localStorage['switch_checked'] = "yes";
                showJobs('/api/jobs/' + uEmail + '/show');
                $('p.switch-label').html('Click to view<br>live job posts');
            } else {
                localStorage['switch_checked'] = "no";
                showJobs('/api/jobs/' + uEmail + '/hide');
                $('p.switch-label').html('Click to view<br>deleted job posts');
            }
        });


        // Buy Credits buttons action
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

        $('#braintree1').click(function() {
            var url = '/bt/1';
            window.location.href = url;
            return false;
        });
        $('#braintree5').click(function() {
            var url = '/bt/5';
            window.location.href = url;
            return false;
        });
        $('#braintree10').click(function() {
            var url = '/bt/10';
            window.location.href = url;
            return false;
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




        // ============== DETAILS APP BUTTON ========================== 
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


        // ============= JOB MANIPULATION BUTTONs =====================

        // CREATE JOB POST [SUBMIT] HANDLER ///////////
        $('#form-create-job').submit(function() {
            // Print HTTP request params
            var result = $(this).serializeObject();
            // Save to server
            $.ajax({
                method: "POST",
                type: "POST",
                data: result,
                dataType: "json",
                url: "/api/job/post",
                success: function(data) {
                    location.reload();
                }
            });
        });


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

                        var sal = data.details.salaryType;
                        $("#EditJob select.salaryType").select2('val', sal);

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


        $('body').on('click', '#pauseButton', function(e) {
            e.preventDefault();

            var id = $(this).attr('data-id');

            $.ajax({
                dataType: "json",
                url: "/api/job/stat/" + id,
                success: function(data) {
                    $('body').pgNotification({
                        'message': data.msg,
                        'type': data.type,
                        'style': 'circle',
                        'position': 'top-left',
                        'thumbnail': '<img width="80" height="80" style="display: inline-block;" src="assets/img/success.png" data-src="assets/img/success.png" data-src-retina="assets/img/success.png" alt="">'
                    }).show();

                    // Get switch status
                    var switch_checked = localStorage['switch_checked'];
                    if (switch_checked == 'yes') {
                        var stat = 'show';
                    } else {
                        var stat = 'hide';
                    }

                    // Refresh the job list
                    showJobs('/api/jobs/' + uEmail + '/' + stat);
                }
            });
        });

        $('body').on('click', '#deleteButton', function(e) {
            e.preventDefault();

            var id = $(this).attr('data-id');

            $.ajax({
                dataType: "json",
                url: "/api/job/del/" + id,
                success: function(data) {
                    $('body').pgNotification({
                        'message': data.msg,
                        'type': data.type,
                        'style': 'circle',
                        'position': 'top-left',
                        'thumbnail': '<img width="80" height="80" style="display: inline-block;" src="assets/img/success.png" data-src="assets/img/success.png" data-src-retina="assets/img/success.png" alt="">'
                    }).show();

                    // Get switch status
                    var switch_checked = localStorage['switch_checked'];
                    if (switch_checked == 'yes') {
                        var stat = 'show';
                    } else {
                        var stat = 'hide';
                    }

                    // Refresh the job list
                    showJobs('/api/jobs/' + uEmail + '/' + stat);
                }
            });
        });

        // Sign out button handler
        $("a[href='#signout']").click(function() {
            $.ajax({
                url: '/api/account/signout',
                type: 'GET',
                success: function(result) {
                    swal({
                        title: "Logged out!",
                        timer: 2000,
                        showConfirmButton: false,
                        text: result.msg
                    });
                    setTimeout(function() {
                        window.location.href = '/';
                    }, 2100);
                }
            });
        });

    });

})(window.jQuery);
