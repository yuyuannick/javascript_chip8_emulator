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
        Opcode = (view[0] << 8) | view[1];
        nnn = (Opcode & 0x0FFF);
        n = (Opcode & 0x000F);
        x = ((Opcode & 0x0F00) >> 8);
        y = ((Opcode & 0x00F0) >> 4);
        kk = (Opcode & 0x00FF);

        console.log("取得nnn:", nnn.toString(16));
        console.log("取得n:", n.toString(16));
        console.log("取得x:", x.toString(16));
        console.log("取得y:", y.toString(16));
        console.log("取得kk:", kk.toString(16));
    };
    xhr.send();
};
loadROM();