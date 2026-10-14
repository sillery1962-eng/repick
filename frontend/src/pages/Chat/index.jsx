import useIsPc from '../../lib/useIsPc'
import ChatMobile from './ChatMobile'
import ChatPc from './ChatPc'

// PC(1024px 이상)는 PC 시안, 그보다 좁으면 모바일 시안을 보여 줍니다.
export default function Chat() {
  return useIsPc() ? <ChatPc /> : <ChatMobile />
}
