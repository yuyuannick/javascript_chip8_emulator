const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const chip8Machine = document.querySelector(".chip8Machine");
const keyBoard = document.querySelectorAll(".keyBoard > div");

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
let PC = MEMORY_START_ADDRESS;
let SP = null;
let fps = 300;
let scale = 10;
changeScale();



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



function ExecCode_Extend_F() {
    switch (Opcode & 0x00FF) {
        case 0x0007:
            V[x] = Delay_timer;
            break;
        case 0x000A: //按鍵操作
            if (Keyboard[0]) {
                V[x] = 0;
            }
            else if (Keyboard[1]) {
                V[x] = 1;
            }
            else if (Keyboard[2]) {
                V[x] = 2;
            }
            else if (Keyboard[3]) {
                V[x] = 3;
            }
            else if (Keyboard[4]) {
                V[x] = 4;
            }
            else if (Keyboard[5]) {
                V[x] = 5;
            }
            else if (Keyboard[6]) {
                V[x] = 6;
            }
            else if (Keyboard[7]) {
                V[x] = 7;
            }
            else if (Keyboard[8]) {
                V[x] = 8;
            }
            else if (Keyboard[9]) {
                V[x] = 9;
            }
            else if (Keyboard[10]) {
                V[x] = 10;
            }
            else if (Keyboard[11]) {
                V[x] = 11;
            }
            else if (Keyboard[12]) {
                V[x] = 12;
            }
            else if (Keyboard[13]) {
                V[x] = 13;
            }
            else if (Keyboard[14]) {
                V[x] = 14;
            }
            else if (Keyboard[15]) {
                V[x] = 15;
            }
            else {
                PC -= 2;
            }
            break;
        case 0x0015:
            Delay_timer = V[x];
            break;
        case 0x0018:
            Sound_timer = V[x];
            break;
        case 0x001E:
            I += V[x];
            break;
        case 0x0029:
            I = (V[x] * 5);
            break;
        case 0x0033:
            Memory[I] = V[x] / 100;
            Memory[I + 1] = V[x] / 10 % 10;
            Memory[I + 2] = V[x] % 10;
            break;
        case 0x0055:
            for (let i = 0; i <= x; i++) {
                Memory[I + i] = V[i];
            }
            break;
        case 0x0065:
            for (let i = 0; i <= x; i++) {
                V[i] = Memory[I + i];
            }
            break;

    }

}


function ExecCode_Extend_E() {
    switch (Opcode & 0x00FF) {
        case 0x009E:
            if (Keyboard[V[x]]) {
                PC += 2;
            }
            break;
        case 0x00A1:
            if (!Keyboard[V[x]]) {
                PC += 2;
            }
            break;
    }
}


function ExecCode_Extend_Eight() {
    let tmp;
    switch (Opcode & 0x000f) {
        case 0x0000:
            V[x] = V[y];
            break;
        case 0x0001:
            V[x] |= V[y];
            break;
        case 0x0002:
            V[x] &= V[y];
            break;
        case 0x0003:
            V[x] ^= V[y];
            break;
        case 0x0004:
            tmp = V[x] + V[y];
            V[0x0f] = false;
            if (tmp > 0xff) {
                V[0x0f] = true;
            }
            V[x] = tmp;
            break;
        case 0x0005:
            V[0x0F] = false;
            if (V[x] > V[y]) {
                V[0x0f] = true;
            }
            V[x] = V[x] - V[y];
            break;
        case 0x0006:
            V[0x0F] = V[x] & 0b00000001;
            V[x] /= 2;
            break;
        case 0x0007:
            V[0x0F] = V[y] > V[x];
            V[x] = V[y] - V[x];
            break;
        case 0x000E:
            V[0x0F] = V[x] & 0b10000000;
            V[x] *= 2;
            break;
    }
}


function ExecCode_Extend() {
    switch (Opcode & 0xF000) {
        case 0x1000:
            PC = nnn;
            break;
        case 0x2000:
            SP += 1;
            Stack[SP] = PC;
            PC = nnn;
            break;
        case 0x3000:
            if (V[x] == kk) {
                PC += 2;
            }
            break;
        case 0x4000:
            if (V[x] != kk) {
                PC += 2;
            }
            break;
        case 0x5000:
            if (V[x] == V[y]) {
                PC += 2;
            }
            break;
        case 0x6000:
            V[x] = kk;
            break;
        case 0x7000:
            V[x] += kk;
            break;
        case 0x8000:
            ExecCode_Extend_Eight();
            break;
        case 0x9000:
            if (V[x] != V[y]) {
                PC += 2;
            }
            break;
        case 0xA000:
            I = nnn;
            break;
        case 0xB000:
            PC = nnn + V[0];
            break;
        case 0xC000:
            V[x] = Math.floor((Math.random() * 255)) & kk;
            break;
        case 0xD000:
            let xPos = V[x] % 64;
            let yPos = V[y] % 32;
            V[0xF] = 0;
            for (let row = 0; row < n; ++row) {
                for (let col = 0; col < 8; ++col) {
                    if (Memory[I + row] & (0b10000000 >> col)) //
                    {
                        if (Pixels[yPos + row][xPos + col]) //要畫得像素，是否已經是true
                        {
                            V[0xF] = 1;
                        }
                        Pixels[yPos + row][xPos + col] ^= true;
                    }
                }
            }
            break;

        case 0xE000:
            ExecCode_Extend_E();
            break;
        case 0xF000:
            ExecCode_Extend_F();
            break;

    }

}


function ExecCode() {
    nnn = (Opcode & 0x0FFF);
    n = (Opcode & 0x000F);
    x = ((Opcode & 0x0F00) >> 8);
    y = ((Opcode & 0x00F0) >> 4);
    kk = (Opcode & 0x00FF);

    switch (Opcode) {
        case 0x00E0:
            for (let row = 0; row < 32; row++) {
                for (let col = 0; col < 64; col++) {
                    Pixels[row][col] = false;
                }
            }
            break;
        case 0x00EE:
            PC = Stack[SP];
            SP--;
            break;
        default:
            ExecCode_Extend();
            break;

    }
}


function gameLoop() {
    ctx.fillStyle = "#687FE5";
    ctx.fillRect(0, 0, 64 * scale, 32 * scale);
    ctx.fillStyle = "#FCD8CD";

    for (let row = 0; row < 32; row++) {
        for (let col = 0; col < 64; col++) {
            if (Pixels[row][col]) {
                ctx.fillRect(col * scale, row * scale, scale, scale);
            }

        }
    }

    //  ctx.fillRect(scale, scale, scale + 50, scale + 50);

    if (Delay_timer > 0) {
        Delay_timer -= 1;
    }
    if (Sound_timer > 0) {
        Sound_timer -= 1;
    }


    Opcode = Memory[PC] << 8 | Memory[PC + 1];
    PC += 2; //指向下兩個位置
    ExecCode();
    setTimeout(gameLoop, (1000 / fps));
}


function saveToMemory(view) {
    //放入內建字元
    for (let i = 0; i < 80; i++) {
        Memory[i] = Fontset[i];
    }
    //放入ROM檔案
    for (let i = 0; i < view.length; i++) {
        Memory[i + MEMORY_START_ADDRESS] = view[i];
    }
    gameLoop()
}


function loadROM() {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", "./Space Invaders [David Winter].ch8", true);
    //./pong2.ch8
    //./Space Invaders [David Winter].ch8
    xhr.responseType = "arraybuffer";
    xhr.onload = function (e) {
        let view = new Uint8Array(this.response);
        saveToMemory(view);
    };
    xhr.send();
};
loadROM();




function chip8SpriteMoveStart(key) {
    switch (key) {
        case 49:
            Keyboard[1] = true;
            break;
        case 50:
            Keyboard[2] = true;
            break;
        case 51:
            Keyboard[3] = true;
            break;
        case 52:
            Keyboard[12] = true;
            break;
        case 65:
            Keyboard[7] = true;
            break;
        case 67:
            Keyboard[11] = true;
            break;
        case 68:
            Keyboard[9] = true;
            break;
        case 69:
            Keyboard[6] = true;
            break;
        case 70:
            Keyboard[14] = true;
            break;
        case 81:
            Keyboard[4] = true;
            break;
        case 82:
            Keyboard[13] = true;
            break;
        case 83:
            Keyboard[8] = true;
            break;
        case 86:
            Keyboard[15] = true;
            break;
        case 87:
            Keyboard[5] = true;
            break;
        case 88:
            Keyboard[0] = true;
            break;
        case 90:
            Keyboard[10] = true;
            break;
        default:
            break;
    }
}
function chip8SpriteMoveEnd(key) {
    switch (key) {
        case 49:
            Keyboard[1] = false;
            break;
        case 50:
            Keyboard[2] = false;
            break;
        case 51:
            Keyboard[3] = false;
            break;
        case 52:
            Keyboard[12] = false;
            break;
        case 65:
            Keyboard[7] = false;
            break;
        case 67:
            Keyboard[11] = false;
            break;
        case 68:
            Keyboard[9] = false;
            break;
        case 69:
            Keyboard[6] = false;
            break;
        case 70:
            Keyboard[14] = false;
            break;
        case 81:
            Keyboard[4] = false;
            break;
        case 82:
            Keyboard[13] = false;
            break;
        case 83:
            Keyboard[8] = false;
            break;
        case 86:
            Keyboard[15] = false;
            break;
        case 87:
            Keyboard[5] = false;
            break;
        case 88:
            Keyboard[0] = false;
            break;
        case 90:
            Keyboard[10] = false;
            break;
        default:
            break;
    }
}

function keyboardOption() {
    keyBoard.forEach(e => {
        e.addEventListener("mousedown", (e) => {
            chip8SpriteMoveStart(parseInt(e.target.dataset.key));

        })
        e.addEventListener("mouseup", (e) => {
            chip8SpriteMoveEnd(parseInt(e.target.dataset.key));
        })
    })

    window.addEventListener("keydown", (event) => {
        chip8SpriteMoveStart(event.keyCode);
    });

    window.addEventListener("keyup", (event) => {
        chip8SpriteMoveEnd(parseInt(event.keyCode));

    });
}
keyboardOption();






function changeScale() {
    if (chip8Machine.offsetWidth >= 640) {
        scale = 10;
        canvas.width = 640;
        canvas.height = 320;
    } else {
        let w = chip8Machine.offsetWidth;
        scale = w / 64

        canvas.width = w;
        canvas.height = w / 2;

    }
}

window.addEventListener("resize", changeScale);
