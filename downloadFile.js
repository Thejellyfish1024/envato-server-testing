const {Downloader} = require("nodejs-file-downloader");

(async () => {
  //Wrapping the code with an async function, just for the sake of example.

  const downloader = new Downloader({
    url: "https://video-previews.elements.envatousercontent.com/h264-video-previews/4b774153-194e-44ef-b992-6d5f62798cb9/22085761.mp4", //If the file name already exists, a new file with the name 200MB1.zip is created.
    directory: "./temp",  //This folder will be created, if it doesn't exist.   
    onProgress: function (percentage, chunk, remainingSize) {
        //Gets called with each chunk.
        console.log("% ", percentage);
        // console.log("Current chunk of data: ", chunk);
        console.log("Remaining bytes: ", remainingSize);
      },
  });
  try {
    const {filePath,downloadStatus} = await downloader.download(); //Downloader.download() resolves with some useful properties.

    console.log("All done");
  } catch (error) {
    //IMPORTANT: Handle a possible error. An error is thrown in case of network errors, or status codes of 400 and above.
    //Note that if the maxAttempts is set to higher than 1, the error is thrown only if all attempts fail.
    console.log("Download failed", error);
  }
})();