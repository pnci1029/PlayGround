import React from 'react';
import style from '../../style/common/errorBoundary.module.scss';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

// 하위 트리에서 렌더/라이프사이클 예외가 나도 흰 화면 대신 폴백 UI를 보여준다.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('UI 렌더 중 오류가 발생했습니다:', error, info);
    }

    private handleReset = () => {
        // 상태를 초기화하고 홈으로 이동시켜 복구를 시도한다.
        this.setState({ hasError: false });
        window.location.assign('/');
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className={style.container}>
                    <div className={style.emoji} aria-hidden="true">😵‍💫</div>
                    <h1 className={style.title}>문제가 발생했어요</h1>
                    <p className={style.description}>
                        예상치 못한 오류로 화면을 표시하지 못했어요.<br />
                        잠시 후 다시 시도해주세요.
                    </p>
                    <button className={style.button} onClick={this.handleReset}>
                        홈으로 돌아가기
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
