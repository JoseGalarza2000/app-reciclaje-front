import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
import AuthGuard from './guards/auth.guard';
import RoleGuard from './guards/rol.guard';
import { PrivateRoutes, PublicRoutes } from './models/routes';
import Roles from './models/roles';
import store from './redux/store';
import RoutesWithNotFound from './utilities/RoutesWithNotFound.utility';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReciclarProvider } from './components/reciclarContext';
import { CentrosAcopioProvider } from './components/centrosAcopioContext';
import HomeContent from './pages/homePage';
import ProfilePage from './pages/profilePage';
import RecicladoresPage from './pages/recicladoresPage';
import RegistroPesos from './pages/registroPesos';
import ReciclarPage from './pages/ReciclarPage';
import CentrosAcopioPage from './pages/centrosAcopioPage';

const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <Suspense fallback={<></>}>
        <Provider store={store}>
          <ReciclarProvider>
            <CentrosAcopioProvider>
              <BrowserRouter>
                <RoutesWithNotFound>
                  <Route path={PublicRoutes.HOME} element={<HomeContent />}></Route>
                  <Route element={<AuthGuard privateValidation={true} />}>
                    <Route path={PrivateRoutes.PROFILE} element={<ProfilePage />} />
                    <Route element={<RoleGuard rol={[Roles.RECICLADOR, Roles.USER]} />}>
                      <Route path={PrivateRoutes.RECICLAR} element={<ReciclarPage />} />
                    </Route>
                    <Route element={<RoleGuard rol={Roles.ORG} />}>
                      <Route path={PrivateRoutes.RECICLADORES} element={<RecicladoresPage />} />
                      <Route path={PrivateRoutes.CENTROS_ACOPIO} element={<CentrosAcopioPage />} />
                      <Route
                        path={PrivateRoutes.REGISTRO_PESOS}
                        element={
                          <QueryClientProvider client={queryClient}>
                            <RegistroPesos />
                          </QueryClientProvider>
                        }
                      />
                    </Route>
                  </Route>
                </RoutesWithNotFound>
              </BrowserRouter>
            </CentrosAcopioProvider>
          </ReciclarProvider>
        </Provider>
      </Suspense>
    </div>
  );
}

export default App;
