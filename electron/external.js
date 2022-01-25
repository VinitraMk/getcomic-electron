const shell = require("electron").shell

function openInBrowser(url) {
    shell.openExternal(url);
}


module.exports = {
    openInBrowser
}