
const path = require('path')
const fs = require('fs')
const pdf = require("pdf-parse")
const translateme = require('google-translate-api-x');


const { broadCast } = require("../socket.js")

const Tesseract = require('tesseract.js');
const { createAudioFile } = require('simple-tts-mp3');




const apiXTranslate = async function (data, language, userid,res) {
    // for translation we need only three things 
    // data & language  for transation
    // userid which is unique so that we can get to know which user is requesting for translation
    
    try {
        //  processing data for translation
        const result = await translateme(data, { to: language, autoCorrect: true, rejectOnPartialFail: false });
           
        // broadCast(result.text)    
        broadCast({ translate: result.text, originalText: data, userid: userid })

    } catch (e) {
        console.log(e)
        res.status(400).json({message:"Language not supported"})
    }

}



const dataLoop = async function (sentences, language, userid,res) {
    // we will loop data here and one by one will be sent for translation.
    try {
        //   const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        for (let i = 0; i < sentences.length; i++) {
            // await delay(1000);

            // sending array for translation to google api-x package.
            await apiXTranslate(sentences[i], language, userid,res);
            
        }
    } catch (e) {
        res.status(400).json({ message: "failed to translate" })
    }

};



const splitParagraph = async function (paragraph) {
    const maxCharacters = 500;
    const sentences = paragraph.replace(/\s+/g, ' ').split(/(?<=[.!?])\s*/);
  
    const result = [];
    let currentSentence = '';
  
    for (const sentence of sentences) {
      if (currentSentence.length + sentence.length <= maxCharacters) {
        currentSentence += sentence + ' ';
      } else {
        result.push(currentSentence.trim());
        currentSentence = sentence + ' ';
      }
    }
  
    if (currentSentence.trim() !== '') {
      
 
      result.push(currentSentence.trim());
    }
  
 
    return result;
  };
  





const extractData = async function (req, res) {
    const userid = req.body.userid;

    if (req.body.language) {
        // getting user's selected language
        const language = req.body.language
        // getting user's file
        const reqFile = req.file;
        // extracting filename
        const filename = reqFile.originalname;
        // setting up file path where file will be stored for temprory
        const filepath = path.join(__dirname, `./../upload/${filename}`)
        // extracting file extension name
        const extname = filename.split(".")
        // exect file extension name;
        const filextension = extname[extname.length - 1]

        // so if user have pdf file then this code will be executed
        if (filextension == 'pdf') {

            // extracting data from pdf file
            const fileData = await pdf(filepath)
            // storing extracted data into a variable
            const paragraph = fileData.text;
            // deleting file bcz we no longer need this
            fs.unlink(filepath, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    // console.log(filepath)
                    // console.log("file has been deleted successfully")
                 
                }
            })
           
            // spliting extracted data into array of sentences 
            const sentences = await splitParagraph(paragraph)
            // console.log(sentences)
            // sending data for looping array so that i can translate longer paragraph as well.
            await dataLoop(sentences, language, userid,res)

            //  if user have uploaded another file format then this code will be executed 
        } else {
            // exectracting data from png file or jpeg file
            const extractText = await Tesseract.recognize(filepath, 'eng', { logger: e => console.log(e) })
            // storind data into a variable
            const paragraph = extractText.data.text
            // deleting file like as previous 
            fs.unlink(filepath, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    // console.log("file has been deleted successfully")
                }
            })
            // spliting extracted data into array of sentences 
            const sentences = await splitParagraph(paragraph)
            // sending data for looping array so that i can translate longer paragraph as well.
            await dataLoop(sentences, language, userid)
        }


        // if user have requested update data 
    } else if (req.body.updatelanguage) {
        // getting the user's text
        const paragraph = req.body.reqUpdateText;
        // getting user's selected language
        const language = req.body.updatelanguage;
        // spliting extracted data into array of sentences
        const sentences = await splitParagraph(paragraph)
        // sending data for looping array so that i can translate longer paragraph as well.    
        await dataLoop(sentences, language, userid)


        // if user has request for audio file then this code will be executed
    } else if (req.body.audio) {
        // setting up where the generated audio file will be save for temp.
        const filepath = path.join(__dirname, `./../audio/`)
        // setting up file name here we are using user's unique id for audio file.
        const filename = req.body.userid
        // generating a audio file
        createAudioFile(req.body.audio, path.join(filepath, filename));
        // getting generated audio file path for sending it to client side.
        const newFile = `${filepath}/${filename}.mp3`

        setTimeout(() => {
            // checking if file path exists or not
            if (!fs.existsSync(filepath)) {
                fs.mkdirSync(filepath, { recursive: true });
            }
            // reading file data
            fs.readFile(newFile, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    // sending file to client side with status code 200
                    res.status(200).send(data)
                }
            })
            // deleting file after sending audio file to client side.
            fs.unlink(newFile, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    // console.log("audio file has been deleted")
                }
            })

        }, 3000)


    }
}




module.exports = { extractData }