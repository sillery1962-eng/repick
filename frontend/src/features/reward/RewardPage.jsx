// 2026-10-20: 팀 API 연결 / 분석 무제한 / 레거시 자동 보상 호출 제거
// 2026-10-19 v6: 개수 상자의 크기를 유지하면서 각 품목 칸의 오른쪽 끝으로 정렬
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
import { CurrentTreePreview, RecycleShowcase, RewardsEarningGuide } from "./RecognitionPlaceholders";
// 팀 공용 API: 로그인 토큰·서버 주소·한국어 오류 처리를 재사용합니다.
import { api } from "../../api/client";

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

  BATTERY: "건전지",

};

// =========================================================

// RewardPage 메인 컴포넌트

// =========================================================

function RewardPage() {

  // =======================================================

  // 새로 추가한 AI 이미지 분류 관련 상태

  // =======================================================

  // 사용자가 선택한 실제 이미지 파일

  const [selectedImage, setSelectedImage] = useState(null);

  // 선택한 이미지를 화면에 미리 보여주기 위한 주소

  const [previewImage, setPreviewImage] = useState(null);

  // FastAPI / YOLO에서 받은 분석 결과

  const [classifyResult, setClassifyResult] = useState(null);

  // AI 분석이 끝나면 상세 탐지 결과를 자동으로 펼칩니다.
  // 사용자가 다시 접을 수 있도록 열림 상태를 따로 관리합니다.
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  // 분석 횟수는 제한하지 않습니다. 하루 적립 5회는 서버에서 판단합니다.
  const classifyInFlightRef = useRef(false);

  // -------------------------------------------------------
  // AI 분석 결과 사진 저장 팝업
  // -------------------------------------------------------
  // 1차 팝업: 분석 완료 후 저장 / 취소
  // 2차 팝업: 저장 위치 선택
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  // 새 사진을 고른 뒤 사용자가 동의해야 AI 분석과 보상 요청을 보냅니다.
  const [showAnalyzeConfirm, setShowAnalyzeConfirm] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showCommunityPost, setShowCommunityPost] = useState(false);
  const [communityText, setCommunityText] = useState("");
  const [communityError, setCommunityError] = useState("");
  const [postingCommunity, setPostingCommunity] = useState(false);
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

  // 사진을 교체하거나 페이지를 닫으면 이전 미리보기 URL을 정리합니다.
  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  // 화면을 떠날 때 카메라 사용을 끝냅니다.
  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
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

    setShowAnalyzeConfirm(true);

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

  const handleSendToCommunity = () => {
    if (!analysisResultFile) return;
    setShowSaveOptions(false);
    setCommunityText("");
    setCommunityError("");
    setShowCommunityPost(true);
  };

  const handlePostToCommunity = async () => {
    const content = communityText.trim();
    if (!analysisResultFile || postingCommunity) return;
    if (!content) {
      setCommunityError("게시글을 입력해 주세요.");
      return;
    }
    setPostingCommunity(true);
    setCommunityError("");
    try {
      const form = new FormData();
      form.append("content", content);
      form.append("image", analysisResultFile);
      // 판별에 성공한 결과(scan_id 있음)만 인증글. 서버가 scan_id로 "같은 판별 결과는 보상 1번"을 지킴
      const scanId = classifyResult?.scan_id;
      form.append("is_verification", scanId ? "true" : "false");
      if (scanId) form.append("scan_id", String(scanId));
      await api.post("/posts", form);
      setShowCommunityPost(false);
    } catch (error) {
      setCommunityError(error.message || "게시하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setPostingCommunity(false);
    }
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
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;

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
      setShowAnalyzeConfirm(true);
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
      setShowAnalyzeConfirm(true);
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

    // 사진을 선택하지 않았으면 분석 불가

    if (!selectedImage) {

      alert("먼저 사진을 선택해주세요.");

      return;

    }

    // 빠른 연속 클릭으로 같은 화면에서 요청이 겹치는 것을 방지합니다.
    // 다른 기기의 동시 적립 한도는 별도 DB 안전장치가 필요합니다.
    if (classifyInFlightRef.current) return;
    classifyInFlightRef.current = true;

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

      // 팀 API 도구가 서버 주소와 로그인 토큰을 자동으로 붙입니다.
      const data = await api.post("/classify", formData);

      // AI 분석 결과를 화면 상태에 저장
      setClassifyResult(data);
      setIsDetailsOpen(
        data.status === "success" && data.detections?.length > 0
      );

      // 보상은 서버 응답 그대로 표시합니다. AI 적립만으로 성장시키지 않습니다.
      if (data.status === "success") {
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
          setClassifyError("분석은 완료되었지만 결과 이미지 생성에 실패했습니다: " + saveError.message);
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

        error.message || "이미지를 분석하는 중 오류가 발생했습니다."

      );

    }

    finally {

      // 성공하든 실패하든 분석 작업 종료
      classifyInFlightRef.current = false;
      setIsClassifying(false);

    }

  };

  // =======================================================
  // 실제 화면
  // =======================================================
  //
  // 기존 화면 배치를 유지하고 AI 인증·분석 결과만 표시합니다.
  // PC 1440px 화면에서는 내용 폭을 최대 1080px로 제한하고,
  // 모바일 390px 화면에서는 카드가 한 줄씩 아래로 내려가도록 구성합니다.
  // =======================================================

  // DB·적립 기록은 유지하고 사진·분석 화면만 처음 상태로 돌립니다.
  const handleResetRecognition = () => {
    if (classifyInFlightRef.current || isClassifying || isPreparingSave) return;
    handleCloseCamera();
    setSelectedImage(null);
    setPreviewImage(null); // 기존 useEffect가 Object URL을 정리합니다.
    setClassifyResult(null);
    setClassifyError("");
    setIsDetailsOpen(false);
    setImageSize({ width: 0, height: 0 });
    setAnalysisResultFile(null); // 기존 useEffect가 결과 미리보기 URL도 정리합니다.
    setShowSaveConfirm(false);
    setShowAnalyzeConfirm(false);
    setShowSaveOptions(false);
    setShowCommunityPost(false);
    setCommunityText("");
    setCommunityError("");
    setCameraMode("photo");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasAnalysisFeedback = Boolean(classifyResult || classifyError);

  return (
    <div className="repick-page">

      {/* ===================================================== */}
      {/* MAIN 본문 */}
      {/* ===================================================== */}
      <main className="repick-main">
        <div className="repick-container">

          {/* ------------------------------------------------- */}
          {/* 페이지 제목 */}
          {/* ------------------------------------------------- */}
          <section className="repick-page-heading">
            <p className="repick-eyebrow">REPICK AI RECYCLING</p>
            <h1>AI 분리배출 인증</h1>
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
                disabled={isClassifying}
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
                        disabled={isClassifying}
                      >
                        📸 촬영하기
                      </button>
                    ) : (
                      <button
                        className="repick-btn repick-btn-primary"
                        onClick={handleSaveLiveFrame}
                        disabled={isClassifying}
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

                        const sourceWidth = classifyResult.image_width || imageSize.width;
                        const sourceHeight = classifyResult.image_height || imageSize.height;
                        const left = (x1 / sourceWidth) * 100;
                        const top = (y1 / sourceHeight) * 100;
                        const width = ((x2 - x1) / sourceWidth) * 100;
                        const height = ((y2 - y1) / sourceHeight) * 100;

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
                <CurrentTreePreview />
              )}

              {/* ------------------------------------------------- */}
              {/* 2. 사진 인증 방식 선택 */}
              {/* 미리보기 바로 아래에 3개 버튼 고정 */}
              {/* ------------------------------------------------- */}
              <div className="repick-source-buttons">
                <button
                  className="repick-btn repick-btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isClassifying}
                >
                  🖼️ 사진 업로드
                </button>

                <button
                  className="repick-btn repick-btn-secondary"
                  onClick={() => handleOpenCamera("photo")}
                  disabled={isClassifying}
                >
                  📷 카메라
                </button>

                <button
                  className="repick-btn repick-btn-secondary"
                  onClick={() => handleOpenCamera("live")}
                  disabled={isClassifying}
                >
                  🎥 실시간캠
                </button>
              </div>

              {/* ------------------------------------------------- */}
              {/* 3. AI 분석 실행 */}
              {/* ------------------------------------------------- */}
              {/* 분석 완료 후에는 같은 자리에서 저장·초기화 버튼으로 교체합니다. */}
              {classifyResult?.status === "success" && !isClassifying ? (
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10, marginTop: 12 }}>
                  <button
                    type="button"
                    className="repick-btn repick-btn-primary"
                    onClick={handlePrepareAnalysisSave}
                    disabled={isPreparingSave}
                  >
                    {isPreparingSave ? "결과 이미지 준비 중..." : "분석 결과 이미지 저장"}
                  </button>
                  <button
                    type="button"
                    className="repick-btn repick-btn-primary"
                    onClick={handleResetRecognition}
                    disabled={isPreparingSave}
                  >초기화</button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: classifyResult || classifyError ? "minmax(0, 1fr) auto" : "minmax(0, 1fr)", gap: 10, marginTop: 12 }}>
                  <button
                    type="button"
                    className="repick-btn repick-btn-primary"
                    onClick={() => setShowAnalyzeConfirm(true)}
                    disabled={!selectedImage || isClassifying || isPreparingSave}
                  >
                    {isClassifying ? "AI 분석 중..." : classifyResult || classifyError ? "다시 분석하기" : "AI로 분리배출 분석하기"}
                  </button>
                  {(classifyResult || classifyError) && (
                    <button
                      type="button"
                      className="repick-btn repick-btn-primary"
                      onClick={handleResetRecognition}
                      disabled={isClassifying || isPreparingSave}
                    >초기화</button>
                  )}
                </div>
              )}

              {/* 분석 오류 */}
              {classifyError && (
                <p className="repick-error-message">❌ {classifyError}</p>
              )}
            </article>
            {hasAnalysisFeedback && <RewardsEarningGuide afterAnalysis />}

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
                <RecycleShowcase active={!isClassifying} />
              ) : classifyResult.status === "success" ? (
                <div className="repick-result-content">

                  {/* 품목명과 개수만 표시합니다. 개수 상자는 두 줄의 가운데에 맞춥니다. */}
                  <div className="repick-result-hero" style={{ display: "block" }}>
                    <div className="repick-subheading-row">
                      <strong style={{ fontSize: 18, color: "#1f2937" }}>AI 판정</strong>
                      <span style={{ fontSize: 13, color: "#1f2937", fontWeight: 600 }}>
                        총 {classifyResult.total_count ?? Object.values(classifyResult.counts || {}).reduce((sum, count) => sum + Number(count), 0)}개 인식
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", columnGap: 24, rowGap: 12, marginTop: 16 }}>
                      {Object.entries(classifyResult.counts || {}).map(([className, count]) => (
                        <div key={className} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          <div style={{ minWidth: 0, flex: "0 1 auto" }}>
                            <strong style={{ display: "block", fontSize: 17, lineHeight: 1.4, color: "#1f2937" }}>
                              {recycleLabelMap[className] || className}
                            </strong>
                            <span style={{ display: "block", fontSize: 12, lineHeight: 1.5, fontWeight: 600, color: "#1f2937", overflowWrap: "anywhere" }}>
                              {className}
                            </span>
                          </div>
                          <strong style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: "0 1 58%", marginLeft: "auto", minWidth: 48, minHeight: 54, padding: 8, borderRadius: 12, background: "#ffffff", color: "#1f2937", fontSize: "clamp(18px, 2vw, 24px)", boxSizing: "border-box" }}>
                            {count}개
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 이번 실제 적립과 서버에서 받은 오늘 적립 횟수입니다. */}
                  <div className="repick-drop-box" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", alignItems: "stretch" }}>
                    <div style={{ padding: 12, minWidth: 0 }}>
                      <span>이번 적립</span>
                      <strong style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", fontSize: 18, lineHeight: 1.6 }}>
                        💧 {classifyResult.drops_awarded ?? 0}개
                        <span aria-hidden="true" style={{ display: "inline", color: "#6b7280", fontSize: "inherit" }}>/</span>
                        {/* 헤더 PcHeader.jsx의 pc-p와 같은 색상·모양입니다. */}
                        <span className="pc-p" aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: "#121614", color: "#CDEB45", fontSize: 12, fontWeight: 800, lineHeight: 1 }}>P</span>
                        {classifyResult.points_awarded ?? 0}P
                      </strong>
                    </div>
                    <div style={{ padding: 12, minWidth: 0 }}>
                      <span>오늘 적립 횟수</span>
                      <strong style={{ fontSize: 18, lineHeight: 1.6 }}>{classifyResult.today_scan_count ?? "-"} / 5회</strong>
                      {classifyResult.today_scan_count >= 5 && (
                        <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.5, color: "#1f2937" }}>
                          오늘 적립 완료<br />AI 분석은 계속할 수 있어요.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 분리배출 안내 */}
                  <div className="repick-guide-box" style={{ padding: 0, border: 0, width: "100%", boxSizing: "border-box", marginTop: 20 }}>
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
                      <p>{typeof classifyResult.guide === "string"
                        ? classifyResult.guide
                        : classifyResult.guide?.disposal_method || "분리배출 안내가 없습니다."}</p>
                    )}
                  </div>



                  {/* 상세 탐지 결과 */}
                  {classifyResult.detections?.length > 0 && (
                    <details
                      className="repick-details"
                      open={isDetailsOpen}
                      onToggle={(event) =>
                        setIsDetailsOpen(event.currentTarget.open)
                      }
                    >
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
            {!hasAnalysisFeedback && <RewardsEarningGuide />}
            </div>
          </div>
          {/* ================================================= */}
          {/* 보유량과 포인트 발급 이력은 포인트 화면에서 확인합니다. */}

        </div>
      </main>

      {/* 사진 선택·촬영 직후 분석 여부를 묻습니다. 취소하면 사진은 그대로 남습니다. */}
      {showAnalyzeConfirm && selectedImage && (
        <div className="repick-modal-backdrop" role="presentation">
          <div className="repick-modal" role="dialog" aria-modal="true" aria-labelledby="repick-analyze-title">
            <div className="repick-modal-icon" aria-hidden="true">♻️</div>
            <h3 id="repick-analyze-title">이 사진을 AI로 분석할까요?</h3>
            <p>분리배출 품목을 확인하고, 적립 가능 여부를 알려드릴게요.</p>
            {previewImage && <img className="repick-modal-preview" src={previewImage} alt="분석할 사진 미리보기" />}
            <div className="repick-modal-actions">
              <button type="button" className="repick-btn repick-btn-primary" disabled={isClassifying} onClick={() => { setShowAnalyzeConfirm(false); handleClassifyImage(); }}>분석하기</button>
              <button type="button" className="repick-btn repick-btn-ghost" disabled={isClassifying} onClick={() => setShowAnalyzeConfirm(false)}>나중에 할게요</button>
            </div>
          </div>
        </div>
      )}

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
                  <small>분석 결과 사진과 글을 확인하고 게시</small>
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

      {showCommunityPost && (
        <div className="repick-modal-backdrop" role="presentation">
          <div className="repick-modal" role="dialog" aria-modal="true" aria-labelledby="repick-community-title">
            <div className="repick-modal-icon" aria-hidden="true">💬</div>
            <h3 id="repick-community-title">AI 인증 사진 게시하기</h3>
            {analysisPreviewUrl && <img className="repick-modal-preview" src={analysisPreviewUrl} alt="커뮤니티에 게시할 분석 결과 사진" />}
            <label htmlFor="repick-community-text" style={{ display:"block", textAlign:"left", fontWeight:700, marginTop:16 }}>게시글</label>
            <textarea id="repick-community-text" value={communityText} onChange={event => setCommunityText(event.target.value)} disabled={postingCommunity} maxLength={1000} placeholder="분리배출 이야기를 적어 주세요." style={{ boxSizing:"border-box", width:"100%", minHeight:96, resize:"vertical", padding:12, marginTop:8, border:"1px solid #DDE2D9", borderRadius:12, font:"inherit" }} />
            <p style={{ marginTop:14 }}>게시하시겠습니까?</p>
            {communityError && <p role="alert" style={{ color:"#B23232" }}>{communityError}</p>}
            <div className="repick-modal-actions">
              <button type="button" className="repick-btn repick-btn-primary" onClick={handlePostToCommunity} disabled={postingCommunity}>{postingCommunity ? "게시 중…" : "예"}</button>
              <button type="button" className="repick-btn repick-btn-ghost" onClick={() => setShowCommunityPost(false)} disabled={postingCommunity}>아니요</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// RewardPage를 다른 파일에서 사용할 수 있도록 내보냄
export default RewardPage;
