import EditorLayout from '@/components/editor/EditorLayout';
import AuthCheck from '@/components/auth/AuthCheck';

export default function WritePage() {
  return (
    <AuthCheck>
      <EditorLayout />
    </AuthCheck>
  );
}