import { useEffect, useState } from "react";
import './bossBattle.css';
import ingameBg from './assets/ingame_background_dote.png';
import player from './assets/player.png';

function Boss({bossData}) {

    useEffect(() => {
        document.body.style.backgroundImage = `url(${ingameBg})`

        return () => {
            document.body.style.backgroundImage = "none";
        }
    }, [])

    const [enemydraw, setEnemydraw] = useState('undraw');
    const [gamestate, setGamestate] = useState('ready');

    return (
        <>
        <img src={player} id="player"></img>

        <BossSelect/>
        </>
    )

    function BossSelect() {
        if(bossData.id == 0) {
            
        }
    }
}

export default Boss;