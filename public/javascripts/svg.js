(function($){

    var defaults = {

        class: "no-scale"

    }

    var methods = {

        //---Init method
        init: function(){

            //---Conform the settings
            var settings = $.extend({}, defaults);

            return this.each(function(index){

                //---Get the SVG
                var svg = $(this);

                //---Get the viewBox (svgRect)
                var viewBox = (svg[0].viewBox == undefined) ? false : svg[0].viewBox.animVal;

                //---Store the data
                svg.data({"viewBox": viewBox, settings: settings});

                //---Call to private function of resize elements
                private.updateSizes(svg);

            });

        },

        refresh: function(){

            return this.each(function(index){

                //---Get the SVG
                var svg = $(this);

                //---Call to private function of resize elements
                private.updateSizes(svg);

            });

        }

    };

    var private = {

       updateSizes: function(svg){

           //---Get the viewBox (svgRect)
           var viewBox = svg.data("viewBox");

           if(!viewBox) return;

           //---Get the settings
           var settings = svg.data("settings");

           //---Global scale
           var scalew = Math.round((svg.width() / viewBox.width) * 100) / 100;
           var scaleh = Math.round((svg.height() / viewBox.height) * 100) / 100;

           //---Get the resized elements
           var noScaleElements = svg.find("." + settings.class);

           noScaleElements.each(function(){

               var el = $(this);

               //---Set variables
               var sw = el.width();
               var sh = el.height();
               var sx = Math.round((1 / scalew) * 100) / 100;
               var sy = Math.round((1 / scaleh) * 100) / 100;
               var tx = Number( el.attr("x") ) * (1 - sx) + ((sw - sw * sx) / 2) * sx;
               var ty = Number( el.attr("y") ) * (1 - sy) + ((sh * sy - sh) / 2) * sy;

               var matrix = "matrix(" + sx + ",0,0," + sy + "," + tx + "," + ty + ")";

               console.log(scaleh);

               $(this).attr("transform",  "scale(1,1.8)");
               $(this).attr('font-size', (16/scalew))
               console.log($(this).attr('font-size'))

           });

       }

    };

    $.fn.noScaleSVGElements = function(method){

        // Method calling logic
        if (methods[method] ) {

            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));

        } else if ( typeof method === 'object' || ! method ) {

            return methods.init.apply( this, arguments );

        } else {

            $.error( 'Method ' +  method + ' does not exist on jQuery.noScaleSVGElements' );

        }

    }

})(jQuery);