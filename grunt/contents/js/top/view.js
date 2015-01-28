Apps.module('Views', function (Views, App, Backbone, Marionette, $) {

    Views.ModerationLayout = Backbone.Marionette.LayoutView.extend({
        el: ".js-page-layout",
        regions: {
            pageContents: ".js-main"
        }
    });

    Views.TextDetailView = Marionette.ItemView.extend({
        template   : "#text-detail-template",
        initialize: function () {},
        events: {
            "click .js-delete" : "deleteText"
        },
        deleteText : function () {
            this.model.fetch({
                data     : { id: this.model.get("id") },
                method   : "DELETE",
                dataType : "json",
                success  : function () {
                    Apps.router.navigate("/", {trigger:true});
                },
                error    : function () {
                }
            });
            return false;
        }
    });

    Views.AddView = Marionette.ItemView.extend({
        template   : "#text-add-template",
        initialize : function () {},
        events: {
            "click .js-send-id"      : "sendId",
            "click .js-add-eng-text" : "addEngText"
        },
        addEngText: function () {
            var that = this;
            this.collection.fetch({
                data     : {
                    "title" : that.$el.find("input[name=title]").val(),
                    "text"  : that.$el.find("textarea[name=text]").val()
                },
                method   : "POST",
                dataType : "json",
                success  : function () {
                    that.render();
                },
                error    : function () {
                }
            });
        }
    });

    Views.AppView = Marionette.ItemView.extend({
        tagName    : "li",
        template   : "#app-template",
        initialize : function () {},
        events     : {
            "click": "openDetail"
        },
        onShow     : function () {},
        openDetail : function () {
            Apps.router.navigate("detail/"+ this.model.get("id"), {trigger:true});
        }
    });

    Views.AppsListView = Backbone.Marionette.CompositeView.extend({
        childView: this.AppView,
        childViewContainer: "ul",
        template: "#example-template",
        events: {
            "click .js-add-text" : "openAdd"
        },
        openAdd : function() {
            Apps.router.navigate("add", {trigger:true});
            return false;
        }
    });
});
