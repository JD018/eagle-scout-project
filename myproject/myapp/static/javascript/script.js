function call(n) {
    if (n == 1) {document.getElementById('textArea').innerHTML = "This page contains the current inventory data of NeoCity Academy's MakerLab."}
    if (n == 2) {document.getElementById('textArea').innerHTML = "This page allows students to check in and out of the MakerLab."}
    if (n == 3) {document.getElementById('textArea').innerHTML = "This button serves as a placeholder for future information."}
}

function change(name) {
    location.href = name;
}