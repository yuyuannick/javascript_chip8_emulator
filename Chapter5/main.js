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



function loadROM() {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", "./Space Invaders [David Winter].ch8", true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function (e) {
        let view = new Uint8Array(this.response);
        console.log("view[0]:", view[0], "/2進位制：", view[0].toString(2), "/16進位制：", view[0].toString(16));
        console.log("view[1]:", view[1], "/2進位制：", view[1].toString(2), "/16進位制：", view[1].toString(16));
        Opcode = (view[0] << 8) | view[1];
        console.log("操作碼", Opcode.toString(16));
    };
    xhr.send();
};
loadROM();