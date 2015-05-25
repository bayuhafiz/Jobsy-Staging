(function($) {
    'use strict';

    // BEGIN DOCUMENT ON READY FN ##############################################
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
        /////////////////////////////////////



        $('#salary-from,#salary-to,#salary-from-edit,#salary-to-edit').focus(function() {
            $(this).css('background-color', '#fff');
        });

        $('#salary-from,#salary-to,#salary-from-edit,#salary-to-edit').blur(function() {
            $(this).css('background-color', '#f9f9fb');
        });


        // Load job list ++++++
        loadJobList('/api/jobs');



        // Initiate filters dropdown
        $('select#category-filter').select2();
        $('select#location-filter').select2();
        $('select#jobType-filter').select2();

        // Tagged filters values
        $('#s2id_category-filter div.select2-drop').addClass('category_filter_dropdown');
        $('#s2id_location-filter div.select2-drop').addClass('location_filter_dropdown');
        $('#s2id_jobType-filter div.select2-drop').addClass('jobType_filter_dropdown');



        // CKEditor configuration ////
        var user = $('#user_email').val();
        if (user == 'none') {
            CKEDITOR.inline('editor4');
        } else {
            CKEDITOR.inline('editor1');
            CKEDITOR.inline('editor2');
            CKEDITOR.inline('editor3');
        }



        /////////////// FORM VALIDATION HANDLER //////////////
        // FORM SIGN IN
        $('#form-login')
            .formValidation({
                framework: 'bootstrap',
                fields: {
                    email: {
                        validators: {
                            notEmpty: {
                                message: 'The email address is required'
                            },
                            emailAddress: {
                                message: 'The email address is not valid'
                            },
                            stringCase: {
                                message: 'The email address must be in lowercase',
                                'case': 'lower'
                            }
                        }
                    },
                    password: {
                        validators: {
                            notEmpty: {
                                message: 'The password is required'
                            },
                            stringLength: {
                                min: 4,
                                message: 'The password must be more than 3 characters long'
                            }
                        }
                    }
                }
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();

                // Create button loader instance
                var loader = Ladda.create(document.querySelector('#btn-submit-signin'));
                // Start loading
                loader.start();

                // Reset the message element when the form is valid
                $('#status_signin').html('');

                var $form = $(e.target),
                    fv = $form.data('formValidation');

                // Use Ajax to submit form data
                $.ajax({
                    url: $form.attr('action'),
                    type: 'POST',
                    data: $form.serialize(),
                    success: function(result) {
                        // ... Process the result ...
                        if (result.type == 'success') {
                            // Stop loading
                            loader.stop();
                            loader.remove();

                            swal({
                                type: 'success',
                                title: "Logged in!",
                                timer: 3000,
                                showConfirmButton: false,
                                text: result.msg
                            });
                            setTimeout(function() {
                                window.location.href = '/dash';
                            }, 3200);
                        } else {
                            // Stop loading
                            loader.stop();
                            loader.remove();

                            $('<li/>')
                                .wrapInner(
                                    $('<span/>')
                                    .attr('class', 'ajax_error')
                                    .html(result.msg)
                                )
                                .appendTo('#status_signin');
                        }
                    }
                });
            })
            .on('err.field.fv', function(e, data) {
                // Get the messages of field
                var messages = data.fv.getMessages(data.element);

                // Remove button's disable class
                $('#btn-submit-signin').removeClass('disable');

                // Remove the field messages if they're already available
                $('#errors_signin').find('li[data-field="' + data.field + '"]').remove();

                // Reset the message element when the form is valid
                $('#status_signin').html('');

                // Loop over the messages
                for (var i in messages) {
                    // Create new 'li' element to show the message
                    $('<li/>')
                        .attr('data-field', data.field)
                        .wrapInner(
                            $('<a/>')
                            .attr('href', 'javascript: void(0);')
                            .html(messages[i])
                            .on('click', function(e) {
                                // Focus on the invalid field
                                data.element.focus();
                            })
                        )
                        .appendTo('#errors_signin');
                }

                // Hide the default message
                // $field.data('fv.messages') returns the default element containing the messages
                data.element
                    .data('fv.messages')
                    .find('.help-block[data-fv-for="' + data.field + '"]')
                    .hide();
            })
            .on('success.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-signin').removeClass('disable');

                // Remove the field messages
                $('#errors_signin').find('li[data-field="' + data.field + '"]').remove();

                // Reset the message element when the form is valid
                $('#status_signin').html('');
            });
        // EOF

        // FORM SIGN UP
        $('#form-register')
            .formValidation({
                framework: 'bootstrap',
                fields: {
                    firstName: {
                        validators: {
                            notEmpty: {
                                message: 'The first name is required'
                            },
                            stringLength: {
                                min: 3,
                                message: 'First name must be more than 2 characters long'
                            }
                        }
                    },
                    lastName: {
                        validators: {
                            notEmpty: {
                                message: 'The last name is required'
                            },
                            stringLength: {
                                min: 3,
                                message: 'Last name must be more than 2 characters long'
                            }
                        }
                    },
                    companyName: {
                        validators: {
                            notEmpty: {
                                message: 'The company name is required'
                            },
                            stringLength: {
                                min: 5,
                                message: 'The company name must be more than 4 characters long'
                            }
                        }
                    },
                    email: {
                        validators: {
                            notEmpty: {
                                message: 'The email address is required'
                            },
                            stringCase: {
                                message: 'The email address must be in lowercase',
                                'case': 'lower'
                            },
                            remote: {
                                type: 'GET',
                                url: 'https://api.mailgun.net/v2/address/validate?callback=?',
                                crossDomain: true,
                                name: 'address',
                                data: {
                                    // Registry a Mailgun account and get a free API key
                                    // at https://mailgun.com/signup
                                    api_key: 'pubkey-83a6-sl6j2m3daneyobi87b3-ksx3q29'
                                },
                                dataType: 'jsonp',
                                validKey: 'is_valid',
                                message: 'The email address is not valid'
                            }
                        }
                    },
                    password: {
                        validators: {
                            notEmpty: {
                                message: 'The password is required'
                            },
                            stringLength: {
                                min: 4,
                                message: 'The password must be more than 3 characters long'
                            }
                        }
                    }
                }
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();

                // Create button loader instance
                var loader = Ladda.create(document.querySelector('#btn-submit-signup'));
                // Start loading
                loader.start();

                // Reset the message element when the form is valid
                $('#status_signup').html('');

                var $form = $(e.target),
                    fv = $form.data('formValidation');

                // Use Ajax to submit form data
                $.ajax({
                    url: $form.attr('action'),
                    type: 'POST',
                    data: $form.serialize(),
                    success: function(result) {

                        if (result.type == 'success') {
                            // Stop loading
                            loader.stop();
                            loader.remove();

                            swal({
                                type: 'success',
                                title: "Success!",
                                text: result.msg,
                                confirmButtonColor: '#52D5BE'
                            }, function() {
                                window.location.href = '/dash';
                            });
                        } else {
                            // Stop loading
                            loader.stop();
                            loader.remove();

                            $('<li/>')
                                .wrapInner(
                                    $('<span/>')
                                    .attr('class', 'ajax_error')
                                    .html(result.msg)
                                )
                                .appendTo('#status_signup');
                        }
                    }
                });
            })
            .on('err.field.fv', function(e, data) {
                // Get the messages of field
                var messages = data.fv.getMessages(data.element);

                // Remove button's disable class
                $('#btn-submit-signup').removeClass('disable');

                // Remove the field messages if they're already available
                $('#errors_signup').find('li[data-field="' + data.field + '"]').remove();

                // Reset the message element when the form is valid
                $('#status_signup').html('');

                // Loop over the messages
                for (var i in messages) {
                    // Create new 'li' element to show the message
                    $('<li/>')
                        .attr('data-field', data.field)
                        .wrapInner(
                            $('<a/>')
                            .attr('href', 'javascript: void(0);')
                            .html(messages[i])
                            .on('click', function(e) {
                                // Focus on the invalid field
                                data.element.focus();
                            })
                        )
                        .appendTo('#errors_signup');
                }

                // Hide the default message
                // $field.data('fv.messages') returns the default element containing the messages
                data.element
                    .data('fv.messages')
                    .find('.help-block[data-fv-for="' + data.field + '"]')
                    .hide();
            })
            .on('success.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-signup').removeClass('disable');

                // Remove the field messages
                $('#errors_signup').find('li[data-field="' + data.field + '"]').remove();

                // Reset the message element when the form is valid
                $('#status_signup').html('');
            });
        // EOF

        // FORM FORGOT PASS
        $('#form-forgot')
            .formValidation({
                framework: 'bootstrap',
                fields: {
                    email: {
                        validators: {
                            notEmpty: {
                                message: 'The email address is required'
                            },
                            emailAddress: {
                                message: 'The email address is not valid'
                            },
                            stringCase: {
                                message: 'The email address must be in lowercase',
                                'case': 'lower'
                            }
                        }
                    }
                }
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();

                // Reset the message element when the form is valid
                $('#status_forgot').html('');

                // Create button loader instance
                var loader = Ladda.create(document.querySelector('#btn-submit-forgot'));
                // Start loading
                loader.start();

                var $form = $(e.target),
                    fv = $form.data('formValidation');

                // Use Ajax to submit form data
                $.ajax({
                    url: $form.attr('action'),
                    type: 'POST',
                    data: $form.serialize(),
                    success: function(result) {
                        if (result.type == 'success') {
                            // Stop loading
                            loader.stop();
                            loader.remove();

                            swal({
                                type: 'success',
                                title: "Sent!",
                                text: result.msg,
                                confirmButtonColor: '#52D5BE'
                            }, function() {
                                $("a[href='#signin']").click();
                            });
                        } else {
                            // Stop loading
                            loader.stop();
                            loader.remove();

                            $('<li/>')
                                .wrapInner(
                                    $('<span/>')
                                    .attr('class', 'ajax_error')
                                    .html(result.msg)
                                )
                                .appendTo('#status_forgot');
                        }
                    }
                });
            })
            .on('err.field.fv', function(e, data) {
                // data.fv      --> The FormValidation instance
                // data.field   --> The field name
                // data.element --> The field element

                // Get the messages of field
                var messages = data.fv.getMessages(data.element);

                // Remove button's disable class
                $('#btn-submit-forgot').removeClass('disable');

                // Reset the message element when the form is valid
                $('#status_forgot').html('');

                // Remove the field messages if they're already available
                $('#errors_forgot').find('li[data-field="' + data.field + '"]').remove();

                // Loop over the messages
                for (var i in messages) {
                    // Create new 'li' element to show the message
                    $('<li/>')
                        .attr('data-field', data.field)
                        .wrapInner(
                            $('<a/>')
                            .attr('href', 'javascript: void(0);')
                            .html(messages[i])
                            .on('click', function(e) {
                                // Focus on the invalid field
                                data.element.focus();
                            })
                        )
                        .appendTo('#errors_forgot');
                }

                // Hide the default message
                // $field.data('fv.messages') returns the default element containing the messages
                data.element
                    .data('fv.messages')
                    .find('.help-block[data-fv-for="' + data.field + '"]')
                    .hide();
            })
            .on('success.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-forgot').removeClass('disable');

                // Remove the field messages
                $('#errors_forgot').find('li[data-field="' + data.field + '"]').remove();

                // Reset the message element when the form is valid
                $('#status_forgot').html('');
            });
        // EOF

        // FORM APPLY
        $('#applyForm')
            .formValidation({
                framework: 'bootstrap',
                fields: {
                    fullName: {
                        validators: {
                            notEmpty: {
                                message: 'The first name is required'
                            },
                            stringLength: {
                                min: 5,
                                message: 'The ful name must be more than 4 characters long'
                            },
                            regexp: {
                                enabled: false,
                                regexp: /^[a-zA-Z\s]+$/,
                                message: 'The full name can only consist of alphabetical, number, and space'
                            }
                        }
                    },
                    phone: {
                        validators: {
                            notEmpty: {
                                message: 'The phone number is required'
                            },
                            phone: {
                                country: 'DE',
                                message: 'The value is not valid phone number'
                            }
                        }
                    },
                    email: {
                        validators: {
                            notEmpty: {
                                message: 'The email address is required'
                            },
                            remote: {
                                type: 'GET',
                                url: 'https://api.mailgun.net/v2/address/validate?callback=?',
                                crossDomain: true,
                                name: 'address',
                                data: {
                                    // Registry a Mailgun account and get a free API key
                                    // at https://mailgun.com/signup
                                    api_key: 'pubkey-83a6-sl6j2m3daneyobi87b3-ksx3q29'
                                },
                                dataType: 'jsonp',
                                validKey: 'is_valid',
                                message: 'The email address is not valid'
                            }
                        }
                    },
                    location: {
                        validators: {
                            notEmpty: {
                                message: 'Location is required'
                            },
                            stringLength: {
                                min: 3,
                                message: 'The location must be more than 2 characters long'
                            }
                        }
                    },
                    lastJob: {
                        validators: {
                            notEmpty: {
                                message: 'The last job is required'
                            },
                            stringLength: {
                                min: 5,
                                message: 'The last job must be more than 4 characters long'
                            }
                        }
                    },
                    resumeFile: {
                        validators: {
                            file: {
                                extension: 'pdf',
                                type: 'application/pdf',
                                message: 'Please choose a PDF file for resume'
                            }
                        }
                    }
                }
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();

                // Create button loader instance
                var loader = Ladda.create(document.querySelector('#btn-submit-apply'));
                // Start loading
                loader.start();

                // Reset the message element when the form is valid
                $('#status_apply').html('');

                var $form = $(e.target),
                    formData = new FormData(),
                    params = $form.serializeArray(),
                    files = $form.find('[name="resumeFile"]')[0].files;

                $.each(files, function(i, file) {
                    formData.append('resumeFile', file);
                });

                $.each(params, function(i, val) {
                    formData.append(val.name, val.value);
                });

                $.ajax({
                    url: $form.attr('action'),
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST',
                    success: function(result) {
                        // ... Process the result ...
                        if (result.type == 'success') {
                            // Stop loading
                            loader.stop();
                            loader.remove();

                            swal({
                                type: 'success',
                                title: "Applied!",
                                text: result.msg,
                                confirmButtonColor: '#52D5BE'
                            }, function() {
                                $('#applyForm').data('formValidation').resetForm();
                                $('#btn-discard-apply').click();
                            });
                        } else {
                            // Stop loading
                            loader.stop();
                            loader.remove();

                            $('<li/>')
                                .wrapInner(
                                    $('<span/>')
                                    .attr('class', 'ajax_error')
                                    .html(result.msg)
                                )
                                .appendTo('#status_apply');
                        }
                    }
                });
            })
            .on('err.field.fv', function(e, data) {
                // Get the messages of field
                var messages = data.fv.getMessages(data.element);

                // Remove button's disable class
                $('#btn-submit-apply').removeClass('disable');

                // Remove the field messages if they're already available
                $('#errors_apply').find('li[data-field="' + data.field + '"]').remove();

                // Reset the message element when the form is valid
                $('#status_apply').html('');

                // Loop over the messages
                for (var i in messages) {
                    // Create new 'li' element to show the message
                    $('<li/>')
                        .attr('data-field', data.field)
                        .wrapInner(
                            $('<a/>')
                            .attr('href', 'javascript: void(0);')
                            .html(messages[i])
                            .on('click', function(e) {
                                // Focus on the invalid field
                                data.element.focus();
                            })
                        )
                        .appendTo('#errors_apply');
                }

                // Hide the default message
                // $field.data('fv.messages') returns the default element containing the messages
                data.element
                    .data('fv.messages')
                    .find('.help-block[data-fv-for="' + data.field + '"]')
                    .hide();
            })
            .on('success.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-apply').removeClass('disable');

                // Remove the field messages
                $('#errors_apply').find('li[data-field="' + data.field + '"]').remove();

                // Reset the message element when the form is valid
                $('#status_apply').html('');
            });
        // EOF

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
                                message: 'Please provide company description'
                            },
                            callback: {
                                message: 'The company description must be more than 200 characters long',
                                callback: function(value, validator, $field) {
                                    if (value === '') {
                                        return true;
                                    }
                                    // Get the plain text without HTML
                                    var div = $('<div/>').html(value).get(0),
                                        text = div.textContent || div.innerText;

                                    return text.length > 200;
                                }
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
            .find('[name="salaryFrom"]').mask('000.000.000.000.000', {
                reverse: true
            })
            .find('[name="salaryTo"]').mask('000.000.000.000.000', {
                reverse: true
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();

                // Create button loader instance
                var loader = Ladda.create(document.querySelector('#btn-submit-post'));
                // Start loading
                loader.start();

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
                            // Stop loading
                            loader.stop();
                            loader.remove();

                            swal({
                                type: 'success',
                                title: "Success!",
                                text: result.msg,
                                confirmButtonColor: '#52D5BE'
                            }, function() {
                                location.reload(true);
                            });
                        } else {
                            // Stop loading
                            loader.stop();
                            loader.remove();

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
            .on('err.field.fv', function(e, data) {
                // Get the messages of field
                var messages = data.fv.getMessages(data.element);

                // Remove button's disable class
                $('#btn-submit-post').removeClass('disable');

                // Dummy clear notification
                $('body').pgNotification().hide();

                // Loop over the messages
                for (var i in messages) {
                    // Show siple error notification
                    $('body').pgNotification({
                        position: 'top-left',
                        style: 'simple',
                        type: 'danger',
                        message: messages[i]
                    }).show();
                }
            })
            .on('success.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-post').removeClass('disable');

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
            .find('[name="salaryFrom"]').mask('000.000.000.000.000', {
                reverse: true
            })
            .find('[name="salaryTo"]').mask('000.000.000.000.000', {
                reverse: true
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();

                // Create button loader instance
                var loader = Ladda.create(document.querySelector('#btn-submit-edit'));
                // Start loading
                loader.start();

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

                $.ajax({ // Send the datas
                    url: $form.attr('action'),
                    data: formData,
                    type: 'POST',
                    success: function(result) {
                        // Stop loading
                        loader.stop();
                        loader.remove();
                        if (result.type == 'success') {
                            swal({
                                type: result.type,
                                title: "Saved!",
                                text: result.msg,
                                confirmButtonColor: '#52D5BE'
                            }, function() {
                                location.reload(true);
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
            .on('err.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-edit').removeClass('disable');
            })
            .on('success.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-edit').removeClass('disable');

                // Reset the message element when the form is valid
                $('#status_edit').html('');
            });
        // EOF

        // END FORM VALIDATION HANDLER ////////////


        // create user avatar based on name initial //////
        $('#user-avatar').initial({
            width: 80,
            height: 80,
            charCount: 2,
            fontSize: 45
        });


        // ========================
        // START EVENT HANDLERS ===
        // ========================

        // =========== OPEN JOB DETAILS HANDLER ======================
        $('body').on('click', '.item', function(e) {

            $('.job-apply').hide();

            $(this).find('.apply-btn').animate({
                    'right': '0px'
                }).end().siblings()
                .find('.apply-btn').animate({
                    'right': '-240px'
                });


            if ($(this).children('.apply-btn').children('p').text() == 'Logout to apply') {
                $(this).find('.datetime').animate({
                        'right': '190px'
                    }).end().siblings()
                    .find('.datetime').animate({
                        'right': '20px'
                    });
            } else {
                $(this).find('.datetime').animate({
                        'right': '160px'
                    }).end().siblings()
                    .find('.datetime').animate({
                        'right': '20px'
                    });
            }


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
                    $('#applyForm').attr('action', '/api/job/apply/' + id);

                    checkJob(data.email, id);

                }
            });
        });


        // =============  EDIT JOB HANDLER ===============
        $('body').on('click', '#btn-edit-job', function(e) {
            e.preventDefault();

            var id = $(this).parent('li').attr('data-id');
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
                    // Assign the values
                    $('#EditJob div.panel form#form-edit input#oldJobImg').attr('value', data.profile.logo);
                    $('#EditJob div.panel form#form-edit div.logoBox_edit').html('<img class="img-list" id="logo-preview_edit" alt="" data-src-retina="' + img + '" data-src="' + img + '" src="' + img + '">');
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

                    $('#EditJob div.panel form#form-edit').attr('action', '/api/job/edit/' + data._id);
                }
            });

            //formWizard2();
            $('#EditJob').modal('show');
        });


        // =============  APPLY EVENT HANDLER ===============
        $('body').on('click', '#btn-apply-job,.apply-job-btn.apply', function(e) {
            $('#applyForm').formValidation('resetForm', true);

            var jobTitle = $('.profile .job-title').text();
            var companyName = $('.profile .name').text();
            var location = $('.profile .datetime').text();

            $('#app-to').text(jobTitle + ' at ' + companyName);

            $('.job-apply').show();
            $('body .email-wrapper .email-opened .email-content-wrapper').animate({
                scrollTop: $('.email-wrapper .email-opened .email-content-wrapper .email-content').outerHeight()
            }, 'slow');

            return false;

            e.stopPropagation();
        });

        // Form apply discard button
        $('body').on('click', '#btn-discard-apply', function() { // Dismiss apply form
            $('body').find('.job-apply').hide();
            $('#applyForm').data('formValidation').resetForm();
        });

        // ========================
        // END EVENT HANDLERS =====
        // ========================



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

        $('#genToken').click(function() {
            var url = '/braintree';
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

        //////////////// END OF FILTERS HANDLER //////////////


        // JOB LIST HANDLER /////
        $('body').on('click', '.item .checkbox', function(e) {
            e.stopPropagation();
        });


        // BASIC BUTTONS HANDLER ////
        $("a[href='#usignin']").click(function() {
            $('#form-login').trigger("reset");
            $('#modalAuth').modal('show');
            $('.signUp-panel').hide();
            $('.forgot-panel').hide();
            $('.signIn-panel').show();
        });

        $("a[href='#signin']").click(function() {
            $('#form-login').trigger("reset");
            $('.signUp-panel').hide();
            $('.forgot-panel').hide();
            $('.signIn-panel').fadeIn();
        });

        $("a[href='#signup']").click(function() {
            $('#form-register').trigger("reset");
            $('.signUp-panel').fadeIn();
            $('.forgot-panel').hide();
            $('.signIn-panel').hide();
        });

        $("a[href='#forgot']").click(function() {
            $('#form-forgot').trigger("reset");
            $('.signUp-panel').hide();
            $('.forgot-panel').fadeIn();
            $('.signIn-panel').hide();
        });

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


        $('.attach-btn').click(function() {
            $('#resumeFile').click();
        })


        $('#resumeFile').change(function() {
            var nameFile = $(this).val().replace(/C:\\fakepath\\/i, '');
            $('span.attach-btn').text(nameFile);

            if ($('span.attach-btn').text() == '') {
                $('span.attach-btn').text('Please Attach a PDF Resume');
            } else {
                $('#resumeFile-error').hide();
            }
        });

        $('.discard-replay').click(function() {
            $('.job-apply').slideUp();
            $('body .email-wrapper .email-opened .email-content-wrapper').animate({
                scrollTop: 0
            }, 'slow');
            return false;
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
