// import { setTimeout } from "timers";

/**
 * remove create new set/flashcard box
 */
jQuery('#cancel-create-set').on('click', function () {
    jQuery('#idBoxCreateSet').addClass("hidden");
});

jQuery('#cancel-create-flashcard').on('click', function () {
    jQuery('#idBoxCreateFlashcard').addClass("hidden");
})

/**
 * open create new set box
 */
jQuery('#idTabCreateSet').on('click', function () {
    var x = jQuery('#idBoxCreateSet');
    if (x.hasClass("hidden")) {
        x.removeClass("hidden");
        jQuery('#idNewSetTitle').val('');
        jQuery('#idNewSetDiscription').val('');
    } else {
        x.addClass("hidden");
    }
});

/**
 * open create new flashcard box
 */
jQuery('#idTabCreateFlashcard').on('click', function () {
    var x = jQuery('#idBoxCreateFlashcard');
    if (x.hasClass("hidden")) {
        x.removeClass("hidden");
    } else {
        x.addClass("hidden");
    }
});

/**
 * create new set
 */
jQuery('#idSubmitNewSet').on('click', function () {
    var strTitle = document.getElementById('idNewSetTitle').value;
    var strDescription = document.getElementById('idNewSetDiscription').value;
    if (strTitle && strTitle.length > 3) {

        jQuery.ajax({
            type: 'POST',
            url: '/create-new-set',
            data: {
                'title': strTitle,
                'discription': strDescription
            },
            success: function (objectData, textStatus) {
                jQuery('#idBoxCreateSet').addClass("hidden");
                functionDisplayList(objectData);
            },
            error: function (xhr, status, error) {                
                console.log(xhr);
                console.log(status);
                console.log(error);
                alert('Bad request (- title should be unique, or ');
            }
        });
    }
});

/**
 * display all sets
 */
jQuery('#id-list-set').on('click', function () {

    // id-text-selected
    jQuery.ajax({
        type: 'GET',
        url: '/list',
        success: function (objectData, textStatus, jqXHR) {
            functionDisplayList(objectData);
        }
    });

});


/**
 * update and display list of all sets
 */
function functionDisplayList(objectData) {
    // console.log(JSON.stringify(objectData));  
    jQuery('#idDivContainerList').removeClass("hidden");
    
    jQuery('#idBodyList')
        .empty()
        .each(function () {
            for (var i = 0; i < objectData.length; i++) {
                jQuery(this)
                    .append(functionARow(objectData[i].title, objectData[i].discription, objectData[i].id));
            }
        });

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
jQuery('#idBodyList').on('click', 'li > a', function () {

    var out = jQuery("#" + this.id).text();
    jQuery('#idSelectedSet').empty()
        .text(out).attr('data-id', this.id);

    jQuery('#idDivContainerList').addClass("hidden");

});

/* TODO */

/**
 * create new flashcard
 */
jQuery('#idSubmitNewFlashcard').on('click', function () {

    var strSetID = jQuery('#idSelectedSet').attr('data-id');

    if (!strSetID || strSetID.length < 3) {
        alert('select a set first');
        return;
    }

    // TODO 
    var htmlFront = jQuery('#idEditBoxFrontCard').html();
    var htmlBack = jQuery('#idEditBoxBackCard').html();

    jQuery.ajax({
        type: 'POST',
        url: '/create-new-flashcard',
        data: {
            'strSetID': strSetID,
            'htmlFrontcard': htmlFront,
            'htmlBackcard': htmlBack
        }, 
        success: function(objectData, textStatus) {
            // TODO handle on create flashcard successfull
            // console.log(JSON.stringify(objectData));
            console.log(objectData);
            alert('successfully added new card');

        },
        error: function(xhr, status, error) {
            // TODO handle on error respond   TODO add toast
            console.log(status);
            console.log(xhr);
            alert('get error when added new card');
        }
    });

    jQuery('#result').text(htmlFront);
    
});


/**
 * handle click on button view (list all flashcards of current selected set)
 */
jQuery('#idBtnView').on('click', function () {
    var strSetID = jQuery('#idSelectedSet').attr('data-id');
    
    if (!strSetID || strSetID.length < 3) {
        alert('select a set first');
        return;
    }    

    jQuery.ajax({
        type: 'GET',
        url: '/viewset?strSetID=' + strSetID,
        success: function(objectData) {
            console.log(JSON.stringify(objectData));
            
        },
        error: function(xhr, status, error) {

        }
    });
});

/**
 * handle click on button start new quiz
 */
jQuery('#idBtnQuiz').on('click', function () {
    //  TODO
});