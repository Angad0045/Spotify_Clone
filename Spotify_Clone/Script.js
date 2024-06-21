console.log("This is JS!");

let currentSong = new Audio();
let songs;
let currentFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder
    //SONGS LOAD
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="/Images/Music.svg">
        <div class="info">
        <div>${song.replaceAll("%20", " ")}</div>
        <div>Angad1141</div>
        </div>
        <div class="playnow">
        <img class="invert" src="/Images/Play_Song.svg">
        </div></li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}

const playMusic = (track, paused = false) => {
    currentSong.src = `/${currentFolder}/` + track;
    if (!paused) {
        currentSong.play();
        play.src = "/Images/Pause.svg"
    }
    document.querySelector(".song-info").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00/00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/Songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-Container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Songs")) {
            let folderName = (e.href.split("/").slice(-2)[0]);
            //GET META DATA OF FOLDER
            let a = await fetch(`http://127.0.0.1:3000/Songs/${folderName}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card" data-folder="${folderName}">
            <div class="play">
                <img src="/Images/Play_Button.png">
            </div>
            <img src="/Songs/${folderName}/cover.jpg">
            <h3>${response.title}</h3>
            <p>${response.description}</p></div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(item.currentTarget.dataset.folder);
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
}

async function main() {
    await getSongs("Songs/CS");
    playMusic(songs[0], true)
    console.log(songs);

    //TO DISPLAY ALUMBS
    displayAlbums();

    //PLAY PAUSE SONGS
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/Images/Pause.svg"
        } else {
            currentSong.pause();
            play.src = "/Images/Play_Song.svg"
        }
    })

    //SONG TIME / DURATION 
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //SEEKBAR
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //RESPONSIVENESS
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-140%";
    })

    //PREVIOUS SONG
    previous.addEventListener("click", () => {
        console.log("Previous Clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs, index);
        if ((index - 1 >= 0)) {
            playMusic(songs[index - 1])
        }
    })

    //NEXT SONGS
    next.addEventListener("click", () => {
        console.log("next Clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs, index);
        if ((index + 1 < songs.length)) {
            playMusic(songs[index + 1])
        }
    })

    //VOLUME CONTROL
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("/Images/Volume_High.svg")){
            e.target.src = e.target.src.replace("/Images/Volume_High.svg", "/Images/Mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("/Images/Mute.svg", "/Images/Volume_High.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })
}
main();