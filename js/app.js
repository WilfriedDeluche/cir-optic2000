
LINKED_GUEST_GUESTCATEGORY_ID = "538f3128881b5a0e26000018"

//Mandatory for using angular template inside liquid templates
var module = angular.module('myApp', []).config(function($interpolateProvider){
    $interpolateProvider.startSymbol('[[').endSymbol(']]');
  }
);

var handleError  = function(error){
  linkedGuestError = error.linkedGuest;
  
};

var initAccessPrivileges = function(object) {
  var checkinPoints = [
    {name: "Déjeuner lundi", accesspoint_id: "7890876fffjhgjkljhgjk", active: 0 , web_form: 1},
    {name: "Dîner paquebot", accesspoint_id: "7890876fffjhgjkljhgjk", active: 0, web_form: 1}
  ];
  object.access_privileges_attributes = checkinPoints
}

module.controller("FormController", function($scope, $http) {
  mainCategoryFormAction = angular.element("form").attr("action") + ".json";
  var authenticityToken = angular.element("input[name=authenticity_token]").attr("value");
  $scope.linkedGuests = [];
  $scope.mainGuest = {}
  initAccessPrivileges($scope.mainGuest);

  $scope.addLinkedGuest = function() {
    var linkedGuest = {}
    initAccessPrivileges(linkedGuest);
    $scope.linkedGuests.push(linkedGuest);
  };
  
  $scope.removeLinkedguest = function(rank) {
    $scope.linkedGuests.splice(rank, 1);
  };
  
  $scope.save = function() {
    //2. First save the main guest
    var promise = $http({method: "POST", url: mainCategoryFormAction, data: {guest: $scope.mainGuest, authenticity_token: authenticityToken}})  
    promise.success(function(data, status, headers, config) {
      //2. Then save the linked guests
      async.each($scope.linkedGuests, 
        function(linkedGuest, cbs){
          var pathTokens = mainCategoryFormAction.split("/");
          pathTokens[pathTokens.length - 2] = LINKED_GUEST_GUESTCATEGORY_ID;
          var newPath = pathTokens.join("/");
          var linkedGuestPromise = $http({method: "POST", url: newPath, data: {guest: linkedGuest, authenticity_token: authenticityToken}})  
          linkedGuestPromise.success(function(data, status, headers, config) {
            cbs();
          });
          linkedGuestPromise.error(function(data, status, headers, config) {
            cbs({err:"Error", linkedGuest: linkedGuest, errors: data});
          });
        },
        function(err) {
          if (err) {
            handleError(err);
          }
        }    
      );
      $scope.linkedGuests.forEach(function(linkedGuest) {

      });
    });
    promise.error(function(data, status, headers, config) {
      alert("Erreur, veuillez recommencer svp ...");
    });
  };
});