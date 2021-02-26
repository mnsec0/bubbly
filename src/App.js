import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import * as B from 'react-bootstrap';

const axios = require('axios').default;

function getNotes() {
    return axios.get('http://127.0.0.1:5010/getNotes')
        .then(function(response) { return response.data; })
        .catch(function(error) { console.log(error); });
}

function getNote(id) {
    return axios.post('http://127.0.0.1:5010/getNote',
        {'noteid': id})
        .then(function(response) { return response.data; })
        .catch(function(error) { console.log(error); });
}

function updateNote(id, title, content) {
    return axios.post('http://127.0.0.1:5010/updateNote',
        {'noteid': id, 'title': title, 'content': content})
        .then(function(response) { return response.data; })
        .catch(function(error) { console.log(error) });
}

function createNote(title, content) {
    return axios.post('http://127.0.0.1:5010/createNote',
        {'title': title, 'content': content})
        .then(function(response) { return response.data; })
        .catch(function(error) { console.log(error); });
}

function deleteNote(id) {
    return axios.post('http://127.0.0.1:5010/deleteNote',
        {'noteid': id})
        .then(function(response) { return response.data; })
        .catch(function(error) { console.log(error); });
}

function AllNotes(props) {
    const [notes, setNotes] = useState([]);
    useEffect(() => {
        getNotes().then(function(result) { setNotes(result); });
    }, []);
    return (
        <B.Row className="mt-3">
            <B.Col>
                <ul className="list-group list-group-flush">
                    {notes.map(n => (
                        <li key={n.noteid} className="list-group-item">
                            <h2><Link to={"/note/"+n.noteid}>{n.title}</Link></h2>
                        </li>
                    ))}
                </ul>
            </B.Col>
        </B.Row>
    );
}

function GetNote(props) {
    const id = props.match.params.id;
    const [note, setNote] = useState(null);

    useEffect(() => {
        getNote(id).then(function(result) { setNote(result); });
    }, [id]);
    if(note) {
        return (
            <B.Row className="mt-3">
                <B.Col>
                    <B.Jumbotron>
                        <h1>{note.title}</h1>
                        <p className="lead">Updated {note.lastModifiedDate}</p>
                    </B.Jumbotron>
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                </B.Col>
            </B.Row>
        );
    } else {
        return null;
    }
}

function CreateNote(props) {
    const [title, setTitle] = useState(null);
    const [content, setContent] = useState(null);
    const [saved, setSaved] = useState(false);
    const [noteid, setNoteid] = useState(null);
    if(saved && noteid) {
        return (<Redirect to={"/note/"+noteid}/>);
    } else {
        return (
            <B.Row className="mt-3">
                <B.Col>
                    <B.Form>
                        <B.Form.Group>
                            <B.Form.Control type="text" size="lg" onChange={(e) => setTitle(e.target.value)}/>
                        </B.Form.Group>
                        <B.Form.Group>
                            <B.Form.Control style={{fontFamily: "monospace"}} as="textarea" rows={20} onChange={(e) => setContent(e.target.value)}>
                            </B.Form.Control>
                        </B.Form.Group>
                        <B.Button onClick={() => { if(title && title !== "") { createNote(title, content).then(function(noteid) { setSaved(true); setNoteid(noteid); })}}}>Save</B.Button>
                    </B.Form>
                </B.Col>
            </B.Row>
        );
    }
}

function EditNote(props) {
    const id = props.match.params.id;
    const [note, setNote] = useState(null);
    const [title, setTitle] = useState(null);
    const [content, setContent] = useState(null);
    const [saved, setSaved] = useState(false);
    useEffect(() => {
        getNote(id).then(function(result) {
            setNote(result);
            setTitle(result.title);
            setContent(result.content);
        });
    }, [id]);
    if(saved) {
        return (<Redirect to={"/note/"+id}/>);
    } else {
        if(note) {
            return (
                <B.Row className="mt-3">
                    <B.Col>
                        <B.Form>
                            <B.Form.Group>
                                <B.Form.Control type="text" size="lg" defaultValue={note.title} onChange={(e) => setTitle(e.target.value)}/>
                            </B.Form.Group>
                            <B.Form.Group>
                                <B.Form.Control style={{fontFamily: "monospace"}} as="textarea" rows={20} onChange={(e) => setContent(e.target.value)}>
                                    {note.content}
                                </B.Form.Control>
                            </B.Form.Group>
                            <B.Button onClick={() => { if(title !== "") { updateNote(id, title, content); setSaved(true); }}}>Save</B.Button>
                        </B.Form>
                    </B.Col>
                </B.Row>
            );
        } else {
            return null;
        }
    }
}

function DeleteNote(props) {
    deleteNote(props.match.params.id);
    return (<Redirect to="/"/>);
}

function DeleteEditButtons(props) {
    const noteid = props.match.params.id;
    return (
        <>
            <Link to={"/delete/"+noteid}>
                <B.Button className="ml-3" variant="danger">Delete this note</B.Button>
            </Link>
            <Link to={"/edit/"+noteid}>
                <B.Button className="ml-3" variant="secondary">Edit this note</B.Button>
            </Link>
        </>
    );
}

function CreateNoteButton(props) {
    return (<Link to={"/createNote"}><B.Button>Create note</B.Button></Link>)
}

function App() {
    return (
        <div className="container">
            <Router>
                <B.Navbar bg="light" expand="lg">
                    <Link to="/" component={B.Navbar.Brand}>Bubbly</Link>
                    <B.Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <B.Navbar.Collapse id="basic-navbar-nav">
                        <B.Nav className="mr-auto">
                            <Link to="/" component={B.Nav.Link}>Home</Link>
                        </B.Nav>
                        <CreateNoteButton/>
                        <Switch>
                            <Route path="/note/:id" component={DeleteEditButtons}/>
                        </Switch>
                    </B.Navbar.Collapse>
                </B.Navbar>
                <Switch>
                    <Route path="/note/:id" component={GetNote}/>
                    <Route path="/edit/:id" component={EditNote}/>
                    <Route path="/delete/:id" component={DeleteNote}/>
                    <Route path="/createNote" component={CreateNote}/>
                    <Route path="/" component={AllNotes}/>
                </Switch>
            </Router>
        </div>
    );
}

export default App;

