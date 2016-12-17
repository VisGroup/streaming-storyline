/**
 * Created by derekxiao on 2016/12/3.
 */
var storyline;
var init = function () {
    storyline = new StreamingStoryline("#streaming-storyline", {
        "svg_height": 400,
        "svg_width": 1200
    });
};

$("#loading-start").on("click", function () {
    console.log("start");
    start_loading(storyline);
});

init();