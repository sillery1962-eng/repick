import { useEffect, useRef } from "react";

/** "준비 중인 서비스입니다" 안내 창 (제보 기능을 열기 전까지 사용) */
export default function ComingSoonDialog({ open, onClose, title = "준비 중인 서비스입니다", message }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="rm-dialog" aria-labelledby="rm-soon-title" onClose={onClose}>
      <div className="rm-soon">
        <h2 id="rm-soon-title">{title}</h2>
        {message && <p className="rm-hint">{message}</p>}
        <div className="rm-dlgActions">
          <button type="button" className="rm-btn" onClick={onClose} autoFocus>확인</button>
        </div>
      </div>
    </dialog>
  );
}
