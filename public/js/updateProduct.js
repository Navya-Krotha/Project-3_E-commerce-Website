var to_be_updated;

$(document).ready(function () {
    $('.update').on('click', function() {
        productId = $(this).attr('id');
        $.ajax({
            url: '/product/productById',
            method: 'POST',
            data: { "id": productId },
            success: function(response) {
                to_be_updated = response.productId;
                $('#updateProductId').attr("value", response.productId);
                $('#updateProductName').attr("value", response.productName);
                $('#updateDescription').attr("value", response.description);
                $('#updatePrice').attr("value", response.price);
                $('#updateCategory').attr("value", response.category);
                $('#updateImage').attr("value", response.productImage);
                $('#Modal').modal({ show: true });
            },
            error: function(error)  {
                alert("No data for productId: "+ productId);
            }
        });
    });

    $('#update_product').on('click', function (e) {                
        e.preventDefault();
        var formData = $('#updateProductForm').serialize();
        console.log('Form data: ', JSON.stringify(formData));
        $.ajax({
            url: '/product/updateProduct',
            method: 'PUT',
            data: formData,
            success: function(response) {
                console.log("Product updated successfully");
                setTimeout(function () {
                    window.location.reload()
                }, 500);
            },
            error: function () {
                alert('Not able to update product');
            }
        });
    });

    $('.delete').on('click', function (e) {
        e.preventDefault();
        const productId = $(this).attr('id');                
        console.log("Delete clicked on: ", productId);
        var response = confirm("Do you want to delete product: "+ productId);
        if(response) {
            $.ajax({
                type: 'DELETE',
                url: '/product/deleteProduct',
                method: 'delete',
                data: { "productId": productId },
                success: function(response) {
                    console.log("Response: ", response);
                    setTimeout(function () {
                        window.location.reload()
                    }, 300);
                },
                error: function(response) {
                    alert("No data found");
                }
            });
        }
    });
})