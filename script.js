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

STATS["sum"] = 0
DATA.forEach(e => {
    STATS["sum"] += e;
});
STATS["mean"] = STATS["sum"] / N;
STATS["median_pos"] = (N+1)/2;
STATS["range"] = DATA[N-1] - DATA[0];

const DATA_NUMBERED_REPETITIONS_BY_INDEX = [];
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

    // mean
    document.querySelector("#section_mean").innerHTML += `<span class="plussign element">+</span>`.repeat(N-1)
    document.querySelector("#section_mean").innerHTML += `
    <span style="font-size: x-large" id="result_mean_1" class="element">
        =<span id="result_mean_1_number">??</span>
    </span>
    <span style="font-size: x-large" id="result_mean_2" class="element">
        <span id="result_mean_1_number">??</span>÷<span id="ncounter">0</span>=<span id="result_mean_2_number">??</span>
    </span>
    `;

    // median and stuff
    document.querySelector("#dividers").innerHTML += ["median", "lower_quartile", "upper_quartile"].map(type => `<div class="element" id="${type}"></div>`) 
}

function change_title(title, subtitle=null) {
    document.querySelectorAll("#top > span")[0].innerHTML = title
    if (subtitle) {
        document.querySelectorAll("#top > span")[1].innerHTML = subtitle
    }
}

function section_general() {
    animations["intro_glide"].remove("#numbers > .datapoint");

    const dur = 1000;
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

function section_mean() {
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
}

function section_mean_finish() {
    const dur = 1000

    anime({
        targets: '#section_mean > .plussign',
        translateX: real_SW/2,
        translateY: -100,
        delay: anime.stagger(dur/N),
        easing: 'easeInOutQuad',
        duration: dur
    });
    anime({
        targets: '#result_mean_1',
        translateY: real_SH + 100,
        easing: 'easeInOutQuad',
        duration: dur,
        delay: dur
    });
}

function section_mean_2() {
    const middleHeight = 100;
    const dur = 1000;
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
}

function section_mean_2_finish() {
    const dur = 1000;
    anime({
        targets: '#result_mean_2',
        translateY: real_SH + 100,
        easing: 'easeInOutQuad',
        duration: dur,
    });
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

function section_general_dividers(type=0) {
    const dur = 1000;
    const x = padding+(STATS["median_pos"]-1)*(SW/N);
    anime({
        targets: '#dividers > #median',
        translateX: [x, x],
        translateY: [-500, real_SH / 2],
        easing: 'easeInOutQuad',
        duration: dur,
    });
}

function section_general_dividers_clear() {
    const dur = 1000;
    const x = padding+(STATS["median_pos"]-1)*(SW/N);
    anime({
        targets: '#dividers > #median',
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
            { scale: 2, rotate: "0deg", translateY: real_SH/2 + 200, duration: 1000, delay: 250, easing: 'easeInOutQuad' },
        ],
        delay: delaypereach*N/2,
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

function section_general_alt() {
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

// execution
dom_init()
setTimeout(() => {
    anim_intro()
}, 100);

// events
let section = 0;
const maxsections = 8;

function proceed_event(e) {
    section += 1;
    section = Math.min(maxsections, section);
    document.querySelector("#current_section_counter").innerHTML = section;

    switch (section) {
        case 1:
            change_title("Ordering");
            section_general();
            break;
            
        case 2:
            change_title("Mean");
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
            change_title("Median");
            section_mean_2_finish();
            setTimeout(() => {
                section_general_index();
            }, 500);
            break;
        
        case 5:
            section_general_dividers();
            section_median();
            break;
        
        case 6:
            section_general();
            section_general_dividers_clear();
            section_general_index_clear();
            break;

        case 7:
            change_title("Mode");
            section_general_alt();
            break;

        case 8:
            section_mode();
            break;

        default:
            break;
    }
}

document.querySelector("#section_counter").innerHTML = maxsections;