var select_status = 0;
var first_click;

var width_graybox = 150;
var width_orangebox = 150;

var masks = $('.mm_mask');
masks.click(mm_click_event);
masks.mousemove(mm_move_event);
masks.mouseleave(mm_leave_event);
masks.mousedown(mm_down_event);
masks.mouseup(mm_up_event);
masks[0].onmousewheel = mm_scroll_event;
var minimap_width = masks.width();
var minimap_height = masks.height();

var last_center;
var last_width;

function drawSelectBox(selector, position, width, update_data) {
    var left = position - width / 2;
    if (left < 0) {
        width += left;
        left = 0;
    }
    var w = $('.mm_mask').width();
    if (left + width > w) {
        width = w - left;
    }
    $(selector).css('opacity', '0.5').css('left', left + 'px').css('width', width + 'px');
    if (update_data) {
        // console.log(left, left + width);
        var center = left + width / 2;
        var speed = 0;
        if (last_center != undefined) {
            speed = [center - last_center, width - last_width];
        }
        update_storyline_view(left + width / 2, width, speed);
        last_center = left + width / 2;
        last_width = width;
    }
}

function hideSelectBox(selector) {
    $(selector).css('opacity', '0');
}

function mm_down_event(e) {
    var offset = e.offsetX;
    select_status = 1;
    width_orangebox = width_graybox;
    drawSelectBox('.mm_orange', offset, width_orangebox, true);
    hideSelectBox('.mm_gray');
}

function mm_up_event(e) {
    var offset = e.offsetX;
    select_status = 0;
    width_orangebox = width_graybox;

    drawSelectBox('.mm_orange', offset, width_orangebox, true);
    last_center = undefined;
    last_width = undefined;
    // hideSelectBox('.mm_gray');
    //console.log("up", offset, width_orangebox);
    // update_storyline_view(offset, width_orangebox);
}

function mm_scroll_event(e) {
    var offset = e.offsetX;
    // console.log(e.wheelDeltaY);
    var delta = -e.wheelDeltaY / 40;
    width_graybox += delta;
    width_graybox = Math.max(80, width_graybox);
    width_graybox = Math.min(480, width_graybox);
    if (!select_status) {
        drawSelectBox('.mm_gray', offset, width_graybox);
    } else {
        width_orangebox = width_graybox;
        drawSelectBox('.mm_orange', offset, width_orangebox, true);
        //console.log("scroll", offset, width_orangebox);
        // update_storyline_view(offset, width_orangebox);
    }

    return false;
}

function mm_leave_event() {
    select_status = 0;
    last_width = undefined;
    last_center = undefined;
    hideSelectBox('.mm_gray');
}

function mm_move_event(e) {
    var offset = e.offsetX;
    //if (offset < width_graybox / 2 || offset + width_graybox / 2 > minimap_width) {
    //	return;
    //}
    if (!select_status) {
        drawSelectBox('.mm_gray', offset, width_graybox);
    } else {
        //console.log("move", offset, width_orangebox);
        // update_storyline_view(offset, width_orangebox);
        drawSelectBox('.mm_orange', offset, width_orangebox, true);
    }
}

function update_storyline_view(center, width_orangebox, speed) {
    console.log(speed);
    var actual_minimap_width = minimap_width - width_orangebox;
    storyline.scrollTo((center - width_orangebox / 2) / actual_minimap_width, (center + width_orangebox / 2) / actual_minimap_width, 1, select_status);
}

function mm_click_event(e) {
    return;
    // if (e.which == 3) {
    //     if (select_status >= 0) {
    //         offset = e.offsetX / $('.mm_top_line').width();
    //         var mousetime = (ed_now - st_now) * offset + st_now;
    //         select_status = -1;
    //         $('.mm_select_box').css('display', 'block').css('left', e.offsetX).css('width', 0);
    //         mm_send(mousetime);
    //     } else {
    //         select_status = 0;
    //         $('.mm_select_box').css('display', 'none').css('left', e.offsetX).css('width', 0);
    //     }
    //     return false;
    // }
    // switch (select_status) {
    //     case 0:
    //         select_status = 1;
    //         $('.mm_select_box').css('display', 'block')
    //             .css('left', offset + 'px');
    //         first_click = offset;
    //         break;
    //     case 1:
    //         select_status = 2;
    //         if (e.offsetX < first_click) {
    //             $('.mm_select_box').css('left', e.offsetX).css('width', first_click - e.offsetX);
    //         } else {
    //             $('.mm_select_box').css('left', first_click).css('width', -first_click + e.offsetX);
    //         }
    //         var o1 = first_click / $('.mm_top_line').width();
    //         var o2 = offset / $('.mm_top_line').width();
    //         var t1 = (ed_now - st_now) * o1 + st_now;
    //         var t2 = (ed_now - st_now) * o2 + st_now;
    //         mm_send(t1, t2);
    //         break;
    //     case 2:
    //     case -1:
    //         select_status = 0;
    //         $('.mm_select_box').css('display', 'none');
    //         break;
    // }
}
