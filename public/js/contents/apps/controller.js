Apps.module('Controller', function (Controller, App, Backbone, Marionette, $, _) {
  Controller.set = Marionette.Controller.extend({
      home : function() {
          var AppsCollection = new Apps.Model.AppsCollection,
              groupId = app.common.getGroupId();
          Apps.main.show(new AppWidgets.Views.loadingMessage({ message: "Getting the application..." }));
          AppsCollection.fetch({
              data: { group_id: groupId },
              dataType: 'json',
              success: function () {
                  Apps.main.show(new Apps.Views.AppsListView({ collection: AppsCollection }));
              }
          });
      }
  });
});
