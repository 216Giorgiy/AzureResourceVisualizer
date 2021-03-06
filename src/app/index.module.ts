/// <reference path="../../typings/tsd.d.ts" />

/// <reference path="index.route.ts" />
/// <reference path="main/main.controller.ts" />
/// <reference path="templateParameterEditor/templateParameterEditor.controller.ts" />
/// <reference path="openExistingTemplateDialog/OpenDialog.controller.ts" />

module ArmViz.Module {
  var module = angular.module('ArmViz', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngResource', 'ui.router', 'ui.bootstrap']);
  
  export function start() {
    module
      .config(ArmViz.RouterConfig)
      
      //These names much match apparently
      .controller('MainCtrl', ArmViz.MainCtrl)
      
      .controller('OpenDialogController', OpenDialog.Controller)
      .controller('QuickstartLoadDialog', ArmViz.QuickstartLoadDialog)
      .controller('TemplateParameterManager', TemplateParameterEditor.Controller)
      .controller('OpenDialogController', OpenDialog.Controller)
      .controller('ResourceEditorController', ArmViz.ResourceEditorController)
      
      .directive('ngFileSelect', Directives.ngFileSelect)
      ; //this is intentional :-)
  } 
}