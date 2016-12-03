/**
 * Created by derekxiao on 2016/12/3.
 */
var storyline;
var init = function () {
    storyline = new StreamingStoryline("#streaming-storyline", {
        "height": 400,
        "width": 1200
    });
};

$("#loading-start").on("click", function () {
    console.log("start");
    start_loading(storyline);
});

init();