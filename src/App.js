import logo from './logo.svg';
import './App.css';
import * as tf from '@tensorflow/tfjs'
import * as facemesh from '@tensorflow-models/facemesh'
import Webcam from 'react-webcam'
import { useRef, useState, useEffect } from 'react';
import Question from './components/question';
import questions from './questions.json'


function App() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)


  const [nosePoint, setNosePoint] = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);

  const [currentIndex, setCurrentIndex] =  useState(0);
  const [currAnswer, setCurrAnswer] = useState('')
  const [questionDisplayed, setQuestionDisplayed] = useState(true)


  // useEffect(()=>{
  //   setNosePoint([])

  // },[currAnswer] )

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
        // console.log(face)
        // console.log(face[0].faceInViewConfidence)
        if(face[0].faceInViewConfidence >=0.9){

          
          const noseTip = face[0].annotations.noseTip;
    
          // console.log(noseTip)
          // Update the nosePoint state with the new noseTip coordinates
          setNosePoint((prevNosePoint) => {
            // console.log("======================")
            // console.log(noseTip)
            const newNosePoint = [...prevNosePoint, noseTip];
    
            // Limit the array length to 100
            if (newNosePoint.length > 100) {
              // Remove the first 10 elements
              return newNosePoint.slice(10);
            }
    
            return newNosePoint;
          });
          
        }

        // console.log(nosePoint.length)
        
        // if(nosePoint.length >=5){

        //   const [started, x_change, y_change] = checkMovementStart()
        //   // console.log(started, x_change, y_change)
        //   if(started){
        //       if(x_change > y_change){
        //         setCurrAnswer('No')
        //       }
        //       else{
        //         setCurrAnswer('Yes')
        //       }
              

        //   }
        // }
        

      }

  }



  const checkMovementStop = () =>{

    var x_change = false
    var y_change = false

    var x_min = 10000
    var x_max = 0

    var y_min = 10000
    var y_max = 0
    
    for(var i = 0;i < 5;i++){
        if(nosePoint[i][0][1] < y_min){

            y_min = nosePoint[i][0][1]
        }
        if(nosePoint[i][0][1] > y_max){

          y_max = nosePoint[i][0][1]
        }
        if(nosePoint[i][0][0] < x_min){

        x_min = nosePoint[i][0][0]
      }
      if(nosePoint[i][0][0] > x_max){

        x_max = nosePoint[i][0][0]
      }

    }
    x_change = Math.abs(x_min - x_max) <=10
    y_change = Math.abs(y_min - y_max) <=10

    return x_change && y_change


  }
  const checkMovementStart= () =>{

      var x_change = false
      var y_change = false

      var x_min = 10000
      var x_max = 0

      var y_min = 10000
      var y_max = 0
      
      for(var i = 0;i < nosePoint.length;i++){
          if(nosePoint[i][0][1] < y_min){

              y_min = nosePoint[i][0][1]
          }
          if(nosePoint[i][0][1] > y_max){

            y_max = nosePoint[i][0][1]
          }
          if(nosePoint[i][0][0] < x_min){

          x_min = nosePoint[i][0][0]
        }
        if(nosePoint[i][0][0] > x_max){

          x_max = nosePoint[i][0][0]
        }

      }
      x_change = Math.abs(x_min - x_max) >10
      y_change = Math.abs(y_min - y_max) >10

      return [x_change || y_change, Math.abs(x_min - x_max), Math.abs(y_min - y_max)]

  }

//   const handleNextClick = ()=>{

//     setCurrentIndex((prevIndex) => prevIndex + 1);
//     setCurrAnswer('');
//     setNosePoint([])
//     setQuestionDisplayed(false)
    
// }
  const handleNextClick = ()=>{

      
      if(nosePoint.length >=20){

        //console.log(lastThreePoints)
        var flag = true;
        var x_max = 0;
        var x_min = 100000;

        var y_max = 0;
        var y_min = 100000;

        // console.log(nosePoint)
        for(var i = nosePoint.length-1; i>nosePoint.length-20 ;i--){

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

        //console.log(Math.abs(max - min))
        flag = Math.abs(x_max- x_min) < Math.abs(y_max - y_min)

          setCurrAnswer(flag ? 'Yes' : 'No');
          setTimeout(() => {
            setCurrentIndex((prevIndex) => {if (prevIndex < 9){return prevIndex + 1}});
            setCurrAnswer('')
          }, 200);
          
          setQuestionDisplayed(false)
      }
      else{
        setCurrAnswer('')
        setQuestionDisplayed(false)
      }
      setNosePoint([])
      if(nosePoint.length === 0){
        console.log("======================== Emptied ===============")
      }
      // runFaceMesh()
  }

  runFaceMesh()

  return (
    <div className="App">
      <header className="App-header">

        <div className='question-container'>
            <Question question={questions[currentIndex]}></Question>
            
            <button className='next-button' onClick={handleNextClick}> Next</button>
        </div>
        <h2>You Answered: {currAnswer}</h2>
        <Webcam ref={webcamRef} className='webcam'></Webcam>
        <canvas ref={canvasRef} className='canvas'></canvas>
        
      </header>
    </div>
  );
}

export default App;
