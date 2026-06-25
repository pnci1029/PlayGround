import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-1 flex-col px-6 pb-10 pt-20">
      <h1 className="text-[2.75rem] font-bold tracking-tight text-brand">Story</h1>
      <p className="mt-3 text-[15px] text-gray-400">간략한 줄거리만 적으면, AI가 한 편의 소설로 써드려요.</p>

      <div className="flex-1" />

      <div className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold">새로운 이야기 만들기</h2>
        <p className="mt-2 text-sm leading-7 text-gray-400">
          장르를 고르고 떠오른 줄거리를 적어주세요.
          <br />그 이야기를 바탕으로 소설을 완성해 드립니다.
        </p>
      </div>

      <div className="safe-bottom mt-6 flex flex-col gap-3">
        <Link
          href="/genre"
          className="flex h-14 items-center justify-center rounded-xl bg-brand text-base font-semibold text-[#1a1410] transition active:scale-[0.99]"
        >
          시작하기
        </Link>
        <div className="flex gap-3">
          <Link
            href="/feed"
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-line text-sm font-medium text-gray-300 transition active:scale-[0.99]"
          >
            둘러보기
          </Link>
          <Link
            href="/mine"
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-line text-sm font-medium text-gray-300 transition active:scale-[0.99]"
          >
            내 이야기
          </Link>
        </div>
        <Link href="/write" className="mt-1 self-center text-sm text-gray-500 underline">
          AI 없이 직접 쓰기
        </Link>
      </div>
    </main>
  )
}
