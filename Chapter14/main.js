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
let fps = 3;


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
    Opcode = Memory[PC] << 8 | Memory[PC + 1];
    PC += 2; //指向下兩個位置
    console.log(Opcode.toString(16))
    // setTimeout(gameLoop, (1000 / fps));
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
    xhr.responseType = "arraybuffer";
    xhr.onload = function (e) {
        let view = new Uint8Array(this.response);
        saveToMemory(view);
    };
    xhr.send();
};
loadROM();





