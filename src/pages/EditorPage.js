import React, {useEffect, useRef, useState} from "react";
import toast from 'react-hot-toast';
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import ACTIONS from "../Action";
import {useLocation, useNavigate, Navigate, useParams} from 'react-router-dom';

const EditorPage = () => {

    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const {roomId} = useParams();
    const reactNavigator = useNavigate();

    const[clients, setClients] = useState([]);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();       //connects client to server
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later');
                reactNavigator('/');  //redirect to home page
            }
            socketRef.current.emit(ACTIONS.JOIN, {        //use to send roomid
                   roomId,
                    username: location.state?.username,
            });

            //Listening for joined event
            socketRef.current.on(ACTIONS.JOINED, 
                ({clients, username, socketId}) => {
                    //apart from the user who joined send it to other clients
                    if(username !== location.state?.username) {          
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId
                    }); //sync the code
                }
            );

            //Listening fro disconnected
            socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, username}) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => {
                    return prev.filter(
                        (client) => client.socketId !== socketId
                    );
                });
            })
        };
        init();
        //cleaning function to clear listeners
        return () => {
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
            socketRef.current.disconnect();
        }
    }, []);
    
    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID copied to clipboard');
        } catch(err) {
            toast.error('Could not copy Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');

    }

    if(!location.state) {
        return <Navigate to="/" />;      //redirect to home page if username not found 
    }
    

    return <div className="mainWrap">

        <div className="aside">
            <div className="asideInner"> 
                <div className="logo">
                    <img src="/code-sync.png" alt="logo" className="logoImage"/>
                </div>
                <h3>Connected</h3>
                <div className="clientsList">
                    {clients.map((client) => (
                        <Client 
                            key={client.socketId}
                            username={client.username}
                        />
                    ))}
                </div>
            </div>
            
            <button className="btn copyBtn" onClick={copyRoomId}>COPY ROOM ID</button>
            <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
        </div>
        <div className="editorWrap">
            <Editor 
            socketRef={socketRef} 
            roomId={roomId} 
            onCodeChange={(code) => {codeRef.current = code;}}/>
        </div>
    </div>
    
}

export default EditorPage
