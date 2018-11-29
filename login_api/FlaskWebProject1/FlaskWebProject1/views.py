
from datetime import datetime
from flask import render_template, request
from FlaskWebProject1 import app
import requests
import json
import flask as flask
import os


@app.route('/', methods=['POST', 'GET'])
@app.route('/home', methods=['POST', 'GET'])
def home():
  return render_template('index.html')

@app.route('/login', methods=['POST', 'GET'])
def login():
  return render_template('page1.html')

@app.route('/userhome', methods=['POST', 'GET'])
def userhome():
  with open('C:\\Windows\\Temp\\token.json', 'r') as f:
            token = f.read()
  return render_template('page2.html', token = token)

@app.route('/user', methods=['POST', 'GET'])
def user():
    username = request.form['username']
    password = request.form['password']
    obj = {"email": username, "password": password}
    res = requests.request('post', 'http://127.0.0.1:3000/login', json = obj)
    status = res.status_code
    if(status == 404):
        error = res.content.decode("utf-8")
        return (render_template('page1.html', error = error))
    if(status == 200):
        resp_dic = json.loads(res.content)
        token = res.headers['x-auth']
        try:
            os.remove('C:\\Windows\\Temp\\token.json')
        except OSError:
            pass
        with open('C:\\Windows\\Temp\\token.json', 'w') as f:
            f.write(token)
        return (render_template('page2.html', token = token))

    return (render_template('page1.html', error = "check the values entered")) 
    

@app.route('/logout', methods=['POST','GET'])
def logout():
    with open('C:\\Windows\\Temp\\token.json', 'r') as f:
            tok = f.read()
    header = {"x-auth": tok}
    res = requests.request('DELETE', 'http://127.0.0.1:3000/logout', headers = header)
    if(res.status_code == 200):
        os.remove("C:\\Windows\\Temp\\token.json")
        return render_template('page1.html')
    return (render_template('error.html', error = res.content.decode("utf-8")))


@app.route('/user/getall', methods = ['POST', 'GET'])
def getall():
    with open('C:\\Windows\\Temp\\token.json', 'r') as f:
            tok = f.read()
    header = {"x-auth": tok}
    res = requests.get('http://127.0.0.1:3000/getdata', headers = header)
    if(res.status_code == 200):
        resp_dic = json.loads(res.content)
        leng = len(resp_dic)
        return render_template('getall.html', length = leng, resp = resp_dic)

    return render_template('error.html', error = res.content.decode("utf-8"))


@app.route('/user/byroll', methods = ['POST', 'GET'])
def byroll():
    num = request.form['roll']
    with open('C:\\Windows\\Temp\\token.json', 'r') as f:
            tok = f.read()
    header = {"x-auth": tok}
    res = requests.get('http://127.0.0.1:3000/getdatabyroll/'+num, headers = header)
    if(res.status_code == 200):
        resp_dic = json.loads(res.content)
        return render_template('getall.html',  resp = resp_dic)

    return render_template('error.html', error = res.content.decode("utf-8"))

@app.route('/user/bydate', methods = ['POST', 'GET'])
def bydate():
    date = request.form['date']
    day = date.split('-')
    url = 'http://127.0.0.1:3000/getdatabydate/' + day[2] + '/' + day[1] + '/' +day[0] + '/'
    with open('C:\\Windows\\Temp\\token.json', 'r') as f:
            tok = f.read()
    header = {"x-auth": tok}
    res = requests.get(url, headers = header)
    if(res.status_code == 200):
        resp_dic = json.loads(res.content)
        print(resp_dic)
        return render_template('getall.html',  resp = resp_dic)

    return render_template('error.html', error = res.content.decode("utf-8"))
