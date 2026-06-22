import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Mail } from 'lucide-react';
import { HeaderWithBack } from '../common/HeaderWithBack';
import style from '../../style/page.module.scss';

const SUPPORT_EMAIL = 'support@moodbite.app';

const FAQS: Array<{ q: string; a: string }> = [
    {
        q: '추천은 어떤 기준으로 이뤄지나요?',
        a: '입력한 기분·컨디션·배고픔·식사 시간·예산·동반자 정보를 바탕으로, 영양학 연구에 기반한 점수 알고리즘이 가장 잘 맞는 음식을 골라줘요.',
    },
    {
        q: '주변 맛집 정보는 어디서 가져오나요?',
        a: '카카오맵 키워드 검색을 이용해 현재 위치 주변의 음식점을 보여줘요. 위치 권한을 허용해야 이용할 수 있어요.',
    },
    {
        q: '찜한 음식은 어디에 저장되나요?',
        a: '별도 로그인 없이 사용하는 서비스라, 찜 목록과 설정은 현재 기기의 브라우저에만 저장돼요. 브라우저 데이터를 지우면 함께 삭제됩니다.',
    },
    {
        q: '추천 결과가 마음에 안 들어요.',
        a: '결과 화면의 "다른 추천 받기"를 누르면 다시 추천받을 수 있어요. 입력 값을 조금 바꿔보면 다른 음식이 나옵니다.',
    },
];

export function SupportPage() {
    const navigate = useNavigate();
    const [openId, setOpenId] = useState<number | null>(0);

    return (
        <div className={style.container}>
            <HeaderWithBack onBack={() => navigate(-1)} title="고객센터" />
            <main className={style.content}>
                <p className={style.intro}>자주 묻는 질문을 확인하고, 해결되지 않으면 메일로 문의해 주세요.</p>

                <h3 className={style.sectionTitle}>자주 묻는 질문</h3>
                <ul className={style.list}>
                    {FAQS.map((faq, i) => {
                        const open = openId === i;
                        return (
                            <li key={i} className={style.listItem}>
                                <button
                                    onClick={() => setOpenId(open ? null : i)}
                                    aria-expanded={open}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        width: '100%', background: 'none', border: 'none', padding: 0,
                                        cursor: 'pointer', textAlign: 'left',
                                    }}
                                >
                                    <span className={style.itemTitle}>{faq.q}</span>
                                    <ChevronDown
                                        size={18}
                                        style={{
                                            flexShrink: 0, transition: 'transform 0.2s',
                                            transform: open ? 'rotate(180deg)' : 'none',
                                        }}
                                    />
                                </button>
                                {open && <p className={style.itemBody}>{faq.a}</p>}
                            </li>
                        );
                    })}
                </ul>

                <h3 className={style.sectionTitle}>문의하기</h3>
                <a href={`mailto:${SUPPORT_EMAIL}`} className={style.linkRow} style={{ textDecoration: 'none' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Mail size={18} /> 메일로 문의하기
                    </span>
                    <span className={style.itemMeta} style={{ margin: 0 }}>{SUPPORT_EMAIL}</span>
                </a>
            </main>
        </div>
    );
}
