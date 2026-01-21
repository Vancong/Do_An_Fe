  import React, { Fragment, useEffect, useState } from 'react'
  import {BrowserRouter as Router, Routes,Route, Navigate} from "react-router-dom";
  import { routes } from './routes';
  import DefaultComponent from './components/DefaultComponent/DefaultComponent';
  import { jwtDecode } from 'jwt-decode';
  import { useDispatch, useSelector } from 'react-redux';
  import { updateUser } from './redux/slices/UserSlice';
  import *as UserService  from "./services/User.Service";
  import LoadingComponent from './components/LoadingComponent/LoadingComponent';
  import *as CartService from './services/Cart.Service';
  import { setCart } from './redux/slices/CartSlice'; 
  import { setFavoriteIds } from './redux/slices/FavoriteSlice';
  import *as FavoriteService from "./services/Favorite.Service.js";
  import ScrollToTop  from "./components/ScrollToTop/ScrollToTop.jsx"
  import *as WebSiteInfoService from "./services/websiteInfo.Service.js";
  import { setInfo } from './redux/slices/WebSiteInfo.js';
  export function App() { 
    const dispatch=useDispatch();
    const user=useSelector((state =>state.user));
    const [isLoading,setIsLoading]=useState(true);
    useEffect(() => {
      handlDetailInfoWebSite()
      const handlGetUserAndCart= async () =>{
          const  {decode,storeData} = await handleDecode() || {};
            try {
              if (decode?.id) {
                await handlGetDetailUser(decode.id, storeData);
                await  handlDetailCart(decode.id, storeData);
                await handleGetUserFavorites(decode.id,storeData)
              }     
                
            } catch (error) {
              console.log('Lỗi khi lấy user:', error);;
            }
            finally {
              setIsLoading(false); 
            }

      }
      handlGetUserAndCart()


    },[])

    const handlDetailCart= async(id,access_token) =>{
      const res= await CartService.getDetail(id,access_token);
      const items=[...res.data];
      dispatch(setCart({items,total:res.total}))
    }

    const handlDetailInfoWebSite= async() =>{
      const res= await WebSiteInfoService.getInfo();
      dispatch(setInfo(res.data))
    }
    
    
  const handleGetUserFavorites = async (id, access_token) => {
    const res = await FavoriteService.getUserFavorite(id, access_token);
    const listId = res.data.filter(item => item?._id).map(item => item._id);
    dispatch(setFavoriteIds({ total: res?.total || 0, productIds: listId }));
  };

    const handleDecode = async () => {
      let storeData = localStorage.getItem('access_token');
      if (!storeData) return {};
      
      try {
        // Parse token nếu nó là JSON string
        let token = storeData;
        try {
          if (token && token.startsWith('"')) {
            token = JSON.parse(token);
          }
        } catch (e) {
          // Token không phải JSON, giữ nguyên
        }
        
        const decode = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        // Nếu token hết hạn, tự động refresh
        if (decode?.exp < currentTime) {
          try {
            const refreshData = await UserService.refreshToken();
            if (refreshData?.status === 'OK' && refreshData?.access_token) {
              const tokenToSave = typeof refreshData.access_token === 'string' 
                ? refreshData.access_token 
                : JSON.stringify(refreshData.access_token);
              localStorage.setItem('access_token', tokenToSave);
              
              // Decode token mới
              const newDecode = jwtDecode(refreshData.access_token);
              return { decode: newDecode, storeData: refreshData.access_token };
            }
          } catch (refreshErr) {
            console.log('Không thể refresh token:', refreshErr);
            localStorage.removeItem('access_token');
            return {};
          }
        }
        
        return { decode, storeData: token };
      } catch (err) {
        console.log('Token không hợp lệ hoặc hết hạn:', err);
        // Thử refresh token một lần nữa
        try {
          const refreshData = await UserService.refreshToken();
          if (refreshData?.status === 'OK' && refreshData?.access_token) {
            const tokenToSave = typeof refreshData.access_token === 'string' 
              ? refreshData.access_token 
              : JSON.stringify(refreshData.access_token);
            localStorage.setItem('access_token', tokenToSave);
            
            const newDecode = jwtDecode(refreshData.access_token);
            return { decode: newDecode, storeData: refreshData.access_token };
          }
        } catch (refreshErr) {
          console.log('Không thể refresh token:', refreshErr);
        }
        localStorage.removeItem('access_token');
        return {};
      }
    };

    const handlGetDetailUser= async (id,access_token) =>{
  
      const res= await UserService.getDetailUser(id,access_token);
      dispatch(updateUser({...res?.data ,access_token}))

    }



    if (isLoading) {
      return <LoadingComponent isPending={true} />;
    }
    
return (

      <div>
            <Router>
              <ScrollToTop />
              <Routes>
                {
                  routes.length>0&&routes.map(route =>{
                    const Page=route.page      
                    const Layout= route.isShowHeader? DefaultComponent: Fragment
                    const isUserLoggedIn = Boolean(user?.access_token);
                    const isUserAdmin = Boolean(user?.isAdmin);

                    let ischeckAuth = true;
                    if (route.isPrivate && !isUserLoggedIn) {
                      ischeckAuth = false;
                    }
                    
                    if (route.isAdminOnly && !isUserAdmin) {
                        ischeckAuth = false; 
                    }
                    return (
                      <Route key={route.path} path={route.path} element= {
                        ischeckAuth ? (
                            <Layout>
                              <Page />
                            </Layout>
                        ): (
                            <Navigate to="/" state={route.path} replace />
                        )
                      
                      } />
                    )
                  })
                }      
              </Routes>              
            </Router>

      </div>
      
    )
  }