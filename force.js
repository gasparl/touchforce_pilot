/*jshint esversion: 6 */

let touchnow, trial_force_data, ongoingTouch = {};
const full_force_data = {};

document.addEventListener("DOMContentLoaded", function() {
    const el = document.getElementById('btn_id');
    ['touchstart', 'click'].forEach(function(e) {
        el.addEventListener(e, function(evt) {
            evt.preventDefault();
            if (Array.isArray(evt.changedTouches)) {
                ongoingTouch = copyTouch(evt.changedTouches[0]);
            } else {
                document.getElementById('btn_id').textContent = "Touch force not supported.";
            }
            document.getElementById('btn_id').textContent = "";
            document.getElementById('btn_id').style.backgroundColor = "#888888";
            if (waitTouch === true) {
                waitTouch = false;
                next_trial();
            }
        });
    });
    ['touchend', 'touchcancel', 'mouseleave'].forEach(function(e) {
        el.addEventListener(e, function(evt) {
            askTouch();
        });
    });

});

const askTouch = function() {
    document.getElementById('btn_id').innerHTML = '<span style="position:relative;top: 50%;transform: translateY(-50%);">Touch here!</span>';
    document.getElementById('btn_id').style.backgroundColor = "red";
};

const copyTouch = function({
    force,
    screenX,
    screenY
}) {
    return {
        force,
        screenX,
        screenY
    };
};

const start_force = function() {
    touchnow = 0;
    trial_force_data = [];
    get_force(true);
};

const get_force = function(recall) {
    touchnow = performance.now();
    trial_force_data.push([touchnow, ongoingTouch.force, ongoingTouch.screenX, ongoingTouch.screenY]);
    if (recall) {
        if (touchnow - disp_start > 800) {
            // end trial, save data stringified
            full_force_data[trialnum] = trial_force_data.map(elem => {
                elem[0] = Math.round(elem[0] * 100) / 100;
                return(elem);
            });
            store_trial();
        } else {
            setTimeout(() => {
                get_force(true);
            }, 5);
            for (let i = 6; i < 11; i++) {
                // console.log(i)
                setTimeout(() => {
                    get_force(false);
                }, i);
            }
        }
    }
};
