const socket = io()

const productsDiv = document.getElementById("products")

productsDiv.addEventListener("click", (e)=>{

    if(e.target.tagName === "BUTTON"){

        let productId = e.target.dataset.productid

        socket.emit("addToCart", productId)

    }
})

socket.on("addedSuccessfully", data =>{

    Toastify({
        text: `El producto fue añadido al carrito exitosamente (id: ${data})`,
        gravity: "bottom",
        position: "right",
        duration: 3000
    }).showToast()

})