/**
 * Created by derekxiao on 2016/12/3.
 */
var storyline;
var init = function () {
    $('select').material_select();
    storyline = new StreamingStoryline("#streaming-storyline", {
        "svg_height": 300
        //"svg_width": 1200
    });
    dataset_selector = $("#dataset-selector");
    dataset_selector.on("change", function () {
        stop_button.click();
        if (start_button.hasClass(grey_class))
            start_button.toggleClass(grey_class);
        if (!stop_button.hasClass(grey_class))
            stop_button.toggleClass(grey_class);
        if (!replay_button.hasClass(grey_class))
            replay_button.toggleClass(grey_class);
        replay(false);
    });
};

var grey_class = "grey-text text-lighten-1";
var start_button = $("#play");
var stop_button = $("#stop");
stop_button.addClass(grey_class);
var replay_button = $("#replay");
replay_button.addClass(grey_class);

start_button.on("click", function () {
    console.log("start");
    if (stop_button.hasClass(grey_class))
        stop_button.toggleClass(grey_class);
    if (replay_button.hasClass(grey_class))
        replay_button.toggleClass(grey_class);
    if (!start_button.hasClass(grey_class))
        start_button.toggleClass(grey_class);
    start_loading(storyline);
});
stop_button.on("click", function () {
    if (!stop_button.hasClass(grey_class))
        stop_button.toggleClass(grey_class);
    if (replay_button.hasClass(grey_class))
        replay_button.toggleClass(grey_class);
    if (!start_button.hasClass(grey_class))
        start_button.toggleClass(grey_class);
    storyline.stop_loading();
});
replay_button.on("click", function () {
    if (stop_button.hasClass(grey_class))
        stop_button.toggleClass(grey_class);
    if (!replay_button.hasClass(grey_class))
        replay_button.toggleClass(grey_class);
    if (!start_button.hasClass(grey_class))
        start_button.toggleClass(grey_class);
    replay(true);
});

var replay = function (autoplay) {
    storyline.stop_loading();
    $("#streaming-storyline").empty();
    storyline = new StreamingStoryline("#streaming-storyline", {
        "svg_height": 300
        //"svg_width": 1200
    });
    if (autoplay)
        start_loading(storyline);
};

if (DEBUG_MODE) {
    $("#loading-stop").on("click", function () {
        storyline.stop_loading();
    });
}

init();