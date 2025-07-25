
const MEMORY_START_ADDRESS = 0x200;

let Memory = new Uint8Array(4096); //遊戲容量
let Opcode = null;//操作碼
let FileSize = null;
let Keyboard = [
    false, false, false, false,
    false, false, false, false,
    false, false, false, false,
    false, false, false, false,
];
let Pixels = [];
for (let row = 0; row < 32; row++) {
    let tmp = [];
    for (let col = 0; col < 64; col++) {
        tmp.push(false);
    }
    Pixels.push(tmp);
}

let nnn = null;
let kk = null;
let n = null;
let x = null;
let y = null;


let V = new Uint8Array(16);
let I = null;
let Stack = new Uint16Array(16);;
let Delay_timer = null;
let Sound_timer = null;
let PC = null;
let SP = null;


//CHIP8 內建字元
let Fontset =
    [
        0xf0, 0x90, 0x90, 0x90, 0xf0, //0
        0x20, 0x60, 0x20, 0x20, 0x70, //1
        0xf0, 0x10, 0xf0, 0x80, 0xf0, //2
        0xf0, 0x10, 0xf0, 0x10, 0xf0, //3
        0x90, 0x90, 0xf0, 0x10, 0x10, //4
        0xf0, 0x80, 0xf0, 0x10, 0xf0, //5
        0xf0, 0x80, 0xf0, 0x90, 0xf0, //6
        0xf0, 0x10, 0x20, 0x40, 0x40, //7
        0xf0, 0x90, 0xf0, 0x90, 0xf0, //8
        0xf0, 0x90, 0xf0, 0x10, 0xf0, //9
        0xf0, 0x90, 0xf0, 0x90, 0x90, //A
        0xe0, 0x90, 0xe0, 0x90, 0xe0, //B
        0xf0, 0x80, 0x80, 0x80, 0xf0, //C
        0xe0, 0x90, 0x90, 0x90, 0xe0, //D
        0xf0, 0x80, 0xf0, 0x80, 0xf0, //E
        0xf0, 0x80, 0xf0, 0x80, 0x80 //F
    ];




function saveToMemory(view) {
    //放入內建字元
    for (let i = 0; i < 80; i++) {
        Memory[i] = Fontset[i];
    }
    //放入ROM檔案
    for (let i = 0; i < view.length; i++) {
        Memory[i + MEMORY_START_ADDRESS] = view[i];
    }
    console.log("Memory:", Memory);
}


function loadROM() {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", "./Space Invaders [David Winter].ch8", true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function (e) {
        let view = new Uint8Array(this.response);
        saveToMemory(view);
    };
    xhr.send();
};
loadROM();