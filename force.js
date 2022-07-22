/*jshint esversion: 6 */

let touchnow, trial_force_data;
const full_force_data = {};

document.addEventListener("DOMContentLoaded", function() {
    const el = document.getElementById('btn_id');
    el.addEventListener('touchstart', function(evt) {
        evt.preventDefault();
        el.textContent = "";
        el.style.backgroundColor = "#888888";
        if (waitTouch === true) {
            waitTouch = false;
            next_trial();
        }
    });
    ['touchend', 'touchcancel', 'mouseleave'].forEach(function(e) {
        el.addEventListener(e, askTouch);
    });

    // start check
    let toadd = "";
    if (jscd.browser !== "Safari") {
        toadd = "The problem could be that you are not using Safari browser. (We detected " + jscd.browser + ".)";
    } else if (parseInt(jscd.browserVersion) < 10) {
        toadd = "The problem could be that your Safari browser version is outdated. (We detected " + jscd.browserVersion + ", while it should be at least 10.0).";
    }
    document.getElementById('extra_info').textContent = toadd;
    if (!('ontouchforcechange' in window.document)) {
        cancel();
        return;
    }
    const el1 = document.getElementById('btn_test_id');
    el1.addEventListener('touchstart', function(evt) {
        evt.preventDefault();
        document.getElementById('btn_test_id').style.backgroundColor = "#aaa";
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

const askTouch = function() {
    document.getElementById('btn_id').innerHTML = '<br>Touch here!';
    document.getElementById('btn_id').style.backgroundColor = "red";
};

const start_force = function() {
    touchnow = 0;
    trial_force_data = [];
    document.getElementById('btn_id').addEventListener('touchforcechange', get_force);
    setTimeout(function() {
        document.getElementById('btn_id').removeEventListener("touchforcechange", get_force);
        full_force_data[trialnum] = trial_force_data.map(elem => {
            elem[0] = Math.round(elem[0] * 100) / 100;
            elem[1] = Math.round(elem[1] * 100) / 100;
            return (elem);
        });
        store_trial();
    }, 800);
};

const get_force = function(evt) {
    evt.preventDefault();
    trial_force_data.push([performance.now(), evt.timeStamp, evt.changedTouches[0].force, evt.changedTouches[0].screenX, evt.changedTouches[0].screenY]);
};
