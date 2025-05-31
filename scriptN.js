console.log('Lets go');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let res = await fetch(`./${folder}/songs.json`);
    songs = await res.json();

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" width="34" src="img/music.svg">
            <div class="info"><div>${song}</div><div>Yash</div></div>
            <div class="playnow"><span>Play Now</span><img class="invert" src="img/play2.svg"></div></li>`;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info div").innerText.trim());
        });
    });
    return songs;
}

function playMusic(track, pause = false) {
    currentSong.src = `./${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        document.querySelector("#play").src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

async function displayAlbums() {
    let res = await fetch("./albums.json");
    let folders = await res.json();
    let cardContainer = document.querySelector(".cardContainer");
    for (let folder of folders) {
        let a = await fetch(`./songs/${folder}/info.json`);
        let info = await a.json();
        cardContainer.innerHTML += `<div data-folder="songs/${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11.5" fill="#1ed760"/>
                    <path d="M9.5 8L16.5 12L9.5 16V8Z" fill="#000"/>
                </svg>
            </div>
            <img src="./songs/${folder}/Cover.jpg" alt="">
            <h2>${info.tittle}</h2>
            <p>${info.description}</p>
        </div>`;
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            songs = await getSongs(item.currentTarget.dataset.folder);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);
    await displayAlbums();

    document.querySelector("#play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.querySelector("#play").src = "img/pause.svg";
        } else {
            currentSong.pause();
            document.querySelector("#play").src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
