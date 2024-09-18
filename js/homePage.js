let currentTeamStatus = true;

function summonTeamPopup() {
    currentTeamStatus = !currentTeamStatus;

    if (currentTeamStatus) {
        document.getElementById("teamInfo").classList.add("minimized");
    } else {
        document.getElementById("teamInfo").classList.remove("minimized");
    }

}

function scrollToArticle() {
    document.querySelector('#article').scrollIntoView({
        behavior: 'smooth'
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    const jumpingArrow = document.getElementById('jumpingArrow');
    if (jumpingArrow) {
        jumpingArrow.addEventListener('click', scrollToArticle);
    }
});