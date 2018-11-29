import os
import json
from flask import Flask, render_template, request
from werkzeug.utils import secure_filename
import requests
from face_recog import app
import numpy as np
import face_recognition
from datetime import datetime
import cv2
import urllib

camera_port = 0
ramp_frames = 30
camera = cv2.VideoCapture(camera_port)

@app.route('/',methods = ['POST', 'GET'])
@app.route('/home',methods = ['POST', 'GET'])
def home():
    return render_template('index.html')

@app.route('/upload',methods = ['POST', 'GET'])
def upload():
    return render_template('page1.html')

@app.route('/uploader', methods = ['GET', 'POST'])
def uploader():
   if request.method == 'POST':
      num = request.form.get('roll')
      if(len(num) == 10):
            camera = cv2.VideoCapture(camera_port)
            for i in range(ramp_frames):
                temp = get_image()
            print("Taking image...")
            camera_capture = get_image()
            file = "E:\\"+num+".jpg"
            cv2.imwrite(file, camera_capture)
            del(camera)
            known_image = face_recognition.load_image_file("E:\\"+num+".jpg")
            biden_encodings = face_recognition.face_encodings(known_image)
            if len(biden_encodings) > 0:
                biden_encoding = biden_encodings[0]
                np.savetxt('E:\\'+num+'.txt', biden_encoding)
                return render_template('page1.html', msg = "Updated Succesfully")
            else:
                return render_template('page1.html', msg = "image not recognised..  please retry.")
      else:
          return render_template('page1.html', msg = "Enter a valid number")

          

@app.route('/comp',methods = ['POST', 'GET'])
def comp():
    return render_template('page2.html')

@app.route('/compare',methods = ['POST', 'GET'])
def compare_img():
   if request.method == 'POST':
       num = request.form.get('roll')
       if(len(num) == 10):
            camera = cv2.VideoCapture(camera_port)
            for i in range(ramp_frames):
                temp = get_image()
            print("Taking image...")
            camera_capture = get_image()
            file = "E:\\unknown.jpg"
            cv2.imwrite(file, camera_capture)
            del(camera)
            unknown_image = face_recognition.load_image_file("E:\\unknown.jpg")
            biden_encoding = np.loadtxt('E:\\'+num+'.txt')
            unknown_encodings = face_recognition.face_encodings(unknown_image)
            if len(unknown_encodings) > 0:
                unknown_encoding = unknown_encodings[0]
            else:
                return render_template('page2.html', msg = "image not recognised..  please retry.")
            results = face_recognition.compare_faces([biden_encoding], unknown_encoding,tolerance=0.6)
            os.remove('E:\\unknown.jpg')
            if(np.array_equal(results,np.array([True,]))):
                date = datetime.now()
                obj = {"roll": num, "day": date.day, "month": date.month, "year": date.year, "hour": date.hour, "minute": date.minute}
                res = requests.request('post', 'http://127.0.0.1:3000/postdata', json = obj)
                return render_template('page2.html', msg = res.content.decode("utf-8"))
            else:
                return render_template('page2.html', msg = 'forged image or retry again..')
       else:
            return render_template('page2.html', msg = "enter a valid number")

def get_image():
    retval, im = camera.read()
    return im