// ===================== INITIATE WIZARD FORM ============================
window.formWizard1 = function() {
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

window.formWizard2 = function() {
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
