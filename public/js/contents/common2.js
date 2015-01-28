$(function(){
    var count = 0;
    window.setInterval(function(){ 
        count++
            $(".js-seisan-count").text(count);
    }, 1000);
});
