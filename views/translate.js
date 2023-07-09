var wrapper=document.getElementById("wrapper")
const resContainer=document.getElementById('resContainer')
const textarea = document.getElementById("translateme");
const original = document.getElementById("originalText");
const languageUpdate=document.getElementById('languageupdate');

// handling socket.io response
const socket = io({ reconnection: false });

// generating room 
const uniqueId2 = Math.floor(Math.random() * Date.now()).toString();
socket.emit('joinRoom', uniqueId2);

// checking if textarea is already cleared or not
let isFieldsCleared = false;

socket.on('message', function (data) {
   if (data) {
    wrapper.classList.add('d-none')
    resContainer.style.display = "block";
    loaderImg.style.display = "none"
    
    if (!isFieldsCleared) {
      textarea.value = "";
      original.value = "";
      isFieldsCleared = true;
    }

    // textarea.value = ""
    // original.value = ""

    // adding received data to textarea
    textarea.value += `${data.message.translate}\n`;
    original.value += data.message.originalText;

    // hide loading image after execution done.
    loaderImg.style.display = "none"

  } else {
    console.log(data);
  }

})


// clear textarea with button
document.getElementById("clear").addEventListener('click', (e) => {
  e.preventDefault()
  textarea.value = ""
  original.value = ""

})

// updating data if something error
document.getElementById("update").addEventListener("click", (e) => {
  e.preventDefault()

  wrapper.classList.remove('d-none')
  resContainer.style.display = "none";
  loaderImg.style.display = "block"
  const reqUpdateText = original.value;
  const language = languageUpdate.value;
  const url = "http://localhost:3000/translate"


  const updateBody = new FormData()
  updateBody.append("reqUpdateText", reqUpdateText)
  updateBody.append("updatelanguage", language)
  updateBody.append('userid', uniqueId2)

  

  const xhr = new XMLHttpRequest()
  xhr.open('POST', url, true)
  xhr.onload = function () {

    var updateReq=document.getElementById("updateReq")

    if (xhr.status !== 200) {

      const updateResponse = JSON.parse(xhr.responseText)
      resContainer.style.display = "block";
      loaderImg.style.display = "none"
      wrapper.classList.add('d-none')
      updateReq.innerHTML=updateResponse.message
     
    } else {
      // preventing duplicating text
      document.getElementById("translateme").value = ""
      document.getElementById("originalText").value = ""
      updateReq.innerHTML=""
    }
  }
  xhr.send(updateBody)
})

// download file as a pdf using cdn link
function downloadAsPdf() {
  const element = textarea.value;
  html2pdf().from(element).set({ filename: 'translate', margin: 10 }).save();
}

// convert text to doc format using cdn link
function convertToDoc() {
  const element = textarea.value;
  html2pdf().from(element).set({ margin: 1, filename: 'translate.doc' }).output('datauristring').then((pdfString) => {
  const doc = new jsPDF();
  doc.text(10, 10, 'Converting HTML to DOC');
  doc.addHTML(pdfString, 10, 20, {
    pagesplit: true,
    background: '#fff'
  }, () => {
      doc.save('translate.doc');
  });
  });
}

function speakText() {
  var text = textarea.value;
  var utterance = new SpeechSynthesisUtterance(text);
  // Optional: Customize speech synthesis options
  utterance.lang = 'hi';
  utterance.rate = .8;

  speechSynthesis.speak(utterance);

  speech.synthesize(text, function (blob) {
    var audioUrl = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'audio.mp3';
    link.click();
    URL.revokeObjectURL(audioUrl);
  });
}
// stop speaking
function stopSpeaking() {
  speechSynthesis.cancel();
}

function Export2Doc(element, filename = '') {
  var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
  var postHtml = "</body></html>";
  var html = preHtml + document.getElementById(element).value + postHtml;

  var blob = new Blob([
    '\ufeff', html
  ], { type: 'application/msword' });
  var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
  filename = filename ? filename + '.doc' : 'document.doc';
  var downloadLink = document.createElement("a");

  document.body.appendChild(downloadLink);

  if (navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {

    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.click();
  }

  document.body.removeChild(downloadLink);
}

let clickCount = 0;
let buttonDisabled = false;

document.getElementById("getAudio").addEventListener("click", (e) => {
  e.preventDefault()

  if (buttonDisabled) {
  return; // Exit if the button is disabled
}

clickCount++;

if (clickCount >= 3) {
  alert("maximum click reached")
  buttonDisabled = true;
  clickCount = 0;

  setTimeout(() => {
    buttonDisabled = false;
  }, 30000); // Enable the button after 30 seconds
}



  const mp3Text = textarea.value;
  const url = "http://localhost:3000/translate"
  const xhr = new XMLHttpRequest()
  const audioBody = new FormData()
  audioBody.append('audio', mp3Text)
  audioBody.append('userid', uniqueId2)



  xhr.open("POST", url, true)
  xhr.responseType = "blob";
  
  xhr.onload = function () {
    console.log("receving data please wait")
    const audioBlob = xhr.response;
    const audioUrl = URL.createObjectURL(audioBlob);


    const downloadLink = document.createElement("a");
    downloadLink.href = audioUrl;
    downloadLink.download = "audio.mp3";

    downloadLink.click();
    URL.revokeObjectURL(audioUrl);
  }
  xhr.send(audioBody)


})