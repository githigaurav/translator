const formData=document.getElementById('formData');
const loaderImg= document.getElementById("loaderimg"); 
var langWarn = document.getElementById('langReq');

   // Sending Request in backGround without refreshing the page.
   document.getElementById("translate").addEventListener('click', (e) => {
    // preventing page refresh
    e.preventDefault()
    // formData is form container basically , it will disapper when user click translate
    formData.style.display = "none"
    // after hide the form div the loading image will be appeared  to the user
    loaderImg.style.display = "block"
    //  getting file
    const file = document.getElementById('file').files[0]
    // getting language
    const language = document.getElementById('language').value;
    // setting up  endpoint
    const url = "http://localhost:3000/translate"
    // generating room for socket.io, it has been generated from translate.ejs, bcz we have include this page that's why it's working here.
    const userid = uniqueId2;
    // creating form instance 
    const body = new FormData()
    // appending data 
    body.append('file', file)
    body.append('language', language)
    body.append('userid', uniqueId2)

    const xhr = new XMLHttpRequest()
    // setting up request type , end point and sync & async request
    xhr.open('POST', url, true)
    // receiving response
    xhr.onload = function () {
      if (xhr.status !== 200) {
        // if we get error then showing form container
        formData.style.display = "block"
        // hiding loading image 
        loaderImg.style.display = "none"
        const err = JSON.parse(xhr.responseText)  

        if (err.message === "File required") {
          langWarn.innerHTML = err.message;
        } else if (err.message === "Language  required") {
          langWarn.innerHTML = err.message;
        } else if (err.message === "Invalid file format. Only PDF, JPG, and PNG files are allowed") {
          langWarn.innerHTML = err.message;
        }else if(err.message==="Language not supported"){
          langWarn.innerHTML=`${err.message} we are working on it`
        }  
      }

    }
    // sending data
    xhr.send(body)
  }
  )
