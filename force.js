/*jshint esversion: 6 */

let touchnow;
const full_force_data = {
    left: [],
    right: []
};

document.addEventListener("DOMContentLoaded", function() {

    const el_left = document.getElementById('btn_id_left');
    const el_right = document.getElementById('btn_id_right');
    el_left.addEventListener('touchstart', function(evt) {
        evt.preventDefault();
        el_left.textContent = "";
        el_left.style.backgroundColor = "#888888";
        get_force(evt, 'left', 0);
    });

    el_right.addEventListener('touchstart', function(evt) {
        evt.preventDefault();
        el_right.textContent = "";
        el_right.style.backgroundColor = "#888888";
        get_force(evt, 'right', 0);
    });

    ['touchend', 'touchcancel', 'mouseleave'].forEach(function(e) {
        el_left.addEventListener(e, function(evt) {
            document.getElementById('btn_id_left').innerHTML = '<br>Touch here!';
            document.getElementById('btn_id_left').style.backgroundColor = "red";
            get_force(evt, 'left', 2);
        });
        el_right.addEventListener(e, function(evt) {
            document.getElementById('btn_id_right').innerHTML = '<br>Touch here!';
            document.getElementById('btn_id_right').style.backgroundColor = "red";
            get_force(evt, 'right', 2);
        });
    });
    el_left.addEventListener('touchforcechange', get_force_left);
    el_right.addEventListener('touchforcechange', get_force_right);

    // start check
    let toadd = "";
    if (jscd.browser !== "Safari") {
        toadd = "The problem could be that you are not using Safari browser. (We detected " + jscd.browser + ".)";
    } else if (parseInt(jscd.browserVersion) < 10) {
        toadd = "The problem could be that your Safari browser version is outdated. (We detected " + jscd.browserVersion + ", while it should be at least 10.0).";
    }
    document.getElementById('extra_info').textContent = toadd;

    // comment out for testing
    if (!('ontouchforcechange' in window.document)) {
        cancel();
        return;
    }
    // go(); // for testing

    const el1 = document.getElementById('btn_test_id');
    el1.addEventListener('touchstart', function(evt) {
        evt.preventDefault();
        document.getElementById('btn_test_id').classList.add("pressd");
        setTimeout(() => {
            if (document.getElementById('pretest_id').style.display !== 'none') {
                cancel();
                return;
            }
        }, 3000);
    });
    el1.addEventListener('touchforcechange', function(evt) {
        evt.preventDefault();
        const force = evt.changedTouches[0].force;
        if (force > 0 && force < 1) {
            go();
        }
    });
});

const cancel = function() {
    if (!userid.startsWith("GL")) {
        document.getElementById('pretest_id').style.display = 'none';
        document.getElementById('cancel_id').style.display = 'block';
        f_name = 'touchforce_x_pilot.txt';
        full_data = jscd_text + '\t' + date_time + '\n';
        upload();
    }
};

const go = function() {
    document.getElementById('pretest_id').style.display = 'none';
    document.getElementById('intro_id').style.display = 'block';
};

const get_force_left = function(evt) {
    get_force(evt, 'left');
};
const get_force_right = function(evt) {
    get_force(evt, 'right');
};
const get_force = function(evt, side, type = 1) {
    evt.preventDefault();
    const f_now = evt.changedTouches[0].force * 100;
    full_force_data[side].push([evt.timeStamp, f_now, evt.changedTouches[0].screenX, evt.changedTouches[0].screenY, type]);
    if (f_now > 75) {
        document.getElementById('btn_id_' + side).classList.add("pressd");
        document.getElementById('bar_id_' + side).style.backgroundColor = '#00e600';
        if (listen == true && ((current_stim.item == '→' && side == 'right') || (current_stim.item == '←' && side == 'left'))) {
            listen = false;
            store_trial();
        }
    } else if (f_now < 25) {
        document.getElementById('btn_id_' + side).classList.remove("pressd");
        document.getElementById('bar_id_' + side).style.backgroundColor = '#568f56';
    }
    document.getElementById('bar_id_' + side).style.height = Math.round(f_now) + '%';
};
