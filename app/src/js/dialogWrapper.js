import $ from 'jquery';
import 'jquery-ui/ui/widgets/dialog';

import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/dialog.css';

export default function (dialogID, html, options) {
    var def = $.Deferred();
    $(dialogID).html(html).dialog({
        autoOpen: false,
        draggable: false,
        resizable: false,
        modal: true,
        width: 'auto',
        height: 'auto',
        buttons: {
            "Cancel": function () {
                def.reject();
                $(this).dialog('close');
            },
            "OK": function () {
                def.resolve();
                $(this).dialog('close');
            }
        }
    });
    //Enter key event
    $(dialogID).keypress(function (e) {
        if (e.which == 13) {
            def.resolve();
            $(this).dialog('close');
        }
    });
    if (options != null)
        $(dialogID).dialog('option', options);
    $('.ui-dialog-titlebar').css({ display: 'none' });
    $(dialogID).dialog('open');
    return def.promise();
}