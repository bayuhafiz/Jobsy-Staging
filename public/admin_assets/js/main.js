(function($) {
    'use strict';

    var closeMenu = function() {
        $('.gn-menu-wrapper').removeClass('gn-open-all');
        return false;
    }

    var host = window.location.hostname;

    var originalText = '<h3>' +
        'JOBSY Control center' +
        '<span>' +
        'Go to the menu to pick actions...' +
        '</span>' +
        '</h3>';

    $('#page-container').html(originalText);

    // Algolia configs
    var client = $.algolia.Client('LQIQTYPQLJ', 'c0680524196d5901138dced4e533f46b');
    var index_local_jobs = client.initIndex('Jobs-local');
    var index_local_ujobs = client.initIndex('User-jobs');
    var index_jobs = client.initIndex('Jobs');
    var index_ujobs = client.initIndex('Jobs');

    // display index button
    $("a[href='#di']").click(function() {
        // Get first page
        if (host == 'localhost') {
            index_local_jobs.browse(0, function(err, content) {
                $('.result-container').html(''); //Dummy clear
                var result = '';
                result += '<div class="panel panel-default"><div class="panel-title">' +
                    'Displaying index..' + 
                    '</div>';
                $.each(content, function(i, item) {
                    result += '<div class="panel-body">' + JSON.stringify(item) + '</div>';
                })
                result += '</div>';
                $('.result-container').html(result);
            });
        } else {
            index_jobs.browse(0, function(err, content) {
                $('.result-container').html(''); //Dummy clear
                var result = '';
                result += '<h3>' +
                    'Displaying index..';
                $.each(content, function(i, item) {
                    result += '<span>' + item + '</span>';
                })
                result += '</h3>';
                $('.result-container').html(result);
            });
        }
        closeMenu();
    })

    // initial import button
    $("a[href='#ii']").click(function() {
        $.get('/alg/init', function(data) {
            $('.result-container').html(''); //Dummy clear
            var result = '<h3>' +
                data.title + ': code ' + data.msg.httpCode +
                '<br/><span>Result: ' + data.type + '</span>' +
                '<span>Task ID: ' + data.msg.taskID + '</span>' +
                '<span>Object ID: ' + data.msg.objectID + '</span>' +
                '<span>Updated @ ' + data.msg.updatedAt + '</span>' +
                '</h3>';
            $('.result-container').html(result).fadeIn();
        });
        closeMenu();
    })

    // clear index button
    $("a[href='#ci']").click(function() {
        $.get('/alg/clear', function(data) {
            console.log(JSON.stringify(data));
            $('.result-container').html(''); //Dummy clear
            var result = '<h3>' +
                data.title + ': code ' + data.msg.httpCode +
                '<br/><span>Result: ' + data.type + '</span>' +
                '<span>Task ID: ' + data.msg.taskID + '</span>' +
                '<span>Updated @ ' + data.msg.updatedAt + '</span>' +
                '</h3>';
            $('.result-container').html(result).fadeIn();
        });
        closeMenu();
    })



    // init button
    /*$('#show_logs').click(function() {
        // Get last 100 log entries
        client.getLogs(0, 10, function(err, content) {
            $.each(content, function(i, item) {
                    console.log(JSON.stringify(item));
                })
                swal({
                    title: 'Showing logs..',
                    html: '<div class="panel panel-default">' + 
                                JSON.stringify(content) +
                            '</div>'
                })
        });
    })*/

})(window.jQuery);
