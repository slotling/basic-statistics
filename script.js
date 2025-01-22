// THIS ENTIRE CODE SUCKS

const padding = 40;

const real_SW = window.innerWidth;
const real_SH = window.innerHeight;
const padding_SW = real_SW - padding;
const padding_SH = real_SH - padding;
const SW = real_SW - padding * 2;
const SH = real_SH - padding * 2;

const raw_DATA = `53
90
44
49
45.9
69
65
69
65
60
43
30
50.5
51.5
48.1
60
54
59
92
60
42
65.5
61
61.1
58
38
63
63.5
47
71
84
75
90
54
36
60
43
57
48
65
85
45
37
47.9
54
74
46
58
48.2
48
67
63
44
52
43
50
44.5
57
56
80
41
78
46
54
50
60
50
58
81.9
48.2
45
46.5
40`
const DATA = raw_DATA.split("\n").map((x)=>parseInt(x)).sort((a,b)=>a-b);
const N = DATA.length;
const STATS = {}

const DATA_NUMBERED_REPETITIONS_BY_INDEX = [];
function process_statistics() {
    STATS["sum"] = 0
    STATS["sum_variance"] = 0
    DATA.forEach(e => {
        STATS["sum"] += e;
    });
    STATS["mean"] = STATS["sum"] / N;
    DATA.forEach(e => {
        STATS["sum_variance"] += (e - STATS["mean"])*(e - STATS["mean"]);
    });
    STATS["variance"] = STATS["sum_variance"] / N;
    STATS["stddev"] = Math.sqrt(STATS["variance"]);
    STATS["median_pos"] = (N+1)/2;
    STATS["lq_pos"] = (N+1)*(1/4);
    STATS["uq_pos"] = (N+1)*(3/4);
    STATS["lq"] = DATA[Math.round(STATS["lq_pos"])];
    STATS["uq"] = DATA[Math.round(STATS["uq_pos"])];
    STATS["range"] = DATA[N-1] - DATA[0];
    STATS["iqr"] = STATS["uq"] - STATS["lq"];

    STATS["occurences"] = {};
    STATS["max_occurences"] = 0;
    DATA.forEach((e, i) => {
        if (STATS["occurences"].hasOwnProperty(e)){ 
            DATA_NUMBERED_REPETITIONS_BY_INDEX.push(STATS["occurences"][e]);
            STATS["occurences"][e] += 1;
        } else {
            STATS["occurences"][e] = 0;
            DATA_NUMBERED_REPETITIONS_BY_INDEX.push(STATS["occurences"][e]);
            STATS["occurences"][e] += 1;
        }

        STATS["max_occurences"] = Math.max(STATS["max_occurences"], STATS["occurences"][e]);
    });
}
process_statistics();

let animations = {}

// functions
function anim_intro() {
    const dur = 3000;
    animations["intro_glide"] = anime({
        targets: '#numbers > .datapoint',
        translateX: [real_SW/2, () => {
            return anime.random(padding, padding_SW);
        }],
        translateY: [real_SH +20, () => {
            return anime.random(padding, padding_SH);
        }],
        delay: anime.stagger(dur/N),
        easing: 'spring(1, 10, 10, 0)',
        duration: null,
    });
    anime({
        targets: '#numbers > .datapoint',
        innerHTML: [0, function(el, i, l) {
            return DATA[i];
        }],
        round: 1,
        delay: anime.stagger(dur/N),
        easing: 'easeOutQuad',
        duration: dur
    });
    anime({
        targets: '#ncounter',
        innerHTML: [0, N],
        round: 1,
        easing: 'linear',
        duration: dur,
    });
}

function dom_init() {
    document.querySelector("#numbers").innerHTML += `<span class="datapoint element">??</span>`.repeat(N);
    document.querySelector("#numbers").innerHTML += `<span class="index element" style="font-size: small">0</span>`.repeat(N);
    document.querySelector("#numbers").innerHTML += `<span class="value element" style="font-size: small; color: #737373">0</span>`.repeat(STATS["range"]+1);

    // mean
    document.querySelector("#section_mean").innerHTML += `<span class="plussign element">+</span>`.repeat(N-1)
}

function change_title(title, subtitle=null) {
    document.querySelectorAll("#top > span")[0].innerHTML = title
    if (subtitle) {
        document.querySelectorAll("#top > span")[1].innerHTML = subtitle
    }
}

function section_general() {
    const dur = 1000;

    animations["intro_glide"].remove("#numbers > .datapoint");

    animations["organize"] = anime({
        targets: '#numbers > .datapoint',
        translateX: function(el, i, l) {
            return padding+i*(SW/N);
        },
        translateY: real_SH/2,
        rotate: "90deg",
        scale: 1,
        color: "#FFFFFF",
        delay: anime.stagger(dur/N),
        easing: 'easeInOutQuad',
        duration: dur
    });

    anime({
        targets: '#numbers > .index',
        // translateX: function(el, i, l) {
        //     return padding+i*(SW/N);
        // },
        // translateY: real_SH/2,
        // rotate: "90deg",
        // scale: 1,
        color: "#FFFFFF",
        delay: anime.stagger(dur/N),
        easing: 'easeInOutQuad',
        duration: dur
    });
}

function section_mean(mean=true) {
    animations["organize"].seek(animations["organize"].duration);
    
    const dur = 1000;

    // arranging table
    const rows = 3;
    const cols = Math.ceil(N/rows);
    const middleHeight = 100;
    anime({
        targets: '#numbers > .datapoint',
        translateX: function(el, i, l) {
            let col = i%cols;
            let spacing = SW/cols;
            return padding+col*(spacing);
        },
        translateY: function(el, i, l) {
            let row = parseInt(i/cols);
            let spacing = middleHeight/(rows-1);
            return real_SH/2 + row*spacing - (middleHeight / 2);
        },
        rotate: "0deg",
        delay: anime.stagger(dur/N),
        easing: 'easeInOutQuad',
        duration: dur
    });
    anime({
        targets: '#section_mean > .plussign',
        translateX: [real_SW/2, function(el, i, l) {
            let col = i%cols;
            let spacing = SW/cols;
            return padding+(col+0.5)*(spacing);
        }],
        translateY: [-100, function(el, i, l) {
            let row = parseInt(i/cols);
            let spacing = middleHeight/(rows-1);
            return real_SH/2 + (row)*spacing - (middleHeight / 2);
        }],
        delay: anime.stagger(dur/N),
        easing: 'easeInOutQuad',
        duration: dur
    });
    
    if (mean){
        anime({
            targets: '#result_mean_1',
            translateX: real_SW/2,
            translateY: [real_SH + 100, real_SH / 2 + middleHeight / 2 + 100],
            easing: 'easeInOutQuad',
            duration: dur,
            delay: dur
        });
        anime({
            targets: '#result_mean_1_number',
            innerHTML: [0, STATS.sum],
            round: 1,
            easing: 'easeOutExpo',
            duration: dur*3,
            delay: dur*2
        });
    } else {
        anime({
            targets: '#result_var_1',
            translateX: real_SW/2,
            translateY: [real_SH + 100, real_SH / 2 + middleHeight / 2 + 100],
            easing: 'easeInOutQuad',
            duration: dur,
            delay: dur
        });
        anime({
            targets: '#result_var_1_number',
            innerHTML: [0, STATS["sum_variance"]],
            round: 1,
            easing: 'easeOutExpo',
            duration: dur*3,
            delay: dur*2
        });
    }
}

function section_mean_finish(mean=true) {
    const dur = 1000
    anime({
        targets: '#section_mean > .plussign',
        translateX: real_SW/2,
        translateY: -100,
        delay: anime.stagger(dur/N),
        easing: 'easeInOutQuad',
        duration: dur
    });

    if (mean) {
        anime({
            targets: '#result_mean_1',
            translateY: real_SH + 100,
            easing: 'easeInOutQuad',
            duration: dur,
            delay: dur
        });
    } else {
        anime({
            targets: '#result_var_1',
            translateY: real_SH + 100,
            easing: 'easeInOutQuad',
            duration: dur,
            delay: dur
        });
    }

}

function section_mean_2(mean=true) {
    const middleHeight = 100;
    const dur = 1000;

    if (mean){

        anime({
            targets: '#result_mean_2',
            translateX: [real_SW/2, real_SW/2],
            translateY: [real_SH + 100, real_SH / 2 + middleHeight / 2 + 100],
            easing: 'easeInOutQuad',
            duration: dur
        });    
        anime({
            targets: '#result_mean_2_number',
            innerHTML: [0, STATS.mean],
            round: 1000,
            easing: 'easeOutExpo',
            duration: dur*2,
            delay: dur*2
        });
    } else {
        
        anime({
            targets: '#result_var_2',
            translateX: [real_SW/2, real_SW/2],
            translateY: [real_SH + 100, real_SH / 2 + middleHeight / 2 + 100],
            easing: 'easeInOutQuad',
            duration: dur
        });
        anime({
            targets: '#result_var_2_number',
            innerHTML: [0, STATS["variance"]],
            round: 1000,
            easing: 'easeOutExpo',
            duration: dur*2,
            delay: dur*2
        });
    }
}

function section_mean_2_finish(mean=true) {
    const dur = 1000;

    if (mean) {
        anime({
            targets: '#result_mean_2',
            translateY: real_SH + 100,
            easing: 'easeInOutQuad',
            duration: dur,
        });
    } else {
        anime({
            targets: '#result_var_2',
            translateY: real_SH + 100,
            easing: 'easeInOutQuad',
            duration: dur,
        });
    }
}

function section_general_index() {
    const dur = 1000;
    anime({
        targets: '#numbers > .index',
        translateX: [real_SW/2, function(el, i, l) {
            return padding+i*(SW/N);
        }],
        translateY: [-100, real_SH/2-25],
        delay: anime.stagger(dur/N),
        easing: 'easeInOutQuad',
        duration: dur
    });

    setTimeout(() => {
        anime({
            targets: '#numbers > .index',
            innerHTML: function(el, i, l) {
                return i+1;
            },
            delay: anime.stagger(dur/N),
            easing: 'linear',
            round: 1,
            duration: 1,
        });
        anime({
            targets: '#numbers > .index',
            rotate: "1turn",
            delay: anime.stagger(dur/N),
            easing: 'easeOutQuad',
            duration: 500,
        });
    }, dur*2);
}

function section_general_dividers(second=false) {
    const dur = 1000;
    if (!second){
        const x = padding+(STATS["median_pos"]-1)*(SW/N);
        anime({
            targets: '#dividers > #median',
            translateX: [x, x],
            translateY: [-500, real_SH / 2],
            easing: 'easeInOutQuad',
            duration: dur,
        });
        return;
    }

    const x1 = padding+(STATS["lq_pos"]-1)*(SW/N);
    const x2 = padding+(STATS["uq_pos"]-1)*(SW/N);
    anime({
        targets: '#dividers > #lq',
        translateX: [x1, x1],
        translateY: [-500, real_SH / 2],
        easing: 'easeInOutQuad',
        duration: dur,
    });
    anime({
        targets: '#dividers > #uq',
        translateX: [x2, x2],
        translateY: [-500, real_SH / 2],
        easing: 'easeInOutQuad',
        duration: dur,
    });
    return;
}

function section_general_dividers_clear() {
    const dur = 1000;
    anime({
        targets: '#dividers > .element',
        translateY: -500,
        easing: 'easeInOutQuad',
        duration: dur,
    });
}

function section_median() {
    const dur = 1000;
    const delaypereach = 100;

    animations["highlight_index"] = anime({
        targets: '#numbers > .index',
        keyframes: [
            { color: "#FFFF00", scale: 1.4, duration: 250 },
            { color: function(el, i, l) {
                
                if (i == STATS["median_pos"]-1){
                    return "#FFFF00";
                }
                return "#FFFFFF";
            }, scale: 1, duration: 250 , delay: 250 }
        ],
        delay: anime.stagger(delaypereach, {grid: [N, 1], from: 'center', direction: 'reverse'}),
        easing: 'linear',
        duration: dur,
    });

    anime({
        targets: document.querySelectorAll("#numbers > .datapoint")[STATS["median_pos"]-1],
        keyframes: [
            { color: "#FFFF00", scale: 1.4, duration: 250, easing: 'linear' },
            { translateY: real_SH/2 + 200, duration: 1000, delay: 250, easing: 'easeInOutQuad' },
        ],
        delay: delaypereach*N/2,
    });
}

function section_quartile() {
    const dur = 1000;
    const delaypereach = 100;

    const lq = STATS["lq_pos"]; const uq = STATS["uq_pos"];

    anime({
        targets: [document.querySelectorAll("#numbers > .datapoint")[Math.floor(lq-1)], document.querySelectorAll("#numbers > .datapoint")[Math.ceil(lq-1)], document.querySelectorAll("#numbers > .datapoint")[Math.floor(uq-1)], document.querySelectorAll("#numbers > .datapoint")[Math.ceil(uq-1)]],
        keyframes: [
            { color: "#FFFF00", scale: 1.4, duration: 250, easing: 'linear' },
            { translateY: real_SH/2 + 200, duration: 1000, delay: 250, easing: 'easeInOutQuad' },
        ],
        delay: anime.stagger(delaypereach),
    });
}

function section_general_index_clear() {
    const dur = 1000;
    anime({
        targets: '#numbers > .index',
        translateY: -100,
        delay: anime.stagger(dur/N),
        easing: 'easeInOutQuad',
        duration: dur
    });
}

function section_general_alt(begin=false) {
    animations["intro_glide"].remove("#numbers > .datapoint");

    const dur = 1000;
    animations["organize"] = anime({
        targets: '#numbers > .datapoint',
        translateX: function(el, i, l) {
            return padding+(DATA[i]-DATA[0])*(SW/STATS["range"]);
        },
        translateY: function(el, i, l) {
            return real_SH/2 + DATA_NUMBERED_REPETITIONS_BY_INDEX[i]*-25;
        } ,
        rotate: "90deg",
        scale: 1,
        color: "#FFFFFF",
        delay: anime.stagger(dur/N),
        easing: 'easeInOutQuad',
        duration: dur
    });

    if (!begin) {return;}
    anime({
        targets: '#numbers > .value',
        translateX: function(el, i, l) {
            return padding+i*(SW/STATS["range"]);
        },
        translateY: real_SH/2 + 25,
        innerHTML: function(el, i, l) {
            return i + DATA[0];
        },
        round: 1,
        delay: anime.stagger(dur/N),
        easing: 'easeInOutQuad',
        duration: dur
    });
}

function section_mode() {
    const dur = 1000;
    anime({
        targets: '#numbers > .datapoint',
        color: function(el, i, l) {
            if (STATS["occurences"][parseInt(el.innerHTML)] == STATS["max_occurences"]) {
                return "#FFFF00";
            }
            return "#FFFFFF";
        },
        easing: 'easeInOutQuad',
        duration: dur
    });
}

function section_range() {
    const dur = 1000;
    anime({
        targets: [document.querySelectorAll('#numbers > .datapoint')[0], document.querySelectorAll('#numbers > .datapoint')[N-1]],
        translateY: [real_SH/2, real_SH/2 + 100],
        color: "#FFFF00",
        easing: 'easeInOutQuad',
        duration: dur
    });

    const middleHeight = 100;
    document.querySelector("#result_range").innerHTML = `${DATA[N-1]} - ${DATA[0]} = ${DATA[N-1] - DATA[0]}`
    anime({
        targets: '#result_range',
        translateX: real_SW/2,
        translateY: [real_SH + 100, real_SH / 2 + middleHeight / 2 + 100],
        easing: 'easeInOutQuad',
        duration: dur,
        delay: dur
    });
}

function section_range_finish() {
    const dur = 1000;
    anime({
        targets: '#result_range',
        translateY: real_SH + 100,
        easing: 'easeInOutQuad',
        duration: dur,
    });
}

function section_iqr() {
    const dur = 1000;
    const lq = STATS["lq_pos"]-1; const uq = STATS["uq_pos"]-1;
    const lq1 = Math.floor(lq);
    const lq2 = Math.ceil(lq);
    const uq1 = Math.floor(uq);
    const uq2 = Math.ceil(uq);

    anime({
        targets: [document.querySelectorAll("#numbers > .datapoint")[lq1], document.querySelectorAll("#numbers > .datapoint")[lq2], document.querySelectorAll("#numbers > .datapoint")[uq1], document.querySelectorAll("#numbers > .datapoint")[uq2]],
        translateY: [real_SH/2, real_SH/2 + 100],
        color: "#FFFF00",
        easing: 'easeInOutQuad',
        duration: dur
    });

    const middleHeight = 100;
    document.querySelector("#result_iqr").innerHTML = `(${DATA[uq1]}+${DATA[uq2]})÷2-(${DATA[lq1]}+${DATA[lq2]})÷2 = ${(DATA[uq1]+DATA[uq2])/2-(DATA[lq1]+DATA[lq2])/2}`
    anime({
        targets: '#result_iqr',
        translateX: real_SW/2,
        translateY: [real_SH + 100, real_SH / 2 + middleHeight / 2 + 100],
        easing: 'easeInOutQuad',
        duration: dur,
        delay: dur
    });
}

function section_iqr_finish() {
    const dur = 1000;
    anime({
        targets: '#result_iqr',
        translateY: real_SH + 100,
        easing: 'easeInOutQuad',
        duration: dur,
    });
}

function section_general_value_clear() {
    const dur = 1000;
    anime({
        targets: '#numbers > .value',
        translateY: -100,
        rotate: "90deg",
        scale: 1,
        color: "#737373",
        delay: anime.stagger(dur/N),
        easing: 'easeInOutQuad',
        duration: dur
    });
}

function section_variance() {
    const dur = 1000;
    anime({
        targets: '#numbers > .datapoint',
        innerHTML: function(el, i, l) {
            return (DATA[i]-STATS["mean"])*(DATA[i]-STATS["mean"]);
        },
        round: 1,
        delay: anime.stagger(dur/N),
        easing: 'easeOutQuad',
        duration: dur
    });
}

function section_stddev() {
    const middleHeight = 100;
    const dur = 1000;

    anime({
        targets: '#result_stddev',
        translateX: [real_SW/2, real_SW/2],
        translateY: [real_SH + 100, real_SH / 2 + middleHeight / 2 + 100],
        easing: 'easeInOutQuad',
        duration: dur
    });    
    anime({
        targets: '#result_stddev_number',
        innerHTML: [0, STATS["stddev"]],
        round: 1000,
        easing: 'easeOutExpo',
        duration: dur*2,
        delay: dur*2
    });
}

function section_stddev_finish() {
    const dur = 1000;

    anime({
        targets: '#result_stddev',
        translateY: real_SH + 100,
        easing: 'easeInOutQuad',
        duration: dur
    });    

    anime({
        targets: '#numbers > .datapoint',
        innerHTML: [function(el, i, l) {
            return DATA[i];
        }],
        round: 1,
        easing: 'easeOutQuad',
        duration: dur
    });
}

function section_general_dividers(second=false) {
    const dur = 1000;
    if (!second){
        const x = padding+(STATS["median_pos"]-1)*(SW/N);
        anime({
            targets: '#dividers > #median',
            translateX: [x, x],
            translateY: [-500, real_SH / 2],
            easing: 'easeInOutQuad',
            duration: dur,
        });
        return;
    }

    const x1 = padding+(STATS["lq_pos"]-1)*(SW/N);
    const x2 = padding+(STATS["uq_pos"]-1)*(SW/N);
    anime({
        targets: '#dividers > #lq',
        translateX: [x1, x1],
        translateY: [-500, real_SH / 2],
        easing: 'easeInOutQuad',
        duration: dur,
    });
    anime({
        targets: '#dividers > #uq',
        translateX: [x2, x2],
        translateY: [-500, real_SH / 2],
        easing: 'easeInOutQuad',
        duration: dur,
    });
    return;
}

function util_get_x_from_value(value) {
    return padding+(value-DATA[0])*(SW/STATS["range"])
}

function section_outlier() {
    const queries = document.querySelectorAll('#numbers > .value');
    const dur = 1000;
    anime({
        targets: [queries[STATS["lq"]-DATA[0]], queries[STATS["uq"]-DATA[0]]],
        color: "#FFFF00",
        round: 1,
        easing: 'easeInOutQuad',
        duration: dur
    });
    anime({
        targets: "#iqr_box",
        translateX: util_get_x_from_value(STATS["lq"] + STATS["iqr"]/2),
        translateY: real_SH/2-25,
        width: (STATS["iqr"]+1)*(SW/STATS["range"]),
        easing: 'easeInOutQuad',
        duration: dur,
        delay: 500,
    });
}

function section_outlier_2() {
    const queries = document.querySelectorAll('#numbers > .value');
    const dur = 1000;
    const selqueries = [];

    const i1 = STATS["lq"]-STATS["iqr"]*1.5-DATA[0];
    if (i1 > 0) {
        selqueries.push(queries[i1]);
    }
    const i2 = STATS["uq"]+STATS["iqr"]*1.5-DATA[0];
    if (i2 < N) {
        selqueries.push(queries[i2]);
    }

    anime({
        targets: selqueries,
        color: "#FFFF00",
        round: 1,
        easing: 'easeInOutQuad',
        duration: dur
    });
    
    anime({
        targets: "#divider_left",
        translateX: util_get_x_from_value(STATS["lq"]-STATS["iqr"]*1.5),
        translateY: real_SH/2-25,
        easing: 'easeInOutQuad',
        duration: dur,
        delay: 500,
    });
    anime({
        targets: "#divider_right",
        translateX: util_get_x_from_value(STATS["uq"]+STATS["iqr"]*1.5),
        translateY: real_SH/2-25,
        easing: 'easeInOutQuad',
        duration: dur,
        delay: 500,
    });
    anime({
        targets: "#horizontal_left",
        translateX: util_get_x_from_value(STATS["lq"]-STATS["iqr"]*1.5 + STATS["iqr"]*1.5/2),
        translateY: real_SH/2-25,
        width: (STATS["iqr"]*1.5-0.5)*(SW/STATS["range"]),
        easing: 'easeInOutQuad',
        duration: dur,
        delay: 500,
    });
    anime({
        targets: "#horizontal_right",
        translateX: util_get_x_from_value(STATS["uq"]+STATS["iqr"]*1.5 - STATS["iqr"]*1.5/2),
        translateY: real_SH/2-25,
        width: (STATS["iqr"]*1.5-0.5)*(SW/STATS["range"]),
        easing: 'easeInOutQuad',
        duration: dur,
        delay: 500,
    });
}

function section_outlier_3() {
    const queries = document.querySelectorAll('#numbers > .value');
    const selqueries = [];
    for (const i in queries) {
        if (i < STATS["lq"]-STATS["iqr"]*1.5-DATA[0] || i > STATS["uq"]+STATS["iqr"]*1.5-DATA[0]) {
            selqueries.push(queries[i]);
        }
    }
    const dur = 1000;
    anime({
        targets: selqueries,
        color: "rgb(130, 130, 255)",
        round: 1,
        easing: 'easeInOutQuad',
        duration: dur
    });
}

function section_outlier_finish() {
    const dur = 1000;
    anime({
        targets: "#outlier > .element",
        translateY: [-200],
        width: 1,
        easing: 'easeInOutQuad',
        duration: dur,
    });
}

// execution
dom_init()
setTimeout(() => {
    anim_intro()
}, 100);

// events
let section = 0;
const maxsections = 21;

const debug = false;
function proceed_event(e) {
    section += 1;
    document.querySelector("#current_section_counter").innerHTML = section;

    let cooldown = 1000;

    switch (section) {
        case 1:
            change_title("Sắp xếp", `n = <span id="ncounter">${N}</span>`);
            section_general();
            break;
            
        case 2:
            change_title("Trung bình");
            section_mean();
            break;
            
        case 3:
            section_mean_finish();
            setTimeout(() => {
                section_general();
                section_mean_2();
            }, 500);
            break;
        
        case 4:
            change_title("Trung vị");
            section_mean_2_finish();
            setTimeout(() => {
                section_general_index();
            }, 500);
            cooldown = 3500;
            break;
        
        case 5:
            section_general_dividers();
            section_median();
            cooldown = 5000;
            break;

        case 6:
            change_title("Tứ phân vị");
            section_general_dividers(second=true);
            break;
        
        case 7:
            section_quartile();
            break;

        case 8:
            section_general_dividers_clear();
            section_general_index_clear();
            section_general_alt(begin=true);
            change_title("Mốt");
            break;

        case 9:
            section_mode();
            break;

        case 10:
            change_title("Khoảng biến thiên");
            section_general();
            section_general_value_clear();
            break;

        case 11:
            section_range();
            break;

        case 12:
            section_general();
            change_title("Khoảng tứ phân vị");
            section_range_finish();

            setTimeout(() => {
                section_iqr();
            }, 1000);
            cooldown = 3000;
            break;

        case 13:
            change_title("Phương sai", `x̄ = ${Math.round(STATS["mean"]*100)/100}`);
            section_iqr_finish();
            section_general();
            break;

        case 14:
            section_variance();
            break;

        case 15:
            section_mean(false);
            break;

        case 16:
            section_mean_finish(false);
            setTimeout(() => {
                section_general();
                section_mean_2(false);
            }, 500);
            break;
        
        case 17:    
            change_title("Độ lệch chuẩn");
            section_mean_2_finish(false);
            section_stddev();
            break;

        case 18:
            change_title("Số liệu bất thường", " ");
            section_stddev_finish();
            section_general_alt(begin=true);
            break;

        case 19:
            section_outlier();
            break;

        case 20:
            section_outlier_2();
            break;

        case 21:
            section_outlier_finish();
            section_general_value_clear();
            section_general();
            
            setTimeout(() => {
                change_title("end");
                anim_end();
            }, 2000);

            break;

        default:
            break;
    }

    if (!debug) {
        document.querySelector("button").disabled = true;
        if (section >= maxsections) {
            return;
        }
        setTimeout(() => {
            document.querySelector("button").disabled = false;
        }, cooldown);
    }
}

function anim_end() {
    const dur = 3000;
    anime({
        targets: '#numbers > .datapoint',
        translateX: () => {
            return anime.random(padding, padding_SW);
        },
        translateY: () => {
            return anime.random(padding, padding_SH);
        },
        rotate: () => {
            return `${anime.random(0, 360)}deg`;
        },
        delay: anime.stagger(dur/N),
        easing: `spring(1, 60, 10, 0)`,
        duration: null,
    });
}

document.querySelector("#section_counter").innerHTML = maxsections;