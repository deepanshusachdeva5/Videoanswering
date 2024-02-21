import logo from './logo.svg';
import './App.css';
import * as tf from '@tensorflow/tfjs'
import * as facemesh from '@tensorflow-models/facemesh'
import Webcam from 'react-webcam'
import { useRef, useState, useEffect } from 'react';
import Question from './components/question';
import questions from './questions.json'
import ResultTable from './components/result';

function App() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)


  const [nosePoint, setNosePoint] = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const [loaded, setLoaded] = useState(false)


  const [center, setCenter] = useState([])
  const [currentIndex, setCurrentIndex] =  useState(0);
  const [currAnswer, setCurrAnswer] = useState('')
  const [questionDisplayed, setQuestionDisplayed] = useState(true)
  const [allAnswers, setAllAnswers] = useState([])
  const [checkResult, setCheckResults] = useState(false)
  const [GenerateResult, setGenerateResult] = useState(false)
  const Next = "Submit"
  const Loading = "Loading the Questions for you! Please Wait..."

  const [countdown, setCountdown] = useState(30);

  useEffect(()=>{


    if(currAnswer!== ""){
      setAllAnswers((prevAnswers)=> [...prevAnswers, currAnswer])
    }

  }, [currAnswer])
 

  const handleResultClick = () =>{
      setGenerateResult(true)

  }
  const runFaceMesh = async() => {

      const net = await facemesh.load({

          inputResolution: {width: 640, height: 480},
          scale: 0.8, 

      })
      
      setInterval(()=>{detect(net)}, 100)


  }

  const detect = async(net)=>{

      if(typeof(webcamRef.current !== "undefined") && webcamRef.current !== null && webcamRef.current.video.readyState === 4 ){
        const video = webcamRef.current.video
        const videoWidth = webcamRef.current.video.videoWidth
        const videoHeight = webcamRef.current.video.videoHeight
        
        webcamRef.current.video.width = videoWidth
        webcamRef.current.video.height = videoHeight
        
        canvasRef.current.width = videoWidth
        canvasRef.current.height = videoHeight

        const face = await net.estimateFaces(video)
        if(typeof(face[0]) !== 'undefined' && face[0].faceInViewConfidence >=0.9){

          
          const noseTip = face[0].annotations.noseTip;
    

          if (center.length === 0 && noseTip.length !== 0) {

            setCenter((prevCenter) => {
              if (prevCenter.length === 0) {
                
                return [noseTip[0], noseTip[1]];
              } else {
                return prevCenter;
              }
            });
          }
          setNosePoint((prevNosePoint) => {
            const newNosePoint = [...prevNosePoint, noseTip];
    
            // Limit the array length to 100
            if (newNosePoint.length > 100) {
              // Remove the first 10 elements
              return newNosePoint.slice(10);
            }
    
            return newNosePoint;
          });
          
        }
        if(nosePoint.length >=30){
          setLoaded(true)
        }


        

      }

  }

  const handleNextClick = ()=>{

      
      if(nosePoint.length >=30){

        var flag = true;
        var x_max = 0;
        var x_min = 100000;

        var y_max = 0;
        var y_min = 100000;

        for(var i = nosePoint.length-1; i>nosePoint.length-30 ;i--){

            if(nosePoint[i][0][1]> y_max){
              y_max = nosePoint[i][0][1]
            }
            if(nosePoint[i][0][1] < y_min){
              y_min = nosePoint[i][0][1]
            }
            if(nosePoint[i][0][0]> x_max){
              x_max = nosePoint[i][0][0]
            }
            if(nosePoint[i][0][0] < x_min){
              x_min = nosePoint[i][0][0]
            }

        }

        
        flag = Math.abs(center[0][0]- x_max) < Math.abs(center[0][1] - y_max)

          setCurrAnswer(flag ? 'Yes' : 'No');
          
          setTimeout(() => {
            setCurrentIndex((prevIndex) => {if (prevIndex < 9){return prevIndex + 1} else{setCheckResults(true); setLoaded(false); return prevIndex}});
            setCurrAnswer('')
          }, 200);
          
          setQuestionDisplayed(false)
      }
      else{
        setCurrAnswer('')
        setQuestionDisplayed(false)
      }

  }

  runFaceMesh()
 
  return (
    <div className="App">
      <header className="App-header">

        <div className='question-container'>
            {loaded && !checkResult  ? <div><Question question={questions[currentIndex]}></Question><button className='next-button' onClick={handleNextClick}><h2 className='button-text'>Next</h2></button><h2>You Answered: {currAnswer}</h2></div>: null }
            {!loaded && !checkResult ? <div><h1>Loading the Questions, please wait!</h1><h2>Wait Time: 40 Seconds</h2></div>: null}
            {checkResult && <button className='check-Result' onClick={handleResultClick}> Generate Result</button>}
        </div>
        
        { !checkResult && <div className='webcam-container'><Webcam ref={webcamRef} className='webcam'></Webcam>
        <canvas ref={canvasRef} className='canvas'></canvas></div>}
        {GenerateResult && <ResultTable allAnswers={allAnswers} questions={questions} />}
        
      </header>
    </div>
  );
}

export default App;
