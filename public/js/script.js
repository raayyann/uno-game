const socket = io();

const enterName = () => {
    swal({
        title: "Masukan Nama Anda",
        content: "input",
        button: {
            text: "Masuk",
            closeModal: false,
        },
    }).then((name) => {
        if (!name || !name.trim()) return enterName();
        socket.emit("name", name);
        swal.close();
    });
};
enterName();

const start = document.querySelector("#start");
const room = document.querySelector("#room");
const game = document.querySelector("#game");

const switchPage = (id) => {
    start.style.display = "none";
    room.style.display = "none";
    game.style.display = "none";
    document.querySelector("#" + id).style.display = "block";
};

const joinRoom = document.querySelector("#join-room");
const roomNameInput = document.querySelector("#room-name-input");
const roomName = document.querySelector("#room-name");
const startGame = document.querySelector("#start-game");
const playerList = document.querySelector("#player-list");
const discardedCard = document.querySelector("#discarded-card");
const cardList = document.querySelector("#card-list");
const cardCount = document.querySelector("#card-count");
const msg = document.querySelector("#msg");
const draw = document.querySelector("#draw");

let end = false;

// Event Listener

joinRoom.addEventListener("click", () => {
    if (!roomNameInput.value.trim()) return;
    joinRoom.style.display = "none";
    roomName.textContent = "Room - " + roomNameInput.value;
    socket.emit("joinRoom", roomNameInput.value);
});

startGame.addEventListener("click", () => {
    startGame.style.display = "none";
    socket.emit("start");
});

draw.addEventListener("click", () => {
    socket.emit("draw");
});

// Socket.io Event Listener

socket.on("joinedRoom", (data) => {
    switchPage("room");
    if (data === "owner") {
        startGame.style.display = "block";
    }
});

socket.on("joinError", (data) => {
    swal({
        title: "Tidak bisa join room",
        text: data,
    });
    joinRoom.style.display = "block";
});

socket.on("startError", (data) => {
    swal({
        title: "Tidak bisa memulai game",
        text: data,
    });
    startGame.style.display = "block";
});

socket.on("updateUser", (data) => {
    playerList.innerHTML = "";
    data.forEach((pName) => {
        let player = document.createElement("li");
        playerList.appendChild(player);
        player.outerHTML = `<li class="list-group-item">${pName}</li>`;
    });
});

socket.on("start", () => {
    switchPage("game");
});

socket.on("dc", () => {
    if (!end) {
        swal({
            title: "Seseorang terputus dari server",
        }).then(() => {
            window.location.reload();
        });
    }
});

socket.on("alert", (data) => {
    swal({
        title: data,
    });
});

socket.on("msg", (data) => {
    msg.textContent = data;
});

socket.on("updateDiscarded", (data) => {
    discardedCard.src = `img/cards/${data[0]}-${data[1]}.png`;
});

socket.on("updateCards", (data) => {
    cardList.innerHTML = "";
    data.forEach((c, i) => {
        let card = document.createElement("div");
        cardList.appendChild(card);
        if (c[1] < 13) {
            card.outerHTML = `<div class="col-1" id="card-${i}">
                                <img src="img/cards/${c[0]}-${c[1]}.png" width="100%" />
                                </div>`;
            document
                .querySelector("#card-" + i)
                .addEventListener("click", () => {
                    socket.emit("play", i);
                });
        } else {
            card.outerHTML = `<div class="col-1" id="card-${i}">
                                <img src="img/cards/${c[1]}.png" width="100%" />
                            </div>`;
            document
                .querySelector("#card-" + i)
                .addEventListener("click", () => {
                    swal("Pilih Warna", {
                        buttons: {
                            0: "Merah",
                            1: "Kuning",
                            2: "Biru",
                            3: "Hijau",
                        },
                    }).then((v) => {
                        if (v != null) {
                            socket.emit("play", [i, parseInt(v)]);
                        }
                    });
                });
        }
    });
});

socket.on("updateCardsCount", (data) => {
    cardCount.innerHTML = "";
    Object.entries(data).forEach((p) => {
        let player = document.createElement("li");
        cardCount.appendChild(player);
        player.outerHTML = `<li class="list-group-item">${p[0]} - ${p[1]} Kartu</li>`;
    });
});

socket.on("end", (data) => {
    end = true;
    swal({
        title: "Permainan Berakhir",
        text: data + " memenangkan permainan",
    }).then(() => {
        window.location.reload();
    });
});

// temp
socket.on("joinedRoom", (data) => console.log("joinedRoom: ", data));
socket.on("joinError", (data) => console.log("joinError: ", data));
socket.on("updateUser", (data) => console.log("updateUser: ", data));
socket.on("start", (data) => console.log("start: ", data));
socket.on("updateDiscarded", (data) => console.log("updateDiscarded: ", data));
socket.on("updateCards", (data) => {
    data.forEach((c, i) => {
        console.log("updateCards " + i + ":", c);
    });
});
socket.on("dc", (data) => console.log("dc: ", data));
socket.on("msg", (data) => console.log("msg: ", data));
socket.on("end", (data) => console.log("end: ", data));
socket.on("updateCardsCount", (data) =>
    console.log("updateCardsCount: ", data)
);
