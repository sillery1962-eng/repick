import { useCallback, useEffect, useMemo, useState } from "react";
import basePlaces from "../data/places.json";
import { GU_LIST } from "../lib/constants";
import { getDb } from "../lib/firebase";

/**
 * 기본 목록(places.json) + 이용자 제보(Firestore "submissions")를 합쳐 돌려줍니다.
 * Firebase 설정이 없으면 기본 목록만 쓰고, submit은 null입니다.
 */
export function usePlaces() {
  const [subs, setSubs] = useState([]);
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;
    getDb()
      .then((r) => {
        if (!r || cancelled) return;
        const { db, fs } = r;
        setCanSubmit(true);
        const q = fs.query(fs.collection(db, "submissions"), fs.orderBy("createdAt", "desc"), fs.limit(500));
        unsub = fs.onSnapshot(
          q,
          (snap) => {
            setSubs(
              snap.docs
                .map((d) => ({ precise: true, ...d.data(), id: "sub-" + d.id, isSub: true }))
                .filter((p) => p.hidden !== true && typeof p.name === "string" && GU_LIST.includes(p.gu)),
            );
          },
          () => setSubs([]),
        );
      })
      .catch(() => setCanSubmit(false));
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const places = useMemo(() => [...basePlaces, ...subs], [subs]);

  const submit = useCallback(async (doc) => {
    const r = await getDb();
    if (!r) throw new Error("no-firebase");
    const { db, fs } = r;
    await fs.addDoc(fs.collection(db, "submissions"), { ...doc, createdAt: fs.serverTimestamp() });
  }, []);

  return { places, submit: canSubmit ? submit : null };
}
