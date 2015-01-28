Apps.module('Views', function (Views, App, Backbone, Marionette, $) {

    Views.AppsView = Marionette.ItemView.extend({
        tagName    : "tr",
        template   : "#app-line-template",
        templateHelpers : {
            "yyyymmdd": function (timestamp) {
                return new XDate(timestamp*1000).toString('yyyy/MM/dd HH:mm:ss');
            }
        },
        events: {
            "click" : "lineClick"
        },
        lineClick : function () {
            var appId = this.$el.find(".js-app-id").attr("data-app-id");
            location.href = "/apps/" + appId;
        }
    });

    Views.AppsListView = Backbone.Marionette.CompositeView.extend({
        childView: this.AppsView,
        childViewContainer: "tbody",
        template: "#app-table-template"
    });

});
