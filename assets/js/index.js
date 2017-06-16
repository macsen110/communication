;(function (module) {
    module = module || {}; 
    module.exports = {
        init() {
            
            
        },
        testNotice() {
            Notification.requestPermission(function(permission){
                console.log(permission)
                var config = {
                              body:'Thanks for clicking that button. Hope you liked.',
                              icon:'https://cdn2.iconfinder.com/data/icons/ios-7-style-metro-ui-icons/512/MetroUI_HTML5.png',
                              dir:'auto' 
                              };
                var notification = new Notification("Here I am!",config);
            });
        }
    }

    module.exports.init()
} (window.module))
