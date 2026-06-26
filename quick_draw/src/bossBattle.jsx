import { useEffect, useState } from "react";
import './bossBattle.css';
import ingameBg from './assets/ingame_background_dote.png';
import player from './assets/player.png';
import player_draw from './assets/player_draw.png';
import outlaw from './assets/outlaw.png';
import outlaw_draw from './assets/outlaw_draw.png';
import bulletEffectImg from './assets/gunshot.png'; 
import pistol from './assets/pistol.mp3';
import lowHonnor from './assets/low-honor-rdr-2.mp3';


// 오디오 파일 경로 import
import shotMp3 from './assets/gunshot.mp3';
import deadeyeMp3 from './assets/deadeye.mp3';

function Boss({ bossData }) {
    const shotaudio = new Audio(shotMp3);
    const deadeyeaudio = new Audio(deadeyeMp3);
    const pistolaudio = new Audio(pistol);
    const low = new Audio(lowHonnor);

    const [ammo, setAmmo] = useState(5);
    const [enemydraw, setEnemydraw] = useState('undraw');
    const [gamestate, setGamestate] = useState('ready');
    const [playerskin, setPlayerskin] = useState(player);
    
    // 초기 이미지 설정 (보스 진입 시점)
    const [bosscharacter, setBosscharacter] = useState(() => {
        if (bossData.id === 0) return outlaw;
        return '';
    });

    // 🎯 총알 이펙트 좌표들을 기억할 배열 상태
    const [clicks, setClicks] = useState([]);

    // 1. 배경화면 세팅
    useEffect(() => {
        document.body.style.backgroundImage = `url(${ingameBg})`;
        return () => {
            document.body.style.backgroundImage = "none";
        };
    }, []);

    // 2. [첫 번째 타이머] 1.5초 ~ 4초 뒤 보스가 선공 신호를 보냄
    useEffect(() => {
        const randomTime = Math.random() * (4000 - 1500) + 1500;

        const timer = setTimeout(() => {
            setGamestate('draw'); // 상태를 'draw'로 변경
            
            const garim = document.getElementById('garim');
            if (garim) garim.classList.add('hide');
            
            if (bossData.id === 0) {
                setBosscharacter(outlaw_draw);
            }
        }, randomTime);

        return () => clearTimeout(timer);
    }, [bossData.id]);

    // 3. [데드라인 타이머] 제한 시간이 지나면 플레이어 패배 처리
    useEffect(() => {
        if (gamestate === 'draw') {
            const limit = Number(bossData.limitTime); // 안전장치 시간 설정

            const killTimer = setTimeout(() => {
                low.play();
                pistolaudio.play();
                deadeyeaudio.pause();
                // 🎯 [수정] alert()를 과감히 지우고 상태값만 변경하여 화면을 먼저 갱신시킵니다.
                setPlayerskin('none');
                setGamestate('lose');
            }, limit);

            return () => clearTimeout(killTimer); // 타이머 클린업 필수
        }
    }, [gamestate, bossData.limitTime]); 

    function player_Quickdraw() {
        deadeyeaudio.play();
        document.getElementById('deadeye').classList.add('show');
        document.getElementById('bossbutton').classList.add('show');
        setPlayerskin(player_draw);
    }

    function boss_kill() {
        clearTimeout(timer)
    }

    // 🎯 클릭할 때마다 탄환 검사 및 ammo 감소, 0발 시 보스버튼 삭제
    const handleScreenClick = (e) => {
        // 플레이어가 총을 뽑은 상태(player_draw)가 아니거나, 총알이 0발 이하라면 즉시 리턴 (사격 불가)
        if (playerskin !== player_draw || ammo <= 0) return;

        // 총소리 즉시 재생
        shotaudio.currentTime = 0;
        shotaudio.play();

        // 총알 수 1 감소
        const nextAmmo = ammo - 1;
        setAmmo(nextAmmo);

        // 5발을 다 쐈다면(남은 총알이 0발이 되었다면) 보스 버튼 숨기기
        if (nextAmmo === 0) {
            const bossbutton = document.getElementById('bossbutton');
            if (bossbutton) bossbutton.classList.remove('show');
        }

        const x = e.clientX;
        const y = e.clientY;
        const id = Date.now();

        setClicks((prev) => [...prev, { id, x, y }]);

        setTimeout(() => {
            setClicks((prev) => prev.filter((click) => click.id !== id));
        }, 400); // 0.4초 뒤 사라짐
    };

    return (
        <div 
            onClick={handleScreenClick} 
            style={{ 
                position: "fixed", 
                top: 0, 
                left: 0, 
                width: "100vw", 
                height: "100vh", 
                padding: "0px",
                cursor: (playerskin === player_draw && ammo > 0) ? "all-scroll" : "default",
            }}
        >
            <div id="garim"></div>
            <div id="deadeye"></div>
            <img src={playerskin} id="player" alt="player" />
            <button id="revolver" onClick={player_Quickdraw}></button>
            <img src={bosscharacter} id="boss" alt="boss" />
            <button id="bossbutton" onClick={boss_kill}></button>

            {/* 클릭 배열을 순회하며 마우스 클릭 위치에 이미지 렌더링 */}
            {clicks.map((click) => (
                <img
                    key={click.id}
                    src={bulletEffectImg}
                    alt="shoot-effect"
                    style={{
                        position: "fixed",
                        left: `${click.x}px`,
                        top: `${click.y}px`,
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none", 
                        zIndex: 2000,          
                        width: "64px"
                    }}
                />
            ))}

            {/* 🎯 [추가] 플레이어가 패배했을 때(gamestate === 'lose') 나타나는 UI */}
            {gamestate === 'lose' && (
                <div className="you-died-container">
                    <h1 className="you-died-text">YOU DIED</h1>
                    <button 
                        className="retry-button" 
                        onClick={() => window.location.reload()}
                    >
                        다시 도전하기
                    </button>
                </div>
            )}
        </div>
    );
}

export default Boss;