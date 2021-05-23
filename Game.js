class Game {
    constructor(players) {
        this.players = players;
        this.turn = 0;
        this.reverse = false;
        this.shuffle();
        this.updateDiscarded(this.getRandomCard(false));
        this.playerInit();
    }

    emitAllPlayer(e, d) {
        this.players.forEach((p) => {
            p.emit(e, d);
        });
    }

    playerInit() {
        this.players.forEach((p) => {
            this.updateCards(p);
            p.emit("msg", this.players[0].name + " sedang berjalan");
            p.on("play", (c) => {
                if (isNaN(c)) {
                    this.play(p, c[0], c[1]);
                } else {
                    this.play(p, c);
                }
            });
            p.on("draw", () => {
                this.draw(p);
            });
            p.on("disconnect", () => {
                this.emitAllPlayer("dc");
            });
        });
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    getRandomCard(action = true) {
        let color = this.random(0, 3);
        if (!action) {
            return [color, this.random(0, 9)];
        }
        let value = this.random(0, 14);
        if (value >= 13) {
            return [null, value];
        }
        return [color, value];
    }

    play(p, cI, clr = null) {
        if (p === this.players[this.turn]) {
            let c = p.cards[cI];
            if (this.checkCard(c)) {
                p.cards.splice(cI, 1);
                if (c[1] >= 13) {
                    c[0] = clr;
                    this.updateTurn();
                    this.updateDiscarded(c);
                    this.updateCards(p);
                } else {
                    if (c[1] === 11) {
                        if (this.players.length > 2) {
                            this.reverse = !this.reverse;
                        } else {
                            this.updateTurn();
                        }
                    }
                    if (c[1] === 10) {
                        this.updateTurn();
                        this.updateTurn();
                    } else {
                        this.updateTurn();
                    }
                    this.updateDiscarded(c);
                    this.updateCards(p);
                }
            }
        }
    }

    draw(p) {
        if (p === this.players[this.turn]) {
            let card = this.getRandomCard();
            p.cards.push(card);
            this.emitAllPlayer("alert", p.name + " mengambil Kartu");
            this.updateCards(p);
            this.updateTurn();
        }
    }

    shuffle() {
        this.players.forEach((p) => {
            let cards = [];
            for (let i = 0; i < 7; i++) {
                cards[i] = this.getRandomCard();
            }
            p.cards = cards;
        });
    }

    updateCards(p) {
        p.emit("updateCards", p.cards);
        if (p.cards.length === 0) {
            this.emitAllPlayer("end", p.name);
        }
        this.updateCardsCount();
    }

    updateDiscarded(c) {
        this.discarded = c;
        if (c[1] === 12) {
            for (let i = 0; i < 2; i++) {
                this.players[this.turn].cards.push(this.getRandomCard());
            }
            this.updateCards(this.players[this.turn]);
            this.emitAllPlayer(
                "alert",
                this.players[this.turn].name + " mengambil 2 kartu"
            );
            this.updateTurn();
        }
        if (c[1] === 14) {
            for (let i = 0; i < 4; i++) {
                this.players[this.turn].cards.push(this.getRandomCard());
            }
            this.updateCards(this.players[this.turn]);
            this.emitAllPlayer(
                "alert",
                this.players[this.turn].name + " mengambil 4 kartu"
            );
            this.updateTurn();
        }
        this.players.forEach((p) => {
            p.emit("updateDiscarded", this.discarded);
        });
    }

    updateTurn() {
        if (!this.reverse) {
            if (this.turn < this.players.length - 1) {
                this.turn++;
            } else {
                this.turn = 0;
            }
        } else {
            if (this.turn > 0) {
                this.turn--;
            } else {
                this.turn = this.players.length - 1;
            }
        }
        this.emitAllPlayer(
            "msg",
            this.players[this.turn].name + " sedang berjalan"
        );
    }

    checkCard(c) {
        if (c[1] < 13) {
            if (c[0] === this.discarded[0]) {
                return true;
            }
            if (c[1] === this.discarded[1]) {
                return true;
            }
            return false;
        }
        return true;
    }

    updateCardsCount() {
        let playersCard = {};
        this.players.forEach((p) => {
            playersCard[p.name] = p.cards.length;
        });
        this.emitAllPlayer("updateCardsCount", playersCard);
    }
}

module.exports = Game;
