import { ArrowLeft } from 'lucide-react';
import style from "../../style/test.module.scss";

interface Args {
    onBack: () => void;
    title: string;
    progress?: { current: number; total: number };
}
export function HeaderWithBack(
    {onBack, title, progress}:Args
) {
    const percent = progress ? Math.round((progress.current / progress.total) * 100) : 0;

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
                {progress && (
                    <span className={style.stepCounter}>
                        {progress.current} / {progress.total}
                    </span>
                )}
            </div>
            {progress && (
                <div className={style.progressTrack}>
                    <div
                        className={style.progressFill}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            )}
        </header>
    );
};
