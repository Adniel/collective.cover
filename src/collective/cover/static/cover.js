
(function ($) {
    $.fn.liveSortable = function (opts) {
        this.live("mouseover", function() {
            if (!$(this).data("init")) {
                $(this).data("init", true).sortable(opts);
            }
        });
        return $();
    };
}(jQuery));

//XXX stupid method and stupid way of coding... XXXXXXX 
function removeObjFromTile() {
    $(".tile-remove-item").remove()
    $(".sortable-tile").each(function() {
        var child = $(this).children('*[data-uid]');
        child.append("<i class='tile-remove-item'><span class='text'>remove</span></i>");
    });
    $(".tile-remove-item").unbind("click");
    $(".tile-remove-item").click(function(e) {
        e.preventDefault();
        var obj = $(this).parent();
        uid = obj.attr("data-uid");
        var tile = obj.parents('.tile');

        tile.find('.loading-mask').addClass('show remove-tile');
        var tile_type = tile.attr("data-tile-type");
        var tile_id = tile.attr("id");
        $.ajax({
             url: "@@removeitemfromlisttile",
             data: {'tile-type': tile_type, 'tile-id': tile_id, 'uid': uid},
             success: function(info) {
                 tile.html(info);
                 TitleMarkupSetup();
                 tile.find('.loading-mask').removeClass('show remove-tile');
                 return false;
             }
         });
    });
}

function TitleMarkupSetup(){
    $('.tile').each(function(){
        if ($(this).find('.loading-mask')[0] === undefined) {
            $(this).append('<div class="loading-mask"/>');
        }
    });
    removeObjFromTile();
}

$(document).ready(function() {

    $(".sortable-tile").liveSortable({
        stop:function(event, ui) {
            var uids = [];
            $(this).children().each(function(index) {
                if ($(this).attr("data-uid") !== undefined) {
                    uids.push($(this).attr("data-uid"));
                }
            });
            var tile = $(this).closest('.tile');
            var tile_type = tile.attr("data-tile-type");
            var tile_id = tile.attr("id");
            $.ajax({
                 url: "@@updatelisttilecontent",
                 data: {'tile-type': tile_type, 'tile-id': tile_id, 'uids': uids},
                 success: function(info) {
                     tile.html(info);
                     TitleMarkupSetup();
                     return false;
                 }
             });
        }
    });

    TitleMarkupSetup();

    $('a.edit-tile-link, a.config-tile-link').prepOverlay({
        subtype: 'ajax',
        filter: '.tiles-edit',
        formselector: '#edit_tile',
        closeselector: 'name=buttons.cancel',
        noform: 'close',
        beforepost: function(return_value, data_parent){
            // Before post data, populate the textarea (textarea.mce_editable) with the contents of  iframe created by TinyMCE call.
            // TODO: This does not solves, if we have more of a textarea widget in tiles. What's the solution?
            var iframes = jQuery('#edit_tile iframe');
            var mcs = {};
            
            iframes.each(function(index) {
                var iframe = $(this);
                var idFrame = iframe.attr('id');
                var idFrameLen = idFrame.length;
                
                if(idFrameLen > 4 && idFrame.slice(idFrameLen-4, idFrameLen) == "_ifr") {
                  mcs[idFrame.slice(0,-4)] = iframe;
                }   
            });
            
            var newlist = $.map(data_parent, function(value, i) {
                  if (data_parent[i].type == "textarea" && mcs[data_parent[i].name] != undefined) {
                      value.value = mcs[value.name].contents().find('body').html();
                  }
                  return value
              });

        },
        afterpost: function(return_value, data_parent) {
            location.reload();
        },
        config: {
            onLoad: function() {
                $('textarea.mce_editable').each(function() {
                    var config = new TinyMCEConfig($(this).attr('id'));
                    config.init();

                    // Remove unecessary link, use HTML button of editor
                    $('div.suppressVisualEditor').remove()

                });
            },
            onClose: function() { location.reload(); }

        }
    });
});


jQuery(document).ready(function () {

    // the dtd of ckeditor doesnt allow the edit A elements
    CKEDITOR.dtd.$editable['a'] = 1;

    CKEDITOR.on( 'instanceCreated', function( event ) {
      var editor = event.editor,
        element = editor.element;

      // Customize editors for headers and tag list.
      // These editors don't need features like smileys, templates, iframes etc.
      if ( element.is( 'h1', 'h2', 'h3', 'a', 'p' ) || element.getAttribute( 'id' ) == 'taglist' ) {
        // Customize the editor configurations on "configLoaded" event,
        // which is fired after the configuration file loading and
        // execution. This makes it possible to change the
        // configurations before the editor initialization takes place.
        editor.on( 'configLoaded', function() {

          // Remove unnecessary plugins to make the editor simpler.
          editor.config.removePlugins = 'colorbutton,find,flash,font,' +
            'forms,iframe,image,newpage,removeformat,' +
            'smiley,specialchar,stylescombo,templates, about, basicstyles';

          // Rearrange the layout of the toolbar.
          editor.config.toolbarGroups = [
            { name: 'editing',    groups: [ 'basicstyles', 'links' ] },
            { name: 'undo' },
            { name: 'clipboard',  groups: [ 'selection', 'clipboard' ] },
            { name: 'about' }
          ];
        });
      }
    });

    jQuery('body').midgardCreate({
      url: function () {
        return this.getSubjectUri();
      },
      tags: false/*,
      language: 'pt_BR'*/
    });

    // Set a simpler editor for title fields
    jQuery('body').midgardCreate('configureEditor', 'title', 'ckeditorWidget', {
    });
    jQuery('body').midgardCreate('setEditorForProperty', 'default', 'title');

    //jQuery('body').midgardCreate('setEditorForProperty', '#title', 'title');
    //jQuery('body').midgardCreate('setEditorForProperty', '#description', 'title');

    // Disable editing of author fields
    //jQuery('body').midgardCreate('setEditorForProperty', 'dcterms:author', null);

});
Backbone.emulateHTTP = true;
Backbone.emulateJSON = true;