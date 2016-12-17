/**
 * Created by derekxiao on 2016/12/3.
 */
var storyline;
var init = function () {
    storyline = new StreamingStoryline("#streaming-storyline", {
        "svg_height": 300
        //"svg_width": 1200
    });
};

$("#loading-start").on("click", function () {
    console.log("start");
    start_loading(storyline);
});

if (DEBUG_MODE) {
    $("#loading-stop").on("click", function () {
        storyline.stop_loading();
    });
}

init();