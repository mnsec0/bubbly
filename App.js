import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import * as B from 'react-bootstrap';
import date from 'date-and-time';

const axios = require('axios').default;

function getNotes() {
    return axios.get('https://4k6u411he7.execute-api.us-east-1.amazonaws.com/getNotes')
        .then(function(response) {
            const result = response.data;
            result.sort((a,b) => date.parse(b.lastModifiedDate, "YYYY-MM-DD hh:mm:ss") - date.parse(a.lastModifiedDate, "YYYY-MM-DD hh:mm:ss"));
            return result;
        })
        .catch(function(error) { console.log(error); });
}

function updateNote(id, title, content) {
    return axios.post('https://4k6u411he7.execute-api.us-east-1.amazonaws.com/updateNote',
        {'noteid': id, 'title': title, 'content': content})
        .then(function(response) { return response.data; })
        .catch(function(error) { console.log(error) });
}

function createNote(title, content) {
    return axios.post('https://4k6u411he7.execute-api.us-east-1.amazonaws.com/createNote',
        {'title': title, 'content': content})
        .then(function(response) { return response.data; })
        .catch(function(error) { console.log(error); });
}

function deleteNote(id) {
    return axios.post('https://4k6u411he7.execute-api.us-east-1.amazonaws.com/deleteNote',
        {'noteid': id})
        .then(function(response) { return response.data; })
        .catch(function(error) { console.log(error); });
}

function App() {
    const [notes, setNotes] = useState([]);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [newNoteTitle, setNewNoteTitle] = useState(null);
    const [newNoteContent, setNewNoteContent] = useState(null);
    const refNoteTitle = useRef();
    const refNoteContent = useRef();
    const [activeTab, setActiveTab] = useState("#newnote");
    useEffect(() => {
        getNotes().then(function(result) { setNotes(result); });
    }, []);
    return (
        <div className="container">
            <div className="mt-3">
                <B.Tab.Container id="notes-tabs" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
                    <B.Row>
                        <B.Col xs={4}>
                            <img src="/bubbly.png" width={200} className="my-1"/>
                            <B.ListGroup>
                                <B.ListGroup.Item action href="#newnote">
                                    {editingNoteId ? "Edit Note" : "New Note"}
                                </B.ListGroup.Item>
                                {notes.map(n => (
                                    <B.ListGroup.Item action href={"#note_"+n.noteid} key={n.noteid}>
                                        {n.title}
                                    </B.ListGroup.Item>
                                ))}
                            </B.ListGroup>
                        </B.Col>
                        <B.Col xs={8} className="pt-3">
                            <B.Tab.Content>
                                <B.Tab.Pane eventKey="#newnote">
                                    <B.Form>
                                        <B.Form.Group>
                                            <B.Form.Control ref={refNoteTitle} type="text" size="lg"
                                                onChange={(e) => setNewNoteTitle(e.target.value)}/>
                                        </B.Form.Group>
                                        <B.Form.Group>
                                            <B.Form.Control ref={refNoteContent} style={{fontFamily: "monospace"}}
                                                as="textarea" rows={20}
                                                onChange={(e) => setNewNoteContent(e.target.value)}>
                                            </B.Form.Control>
                                        </B.Form.Group>
                                        <B.Button variant="secondary"
                                            onClick={() => {
                                                if(editingNoteId) {
                                                    setActiveTab("#note_"+editingNoteId);
                                                }
                                                setEditingNoteId(null);
                                                setNewNoteTitle(null);
                                                setNewNoteContent(null);
                                                refNoteTitle.current.value = null;
                                                refNoteContent.current.value = null;
                                            }}>
                                            Cancel
                                        </B.Button>
                                    <B.Button className="ml-3"
                                        onClick={() => { if(newNoteTitle && newNoteTitle !== "") {
                                            if(editingNoteId) {
                                                updateNote(editingNoteId, newNoteTitle, newNoteContent).then(() =>
                                                    getNotes().then(function(result) {
                                                        setNotes(result);
                                                        setActiveTab("#note_"+editingNoteId);
                                                        setEditingNoteId(null);
                                                        setNewNoteTitle(null);
                                                        setNewNoteContent(null);
                                                        refNoteTitle.current.value = null;
                                                        refNoteContent.current.value = null;
                                                    }))
                                            } else {
                                                createNote(newNoteTitle, newNoteContent).then(function(noteid) {
                                                    getNotes().then(function(result) {
                                                        setActiveTab("#note_"+noteid);
                                                        setNotes(result);
                                                        setNewNoteTitle(null);
                                                        setNewNoteContent(null);
                                                        refNoteTitle.current.value = null;
                                                        refNoteContent.current.value = null;
                                                    }); })}}}}>
                                        {editingNoteId ? "Save" : "Create"}
                                    </B.Button>
                                    </B.Form>
                                    <B.Card className="mt-3">
                                        <B.Card.Header>Preview</B.Card.Header>
                                        <B.Card.Body>
                                            <h1>{newNoteTitle}</h1>
                                            <ReactMarkdown>{newNoteContent}</ReactMarkdown>
                                        </B.Card.Body>
                                    </B.Card>
                                </B.Tab.Pane>
                                {notes.map(n => (
                                    <B.Tab.Pane eventKey={"#note_"+n.noteid} key={n.noteid}>
                                        <div>
                                            <h1>{n.title}</h1>
                                            <ReactMarkdown>{n.content}</ReactMarkdown>
                                            <p>Updated {n.lastModifiedDate}</p>
                                            <B.Button variant="secondary"
                                                onClick={() => {
                                                    setActiveTab("#newnote");
                                                    setEditingNoteId(n.noteid);
                                                    setNewNoteTitle(n.title);
                                                    setNewNoteContent(n.content);
                                                    refNoteTitle.current.value = n.title;
                                                    refNoteContent.current.value = n.content;
                                                }}>
                                                Edit this note
                                            </B.Button>
                                            <B.Button className="ml-3" variant="danger"
                                                onClick={() => deleteNote(n.noteid)
                                                        .then(() => getNotes()
                                                            .then(result => {
                                                                setActiveTab("#newnote");
                                                                setNotes(result);
                                                            }))}>
                                                Delete this note
                                            </B.Button>
                                        </div>
                                    </B.Tab.Pane>
                                ))}
                            </B.Tab.Content>
                        </B.Col>
                    </B.Row>
                </B.Tab.Container>
            </div>
        </div>
    );
}

export default App;

