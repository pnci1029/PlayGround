import { ArrowLeft } from 'lucide-react';
import style from "../../style/test.module.scss";

interface Args {
    onBack: () => void;
    title: string;
}
export function HeaderWithBack(
    {onBack, title}:Args
) {
    return (
        <header className={style.header}>
            <div className={style.headerContent}>
                <button
                    className={style.backButton}
                    onClick={onBack}
                >
                    <ArrowLeft size={24}/>
                </button>
                <h1 className={style.pageTitle}>{title}</h1>
            </div>
        </header>
    );
};