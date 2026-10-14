// 2026-10-14: 정사각형 미리보기에서 사진과 Bounding Box 영역 일치 수정
// React 기능 불러오기

//

// useState

// → 값 저장

//

// useEffect

// → 화면이 처음 실행될 때 작업

//

// useRef

// → 실제 <video>, <canvas> 요소에 직접 접근할 때 사용

import {

  useEffect,

  useRef,

  useState,

} from "react";

// RewardPage 전용 CSS 파일 연결
import "./RewardPage.css";

// =========================================================

// 나무 이미지 관련 설정

// =========================================================

// ---------------------------------------------------------

// trees 폴더 안의 모든 PNG 이미지를 자동으로 불러오기

// ---------------------------------------------------------

//

// 예:

// assets/trees/apple/tree_stage1_seed.png

// assets/trees/pear/tree_stage1_seed.png

//

// 나무 종류마다 이미지를 import로 하나씩 적지 않아도

// 자동으로 모두 불러올 수 있음

// ---------------------------------------------------------

const treeImageModules = import.meta.glob(

  "../../assets/trees/*/*.png",

  {

    // 페이지가 실행될 때 이미지를 바로 불러옴

    eager: true,

    // 이미지 파일의 실제 주소만 가져옴

    import: "default",

  }

);

// ---------------------------------------------------------

// 성장 단계별 이미지 파일명

// ---------------------------------------------------------

//

// 현재 우리 프로젝트는 10단계 성장 구조를 유지

// ---------------------------------------------------------

const treeStageFiles = {

  씨앗: "tree_stage1_seed.png",

  발아: "tree_stage2_germination.png",

  새싹: "tree_stage3_sprout.png",

  묘목: "tree_stage4_seedling.png",

  어린나무: "tree_stage5_young.png",

  "성장한 나무": "tree_stage6_grown.png",

  "풍성한 나무": "tree_stage7_bud.png",

  꽃나무: "tree_stage8_flowering.png",

  열매나무: "tree_stage9_fruit.png",

  "수확 가능": "tree_stage10_harvest.png",

};

// =========================================================

// YOLO 재활용품 클래스 한글 이름

// =========================================================

//

// YOLO 모델 내부에서는

// PAPER, CAN, PET 같은 영문 클래스명을 사용함

//

// 화면에서는 사용자가 보기 쉽게

// 한글 이름과 함께 표시하기 위해 사용

// =========================================================

const recycleLabelMap = {

  PAPER: "종이",

  CAN: "캔",

  PET: "페트병",

  PLASTIC: "플라스틱",

  VINYL: "비닐",

  BATTERY: "배터리",

};

// ---------------------------------------------------------

// 나무 종류 + 성장 단계에 맞는 이미지 찾기

// ---------------------------------------------------------

//

// 예:

// treeType = apple

// currentStage = 새싹

//

// 결과:

// apple/tree_stage3_sprout.png

// ---------------------------------------------------------

function getTreeImage(treeType, currentStage) {

  // 현재 성장 단계에 해당하는 파일명 찾기

  const fileName = treeStageFiles[currentStage];

  // 나무 종류 또는 단계가 없으면 이미지 없음

  if (!treeType || !fileName) {

    return null;

  }

  // 실제 이미지 경로 만들기

  const imagePath =

    `../../assets/trees/${treeType}/${fileName}`;

  // 미리 불러온 이미지 중 해당 이미지 반환

  return treeImageModules[imagePath] || null;

}

// =========================================================

// 테스트용 수확 보상 제품

// =========================================================

//

// 아직 실제 상품 DB와 연결하지 않았기 때문에

// 현재는 프론트 테스트용 데이터

// =========================================================

const rewardProducts = [

  {

    id: 1,

    name: "친환경 텀블러",

  },

  {

    id: 2,

    name: "에코백",

  },

  {

    id: 3,

    name: "재활용 노트",

  },

  {

    id: 4,

    name: "친환경 포인트 쿠폰",

  },

];

// =========================================================

// RewardPage 메인 컴포넌트

// =========================================================

// 팀 연결용 수정본: 원본은 별도로 보관합니다.
// embedded=true: 팀 Layout이 헤더·푸터를 표시합니다.
// backendReady=false: 서버 연결 전에는 요청·적립·차감을 실행하지 않습니다.
function RewardPage({ embedded = false, backendReady = false }) {

  // =======================================================

  // 기존 포인트 / 나무 관련 상태

  // =======================================================

  // 현재 포인트, 물방울, 나무 상태

  const [pointResult, setPointResult] = useState(() => backendReady ? null : ({
    // 화면 배치 확인용 값입니다. 실제 회원 잔액·성장 데이터가 아닙니다.
    userPoints: 0, waterDrops: 0, wateringCount: 0,
    currentStage: "씨앗", nextStage: "서버 연결 후 표시",
    wateringToNext: "—", treeType: "apple",
    estimatedPoints: 0, confirmedPoints: 0, differencePoints: 0,
    alreadyConfirmed: false, toleranceExceeded: false,
  }));

  // 포인트 발급 이력

  const [history, setHistory] = useState([]);

  // 물방울 지급 안내 문구

  const [waterMessage, setWaterMessage] = useState("");

  // 포인트 확정 처리 중인지 확인

  // 버튼 중복 클릭 방지용

  const [isConfirming, setIsConfirming] = useState(false);

  // =======================================================

  // 수확 관련 상태

  // =======================================================

  // 수확 보상 목록을 보여줄지 여부

  const [showRewards, setShowRewards] = useState(false);

  // 사용자가 선택한 보상 제품

  const [selectedReward, setSelectedReward] = useState(null);

  // =======================================================

  // 새로 추가한 AI 이미지 분류 관련 상태

  // =======================================================

  // 사용자가 선택한 실제 이미지 파일

  const [selectedImage, setSelectedImage] = useState(null);

  // 선택한 이미지를 화면에 미리 보여주기 위한 주소

  const [previewImage, setPreviewImage] = useState(null);

  // FastAPI / YOLO에서 받은 분석 결과

  const [classifyResult, setClassifyResult] = useState(null);

  // 현재 YOLO 분석 중인지 확인

  const [isClassifying, setIsClassifying] = useState(false);

  // 이미지 분석 중 오류가 발생했을 때 표시할 문구

  const [classifyError, setClassifyError] = useState("");

  // -------------------------------------------------------

  // 원본 이미지 크기 저장

  // -------------------------------------------------------

  //

  // YOLO bbox 좌표는 원본 사진의 픽셀 좌표이므로

  // 화면에 표시되는 사진 크기에 맞게 비율을 계산하기 위해 필요

  //

  // 예:

  // 원본 사진 = 3000 x 4000

  // 화면 사진 = 300px 정도

  //

  // bbox도 같은 비율로 줄여서 표시해야 함

  // -------------------------------------------------------

  const [imageSize, setImageSize] = useState({

    width: 0,

    height: 0,

  });

  // =======================================================

  // 카메라 관련 상태 / 연결

  // =======================================================

  // 현재 카메라가 실행 중인지 저장

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // 현재 카메라 모드
  // "photo" = 일반 촬영 / "live" = 실시간캠
  const [cameraMode, setCameraMode] = useState("photo");

  // 사진 업로드 input을 버튼으로 열기 위한 ref
  const fileInputRef = useRef(null);

  // -------------------------------------------------------
  // 오늘 AI 인식 횟수 상한
  // -------------------------------------------------------
  // 5회는 개인 개발용 임시 설정이며 확정된 서비스 정책이 아닙니다.
  // 추후 로그인/DB 연결 시 서버에서 받은 값으로 교체하면 됩니다.
  const DAILY_RECOGNITION_LIMIT = 5;
  const [dailyRecognitionCount, setDailyRecognitionCount] = useState(0);

  // -------------------------------------------------------
  // AI 분석 결과 사진 저장 팝업
  // -------------------------------------------------------
  // 1차 팝업: 분석 완료 후 저장 / 취소
  // 2차 팝업: 저장 위치 선택
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [analysisResultFile, setAnalysisResultFile] = useState(null);
  const [analysisPreviewUrl, setAnalysisPreviewUrl] = useState(null);

  // 실제 저장하는 File과 팝업 사진은 동일한 이미지입니다.
  useEffect(() => {
    if (!analysisResultFile) {
      setAnalysisPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(analysisResultFile);
    setAnalysisPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [analysisResultFile]);
  const [isPreparingSave, setIsPreparingSave] = useState(false);

  // 실제 화면의 <video> 태그에 접근하기 위해 사용

  //

  // 카메라 영상은 React state에 저장하는 것이 아니라

  // video 태그에 직접 연결해야 하므로 useRef 사용

  const videoRef = useRef(null);

  // 촬영 순간의 영상을 사진으로 바꾸기 위한 canvas

  //

  // 사용자 화면에는 보이지 않고

  // 카메라 한 프레임을 이미지로 만드는 용도로 사용

  const canvasRef = useRef(null);

  // 현재 실행 중인 카메라 Stream 저장

  //

  // 나중에 카메라를 종료할 때 필요

  const cameraStreamRef = useRef(null);

  // =======================================================

  // 포인트 발급 이력 불러오기

  // =======================================================

  const loadHistory = () => {
    if (!backendReady) return; // 오늘은 프런트 연결만 진행합니다.


    fetch("http://127.0.0.1:8000/point-history")

      // FastAPI에서 받은 JSON 데이터를 JavaScript 객체로 변환

      .then((response) => response.json())

      .then((data) => {

        // 이력 상태에 저장

        setHistory(data);

      })

      .catch((error) => {

        console.error(

          "포인트 이력을 불러오지 못했습니다.",

          error

        );

      });

  };

  // =======================================================

  // 현재 포인트 / 물방울 / 나무 상태 불러오기

  // =======================================================

  const loadPointResult = () => {
    if (!backendReady) return; // 오늘은 프런트 연결만 진행합니다.


    fetch("http://127.0.0.1:8000/point-result")

      .then((response) => response.json())

      .then((data) => {

        // 현재 상태 저장

        setPointResult(data);

      })

      .catch((error) => {

        console.error(

          "포인트 데이터를 불러오지 못했습니다.",

          error

        );

      });

  };

  // =======================================================

  // 예상포인트 + 물방울 보상 처리

  // =======================================================

  const loadEstimate = () => {
    if (!backendReady) return; // 오늘은 프런트 연결만 진행합니다.


    fetch(

      "http://127.0.0.1:8000/estimate-points",

      {

        method: "POST",

      }

    )

      .then((response) => response.json())

      .then((data) => {

        // 아직 보상을 받지 않은 경우

        if (!data.alreadyRewarded) {

          setWaterMessage(

            "💧 예상포인트 확인 보상으로 물방울 1개를 받았습니다!"

          );

        }

        // 예상 보상 처리 후

        // 최신 포인트 / 나무 상태 다시 불러오기

        loadPointResult();

      })

      .catch((error) => {

        console.error(

          "예상포인트 처리에 실패했습니다.",

          error

        );

      });

  };

  // =======================================================

  // 화면 처음 실행

  // =======================================================

  useEffect(() => {

    // 1. 현재 포인트 / 나무 상태 불러오기

    loadPointResult();

    // 2. 예상포인트 / 물방울 보상 처리

    // 화면 진입만으로 적립 요청을 보내지 않습니다.
    // 기존 estimate API의 역할은 백엔드 통합 때 정리합니다.

    // 3. 포인트 발급 이력 불러오기

    loadHistory();

    // 4. 오늘 AI 인식 횟수 불러오기
    const today = new Date().toISOString().slice(0, 10);
    const saved = JSON.parse(
      localStorage.getItem("repick_daily_recognition") || "{}"
    );

    if (saved.date === today) {
      setDailyRecognitionCount(saved.count || 0);
    } else {
      localStorage.setItem(
        "repick_daily_recognition",
        JSON.stringify({ date: today, count: 0 })
      );
      setDailyRecognitionCount(0);
    }

  }, []);

  // =======================================================

  // AI 사진 선택

  // =======================================================

  //

  // 사용자가 사진을 선택하거나

  // 휴대폰에서 카메라로 촬영했을 때 실행됨

  // =======================================================

  const handleImageChange = (event) => {

    // 사용자가 선택한 첫 번째 파일

    const file = event.target.files[0];

    // 파일 선택을 취소한 경우

    if (!file) {

      return;

    }

    // 실제 파일 저장

    setSelectedImage(file);
      setAnalysisResultFile(null);
      setShowSaveConfirm(false);
      setShowSaveOptions(false);

    // 이전 분석 결과 초기화

    setClassifyResult(null);

    // 이전 오류 문구 초기화

    setClassifyError("");

    // 선택한 사진을 화면에서 미리 볼 수 있도록

    // 임시 URL 생성

    const imageUrl = URL.createObjectURL(file);

    setPreviewImage(imageUrl);

  };

  // =======================================================
  // 파일 다운로드 공통 함수
  // =======================================================

  const downloadFile = (file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name || `repick_result_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // =======================================================
  // Canvas 이미지를 최대 5MB 이하 JPEG File로 만들기
  // =======================================================
  // 카메라 촬영사진과 실시간캠 캡처에만 적용합니다.

  const createCameraFileUnder5MB = (canvas, fileName) => {
    const MAX_CAPTURE_SIZE = 5 * 1024 * 1024;

    return new Promise((resolve, reject) => {
      const makeBlob = (quality) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("촬영 이미지를 만들지 못했습니다."));
              return;
            }

            if (blob.size > MAX_CAPTURE_SIZE && quality > 0.5) {
              makeBlob(Math.max(quality - 0.1, 0.5));
              return;
            }

            if (blob.size > MAX_CAPTURE_SIZE) {
              reject(new Error("촬영 사진이 5MB를 초과합니다."));
              return;
            }

            resolve(
              new File([blob], fileName, {
                type: "image/jpeg",
              })
            );
          },
          "image/jpeg",
          quality
        );
      };

      makeBlob(0.95);
    });
  };

  // =======================================================
  // AI 분석 결과가 표시된 이미지 만들기
  // =======================================================
  // 원본 사진 위에 YOLO Bounding Box + 라벨을 직접 그려서
  // 다운로드 / 휴대폰 저장 / 커뮤니티 업로드에 사용할
  // 하나의 JPEG File로 만듭니다.

  const createAnalysisResultFile = async (sourceFile = selectedImage, result = classifyResult) => {
    if (!sourceFile || result?.status !== "success") {
      throw new Error("저장할 AI 분석 결과가 없습니다.");
    }

    const imageUrl = URL.createObjectURL(sourceFile);

    try {
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("분석 사진을 불러오지 못했습니다."));
        img.src = imageUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      // 사진 크기에 따라 선과 글씨 크기를 자연스럽게 조절
      const scale = Math.max(canvas.width, canvas.height) / 1200;
      const lineWidth = Math.max(3, Math.round(4 * scale));
      const fontSize = Math.max(18, Math.round(24 * scale));

      context.lineWidth = lineWidth;
      context.font = `700 ${fontSize}px sans-serif`;
      context.textBaseline = "top";

      // 서버가 분석한 이미지 크기를 저장 Canvas 크기에 맞춥니다.
      const scaleX = canvas.width / (result.image_width || canvas.width);
      const scaleY = canvas.height / (result.image_height || canvas.height);
      (result.detections || []).forEach((item) => {
        const coords = item.bbox || [];
        if (coords.length !== 4 || !coords.every(Number.isFinite)) return;
        const [x1, y1, x2, y2] = coords.map((v, i) => v * (i % 2 === 0 ? scaleX : scaleY));

        if ([x1, y1, x2, y2].some((value) => value == null)) {
          return;
        }

        const label = `${
          item.label_ko || recycleLabelMap[item.class] || item.class
        } ${(item.confidence * 100).toFixed(1)}%`;

        // Bounding Box
        context.strokeStyle = "#2f8f4e";
        context.strokeRect(x1, y1, x2 - x1, y2 - y1);

        // 라벨 배경
        const textWidth = context.measureText(label).width;
        const labelHeight = fontSize + Math.max(10, Math.round(10 * scale));
        const labelY = Math.max(0, y1 - labelHeight);

        context.fillStyle = "rgba(47, 143, 78, 0.92)";
        context.fillRect(
          x1,
          labelY,
          textWidth + Math.max(18, Math.round(18 * scale)),
          labelHeight
        );

        context.fillStyle = "#ffffff";
        context.fillText(
          label,
          x1 + Math.max(8, Math.round(8 * scale)),
          labelY + Math.max(4, Math.round(4 * scale))
        );
      });

      return await createCameraFileUnder5MB(
        canvas,
        `repick_ai_result_${Date.now()}.jpg`
      );
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  };

  // =======================================================
  // 분석 완료 팝업 → 저장 위치 선택 팝업
  // =======================================================

  const handlePrepareAnalysisSave = async () => {
    try {
      setIsPreparingSave(true);
      const resultFile = analysisResultFile || await createAnalysisResultFile();
      setAnalysisResultFile(resultFile);
      setShowSaveConfirm(false);
      setShowSaveOptions(true);
    } catch (error) {
      alert(error.message || "분석 결과 사진을 만들지 못했습니다.");
    } finally {
      setIsPreparingSave(false);
    }
  };

  // PC / 웹: 브라우저 다운로드 폴더로 저장
  const handleSaveToDevice = () => {
    if (!analysisResultFile) return;
    downloadFile(analysisResultFile);
    setShowSaveOptions(false);
  };

  // 휴대폰: Web Share API를 이용해 사진앱/공유 화면 열기
  // 지원하지 않는 브라우저에서는 일반 다운로드로 대체
  const handleSaveToMobilePhotos = async () => {
    if (!analysisResultFile) return;

    try {
      if (
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [analysisResultFile] }))
      ) {
        await navigator.share({
          files: [analysisResultFile],
          title: "RePick AI 분리배출 인증",
          text: "AI 분리배출 인증 결과 사진",
        });
      } else {
        downloadFile(analysisResultFile);
      }

      setShowSaveOptions(false);
    } catch (error) {
      // 사용자가 휴대폰 공유창을 닫은 경우에는 오류 팝업을 띄우지 않음
      if (error?.name !== "AbortError") {
        console.error("휴대폰 저장/공유 실패:", error);
        alert("사진앱으로 보내지 못했습니다. 기기 저장을 이용해주세요.");
      }
    }
  };

  // 커뮤니티 연결용
  // 아직 커뮤니티 페이지의 실제 라우트/API가 이 파일에 없으므로
  // File 객체를 브라우저 메모리에 유지하고 커스텀 이벤트로 전달합니다.
  // 커뮤니티 화면을 연결할 때 이 이벤트를 받아 게시글 첨부 파일로 사용하면 됩니다.
  const handleSendToCommunity = () => {
    if (!analysisResultFile) return;

    window.repickCommunityUploadFile = analysisResultFile;
    window.dispatchEvent(
      new CustomEvent("repick:community-upload", {
        detail: {
          file: analysisResultFile,
          analysis: classifyResult,
        },
      })
    );

    setShowSaveOptions(false);
    alert("커뮤니티 업로드용 사진이 준비되었습니다.");
  };

  // =======================================================

  // 카메라 켜기

  // =======================================================

  //

  // 브라우저에게 카메라 사용 권한을 요청하고

  // 실제 <video> 태그에 카메라 영상을 연결

  // =======================================================

  const handleOpenCamera = async (mode = "photo") => {

    try {

      // ---------------------------------------------------

      // 카메라 사용 요청

      // ---------------------------------------------------

      //

      // video:

      // 카메라 영상 사용

      //

      // facingMode: "environment"

      // 휴대폰에서는 가능하면 후면 카메라 사용

      // ---------------------------------------------------

      const stream =

        await navigator.mediaDevices.getUserMedia({

          video: {

            facingMode: "environment",

          },

          audio: false,

        });

      // 현재 실행 중인 카메라 Stream 저장

      //

      // 나중에 카메라를 끌 때 사용

      cameraStreamRef.current = stream;

      // 일반 촬영인지 실시간캠인지 저장
      setCameraMode(mode);

      // 카메라 화면을 보여주는 상태로 변경

      //

      // 실제 카메라 Stream 연결은

      // 아래 <video>의 ref={(node) => { ... }}

      // 부분에서 처리함

      setIsCameraOpen(true);

    }

    catch (error) {

      console.error(

        "카메라를 실행하지 못했습니다.",

        error

      );

      alert(

        "카메라를 사용할 수 없습니다. 카메라 권한을 확인해주세요."

      );

    }

  };

  // =======================================================

  // 카메라 끄기

  // =======================================================

  //

  // 카메라를 켜놓은 상태에서는

  // 실제 PC/휴대폰 카메라가 계속 사용되므로

  // 모든 카메라 track을 종료해야 함

  // =======================================================

  const handleCloseCamera = () => {

    // 현재 카메라 Stream이 있는 경우

    if (cameraStreamRef.current) {

      // Stream 안의 모든 track을 하나씩 종료

      cameraStreamRef.current

        .getTracks()

        .forEach((track) => {

          track.stop();

        });

      // 저장된 Stream 제거

      cameraStreamRef.current = null;

    }

    // 화면에서 카메라 영역 숨기기

    setIsCameraOpen(false);

  };

  // =======================================================

  // 카메라 촬영

  // =======================================================

  //

  // 현재 <video>에 보이는 한 장면을

  // <canvas>에 복사한 뒤

  // 이미지 Blob → File로 변환

  //

  // 그 File을 기존 selectedImage에 넣기 때문에

  // 이후 YOLO 분석 과정은 파일 첨부 방식과 동일하게 사용 가능

  // =======================================================

  const handleCaptureCamera = async () => {

    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) {
      alert("카메라 영상이 아직 준비되지 않았습니다. 잠시 후 다시 촬영해주세요.");
      return;
    }

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, videoWidth, videoHeight);

    try {
      // 촬영 사진은 최대 5MB 이하로 생성
      const capturedFile = await createCameraFileUnder5MB(
        canvas,
        `repick_camera_${Date.now()}.jpg`
      );

      setSelectedImage(capturedFile);
      setAnalysisResultFile(null);
      setShowSaveConfirm(false);
      setShowSaveOptions(false);
      setClassifyResult(null);
      setClassifyError("");
      setPreviewImage(URL.createObjectURL(capturedFile));

      // 일반 카메라 촬영은 촬영 후 카메라 종료
      handleCloseCamera();
    } catch (error) {
      alert(error.message || "촬영 사진을 저장하지 못했습니다.");
    }
  };

  // =======================================================
  // 실시간캠 현재 화면 저장
  // =======================================================
  // 실시간 영상에서 원하는 순간을 캡처해
  // 최대 5MB 이하 이미지 파일로 만들고,
  // AI 분석 및 커뮤니티 업로드용 사진으로 사용합니다.

  const handleSaveLiveFrame = async () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      alert("실시간캠이 아직 준비되지 않았습니다.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const liveFile = await createCameraFileUnder5MB(
        canvas,
        `repick_live_${Date.now()}.jpg`
      );

      setSelectedImage(liveFile);
      setAnalysisResultFile(null);
      setShowSaveConfirm(false);
      setShowSaveOptions(false);
      setClassifyResult(null);
      setClassifyError("");
      setPreviewImage(URL.createObjectURL(liveFile));

      // 사용자가 바로 커뮤니티에 올릴 수 있도록 파일도 저장
      const url = URL.createObjectURL(liveFile);
      const link = document.createElement("a");
      link.href = url;
      link.download = liveFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message || "실시간캠 화면을 저장하지 못했습니다.");
    }
  };

  // =======================================================

  // AI 이미지 분석

  // =======================================================

  //

  // 흐름:

  //

  // React 사진

  //     ↓

  // FormData

  //     ↓

  // POST /api/v1/classify

  //     ↓

  // FastAPI

  //     ↓

  // YOLO26s

  //     ↓

  // JSON 결과

  // =======================================================

  const handleClassifyImage = async () => {
    if (!backendReady) {
      setClassifyError("AI 서버 연결 후 분석할 수 있습니다.");
      return;
    }

    // 사진을 선택하지 않았으면 분석 불가

    if (!selectedImage) {

      alert("먼저 사진을 선택해주세요.");

      return;

    }

    // 오늘 인식 상한 확인
    if (dailyRecognitionCount >= DAILY_RECOGNITION_LIMIT) {
      alert(
        `오늘 AI 인식 가능 횟수 ${DAILY_RECOGNITION_LIMIT}회를 모두 사용했습니다.`
      );
      return;
    }

    // 분석 시작

    setIsClassifying(true);

    // 이전 오류 초기화

    setClassifyError("");

    // 이전 분석 결과 초기화

    setClassifyResult(null);

    try {

      // ---------------------------------------------------

      // FormData 생성

      // ---------------------------------------------------

      //

      // FastAPI에서는 현재:

      //

      // image: UploadFile

      //

      // 형태로 사진을 받기 때문에

      // 일반 JSON이 아니라 FormData로 보내야 함

      // ---------------------------------------------------

      const formData = new FormData();

      // FastAPI의 변수 이름이 image이므로

      // 반드시 "image"라는 이름으로 전송

      formData.append(

        "image",

        selectedImage

      );

      // ---------------------------------------------------

      // FastAPI에 사진 전송

      // ---------------------------------------------------

      const response = await fetch(

        "http://127.0.0.1:8000/api/v1/classify",

        {

          method: "POST",

          // FormData 자체를 body에 넣음

          body: formData,

        }

      );

      // ---------------------------------------------------

      // 서버 오류 확인

      // ---------------------------------------------------

      if (!response.ok) {

        throw new Error(

          `이미지 분석 요청 실패: ${response.status}`

        );

      }

      // ---------------------------------------------------

      // FastAPI 응답을 JSON으로 변환

      // ---------------------------------------------------

      const data = await response.json();

      // ---------------------------------------------------

      // 분석 결과 저장

      // ---------------------------------------------------

      // AI 분석 결과를 화면 상태에 저장
      setClassifyResult(data);

      // AI 분석 성공 시 물방울/물주기/나무 성장 상태가
      // DB에서 변경될 수 있으므로 최신 상태를 다시 불러옴
      if (data.status === "success") {
        loadPointResult();

        // 오늘 성공 인식 횟수 +1
        const today = new Date().toISOString().slice(0, 10);
        const nextCount = Math.min(
          dailyRecognitionCount + 1,
          DAILY_RECOGNITION_LIMIT
        );

        setDailyRecognitionCount(nextCount);
        localStorage.setItem(
          "repick_daily_recognition",
          JSON.stringify({ date: today, count: nextCount })
        );

        // 분석이 끝난 사진을 저장할지 바로 선택할 수 있도록 팝업 표시
        setAnalysisResultFile(null);
        setShowSaveConfirm(false);
        setShowSaveOptions(false);
        setIsPreparingSave(true);
        try {
          const file = await createAnalysisResultFile(selectedImage, data);
          setAnalysisResultFile(file);
          setShowSaveConfirm(true);
        } catch (saveError) {
          setClassifyError("분석과 적립은 완료되었지만 결과 이미지 생성에 실패했습니다: " + saveError.message);
        } finally {
          setIsPreparingSave(false);
        }
      }

    }

    catch (error) {

      console.error(

        "AI 이미지 분석에 실패했습니다.",

        error

      );

      setClassifyError(

        "이미지를 분석하는 중 오류가 발생했습니다."

      );

    }

    finally {

      // 성공하든 실패하든 분석 작업 종료

      setIsClassifying(false);

    }

  };

  // =======================================================

  // 확정포인트 발급

  // =======================================================

  const handleConfirmPoints = () => {
    if (!backendReady) return; // 오늘은 프런트 연결만 진행합니다.


    // 이미 처리 중이면 중복 실행 방지

    if (isConfirming) {

      return;

    }

    // 포인트 확정 처리 시작

    setIsConfirming(true);

    fetch(

      "http://127.0.0.1:8000/confirm-points",

      {

        method: "POST",

      }

    )

      .then((response) => response.json())

      .then((data) => {

        // 서버에서 실패했다고 반환한 경우

        if (!data.success) {

          alert(data.message);

          setIsConfirming(false);

          return;

        }

        // 기존 pointResult에서

        // 변경된 값들만 새로운 값으로 갱신

        setPointResult((prev) => ({

          ...prev,

          userPoints: data.userPoints,

          waterDrops: data.waterDrops,

          wateringCount: data.wateringCount,

          currentStage: data.currentStage,

          nextStage: data.nextStage,

          wateringToNext: data.wateringToNext,

          alreadyConfirmed: true,

        }));

        // 포인트 발급 이력 다시 불러오기

        loadHistory();

        // 처리 종료

        setIsConfirming(false);

      })

      .catch((error) => {

        console.error(

          "포인트 발급에 실패했습니다.",

          error

        );

        setIsConfirming(false);

      });

  };

  // =======================================================

  // 수확하기

  // =======================================================

  const handleHarvest = () => {
    if (!backendReady) return;


    // 보상 제품 목록 표시

    setShowRewards(true);

    // 이전에 선택한 제품 초기화

    setSelectedReward(null);

  };

  // =======================================================

  // 수확을 나중에 하기

  // =======================================================

  const handleHarvestLater = () => {

    // 보상 목록 닫기

    setShowRewards(false);

    // 선택한 상품 초기화

    setSelectedReward(null);

  };

  // =======================================================

  // 수확 보상 제품 선택

  // =======================================================

  const handleRewardSelect = (product) => {

    // 사용자가 누른 상품 저장

    setSelectedReward(product);

  };

  // =======================================================

  // 포인트 데이터 로딩 중

  // =======================================================

  if (!pointResult) {

    return (

      <p>

        포인트 정보를 불러오는 중...

      </p>

    );

  }

  // =======================================================

  // 현재 나무 이미지 찾기

  // =======================================================

  const currentTreeImage =

    getTreeImage(

      pointResult.treeType,

      pointResult.currentStage

    );

  // =======================================================

  // 현재 나무가 수확 가능한 단계인지 확인

  // =======================================================

  const harvestReady =

    pointResult.currentStage === "수확 가능";

  // =======================================================
  // 실제 화면
  // =======================================================
  //
  // 오늘은 기능을 바꾸지 않고 "서비스처럼 보이는 1차 UI"를 만드는 단계입니다.
  // PC 1440px 화면에서는 내용 폭을 최대 1080px로 제한하고,
  // 모바일 390px 화면에서는 카드가 한 줄씩 아래로 내려가도록 구성합니다.
  // =======================================================

  return (
    <div className={`repick-page${embedded ? " repick-team-embedded" : ""}`}>

      {/* ===================================================== */}
      {/* HEADER 자리 */}
      {/* 나중에 팀 공통 Header 컴포넌트로 교체할 예정 */}
      {/* ===================================================== */}
      {!embedded && <header className="repick-header-placeholder">
        <span>HEADER</span>
      </header>}

      {/* ===================================================== */}
      {/* MAIN 본문 */}
      {/* ===================================================== */}
      <div className="repick-main">
        <div className="repick-container">

          {/* ------------------------------------------------- */}
          {/* 페이지 제목 */}
          {/* ------------------------------------------------- */}
          <section className="repick-page-heading">
            <p className="repick-eyebrow">REPICK AI RECYCLING</p>
            <h1>AI 분리배출 인증</h1>
            {!backendReady && (
              <p className="repick-team-notice" role="status">
                프런트 화면 확인 중입니다. 표시된 잔액·나무는 예시이며,
                실제 AI 분석·적립·물주기·수확 저장은 서버 연결 후 사용할 수 있습니다.
              </p>
            )}
          </section>

          {/* ================================================= */}
          {/* 1. 사진/카메라 + AI 분석 결과 */}
          {/* PC에서는 2열, 모바일에서는 1열 */}
          {/* ================================================= */}
          {/* 각 열은 내용 높이에 맞춰 독립적으로 이어집니다. */}
          <div className="repick-column-layout">
            <div className="repick-column repick-column-left">
<article className="repick-card repick-camera-card">
              <div className="repick-card-heading">
                <div>
                  <span className="repick-step-badge">01</span>
                  <h2>사진 인증하기</h2>
                </div>
                <p>재활용품이 잘 보이도록 촬영해주세요.</p>
              </div>

              {/* ================================================= */}
              {/* 사진 인증 영역 순서 */}
              {/* 1) 미리보기/카메라 화면 */}
              {/* 2) 사진 업로드 / 카메라 / 실시간캠 */}
              {/* 3) AI 분석 버튼 */}
              {/* ================================================= */}

              {/* 촬영할 때 내부적으로 사용하는 canvas - 화면에는 보이지 않음 */}
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {/* 실제 사진 업로드 input - 버튼으로만 실행하므로 숨김 */}
              <input
                ref={fileInputRef}
                className="repick-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {/* ------------------------------------------------- */}
              {/* 1. 선택/촬영된 사진 미리보기 */}
              {/* 카메라가 켜져 있으면 같은 위치에 카메라 화면 표시 */}
              {/* ------------------------------------------------- */}
              {isCameraOpen ? (
                <div className="repick-camera-live">
                  <div className="repick-live-status-row">
                    <span className="repick-live-dot" />
                    <strong>
                      {cameraMode === "live" ? "실시간캠 실행 중" : "카메라 실행 중"}
                    </strong>
                  </div>

                  <video
                    className="repick-video"
                    ref={(node) => {
                      videoRef.current = node;
                      if (node && cameraStreamRef.current) {
                        node.srcObject = cameraStreamRef.current;
                      }
                    }}
                    autoPlay
                    muted
                    playsInline
                    onLoadedMetadata={(event) => {
                      event.currentTarget.play().catch((error) => {
                        console.error("카메라 영상 재생 실패:", error);
                      });
                    }}
                  />

                  <div className="repick-inline-buttons">
                    {cameraMode === "photo" ? (
                      <button
                        className="repick-btn repick-btn-primary"
                        onClick={handleCaptureCamera}
                      >
                        📸 촬영하기
                      </button>
                    ) : (
                      <button
                        className="repick-btn repick-btn-primary"
                        onClick={handleSaveLiveFrame}
                      >
                        💾 현재 화면 저장
                      </button>
                    )}

                    <button
                      className="repick-btn repick-btn-ghost"
                      onClick={handleCloseCamera}
                    >
                      카메라 끄기
                    </button>
                  </div>
                </div>
              ) : previewImage ? (
                <div
                  className="repick-preview-wrap"
                  style={{
                    // 정사각형 바깥 틀. 사진과 박스는 안쪽에서 함께 배치합니다.
                    position: "relative",
                    display: "block",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="repick-preview-image-area"
                    style={{
                      // 사진 비율에 맞춘 영역을 정사각형 중앙에 배치합니다.
                      // flex 축소나 사진 잘림으로 박스가 어긋나지 않도록
                      // 가로·세로 크기를 명시적으로 함께 지정합니다.
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: imageSize.width > 0 && imageSize.height > 0
                        ? `${Math.min(1, imageSize.width / imageSize.height) * 100}%`
                        : "100%",
                      height: imageSize.width > 0 && imageSize.height > 0
                        ? `${Math.min(1, imageSize.height / imageSize.width) * 100}%`
                        : "100%",
                      maxHeight: "none",
                      overflow: "visible",
                      borderRadius: 0,
                    }}
                  >
                    <img
                      className="repick-preview-image"
                      style={{
                        // 부모 영역과 사진이 정확히 일치해야
                        // 기존 퍼센트 Bounding Box 좌표가 맞습니다.
                        position: "absolute",
                        inset: 0,
                        display: "block",
                        width: "100%",
                        height: "100%",
                        maxHeight: "none",
                        objectFit: "fill",
                      }}
                      src={previewImage}
                      alt="분석할 재활용품"
                      onLoad={(event) => {
                        setImageSize({
                          width: event.target.naturalWidth,
                          height: event.target.naturalHeight,
                        });
                      }}
                    />

                    {/* AI 분석 후 객체마다 Bounding Box 표시 */}
                    {classifyResult?.status === "success" &&
                      imageSize.width > 0 &&
                      imageSize.height > 0 &&
                      classifyResult.detections?.map((item, index) => {
                        const [x1, y1, x2, y2] = item.bbox;

                        const left = (x1 / imageSize.width) * 100;
                        const top = (y1 / imageSize.height) * 100;
                        const width = ((x2 - x1) / imageSize.width) * 100;
                        const height = ((y2 - y1) / imageSize.height) * 100;

                        return (
                          <div
                            className="repick-bbox"
                            key={index}
                            style={{
                              left: `${left}%`,
                              top: `${top}%`,
                              width: `${width}%`,
                              height: `${height}%`,
                            }}
                          >
                            <span className="repick-bbox-label">
                              {item.label_ko ||
                                recycleLabelMap[item.class] ||
                                item.class}{" "}
                              ({item.class}){" "}
                              {(item.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="repick-empty-preview">
                  <span>♻️</span>
                  <p>선택한 사진이 여기에 표시됩니다.</p>
                </div>
              )}

              {/* ------------------------------------------------- */}
              {/* 2. 사진 인증 방식 선택 */}
              {/* 미리보기 바로 아래에 3개 버튼 고정 */}
              {/* ------------------------------------------------- */}
              <div className="repick-source-buttons">
                <button
                  className="repick-btn repick-btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  🖼️ 사진 업로드
                </button>

                <button
                  className="repick-btn repick-btn-secondary"
                  onClick={() => handleOpenCamera("photo")}
                >
                  📷 카메라
                </button>

                <button
                  className="repick-btn repick-btn-secondary"
                  onClick={() => handleOpenCamera("live")}
                >
                  🎥 실시간캠
                </button>
              </div>

              {/* ------------------------------------------------- */}
              {/* 3. AI 분석 실행 */}
              {/* ------------------------------------------------- */}
              <button
                className="repick-btn repick-btn-primary repick-analyze-button"
                onClick={handleClassifyImage}
                disabled={
                  !backendReady || !selectedImage ||
                  isClassifying ||
                  dailyRecognitionCount >= DAILY_RECOGNITION_LIMIT
                }
              >
                {!backendReady
                  ? "AI 분석 — 서버 연결 대기"
                  : isClassifying
                  ? "AI 분석 중..."
                  : dailyRecognitionCount >= DAILY_RECOGNITION_LIMIT
                  ? "오늘 AI 인식 한도 완료"
                  : "AI로 분리배출 분석하기"}
              </button>

              {/* 분석 오류 */}
              {classifyError && (
                <p className="repick-error-message">❌ {classifyError}</p>
              )}
            </article>
<article className="repick-card repick-reward-card">
              <div className="repick-section-title-row">
                <div>
                  <p className="repick-eyebrow">MY REWARD</p>
                  <h2>나의 리워드</h2>
                </div>
                <span className="repick-status-pill">
                  💧 {pointResult.waterDrops} / 10
                </span>
              </div>

              {/* 가장 중요한 값 3개를 한눈에 표시 */}
              <div className="repick-stat-grid">
                <div className="repick-stat-box">
                  <span>보유 포인트</span>
                  <strong>{pointResult.userPoints}P</strong>
                </div>

                <div className="repick-stat-box">
                  <span>현재 물방울</span>
                  <strong>{pointResult.waterDrops} / 10</strong>
                </div>

                <div className="repick-stat-box">
                  <span>누적 물주기</span>
                  <strong>{pointResult.wateringCount}회</strong>
                </div>

                <div className="repick-stat-box repick-daily-recognition-box">
                  <span>오늘 AI 인식</span>
                  <strong>
                    {dailyRecognitionCount} / {DAILY_RECOGNITION_LIMIT}회
                  </strong>
                  <small>
                    남은 인식 {Math.max(DAILY_RECOGNITION_LIMIT - dailyRecognitionCount, 0)}회
                  </small>
                </div>
              </div>

              {/* 물방울 진행바 */}
              <div className="repick-progress-block">
                <div className="repick-progress-label">
                  <span>다음 물주기까지</span>
                  <strong>{10 - pointResult.waterDrops}💧</strong>
                </div>
                <div className="repick-progress-track">
                  <div
                    className="repick-progress-fill"
                    style={{
                      width: `${Math.min(
                        (pointResult.waterDrops / 10) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {waterMessage && (
                <p className="repick-success-message">{waterMessage}</p>
              )}

              {/* 예상/확정 포인트 */}
              <div className="repick-point-confirm-box">
                <div className="repick-subheading-row">
                  <h3>포인트 발급 확인</h3>
                  <span>
                    {pointResult.alreadyConfirmed ? "발급 완료" : "확인 필요"}
                  </span>
                </div>

                <div className="repick-point-compare">
                  <div>
                    <span>예상</span>
                    <strong>{pointResult.estimatedPoints}P</strong>
                  </div>
                  <div>
                    <span>확정</span>
                    <strong>{pointResult.confirmedPoints}P</strong>
                  </div>
                  <div>
                    <span>차이</span>
                    <strong>{pointResult.differencePoints}P</strong>
                  </div>
                </div>

                {pointResult.toleranceExceeded && (
                  <p className="repick-warning-message">
                    예상포인트와 실제 확정포인트의 차이가 10%를 초과했습니다.
                    ({pointResult.differenceRate}%)
                  </p>
                )}

                <button
                  className="repick-btn repick-btn-secondary repick-full-button"
                  onClick={handleConfirmPoints}
                  disabled={!backendReady || pointResult.alreadyConfirmed || isConfirming}
                >
                  {!backendReady
                    ? "서버 연결 대기"
                    : isConfirming
                    ? "포인트 발급 중..."
                    : pointResult.alreadyConfirmed
                      ? "포인트 발급 완료"
                      : "포인트 발급 확인"}
                </button>
              </div>
            </article>
            </div>
            <div className="repick-column repick-column-right">
<article className="repick-card repick-result-card">
              <div className="repick-card-heading">
                <div>
                  <span className="repick-step-badge">02</span>
                  <h2>AI 분석 결과</h2>
                </div>
              </div>

              {!classifyResult ? (
                <div className="repick-result-empty">
                  <div className="repick-result-empty-icon">AI</div>
                  <strong>아직 분석 전입니다.</strong>
                  <p>왼쪽에서 사진을 선택한 뒤 분석 버튼을 눌러주세요.</p>
                </div>
              ) : classifyResult.status === "success" ? (
                <div className="repick-result-content">

                  {/* 가장 높은 판정 */}
                  <div className="repick-result-hero">
                    <div>
                      <span className="repick-label">AI 판정</span>
                      <h3>
                        {classifyResult.top?.label_ko ||
                          recycleLabelMap[classifyResult.top?.class] ||
                          classifyResult.top?.class}
                      </h3>
                      <p>{classifyResult.top?.class}</p>
                    </div>

                    <div className="repick-confidence-box">
                      <span>신뢰도</span>
                      <strong>
                        {classifyResult.top?.confidence != null
                          ? `${(classifyResult.top.confidence * 100).toFixed(1)}%`
                          : "-"}
                      </strong>
                    </div>
                  </div>

                  {/* 이번 물방울 보상 - AI 판정 바로 아래 표시 */}
                  <div className="repick-drop-box">
                    <div>
                      <span>이번 적립</span>
                      <strong>💧 {classifyResult.drops_awarded ?? 0}</strong>
                    </div>
                    <div>
                      <span>현재 물방울</span>
                      <strong>💧 {classifyResult.drops_balance ?? 0} / 10</strong>
                    </div>
                  </div>

                  {/* 분리배출 안내 */}
                  <div className="repick-guide-box">
                    <span className="repick-label">♻️ 분리배출 안내</span>
                    {/* 같은 품목은 한 번만 안내합니다. */}
                    {classifyResult.guides?.length > 0 ? (
                      <div className="repick-guide-list">
                        {classifyResult.guides.map((item) => (
                          <div className="repick-guide-item" key={item.class}>
                            <strong>{item.label_ko || recycleLabelMap[item.class] || item.class}</strong>
                            <p>{item.disposal_method}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>{classifyResult.guide || "분리배출 안내가 없습니다."}</p>
                    )}
                  </div>

                  <button
                    className="repick-btn repick-btn-secondary repick-save-button"
                    onClick={handlePrepareAnalysisSave}
                    disabled={isPreparingSave || isClassifying}
                  >
                    {isPreparingSave ? "결과 이미지 준비 중..." : "분석 결과 이미지 저장"}
                  </button>

                  {/* 탐지 개수 */}
                  <div className="repick-detection-summary">
                    <div className="repick-subheading-row">
                      <h4>인식한 품목</h4>
                      <span>총 {classifyResult.total_count ?? 0}개</span>
                    </div>

                    <div className="repick-chip-list">
                      {Object.entries(classifyResult.counts || {}).map(
                        ([className, count]) => (
                          <span className="repick-chip" key={className}>
                            {recycleLabelMap[className] || className} {count}개
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* 상세 탐지 결과 */}
                  {classifyResult.detections?.length > 0 && (
                    <details className="repick-details">
                      <summary>상세 탐지 결과 보기</summary>
                      <div className="repick-detail-list">
                        {classifyResult.detections.map((item, index) => (
                          <div className="repick-detail-row" key={index}>
                            <strong>
                              {index + 1}.{" "}
                              {item.label_ko ||
                                recycleLabelMap[item.class] ||
                                item.class}
                            </strong>
                            <span>
                              {item.confidence != null
                                ? `${(item.confidence * 100).toFixed(1)}%`
                                : "-"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {classifyResult.elapsed_ms != null && (
                    <p className="repick-elapsed">
                      AI 처리 시간 {classifyResult.elapsed_ms}ms
                    </p>
                  )}
                </div>
              ) : (
                <div className="repick-result-empty">
                  <div className="repick-result-empty-icon">?</div>
                  <strong>재활용품을 인식하지 못했습니다.</strong>
                  <p>
                    {classifyResult.message ||
                      "다른 각도에서 다시 촬영해보세요."}
                  </p>
                </div>
              )}
            </article>
              {harvestReady && (
                <section className="repick-harvest-section" aria-label="나무 수확 안내">
              {/* 수확 가능 상태 */}
              {harvestReady && !showRewards && (
                <div className="repick-harvest-box">
                  <strong>🎉 나무가 모두 성장했어요!</strong>
                  <p>이제 나무를 수확하고 보상을 선택할 수 있습니다.</p>
                  <div className="repick-inline-buttons">
                    <button
                      className="repick-btn repick-btn-primary"
                      onClick={handleHarvest}
                    >
                      🍎 수확하기
                    </button>
                    <button
                      className="repick-btn repick-btn-ghost"
                      onClick={handleHarvestLater}
                    >
                      나중에
                    </button>
                  </div>
                </div>
              )}

              {/* 수확 보상 선택 */}
              {harvestReady && showRewards && (
                <div className="repick-harvest-box">
                  <h3>🎁 수확 보상 선택</h3>
                  <p>원하는 보상 제품을 선택해주세요.</p>

                  <div className="repick-reward-product-list">
                    {rewardProducts.map((product) => (
                      <button
                        className={`repick-reward-product ${
                          selectedReward?.id === product.id ? "is-selected" : ""
                        }`}
                        key={product.id}
                        onClick={() => handleRewardSelect(product)}
                      >
                        {selectedReward?.id === product.id ? "✓ " : ""}
                        {product.name}
                      </button>
                    ))}
                  </div>

                  {selectedReward && (
                    <button
                      className="repick-btn repick-btn-primary repick-full-button"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `${selectedReward.name} 제품으로 보상을 받으시겠습니까?`
                        );

                        if (confirmed) {
                          alert(
                            `${selectedReward.name} 보상이 최종 선택되었습니다!`
                          );
                        }
                      }}
                    >
                      {selectedReward.name} 받기
                    </button>
                  )}

                  <button
                    className="repick-btn repick-btn-ghost repick-full-button"
                    onClick={handleHarvestLater}
                  >
                    ← 수확 화면으로 돌아가기
                  </button>
                </div>
              )}

                </section>
              )}
<article className="repick-card repick-tree-card">
              <div className="repick-section-title-row">
                <div>
                  <p className="repick-eyebrow">MY TREE</p>
                  <h2>나무 성장</h2>
                </div>
                <span className="repick-status-pill">
                  {pointResult.currentStage}
                </span>
              </div>

              <div className="repick-tree-visual">
                {currentTreeImage ? (
                  <img
                    src={currentTreeImage}
                    alt={pointResult.currentStage}
                  />
                ) : (
                  <div className="repick-tree-placeholder">🌱</div>
                )}
              </div>

              {/* 서버의 차감·성장 API 연결 전에는 실제 물주기를 실행하지 않습니다. */}
              <button
                type="button"
                className="repick-btn repick-btn-primary repick-full-button"
                disabled
                title="물방울 차감과 성장 저장 API 연결이 필요합니다."
              >
                물주기 — 서버 연결 대기
              </button>

              <div className="repick-tree-info">
                <div>
                  <span>현재 단계</span>
                  <strong>{pointResult.currentStage}</strong>
                </div>

                {!harvestReady && pointResult.nextStage && (
                  <>
                    <div>
                      <span>다음 단계</span>
                      <strong>{pointResult.nextStage}</strong>
                    </div>
                    <div>
                      <span>다음 성장까지</span>
                      <strong>물주기 {pointResult.wateringToNext}회</strong>
                    </div>
                  </>
                )}
              </div>

            </article>
            </div>
          </div>
          {/* ================================================= */}
          {/* 3. 포인트 발급 이력 */}
          {/* ================================================= */}
          <section className="repick-card repick-history-card">
            <div className="repick-section-title-row">
              <div>
                <p className="repick-eyebrow">HISTORY</p>
                <h2>포인트 발급 이력</h2>
              </div>
              <span className="repick-history-count">총 {history.length}건</span>
            </div>

            {history.length === 0 ? (
              <div className="repick-history-empty">
                아직 발급 이력이 없습니다.
              </div>
            ) : (
              <div className="repick-history-table-wrap">
                <table className="repick-history-table">
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>예상포인트</th>
                      <th>확정포인트</th>
                      <th>차이</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <tr key={index}>
                        <td>{item.date}</td>
                        <td>{item.estimatedPoints}P</td>
                        <td>{item.confirmedPoints}P</td>
                        <td>
                          {item.differencePoints}P ({item.differenceRate}%)
                        </td>
                        <td>
                          <span className="repick-history-status">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* ===================================================== */}
      {/* AI 분석 결과 사진 저장 팝업 */}
      {/* ===================================================== */}
      {showSaveConfirm && (
        <div className="repick-modal-backdrop" role="presentation">
          <div
            className="repick-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="repick-save-title"
          >
            <div className="repick-modal-icon">✅</div>
            <h3 id="repick-save-title">AI 분석이 완료되었습니다.</h3>
            <p>바운딩박스와 판정 결과가 표시된 사진을 저장하시겠습니까?</p>

            {analysisPreviewUrl && (
              <img
                className="repick-modal-preview"
                src={analysisPreviewUrl}
                alt="Bounding Box와 품목 판정이 포함된 저장 이미지"
              />
            )}

            <div className="repick-modal-actions">
              <button
                className="repick-btn repick-btn-primary"
                onClick={handlePrepareAnalysisSave}
                disabled={isPreparingSave}
              >
                {isPreparingSave ? "저장 이미지 준비 중..." : "저장"}
              </button>
              <button
                className="repick-btn repick-btn-ghost"
                onClick={() => setShowSaveConfirm(false)}
                disabled={isPreparingSave}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 저장 위치 선택 팝업 */}
      {showSaveOptions && (
        <div className="repick-modal-backdrop" role="presentation">
          <div
            className="repick-modal repick-save-options-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="repick-save-options-title"
          >
            <div className="repick-modal-icon">💾</div>
            <h3 id="repick-save-options-title">저장 방법을 선택해주세요.</h3>
            <p>사용할 곳에 맞춰 분석 결과 사진을 저장할 수 있습니다.</p>

            <div className="repick-save-option-list">
              <button
                className="repick-save-option"
                onClick={handleSaveToDevice}
              >
                <span>💻</span>
                <div>
                  <strong>기기에 저장</strong>
                  <small>PC에서는 다운로드 폴더로 저장</small>
                </div>
              </button>

              <button
                className="repick-save-option"
                onClick={handleSaveToMobilePhotos}
              >
                <span>📱</span>
                <div>
                  <strong>휴대폰 사진앱으로 보내기</strong>
                  <small>휴대폰 공유/사진 저장 화면 열기</small>
                </div>
              </button>

              <button
                className="repick-save-option"
                onClick={handleSendToCommunity}
              >
                <span>💬</span>
                <div>
                  <strong>커뮤니티 업로드</strong>
                  <small>커뮤니티 게시글 첨부용 사진으로 전달</small>
                </div>
              </button>
            </div>

            <button
              className="repick-btn repick-btn-ghost repick-full-button"
              onClick={() => setShowSaveOptions(false)}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* FOOTER 자리 */}
      {/* 나중에 팀 공통 Footer 컴포넌트로 교체할 예정 */}
      {/* ===================================================== */}
      {!embedded && <footer className="repick-footer-placeholder">
        <span>FOOTER</span>
      </footer>}

    </div>
  );
}

// RewardPage를 다른 파일에서 사용할 수 있도록 내보냄
export default RewardPage;
