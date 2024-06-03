const socket = io()

const botonConfirmar = document.getElementById("button-confirm")
const createProductsForm = document.getElementById("createProductsForm")
const productsDiv = document.getElementById("products")
const productsHandlebarsDiv = document.getElementById("productsHandlebars")
const deleteButtons = document.querySelectorAll(".button-delete")

//EVENTS

botonConfirmar.addEventListener("click", (event)=>{

    event.preventDefault()

    const formData = new FormData(createProductsForm)

    const title = formData.get("title")
    const description = formData.get("description")
    const price = formData.get("price")
    const stock = formData.get("stock")
    const category = formData.get("category")
    const status = formData.get("status")

    const formDataValues = [title, description, price, stock, category, status]    

    socket.emit("addProduct", formDataValues)
})

productsDiv.addEventListener("click", (e)=>{

    if(e.target.tagName === "BUTTON"){

        let productId = e.target.dataset.productid

        console.log(productId)

        socket.emit("deleteProduct", productId)

    }
})

//SOCKETS

socket.on("getProducts", (data)=>{

    if(productsHandlebarsDiv){
        productsHandlebarsDiv.remove()
    }

    productsDiv.innerHTML = ""

    for(const product of data){

        let productCard = document.createElement("div")

        productCard.innerHTML = `<div class="card">
            <span>titulo: ${product.title}</span>
            <span>descripcion: ${product.description}</span>
            <span>precio: $ ${product.price}</span>
            <span>stock: ${product.stock}</span>
            <span>categoria: ${product.category}</span>
            <span>thumbnails: ${product.thumbnails}</span>
            <span>status: ${product.status}</span>
            <span>id: ${product._id}</span>
            <button class="button-delete" data-productid=${product._id}>X</button>
        </div>`

        productsDiv.appendChild(productCard)
    }
})

socket.on("errorOnCreation", data=> {
    
    Toastify({
        text: data,
        gravity: "bottom",
        position: "right",
        duration: 3000
    }).showToast();

})



