import React, {useState}  from "react"
import {v4 as uuidv4} from 'uuid';
import toast from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';


const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const createNewRoom = (e) => {
        e.preventDefault();       /*to avoid page refresh*/
        const id = uuidv4();
        setRoomId(id);
        toast.success('Created a new room');      /*sucess=>green tick*/
    };
    const joinRoom = () => {
        if(!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }
        //redirect
        navigate(`/editor/${roomId}`, {
            state: {
                username,                                                               
            },
        });
    };
    const handleInputEnter = (e) => {
        console.log('event', e.code);    //e.code tells which key is pressed
        if(e.code === 'Enter') {
            joinRoom();
        }
    }
    return <div className="homePageWrapper"> 
    
        <div className="formWrapper">
            <img className="homePageLogo" src="/code-sync.png" alt="code-sync-logo" />
            <h4 className="mainLabel">Paste Invitation room ID</h4>
            <div className="inputGroup">
                <input 
                    type="text" 
                    className="inputBox"   
                    placeholder="ROOM ID" 
                    onChange={(e)=> setRoomId(e.target.value)} 
                    value={roomId}
                    onKeyUp={handleInputEnter}
                />
                <input 
                    type="text" 
                    className="inputBox" 
                    placeholder="USERNAME" 
                    onChange={(e)=> setUsername(e.target.value)} 
                    value={username}
                    onKeyUp={handleInputEnter}
                />
                <button className="btn joinBtn" onClick={joinRoom}>Join</button>
                <span className="createInfo">
                    If you don't have an invite then create &nbsp;
                    <a onClick={createNewRoom} href="" className="createNewBtn">new room</a>
                </span>
            </div>
        </div>
        <footer> 
            <h4>Built with 💛 by  &nbsp;<a href="https://github.com/payalkate">Payal Kate</a></h4>
        </footer>
        </div>
    
}

export default Home