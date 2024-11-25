import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { PrivateRoutes, PublicRoutes } from '../models/routes';
//import { Private } from '../pages/Private';
//import { AppStore } from '../redux/store';

const AuthGuard = ({ privateValidation }) => {
  const userState = useSelector((store) => store.user);
  const PrivateValidationFragment = <Outlet />;
  const PublicValidationFragment = <Navigate replace to={PublicRoutes.HOME} />;
  //const PublicValidationFragment = <Navigate replace to={PrivateRoutes.PRIVATE} />;
  
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
