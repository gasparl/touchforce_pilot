/*jshint esversion: 6 */

// define global variables
let date_time, jscd_text, listenkey, text_to_show, disp_start, disp_stop,
    input_time, allstims, f_name;
let trialnum = 0,
    startclicked = false,
    waitTouch = true,
    userid = "noid";

document.addEventListener("DOMContentLoaded", function() {
    userid_check();
    // define a small information box for continually updated info about the ongoing trials
    let heads = ["os", "os_v", "browser", "browser_v", "screen"];
    let cols = [jscd.os, jscd.osVersion, jscd.browser, jscd.browserVersion, jscd.screen];
    // let jscd_show = heads.map(function(hed, ind) {
    //     return ('<br>' + hed + ': <b>' + cols[ind] + '</b>');
    // });
    date_time = neat_date();
    heads.push("start");
    cols.push(Math.round(DT.now() * 100) / 100);
    jscd_text = 'client\t' + heads.join('/') + '\t' + cols.join('/');
    //document.getElementById('jscd_id').innerHTML = jscd_show;
});

function begin() {
    DT.loopOn();

    askTouch();
    allstims = new Array(28).fill({
        item: "go",
        ssd: 0
    });
    for (var i = 1; i < 11; i++) {
        allstims.push({
            item: "stop",
            ssd: i * 30
        });
    }
    allstims = allstims.slice(0, 2).concat(shuffle(allstims));
    document.getElementById('instructions_id').style.display = 'none';
    document.getElementById('task_id').style.display = 'block';
}

function next_trial() {
    document.getElementById('stimulus_id').textContent = '+';
    setTimeout(function() {
        if (document.getElementById('btn_id').style.backgroundColor == "red") {
            console.log('Failed trial.');
            waitTouch = true;
            return;
        }
        trialnum++;
        disp_start = "NA";
        disp_stop = "NA";
        current_stim = allstims.shift(); // get next stimulus dictionary
        console.log(current_stim); // print info
        start_force();
        setTimeout(function() {
            requestAnimationFrame(function(stamp) {
                document.getElementById('stimulus_id').textContent = "Press!";
                disp_start = stamp; // the crucial (start) JS-timing
                if (current_stim.item == "stop") {
                    setTimeout(function() {
                        requestAnimationFrame(function(stamp2) {
                            document.getElementById('stimulus_id').textContent = 'STOP!';
                            disp_stop = stamp2;
                        });

                    }, current_stim.ssd - 8);
                }
            });
        }, 100);
    }, randomdigit(800, 1200));
}

const randomdigit = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

//*** storing data, etc. ***//

// column names for the data to be saved
let full_data = [
    "datetime",
    "trial_number",
    "type",
    "ssd",
    "disp_start",
    "disp_stop"
].join('\t') + '\n';

function store_trial() {
    full_data += [
        date_time,
        trialnum,
        current_stim.item,
        current_stim.ssd,
        disp_start,
        disp_stop
    ].join('\t') + '\n';
    if (allstims.length > 0) {
        next_trial();
    } else {
        ending();
    }
}

// change rectangle color to blue to indicate experiment ending
function ending() {
    document.getElementById('task_id').style.display = 'none';
    console.log('THE END');
    f_name = 'touchforce_pilot_' + jscd.os + '_' +
        jscd.browser + '_' + date_time + '_' + userid + '.txt';
    full_data += jscd_text + "\n" + JSON.stringify(full_force_data);
    upload();
}

// get readable current date and time
function neat_date() {
    let m = new Date();
    return m.getFullYear() + "_" +
        ("0" + (m.getMonth() + 1)).slice(-2) + "" +
        ("0" + m.getDate()).slice(-2) + "_" +
        ("0" + m.getHours()).slice(-2) + "" +
        ("0" + m.getMinutes()).slice(-2);
}

// order randomization function
function shuffle(arr) {
    let array = JSON.parse(JSON.stringify(arr));
    let newarr = [];
    let currentIndex = array.length,
        temporaryValue,
        randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        newarr[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return newarr;
}

// function to download (save) results data as a text file
function dl_as_file() {
    filename_to_dl = f_name;
    data_to_dl = full_data;
    let blobx = new Blob([data_to_dl], {
        type: 'text/plain'
    });
    let elemx = window.document.createElement('a');
    elemx.href = window.URL.createObjectURL(blobx);
    elemx.download = filename_to_dl;
    document.body.appendChild(elemx);
    elemx.click();
    document.body.removeChild(elemx);
}

function userid_check() {
    window.params = new URLSearchParams(location.search);
    userid = params.get('PROLIFIC_PID');
    if (userid != null) {
        document.getElementById('pay_info').textContent = "Completed and valid participation will be rewarded with 0.40 GBP via Prolific.";
        if (userid.startsWith("GL")) {
            go();
        }
    } else {
        userid = "noid";
    }
}

// store data on server

function upload() {
    fetch('https://homepage.univie.ac.at/gaspar.lukacs/forcetouch_results/force.php', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            },
            body: JSON.stringify({
                fname_post: f_name,
                results_post: full_data
            })
        })
        .then(response => response.text())
        .then(echoed => {
            console.log(echoed);
            if (echoed.startsWith("http")) {
                document.getElementById('end_id').innerHTML = "That's all, thank you! <h3>Please use the following Prolific completion link:</h3> <a href='" + echoed + "' target='_blank'>" + echoed + "</a><br><br>(The data is successfully saved on the sever, you can close this page.)";
            }
            if (document.getElementById('cancel_id').style.display !== 'block') {
                document.getElementById('end_id').style.display = 'block';
            }
        })
        .catch((error) => {
            console.log('Request failed: ', error);
            if (document.getElementById('cancel_id').style.display !== 'block') {
                document.getElementById('end_id').style.display = 'block';
            }
        });
}
