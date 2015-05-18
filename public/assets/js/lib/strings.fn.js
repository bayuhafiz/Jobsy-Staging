window.getBaseURL = function() {
    var url = document.URL;
    return url.substr(0, url.lastIndexOf('/'));
}

window.nl2br = function(str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

window.replaceDash = function(str) {
    return str.replace(/-/g, ' ');
}

window.capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

window.stripHTML = function(string) {
    var temp = string;
    var $temp = $(temp).find('span,p').contents().unwrap().end().end();
    return $temp;
}
