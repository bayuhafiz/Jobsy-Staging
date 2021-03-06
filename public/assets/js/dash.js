(function($) {

    'use strict';

    $(document).ready(function() {


        // Get logged user email
        var uEmail = $('#user-email').val();

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
            var ext = $(this).val().split('.').pop().toLowerCase();
            if ($.inArray(ext, ['png', 'jpg', 'jpeg']) == -1) {
                swal({
                    type: 'error',
                    title: 'Invalid Extension!',
                    text: 'Your logo file should be a PNG, JPG or JPEG file'
                });
            } else {
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
            }
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
            var ext = $(this).val().split('.').pop().toLowerCase();
            if ($.inArray(ext, ['png', 'jpg', 'jpeg']) == -1) {
                swal({
                    type: 'error',
                    title: 'Invalid Extension!',
                    text: 'Your logo file should be a PNG, JPG or JPEG file'
                });
            } else {
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
            }
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

                // Create button loader instance
                var loader = Ladda.create(document.querySelector('#btn-submit-post'));
                // Start loading
                loader.start();

                // Reset the message element when the form is valid
                $('#status_post').html('');

                var $form = $(e.target),
                    formData = new FormData(),
                    fv = $form.data('formValidation'),
                    params = $form.serializeArray(),
                    editors = new Array();

                // Get CKEditor values
                params.push({
                    name: 'description',
                    value: CKEDITOR.instances['editor1'].getData()
                });
                params.push({
                    name: 'jobScope',
                    value: CKEDITOR.instances['editor2'].getData()
                });
                params.push({
                    name: 'requirements',
                    value: CKEDITOR.instances['editor3'].getData()
                });
                // Then push the values
                $.each(params, function(i, val) {
                    formData.append(val.name, val.value);
                });

                $.post($form.attr('action'), params, function(result) {
                    if (result.type == 'success') {
                        // Stop loading
                        loader.stop();
                        loader.remove();

                        swal({
                            type: 'success',
                            title: "Created!",
                            confirmButtonColor: '#52D5BE',
                            text: result.msg
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
                            .appendTo('#status_edit');
                    }
                });
            })
            .on('err.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-post').removeClass('disable');
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
                // Then push the values
                $.each(params, function(i, val) {
                    formData.append(val.name, val.value);
                });

                $.post($form.attr('action'), params, function(result) {
                    if (result.type == 'success') {
                        // Stop loading
                        loader.stop();
                        loader.remove();

                        swal({
                            type: 'success',
                            title: "Saved!",
                            confirmButtonColor: '#52D5BE',
                            text: result.msg
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
                            .appendTo('#status_edit');
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

        // EDIT ACCOUNT
        $('#form-account')
            .formValidation({
                framework: 'bootstrap',
                fields: {
                    firstName: {
                        validators: {
                            notEmpty: {
                                message: 'The first name required'
                            },
                            stringLength: {
                                min: 3,
                                message: 'Must be more than 2 characters long'
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
                                message: 'Must be more than 2 characters long'
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
                    }
                }
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();

                // Create button loader instance
                var loader = Ladda.create(document.querySelector('#btn-submit-account'));
                // Start loading
                loader.start();

                // Reset the message element when the form is valid
                $('#status_account').html('');

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
                                title: "Updated!",
                                timer: 3000,
                                showConfirmButton: false,
                                text: result.msg
                            });
                            setTimeout(function() {
                                location.reload();
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
                                .appendTo('#status_account');
                        }
                    }
                });
            })
            .on('err.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-account').removeClass('disable');
            })
            .on('success.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-account').removeClass('disable');

                // Reset the message element when the form is valid
                $('#status_account').html('');
            });
        // EOF

        // UPDATE PASSWORD
        $('#form-update-pass')
            .formValidation({
                framework: 'bootstrap',
                fields: {
                    newPass: {
                        validators: {
                            notEmpty: {
                                message: 'The new password is required'
                            },
                            stringLength: {
                                min: 4,
                                message: 'The new password must be more than 3 characters long'
                            }
                        }
                    },
                    confirmPass: {
                        validators: {
                            identical: {
                                field: 'newPass',
                                message: 'The password and its confirm are not the same'
                            }
                        }
                    }
                }
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();

                // Create button loader instance
                var loader = Ladda.create(document.querySelector('#btn-submit-pass'));
                // Start loading
                loader.start();

                // Reset the message element when the form is valid
                $('#status_pass').html('');

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
                                title: "Your password is updated!",
                                text: result.msg,
                                confirmButtonColor: '#52D5BE',
                                confirmButtonText: 'Ok, sign me out...'
                            }, function() {
                                $("a[href='#signout']").trigger('click');
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
                                .appendTo('#status_pass');
                        }
                    }
                });
            })
            .on('err.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-account').removeClass('disable');
            })
            .on('success.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-account').removeClass('disable');

                // Reset the message element when the form is valid
                $('#status_pass').html('');
            });
        // EOF

        // SEND INVITATION EMAIL
        $('#form-send-invitation')
            .on('init.field.fv', function(e, data) {
                // data.fv      --> The FormValidation instance
                // data.field   --> The field name
                // data.element --> The field element

                var $parent = data.element.parents('.form-group'),
                    $icon = $parent.find('.form-control-feedback[data-fv-icon-for="' + data.field + '"]');

                // You can retrieve the icon element by
                // $icon = data.element.data('fv.icon');

                data.fv.resetField(data.element);
            })
            .formValidation({
                framework: 'bootstrap',
                fields: {
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
                    jobUrl: {
                        validators: {
                            notEmpty: {
                                message: 'The URL is required'
                            },
                            uri: {
                                message: 'The URL is invalid'
                            }
                        }
                    }
                }
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();

                // Create button loader instance
                var loader = Ladda.create(document.querySelector('#btn-submit-invitation'));
                // Start loading
                loader.start();

                // Reset the message element when the form is valid
                $('#status_invitation').html('');

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
                                title: "Sent!",
                                text: result.msg,
                                showCancelButton: true,
                                confirmButtonColor: '#52D5BE',
                                confirmButtonText: 'Send another invitation',
                                cancelButtonText: 'Close'
                            }, function(isConfirm) {
                                $('#form-send-invitation').formValidation('resetForm', true);
                                if (isConfirm) {
                                    $("#SendInvitation").modal('show');
                                } else {
                                    $("#SendInvitation").modal('hide');
                                }
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
                                .appendTo('#status_invitation');
                        }
                    }
                });
            })
            .on('err.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-invitation').removeClass('disable');
            })
            .on('success.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-invitation').removeClass('disable');

                // Reset the message element when the form is valid
                $('#status_invitation').html('');
            });
        // EOF

        // CREATE CUSTOM POST #1 STEP
        $('#form-custom-post')
            .on('init.field.fv', function(e, data) {
                // data.fv      --> The FormValidation instance
                // data.field   --> The field name
                // data.element --> The field element

                var $parent = data.element.parents('.form-group'),
                    $icon = $parent.find('.form-control-feedback[data-fv-icon-for="' + data.field + '"]');

                // You can retrieve the icon element by
                // $icon = data.element.data('fv.icon');

                data.fv.resetField(data.element);
            })
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
                                message: 'Must be more than 2 characters long'
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
                                message: 'Must be more than 2 characters long'
                            }
                        }
                    },
                    email: {
                        validators: {
                            notEmpty: {
                                message: 'The email address is required'
                            },
                            stringCase: {
                                message: 'Must be in lowercase',
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
                                message: 'This email address is not valid'
                            }
                        }
                    }
                }
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();

                // Create button loader instance
                var loader = Ladda.create(document.querySelector('#btn-submit-custom-post'));
                // Start loading
                loader.start();

                // Reset the message element when the form is valid
                $('#status_custom_post').html('');

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
                                title: "Created!",
                                text: result.msg,
                                confirmButtonColor: '#52D5BE',
                                confirmButtonText: 'Continue creating post >'
                            }, function(isConfirm) {
                                if (isConfirm) {
                                    $('#CustomJobModal').modal('hide');

                                    console.log(JSON.stringify(result));

                                    // Generate custom fields on new job modal
                                    $('<input>').attr({
                                        type: 'hidden',
                                        id: 'user-email',
                                        name: 'userEmail',
                                        value: result.uEmail
                                    }).appendTo('#form-create-job');

                                    $('<input>').attr({
                                        type: 'hidden',
                                        id: 'user-pass',
                                        name: 'userPass',
                                        value: result.uPass
                                    }).appendTo('#form-create-job');

                                    $('<input>').attr({
                                        type: 'hidden',
                                        id: 'user-fname',
                                        name: 'userFirstName',
                                        value: result.uFirstName
                                    }).appendTo('#form-create-job');

                                    $('<input>').attr({
                                        type: 'hidden',
                                        id: 'user-lname',
                                        name: 'userLastName',
                                        value: result.uLastName
                                    }).appendTo('#form-create-job');

                                    // Show post job modal
                                    $('#PostNewJob').modal('show');
                                }
                            });
                        } else {
                            // Stop loading
                            loader.stop();
                            loader.remove();

                            $('<span/>')
                                .attr('class', 'ajax_error')
                                .html(result.msg)
                                .appendTo('#status_custom_post');
                        }
                    }
                });
            })
            .on('err.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-custom-post').removeClass('disable');
            })
            .on('success.field.fv', function(e, data) {
                // Remove button's disable class
                $('#btn-submit-custom-post').removeClass('disable');

                // Reset the message element when the form is valid
                $('#status_custom_post').html('');
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


        // ================================================================================================
        // START EVENT HANDLERS ===========================================================================
        // ================================================================================================

        // SWITCHERY //////////////////////////
        function onChange(el) {
            if (typeof Event === 'function' || !document.fireEvent) {
                var event = document.createEvent('HTMLEvents');
                event.initEvent('change', true, true);
                el.dispatchEvent(event);
            } else {
                el.fireEvent('onchange');
            }
        }

        // Switchery Handler
        var elem = document.querySelector('#job-switch');
        var switchery = new Switchery(elem, {
            color: '#52D5BE',
            secondaryColor: '#CD5F64',
            speed: '0.2s'
        });

        // If switch clicked event handler
        elem.onchange = function() {
            if (elem.checked == true) {
                showJobs('/api/jobs/' + uEmail + '/hide');
                localStorage['switch_checked'] = 'hide'; // save to session
            } else if (elem.checked == false) {
                showJobs('/api/jobs/' + uEmail + '/show');
                localStorage['switch_checked'] = 'show'; // save to session
            }
        };

        // Check session to init switch state
        var stat = localStorage['switch_checked'];
        if (stat == 'undefined') {
            showJobs('/api/jobs/' + uEmail + '/hide');
            localStorage['switch_checked'] = 'hide'; // save to session
        } else {
            if (stat == 'hide') {
                showJobs('/api/jobs/' + uEmail + '/hide');
            } else if (stat == 'show') {
                showJobs('/api/jobs/' + uEmail + '/show');
                if (elem.checked) {
                    elem.checked = false;
                    onChange(elem);
                }
            }
        }
        // END OF SWITCHERY //////////////////////////


        // Buy Credits buttons action (EXPERIMENTAL ONLY!!!)
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
        /*$(".searchApplicant").on("keyup", function() {
            var g = $(this).val().toLowerCase();
            $("div.collapse-card").each(function() {
                var s = $(this).text().toLowerCase();
                $(this).closest('div')[s.indexOf(g) !== -1 ? 'show' : 'hide']();
            });
        });*/

        $('#searchJob').hideseek({
            highlight: true
        });

        // Reset/clear form function /////
        $('.clear-btn').click(function() {
            $('#form-edit input').attr('value', '');
            $('textarea#editor1,textarea#editor2,textarea#editor3').parent().children('.note-editor').children('.note-editable').text('');
            $('#Crd option:selected').text();
        });



        // ******* BASIC BUTTONS HANDLER ********
        // Authentication modal buttons handler
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


        // Account settings buttons handler
        $('a[href=#account]').click(function() {
            $('#accountModal').modal('show');
            $('div.account-panel').show();
            $('div.updatePass-panel').hide();
        });

        $('a[href=#pass]').click(function() {
            $('div.account-panel').hide();
            $('div.updatePass-panel').fadeIn();
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
                        localStorage['switch_checked'] = undefined;
                        window.location.href = '/';
                    }, 2100);
                }
            });
        });
        // ******* End of BASIC BUTTONS HANDLER ********



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
        // Edit job post
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
                        // Assign the values
                        $('#EditJob div.panel form#form-edit input#oldJobImg').attr('value', data.profile.logo);
                        $('#EditJob div.panel form#form-edit img#logo-preview_edit').attr('src', img);
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

                    //$('#appDetailsCloseBtn').attr('onClick', 'location.href=\'/job/app/' + dataId + '\'');
                }
            });
        });

    });

})(window.jQuery);
