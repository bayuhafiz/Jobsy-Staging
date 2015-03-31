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
        var delCounter = 0;
        var pauCounter = 0;
        var pubCounter = 0;

        // Dummy clear the job table
        $('div.jobs-panel').html('');

        $.ajax({
            dataType: "json",
            url: url,
            success: function(data) {
                if (data.length > 0) {
                    dataHtml += '<ul id="user-job-list" class="cbp-ntaccordion">';

                    $.each(data, function(i) {

                        var random = 1 + Math.floor(Math.random() * 100);

                        if (data[i].status == 'deleted') {
                            delCounter = delCounter + 1; // Count deleted job
                            badge = '<span class="badge badge-danger">DELETED</span>';
                        } else if (data[i].status == 'paused') {
                            pauCounter = pauCounter + 1; // Count paused job
                            badge = '<span class="badge badge-warning">PAUSED</span>';
                        } else if (data[i].status == 'published') {
                            pubCounter = pubCounter + 1; // Count published job
                            badge = '<span class="badge badge-success">PUBLISHED</span>';
                        }

                        // Generate datas
                        dataHtml += '<li data-id="' + data[i]._id + '">' +
                            '<h5 style="color:#000" class="cbp-nttrigger semi-bold">' + data[i].details.jobTitle + '</h5>' +
                            '<h5 style="  text-align: center;">' + badge + '</h5>' +
                            '<h5 style="  text-align: right;"><a href="#" id="editButton" data-target="#EditJob" data-toggle="modal"><span class="p-t-5 p-b-5"><i class="fa fa-pencil fs-15"></i></span></a><a href="/job/stat/551a261fcedee3186ffe6c8c" id="pauseButton"><span class="p-t-5 p-b-5"><i class="fa fa-pause fs-15"></i></span></a><a href="/job/del/551a261fcedee3186ffe6c8c" id="deleteButton"><span class="p-t-5 p-b-5"><i class="fa fa-times fs-15"></i></span></a></h5>' +
                            '<div class="cbp-ntcontent">' +
                              '<p></p>' +
                              '<ul class="cbp-ntsubaccordion">';
                                
                        dataHtml += '</ul>' +
                            '</div>' +
                        '</li>';

                        // and here goes LOADING APPLICATIONS
                        //dataHtml = dataHtml + getApps(data[i]._id);

                        // FINALLY, SHOW THE WHOLE RESULTS...
                        $('div.jobs-panel').html(dataHtml).hide().show('slow');

                    });

                    dataHtml += '</ul>';

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
                    $('#user-job-counter').hide();
                    $('#user-job-table').hide();
                    $('#no-job-post').show('slow');
                }

                $('#user-job-list').cbpNTAccordion();
            }
        });
        
    }

    // ######################################### BEGIN DOCUMENT ON READY FN ##############################################
    $(document).ready(function() {

        /////////// initiate user jobs table !!! ////////////
        var uEmail = $('#user-email').val(); // Get logged user email

        showJobs('/api/jobs/' + uEmail + '/hide');

        // 'show deleted job' radio button action
        $("input:radio[name=hide-radio]").click(function() {
            var value = $(this).val();
            showJobs('/api/jobs/' + uEmail + '/' + value);
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
        $('body').on('click', '#editButton', function() {
            var dataHtml = '';
            var id = $(this).parent().parent().attr('data-id');

            $.ajax({
                dataType: "json",
                url: "/api/job/edit/" + id,
                success: function(data) {
                    if (data) {
                        var img = 'uploads/logo/' + data.profile.logo;
                        $('#EditJob div.panel form#form-edit input#oldJobImg').attr('value', data.profile.logo);
                        $('#EditJob div.panel form#form-edit img#editJobImg-preview').attr('src', img);
                        $('#EditJob div.panel form#form-edit input.companyName').attr('value', data.profile.name);

                        if (data.profile.location=='Daerah-Istimewa-Yogyakarta') {
                            data.profile.location = 'Daerah Istimewa Yogyakarta';
                        }
                        if (data.profile.location=='DKI-Jakarta') {
                            data.profile.location = 'DKI Jakarta';
                        }
                        if (data.profile.location=='Jawa-Barat') {
                            data.profile.location = 'Jawa Barat';
                        }
                        if (data.profile.location=='Jawa-Tengah') {
                            data.profile.location = 'Jawa Tengah';
                        }
                        if (data.profile.location=='Jawa-Timur') {
                            data.profile.location = 'Jawa Timur';
                        }
                        if (data.profile.location=='Kalimantan-Barat') {
                            data.profile.location = 'Kalimantan Barat';
                        }
                        if (data.profile.location=='Kalimantan-Selatan') {
                            data.profile.location = 'Kalimantan Selatan';
                        }
                        if (data.profile.location=='Kalimantan-Tengah') {
                            data.profile.location = 'Kalimantan Tengah';
                        }
                        if (data.profile.location=='Kalimantan-Timur') {
                            data.profile.location = 'Kalimantan Timur';
                        }
                        if (data.profile.location=='Kepulauan-Bangka-Belitung') {
                            data.profile.location = 'Kepulauan Bangka Belitung';
                        }
                        if (data.profile.location=='Kepulauan-Riau') {
                            data.profile.location = 'Kepulauan Riau';
                        }
                        if (data.profile.location=='Maluku-Utara') {
                            data.profile.location = 'Maluku Utara';
                        }
                        if (data.profile.location=='Nanggroe-Aceh-Darussalam') {
                            data.profile.location = 'Nanggroe Aceh Darussalam';
                        }
                        if (data.profile.location=='Nusa-Tenggara-Barat') {
                            data.profile.location = 'Nusa Tenggara Barat';
                        }
                        if (data.profile.location=='Nusa-Tenggara-Timur') {
                            data.profile.location = 'Nusa Tenggara Timur';
                        }
                        if (data.profile.location=='Papua-Barat') {
                            data.profile.location = 'Papua Barat';
                        }
                        if (data.profile.location=='Sulawesi-Barat') {
                            data.profile.location = 'Sulawesi Barat';
                        }
                        if (data.profile.location=='Sulawesi-Selatan') {
                            data.profile.location = 'Sulawesi Selatan';
                        }
                        if (data.profile.location=='Sulawesi-Tengah') {
                            data.profile.location = 'Sulawesi Tengah';
                        }
                        if (data.profile.location=='Sulawesi-Tenggara') {
                            data.profile.location = 'Sulawesi Tenggara';
                        }
                        if (data.profile.location=='Sulawesi-Utara') {
                            data.profile.location = 'Sulawesi Utara';
                        }
                        if (data.profile.location=='Sumatera-Selatan') {
                            data.profile.location = 'Sumatera Selatan';
                        }
                        if (data.profile.location=='Sumatera-Utara') {
                            data.profile.location = 'Sumatera Utara';
                        }
                        if (data.profile.location=='Sumatera-Barat') {
                            data.profile.location = 'Sumatera Barat';
                        }


                        $("#EditJob div.panel form#form-edit div#s2id_location span.select2-chosen").text(data.profile.location);
                        
                        $('#EditJob div.panel form#form-edit select#location option:selected').val();

              
                        $('#EditJob div.panel form#form-edit textarea.description-text').parent().children('div.note-editor').children('.note-editable').html(data.profile.description);
                        $('#EditJob div.panel form#form-edit input.jobTitle').attr('value', data.details.jobTitle);


                        if (data.details.category==130) {
                            data.details.category = 'Audit & Pajak';
                        }
                        if (data.details.category==135) {
                            data.details.category = 'Perbankan/Keuangan';
                        }
                        if (data.details.category==132) {
                            data.details.category = 'Keuangan/Investasi';
                        }
                        if (data.details.category==131) {
                            data.details.category = 'Akuntansi Umum/Pembiayaan';
                        }
                        if (data.details.category==133) {
                            data.details.category = 'Staf/Administrasi umum';
                        }
                        if (data.details.category==137) {
                            data.details.category = 'Personalia';
                        }
                        if (data.details.category==146) {
                            data.details.category = 'Sekretaris';
                        }
                        if (data.details.category==148) {
                            data.details.category = 'Manajemen Atas';
                        }
                        if (data.details.category==100) {
                            data.details.category = 'Periklanan';
                        }
                        if (data.details.category==101) {
                            data.details.category = 'Seni/Desain Kreatif';
                        }
                        if (data.details.category==106) {
                            data.details.category = 'Hiburan/Seni Panggung';
                        }
                        if (data.details.category==141) {
                            data.details.category = 'Hubungan Masyarakat';
                        }
                        if (data.details.category==180) {
                            data.details.category = 'Arsitek/Desain Interior';
                        }
                        if (data.details.category==184) {
                            data.details.category = 'Sipil/Konstruksi Bangunan';
                        }
                        if (data.details.category==150) {
                            data.details.category = 'Properti/Real Estate';
                        }
                        if (data.details.category==198) {
                            data.details.category = 'Survei Kuantitas';
                        }
                        if (data.details.category==192) {
                            data.details.category = 'IT-Perangkat Keras';
                        }
                        if (data.details.category==193) {
                            data.details.category = 'IT-Jaringan/Sistem/Sistem Database';
                        }
                        if (data.details.category==191) {
                            data.details.category = 'IT-Perangkat Lunak';
                        }
                        if (data.details.category==105) {
                            data.details.category = 'Pendidikan';
                        }
                        if (data.details.category==121) {
                            data.details.category = 'Penelitian & Pengembangan';
                        }
                        if (data.details.category==185) {
                            data.details.category = 'Teknik Kimia';
                        }
                        if (data.details.category==187) {
                            data.details.category = 'Teknik Elektrikal';
                        }
                        if (data.details.category==186) {
                            data.details.category = 'Teknik Elektro';
                        }
                        if (data.details.category==189) {
                            data.details.category = 'Teknik Lingkungan';
                        }
                        if (data.details.category==200) {
                            data.details.category = 'Teknik';
                        }
                        if (data.details.category==195) {
                            data.details.category = 'Mekanik/Otomotif';
                        }
                        if (data.details.category==190) {
                            data.details.category = 'Teknik Perminyakan';
                        }
                        if (data.details.category==188) {
                            data.details.category = 'Teknik Lainnya';
                        }
                        if (data.details.category==113) {
                            data.details.category = 'Dokter/Diagnosa';
                        }
                        if (data.details.category==112) {
                            data.details.category = 'Farmasi';
                        }
                        if (data.details.category==111) {
                            data.details.category = 'Praktisi/Asisten Medis';
                        }
                        if (data.details.category==107) {
                            data.details.category = 'Makanan/Minuman/Pelayanan Restoran';
                        }
                        if (data.details.category==114) {
                            data.details.category = 'Hotel/Pariwisata';
                        }
                        if (data.details.category==115) {
                            data.details.category = 'Pemeliharaan';
                        }
                        if (data.details.category==194) {
                            data.details.category = 'Manufaktur';
                        }
                        if (data.details.category==196) {
                            data.details.category = 'Kontrol Proses';
                        }

                        if (data.details.category==140) {
                            data.details.category = 'Pembelian/Manajemen Material';
                        }
                        if (data.details.category==197) {
                            data.details.category = 'Penjaminan Kualitas / QA';
                        }
                        if (data.details.category==142) {
                            data.details.category = 'Penjualan - Korporasi';
                        }
                        if (data.details.category==139) {
                            data.details.category = 'Pemasaran/Pengembangan Bisnis';
                        }
                        if (data.details.category==149) {
                            data.details.category = 'Merchandising';
                        }
                        if (data.details.category==145) {
                            data.details.category = 'Penjualan Ritel';
                        }
                        if (data.details.category==143) {
                            data.details.category = 'Penjualan - Teknik/Teknikal/IT';
                        }
                        if (data.details.category==144) {
                            data.details.category = 'Proses desain dan kontrol';
                        }
                        if (data.details.category==151) {
                            data.details.category = 'Tele-sales/Telemarketing';
                        }
                        if (data.details.category==103) {
                            data.details.category = 'Aktuaria/Statistik';
                        }
                        if (data.details.category==102) {
                            data.details.category = 'Pertanian';
                        }
                        if (data.details.category==181) {
                            data.details.category = 'Penerbangan';
                        }
                        if (data.details.category==182) {
                            data.details.category = 'Bioteknologi';
                        }
                        if (data.details.category==183) {
                            data.details.category = 'Kimia';
                        }
                        if (data.details.category==108) {
                            data.details.category = 'Teknologi Makanan/Ahli Gizi';
                        }
                        if (data.details.category==109) {
                            data.details.category = 'Geologi/Geofisika';
                        }
                        if (data.details.category==199) {
                            data.details.category = 'Ilmu Pengetahuan & Teknologi/Lab';
                        }
                        if (data.details.category==119) {
                            data.details.category = 'Keamanan / Angkatan Bersenjata';
                        }
                        if (data.details.category==134) {
                            data.details.category = 'Pelayanan Pelanggan';
                        }
                        if (data.details.category==147) {
                            data.details.category = 'Logistik/Jaringan distribusi';
                        }
                        if (data.details.category==138) {
                            data.details.category = 'Hukum / Legal';
                        }
                        if (data.details.category==118) {
                            data.details.category = 'Perawatan Kesehatan / Kecantikan';
                        }
                        if (data.details.category==120) {
                            data.details.category = 'Pelayanan kemasyarakatan';
                        }
                        if (data.details.category==152) {
                            data.details.category = 'Teknikal &amp; Bantuan Pelanggan';
                        }
                        if (data.details.category==110) {
                            data.details.category = 'Pekerjaan Umum';
                        }
                        if (data.details.category==104) {
                            data.details.category = 'Jurnalis/Editor';
                        }
                        if (data.details.category==117) {
                            data.details.category = 'Penerbitan';
                        }
                        if (data.details.category==116) {
                            data.details.category = 'Lainnya/Kategori tidak tersedia';
                        }


                        $('#EditJob div.panel form#form-edit div#s2id_category span.select2-chosen').text(data.details.category);
                        $('#EditJob div.panel form#form-edit select#category option:selected').val(data.details.category);

                        if (data.details.jobType == 'full-time') {
                            data.details.jobType = 'Full Time';
                        } 

                        if (data.details.jobType == 'contract') {
                            data.details.jobType = 'Contract';
                        }

                        if (data.details.jobType == 'part-time') {
                            data.details.jobType = 'Part Time';
                        }


                        /*$('#EditJob div.panel form#form-edit select#jobType').change(function () {
                            var a = $('#EditJob div.panel form#form-edit select#jobType option:selected').val();
                            $('#EditJob div.panel form#form-edit select#jobType option:selected').val(a);
                        });*/

                        $('#EditJob div.panel form#form-edit div#s2id_jobType span.select2-chosen').text(data.details.jobType);
                        $('#EditJob div.panel form#form-edit select#jobType option:selected').val();

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
        });


        $("#editJobImg").change(function() {
            readURL(this);
        });



        $('#summernote1,#summernote2,#summernote3').summernote();

        // Forms validation
        $('#form-create').validate();
        $('#form-edit').validate();
        $('#form-register').validate();
        $('#applyForm').validate();

        // create user avatar based on name initial
        $('#user-avatar').initial({
            width: 80,
            height: 80,
            charCount: 2,
            fontSize: 45
        });

        // Reset/clear form function
        $('.clear-btn').click(function() {
            $('#form-edit input').attr('value', '');
            $('textarea#summernote1,textarea#summernote2,textarea#summernote3').parent().children('.note-editor').children('.note-editable').text('');
            $('#Crd option:selected').text();
        });


        // Notification show up /////
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


        // SEARCH APPLICANT FUNCTION
        $(".searchApplicant").on("keyup", function() {
            var g = $(this).val().toLowerCase();

            $("tr.applyDetail td span.job-applicant").each(function() {
                var s = $(this).text().toLowerCase();
                $(this).closest('tr.applyDetail')[s.indexOf(g) !== -1 ? 'show' : 'hide']();
            });
        });

        $('textarea').autosize();

        //$('.description-text').keydown(counter1);
        //$('.jobScope-text').keydown(counter2);
        //$('.requirements-text').keydown(counter3);

        $('#summernote2').summernote({
            height: 200
        });

        $('textarea').autosize();

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
