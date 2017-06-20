//          /////////////////////////////////////////////---MAIN HANDLER---///////////////////////////////////////////////////




/////////////////////
// FORM_HANDLER
/**
 * MAIN HANDLER function
 * 
 * @param {Obj} form 
 */


function formSearchHandler(form) {
    let resizable = form.resizable;
    console.info('INPUT START WIDTH ' + form.searchInput.getWidth());
    form.oSearchCtrl.click(function() {


        if (form.inputClosed) {
            var iCurrentWidth = form.searchInput.getWidth();

            form.oHeaderInputWrapper.show().width(iCurrentWidth);
            form.oHeaderInputWrapperField.show().width(form.searchInput.START_WIDTH).delay(100).animate({
                width: iCurrentWidth
            }, 500).focus();
            form.inputClosed = !form.inputClosed;
        } else { return; }


    });


    /**
     * Resize search width
     * 
     */
    function doSearchResize() {
        oHeaderInputWrapper.offset(getSearchOffset());
        // resizable ? form.oHeaderInputWrapperField.width(form.searchInput.getWidth()) : "";
    };

    // DEL ICON LIKE OBJECT
    // var delIcon = {

    //     delPosOffset: form.oHeaderDelete.offset(),
    //     get position() {

    //     },
    //     set position() {

    //     },
    //     test: function() {

    //     },
    // }

    /**
     * Get/Set position DEL icon
     * 
     * @returns 
     */

    function getDelPosition() {
        //resizable!!!!!!!!!!!! and Button
        var delPosOffset = form.oHeaderDelete.offset();
        // delPosOffset.left = form.searchInput.getWidth() - 40; //30 - const
        if (resizable) {
            delPosOffset.left = form.searchInput.getWidth() - 40;
            delPosOffset.top = 3;
        } else {
            delPosOffset.left = form.searchInput.getWidth() - 70;
        }
        return delPosOffset;
    };

    function setDelPosition() {
        //resizable!!!!!!!!!!!! and Button


        var delPosOffsetNew = form.oHeaderDelete.offset();
        if (resizable) {
            delPosOffsetNew.left = form.searchInput.getWidth() - 40;
        } else {
            delPosOffsetNew.left = form.searchInput.getWidth() - 70;
        }
        // console.info('form.oHeaderDelete.offset().left --' + form.oHeaderDelete.offset().left);
        // console.info('delPosOffset.left --' + form.searchInput.getWidth());
        // console.info('  form.oHeaderDelete.css("left", delPosOffsetNew.left); --' + delPosOffsetNew.left);




        form.oHeaderDelete.css("left", delPosOffsetNew.left);
    };


    /**
     * INIT SEARCH VIEW FUNCTION 
     * 
     */
    function InitSearchView() {
        if (resizable) {
            form.oHeaderInputWrapper.hide();
            form.oHeaderInputWrapper.width(700);
        }
        form.oFormRootList.hide();
        form.oHeaderDelete.hide();
        form.oHeaderDelete.offset(getDelPosition());

    }
    InitSearchView();

    ////////////BUTTON SEARCH
    /////////////////////////////////


    form.oBtnMagnifier.click(function(evt) {
        if (form.inputClosed) {

        } else {

            form.oHeaderInputWrapperField.focus();
        }
        form.btnMagnifier = !form.btnMagnifier;


    });






    ///////////////////////////////////
    // Hover on search field
    form.oFormRoot.hover(
        function() {
            form.onSearch = true;



        },
        function() {
            form.onSearch = false;

        }
    );

    ////////// // BLUR (outclick)
    form.oHeaderInputWrapperField.blur(function(evt) {
        var inputBool = $(evt.target).hasClass("styler");
        // console.info('ITS TRUE&&&? -- ' + inputBool);

        if (form.onSearch) {
            if (form.bHeaderDel) {
                // console.info('DEL Click');
                resizable ? form.oHeaderInputWrapper.hide() : " ";
                form.oHeaderInputWrapperField.val("");
            }

        } else {
            resizable ? form.oHeaderInputWrapper.hide() : "";
            form.oHeaderDelete.hide();
            form.onSearch = false;
            form.inputClosed = true;
            form.oHeaderInputWrapperField.val("");
            form.oFormRootList.slideUp();
            form.oPreloader.fadeOut();
            form.inputClosed = true;

        }
    });

    /////////////////////////////////////////////////////////////////////////
    //////////////////////  REGULAR EXPRESSION functions  /////////////////////
    /////////////////////////////////////////////////////////////////////////

    //REGULAR search text
    // Main REGEX function
    function replaceSearchRegex(value, array) {
        if (value != " ") {
            for (var i = 0; i < array.length; i++) {
                var text = $(array[i]).text();
                var html = $(array[i]).html();
                var fStr = regStrVal(value, text);
                var repStr = replaceStrHTML(fStr, text)
                $(array[i]).html(repStr);

            }
        } else return;

    };

    /**
     * Regex test input value
     * 
     * @param {any} val 
     * @param {any} str 
     * @returns 
     */
    function regStrVal(val, str) {
        var regex = new RegExp(val, 'i');
        var result = str.match(regex);
        return result;
    };

    /**
     * Replace string to styler HTML
     * 
     * @param {any} str 
     * @param {any} html 
     * @returns 
     */
    function replaceStrHTML(str, html) {
        var istr = html.replace(str, '<span class="choose">' + str + '</span>');
        return istr;
    };

    //////////////////////////////////////
    /// AJAX
    ////////////////////////////////////
    /**
     * Main POST Ajax query
     * 
     * @param {any} val 
     * @param {any} array 
     */
    function postAjax(val, array) {
        $.ajax({
            type: 'POST',
            url: "/module/search/ajax.search.php" + '?nocache=' + (new Date().getTime()) + Math.random(), //Path to handler
            cache: false,
            data: {
                'referal': val
            },
            response: 'text',

            beforeSend: function(data) {




            },
            error: function() {
                console.info('POST Error');
            },
            success: function(data) {
                console.info('SUCCESS');

                //NULL
                if (data == 0) {

                } else {
                    form.oPreloader.fadeOut(); //hide preloader
                    form.oFormRootList.html(data).fadeIn(); //Input value to list
                }

            }
        });

    };

    ///////////////HELL MAGIC HERE!////////////////////////////////
    /**
     * WTF function? for AJAX CRAZY
     * 
     * @param {any} val 
     * @param {any} namesArray 
     * @returns 
     */
    function hellMagicAjax(val, namesArray) {
        var AJAXLoaded = true;
        $(document).ajaxComplete(function() {

            var namesArray = $('.elem_name');
            replaceSearchRegex(val, namesArray);
        });

        return function() {
            return AJAXLoaded;
        }
    };
    ///////////////////////////////

    /////////////INPUT KEYUP VALUE 

    form.oHeaderInputWrapper.keyup(function() {
        var val = form.oHeaderInputWrapperField.val().trim();
        var valInput = val.length;
        var namesArray = $('.elem_name');
        if (valInput >= 1) {

            form.oHeaderDelete.delay(500).show();
            postAjax(val, namesArray);
            hellMagicAjax(val, namesArray);
            form.oPreloader.fadeIn(); //show
            if (msieversion()) {
                $("#circleG").width(83);
            }

        } else {
            form.oPreloader.fadeOut(); //hide
            form.oFormRootList.slideUp();

        }

    });


    ///////DELETE mousedown
    form.oHeaderDelete.click(function() {
        form.bDel = true;
        form.oHeaderInputWrapperField.val('');
        form.oHeaderDelete.hide();
        form.oFormRootList.slideUp();
        form.oPreloader.fadeOut();
        form.oHeaderInputWrapperField.focus();




    });
    // Resize Window widt and Blocks


    function resizeBlock(block) {
        block.width(form.searchInput.width).animate({
            width: form.searchInput.getWidth(),
        }, 50);
    }



    $(window).resize(function(evt) {

        resizeBlock(form.oHeaderInputWrapperField);
        resizeBlock(form.oFormRootList);
        resizeBlock(form.oPreloader);
        setDelPosition();
        console.info('Form name === ' + form.formName);
    });



    //////////////////::::::::END SEARCH:::::://///////////////////////


};