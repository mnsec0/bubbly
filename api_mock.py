from flask import Flask, request
from flask_cors import CORS
import json
import datetime
import uuid

app = Flask("Bubbly API Mock")
CORS(app)

uuid1 = str(uuid.uuid4())
uuid2 = str(uuid.uuid4())

notes = {
        uuid1: {
            'noteid': uuid1, 
            'title': 'This is a title',
            'lastModifiedDate': datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d %H:%M:%S"),
            'content': '## This is the note content\n\nIn *markdown* format.'
            },
        uuid2: {
            'noteid': uuid2, 
            'title': 'This is a another title',
            'lastModifiedDate': datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d %H:%M:%S"),
            'content': '## This is the note content\n\nIn *markdown* format.'
            }
        }

@app.route("/getNotes", methods=["get"])
def getNotes():
    return json.dumps(list(notes.values()))

@app.route("/getNote", methods=["post"])
def getNote():
    noteid = request.json['noteid']
    if noteid in notes:
        return json.dumps(notes[noteid])
    else:
        return "{}"

@app.route("/createNote", methods=["post"])
def createNote():
    title = request.json['title']
    content = request.json['content']
    noteid = str(uuid.uuid4())
    notes[noteid] = {'noteid': noteid, 'title': title, 'content': content, 
            'lastModifiedDate': datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d %H:%M:%S")}
    return noteid 

@app.route("/updateNote", methods=["post"])
def updateNote():
    noteid = request.json['noteid']
    title = request.json['title']
    content = request.json['content']
    if noteid in notes:
        notes[noteid] = {'noteid': noteid, 'title': title, 'content': content, 
                'lastModifiedDate': datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d %H:%M:%S")}
        return "OK"
    else:
        return "Not found"

@app.route("/deleteNote", methods=["post"])
def deleteNote():
    noteid = request.json['noteid']
    if noteid in notes:
        del notes[noteid]
        return "OK"
    else:
        return "Not found"

if __name__ == "__main__":
    app.run(port=5010)

