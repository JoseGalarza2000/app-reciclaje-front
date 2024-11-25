import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicRoutes } from '../models/routes';

const RoutesWithNotFound = ({ children }) => {
  return (
    <Routes>
      {children}
      <Route path="*" element={<Navigate replace to={PublicRoutes.HOME} />} />{/*redirecciona al inicio si no existe la url*/}
    </Routes>
  );
};

export default RoutesWithNotFound;
