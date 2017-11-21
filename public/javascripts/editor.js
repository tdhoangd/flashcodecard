
/**
 * CONTROL TOOLBAR
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


