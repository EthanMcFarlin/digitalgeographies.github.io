let currentTeamStatus = true;

function summonTeamPopup() {
    currentTeamStatus = !currentTeamStatus;

    if (currentTeamStatus) {
        document.getElementById("teamInfo").classList.add("minimized");
    } else {
        document.getElementById("teamInfo").classList.remove("minimized");
    }

}