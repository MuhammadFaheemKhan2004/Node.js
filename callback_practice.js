function doSomethingLater(callback) {
    console.log("Start: doing something...");

    setTimeout(() => {
        console.log("Finished work inside setTimeout");
       callback("look"); // run the callback after 2 seconds
    }, 5000);
    console.log("Ohters thing are going :")
}

doSomethingLater((result="nice") => {
    console.log("Callback called with:", result);
});
