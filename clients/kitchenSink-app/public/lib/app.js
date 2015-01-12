angular.module('KitchenSink', [])
    .controller('MainCtrl', [
        '$scope',
        function($scope){
            $scope.test = 'Hello world!';
        }]);