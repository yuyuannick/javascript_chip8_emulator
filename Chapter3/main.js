function loadROM() {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", "./Space Invaders [David Winter].ch8", true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function (e) {
        let view = new Uint8Array(this.response);
        console.log(view);
    };
    xhr.send();
};
loadROM();