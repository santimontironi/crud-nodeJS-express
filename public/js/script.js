const formEliminar = document.querySelector(".form-eliminar")
const btnLogout = document.querySelector(".btnLogout")

btnLogout.addEventListener("click", mensajeLogout)
formEliminar.addEventListener("submit",mensajeEliminar)

function mensajeEliminar(e){
    e.preventDefault()

    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            form.submit()
        }
    })
}

function mensajeLogout(){
    Swal.fire({
        title: '¿Estás seguro de cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/logout'
        }
    })
}