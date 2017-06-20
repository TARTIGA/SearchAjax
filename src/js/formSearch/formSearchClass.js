'use strict';

function windowWidth() {
    var windW = window.innerWidth;
    return function() {
        return windW;
    }

};


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 
/**
 * Main class for SearchInput Form
 * 
 * @class Form
 */
var FormSearch = function FormSearch(form) {
    _classCallCheck(this, FormSearch);

    //VARIABLES
    this.form = form;
    this.resizable = $(form).data('resizable');
    //----------------
    this.formName = $(form).data('formname'); // test
    this.bDel = false;
    this.btnSearch = false;
    this.bHeaderDel = false;
    this.headerSrchField = false;
    this.searchListClosed = true;
    this.btnMagnifier = false;
    this.inputClosed = true;
    this.onSearch = false;
    //Objects variables
    // Highter Root
    this.oFormRoot = $(form).parent().parent();
    this.oHeaderInputWrapper = $(this.oFormRoot).find('.input_wrapper');
    this.oPreloader = $(this.oFormRoot).find('.search_info');
    this.oBtnMagnifier = $(this.oFormRoot).find(".icon-ico_search");
    this.oSearchCtrl = $(this.oFormRoot).find('.search_ctrl');
    this.oHeaderDelete = $(this.oFormRoot).find('.icon-ico_delete');
    // Form Elemets
    this.oHeaderInputWrapperField = $(form).find('input');
    this.oFormRootList = $(form).find('.search_list');
    this.oBtnSearch = $(form).find('.btn_search');
    /// end variables

    //var resizable = this.resizable;
    this.searchInput = {
        START_WIDTH: 80, //CONST

        getWidth: function() {
            // Responsive style ↓↓↓
            var windW = windowWidth()();
            var iWidth = windW / 3.2;


            switch (true) {
                case (windW >= 1400):
                    iWidth = 600;
                    break;
                case (windW >= 1200):
                    iWidth = 590;
                    break;
                case (windW >= 1100):
                    iWidth = 460;
                    break;
                case (windW >= 1000):
                    iWidth = 460;
                    break;
                case (windW >= 960):
                    iWidth = 300;
                    break;

                case (windW >= 760):
                    iWidth = 300;
                    break;
                case (windW >= 480):
                    iWidth = 300;
                    break;
            }

            if (this.resizable) {
                iWidth = windW / 3.2;
            }
            return iWidth;


        }



    };
}; /////////////////////////////////////////////////END CLASS