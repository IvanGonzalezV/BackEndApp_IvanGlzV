function getCookies(e) {

    e.preventDefault()

    fetch("/cookies/getCookies").then( 
         async res => {
            console.log( await res.json())
        }
    )

}

const getCookiesButton = document.getElementById("getCookies")

getCookiesButton.addEventListener("click", getCookies)

var socket = io();

socket.on('newCartId', function(cartId) {
    // Guardar el cartId en una cookie
    document.cookie = `cartId=${cartId};`;
});