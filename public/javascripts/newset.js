// import { setTimeout } from "timers";

/**
 * remove create new set/flashcard box
 */
jQuery('#cancel-create-set').on('click', function() {
    jQuery('#div-create-set').addClass("hidden");
});

jQuery('#cancel-create-flashcard').on('click', function() {
    jQuery('#div-create-flashcard').addClass("hidden");
})


/**
 * open create new set box
 */
jQuery('#id-tab-create-set').on('click', function() {
    var x = jQuery('#div-create-set');
    if (x.hasClass("hidden")) {
        x.removeClass("hidden");
    } else {
        x.addClass("hidden");
    }
});

/**
 * open create new flash card
 */
jQuery('#id-tab-create-flashcard').on('click', function() {
    var x = jQuery('#div-create-flashcard');
    if (x.hasClass("hidden")) {
        x.removeClass("hidden");
    } else {
        x.addClass("hidden");
    }
});


jQuery('#btn-new-set').on('click', function () {
    var strTitle = document.getElementById('new-set-title').value;
    var strDescription = document.getElementById('new-set-discription').value;
    if (strTitle && strTitle.length > 3) {

        jQuery.ajax({
            type: 'POST',
            url: '/create-new-set',
            data: {
                'title': strTitle,
                'discription': strDescription
            },
            success: function (objectData, textStatus) {
                console.log(JSON.stringify(objectData));                                
                
            },
            error: function(xhr, status, error) {
                console.log(xhr.error);
            }
        });
    }

});

/**
 * display all sets
 */
jQuery('#id-list-set').on('click', function() {
    
    // id-text-selected
    jQuery.ajax({
        type: 'GET',
        url: '/list',
        success: function(objectData, textStatus, jqXHR) {
            functionDisplayList(objectData);
        }
    });

});

/**
 * handle click on button start new quiz
 */
jQuery('#id-btn-quiz').on('click', function(){

});

/**
 * handle click on button view (list all flashcards of current selected set)
 */
jQuery('#id-btn-view').on('click', function() {

});

/**
 * update and display list of all sets
 */
function functionDisplayList(objectData) {
    // console.log(JSON.stringify(objectData));  
    jQuery('#idDivContainerList').removeClass("hidden");        

    jQuery('#idBodyList')
        .empty()
        .each(function() {
            for (var i = 0; i < objectData.length; i++) {
                jQuery(this)
                    .append(functionARow(objectData[i].title, objectData[i].discription, objectData[i].id))
                ;
            }
        })
    ;

    function functionARow(title, discription, id) {
        var strTitle = title;
        if (title.length > 20) {
            strTitle = title.substr(0, 20) + '...';
        }

       return jQuery('<li></li>')
            .append(jQuery('<a></a>')
                .text(strTitle)
                .attr("id", "set" + id));
    }

}

/**
 * update selected set
 */
jQuery('#idBodyList').on('click', 'li > a', function(){

    var out = jQuery("#" + this.id).text();
    jQuery('#idSelectedSet').empty()
        .text(out).attr('data', this.id)
    ;

    jQuery('#idDivContainerList').addClass("hidden");
    
});

/**
 * CONTROL TOOLBAR
 */
// var box = document.getElementById('displayBox');

// document.getElementById('bold').addEventListener('click', function (e) {
//     box.focus(); // make it the active element so the command is applied to it
//     document.execCommand('bold', false, null);
// });