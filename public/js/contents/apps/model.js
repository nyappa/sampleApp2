Apps.module('Model', function (Model, App, Backbone) {
    Model.Apps            = Backbone.Model.extend({});
    Model.AppsCollection  = Backbone.Collection.extend({
        model: Model.Apps,
        url   : '/apps.json'
    });
});
