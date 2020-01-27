var doc = $(document).ready(function() {
    console.log("Script initialized!")

    var app = new Vue({
        el: '#app',
        data: {
            message: 'Hello'
        },
        methods: {
            printMessage: function() {
                console.log(this.message)
            }
        }
    });
});
