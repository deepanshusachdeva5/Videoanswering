import { FaceMesh } from "@mediapipe/face_mesh";
import React, { useRef, useEffect , useState} from "react";
import * as tf from '@tensorflow/tfjs'
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import './App.css'
import Question from './components/question';
import questions from './questions.json'
import ResultTable from './components/result';



function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  

  const THRESHOLD = 0.90;
  const [data, setData] = useState([])

  const [loaded, setLoaded] = useState(false)
  const [checkResult, setCheckResults] = useState(false)
  const [GenerateResult, setGenerateResult] = useState(false)
  const [currentIndex, setCurrentIndex] =  useState(0);
  const [currAnswer, setCurrAnswer] = useState('')
  const [allAnswers, setAllAnswers] = useState([])
  
  const [model, setModel] = useState(null);

  var camera = null;
  function onResults(results) {

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    
    const landmarks = results.multiFaceLandmarks[0];
    if (landmarks) {
      // Append new points
      const newPoints = landmarks.reduce((acc, point) => {
        acc.push(point.x, point.y, point.z);
        return acc;
      }, []);

      
      // Append new points to data
      setData(prevData => {
        const updatedData = [...prevData, newPoints];
        
        // Keep only the last 30 entries
        if (updatedData.length > 30) {
          return updatedData.slice(updatedData.length - 30);
        } else {
          return updatedData;
        }
      });
    }
  }

  useEffect(() => {

    

    
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);

    if (
      typeof(webcamRef.current) !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          if(webcamRef.current !== null){
          await faceMesh.send({ image: webcamRef.current.video });}
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);


  const handleResultClick = ()=>{

        setGenerateResult(true)

  }
  const handlePredictClick = async () =>{

      console.log(model)
      if(model != null){

          const tensor = tf.tensor(data).expandDims()
          const pred = await model.predict(tensor).data()
          console.log(pred)

          const maxIndex = tf.tensor1d(pred).argMax().dataSync()[0];

          if(pred[maxIndex] >= THRESHOLD){
            if(maxIndex ==0){
              setCurrAnswer("Yes");
            }
            else{
              setCurrAnswer("No");
            }
            const timestamp = new Date(); 
            const formattedTimestamp = timestamp.toLocaleTimeString();
            setAllAnswers((prevAnswers) => [
              ...prevAnswers,
              { answer: currAnswer, timestamp: formattedTimestamp },
            ]);
            if(currentIndex < 9){
              setCurrentIndex((prev) => {return prev+1});
            }
            else{
              setCheckResults(true);
            }
        }
        


      }

  }

  const handleLoadClick = async  () =>{

    console.log("Model loading.....")
    tf.loadLayersModel("https://raw.githubusercontent.com/deepanshusachdeva5/tfjs_Face_detector/main/model3/model.json").then((mdl)=> {setModel(mdl); setLoaded(true);}).catch((e)=> {console.log(e)})
  }


  return (
      <div className="App">
        <header className="App-header">
          <div className='question-container'>
              {loaded && !checkResult  ? <div><Question question={questions[currentIndex]}></Question><button  onClick={handlePredictClick}>Predict</button><h2>You Answered: {currAnswer}</h2></div>: null }
              {!loaded && !checkResult ? <div><button onClick={handleLoadClick}><h2>Load Questions</h2></button></div>: null}
              {checkResult && <button className='check-Result' onClick={handleResultClick}> Generate Result</button>}
          </div>
          {!checkResult && <div className='webcam-container'><Webcam ref={webcamRef} className='webcam'></Webcam>
              <canvas ref={canvasRef} className='canvas'></canvas></div>}
          {GenerateResult && <ResultTable allAnswers={allAnswers} questions={questions} />}

            <div className="buttons" >
              
              
            </div>
        </header>
      
    </div>
  );
}

export default App;