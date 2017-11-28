
/**
 *  TOOLBAR
 */

jQuery('#idToolbar').on('click', 'button', function() {
    var strCmd = jQuery('#' + this.id).val();
    document.execCommand(strCmd, null, null);
});

jQuery('#idInsertCodeFront').on('click', function() {
    jQuery('<br><pre><code><br><br></code></pre><br>').appendTo('#idEditBoxFrontCard');
});

jQuery('#idInsertCodeBack').on('click', function() {
    jQuery('<br><pre><code><br><br></code></pre><br>').appendTo('#idEditBoxBackCard');
});

jQuery('#idFlashcardsContainer').on('click', 'div.grp-toolbar button', function() {
    var strCmd = jQuery(this).val();
    var fcContainer = jQuery(this).closest('.fc-container');

    switch(strCmd) {
        case 'codeBlockFront': 
            jQuery('<br><pre><code><br><br></code></pre><br>').appendTo(fcContainer.find('div.fc-front'));
            break;
        case 'codeBlockBack':
            jQuery('<br><pre><code><br><br></code></pre><br>').appendTo(fcContainer.find('div.fc-back'));
            break;
        default: 
            document.execCommand(strCmd, null, null);
            break;
    }
});
