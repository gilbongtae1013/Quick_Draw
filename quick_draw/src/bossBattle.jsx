import { useEffect, useState, useRef } from "react";
import './bossBattle.css';
import ingameBg from './assets/ingame_background_dote.png';
import player from './assets/player.png';
import player_draw from './assets/player_draw.png';
import outlaw from './assets/outlaw.png';
import outlaw_draw from './assets/outlaw_draw.png';
import outlaw_dead from './assets/outlaw_dead.png';
import bulletEffectImg from './assets/gunshot.png'; 
import pistol from './assets/pistol.mp3';
import lowHonnor from './assets/low-honor-rdr-2.mp3';
import amongkill from './assets/amongus.mp3';

// 오디오 파일 경로 import
import shotMp3 from './assets/gunshot.mp3';
import deadeyeMp3 from './assets/deadeye.mp3';

function Boss({ bossData }) {
    const amongus = new Audio(amongkill);
    const shotaudio = new Audio(shotMp3);
    const deadeyeaudio = new Audio(deadeyeMp3);
    const pistolaudio = new Audio(pistol);
    const low = new Audio(lowHonnor);

    // 🎯 타이머 관리를 위한 useRef 추가
    const drawTimerRef = useRef(null);
    const killTimerRef = useRef(null);

    const [ammo, setAmmo] = useState(5);
    const [gamestate, setGamestate] = useState('ready');
    const [playerskin, setPlayerskin] = useState(player);
    const [bosscharacter, setBosscharacter] = useState(() => {
        if (bossData.id === 0) return outlaw;
        return '';
    });
    const [clicks, setClicks] = useState([]);

    useEffect(() => {
        document.body.style.backgroundImage = `url(${ingameBg})`;
        return () => { document.body.style.backgroundImage = "none"; };
    }, []);

    // 1.5초 ~ 4초 뒤 보스가 선공 신호를 보냄
    useEffect(() => {
        const randomTime = Math.random() * (4000 - 1500) + 1500;
        drawTimerRef.current = setTimeout(() => {
            setGamestate('draw');
            const garim = document.getElementById('garim');
            if (garim) garim.classList.add('hide');
            if (bossData.id === 0) setBosscharacter(outlaw_draw);
        }, randomTime);

        return () => clearTimeout(drawTimerRef.current);
    }, [bossData.id]);

    // 데드라인 타이머
    useEffect(() => {
        if (gamestate === 'draw') {
            killTimerRef.current = setTimeout(() => {
                low.play();
                pistolaudio.play();
                deadeyeaudio.pause();
                setPlayerskin('none');
                setGamestate('lose');
            }, bossData.limitTime);

            return () => clearTimeout(killTimerRef.current);
        }
    }, [gamestate, bossData.limitTime]); 

    function player_Quickdraw() {
        deadeyeaudio.play();
        document.getElementById('deadeye').classList.add('show');
        document.getElementById('bossbutton').classList.add('show');
        setPlayerskin(player_draw);
    }

    // 🎯 보스 처치 함수
    function boss_kill() {
        clearTimeout(drawTimerRef.current);
        clearTimeout(killTimerRef.current);
        
        setGamestate('win');
        amongus.play();
        
        if(bossData.id === 0) {
            setBosscharacter(outlaw_dead);
        }
    }

    const handleScreenClick = (e) => {
        if (playerskin !== player_draw || ammo <= 0) return;

        shotaudio.currentTime = 0;
        shotaudio.play();
        const nextAmmo = ammo - 1;
        setAmmo(nextAmmo);

        if (nextAmmo === 0) {
            const bossbutton = document.getElementById('bossbutton');
            if (bossbutton) bossbutton.classList.remove('show');
        }

        const id = Date.now();
        setClicks((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => setClicks((prev) => prev.filter((c) => c.id !== id)), 400);
    };

    return (
        <div onClick={handleScreenClick} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", cursor: (playerskin === player_draw && ammo > 0) ? "all-scroll" : "default" }}>
            <div id="garim"></div>
            <div id="deadeye"></div>
            <img src={playerskin} id="player" alt="player" />
            <button id="revolver" onClick={player_Quickdraw}></button>
            <img src={bosscharacter} id="boss" alt="boss" className={gamestate === 'win' ? "boss-dead" : "boss-alive"}/>
            <button id="bossbutton" onClick={boss_kill}></button>

            {clicks.map((click) => (
                <img key={click.id} src={bulletEffectImg} alt="shoot" style={{ position: "fixed", left: `${click.x}px`, top: `${click.y}px`, transform: "translate(-50%, -50%)", pointerEvents: "none", zIndex: 2000, width: "64px" }} />
            ))}

            {gamestate === 'lose' && (
                <div className="you-died-container">
                    <h1 className="you-died-text">YOU DIED</h1>
                    <button className="retry-button" onClick={() => window.location.reload()}>다시 도전하기</button>
                </div>
            )}
            
            {/* 승리 레이어 추가 */}
            {gamestate === 'win' && (
                <div className="you-died-container">
                    <h1 className="you-died-text" style={{color: 'gold'}}>VICTORY</h1>
                    <button className="retry-button" onClick={() => window.location.reload()}>다음 보스로</button>
                </div>
            )}
        </div>
    );
}

export default Boss;