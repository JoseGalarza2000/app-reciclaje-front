import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { PublicRoutes } from '../models/routes';

const AuthGuard = ({ privateValidation }) => {
  const userState = useSelector((store) => store.user);
  const PrivateValidationFragment = <Outlet />;
  const PublicValidationFragment = <Navigate replace to={PublicRoutes.HOME} />;
  
  return userState.id_usuario ? (
    privateValidation ? (
      PrivateValidationFragment
    ) : (
      PublicValidationFragment
    )
  ) : (
    <Navigate replace to={PublicRoutes.HOME} />
  );
};

export default AuthGuard;
