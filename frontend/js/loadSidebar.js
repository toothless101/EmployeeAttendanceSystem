//Kini nga function kay ginagamit para automatic ma-load ang sidebar HTML file ngadto sa page without i-copy paste ang sidebar sa tanan pages.
async function loadSidebar(){

    const response = await fetch(
        '../components/sidebar.html'
    )

    const data = await response.text()

    document.getElementById(
        'sidebar-container'
    ).innerHTML = data

}

loadSidebar()