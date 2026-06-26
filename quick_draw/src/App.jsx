import { useEffect, useState } from "react";
import logo from './assets/logo.png'
import boss0Image from './assets/outlaw_background.png';
import './App.css';
import revolver from './assets/revolver.png'
import Boss from './bossBattle.jsx'
import sawed from './assets/sawed.mp3';
import outlaws from './assets/outlaws.mp3';
import boss1Image from './assets/movingman_background.png';

// 메인페이지 사격 효과를 위한 이미지 및 소리 import
import bulletEffectImg from './assets/gunshot.png';
import shotMp3 from './assets/gunshot.mp3';

// [오디오 설정] 볼륨을 절반(0.5)으로 줄이고 프리로드 설정
const fromthewest = new Audio(outlaws);
fromthewest.preload = "auto"; 
fromthewest.loop = true;
fromthewest.volume = 0.34; 

function App() {
  const [bossindex, setBossindex] = useState(0);
  const [battlemod, Setbattlemod] = useState(false);

  // 메인페이지 총소리 오디오 객체 생성
  const shotaudio = new Audio(shotMp3);
  const sawedsound = new Audio(sawed);

  // 메인페이지용 클릭 좌표 상태 배열
  const [clicks, setClicks] = useState([]);

  const bossList = [
    { id: 0, name: "무법자", image: boss0Image, limitTime: 1040, pattern: "normal" },
    { id: 1, name: "무빙맨", image: boss1Image, limitTime: 2400, pattern: "dodge" },
    { id: 2, name: "디럭스파이터", image: boss0Image, limitTime: 2540, pattern: "money" },
    { id: 3, name: "아서모건", image: boss0Image, limitTime: 4, pattern: "best" },
  ];
  
  const currentBoss = bossList[bossindex];

  // 🎯 [우회 로직] 페이지 켜지자마자 음소거 상태로 자동 재생을 걸어두고, 사용자의 움직임이 보이면 소리를 켭니다.
  useEffect(() => {
    // 1. 브라우저 제한을 피하기 위해 일단 무조건 음소거(muted)로 자동재생 시작
    fromthewest.muted = true;
    fromthewest.play().catch(() => {});

    // 2. 유저가 마우스를 움직이거나, 클릭하거나, 키를 누르면 음소거를 해제하는 함수
    const unlockAudio = () => {
      if (fromthewest.muted) {
        fromthewest.muted = false;
        // 혹시나 일시정지 상태라면 다시 재생
        fromthewest.play().catch(() => {}); 
      }
      // 소리가 한 번 켜지면 이벤트 리스너를 전부 제거해서 성능을 아낍니다.
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener('mousemove', unlockAudio);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    // 3. 브라우저가 감지할 수 있는 모든 유저의 움직임 이벤트 등록
    window.addEventListener('mousemove', unlockAudio);
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio); // 모바일 터치 대응

    return () => removeListeners();
  }, []);

  // 메인페이지 전용 화면 클릭 사격 함수
  const handleMainScreenClick = (e) => {
    if (battlemod) return;

    // 클릭했을 때도 확실하게 오디오 상태 체크 및 재생 보장
    if (fromthewest.muted || fromthewest.paused) {
      fromthewest.muted = false;
      fromthewest.play().catch(() => {});
    }

    // 총소리 즉시 재생
    shotaudio.currentTime = 0;
    shotaudio.play();

    const x = e.clientX;
    const y = e.clientY;
    const id = Date.now();

    // 좌표 추가
    setClicks((prev) => [...prev, { id, x, y }]);

    // 0.4초 뒤 이펙트 삭제
    setTimeout(() => {
      setClicks((prev) => prev.filter((click) => click.id !== id));
    }, 400);
  };
  
  return (
    <>
    {!battlemod ? (
      <div 
        onClick={handleMainScreenClick}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          cursor: "move"
        }}
      >
        <div id="logo_box">
          <img src={logo} id="logo" alt="logo" />
        </div>

        <div id="boss_select_container">
          <button onClick={()=> { // 보스 좌 선택 버튼
            if(bossindex === 0) { 
              setBossindex(bossList.length-1);
            }
            else {
              setBossindex(bossindex -1);
            }
          }}><img id="button1" src={revolver} alt="prev" /></button>
          
          <div id="boss_box">
            <h1>{currentBoss.name}</h1>
            <img 
              src={currentBoss.image} 
              alt="boss" 
              onClick={(e) => {
                e.stopPropagation(); 
                fromthewest.pause(); // 보스전 진입 시 메인 BGM 정지
                sawedsound.play();
                Setbattlemod(true);
              }} 
            />
          </div>
          
          <button onClick={()=> { // 보스 우 선택 버튼
            if(bossindex === bossList.length -1) { 
              setBossindex(0);
            }
            else {
              setBossindex(bossindex + 1);
            }
          }}><img id="button2" src={revolver} alt="next" /></button>
        </div>

        {/* 메인페이지 클릭 배열을 순회하며 gunshot 이미지 렌더링 */}
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
      </div>
    ) : (
      <Boss bossData={currentBoss}></Boss>
    )}
    </>
  )
}

export default App;