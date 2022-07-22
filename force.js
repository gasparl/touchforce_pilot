/*jshint esversion: 6 */

let touchnow, trial_force_data, ongoingTouch = {};
const full_force_data = {};

document.addEventListener("DOMContentLoaded", function() {

    const elTEST = document.getElementById('btn_test_id');
    elTEST.addEventListener('touchstart', function(evt) {
        evt.preventDefault();

        document.getElementById('feed').textContent = 'force: ' + evt.changedTouches[0].force + " sceen: " + evt.changedTouches[0].screenX;

        setInterval(function() {
            document.getElementById('feed').textContent = 'force: ' + evt.touches[0].force + " sceen: " + evt.touches[0].screenX;
        }, 500);

    });


    const el1 = document.getElementById('btn_id');
    el1.addEventListener('touchstart', function(evt) {
        evt.preventDefault();
        if (typeof evt.changedTouches === 'object' &&
            evt.changedTouches !== null) {
            ongoingTouch = copyTouch(evt.changedTouches[0]);
        }
        if (evt.changedTouches[0].force === 0) {
            go();
        } else {
            // give force a second chance
            setTimeout(() => {
                if (evt.touches[0].force === undefined) {
                    document.getElementById('pretest_id').style.display = 'none';
                    document.getElementById('cancel_id').style.display = 'block';
                } else {
                    go();
                }
            }, 30);
        }
    });
    const el = document.getElementById('btn_id');
    el.addEventListener('touchstart', function(evt) {
        evt.preventDefault();
        if (typeof evt.changedTouches === 'object' &&
            evt.changedTouches !== null) {
            ongoingTouch = evt.changedTouches[0];
        }
        document.getElementById('btn_id').textContent = "";
        document.getElementById('btn_id').style.backgroundColor = "#888888";
        if (waitTouch === true) {
            waitTouch = false;
            next_trial();
        }
    });
    ['touchend', 'touchcancel', 'mouseleave'].forEach(function(e) {
        el.addEventListener(e, function(evt) {
            console.log("out");
            console.log(ongoingTouch.force);
            console.log(ongoingTouch.screenX);
            setTimeout(() => {
                console.log(ongoingTouch.force);
                console.log(ongoingTouch.screenX);
            }, 50);
            askTouch();
        });
    });

    // setInterval(function() {
    //     document.getElementById('force_id').textContent = 'force: ' + ongoingTouch.force;
    // }, 200);

});

const go = function() {
    ongoingTouch = {};
    document.getElementById('pretest_id').style.display = 'none';
    document.getElementById('intro_id').style.display = 'block';
};

const askTouch = function() {
    document.getElementById('btn_id').innerHTML = '<br>Touch here!';
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
                return (elem);
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
