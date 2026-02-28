import { Navigate, useLocation } from 'react-router';
import { useAtomValue } from 'jotai';
import { userState } from '../states/recoil-states';
// import getToken from '../utils/getToken';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useAtomValue(userState);

  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
