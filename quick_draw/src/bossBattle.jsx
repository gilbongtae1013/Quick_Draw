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
import kane from './assets/kane.png';
import kane_draw from './assets/kane_draw.png';
import shotMp3 from './assets/gunshot.mp3';
import deadeyeMp3 from './assets/deadeye.mp3';
import choon from './assets/choonjat.mp3';
import kane_dead from './assets/kane_dead.png';
import aigo from './assets/aigonan.mp3';

function Boss({ bossData }) {
    const aigonan = new Audio(aigo);
    const choonjat = new Audio(choon);
    const amongus = new Audio(amongkill);
    const shotaudio = new Audio(shotMp3);
    const deadeyeaudio = new Audio(deadeyeMp3);
    const pistolaudio = new Audio(pistol);
    const low = new Audio(lowHonnor);

    const drawTimerRef = useRef(null);
    const killTimerRef = useRef(null);

    const [ammo, setAmmo] = useState(5);
    const [gamestate, setGamestate] = useState('ready');
    const [playerskin, setPlayerskin] = useState(player);
    const [dodgeCount, setDodgeCount] = useState(0); // 🎯 회피 횟수
    const [isDodging, setIsDodging] = useState(false);
    
    const [bosscharacter, setBosscharacter] = useState(() => {
        if (bossData.id === 0) return outlaw;
        if (bossData.id === 1) return kane;
        return '';
    });
    const [clicks, setClicks] = useState([]);

    useEffect(() => {
        document.body.style.backgroundImage = `url(${ingameBg})`;
        return () => { document.body.style.backgroundImage = "none"; };
    }, []);

    useEffect(() => {
        const randomTime = Math.random() * (4000 - 1500) + 1500;
        drawTimerRef.current = setTimeout(() => {
            setGamestate('draw');
            const garim = document.getElementById('garim');
            if (garim) garim.classList.add('hide');
            if (bossData.id === 0) setBosscharacter(outlaw_draw);
            else if (bossData.id === 1) {
                setBosscharacter(kane_draw);
                choonjat.play();
            }
        }, randomTime);
        return () => clearTimeout(drawTimerRef.current);
    }, [bossData.id]);

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

    function boss_kill(e) {
        e.stopPropagation();

        // 🎯 2번째 보스(id: 1) 기믹: 3번 피함
        if (bossData.id === 1 && dodgeCount < 3) {
            setDodgeCount(prev => prev + 1);
            setIsDodging(true);
            setTimeout(() => setIsDodging(false), 300);
            return;
        }

        clearTimeout(drawTimerRef.current);
        clearTimeout(killTimerRef.current);
        
        setGamestate('win');
        amongus.play();
        
        if(bossData.id === 0) setBosscharacter(outlaw_dead);
        else if(bossData.id ===1) {setBosscharacter(kane_dead); aigonan.play() }
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
            
            {/* 🎯 상태에 따라 클래스 분리 */}
            <img 
                src={bosscharacter} 
                id="boss" 
                alt="boss" 
                className={`${gamestate === 'win' ? "boss-dead" : "boss-alive"} ${isDodging ? "dodge" : ""}`}
            />
            
            <button id="bossbutton" onClick={boss_kill}></button>

            {clicks.map((click) => (
                <img key={click.id} src={bulletEffectImg} alt="shoot" style={{ position: "fixed", left: `${click.x}px`, top: `${click.y}px`, transform: "translate(-50%, -50%)", pointerEvents: "none", zIndex: 2000, width: "64px" }} />
            ))}

            {(gamestate === 'lose' || gamestate === 'win') && (
                <div className="you-died-container">
                    <h1 className="you-died-text" style={{ color: gamestate === 'win' ? 'gold' : '#8b0000' }}>
                        {gamestate === 'lose' ? "YOU DIED" : "VICTORY"}
                    </h1>
                    <button className="retry-button" onClick={() => window.location.reload()}>
                        {gamestate === 'lose' ? "다시 도전하기" : "다음 보스로"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Boss;