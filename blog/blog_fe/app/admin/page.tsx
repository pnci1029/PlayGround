import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminAuthCheck from '../../components/auth/AdminAuthCheck';

export default function AdminPage() {
  return (
    <AdminAuthCheck>
      <AdminDashboard />
    </AdminAuthCheck>
  );
}

export const metadata = {
  title: '관리자 대시보드 - 개발자 블로그',
  description: '블로그 관리자 대시보드',
};