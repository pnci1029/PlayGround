import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-1 flex-col px-6 pb-10 pt-16">
      <h1 className="text-5xl font-extrabold text-brand">Story</h1>
      <p className="mt-2 text-base text-gray-400">AI로 만드는 당신만의 이야기</p>

      <div className="flex-1" />

      <div className="rounded-2xl bg-card p-6">
        <div className="text-3xl">📖</div>
        <h2 className="mt-4 text-lg font-bold">새로운 이야기 만들기</h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          장르와 키워드를 선택하면
          <br />
          AI가 당신만의 단편 소설을 만들어드립니다.
        </p>
      </div>

      <div className="safe-bottom mt-6 flex flex-col gap-3">
        <Link
          href="/genre"
          className="flex h-14 items-center justify-center rounded-xl bg-brand text-base font-bold text-white transition active:scale-[0.99]"
        >
          시작하기
        </Link>
        <div className="flex gap-3">
          <Link
            href="/feed"
            className="flex h-14 flex-1 items-center justify-center rounded-xl border border-brand/60 text-base font-bold text-brand transition active:scale-[0.99]"
          >
            둘러보기
          </Link>
          <Link
            href="/mine"
            className="flex h-14 flex-1 items-center justify-center rounded-xl border border-brand/60 text-base font-bold text-brand transition active:scale-[0.99]"
          >
            내 이야기
          </Link>
        </div>
      </div>
    </main>
  )
}
