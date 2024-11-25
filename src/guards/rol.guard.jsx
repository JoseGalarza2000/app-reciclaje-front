import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { PrivateRoutes, PublicRoutes} from '../models/routes';
import Roles from '../models/roles';
import { AppStore } from '../redux/store';

const RoleGuard= ({ rol }) =>{
  const userState = useSelector((store) => store.user);
  return rol.includes(userState.rol) ? <Outlet /> : <><Navigate replace to={PublicRoutes.HOME} /></>;
}

export default RoleGuard;
