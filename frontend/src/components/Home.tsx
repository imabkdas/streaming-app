import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    const roomId = uuidv4();

    return (
        <div>
            <h1>Home Page</h1>
            <button onClick={() => navigate(`/room/${roomId}`)}>Join Room</button>
        </div>
    )
}

export default Home;