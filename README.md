# Introduction
It is an prototype for Face recognization based attendance marking for hostel. 

This project uses facial recognition to recognize students and mark attendance in Hostels. The project has it's core Image processing exposed through a Flask API. This Flask API is used to register a face and authenticate a face. 

The Images for use by the Image processing API are captured using a camera which is interfaced with a Single Board Computer such as a Raspberry Pi. A client script gets the input from a user and grabs an image from the connected camera and sends it to the Image Processing API further processing.

The face recognition library extracts 128 facial features and creates an array of 128 elements. If any other image is converted and if the Euclidean distance between two face arrays is less than a tolerance value then it is considered a match. Once the image is matched the attendance record is generated and added in the MongoDB. 

There are APIs for staff and student login with different levels of access to view, analyze and edit the attendance records in a secure authentication way using JWT.

# Create a similar setup
1. Clone or download this repo.
2. Create a new MongoDB instance and change the mongodb url inside the backend code.
3. Host the backend NodeJS server and use that link in the python flask application.
4. Then run the python application.

# Technology Stack Used
Languages : Python, JavaScript(ES6)
Frameworks Used : Flask, ExpressJS
Database : MongoDB Community Edition
Operating System : Ubuntu 16.04 LTS
IDE : Visual Studio
DB Management Tools : Compass
API tool : Postman

# Contributions
Contributions are welcome. Please read the [contributions guide](CONTRIBUTING.md) for more information.

# License
Copyright 2018 Face-Recognization.