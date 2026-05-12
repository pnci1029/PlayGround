import AdminDashboard from '@/components/admin/AdminDashboard';
import AuthCheck from '@/components/auth/AuthCheck';

export default function AdminPage() {
  return (
    <AuthCheck>
      <AdminDashboard />
    </AuthCheck>
  );
}

export const metadata = {
  title: '관리자 대시보드 - 개발자 블로그',
  description: '블로그 관리자 대시보드',
};