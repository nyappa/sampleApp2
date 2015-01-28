Apps.module('Model', function (Model, App, Backbone) {
    
    Model.Apps            = Backbone.Model.extend({});
    
    Model.AppsCollection  = Backbone.Collection.extend({
        model: Model.Apps,
        url : '/generate_data.json'
    });
    
    Model.TextDetail = Backbone.Model.extend({
        url : '/text_detail.json'
    });

});
