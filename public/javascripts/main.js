var client = {
    sets: [],
    selectedSetTitle: null,
    selectedSetId: null,
    flashcards: [],
    quizStatus: {
        'side': null,
        'cardNo': 0
    }
};

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
        functionVisible('idBoxCreateSet');
        // x.removeClass("hidden");
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
        functionVisible('idBoxCreateFlashcard');
        // x.removeClass("hidden");
        jQuery('#idEditBoxFrontCard').empty();
        jQuery('#idEditBoxBackCard').empty();
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
                functionListSets(objectData);
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
            functionListSets(objectData);
        }
    });

});

/**
 * update selected set
 */
jQuery('#idListSet').on('click', 'li > a', function () {

    var out = jQuery("#" + this.id).text();
    client.selectedSetTitle = out;
    client.selectedSetId = this.id;
    jQuery('#idSelectedSet').empty()
        .text(out).attr('data-setid', this.id);

    jQuery('#idDivContainerList').addClass("hidden");

});

/**
 * create new flashcard
 */
jQuery('#idSubmitNewFlashcard').on('click', function () {

    var strSetId = jQuery('#idSelectedSet').attr('data-setid');

    if (!strSetId || strSetId.length < 1) {
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
            'strSetId': strSetId,
            'htmlFrontcard': htmlFront,
            'htmlBackcard': htmlBack
        },
        success: function (objectData, textStatus) {
            // TODO handle on create flashcard successfull
            // console.log(JSON.stringify(objectData));
            console.log(objectData);
            alert('successfully added new card');
            jQuery('#idEditBoxFrontCard').empty();
            jQuery('#idEditBoxBackCard').empty();
        },
        error: function (xhr, status, error) {
            // TODO handle on error respond   TODO add toast
            console.log(status);
            console.log(xhr);
            alert('get error when added new card');
        }
    });

});


/**
 * handle click on button view (list all flashcards of current selected set)
 */
jQuery('#idBtnView').on('click', function () {
    client.flashcards = [];

    var strSetId = jQuery('#idSelectedSet').attr('data-setid');

    if (!strSetId || strSetId.length < 1) {
        alert('select a set first');
        return;
    }

    jQuery.ajax({
        type: 'GET',
        url: '/getfc?strSetId=' + strSetId,
        success: function (objectData) {
            functionListFlashcards(objectData);
        }
    });
});

/**
 * handle click on button start new quiz
 */
jQuery('#idBtnQuiz').on('click', function () {
    //  TODO
    client.flashcards = [];
    var strSetId = jQuery('#idSelectedSet').attr('data-setid');
    
    if (!strSetId || strSetId.length < 1) {
        alert('select a set first');
        return;
    }

    jQuery.ajax({
        type: 'GET',
        url: '/getfc?strSetId=' + strSetId,
        success: function (objectData) {
            // TODO start quiz
            functionInitQuiz(objectData);
            console.log(JSON.stringify(objectData));
        }
    });
});


/******************************
 ******* EDIT FLASHCARD *******
 */

// turn on editable/deletable
jQuery('#idEditGroup').on('click', 'button', function () {
    var strEditType = jQuery(this).attr('data');

    // TOD add done 
    // turn off editable/deletable
    if (strEditType !== "editable") {
        jQuery(this).prop('disabled', true);
        jQuery('#idEditGroup button:nth-child(1)').prop('disabled', false);
        jQuery('.tips').remove();
        jQuery('#idBodyListFlashcards > div').each(function () {
            jQuery(this).children('div:first-child')
                .addClass('hidden')
                .empty();
            jQuery(this).children('div.panel-footer').remove();
        });
        return;
    }

    // turn on editable/deletable
    jQuery(this).prop('disabled', true);
    jQuery('#idEditGroup button:nth-child(2)').prop('disabled', false);

    if (client.flashcards.length > 0) {
        jQuery('#idBodyListFlashcards')
            .prepend(jQuery('<div class="tips" style="text-align: center;"><i>Tip: double click on remove button to remove</i></div>'))
    }

    jQuery('#idBodyListFlashcards > div').each(function () {
        var grpBtn = jQuery('<div style="display: inline-block;" class="grp-edit"></div>');
        grpBtn
            .append('<button type="button" class="btn btn-default"><span data="edit" class="blue-text glyphicon glyphicon-pencil"></span></button>')
            .append('<button type="button" class="btn btn-default"><span data="remove" class="red-text glyphicon glyphicon-remove"></span></button>');

        jQuery(this).children('div:first-child')
            .removeClass('hidden')
            .empty()
            .append(grpBtn);
    });
});

// edit card
jQuery('#idBodyListFlashcards').on('click', 'div.grp-edit button:nth-child(1)', function () {
    var fcContainer = jQuery(this).closest('.fc-container');
    functionOnOffEdittable(fcContainer, true);
});


// edit card --> click update button
jQuery('#idBodyListFlashcards').on('click', 'div.grp-submit div:nth-child(1) button', function () {
    var fcContainer = jQuery(this).closest('.fc-container');

    var strFcId = fcContainer.attr('data-cardid');
    var strSetId = jQuery('#idSelectedSet').attr('data-setid');
    var htmlFrontcard = fcContainer.find('.fc-front').html();
    var htmlBackcard = fcContainer.find('.fc-back').html();

    jQuery.ajax({
        type: 'POST',
        url: '/updatefc',
        data: {
            'htmlFrontcard': htmlFrontcard,
            'htmlBackcard': htmlBackcard,
            'strFcId': strFcId,
            'strSetId': strSetId
        },
        success: function (objectData) {
            functionOnOffEdittable(fcContainer, false);
        }
    });


});

// turn on/off editable of a card
function functionOnOffEdittable(fcContainer, isOn) {
    if (isOn) {
        // disabled edit/pencil button    
        fcContainer.find('.grp-edit button:nth-child(1)').prop('disabled', true);    

        fcContainer
            .append(jQuery('<div class="panel-footer"></div>')
                .append(jQuery('<div class="grp-submit row" ></div>')
                    .append('<div class="col-xs-6"><button type="button" class="btn btn-default btn-block">Update</button></div>')
                    .append('<div class="col-xs-6"><button type="button" class="btn btn-default btn-block">Cancel</button></div>')));

        fcContainer.find('.fc-front, .fc-back').each(function () {
            jQuery(this).addClass('editbox').attr('contenteditable', 'true');
        });

        fcContainer.find('.panel-heading').append(functionHTMLToolbar());
    } else {
        fcContainer.find('.grp-edit button:nth-child(1)').prop('disabled', false);    
        fcContainer.find('.panel-footer').remove();
        fcContainer.find('.grp-toolbar').remove();
        fcContainer.find('.fc-front').removeClass('editbox').attr('contenteditable', 'false');;
        fcContainer.find('.fc-back').removeClass('editbox').attr('contenteditable', 'false');
    }
    return;
}

// edit card --> click cancel button
jQuery('#idBodyListFlashcards').on('click', 'div.grp-submit div:nth-child(2) button', function () {
    var fcContainer = jQuery(this).closest('.fc-container');
    functionOnOffEdittable(fcContainer, false);
});

// remove card
jQuery('#idBodyListFlashcards').on('dblclick', 'div.grp-edit button:nth-child(2)', function () {
    var fcContainer = jQuery(this).closest('.fc-container'); 
    var strFcId = fcContainer.attr('data-cardid');

    jQuery.ajax({
        type: 'GET',
        url: '/removefc?strSetId=' + client.selectedSetId + '&strFcId=' + strFcId,
        success: function(objectData) {
            console.log(objectData);
            fcContainer.remove();
        }, 
        error: function (xhr, status, error) {
            console.log(xhr);       
            alert('Unable to remove card now. Try again later');
        }
    });
});

/******************************
 ************ QUIZ ************
 */

function functionInitQuiz(objectData) {    
    jQuery('#idQuizContainer').removeClass('hidden'); 
    var btnFlip = jQuery('#idQuizFlip');
    var btnNext = jQuery('#idQuizNext');
    var progress = jQuery('#idProgress');
    var displayScreen = jQuery('#idQuizScreen');

    // init
    client.flashcards = functionShuffle(objectData);
    client.quizStatus.side = 'front';
    client.quizStatus.cardNo = 0;
    
    btnFlip.prop('disabled', false);
    btnNext.val('next').html('Next');
    progress.html('');

    // no cards
    if (objectData.length < 1) {
        btnFlip.prop('disabled', true);
        btnNext.val('done').html('Done');
        displayScreen.empty().html('There is no card in selected set!');
        return;
    }

    // # cards > 0
    functionQuizDisplay(0, 'front');

}

function functionQuizDisplay(cardNo, side) {
    var btnFlip = jQuery('#idQuizFlip');
    var btnNext = jQuery('#idQuizNext');
    var progress = jQuery('#idProgress');
    var screen = jQuery('#idQuizScreen').empty();
    
    if (cardNo >= client.flashcards.length) {
        window.location.replace('/main');        
        return;
    }

    client.quizStatus.side = side;
    client.quizStatus.cardNo = cardNo; 
    if (side === 'back') {
        screen.html(client.flashcards[cardNo].backcard);
    } else {
        screen.html(client.flashcards[cardNo].frontcard);
    }
    
    var num = cardNo + 1; 
    var strProgress = side + '  ' +  num + '/' + client.flashcards.length;
    progress.empty().html(strProgress);

    if (cardNo === client.flashcards.length - 1) {
        btnNext.val('done').html('Done');        
    }
}

jQuery('#idQuizNext').on('click', function() {
    var strVal = jQuery(this).val();

    if (strVal === 'done') {
        jQuery('#idQuizContainer').addClass('hidden');         
        window.location.replace('/main');        
        return;
    }

    functionQuizDisplay(client.quizStatus.cardNo + 1, 'front');
});

jQuery('#idQuizFlip').on('click', function() {
    if (client.quizStatus.side === 'front') {
        functionQuizDisplay(client.quizStatus.cardNo, 'back');
    } else {
        functionQuizDisplay(client.quizStatus.cardNo, 'front');        
    }
});









/***************************
 ******* FUNCTIONS  *********
 */

function functionHiddenAll() {
    jQuery('#idDivContainerList').addClass('hidden');
    jQuery('#idBoxCreateSet').addClass('hidden');
    jQuery('#idBoxCreateFlashcard').addClass('hidden');
    jQuery('#idFlashcardsContainer').addClass('hidden');
    // jQuery('#').addClass('hidden');
    // jQuery('#').addClass('hidden');
    // jQuery('#').addClass('hidden');
    // jQuery('#').addClass('hidden');
}

function functionVisible() {
    functionHiddenAll();
    for (var i = 0; i < arguments.length; i++) {
        jQuery('#' + arguments[i]).removeClass('hidden');
    }
}

/**
 * update and display list of all sets
 */
function functionListSets(objectData) {
    // console.log(JSON.stringify(objectData));  
    jQuery('#idDivContainerList').removeClass("hidden");

    jQuery('#idListSet')
        .empty()
        .each(function () {
            for (var i = 0; i < objectData.length; i++) {
                jQuery(this)
                    .append(functionARow(objectData[i].title, objectData[i].discription, objectData[i].id));
            }
        });

    function functionARow(title, discription, id) {
        var strTitle = title;

        return jQuery('<li></li>')
            .append(jQuery('<a></a>')
                .text(strTitle)
                .attr("id", id));
    }
}

/**
 * display all flashcards of a set
 */
function functionListFlashcards(objectData) {
    client.flashcards = objectData;
    functionVisible('idFlashcardsContainer');
    jQuery('#idEditGroup button:nth-child(1)').prop('disabled', false);
    jQuery('#idEditGroup button:nth-child(2)').prop('disabled', true);

    if (objectData.length === 0) {
        jQuery('#idBodyListFlashcards')
            .empty()
            .append('<div style="text-align: center; font-style: italic;">no entry found</div>');
        return;
    }

    jQuery('#idBodyListFlashcards')
        .empty()
        .each(function () {
            for (var i = 0; i < objectData.length; i++) {
                jQuery(this)
                    .append(functionNewCardHTML(objectData[i].id, objectData[i].frontcard, objectData[i].backcard));
            }
        });

    function functionNewCardHTML(id, front, back) {
        var outter = jQuery('<div class="panel panel-default fc-container"></div>').attr('data-cardid', id);
        var htmlFront = jQuery('<div class="col-md-6 fc-front"></div>').html(front);
        var htmlBack = jQuery('<div class="col-md-6 fc-back"></div>').html(back);
        var innerHead = jQuery('<div class="panel-heading hidden"></div>');
        var innerBody = jQuery('<div class="panel-body"></div>');
        var row = jQuery('<div class="row grp-card"></div>');

        return outter
            .append(innerHead)
            .append(innerBody.append(row.append(htmlFront).append(htmlBack)));
    }
}

function functionHTMLToolbar() {
    var innerOne = jQuery('<div class="grp-toolbar btn-group" role="group"></div>');
    innerOne
        .append(jQuery('<button type="button" class="btn btn-default" value="bold"></div>')
            .append('<span class="glyphicon glyphicon-bold"></span>'))
        .append(jQuery('<button type="button" class="btn btn-default" value="italic"></div>')
            .append('<span class="glyphicon glyphicon-italic"></span>'))
        .append(jQuery('<button type="button" class="btn btn-default" value="underline"></div>')
            .append('<span><strong>U</strong></span>'))
        .append(jQuery('<button type="button" class="btn btn-default" value="indent"></div>')
            .append('<span class="glyphicon glyphicon-indent-left"></span>'))
        .append(jQuery('<button type="button" class="btn btn-default" value="codeBlockFront"></div>')
            .append('<span class="glyphicon glyphicon-console">front</span>'))
        .append(jQuery('<button type="button" class="btn btn-default" value="codeBlockBack"></div>')
            .append('<span class="glyphicon glyphicon-console">back</span>'))
        ;

    return innerOne;
}

function functionShuffle(arr) {
    var j, temp; 
    for (var i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * i);
        temp = arr[i]; 
        arr[i] = arr[j];
        arr[j] = temp; 
    }
    return arr;
}