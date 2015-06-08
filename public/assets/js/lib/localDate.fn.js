// Date formatter function
window.localDate = function(date) {
    var result = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    return result;
};
