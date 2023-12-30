function call(n) {
    if (n == 1) {document.getElementById('textArea').innerHTML = "This page contains links to information about the superconducting research project."}
    if (n == 2) {document.getElementById('textArea').innerHTML = "This button links to the inventory and storage information of the imec superconducting laboratory."}
    if (n == 3) {document.getElementById('textArea').innerHTML = "This button serves as a placeholder for future information."}
    if (n == 4) {document.getElementById('textArea').innerHTML = "This button serves as a placeholder for future information."}
}

function change(name) {
    location.href = name;
}