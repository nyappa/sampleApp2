_.templateSettings = {
    escape      : /\{\{([\s\S]+?)\}\}/g,
    evaluate    : /\{\%-([\s\S]+?)\%\}/g,
    interpolate : /\{=([\s\S]+?)=\}/g,
};

var AppCommon = new Backbone.Marionette.Application();

AppCommon.module('Views', function (Views, App, Backbone, Marionette, $) {

    Views.addInitializer(function () {
        new AppCommon.Views.AjaxSetup();
    });

    Views.AjaxSetup = function() {
        $.ajaxSetup({
            statusCode: {
                401: function() {
                    location.href = "/dashborad";
                }
            }
        });
    };

});

var AppWidgets = new Backbone.Marionette.Application();

AppWidgets.addRegions({
    modal     : '.js-modal',
    main      : '.js-main',
    appSelect : '.js-apps-select'
});

AppWidgets.module('Model', function (Model, App, Backbone) {
    Model.Modal = Backbone.Model.extend({});
    Model.ModalCollection = Backbone.Collection.extend({
        model: this.Modal
    });
    Model.Apps            = Backbone.Model.extend({});
    Model.AppsCollection  = Backbone.Collection.extend({
        model : Model.Apps,
        url   : '/apps.json'
    });
});

AppWidgets.module('Views', function (Views, App, Backbone, Marionette, $) {

    Views.test = Marionette.ItemView.extend({
        initialize : function() { console.log("hoge") }
    });


    Views.cancelConfirmation = Marionette.ItemView.extend({
        el      : ".js-form-cancel-confirmation",
        events  : {
            "click .js-cancel": "confirmationRun"
        },
        initialize : function() {
            this.saveOldText();
        },
        oldText : "",
        confirmationRun :function() {
            var that    = this,
                newText = "";
            this.saveOldText();
            this.$el.find("input,textarea,select").each(function(){
                newText += $(this).val();
            });
            if ( this.oldText !== newText || $(".js-validate-error").length >= 1 ) {
                this.cancelModal();
                return false;
            }
        },
        saveOldText: function () {
            var that = this;
            if ( this.oldText === "" ) {
                this.$el.find("input,textarea,select").each(function(){
                    that.oldText += $(this).val() + "";
                });
            }
        },
        cancelModal: function () {
            var Modal = new AppWidgets.Views.Modal({ collection: new AppWidgets.Model.ModalCollection });
            Modal.set({
                parentView : this,
                template   : "#cancel-confirmation-template",
                callbackOk : this.movePage,
                //URLはクラス名を固定すれば良い話だが分かり辛いので外から指定するようにしようか
                extras     : { "moveUrl": this.$el.find(".js-cancel").attr("href") }
            });
            AppWidgets.modal.show(Modal);
            Modal.modalSizeSet();
        },
        movePage: function (modal, extras) {
            location.href = extras.moveUrl;
        }
    });

    Views.FlashMessage = Marionette.ItemView.extend({
        el         : ".js-flash-message-data",
        initialize : function() {
            var dataStatus = this.$el.attr("data-status"),
                message    = this.$el.attr("data-message");
            if ( dataStatus && message ) {
                app.common.showMessage(dataStatus, message);
            }
        }
    });

    Views.SubmitButton = Marionette.ItemView.extend({
        el: "input[type=submit]",
        events: {
            "mousedown": "disabled"
        },
        disabled: function() {
            this.$el.attr("disabled","disabled");
            this.$el.parents("form").submit();
        }
    });

    Views.App = Marionette.ItemView.extend({
        tagName  : "li",
        template : "#app-options-template"
    });

    Views.AppsSelect = Backbone.Marionette.CompositeView.extend({
        childView : this.App,
        childViewContainer : "ul",
        template : "#app-select-template",
        events : {
            "click .js-select-all" : "toggleSelector"
        },
        toggleSelector : function () {
            this.$el.find("ul").toggle();
        },
        onShow : function () {
            var selectApp = this._getSelectApp();
            if ( selectApp ) {
                this.$el.find(".js-select-all").text(this._substrText(selectApp.get("name"), 12));
            }
            this.$el.parents(".js-apps-select").css({ visibility: "visible" });
            if ( this.$el.find("ul li").length < 5 ) {
                this.$el.find("ul").css("overflow-y", "hidden");
            }
        },
        _substrText: function(text, length) {
            if ( text.length > length) {
                return text.substr(0, length) + "..";
            }
            return text;
        },
        _getSelectApp: function () {
            var appId = app.common.getAppId();
            return this.collection.find(function(item){
                if ( item.get('id')*1 === appId*1 ) {
                    return item;
                };
            });
        }
    });

    Views.InsideModal = Marionette.ItemView.extend({
        tagName  : "div",
        template : "#inside-modal-template"
    });

    Views.Modal = Backbone.Marionette.CompositeView.extend({
        tagName   : "div",
        className : "ui-modals-common",
        childView : this.InsideModal,
        childViewContainer : ".js-modal-contents",
        template : "#modal-template",
        events   : {
            "click .js-modal-cancel" : "cancel",
            "click .js-modal-ok"     : "ok",
            "ajax:beforeSend form"   : "beforeSend",
            "ajax:success form"      : "success",
            "ajax:error form"        : "error"
        },
        beforeSend : function () {
            this.$el.find("input").blur();
            this.callbackBeforeSend(this);
            this._modalLoading();
        },
        success : function (ajax, data) {
            this.callbackSuccess(data, this);
        },
        error : function (data, xhr) {
            this.$el.find(".js-ui-loading-overlay").hide();
            this.callbackError(this, xhr);
        },
        cancel : function () {
            this.close();
            return false;
        },
        ok : function () {
            if ( this.callbackOk ) {
                this.callbackOk(this, this.extras);
            }
            this._modalLoading();
        },
        parentView      : {},
        callbackSuccess : {},
        callbackOk      : {},
        callbackOnShow  : {},
        callbackError   : {},
        callbackBeforeSend: {},
        width  : "410px",
        extras : {},
        set : function (options) {
            this.collection.add({ enabled: "1" });
            this.childView.prototype.template = options.template;
            this.callbackSuccess    = options.callbackSuccess;
            this.callbackError      = options.callbackError;
            this.callbackBeforeSend = options.callbackBeforeSend;
            this.callbackOk         = options.callbackOk;
            this.callbackOnShow     = options.callbackOnShow;
            this.width              = options.width;
            this.extras             = options.extras;
        },
        onShow : function(){
            var that = this;
            this.modalSizeSet();
            if (this.callbackOnShow) {
                this.callbackOnShow(this);
            }
            window.onresize = function(){
                that.modalSizeSet();
            };
        },
        modalSizeSet : function() {
            var $modal = this.$el.find(".js-ui-modals"),
                maxTop = Math.floor($("#header").height()*1) + 50,
                left, top;

            this.$el.find(".js-ui-modals").css("width", this.width);

            //上記でサイズ変更しているのでその後にサイズを取る
            left = Math.floor(($(window).width() - $modal.width()) / 2);
            top  = Math.floor(($(window).height() - $modal.height()) / 2) - 100;

            //モーダルが大きくなりすぎる場合の対処
            if ( ($(window).height()-maxTop) < $modal.height() ) {
                $modal.find(".modal-body").css({
                    "height"        : $(window).height() - 200,
                    "overflow-y"    : "scroll",
                    "margin-bottom" : "0px"
                });
                $modal.find("h3").css("margin-bottom","0px");
            }

            this.$el.find(".js-ui-modals-overlay").css({
                height : $(window).height()
            }).fadeIn();
            $modal.css({
                top  : maxTop > top ? maxTop : top,
                left : left
            }).fadeIn();
        },
        _modalLoading: function() {
            this.$el.find(".js-ui-loading-overlay").css({
                height: this.$el.find(".js-modal-contents").height()
            });
            this.$el.find(".js-modal-loading-message").css({
                "margin-top": this.$el.find(".js-modal-contents").height()/2
            });
            this.$el.find(".js-ui-loading-overlay").fadeToggle();
            this.$el.find(".js-ui-loading-overlay").css({ display:"table-cell" });
        },
        close: function() {
            this.$el.unbind();
            this.$el.remove();
        }
    });

    Views.loadingMessage = Marionette.ItemView.extend({
        tagName    : "div",
        className  : "js-loading-message loading-message",
        template   : "#loading-template",
        initialize : function(options) {
            this._message = options.message;
        },
        _message: "",
        onShow: function() {
            this._setMessage(this._message);
        },
        _setMessage : function(message) {
            this.$el.find(".js-message").text(message);
        }
    });

    Views.addInitializer(function () {
          var AppsCollection = new AppWidgets.Model.AppsCollection({}),
              groupId        = app.common.getGroupId();
          AppWidgets.appSelect.show(new AppWidgets.Views.loadingMessage({ message:"Getting the apps..." }));
          AppsCollection.fetch({
              data: { group_id: groupId },
              dataType: 'json',
              success: function () {
                  AppsCollection.comparator = function (model) {
                      return - model.get("created_at");
                  };
                  AppsCollection.sort();
                  AppWidgets.appSelect.show(new AppWidgets.Views.AppsSelect({ collection: AppsCollection }));
              }
          });
          new AppWidgets.Views.FlashMessage();
          new AppWidgets.Views.SubmitButton();
    });

});
