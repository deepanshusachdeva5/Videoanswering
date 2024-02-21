# Installation
## Step1: Clone this repository using the command:
git clone https://github.com/deepanshusachdeva5/Videoanswering.git

## Step2: Move inside the cloned repository
cd Videoanswering

## Step3: Build the Docker Image
docker build -t videoanswering:1 . 

## Step4: Run the Docker Image
docker run -p 3000:3000 videoanswering:1


# Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

